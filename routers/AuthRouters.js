import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth.js";
import { pool } from "../db.js";

const router = Router();

router.post("/api/auth/signup", async (req, res) => {
  const { fullName, email, password, role } = req.body;
  console.log(req.body);
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [fullName, email, hash, role],
  );
  res.status(201).json({ token: signToken(result.insertId) });
});

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const [[user]] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = signToken(user.user_id);
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    token,
    user: {
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      role: user.role,
    },
  });
});

router.get("/api/auth/me", auth, async (req, res) => {
  const [[user]] = await pool.query(
    "SELECT user_id, full_name, email, role FROM users WHERE user_id = ?",
    [req.user.id],
  );

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
});

router.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
  });
  res.json({ ok: true });
});

export default router;
