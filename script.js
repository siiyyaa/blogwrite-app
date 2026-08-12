/* =========================================================
   BLOGWRITE - SHARED JAVASCRIPT
   Works with:
   1. home.html
   2. dashboard.html
   3. create-blog.html
   4. login.html
   5. register.html

   Uses localStorage for:
   - User registration
   - Login state
   - Blog posts
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const STORAGE_KEYS = {
    users: "blogwrite_users",
    currentUser: "blogwrite_current_user",
    posts: "blogwrite_posts"
};


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

/* Get data from localStorage */

function getData(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);

        if (data === null) {
            return defaultValue;
        }

        return JSON.parse(data);

    } catch (error) {
        console.error("Error reading localStorage:", error);
        return defaultValue;
    }
}


/* Save data to localStorage */

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}


/* Get currently logged-in user */

function getCurrentUser() {
    return localStorage.getItem(STORAGE_KEYS.currentUser);
}


/* Check whether a user is logged in */

function isLoggedIn() {
    return getCurrentUser() !== null;
}


/* Generate a simple unique ID */

function generateId() {
    return Date.now().toString();
}


/* Escape HTML before displaying user-generated content */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* Format date */

function formatDate(date) {

    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}


/* =========================================================
   PAGE DETECTION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    /* Common functionality */

    initializeNavigation();
    initializeSmoothScrolling();
    updateLoginNavigation();
    updateCurrentYear();


    /* Page-specific functionality */

    if (currentPage === "home.html" || currentPage === "") {
        initializeHomePage();
    }

    if (currentPage === "register.html") {
        initializeRegisterPage();
    }

    if (currentPage === "login.html") {
        initializeLoginPage();
    }

    if (currentPage === "create-blog.html") {
        initializeCreateBlogPage();
    }

    if (currentPage === "dashboard.html") {
        initializeDashboardPage();
    }

});


/* =========================================================
   COMMON - NAVIGATION
========================================================= */

function initializeNavigation() {

    const navToggle =
        document.getElementById("navToggle");

    const siteNav =
        document.querySelector(".site-nav");


    if (navToggle && siteNav) {

        navToggle.addEventListener("click", function () {

            siteNav.classList.toggle("open");

        });

    }


    /* Close mobile menu after clicking a link */

    const navLinks =
        document.querySelectorAll(".site-nav a");

    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            if (siteNav) {
                siteNav.classList.remove("open");
            }

        });

    });

}


/* =========================================================
   COMMON - SMOOTH SCROLLING
========================================================= */

function initializeSmoothScrolling() {

    const links =
        document.querySelectorAll('a[href^="#"]');


    links.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId =
                link.getAttribute("href");


            if (!targetId || targetId === "#") {
                return;
            }


            const target =
                document.querySelector(targetId);


            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });

}


/* =========================================================
   COMMON - LOGIN NAVIGATION
========================================================= */

function updateLoginNavigation() {

    const currentUser =
        getCurrentUser();


    const loginLinks =
        document.querySelectorAll(
            'a[href="login.html"]'
        );


    const registerLinks =
        document.querySelectorAll(
            'a[href="register.html"]'
        );


    if (currentUser) {

        loginLinks.forEach(function (link) {

            link.textContent = "Logout";

            link.href = "#";

            link.addEventListener("click", function (event) {

                event.preventDefault();

                logoutUser();

            });

        });


        registerLinks.forEach(function (link) {

            link.textContent = "Dashboard";

            link.href = "dashboard.html";

        });

    }

}


/* =========================================================
   COMMON - LOGOUT
========================================================= */

function logoutUser() {

    localStorage.removeItem(
        STORAGE_KEYS.currentUser
    );

    alert("You have been logged out.");

    window.location.href = "home.html";

}


/* =========================================================
   COMMON - CURRENT YEAR
========================================================= */

function updateCurrentYear() {

    const yearElements =
        document.querySelectorAll(".current-year");


    yearElements.forEach(function (element) {

        element.textContent =
            new Date().getFullYear();

    });

}


/* =========================================================
   HOME PAGE
========================================================= */

function initializeHomePage() {

    displayLatestPosts();

}


