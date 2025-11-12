const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://user-service:3001";

async function readJsonSafely(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization header" });
  }

  try {
    const response = await fetch(`${USER_SERVICE_URL}/auth/me`, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (response.status === 401) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (response.status === 403) {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    if (!response.ok) {
      const body = await readJsonSafely(response);
      console.error("Failed to verify admin privileges", {
        status: response.status,
        body,
      });
      return res.status(500).json({ error: "Failed to verify admin privileges" });
    }

    const payload = await readJsonSafely(response);
    const user = payload?.data ?? payload;

    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error while verifying admin privileges", error);
    return res.status(500).json({ error: "Unable to verify admin privileges" });
  }
}
