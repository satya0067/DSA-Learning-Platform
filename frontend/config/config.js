// Configuration
const CONFIG = {
    API_BASE_URL: (typeof window !== 'undefined' && window.location.protocol === 'file:') ? 'http://localhost:3000/api' : '/api',
    APP_NAME: 'Struct-Learn',
    VERSION: '1.0.0',
    THEME: localStorage.getItem('theme') || 'light'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}