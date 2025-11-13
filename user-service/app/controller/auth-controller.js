import supabase from "../../supabaseClient.js";
import { mapProfileToResponse, updateAuthAdminMetadata } from "./user-controller.js";

const FRONTEND_CALLBACK_BASE = "https://frontend-j4i3ud5cyq-as.a.run.app";

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

  const metadataIsAdmin = data.user?.user_metadata?.isAdmin;
  const isAdminFromMetadata = metadataIsAdmin === undefined ? profile.isAdmin === true : metadataIsAdmin === true;

    if (profile.isAdmin !== isAdminFromMetadata) {
      const { error: syncError } = await supabase
        .from("users")
        .update({ isAdmin: isAdminFromMetadata })
        .eq("id", profile.id);

      if (syncError) {
        console.error("Failed to sync admin flag from metadata", syncError);
      } else {
        profile.isAdmin = isAdminFromMetadata;
      }
    }

    if (metadataIsAdmin === undefined) {
      try {
        await updateAuthAdminMetadata(profile.id, profile.isAdmin === true);
      } catch (metadataSyncError) {
        console.error("Failed to backfill admin metadata", metadataSyncError);
      }
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
  const { username, email, password, adminCode } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "username, email and password are required" });
  }

  const configuredAdminCode = process.env.ADMIN_REGISTRATION_CODE?.trim();
  const adminCodeProvided = typeof adminCode === "string" && adminCode.trim().length > 0;
  const sanitizedAdminCode = adminCodeProvided ? adminCode.trim() : null;

  if (adminCodeProvided && !configuredAdminCode) {
    return res.status(400).json({ message: "Admin registration is not configured" });
  }

  const isAdmin = adminCodeProvided && configuredAdminCode ? sanitizedAdminCode === configuredAdminCode : false;

  if (adminCodeProvided && configuredAdminCode && sanitizedAdminCode !== configuredAdminCode) {
    return res.status(403).json({ message: "Invalid admin registration code" });
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

    const explicitRedirect = process.env.EMAIL_CONFIRM_REDIRECT?.trim();
    const emailRedirectTo = explicitRedirect && explicitRedirect.length > 0
      ? explicitRedirect
      : `${FRONTEND_CALLBACK_BASE.replace(/\/$/, "")}/auth/callback?type=signup`;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          username,
          isAdmin,
          role: isAdmin ? "admin" : "user",
        },
      },
    });

    if (signUpError || !signUpData?.user) {
      return res.status(400).json({ message: signUpError?.message ?? "Failed to create user" });
    }

    const createdAt = new Date().toISOString();
    const insertResult = await supabase
      .from("users")
      .insert({
        id: signUpData.user.id,
        email,
        username,
        isAdmin,
        createdAt,
      })
      .select("id")
      .single();

    if (insertResult.error) {
      await supabase.auth.admin.deleteUser(signUpData.user.id);
      return res.status(400).json({ message: insertResult.error.message ?? "Failed to create user profile" });
    }

    return res.status(201).json({
      message: "User created",
      data: mapProfileToResponse(
        { id: signUpData.user.id, email, username, isAdmin, createdAt },
        signUpData.user.email_confirmed_at
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
