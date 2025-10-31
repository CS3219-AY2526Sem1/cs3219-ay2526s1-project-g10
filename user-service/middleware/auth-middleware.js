import supabase from "../supabaseClient.js";
import { findUserById as _findUserById } from "../app/model/repository.js";

export async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const dbUser = await _findUserById(data.user.id);
    if (!dbUser) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      isAdmin: dbUser.isAdmin,
      createdAt: dbUser.createdAt,
    };
    next();
  } catch (err) {
    console.error("Auth verification failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
