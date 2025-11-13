import redis from "../redisClient.js";

const BASE_KEYS = [
  "waitingUsers",
  "collab:roomCounter",
  "collab:activeRooms",
];

const DEFAULT_TIMEOUT_MS = Number(process.env.REDIS_BOOT_TIMEOUT_MS || 5000);

async function deleteKeys(keys) {
  if (!keys.length) {
    return 0;
  }
  return redis.del(...keys);
}

async function deleteByPattern(pattern) {
  let cursor = "0";
  let removed = 0;

  do {
    const [nextCursor, matchingKeys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 500);
    cursor = nextCursor;

    if (matchingKeys.length) {
      const deleted = await deleteKeys(matchingKeys);
      removed += deleted;
    }
  } while (cursor !== "0");

  return removed;
}

async function ensureRedisReachable(timeoutMs = DEFAULT_TIMEOUT_MS) {
  try {
    await Promise.race([
      redis.ping(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Redis ping timed out")), timeoutMs);
      }),
    ]);
    return true;
  } catch (error) {
    console.warn(
      `Skipping Redis cleanup: unable to reach Redis within ${timeoutMs}ms. Set REDIS_HOST/REDIS_PORT if a remote instance is required.`,
      error,
    );
    return false;
  }
}

export default async function resetRedisOnBoot() {
  const shouldReset = (process.env.RESET_REDIS_ON_BOOT || "").toLowerCase() === "true";

  if (!shouldReset) {
    return;
  }

  const hasRedis = await ensureRedisReachable();
  if (!hasRedis) {
    return;
  }

  console.log("RESET_REDIS_ON_BOOT enabled; clearing Redis state before startup...");

  try {
    let totalRemoved = 0;

    const baseRemoval = await deleteKeys(BASE_KEYS);
    totalRemoved += baseRemoval;
    console.log(`Removed ${baseRemoval} base keys: ${BASE_KEYS.join(", ")}`);

    const patterns = ["match:*", "session:*", "collab:*"];

    for (const pattern of patterns) {
      const removed = await deleteByPattern(pattern);
      totalRemoved += removed;
      console.log(`Removed ${removed} keys matching pattern ${pattern}`);
    }

    console.log(`Redis cleanup complete; deleted ${totalRemoved} keys.`);
  } catch (error) {
    console.warn("Redis cleanup encountered an error; continuing without blocking startup.", error);
  }
}
