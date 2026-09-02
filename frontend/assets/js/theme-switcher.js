(function () {
    const themePages = [
        { value: 'default', label: 'Demon Slayer', file: 'index.html', icon: 'fa-dragon' },
        { value: 'solar', label: 'Solar Breath', file: 'index2.html', icon: 'fa-sun' },
        { value: 'shadow', label: 'Shadow Hashira', file: 'index3.html', icon: 'fa-terminal' },
        { value: 'thunder', label: 'Thunder Breath', file: 'index4.html', icon: 'fa-bolt' },
        { value: 'mist', label: 'Mist Hashira', file: 'index5.html', icon: 'fa-wind' },
        { value: 'beast', label: 'Beast Breathing', file: 'index6.html', icon: 'fa-paw' }
    ];

    const featureLinks = [
        { href: 'pages/dashboard/dashboard.html', icon: 'fa-tachometer-alt', label: 'Dashboard' },
        { href: 'pages/practice/practice.html', icon: 'fa-keyboard', label: 'Practice' },
        { href: 'pages/quiz/quiz.html', icon: 'fa-book', label: 'Quiz' },
        { href: 'pages/practice/contests.html', icon: 'fa-trophy', label: 'Contests' },
        { href: 'pages/practice/roadmaps.html', icon: 'fa-map-signs', label: 'Roadmaps' },
        { href: 'pages/profile/profile.html', icon: 'fa-user', label: 'Profile' },
        { href: 'pages/editor/editor.html', icon: 'fa-code', label: 'Editor' }
    ];

    if (document.querySelector('.theme-switcher')) return;

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const currentTheme = themePages.find(item => item.file === currentFile) || themePages[0];

    const nav = document.querySelector('nav.demon-nav') || document.querySelector('nav') || document.querySelector('.main-wrapper');
    const navActions = nav?.querySelector('.nav-actions') || nav?.querySelector('div[class*="flex"]') || nav?.querySelector('.nav-links') || nav;

    const loginPath = 'pages/auth/login.html';
    const loginControls = Array.from(document.querySelectorAll('#loginBtn, #loginLink, [data-login="true"], button, a')).filter((control) => {
        const text = (control.textContent || '').trim().toLowerCase();
        return control.id === 'loginBtn' || control.id === 'loginLink' || control.getAttribute('data-login') === 'true' || text.includes('login') || text.includes('signin') || text.includes('sign in');
    });

    loginControls.forEach((control) => {
        if (control.dataset.loginBound === 'true') return;
        control.dataset.loginBound = 'true';

        const goToLogin = (event) => {
            if (event) event.preventDefault();
            window.location.href = loginPath;
        };

        const token = localStorage.getItem('token');
        if (token) {
            control.textContent = 'Logout';
            control.setAttribute('href', '#');
            control.setAttribute('data-login', 'true');
            control.addEventListener('click', (event) => {
                event.preventDefault();
                localStorage.removeItem('token');
                window.location.reload();
            });
            return;
        }

        if (control.tagName.toLowerCase() === 'button') {
            control.type = 'button';
            control.addEventListener('click', goToLogin);
        } else {
            control.setAttribute('href', loginPath);
            control.addEventListener('click', goToLogin);
        }
    });

    const switcherWrap = document.createElement('div');
    switcherWrap.className = 'theme-switcher';
    switcherWrap.setAttribute('data-theme-switcher', 'true');
    switcherWrap.style.display = 'inline-flex';
    switcherWrap.style.alignItems = 'center';
    switcherWrap.style.gap = '0.4rem';
    switcherWrap.style.marginRight = '0.4rem';

    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Switch homepage theme');
    select.style.padding = '0.35rem 0.6rem';
    select.style.borderRadius = '999px';
    select.style.border = '1px solid rgba(255,255,255,0.12)';
    select.style.background = 'rgba(255,255,255,0.08)';
    select.style.color = '#f7efe7';
    select.style.fontWeight = '600';
    select.style.fontSize = '0.78rem';
    select.style.cursor = 'pointer';

    themePages.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme.file;
        option.textContent = theme.label;
        if (theme.file === currentFile) option.selected = true;
        select.appendChild(option);
    });

    select.addEventListener('change', (event) => {
        const targetFile = event.target.value;
        localStorage.setItem('structLearnCurrentTheme', targetFile);
        window.location.href = targetFile;
    });

    const label = document.createElement('span');
    label.textContent = 'Theme';
    label.style.fontSize = '0.72rem';
    label.style.fontWeight = '700';
    label.style.textTransform = 'uppercase';
    label.style.letterSpacing = '0.08em';
    label.style.color = 'rgba(255,255,255,0.78)';

    switcherWrap.appendChild(label);
    switcherWrap.appendChild(select);

    const featureWrap = document.createElement('div');
    featureWrap.className = 'theme-feature-links';
    featureWrap.style.display = 'inline-flex';
    featureWrap.style.alignItems = 'center';
    featureWrap.style.gap = '0.35rem';
    featureWrap.style.flexWrap = 'wrap';

    featureLinks.forEach(linkData => {
        const link = document.createElement('a');
        link.href = linkData.href;
        link.title = linkData.label;
        link.innerHTML = `<i class="fas ${linkData.icon}"></i>`;
        link.style.display = 'inline-flex';
        link.style.alignItems = 'center';
        link.style.justifyContent = 'center';
        link.style.width = '34px';
        link.style.height = '34px';
        link.style.borderRadius = '50%';
        link.style.background = 'rgba(255,255,255,0.08)';
        link.style.color = '#f7efe7';
        link.style.textDecoration = 'none';
        link.style.border = '1px solid rgba(255,255,255,0.12)';
        link.style.transition = 'transform 0.2s ease, background 0.2s ease';
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-2px)';
            link.style.background = 'rgba(255, 103, 57, 0.2)';
        });
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0)';
            link.style.background = 'rgba(255,255,255,0.08)';
        });
        featureWrap.appendChild(link);
    });

    const existingThemeSwitcher = navActions.querySelector('[data-theme-switcher]');
    const existingFeatureLinks = navActions.querySelector('.theme-feature-links');

    if (!existingThemeSwitcher) {
        navActions.appendChild(switcherWrap);
    }
    if (!existingFeatureLinks) {
        navActions.appendChild(featureWrap);
    }

    const storedTheme = localStorage.getItem('structLearnCurrentTheme');
    if (storedTheme && storedTheme !== currentFile) {
        const savedOption = Array.from(select.options).find(option => option.value === storedTheme);
        if (savedOption) {
            select.value = storedTheme;
        }
    }
})();
