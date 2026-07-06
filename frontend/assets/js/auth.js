// Authentication Logic - Login and Register

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const submitButton = event.target.querySelector('button[type="submit"]');

    hideMessage('loginMessage');

    if (!email || !password) {
        return showMessage('loginMessage', 'Please fill in all fields.', 'error');
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
    }

    Auth.login({ email, password })
        .then(response => {
            localStorage.setItem('token', response.token);
            showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 900);
        })
        .catch(error => {
            console.error('Login error:', error);
            showMessage('loginMessage', 'Login failed: ' + (error.message || 'Please try again.'), 'error');
        })
        .finally(() => {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Login & Enter Corps';
            }
        });
}

function showMessage(elementId, message, type = 'info') {
    const messageEl = document.getElementById(elementId);
    if (!messageEl) {
        alert(message);
        return;
    }
    messageEl.textContent = message;
    messageEl.className = `message-box ${type}`;
    messageEl.style.display = 'block';
}

function hideMessage(elementId) {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.style.display = 'none';
    }
}

function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitButton = event.target.querySelector('button[type="submit"]');

    hideMessage('registerMessage');

    if (!username || !email || !password || !confirmPassword) {
        return showMessage('registerMessage', 'Please fill in all fields.', 'error');
    }

    if (password !== confirmPassword) {
        return showMessage('registerMessage', 'Passwords do not match.', 'error');
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Registering...';
    }

    Auth.register({ username, email, password })
        .then(response => {
            showMessage('registerMessage', response.message || 'Registration successful! Login with your new account.', 'success');
            setTimeout(() => {
                const loginTab = document.getElementById('authTabLogin');
                if (loginTab) loginTab.click();
            }, 1200);
        })
        .catch(error => {
            console.error('Registration error:', error);
            showMessage('registerMessage', 'Registration failed: ' + (error.message || 'Please try again.'), 'error');
        })
        .finally(() => {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Register Now';
            }
        });
}

function setupAuthTabs() {
    const loginTab = document.getElementById('authTabLogin');
    const registerTab = document.getElementById('authTabRegister');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');

    if (!loginTab || !registerTab || !loginSection || !registerSection) {
        return;
    }

    function showLogin() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginSection.classList.add('active');
        registerSection.classList.remove('active');
        hideMessage('loginMessage');
        hideMessage('registerMessage');
    }

    function showRegister() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerSection.classList.add('active');
        loginSection.classList.remove('active');
        hideMessage('loginMessage');
        hideMessage('registerMessage');
    }

    loginTab.addEventListener('click', showLogin);
    registerTab.addEventListener('click', showRegister);

    if (window.location.hash === '#register') {
        showRegister();
    } else {
        showLogin();
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/pages/auth/login.html';
}