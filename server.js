import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));



  



  import session from 'express-session';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use('/auth', authRoutes);
app.use('/', postRoutes);










const app = express();
const PORT = 5000;

// Get current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const posts = [];

// Home Route - Display Posts
app.get("/", (req, res) => {
  res.render("index", { posts });
});

// Create Post Route (GET)
app.get("/create", (req, res) => {
  res.render("create");
});

// Create Post Route (POST)
app.post("/create", (req, res) => {
  const { title, content } = req.body;
  posts.push({ title, content });
  res.redirect("/");
});

// Edit Post Route (GET)
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  res.render("edit", { post: posts[id], id });
});

// Edit Post Route (POST)
app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  posts[id] = { title: req.body.title, content: req.body.content };
  res.redirect("/");
});

// Delete Post Route
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  posts.splice(id, 1);
  res.redirect("/");
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
