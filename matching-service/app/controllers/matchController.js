// change to map later instead of array 
let waitingUsers = [];

function findMatch(user, type) {
    return waitingUsers.find((u) => !u.matched && u.userId !== user.userId && u[type] === user[type]);
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
    waitingUsers.push(newUser);
    console.log(`User ${userId} added to waiting queue.`);

    // Check for difficulty match first within 30s
    const difficultyMatch = findMatch({userId, difficulty, topic}, "difficulty");
    if (difficultyMatch) {
        newUser.matched = true;
        difficultyMatch.matched = true; 
        waitingUsers = waitingUsers.filter((u) => !u.matched); 
        console.log(`Matched ${userId} with ${difficultyMatch.userId} by difficulty!`);
        return res.json({matchFound: true, matchedWith: difficultyMatch});
    }

    setTimeout(() => {
        const stillWaiting = waitingUsers.find(
            (u) => u.userId === userId && !u.matched
        );

        if (!stillWaiting) {
            return;
        }

        // check difficulty for first 30s
        const difficultyMatchAgain = findMatch(stillWaiting, "difficulty");
        if (difficultyMatchAgain) {
            stillWaiting.matched = true;
            difficultyMatchAgain.matched = true;
            waitingUsers = waitingUsers.filter((u) => !u.matched); 
            console.log(`Matched ${userId} with ${difficultyMatchAgain.userId} by difficulty!`);
            return res.json({matchFound: true, matchedWith: difficultyMatchAgain});
        }
    

        // check for topic match in the next 30s
        setTimeout(() => {
            const stillWaiting2 = waitingUsers.find(
                (u) => u.userId === userId && !u.matched
            );
            
            if (!stillWaiting2) {
                return;
            }

            const topicMatch = findMatch(stillWaiting2, "topic");
            if (topicMatch) {
                stillWaiting2.matched = true; 
                topicMatch.matched = true;
                waitingUsers = waitingUsers.filter((u) => !u.matched); 
                console.log(`Matched ${userId} with ${topicMatch.userId} by topic!`);
                return res.json({matchFound: true, matchedWith: topicMatch});
            }

            // if no match found
            waitingUsers = waitingUsers.filter((u) => !u.matched);
            console.log(`No match found for ${userId} after 1 min.`);
            return res.json({ matchFound: false, message: "No match found" });

        }, 30000)
    }, 30000)
};



