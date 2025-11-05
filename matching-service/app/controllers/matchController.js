import redis from "../redisClient.js";
import { createClient } from "@supabase/supabase-js";
import { fetchRandomQuestion } from "../utils/questionClient.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: find a compatible match
async function findMatch(user, type) {
   const users = (await redis.lrange("waitingUsers", 0, -1)).map((u) => JSON.parse(u));
   return users.find((u) => !u.matched && u.userId !== user.userId && u[type] === user[type]);
}


// Helper: update Redis queue
async function updateWaitingUsers(remainderUsers) {
   await redis.del("waitingUsers");
   for (const user of remainderUsers) {
       await redis.rpush("waitingUsers", JSON.stringify(user));
   }
}

async function findBestMatch(user) {
   const users = (await redis.lrange("waitingUsers", 0, -1)).map((u) => JSON.parse(u));

   // Filter to only users with same difficulty
   const sameDifficulty = users.filter((u) =>
       !u.matched &&
       u.userId !== user.userId &&
       u.difficulty === user.difficulty
   );

   if (sameDifficulty.length === 0) {
       return null; // No match available
   }

   // Prefer users who also have the same topic
   const sameDifficultyAndTopic = sameDifficulty.find((u) => u.topic === user.topic);

   if (sameDifficultyAndTopic) {
       console.log(`Perfect match found: same difficulty AND topic`);
       return sameDifficultyAndTopic;
   }

   // Otherwise, return first user with same difficulty only
   console.log(`Partial match found: same difficulty only`);
   return sameDifficulty[0];
}

// Helper: check if a user is still waiting (not matched)
//async function isStillWaiting(userId) {
//   const allUsers = (await redis.lrange("waitingUsers", 0, -1)).map((u) => JSON.parse(u));
//   return allUsers.some((u) => u.userId === userId && !u.matched);
//}

async function handleMatch(currentUser, partner) {
   const allUsers = (await redis.lrange("waitingUsers", 0, -1)).map((u) => JSON.parse(u));

   const { data: userData } = await supabase
      .from('users')
      .select('username')
      .eq('id', currentUser.userId)
      .single();

   const { data: partnerData } = await supabase
      .from('users')
      .select('username')
      .eq('id', partner.userId)
      .single();

   const username = userData?.username || `User ${currentUser.userId}`;
   const partnerUsername = partnerData?.username || `User ${partner.userId}`;
   const matchedAt = Date.now();

   await redis.setex(`match:${currentUser.userId}`, 60, JSON.stringify({
          matchedWith: {
              userId: partner.userId,
              username: partnerUsername,
              difficulty: partner.difficulty,
              topic: partner.topic,
              joinedAt: partner.joinedAt,
              matched: true,
              matchedAt,
          },
          criteria: {
              difficulty: currentUser.difficulty,
              topic: currentUser.topic,
          },
      }));

      await redis.setex(`match:${partner.userId}`, 60, JSON.stringify({
          matchedWith: {
              userId: currentUser.userId,
              username: username,
              difficulty: currentUser.difficulty,
              topic: currentUser.topic,
              joinedAt: currentUser.joinedAt,
              matched: true,
              matchedAt,
          },
          criteria: {
              difficulty: partner.difficulty,
              topic: partner.topic,
          },
      }));

   for (const user of allUsers) {
     if (!user) continue;
     if (user.userId === currentUser.userId || user.userId === partner.userId) {
       user.matched = true;
     }
   }

   const remainderUsers = allUsers.filter((user) => !user.matched);
   await updateWaitingUsers(remainderUsers);

   console.log(`Updated waiting queue with ${remainderUsers.length} users.`);
   console.log(`Matched ${currentUser.userId} with ${partner.userId}!`);
}

async function allocateRoomId() {
    // Incrementing counter guarantees new unused room ID
    const roomId = await redis.incr("collab:roomCounter");
    await redis.sadd("collab:activeRooms", roomId);
    return roomId.toString();
}