/* =========================================================
   HOME - DISPLAY LATEST POSTS
========================================================= */

function displayLatestPosts() {

    const postList =
        document.querySelector(".post-list");


    if (!postList) {
        return;
    }


    const posts =
        getData(STORAGE_KEYS.posts, []);


    /*
       If there are no user-created posts,
       keep the posts already written in HTML.
    */

    if (posts.length === 0) {
        return;
    }


    const latestPosts =
        posts
            .slice()
            .sort(function (a, b) {

                return new Date(b.createdAt) -
                       new Date(a.createdAt);

            })
            .slice(0, 3);


    postList.innerHTML = "";


    latestPosts.forEach(function (post) {

        const article =
            document.createElement("article");

        article.className = "post";


        article.innerHTML = `
            <div class="post-meta">
                <span>${escapeHTML(post.category)}</span>
                <span>${formatDate(post.createdAt)}</span>
            </div>

            <h3>
                ${escapeHTML(post.title)}
            </h3>

            <p>
                ${escapeHTML(post.excerpt)}
            </p>

            <a href="dashboard.html" class="post-link">
                Read post →
            </a>
        `;


        postList.appendChild(article);

    });

}


/* =========================================================
   REGISTER PAGE
========================================================= */

function initializeRegisterPage() {

    const registerForm =
        document.querySelector("#registerForm");


    if (!registerForm) {
        return;
    }


    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const nameInput =
            registerForm.querySelector(
                '[name="name"]'
            );


        const emailInput =
            registerForm.querySelector(
                '[name="email"]'
            );


        const passwordInput =
            registerForm.querySelector(
                '[name="password"]'
            );


        const confirmPasswordInput =
            registerForm.querySelector(
                '[name="confirmPassword"]'
            );


        if (
            !nameInput ||
            !emailInput ||
            !passwordInput ||
            !confirmPasswordInput
        ) {

            alert(
                "Please make sure your register form uses these names: name, email, password, confirmPassword."
            );

            return;
        }


        const name =
            nameInput.value.trim();


        const email =
            emailInput.value.trim().toLowerCase();


        const password =
            passwordInput.value;


        const confirmPassword =
            confirmPasswordInput.value;


        /* Validation */

        if (
            name === "" ||
            email === "" ||
            password === "" ||
            confirmPassword === ""
        ) {

            alert("Please fill in all fields.");

            return;

        }


        if (!email.includes("@")) {

            alert("Please enter a valid email address.");

            return;

        }


        if (password.length < 6) {

            alert(
                "Password must contain at least 6 characters."
            );

            return;

        }


        if (password !== confirmPassword) {

            alert("Passwords do not match.");

            return;

        }


        /* Get existing users */

        const users =
            getData(STORAGE_KEYS.users, []);


        /* Check duplicate email */

        const existingUser =
            users.find(function (user) {

                return user.email === email;

            });


        if (existingUser) {

            alert(
                "An account with this email already exists."
            );

            return;

        }


        /* Create user */

        const newUser = {

            id: generateId(),

            name: name,

            email: email,

            password: password,

            createdAt: new Date().toISOString()

        };


        users.push(newUser);


        saveData(
            STORAGE_KEYS.users,
            users
        );


        alert(
            "Account created successfully!"
        );


        window.location.href = "login.html";

    });

}


/* =========================================================
   LOGIN PAGE
========================================================= */

function initializeLoginPage() {

    const loginForm =
        document.querySelector("#loginForm");


    if (!loginForm) {
        return;
    }


    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const emailInput =
            loginForm.querySelector(
                '[name="email"]'
            );


        const passwordInput =
            loginForm.querySelector(
                '[name="password"]'
            );


        if (!emailInput || !passwordInput) {

            alert(
                "Please make sure your login form uses name=\"email\" and name=\"password\"."
            );

            return;

        }


        const email =
            emailInput.value.trim().toLowerCase();


        const password =
            passwordInput.value;


        if (
            email === "" ||
            password === ""
        ) {

            alert("Please enter your email and password.");

            return;

        }


        const users =
            getData(STORAGE_KEYS.users, []);


        const user =
            users.find(function (user) {

                return (
                    user.email === email &&
                    user.password === password
                );

            });


        if (!user) {

            alert(
                "Invalid email or password."
            );

            return;

        }


        /* Save logged-in user */

        localStorage.setItem(
            STORAGE_KEYS.currentUser,
            user.email
        );


        alert(
            "Welcome back, " + user.name + "!"
        );


        window.location.href =
            "dashboard.html";

    });

}


