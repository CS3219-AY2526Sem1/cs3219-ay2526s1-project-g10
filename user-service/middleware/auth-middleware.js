import supabase from "../supabaseClient.js";
import { mapProfileToResponse } from "../app/controller/user-controller.js";

export async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No authorization header found");
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("No token found");
      return res.status(401).json({ error: "Invalid token format" });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      console.log("Invalid or expired token");
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, email, username, isAdmin, createdAt")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      console.log("User profile not found");
      return res.status(401).json({ error: "User profile not found" });
    }

    req.user = mapProfileToResponse(profile, data.user.email_confirmed_at);
    next();
  } catch (err) {
    console.error("Auth verification failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
