import supabase from "../../supabaseClient.js";

export async function updateAuthAdminMetadata(userId, isAdmin) {
  const { data: authUser, error: authFetchError } = await supabase.auth.admin.getUserById(userId);

  if (authFetchError || !authUser?.user) {
    throw new Error(authFetchError?.message ?? "Unable to retrieve auth user");
  }

  const existingMetadata = authUser.user.user_metadata ?? {};

  if (existingMetadata.isAdmin === isAdmin) {
    // Ensure role reflects admin status even if the boolean already matches
    if ((existingMetadata.role === "admin") === isAdmin) {
      return;
    }
  }

  const updatedMetadata = {
    ...existingMetadata,
    isAdmin,
    role: isAdmin ? "admin" : "user",
  };

  const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: updatedMetadata,
  });

  if (authUpdateError) {
    throw new Error(authUpdateError.message ?? "Failed to update auth metadata");
  }
}

async function ensureUniqueUser(username, email, excludeId) {
  const filters = [];
  if (username) filters.push(`username.eq.${username}`);
  if (email) filters.push(`email.eq.${email}`);

  if (filters.length === 0) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, username, email")
    .or(filters.join(","));

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return data.find((item) => item.id !== excludeId);
}

export async function createUser(req, res) {
  try {
    const { username, email, password } = req.body;
    if (username && email && password) {
      const duplicate = await ensureUniqueUser(username, email, undefined);
      if (duplicate) {
        return res.status(409).json({ message: "username or email already exists" });
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, isAdmin: false, role: "user" },
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
        message: `Created new user ${username} successfully`,
        data: mapProfileToResponse({
          id: data.user.id,
          email,
          username,
          isAdmin: false,
          createdAt: new Date().toISOString(),
        }, data.user.email_confirmed_at),
      });
    } else {
      return res.status(400).json({ message: "username and/or email and/or password are missing" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when creating new user!" });
  }
}

export async function getUser(req, res) {
  try {
    const userId = req.params.id;
    const { data, error } = await supabase
      .from("users")
  .select("id, email, username, isAdmin, createdAt")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: `User ${userId} not found` });
    } else {
      return res.status(200).json({ message: `Found user`, data: mapProfileToResponse(data) });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting user!" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const { data, error } = await supabase
      .from("users")
  .select("id, email, username, isAdmin, createdAt")
  .order("createdAt", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({ message: `Found users`, data: (data ?? []).map((item) => mapProfileToResponse(item)) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting all users!" });
  }
}

export async function updateUser(req, res) {
  try {
    const { username, email, password } = req.body;
    if (username || email || password) {
      const userId = req.params.id;
      const { data: existingUser, error: existingError } = await supabase
        .from("users")
  .select("id, email, username, isAdmin, createdAt")
        .eq("id", userId)
        .single();

      if (existingError || !existingUser) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }

      if ((username && username !== existingUser.username) || (email && email !== existingUser.email)) {
        const duplicate = await ensureUniqueUser(username ?? existingUser.username, email ?? existingUser.email, userId);
        if (duplicate) {
          return res.status(409).json({ message: "username or email already exists" });
        }
      }

      if (email || password) {
        const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
          email: email ?? existingUser.email,
          password: password ?? undefined,
        });

        if (authError) {
          return res.status(400).json({ message: authError.message });
        }
      }

      const { data: updatedProfile, error: profileError } = await supabase
        .from("users")
        .update({
          username: username ?? existingUser.username,
          email: email ?? existingUser.email,
        })
        .eq("id", userId)
  .select("id, email, username, isAdmin, createdAt")
        .single();

      if (profileError || !updatedProfile) {
        return res.status(400).json({ message: profileError?.message ?? "Failed to update user" });
      }

      return res.status(200).json({
        message: `Updated data for user ${userId}`,
        data: mapProfileToResponse(updatedProfile),
      });
    } else {
      return res.status(400).json({ message: "No field to update: username and email and password are all missing!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating user!" });
  }
}

export async function updateUserPrivilege(req, res) {
  try {
    const { isAdmin } = req.body;

    if (isAdmin !== undefined) {  // isAdmin can have boolean value true or false
      const userId = req.params.id;
      const { data: existingUser, error } = await supabase
        .from("users")
        .select("id, email, username, isAdmin, createdAt")
        .eq("id", userId)
        .single();

      if (error || !existingUser) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }

      const targetIsAdmin = isAdmin === true;

      try {
        await updateAuthAdminMetadata(userId, targetIsAdmin);
      } catch (metadataError) {
        console.error("Failed to update auth metadata", metadataError);
        return res.status(500).json({ message: metadataError.message ?? "Failed to update auth metadata" });
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ isAdmin: targetIsAdmin })
        .eq("id", userId)
        .select("id, email, username, isAdmin, createdAt")
        .single();

      if (updateError || !updatedUser) {
        if (existingUser.isAdmin !== targetIsAdmin) {
          try {
            await updateAuthAdminMetadata(userId, existingUser.isAdmin === true);
          } catch (revertError) {
            console.error("Failed to revert auth metadata after DB update failure", revertError);
          }
        }
        return res.status(400).json({ message: updateError?.message ?? "Failed to update user privilege" });
      }

      return res.status(200).json({
        message: `Updated privilege for user ${userId}`,
        data: mapProfileToResponse(updatedUser),
      });
    } else {
      return res.status(400).json({ message: "isAdmin is missing!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating user privilege!" });
  }
}

export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    const { data: existingUser, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (error || !existingUser) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    await supabase.auth.admin.deleteUser(userId);
    await supabase.from("users").delete().eq("id", userId);
    return res.status(200).json({ message: `Deleted user ${userId} successfully` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when deleting user!" });
  }
}

export function mapProfileToResponse(user, emailConfirmedAt) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin === true,
  createdAt: user.createdAt,
    emailConfirmedAt,
  };
}
