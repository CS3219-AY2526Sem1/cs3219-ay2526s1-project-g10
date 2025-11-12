import redis from "../redisClient.js";
import { createClient } from "@supabase/supabase-js";
import { fetchRandomQuestion } from "../utils/questionClient.js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TOPIC_ALIAS_MAP = {
    "arrays & strings": "Array",
    "arrays": "Array",
    "array": "Array",
    "strings": "String",
    "string": "String",
    "linked lists": "Linked List",
    "linked list": "Linked List",
    "stacks & queues": "Stack",
    "stacks": "Stack",
    "stack": "Stack",
    "queues": "Queue",
    "queue": "Queue",
    "hashing / hash maps": "Hash Table",
    "hash table": "Hash Table",
    "hash tables": "Hash Table",
    "hash map": "Hash Table",
    "hash maps": "Hash Table",
    "heaps & priority queues": "Algorithms",
    "heap": "Algorithms",
    "priority queue": "Algorithms",
    "sorting & searching": "Algorithms",
    "recursion": "Algorithms",
    "greedy algorithms": "Algorithms",
    "divide & conquer": "Algorithms",
    "dynamic programming": "Dynamic Programming",
    "graphs": "Graph",
    "graph": "Graph",
    "trees": "Tree",
    "tree": "Tree",
    "math": "Math",
    "database": "Database",
    "databases": "Database",
    "shell": "Shell",
    "concurrency": "Concurrency",
    "others": "Others",
    "algorithm": "Algorithms",
    "algorithms": "Algorithms",
};

function normalizeTopic(topic) {
    if (!topic || typeof topic !== "string") {
        return "";
    }
    const cleaned = topic.trim();
    const alias = TOPIC_ALIAS_MAP[cleaned.toLowerCase()];
    return alias ?? cleaned;
}

// Helper: Hash password
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Helper: Generate random room code (8 characters)
function generateRoomCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// Helper: Allocate room ID (reuse existing logic)
async function allocateRoomId() {
  const roomId = await redis.incr("collab:roomCounter");
  await redis.sadd("collab:activeRooms", roomId);
  return roomId.toString();
}

// Helper: Update room activity timestamp
async function updateRoomActivity(roomCode) {
  await redis.set(`customRoom:lastActivity:${roomCode}`, Date.now());
}

// CREATE CUSTOM ROOM
export const createCustomRoom = async (req, res) => {
  const creatorId = req.user?.userId;
  const { difficulty, topic, password, roomName } = req.body;

  if (!creatorId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!difficulty || !topic || !password) {
    return res.status(400).json({ error: "Missing required fields: difficulty, topic, password" });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  }

  try {
    // Check if user already has an active session
    const existingSession = await redis.get(`session:${creatorId}`);
    if (existingSession) {
      return res.status(400).json({ error: "You already have an active session" });
    }

    // Fetch creator's username
    const { data: userData } = await supabase
      .from('users')
      .select('username')
      .eq('id', creatorId)
      .single();

    const creatorUsername = userData?.username || `User ${creatorId}`;

    // Generate room code and allocate room ID
    const roomCode = generateRoomCode();
    const roomId = await allocateRoomId();
    const timestamp = Date.now();
    const normalizedTopic = normalizeTopic(topic);

    // Fetch question based on difficulty and topic
    let question = null;
    try {
      question = await fetchRandomQuestion({
        difficulty: difficulty.toUpperCase(),
        topic: normalizedTopic,
      });
    } catch (error) {
      console.error("Failed to fetch question for custom room:", error);
      return res.status(502).json({ error: "Failed to fetch question" });
    }

    if (!question) {
      return res.status(404).json({
        error: `No question found for ${difficulty} + ${normalizedTopic}. Please try a different combination.`,
      });
    }

    // Store room metadata
    const roomData = {
      roomId,
      roomCode,
      roomName: roomName || `${creatorUsername}'s Room`,
      creatorId,
      creatorUsername,
      difficulty,
      topic: normalizedTopic,
      question,
      createdAt: timestamp,
      isCustomRoom: true,
    };

    await redis.setex(`customRoom:${roomCode}`, 7200, JSON.stringify(roomData)); // 2 hour TTL
    await redis.set(`customRoom:password:${roomCode}`, hashPassword(password));
    await redis.sadd(`customRoom:participants:${roomCode}`, creatorId);
    await updateRoomActivity(roomCode);

    // Create session for creator
    const creatorSession = {
      sessionId: `custom-${roomCode}`,
      roomId,
      roomCode,
      difficulty,
      topic,
      question,
      isCustomRoom: true,
      createdAt: timestamp,
    };

    await redis.setex(`session:${creatorId}`, 7200, JSON.stringify(creatorSession));

    console.log(`Custom room ${roomCode} created by user ${creatorId}`);

    return res.json({
      success: true,
      roomCode,
      roomId,
      roomName: roomData.roomName,
      difficulty,
      topic,
      question,
    });
  } catch (error) {
    console.error("Error creating custom room:", error);
    return res.status(500).json({ error: "Failed to create custom room" });
  }
};