export const startMatching = async (req, res) => {
   console.log("Matching started...");

   const authenticatedUserId = req.user?.userId;
   const { userId: bodyUserId, difficulty, topic } = req.body;

   if (!authenticatedUserId) {
       return res.status(401).json({ error: "Authentication required" });
   }

   if (!difficulty || !topic) {
       return res.status(400).json( { error: "Missing fields in request body"} );
   }

   if (bodyUserId && bodyUserId !== authenticatedUserId) {
       console.warn(`startMatching: Ignoring mismatched userId ${bodyUserId}, using authenticated user ${authenticatedUserId}`);
   }

   const userId = authenticatedUserId;

   const existingSession = await redis.get(`session:${userId}`);
   if (existingSession) {
       const session = JSON.parse(existingSession);

       let partnerUsername = session.partnerUsername;
       if (!partnerUsername) {
           const { data: partnerProfile } = await supabase
               .from('users')
               .select('username')
               .eq('id', session.partnerId)
               .single();
           partnerUsername = partnerProfile?.username ?? `User ${session.partnerId}`;
       }

       return res.json({
           matchFound: true,
           matchedWith: {
               userId: session.partnerId,
               username: partnerUsername,
               difficulty: session.difficulty,
               topic: session.topic,
               matched: true,
           },
           roomId: session.roomId,
           sessionReady: true,
           question: session.question ?? null,
       });
   }

   console.log(`User ${userId} is requesting a match...`);

   const storedMatch = await redis.get(`match:${userId}`);
   if (storedMatch) {
       const matchData = JSON.parse(storedMatch);
       console.log(`User ${userId} retrieving stored match`);
       // Return the stored match (don't delete yet so multiple polls can see it)
       return res.json({ matchFound: true, matchedWith: matchData.matchedWith });
   }

   const existingUsers = (await redis.lrange("waitingUsers", 0, -1)).map((u) => JSON.parse(u));
   const alreadyInQueue = existingUsers.find((u) => u.userId === userId && !u.matched);

   // If user already waiting, check based on elapsed time
   if (alreadyInQueue) {
       const elapsed = Date.now() - alreadyInQueue.joinedAt;

       // Use findBestMatch (same difficulty required, topic preferred)
       const match = await findBestMatch(alreadyInQueue);
       if (match) {
           await handleMatch(alreadyInQueue, match);
           const matchData = JSON.parse(await redis.get(`match:${userId}`));
           return res.json({ matchFound: true, matchedWith: matchData.matchedWith });
       }

       if (elapsed < 60000) {
           return res.json({
               matchFound: false,
               message: `Searching for match... (${Math.floor(elapsed / 1000)}s)`,
               waitTime: Math.floor(elapsed / 1000)
           });
       }

       const remaining = existingUsers.filter((u) => u.userId !== userId);
       await updateWaitingUsers(remaining);
       return res.json({ matchFound: false, message: "Match timeout", timeout: true });
   }

   // immediately add to waiting queue
   const newUser = { userId, difficulty, topic, joinedAt: Date.now(), matched: false};
   await redis.rpush("waitingUsers", JSON.stringify(newUser));
   console.log(`User ${userId} added to waiting queue.`);

   // Check for difficulty match first within 30s
   const match = await findBestMatch({userId, difficulty, topic});
   if (match) {
    await handleMatch(newUser, match);
       const matchData = JSON.parse(await redis.get(`match:${userId}`));
       return res.json({ matchFound: true, matchedWith: matchData.matchedWith });
   }

   return res.json({
       matchFound: false,
       message: "Searching by difficulty... (0s)",
       waitTime: 0
   });

//   setTimeout(async () => {
//       if (!(await isStillWaiting(userId))) return; // if matched alrdy, do not continue.
//       // check difficulty for first 30s
//       const difficultyMatchAgain = await findMatch(newUser, "difficulty");
//       if (difficultyMatchAgain) {
//           newUser.matched = true;
//           difficultyMatchAgain.matched = true;
//           await handleMatch(userId, difficultyMatchAgain);
//           return res.json({matchFound: true, matchedWith: difficultyMatchAgain});
//       }
//
//
//
//       // check for topic match in the next 30s
//       setTimeout(async () => {
//           if (!(await isStillWaiting(userId))) return;
//           const topicMatch = await findMatch(newUser, "topic");
//           if (topicMatch) {
//               newUser.matched = true;
//               topicMatch.matched = true;
//               await handleMatch(userId, topicMatch);
//               return res.json({matchFound: true, matchedWith: topicMatch});
//           }
//
//
//           console.log(`No match found for ${userId} after 1 min.`);
//           return res.json({ matchFound: false, message: "No match found" });
//
//
//       }, 30000)
//   }, 30000)
};

