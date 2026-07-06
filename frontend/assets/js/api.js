// API Configuration and Calls
const API_BASE_URL = (() => {
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        return 'http://localhost:3000/api';
    }
    return '/api';
})();

// Generic API Call Handler
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Only add authorization header if user is logged in (has a token)
    // Don't add it for auth endpoints (/auth/register, /auth/login)
    const token = localStorage.getItem('token');
    if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
            console.error(`API Error (${response.status}):`, errorMsg);
            throw new Error(errorMsg);
        }
        return await response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.error('API Connection Error:', `Cannot connect to ${API_BASE_URL}${endpoint}`);
            console.error('Make sure the backend server is running on port 3000');
        } else {
            console.error('API Error:', error);
        }
        throw error;
    }
}

// Auth Endpoints
const Auth = {
    register: (userData) => apiCall('/auth/register', 'POST', userData),
    login: (credentials) => apiCall('/auth/login', 'POST', credentials),
    getProfile: () => apiCall('/auth/profile', 'GET'),
    updateProfile: (profileData) => apiCall('/auth/profile', 'PUT', profileData),
    changePassword: (passwordData) => apiCall('/auth/change-password', 'PUT', passwordData),
    forgotPassword: (passwordData) => apiCall('/auth/forgot-password', 'PUT', passwordData)
};

// Progress Endpoints
const Progress = {
    getProgress: () => apiCall('/progress'),
    updateProgress: (progressData) => apiCall('/progress', 'POST', progressData)
};

// Quiz Endpoints
const Quiz = {
    getQuizzes: () => apiCall('/quiz'),
    getRandomQuiz: (params) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return apiCall(`/quiz/random${query}`);
    },
    createQuiz: (quizData) => apiCall('/quiz', 'POST', quizData),
    getQuizById: (id) => apiCall(`/quiz/${id}`),
    submitQuiz: (id, answers) => apiCall(`/quiz/submit/${id}`, 'POST', { answers })
};

// Code Execution Endpoints
const Code = {
    executeCode: (codeData) => apiCall('/code/execute', 'POST', codeData),
    getCodeHistory: () => apiCall('/code/history')
};

// Practice module APIs
const Problems = {
    getProblems: (params) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return apiCall(`/problems${query}`);
    },
    getProblemById: (id) => apiCall(`/problems/${id}`),
    createProblem: (data) => apiCall('/problems', 'POST', data),
    updateProblem: (id, data) => apiCall(`/problems/${id}`, 'PUT', data),
    deleteProblem: (id) => apiCall(`/problems/${id}`, 'DELETE')
};

const Submissions = {
    runCode: (data) => apiCall('/submissions/run', 'POST', data),
    submitCode: (data) => apiCall('/submissions/submit', 'POST', data),
    getHistory: (problemId) => apiCall(`/submissions/history/${problemId}`)
};

const Bookmarks = {
    getBookmarks: () => apiCall('/bookmarks'),
    toggleBookmark: (problemId, listName) => apiCall('/bookmarks/toggle', 'POST', { problemId, listName })
};

const Notes = {
    getNote: (problemId) => apiCall(`/notes/${problemId}`),
    saveNote: (data) => apiCall('/notes', 'POST', data),
    deleteNote: (problemId) => apiCall(`/notes/${problemId}`, 'DELETE')
};

const Discussions = {
    getDiscussions: (problemId) => apiCall(`/discussions/problem/${problemId}`),
    getDiscussionById: (id) => apiCall(`/discussions/thread/${id}`),
    createDiscussion: (data) => apiCall('/discussions', 'POST', data),
    createComment: (threadId, data) => apiCall(`/discussions/thread/${threadId}/comments`, 'POST', data),
    likeDiscussion: (id) => apiCall(`/discussions/thread/${id}/like`, 'POST'),
    likeComment: (id) => apiCall(`/discussions/comment/${id}/like`, 'POST')
};

const Leaderboards = {
    getLeaderboard: (type) => apiCall(`/leaderboard?type=${type || 'xp'}`),
    getEditorial: (problemId) => apiCall(`/leaderboard/editorial/${problemId}`)
};

const Contests = {
    getContests: () => apiCall('/contests'),
    getContestById: (id) => apiCall(`/contests/${id}`),
    joinContest: (id) => apiCall(`/contests/${id}/join`, 'POST'),
    createContest: (data) => apiCall('/contests', 'POST', data)
};

const Challenges = {
    getDailyChallenge: () => apiCall('/challenges/daily'),
    getWeeklyChallenge: () => apiCall('/challenges/weekly'),
    getAchievements: () => apiCall('/challenges/achievements')
};

const Notifications = {
    getNotifications: () => apiCall('/notifications'),
    markAllRead: () => apiCall('/notifications/read-all', 'POST')
};

// Expose API helpers globally so page scripts can use them reliably.
window.Auth = Auth;
window.Progress = Progress;
window.Quiz = Quiz;
window.Code = Code;
window.Problems = Problems;
window.Submissions = Submissions;
window.Bookmarks = Bookmarks;
window.Notes = Notes;
window.Discussions = Discussions;
window.Leaderboards = Leaderboards;
window.Contests = Contests;
window.Challenges = Challenges;
window.Notifications = Notifications;