// JOIN CUSTOM ROOM
export const joinCustomRoom = async (req, res) => {
  const userId = req.user?.userId;
  const { roomCode, password } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!roomCode || !password) {
    return res.status(400).json({ error: "Missing roomCode or password" });
  }

  try {
    // Check if user already has an active session
    const existingSession = await redis.get(`session:${userId}`);
    if (existingSession) {
      const session = JSON.parse(existingSession);
      // If already in this room, return success
      if (session.roomCode === roomCode.toUpperCase()) {
        const roomDataRaw = await redis.get(`customRoom:${roomCode.toUpperCase()}`);
        if (roomDataRaw) {
          const roomData = JSON.parse(roomDataRaw);
          return res.json({
            success: true,
            roomCode: roomData.roomCode,
            roomId: roomData.roomId,
            roomName: roomData.roomName,
            difficulty: roomData.difficulty,
            topic: roomData.topic,
            question: roomData.question,
            alreadyJoined: true,
          });
        }
      }
      return res.status(400).json({ error: "You already have an active session" });
    }

    // Get room data
    const roomDataRaw = await redis.get(`customRoom:${roomCode.toUpperCase()}`);
    if (!roomDataRaw) {
      return res.status(404).json({ error: "Room not found or expired" });
    }

    const roomData = JSON.parse(roomDataRaw);

    // Verify password
    const storedPasswordHash = await redis.get(`customRoom:password:${roomCode.toUpperCase()}`);
    if (!storedPasswordHash || storedPasswordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Fetch user's username
    const { data: userData } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    const username = userData?.username || `User ${userId}`;

    // Add user to participants
    await redis.sadd(`customRoom:participants:${roomCode.toUpperCase()}`, userId);
    await updateRoomActivity(roomCode.toUpperCase());

    // Create session for joining user
    const userSession = {
      sessionId: `custom-${roomCode.toUpperCase()}`,
      roomId: roomData.roomId,
      roomCode: roomCode.toUpperCase(),
      difficulty: roomData.difficulty,
      topic: roomData.topic,
      question: roomData.question,
      isCustomRoom: true,
      joinedAt: Date.now(),
    };

    await redis.setex(`session:${userId}`, 7200, JSON.stringify(userSession));

    console.log(`User ${userId} joined custom room ${roomCode.toUpperCase()}`);

    return res.json({
      success: true,
      roomCode: roomData.roomCode,
      roomId: roomData.roomId,
      roomName: roomData.roomName,
      difficulty: roomData.difficulty,
      topic: roomData.topic,
      question: roomData.question,
    });
  } catch (error) {
    console.error("Error joining custom room:", error);
    return res.status(500).json({ error: "Failed to join custom room" });
  }
};

// GET CUSTOM ROOM INFO (for participants list, etc.)
export const getCustomRoomInfo = async (req, res) => {
  const userId = req.user?.userId;
  const { roomCode } = req.params;

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const roomDataRaw = await redis.get(`customRoom:${roomCode.toUpperCase()}`);
    if (!roomDataRaw) {
      return res.status(404).json({ error: "Room not found" });
    }

    const roomData = JSON.parse(roomDataRaw);

    // Get participants
    const participantIds = await redis.smembers(`customRoom:participants:${roomCode.toUpperCase()}`);

    // Fetch usernames for participants
    const participants = [];
    for (const participantId of participantIds) {
      const { data: userData } = await supabase
        .from('users')
        .select('username')
        .eq('id', participantId)
        .single();

      participants.push({
        userId: participantId,
        username: userData?.username || `User ${participantId}`,
        isCreator: participantId === roomData.creatorId,
      });
    }

    return res.json({
      roomCode: roomData.roomCode,
      roomId: roomData.roomId,
      roomName: roomData.roomName,
      difficulty: roomData.difficulty,
      topic: roomData.topic,
      creatorId: roomData.creatorId,
      creatorUsername: roomData.creatorUsername,
      participants,
      createdAt: roomData.createdAt,
    });
  } catch (error) {
    console.error("Error fetching custom room info:", error);
    return res.status(500).json({ error: "Failed to fetch room info" });
  }
};

// LEAVE CUSTOM ROOM
export const leaveCustomRoom = async (req, res) => {
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

    if (!session.isCustomRoom || !session.roomCode) {
      return res.status(400).json({ error: "Not in a custom room" });
    }

    const roomCode = session.roomCode;

    // Remove user from participants
    await redis.srem(`customRoom:participants:${roomCode}`, userId);
    await redis.del(`session:${userId}`);

    // Check if room is empty
    const remainingParticipants = await redis.smembers(`customRoom:participants:${roomCode}`);

    if (remainingParticipants.length === 0) {
      // Room is empty, delete it
      await redis.del(`customRoom:${roomCode}`);
      await redis.del(`customRoom:password:${roomCode}`);
      await redis.del(`customRoom:participants:${roomCode}`);
      await redis.del(`customRoom:lastActivity:${roomCode}`);

      if (session.roomId) {
        await redis.srem("collab:activeRooms", session.roomId);
      }

      console.log(`Custom room ${roomCode} deleted (empty)`);
    } else {
      await updateRoomActivity(roomCode);
    }

    console.log(`User ${userId} left custom room ${roomCode}`);

    return res.json({
      success: true,
      roomCode,
    });
  } catch (error) {
    console.error("Error leaving custom room:", error);
    return res.status(500).json({ error: "Failed to leave custom room" });
  }
};