import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserByEmail as _findUserByEmail,
  findUserById as _findUserById,
} from "../model/repository.js";
import { formatUserResponse } from "./user-controller.js";

export async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await _findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      if (!user.password) {
        return res.status(400).json({ message: "This account does not have a local password set. Please reset your password or contact support." });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      const accessToken = jwt.sign({
        id: user.id,
      }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      return res.status(200).json({ message: "User logged in", data: { accessToken, ...formatUserResponse(user) } });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(400).json({ message: "Missing email and/or password" });
  }
}

export async function handleVerifyToken(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const user = await _findUserById(userId);
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    return res.status(200).json({ message: "Token verified", data: formatUserResponse(user) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
