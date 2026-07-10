// Main Global Logic
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadComponents();
});

function initializeApp() {
    console.log('App Initialized');
    // Initialize theme
    loadTheme();
    // Initialize user session
    checkAuthStatus();
}

function loadComponents() {
    // Load navbar
    loadNavbar();
    // Load footer
    loadFooter();
}

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-theme', theme === 'dark');
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('User not authenticated');
    } else {
        console.log('User authenticated');
    }
}

function loadNavbar() {
    const navbar = document.getElementById('navbar');
    const token = localStorage.getItem('token');
    if (navbar) {
        navbar.innerHTML = `
            <nav>
                <div class="nav-left">
                    <button id="backButton" class="nav-back-btn" type="button">← Back</button>
                    <a href="/index.html" class="logo">Struct-Learn</a>
                </div>
                <ul class="nav-links">
                    <li><a href="/pages/dashboard/dashboard.html">Dashboard</a></li>
                    <li><a href="/pages/practice/practice.html">Practice</a></li>
                    <li><a href="/code-editor/index.html">Editor</a></li>
                    <li><a href="/pages/quiz/quiz.html">Quiz</a></li>
                    <li><a href="/pages/profile/profile.html">Profile</a></li>
                    ${token ? '<li><a href="#" id="logoutLink">Logout</a></li>' : '<li><a href="/pages/auth/login.html">Login</a></li><li><a href="/pages/auth/login.html#register">Register</a></li>'}
                </ul>
            </nav>
        `;

        const backButton = document.getElementById('backButton');
        if (backButton) {
            const canGoBack = window.history.length > 1 && window.location.pathname !== '/index.html' && window.location.pathname !== '/';
            backButton.style.display = canGoBack ? 'inline-flex' : 'none';
            backButton.addEventListener('click', (event) => {
                event.preventDefault();
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = '/index.html';
                }
            });
        }

        if (token) {
            const logoutLink = document.getElementById('logoutLink');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    logout();
                });
            }
        }
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/pages/auth/login.html';
}


function loadFooter() {
    const footer = document.getElementById('footer');
    if (footer) {
        footer.innerHTML = `
            <footer>
                <p>&copy; 2024 Struct-Learn. All rights reserved.</p>
            </footer>
        `;
    }
}