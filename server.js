import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routers/AuthRouters.js";
import groupRouter from "./routers/GroupRouters.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173", // allow the frontend origin
    credentials: true,
  }),
);

app.use(express.json()); // parse JSON request bodies
app.use(authRouter);
app.use(groupRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`API on port ${PORT}`);
});
