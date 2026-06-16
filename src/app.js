import express from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: "true", limit: "16kb" }));
app.use(express.static("public"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : "https://localhost:7152",
    credentials: "true",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS "],
    allowheaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Backend Project Brother");
});

app.get("/instagram", (req, res) => {
  res.send("Yaa, Testing Brother");
});

export default app;
