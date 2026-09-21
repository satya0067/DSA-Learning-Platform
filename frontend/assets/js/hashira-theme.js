/**
 * =========================================================
 * STRUCT-LEARN · GLOBAL HASHIRA THEME ENGINE
 * Manages 6 Breathing Themes across the entire platform
 * Themes: Flame (🔥), Water (💧), Thunder (⚡), Mist (🌙), Wind (💨), Sun (☀️)
 * =========================================================
 */

(function () {
    const STORAGE_KEY = 'selectedHashiraTheme';
    const VALID_THEMES = ['flame', 'water', 'thunder', 'mist', 'wind', 'sun'];
    const DEFAULT_THEME = 'flame';

    const THEME_METADATA = {
        flame: { key: 'flame', name: 'Flame Hashira', kanji: '炎', color: '#ff4d2e', icon: 'fa-fire' },
        water: { key: 'water', name: 'Water Hashira', kanji: '水', color: '#2e9eff', icon: 'fa-tint' },
        thunder: { key: 'thunder', name: 'Thunder Hashira', kanji: '雷', color: '#ffd966', icon: 'fa-bolt' },
        mist: { key: 'mist', name: 'Mist Hashira', kanji: '霞', color: '#b8a9ff', icon: 'fa-moon' },
        wind: { key: 'wind', name: 'Wind Hashira', kanji: '風', color: '#5fdc7a', icon: 'fa-wind' },
        sun: { key: 'sun', name: 'Sun Hashira', kanji: '日', color: '#ffaa33', icon: 'fa-sun' }
    };

    function getStoredTheme() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && VALID_THEMES.includes(saved.toLowerCase())) {
                return saved.toLowerCase();
            }
        } catch (e) {
            console.warn('Unable to access localStorage for theme:', e);
        }
        return DEFAULT_THEME;
    }

    function applyThemeToDom(themeKey) {
        if (!VALID_THEMES.includes(themeKey)) {
            themeKey = DEFAULT_THEME;
        }

        // Apply attribute to <html> for immediate CSS variable adoption
        if (document.documentElement) {
            document.documentElement.setAttribute('data-theme', themeKey);
        }

        // Apply class to <body> if DOM is ready
        if (document.body) {
            VALID_THEMES.forEach(t => document.body.classList.remove('hashira-' + t));
            document.body.classList.add('hashira-' + themeKey);
        }

        // Update selector container border class if present
        document.querySelectorAll('.hashira-selector').forEach(sel => {
            VALID_THEMES.forEach(t => sel.classList.remove('hashira-' + t));
            sel.classList.add('hashira-' + themeKey);
        });

        // Update active state in all .hashira-option elements across the page
        document.querySelectorAll('.hashira-option').forEach(opt => {
            const optTheme = opt.getAttribute('data-hashira');
            const isActive = optTheme === themeKey;
            opt.classList.toggle('active', isActive);
            if (isActive && THEME_METADATA[themeKey]) {
                opt.style.color = THEME_METADATA[themeKey].color;
                opt.style.borderColor = THEME_METADATA[themeKey].color;
            } else {
                opt.style.color = '';
                opt.style.borderColor = '';
            }
        });

        // Trigger custom event for visualizers/particles
        window.dispatchEvent(new CustomEvent('hashiraThemeChanged', {
            detail: { theme: themeKey, metadata: THEME_METADATA[themeKey] }
        }));
    }

    function setHashiraTheme(themeKey) {
        if (!VALID_THEMES.includes(themeKey)) {
            console.error(`Invalid theme: ${themeKey}. Valid themes:`, VALID_THEMES);
            return;
        }
        try {
            localStorage.setItem(STORAGE_KEY, themeKey);
        } catch (e) {
            console.warn('Failed to persist theme in localStorage:', e);
        }
        applyThemeToDom(themeKey);
    }

    function createSelectorHTML() {
        return `
        <div class="hashira-selector hashira-${getStoredTheme()}" id="globalHashiraSelector">
            <div class="hashira-option ${getStoredTheme() === 'flame' ? 'active' : ''}" data-hashira="flame">
                <i class="fas fa-fire"></i>
                <span class="tooltip">Flame · Rengoku</span>
            </div>
            <div class="hashira-option ${getStoredTheme() === 'water' ? 'active' : ''}" data-hashira="water">
                <i class="fas fa-tint"></i>
                <span class="tooltip">Water · Giyu</span>
            </div>
            <div class="hashira-option ${getStoredTheme() === 'thunder' ? 'active' : ''}" data-hashira="thunder">
                <i class="fas fa-bolt"></i>
                <span class="tooltip">Thunder · Zenitsu</span>
            </div>
            <div class="hashira-option ${getStoredTheme() === 'mist' ? 'active' : ''}" data-hashira="mist">
                <i class="fas fa-moon"></i>
                <span class="tooltip">Mist · Muichiro</span>
            </div>
            <div class="hashira-option ${getStoredTheme() === 'wind' ? 'active' : ''}" data-hashira="wind">
                <i class="fas fa-wind"></i>
                <span class="tooltip">Wind · Sanemi</span>
            </div>
            <div class="hashira-option ${getStoredTheme() === 'sun' ? 'active' : ''}" data-hashira="sun">
                <i class="fas fa-sun"></i>
                <span class="tooltip">Sun · Yoriichi</span>
            </div>
        </div>
        `;
    }

    // Global click delegation for hashira options
    document.addEventListener('click', (e) => {
        const option = e.target.closest('.hashira-option');
        if (option) {
            const theme = option.getAttribute('data-hashira');
            if (theme && VALID_THEMES.includes(theme)) {
                setHashiraTheme(theme);
            }
        }
    });

    // Apply theme immediately as early as possible
    const current = getStoredTheme();
    applyThemeToDom(current);

    // Apply again when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyThemeToDom(getStoredTheme()));
    } else {
        applyThemeToDom(current);
    }

    // Sync theme across browser tabs in real-time
    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
            applyThemeToDom(event.newValue);
        }
    });

    // Expose global API
    window.HashiraTheme = {
        get: getStoredTheme,
        set: setHashiraTheme,
        getAll: () => THEME_METADATA,
        createSelectorHTML: createSelectorHTML,
        themes: VALID_THEMES
    };
})();
