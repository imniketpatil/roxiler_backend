import express from "express";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "https://roxiler-frontend-nine.vercel.app/",
  "https://roxiler-frontend-git-main-niket-patils-projects.vercel.app/",
  "https://roxiler-frontend-c14sluh7c-niket-patils-projects.vercel.app/",
];

// Configure CORS options
const corsOptions = {
  origin: (origin, callback) => {
    console.log("Evaluating origin:", origin);
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

// CORS
app.use(cors(corsOptions));

//middleware

app.get("/niket", (req, res) => res.send("Hey Niket"));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//import Routes
import productRouter from "./routes/product.routes.js";

app.use("/api/v1/products", productRouter);

export { app };
