import supabase from "../supabaseClient.js";

export async function verifyAuth(req, res, next) {
  try {
    // Expect header like: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    // Verify with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Attach user info to request
    req.user = data.user;

    next(); // pass control to next middleware or route handler
  } catch (err) {
    console.error("Auth verification failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
