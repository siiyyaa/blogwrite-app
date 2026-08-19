/* =========================================================
   BLOGWRITE - SHARED JAVASCRIPT
   Frontend connected to Node.js + Express backend

   Pages:
   1. home.html
   2. dashboard.html
   3. create-blog.html
   4. login.html
   5. register.html

   Backend:
   http://localhost:5000
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL = "http://localhost:5000";


/* =========================================================
   LOCAL STORAGE
========================================================= */

const STORAGE_KEYS = {
    currentUser: "blogwrite_current_user"
};


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function generateId() {

    return Date.now().toString();

}


function getCurrentUser() {

    const user =
        localStorage.getItem(STORAGE_KEYS.currentUser);

    if (!user) {
        return null;
    }

    try {

        return JSON.parse(user);

    } catch (error) {

        return null;

    }

}


function isLoggedIn() {

    return getCurrentUser() !== null;

}


function saveCurrentUser(user) {

    localStorage.setItem(
        STORAGE_KEYS.currentUser,
        JSON.stringify(user)
    );

}


function clearCurrentUser() {

    localStorage.removeItem(
        STORAGE_KEYS.currentUser
    );

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;

}


function formatDate(date) {

    return new Date(date).toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================================================
   PAGE DETECTION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

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

        if (
            currentPage === "home.html" ||
            currentPage === ""
        ) {

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

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    const navToggle =
        document.getElementById("navToggle");

    const siteNav =
        document.querySelector(".site-nav");


    if (navToggle && siteNav) {

        navToggle.addEventListener(
            "click",
            function () {

                siteNav.classList.toggle("open");

            }
        );

    }


    const navLinks =
        document.querySelectorAll(
            ".site-nav a"
        );


    navLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    if (siteNav) {

                        siteNav.classList.remove(
                            "open"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   SMOOTH SCROLLING
========================================================= */

function initializeSmoothScrolling() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    links.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const targetId =
                        link.getAttribute("href");


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (target) {

                        event.preventDefault();

                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }
            );

        }
    );

}


/* =========================================================
   LOGIN / LOGOUT NAVIGATION
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

        loginLinks.forEach(
            function (link) {

                link.textContent =
                    "Logout";

                link.href =
                    "#";

                link.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        logoutUser();

                    }
                );

            }
        );


        registerLinks.forEach(
            function (link) {

                link.textContent =
                    "Dashboard";

                link.href =
                    "dashboard.html";

            }
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

    clearCurrentUser();

    alert(
        "You have been logged out."
    );

    window.location.href =
        "home.html";

}


/* =========================================================
   CURRENT YEAR
========================================================= */

function updateCurrentYear() {

    const yearElements =
        document.querySelectorAll(
            ".current-year"
        );


    yearElements.forEach(
        function (element) {

            element.textContent =
                new Date().getFullYear();

        }
    );

}


/* =========================================================
   HOME PAGE
========================================================= */

function initializeHomePage() {

    /*
       Your homepage currently contains
       static posts.

       We leave them in place.
    */

}


/* =========================================================
   REGISTER PAGE
   CONNECTED TO:
   POST /api/auth/register
========================================================= */

function initializeRegisterPage() {

    const registerForm = document.getElementById("registerForm");

    if (!registerForm) {
        return;
    }

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput =
            document.getElementById("confirm-password");

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        /* Validate */

        if (!name || !email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (password.length < 6) {
            alert("Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            console.log("Register response:", data);

            if (!response.ok) {

                alert(
                    data.message ||
                    "Registration failed."
                );

                return;
            }

            /* Registration successful */

            saveCurrentUser(
                data.user
            );

            alert("Account created successfully!");

            /* Redirect to dashboard */

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            alert(
                "Unable to connect to the server. Make sure your Node.js server is running."
            );
        }

    });
}


/* =========================================================
   LOGIN PAGE
   CONNECTED TO:
   POST /api/auth/login
========================================================= */

function initializeLoginPage() {

    const loginForm =
        document.querySelector(
            "#loginForm"
        );


    if (!loginForm) {

        return;

    }


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* Get fields */

            const emailInput =
                loginForm.querySelector(
                    '[name="email"]'
                );


            const passwordInput =
                loginForm.querySelector(
                    '[name="password"]'
                );


            if (
                !emailInput ||
                !passwordInput
            ) {

                alert(
                    "Login form fields are missing."
                );

                return;

            }


            /* Get values */

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            /* Validation */

            if (
                !email ||
                !password
            ) {

                alert(
                    "Please enter your email and password."
                );

                return;

            }


            /* Send request */

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                /* Login failed */

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Login failed."
                    );

                    return;

                }


                /* Save logged-in user */

                saveCurrentUser(
                    data.user
                );


                alert(
                    "Welcome back, " +
                    data.user.name +
                    "!"
                );


                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                alert(
                    "Unable to connect to the server. Please make sure your backend is running on port 5000."
                );

            }

        }
    );

}


