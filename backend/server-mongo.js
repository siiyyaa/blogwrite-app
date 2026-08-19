const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

if (!JWT_SECRET || !MONGODB_URI) {
    throw new Error("MONGODB_URI and JWT_SECRET must be set in backend/.env");
}

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }
}, { timestamps: true });

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "General", trim: true },
    content: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Blog = mongoose.model("Blog", blogSchema);

async function migrateLegacyBlogs() {
    const blogsFile = path.join(__dirname, "data", "blogs.json");

    if (!fs.existsSync(blogsFile)) {
        return;
    }

    const legacyBlogs = JSON.parse(fs.readFileSync(blogsFile, "utf8"));
    for (const legacyBlog of legacyBlogs) {
        const alreadyImported = await Blog.exists({
            title: legacyBlog.title,
            content: legacyBlog.content
        });

        if (alreadyImported) {
            continue;
        }

        const author = await User.findOne({ name: legacyBlog.author }) || await User.create({
            name: legacyBlog.author || "Anonymous",
            email: `legacy-${legacyBlog.id}@blogwrite.local`,
            password: await bcrypt.hash(crypto.randomUUID(), 12)
        });

        await Blog.create({
            title: legacyBlog.title,
            category: legacyBlog.category || "General",
            content: legacyBlog.content,
            author: author._id,
            createdAt: legacyBlog.createdAt,
            updatedAt: legacyBlog.createdAt
        });
    }
}

function publicUser(user) {
    return { id: user._id.toString(), name: user.name, email: user.email };
}

function createToken(user) {
    return jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

function serializeBlog(blog) {
    return {
        id: blog._id.toString(),
        title: blog.title,
        category: blog.category,
        content: blog.content,
        author: blog.author?.name || "Anonymous",
        authorId: blog.author?._id?.toString(),
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt
    };
}

function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Authentication is required" });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

app.get("/", (req, res) => {
    res.json({ message: "BlogWrite API is running successfully" });
});

app.post("/api/auth/register", async (req, res, next) => {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        const user = await User.create({
            name,
            email,
            password: await bcrypt.hash(password, 12)
        });

        res.status(201).json({
            message: "User registered successfully",
            user: publicUser(user),
            token: createToken(user)
        });
    } catch (error) {
        next(error);
    }
});

app.post("/api/auth/login", async (req, res, next) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({
            message: "Login successful",
            user: publicUser(user),
            token: createToken(user)
        });
    } catch (error) {
        next(error);
    }
});

app.get("/api/blogs", async (req, res, next) => {
    try {
        const blogs = await Blog.find().populate("author", "name").sort({ createdAt: -1 });
        res.json({ blogs: blogs.map(serializeBlog) });
    } catch (error) {
        next(error);
    }
});

app.get("/api/blogs/:id", async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid blog id" });
        }

        const blog = await Blog.findById(req.params.id).populate("author", "name");
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.json({ blog: serializeBlog(blog) });
    } catch (error) {
        next(error);
    }
});

app.post("/api/blogs", requireAuth, async (req, res, next) => {
    try {
        const title = req.body.title?.trim();
        const category = req.body.category?.trim() || "General";
        const content = req.body.content?.trim();

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const blog = await Blog.create({ title, category, content, author: req.user.id });
        await blog.populate("author", "name");
        res.status(201).json({ message: "Blog created successfully", blog: serializeBlog(blog) });
    } catch (error) {
        next(error);
    }
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ message: "An unexpected server error occurred" });
});

mongoose.connect(MONGODB_URI)
    .then(async () => {
        await migrateLegacyBlogs();
        app.listen(PORT, () => {
            console.log(`BlogWrite server running on http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error("Unable to connect to MongoDB:", error.message);
        process.exit(1);
    });
