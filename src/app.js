import express from "express";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "https://roxiler-frontend-nine.vercel.app",
  "https://roxiler-frontend-git-main-niket-patils-projects.vercel.app",
  "https://roxiler-frontend-c14sluh7c-niket-patils-projects.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    console.log("Incoming request from origin:", origin);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.get("/niket", (req, res) => res.send("Hey Niket"));

import productRouter from "./routes/product.routes.js";
app.use("/api/v1/products", productRouter);

export { app };