/* =========================================================
   CREATE BLOG
   CONNECTED TO:
   POST /api/blogs
========================================================= */

function initializeCreateBlogPage() {

    /*
       Your current HTML may use either
       #createBlogForm or #blogForm.
    */

    const createForm =
        document.querySelector(
            "#createBlogForm"
        ) ||
        document.querySelector(
            "#blogForm"
        );


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


    createForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* Find fields */

            const titleInput =
                createForm.querySelector(
                    '[name="title"]'
                ) ||
                document.getElementById(
                    "blogTitle"
                );


            const categoryInput =
                createForm.querySelector(
                    '[name="category"]'
                ) ||
                document.getElementById(
                    "blogCategory"
                );


            const contentInput =
                createForm.querySelector(
                    '[name="content"]'
                ) ||
                document.getElementById(
                    "blogContent"
                );


            if (
                !titleInput ||
                !categoryInput ||
                !contentInput
            ) {

                alert(
                    "Please make sure your blog form has title, category and content fields."
                );

                return;

            }


            /* Values */

            const title =
                titleInput.value.trim();


            const category =
                categoryInput.value.trim();


            const content =
                contentInput.value.trim();


            /* Validation */

            if (
                !title ||
                !content
            ) {

                alert(
                    "Please enter a title and blog content."
                );

                return;

            }


            if (
                title.length < 5
            ) {

                alert(
                    "Blog title should contain at least 5 characters."
                );

                return;

            }


            if (
                content.length < 20
            ) {

                alert(
                    "Blog content should contain at least 20 characters."
                );

                return;

            }


            /* Current user */

            const currentUser =
                getCurrentUser();


            const author =
                currentUser
                    ? currentUser.name
                    : "Anonymous";


            /* Send blog to backend */

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/blogs`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                title: title,

                                category:
                                    category ||
                                    "General",

                                content: content,

                                author: author

                            })
                        }
                    );


                const data =
                    await response.json();


                /* API error */

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Unable to create blog."
                    );

                    return;

                }


                /* Success */

                alert(
                    "Your blog post has been published!"
                );


                createForm.reset();


                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Create blog error:",
                    error
                );


                alert(
                    "Unable to connect to the server. Please make sure your backend is running on port 5000."
                );

            }

        }
    );

}


/* =========================================================
   DASHBOARD
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
   DASHBOARD USER
========================================================= */

function displayDashboardUser() {

    const currentUser =
        getCurrentUser();


    if (!currentUser) {

        return;

    }


    const userNameElements =
        document.querySelectorAll(
            ".current-user-name"
        );


    userNameElements.forEach(
        function (element) {

            element.textContent =
                currentUser.name;

        }
    );


    const userEmailElements =
        document.querySelectorAll(
            ".current-user-email"
        );


    userEmailElements.forEach(
        function (element) {

            element.textContent =
                currentUser.email;

        }
    );

}


/* =========================================================
   DASHBOARD STATS
========================================================= */

async function displayDashboardStats() {

    /*
       Stats will be connected to the backend
       once GET /api/blogs is added.

       For now we display 0 because your
       backend currently only has POST /api/blogs.
    */

    const totalPosts =
        document.querySelector(
            "#totalPosts"
        );


    const publishedPosts =
        document.querySelector(
            "#publishedPosts"
        );


    if (totalPosts) {

        totalPosts.textContent =
            "0";

    }


    if (publishedPosts) {

        publishedPosts.textContent =
            "0";

    }

}


/* =========================================================
   DASHBOARD POSTS
========================================================= */

function displayDashboardPosts() {

    /*
       Your current backend does not yet
       have GET /api/blogs.

       Therefore posts cannot be fetched
       from blogs.json by the browser yet.
    */

    const container =
        document.querySelector(
            "#dashboardPosts"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `
        <div class="empty-state">

            <h3>Your posts will appear here</h3>

            <p>
                Create a blog post to get started.
            </p>

            <a
                href="create-blog.html"
                class="button button-primary"
            >
                Create a post
            </a>

        </div>
    `;

}


/* =========================================================
   OPTIONAL LOGOUT BUTTON
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.matches(
                "[data-action='logout']"
            )
        ) {

            event.preventDefault();

            logoutUser();

        }

    }
);