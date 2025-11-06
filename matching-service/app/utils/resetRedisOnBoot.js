import redis from "../redisClient.js";

const BASE_KEYS = [
  "waitingUsers",
  "collab:roomCounter",
  "collab:activeRooms",
];

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

export default async function resetRedisOnBoot() {
  const shouldReset = (process.env.RESET_REDIS_ON_BOOT || "").toLowerCase() === "true";

  if (!shouldReset) {
    return;
  }

  console.log("RESET_REDIS_ON_BOOT enabled; clearing Redis state before startup...");

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
}
