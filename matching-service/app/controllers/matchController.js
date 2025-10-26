import redis from "../redisClient.js";

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


// Helper: check if a user is still waiting (not matched)
async function isStillWaiting(userId) {
   const allUsers = (await redis.lrange("waitingUsers", 0, -1)).map((u) => JSON.parse(u));
   return allUsers.some((u) => u.userId === userId && !u.matched);
}


async function handleMatch(userId, partner) {
   const allUsers = (await redis.lrange("waitingUsers", 0, -1)).map((u) => JSON.parse(u));
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




export const startMatching = async (req, res) => {
   console.log("Matching started...");


   const { userId, difficulty, topic } = req.body;
   if (!userId || !difficulty || !topic) {
       return res.status(400).json( { error: "Missing fields in request body"} );
   }


   console.log(`User ${userId} is requesting a match...`);
   console.log(`User ${userId} joined queue.`);


   // immediately add to waiting queue
   const newUser = { userId, difficulty, topic, joinedAt: Date.now(), matched: false};
   await redis.rpush("waitingUsers", JSON.stringify(newUser));
   console.log(`User ${userId} added to waiting queue.`);


   // Check for difficulty match first within 30s
   const difficultyMatch = await findMatch({userId, difficulty, topic}, "difficulty");
   if (difficultyMatch) {
       newUser.matched = true;
       difficultyMatch.matched = true;
       await handleMatch(userId, difficultyMatch);
       return res.json({matchFound: true, matchedWith: difficultyMatch});
   }


   setTimeout(async () => {
       if (!(await isStillWaiting(userId))) return; // if matched alrdy, do not continue.
       // check difficulty for first 30s
       const difficultyMatchAgain = await findMatch(newUser, "difficulty");
       if (difficultyMatchAgain) {
           newUser.matched = true;
           difficultyMatchAgain.matched = true;
           await handleMatch(userId, difficultyMatchAgain);
           return res.json({matchFound: true, matchedWith: difficultyMatchAgain});
       }
  


       // check for topic match in the next 30s
       setTimeout(async () => {
           if (!(await isStillWaiting(userId))) return;
           const topicMatch = await findMatch(newUser, "topic");
           if (topicMatch) {
               newUser.matched = true;
               topicMatch.matched = true;
               await handleMatch(userId, topicMatch);
               return res.json({matchFound: true, matchedWith: topicMatch});
           }


           console.log(`No match found for ${userId} after 1 min.`);
           return res.json({ matchFound: false, message: "No match found" });


       }, 30000)
   }, 30000)
};