/* =========================================================
   CREATE BLOG PAGE
========================================================= */

function initializeCreateBlogPage() {

    const createForm =
        document.querySelector("#createBlogForm");


    if (!createForm) {
        return;
    }


    /* Require login */

    if (!isLoggedIn()) {

        alert(
            "Please login before creating a blog post."
        );

        window.location.href =
            "login.html";

        return;

    }


    createForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const titleInput =
            createForm.querySelector(
                '[name="title"]'
            );


        const categoryInput =
            createForm.querySelector(
                '[name="category"]'
            );


        const contentInput =
            createForm.querySelector(
                '[name="content"]'
            );


        if (
            !titleInput ||
            !categoryInput ||
            !contentInput
        ) {

            alert(
                "Your form needs title, category and content fields."
            );

            return;

        }


        const title =
            titleInput.value.trim();


        const category =
            categoryInput.value.trim();


        const content =
            contentInput.value.trim();


        /* Validation */

        if (
            title === "" ||
            category === "" ||
            content === ""
        ) {

            alert(
                "Please complete all blog fields."
            );

            return;

        }


        if (title.length < 5) {

            alert(
                "Blog title should contain at least 5 characters."
            );

            return;

        }


        if (content.length < 20) {

            alert(
                "Your blog content should contain at least 20 characters."
            );

            return;

        }


        /* Get existing posts */

        const posts =
            getData(STORAGE_KEYS.posts, []);


        /* Create excerpt */

        const excerpt =
            content.length > 120
                ? content.substring(0, 120) + "..."
                : content;


        /* Create post */

        const newPost = {

            id: generateId(),

            title: title,

            category: category,

            content: content,

            excerpt: excerpt,

            author: getCurrentUser(),

            createdAt: new Date().toISOString()

        };


        posts.push(newPost);


        saveData(
            STORAGE_KEYS.posts,
            posts
        );


        alert(
            "Your blog post has been published!"
        );


        createForm.reset();


        window.location.href =
            "dashboard.html";

    });

}


/* =========================================================
   DASHBOARD PAGE
========================================================= */

function initializeDashboardPage() {

    /* Require login */

    if (!isLoggedIn()) {

        alert(
            "Please login to access your dashboard."
        );

        window.location.href =
            "login.html";

        return;

    }


    displayDashboardUser();

    displayDashboardStats();

    displayDashboardPosts();

}


/* =========================================================
   DASHBOARD - USER
========================================================= */

function displayDashboardUser() {

    const userEmail =
        getCurrentUser();


    const users =
        getData(STORAGE_KEYS.users, []);


    const user =
        users.find(function (user) {

            return user.email === userEmail;

        });


    if (!user) {
        return;
    }


    const userNameElements =
        document.querySelectorAll(
            ".current-user-name"
        );


    userNameElements.forEach(function (element) {

        element.textContent =
            user.name;

    });


    const userEmailElements =
        document.querySelectorAll(
            ".current-user-email"
        );


    userEmailElements.forEach(function (element) {

        element.textContent =
            user.email;

    });

}


/* =========================================================
   DASHBOARD - STATS
========================================================= */

function displayDashboardStats() {

    const posts =
        getData(STORAGE_KEYS.posts, []);


    const currentUser =
        getCurrentUser();


    const userPosts =
        posts.filter(function (post) {

            return post.author === currentUser;

        });


    const totalPosts =
        document.querySelector("#totalPosts");


    const publishedPosts =
        document.querySelector("#publishedPosts");


    if (totalPosts) {

        totalPosts.textContent =
            userPosts.length;

    }


    if (publishedPosts) {

        publishedPosts.textContent =
            userPosts.length;

    }

}


/* =========================================================
   DASHBOARD - POSTS
========================================================= */

