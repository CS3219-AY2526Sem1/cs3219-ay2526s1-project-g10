import redis from "../redisClient.js";
import { createClient } from "@supabase/supabase-js";

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

async function handleMatch(userId, partner) {
   const allUsers = (await redis.lrange("waitingUsers", 0, -1)).map((u) => JSON.parse(u));

   const { data: userData } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

   const { data: partnerData } = await supabase
      .from('users')
      .select('username')
      .eq('id', partner.userId)
      .single();

   const username = userData?.username || `User ${userId}`;
   const partnerUsername = partnerData?.username || `User ${partner.userId}`;

   await redis.setex(`match:${userId}`, 60, JSON.stringify({
          matchedWith: {
              userId: partner.userId,
              username: partnerUsername,
              difficulty: partner.difficulty,
              topic: partner.topic,
              joinedAt: partner.joinedAt,
              matched: true,
              matchedAt: Date.now()
          }
      }));

      await redis.setex(`match:${partner.userId}`, 60, JSON.stringify({
          matchedWith: {
              userId: userId,
              username: username,
              difficulty: partner.difficulty,
              topic: partner.topic,
              joinedAt: Date.now(),
              matched: true,
              matchedAt: Date.now()
          }
      }));

   for (const u of allUsers) {
     if (!u) continue;
     if (u.userId === userId || u.userId === partner.userId) {
       u.matched = true;
     }
   }

   const remainderUsers = allUsers.filter((u) => !u.matched);
   await updateWaitingUsers(remainderUsers);

   console.log(`Updated waiting queue with ${remainderUsers.length} users.`);
   console.log(`Matched ${userId} with ${partner.userId}!`);
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
           await handleMatch(userId, match);
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
       await handleMatch(userId, match);
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

       const currentSessionPayload = {
           sessionId,
           roomId,
           partnerId: userId,
           partnerUsername: currentData.matchedWith?.username ?? `User ${userId}`,
           difficulty: currentData.matchedWith?.difficulty,
           topic: currentData.matchedWith?.topic,
           createdAt: Date.now()
       };

       const partnerSessionPayload = {
           sessionId,
           roomId,
           partnerId: currentUserId,
           partnerUsername: otherData.matchedWith?.username ?? `User ${currentUserId}`,
           difficulty: otherData.matchedWith?.difficulty,
           topic: otherData.matchedWith?.topic,
           createdAt: Date.now()
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
            roomId
       });

   } catch (error) {
       console.error("Error confirming match:", error);
       return res.status(500).json({ error: "Failed to confirm match" });
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
