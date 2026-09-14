import "dotenv/config";
import express from "express";
import morgan from "morgan";
import Redis from "ioredis";
import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import rateLimit from "express-rate-limit"
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message:{
    error: "Too many requests from this IP, please try again after 15 minutes"
  },
  statusCode: 429,
  standardHeaders: true, 
  legacyHeaders: false,
});

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded());
app.use(morgan("dev"));

const DbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database is connectedd");
  } catch (err) {
    console.log(`Error in db connecting , Error: ${err}`);
  }
};

DbConnect();

const redis = new Redis(process.env.REDIS_URI, {
  retryStrategy: (times) => Math.min(times * 50, 2000),
  enableReadyCheck: false,
  enableOfflineQueue: true,
  maxRetriesPerRequest: null, // Important for pipelining
});

redis.once("ready", () => {
  console.log("Redis is connected");
});

redis.on("error", (err) => {
  console.log(`Redis error: ${err}`);
});


app.get('/', async (req, res) => {

  // res.render('filename', { data to pass to template })
  res.render('index');
});

app.post("/user", async (req, res) => {
  const user = await User.create(req.body);

  await redis.del(`user:${user._id}`);

  res.status(201).json({
    message: "User created successfully",
    user,
  });
});

app.get("/user/:id", async (req, res) => {
  const cachedUser = await redis.getBuffer(`user:${req.params.id}`);

  if (cachedUser) {
    return res.status(200).json({
      message: "user fecthed from cached",
      user: JSON.parse(cachedUser),
    });
  }

  const user = await User.findOne({ _id: req.params.id.trim() });

  redis
    .setex(cacheKey, 60 * 60, JSON.stringify(user))
    .catch((err) => console.log("Cache set error:", err));

  res.status(200).json({
    message: "User fetched successfully",
    user,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is started at PORT:${PORT}`);
});