function displayDashboardPosts() {

    const container =
        document.querySelector(
            "#dashboardPosts"
        );


    if (!container) {
        return;
    }


    const posts =
        getData(STORAGE_KEYS.posts, []);


    const currentUser =
        getCurrentUser();


    const userPosts =
        posts
            .filter(function (post) {

                return post.author === currentUser;

            })
            .sort(function (a, b) {

                return new Date(b.createdAt) -
                       new Date(a.createdAt);

            });


    if (userPosts.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No posts yet</h3>

                <p>
                    Start writing your first blog post.
                </p>

                <a
                    href="create-blog.html"
                    class="button button-primary"
                >
                    Create a post
                </a>
            </div>
        `;

        return;

    }


    container.innerHTML = "";


    userPosts.forEach(function (post) {

        const article =
            document.createElement("article");

        article.className = "dashboard-post";


        article.innerHTML = `
            <div class="dashboard-post-info">

                <span class="post-category">
                    ${escapeHTML(post.category)}
                </span>

                <h3>
                    ${escapeHTML(post.title)}
                </h3>

                <p>
                    ${escapeHTML(post.excerpt)}
                </p>

                <small>
                    ${formatDate(post.createdAt)}
                </small>

            </div>

            <div class="dashboard-post-actions">

                <button
                    class="view-post"
                    data-id="${post.id}"
                >
                    View
                </button>

                <button
                    class="delete-post"
                    data-id="${post.id}"
                >
                    Delete
                </button>

            </div>
        `;


        container.appendChild(article);

    });


    /* Delete buttons */

    const deleteButtons =
        container.querySelectorAll(
            ".delete-post"
        );


    deleteButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const postId =
                    button.dataset.id;


                deletePost(postId);

            }
        );

    });


    /* View buttons */

    const viewButtons =
        container.querySelectorAll(
            ".view-post"
        );


    viewButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const postId =
                    button.dataset.id;


                viewFullPost(postId);

            }
        );

    });

}


/* =========================================================
   DASHBOARD - DELETE POST
========================================================= */

function deletePost(postId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this post?"
        );


    if (!confirmed) {
        return;
    }


    const posts =
        getData(STORAGE_KEYS.posts, []);


    const updatedPosts =
        posts.filter(function (post) {

            return post.id !== postId;

        });


    saveData(
        STORAGE_KEYS.posts,
        updatedPosts
    );


    alert(
        "Post deleted successfully."
    );


    /* Refresh dashboard */

    displayDashboardStats();

    displayDashboardPosts();

}


/* =========================================================
   DASHBOARD - VIEW FULL POST
========================================================= */

function viewFullPost(postId) {

    const posts =
        getData(STORAGE_KEYS.posts, []);


    const post =
        posts.find(function (p) {

            return p.id === postId;

        });


    if (!post) {

        alert("Post not found.");

        return;

    }


    /* Create modal */

    const modal =
        document.createElement("div");

    modal.className =
        "post-modal";

    modal.id =
        "postModal";


    modal.innerHTML = `
        <div class="modal-overlay" onclick="closePostModal()"></div>

        <div class="modal-content">

            <button class="modal-close" onclick="closePostModal()">
                ✕
            </button>

            <div class="modal-post">

                <div class="post-header">

                    <span class="post-category">
                        ${escapeHTML(post.category)}
                    </span>

                    <h2>
                        ${escapeHTML(post.title)}
                    </h2>

                    <small>
                        ${formatDate(post.createdAt)}
                    </small>

                </div>

                <div class="post-body">

                    ${escapeHTML(post.content)}

                </div>

            </div>

        </div>
    `;


    document.body.appendChild(modal);


    /* Close modal on Escape key */

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            closePostModal();

        }

    });

}


/* =========================================================
   DASHBOARD - CLOSE POST MODAL
========================================================= */

function closePostModal() {

    const modal =
        document.getElementById("postModal");


    if (modal) {

        modal.remove();

    }

}


/* =========================================================
   OPTIONAL - LOGOUT BUTTON
========================================================= */

document.addEventListener("click", function (event) {

    if (
        event.target.matches(
            "[data-action='logout']"
        )
    ) {

        event.preventDefault();

        logoutUser();

    }

});