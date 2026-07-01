import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routers/AuthRouters.js";
import groupRouter from "./routers/GroupRouters.js";

const app = express();
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

app.listen(3000, () => {
  console.log("API on http://localhost:3000");
});
