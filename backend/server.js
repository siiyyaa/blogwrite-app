const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 5000;




app.use(cors());
app.use(express.json());



const usersFile = path.join(
    __dirname,
    "data",
    "users.json"
);

const blogsFile = path.join(
    __dirname,
    "data",
    "blogs.json"
);




app.get("/", (req, res) => {

    res.json({
        message: "BlogWrite API is running successfully"
    });

});



app.post("/api/auth/register", (req, res) => {

    const {
        name,
        email,
        password
    } = req.body;


    // Check required fields

    if (!name || !email || !password) {

        return res.status(400).json({
            message: "Name, email and password are required"
        });

    }


    // Read users

    let users = [];

    try {

        const data = fs.readFileSync(
            usersFile,
            "utf-8"
        );

        users = JSON.parse(data);

    } catch (error) {

        users = [];

    }


    // Check if email already exists

    const existingUser = users.find(
        user => user.email === email
    );


    if (existingUser) {

        return res.status(409).json({
            message: "Email is already registered"
        });

    }


    // Create new user

    const newUser = {

        id: Date.now().toString(),

        name: name,

        email: email,

        password: password,

        createdAt: new Date().toISOString()

    };


    // Add user

    users.push(newUser);


    // Save users

    fs.writeFileSync(
        usersFile,
        JSON.stringify(users, null, 2)
    );


    // Response

    res.status(201).json({

        message: "User registered successfully",

        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }

    });

});




app.post("/api/auth/login", (req, res) => {

    const {
        email,
        password
    } = req.body;


    // Check required fields

    if (!email || !password) {

        return res.status(400).json({
            message: "Email and password are required"
        });

    }


    // Read users

    let users = [];

    try {

        const data = fs.readFileSync(
            usersFile,
            "utf-8"
        );

        users = JSON.parse(data);

    } catch (error) {

        return res.status(500).json({
            message: "Unable to read users"
        });

    }


    // Find user

    const user = users.find(
        user =>
            user.email === email &&
            user.password === password
    );


    // Invalid login

    if (!user) {

        return res.status(401).json({
            message: "Invalid email or password"
        });

    }


    // Successful login

    res.status(200).json({

        message: "Login successful",

        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }

    });

});


app.post("/api/blogs", (req, res) => {

    const {
        title,
        category,
        content,
        author
    } = req.body;


    // Check required fields

    if (!title || !content) {

        return res.status(400).json({
            message: "Title and content are required"
        });

    }


    // Read existing blogs

    let blogs = [];

    try {

        const data = fs.readFileSync(
            blogsFile,
            "utf-8"
        );

        blogs = JSON.parse(data);

    } catch (error) {

        blogs = [];

    }


    // Create new blog

    const newBlog = {

        id: Date.now().toString(),

        title: title,

        category: category || "General",

        content: content,

        author: author || "Anonymous",

        createdAt: new Date().toISOString()

    };


    // Add blog

    blogs.push(newBlog);


    // Save blogs

    fs.writeFileSync(
        blogsFile,
        JSON.stringify(blogs, null, 2)
    );


    // Response

    res.status(201).json({

        message: "Blog created successfully",

        blog: newBlog

    });

});




app.listen(PORT, () => {

    console.log(
        `BlogWrite server running on http://localhost:${PORT}`
    );

});