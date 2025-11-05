import supabase from "../../supabaseClient.js";
import { mapProfileToResponse } from "./user-controller.js";

export async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing email and/or password" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user || !data.session) {
      return res.status(401).json({ message: error?.message ?? "Wrong email and/or password" });
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, email, username, isAdmin, createdAt")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    if (!data.user.email_confirmed_at) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    return res.status(200).json({
      message: "User logged in",
      data: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: mapProfileToResponse(profile, data.user.email_confirmed_at),
      },
    });
  } catch (err) {
    console.error("Login failed", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function handleSignup(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "username, email and password are required" });
  }

  try {
    const existingProfile = await supabase
      .from("users")
      .select("id")
      .or(`email.eq.${email}`)
      .maybeSingle();

    if (existingProfile.data) {
      return res.status(409).json({ message: "username or email already exists" });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { username },
    });

    if (error || !data?.user) {
      return res.status(400).json({ message: error?.message ?? "Failed to create user" });
    }

    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email,
      username,
      isAdmin: false,
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(data.user.id);
      return res.status(400).json({ message: profileError.message ?? "Failed to create user profile" });
    }

    return res.status(201).json({
      message: "User created",
      data: mapProfileToResponse(
        { id: data.user.id, email, username, isAdmin: false, createdAt: new Date().toISOString() },
        data.user.email_confirmed_at
      ),
    });
  } catch (err) {
    console.error("Signup failed", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function handleForgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.PASSWORD_RESET_REDIRECT ?? "http://localhost:3000/user/reset-password",
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Password reset failed", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function handleMe(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  return res.status(200).json({ message: "OK", data: req.user });
}