export const confirmMatch = async (req, res) => {
   const { userId } = req.params; // Matched user ID
   const currentUserId = req.user?.userId;

   console.log(`User ${currentUserId} confirming match with ${userId}`);

   try {
       const currentUserMatch = await redis.get(`match:${currentUserId}`);
       const otherUserMatch = await redis.get(`match:${userId}`);

       if (!currentUserMatch || !otherUserMatch) {
           return res.status(404).json({ error: "Match not found or expired" });
       }

       const currentData = JSON.parse(currentUserMatch);
       const otherData = JSON.parse(otherUserMatch);

       if (currentData.matchedWith.userId !== userId ||
           otherData.matchedWith.userId !== currentUserId) {
           return res.status(400).json({ error: "Invalid match pairing" });
       }

       const roomId = await allocateRoomId();
       const sessionId = `session-${roomId}`;

       if (!currentData?.matchedWith || !otherData?.matchedWith) {
           console.error("Missing match payloads for session", { currentUserId, userId });
           return res.status(500).json({ error: "Match state incomplete" });
       }

       const currentCriteria = currentData.criteria ?? {};
       const otherCriteria = otherData.criteria ?? {};

       const sessionDifficultyRaw = currentCriteria.difficulty
           || otherCriteria.difficulty
           || currentData.matchedWith?.difficulty
           || otherData.matchedWith?.difficulty
           || "";

       const topicsMatch = currentCriteria.topic
           && otherCriteria.topic
           && currentCriteria.topic === otherCriteria.topic;

       const sessionTopicRaw = topicsMatch ? currentCriteria.topic : "";

       const sessionDifficulty = sessionDifficultyRaw ? sessionDifficultyRaw.trim() : null;
       const sessionTopic = sessionTopicRaw ? sessionTopicRaw.trim() : null;

       if (!sessionDifficulty && !sessionTopic) {
           return res.status(400).json({ error: "No matching criteria available to allocate a question" });
       }

       const difficultyUpper = sessionDifficulty ? sessionDifficulty.toUpperCase() : undefined;
       const fetchAttempts = [];

       if (difficultyUpper && sessionTopic) {
           fetchAttempts.push({ difficulty: difficultyUpper, topic: sessionTopic });
           fetchAttempts.push({ difficulty: difficultyUpper });
           fetchAttempts.push({ topic: sessionTopic });
       } else if (difficultyUpper) {
           fetchAttempts.push({ difficulty: difficultyUpper });
       } else if (sessionTopic) {
           fetchAttempts.push({ topic: sessionTopic });
       }

       let sharedQuestion = null;
       let lastQuestionError = null;

       for (const criteria of fetchAttempts) {
           try {
               sharedQuestion = await fetchRandomQuestion(criteria);
               if (sharedQuestion) {
                   break;
               }
           } catch (questionError) {
               lastQuestionError = questionError;
               console.warn("Question fetch attempt failed", { criteria, error: questionError?.message ?? questionError });
           }
       }

       if (!sharedQuestion) {
           console.error("Unable to fetch a shared question for session", {
               difficulty: sessionDifficulty,
               topic: sessionTopic,
               lastError: lastQuestionError?.message ?? lastQuestionError,
           });
           return res.status(502).json({ error: "Failed to retrieve a collaboration question" });
       }

       const timestamp = Date.now();

       const currentSessionPayload = {
           sessionId,
           roomId,
           partnerId: userId,
           partnerUsername: currentData.matchedWith?.username ?? `User ${userId}`,
           difficulty: sessionDifficulty,
           topic: sessionTopic,
           question: sharedQuestion,
           createdAt: timestamp,
       };

       const partnerSessionPayload = {
           sessionId,
           roomId,
           partnerId: currentUserId,
           partnerUsername: otherData.matchedWith?.username ?? `User ${currentUserId}`,
           difficulty: sessionDifficulty,
           topic: sessionTopic,
           question: sharedQuestion,
           createdAt: timestamp,
       };

       await redis.setex(`session:${currentUserId}`, 3600, JSON.stringify(currentSessionPayload));

       await redis.setex(`session:${userId}`, 3600, JSON.stringify(partnerSessionPayload));

       await redis.del(`match:${currentUserId}`);
       await redis.del(`match:${userId}`);

       console.log(`Session ${sessionId} created for users ${currentUserId} and ${userId} with room ${roomId}`);

       return res.json({
           success: true,
           sessionId,
           partnerId: userId,
           roomId,
           question: sharedQuestion,
           difficulty: sessionDifficulty,
           topic: sessionTopic,
       });

   } catch (error) {
       console.error("Error confirming match:", error);
       return res.status(500).json({ error: "Failed to confirm match" });
   }
};

export const getActiveSession = async (req, res) => {
   const userId = req.user?.userId;

   if (!userId) {
       return res.status(401).json({ error: "Authentication required" });
   }

   try {
       const sessionValue = await redis.get(`session:${userId}`);

       if (!sessionValue) {
           return res.status(404).json({ error: "No active session" });
       }

       const session = JSON.parse(sessionValue);

       return res.json({
           sessionId: session.sessionId,
           roomId: session.roomId,
           partnerId: session.partnerId,
           partnerUsername: session.partnerUsername,
           difficulty: session.difficulty,
           topic: session.topic,
           question: session.question ?? null,
           createdAt: session.createdAt,
       });
   } catch (error) {
       console.error("Error retrieving active session:", error);
       return res.status(500).json({ error: "Failed to retrieve session" });
   }
};

export const cancelMatching = async (req, res) => {
   const userId = req.user?.userId;

    if (!userId) {
         return res.status(401).json({ error: "Authentication required" });
    }

   try {
       // Remove from waiting queue
       const existingUsers = (await redis.lrange("waitingUsers", 0, -1)).map((u) => JSON.parse(u));
       const remaining = existingUsers.filter((u) => u.userId !== userId);
       await updateWaitingUsers(remaining);

       // Delete any pending match
       await redis.del(`match:${userId}`);

       console.log(`User ${userId} cancelled matching`);
       return res.json({ success: true, message: "Matching cancelled" });
   } catch (error) {
       console.error("Error cancelling match:", error);
       return res.status(500).json({ error: "Failed to cancel matching" });
   }
};
