(function () {
    if (window.__pageNavigationInitialized) return;
    window.__pageNavigationInitialized = true;

    function getHomeUrl() {
        return '/index.html';
    }

    function goHome(event) {
        if (event) event.preventDefault();
        window.location.href = getHomeUrl();
    }

    function ensureStyles() {
        if (document.getElementById('global-nav-styles')) return;
        const style = document.createElement('style');
        style.id = 'global-nav-styles';
        style.textContent = `
            .global-back-btn {
                position: fixed;
                top: 1rem;
                left: 1rem;
                z-index: 1200;
                background: rgba(15, 23, 42, 0.9);
                border: 1px solid rgba(245, 158, 11, 0.35);
                color: #fbbf24;
                padding: 0.7rem 1rem;
                border-radius: 999px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
                backdrop-filter: blur(8px);
            }
            .global-back-btn:hover {
                transform: translateY(-2px);
                background: rgba(30, 41, 59, 0.95);
            }
            .global-home-link {
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    function addBackButton() {
        if (document.getElementById('globalBackButton')) return;
        const existing = document.querySelector('.back-btn, .nav-back-btn, #backButton, [data-global-back]');
        if (existing) return;

        ensureStyles();
        const button = document.createElement('button');
        button.id = 'globalBackButton';
        button.className = 'global-back-btn';
        button.type = 'button';
        button.innerHTML = '<i class="fas fa-arrow-left"></i> Back';
        button.addEventListener('click', (event) => {
            event.preventDefault();
            if (window.history.length > 1 && document.referrer) {
                window.history.back();
            } else {
                goHome();
            }
        });
        document.body.prepend(button);
    }

    function wireHomeHeaders() {
        const selectors = [
            '.logo',
            '.site-logo',
            '.brand',
            '.branding',
            '.header-logo',
            'header .logo',
            'nav .logo',
            '.top-nav .logo',
            '.nav-brand'
        ];

        const seen = new Set();
        const elements = [];
        selectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el) => {
                if (!seen.has(el)) {
                    seen.add(el);
                    elements.push(el);
                }
            });
        });

        elements.forEach((element) => {
            if (element.dataset.homeWired) return;
            element.classList.add('global-home-link');
            element.addEventListener('click', (event) => goHome(event));
            element.dataset.homeWired = 'true';
        });
    }

    function initializeNavigation() {
        addBackButton();
        wireHomeHeaders();
    }

    document.addEventListener('DOMContentLoaded', initializeNavigation);
    window.addEventListener('load', initializeNavigation);
    window.goHome = goHome;
})();
