let monacoEditor;
let currentTabId = null;
let editorTabs = [];
const STORAGE_KEY = 'structLearnCodeWorkspace';
const TEMPLATE_SNIPPETS = {
    python: `# Python Template\n\ndef main():\n    print('Hello, Struct-Learn!')\n\nif __name__ == '__main__':\n    main()`,
    java: `// Java Template\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Struct-Learn!");\n    }\n}`,
    c: `// C Template\n#include <stdio.h>\n\nint main() {\n    printf("Hello, Struct-Learn!\\n");\n    return 0;\n}`,
    cpp: `// C++ Template\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, Struct-Learn!" << endl;\n    return 0;\n}`,
    javascript: `// JavaScript Template\nconsole.log("Hello, Struct-Learn!");`
};

function initializeCodeEditor() {
    const editorContainer = document.getElementById('editor-container');
    if (!editorContainer) return;

    loadMonaco()
        .then(() => {
            initializeWorkspace();
            setupControls();
            setupKeyboardShortcuts();
        })
        .catch(error => {
            console.error('Monaco initialization failed:', error);
            const placeholder = document.createElement('div');
            placeholder.textContent = 'Unable to load the editor. Please try again later.';
            editorContainer.appendChild(placeholder);
        });
}

function loadMonaco() {
    return new Promise((resolve, reject) => {
        if (window.monaco) {
            resolve(window.monaco);
            return;
        }

        if (!window.require) {
            reject(new Error('Monaco loader not available'));
            return;
        }

        window.require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.40.0/min/vs' } });
        window.require(['vs/editor/editor.main'], () => {
            resolve(window.monaco);
        }, reject);
    });
}

function initializeWorkspace() {
    const saved = loadWorkspace();
    if (saved && saved.tabs && saved.tabs.length) {
        editorTabs = saved.tabs;
        currentTabId = saved.activeTabId || editorTabs[0].id;
    } else {
        const initialTab = createNewTab('main.py', 'python', TEMPLATE_SNIPPETS.python, true);
        editorTabs = [initialTab];
        currentTabId = initialTab.id;
    }

    const languageSelect = document.getElementById('languageSelect');
    languageSelect.value = getCurrentTab().language;
    document.getElementById('currentLanguage').textContent = capitalize(getCurrentTab().language);

    monacoEditor = window.monaco.editor.create(document.getElementById('editor-container'), {
        value: getCurrentTab().content,
        language: getMonacoLanguage(getCurrentTab().language),
        theme: getStoredTheme() === 'dark' ? 'vs-dark' : 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
    });

    monacoEditor.onDidChangeModelContent(() => {
        const tab = getCurrentTab();
        if (!tab) return;
        tab.content = monacoEditor.getValue();
        tab.saved = false;
        renderTabs();
        debounceSave();
    });

    renderTabs();
    renderSnippetList();
    updateThemeLabel();
    highlightConsole('Ready to code.');
}

function setupControls() {
    document.getElementById('newFileBtn').addEventListener('click', () => createNewFile());
    document.getElementById('openFileBtn').addEventListener('click', () => document.getElementById('fileUploadInput').click());
    document.getElementById('fileUploadInput').addEventListener('change', handleFileUpload);
    document.getElementById('downloadBtn').addEventListener('click', downloadCurrentFile);
    document.getElementById('saveBtn').addEventListener('click', saveWorkspace);
    document.getElementById('runBtn').addEventListener('click', executeCode);
    document.getElementById('fileTemplateBtn').addEventListener('click', insertTemplate);
    document.getElementById('languageSelect').addEventListener('change', changeLanguage);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key.toLowerCase() === 's') {
            event.preventDefault();
            saveWorkspace();
        }

        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            executeCode();
        }
    });
}

function createNewTab(title, language, content = '', skipRender = false) {
    const id = `tab-${Date.now()}`;
    const tab = { id, title, language, content, saved: !!skipRender };
    editorTabs.push(tab);
    currentTabId = id;
    if (!skipRender) {
        renderTabs();
        switchTab(id);
    }
    return tab;
}

// Helper to check language value match
function getLanguageFromExtension(ext) {
    if (ext === 'py') return 'python';
    if (ext === 'java') return 'java';
    if (ext === 'c') return 'c';
    if (ext === 'cpp') return 'cpp';
    if (ext === 'js' || ext === 'javascript') return 'javascript';
    return 'python';
}

function createNewFile() {
    const language = document.getElementById('languageSelect').value;
    const extension = getFileExtension(language);
    const count = editorTabs.filter(tab => tab.language === language).length + 1;
    const title = `${language}-${count}.${extension}`;
    const template = TEMPLATE_SNIPPETS[language] || '';
    currentTabId = createNewTab(title, language, template, false).id;
    saveWorkspace();
}

function openFile(path, content, language) {
    const title = path || `untitled-${editorTabs.length + 1}.${getFileExtension(language)}`;
    const tab = createNewTab(title, language, content, false);
    switchTab(tab.id);
    saveWorkspace();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    const language = getLanguageFromExtension(extension);

    const reader = new FileReader();
    reader.onload = () => {
        openFile(file.name, reader.result, language);
        event.target.value = '';
    };
    reader.readAsText(file);
}

function downloadCurrentFile() {
    const current = getCurrentTab();
    if (!current) return;

    const blob = new Blob([current.content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = current.title;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function insertTemplate() {
    const current = getCurrentTab();
    if (!current) return;
    const template = TEMPLATE_SNIPPETS[current.language];
    if (!template) return;
    if (!current.content.trim()) {
        current.content = template;
    } else {
        current.content += '\n\n' + template;
    }
    updateEditorContent(current.content);
    saveWorkspace();
}

function renderSnippetList() {
    const snippetList = document.getElementById('snippet-list');
    snippetList.innerHTML = '';

    Object.entries(TEMPLATE_SNIPPETS).forEach(([lang, snippet]) => {
        const button = document.createElement('button');
        button.className = 'action-button';
        button.textContent = `Insert ${capitalize(lang)} Starter`;
        button.addEventListener('click', () => {
            const current = getCurrentTab();
            if (!current) return;
            current.language = lang;
            document.getElementById('languageSelect').value = lang;
            document.getElementById('currentLanguage').textContent = capitalize(lang);
            updateEditorLanguage(lang);
            current.content = snippet;
            updateEditorContent(snippet);
            saveWorkspace();
        });
        snippetList.appendChild(button);
    });
}

// Function to handle manual language dropdown change
function changeLanguage(event) {
    const nextLanguage = event.target.value;
    const current = getCurrentTab();
    if (!current) return;
    current.language = nextLanguage;
    document.getElementById('currentLanguage').textContent = capitalize(nextLanguage);
    updateEditorLanguage(nextLanguage);
    saveWorkspace();
}

function updateEditorLanguage(language) {
    const monacoLanguage = getMonacoLanguage(language);
    if (monacoEditor && monacoEditor.getModel()) {
        window.monaco.editor.setModelLanguage(monacoEditor.getModel(), monacoLanguage);
    }
}

function updateEditorContent(content) {
    if (!monacoEditor) return;
    monacoEditor.setValue(content);
}

function renderTabs() {
    const tabsContainer = document.getElementById('editor-tabs');
    tabsContainer.innerHTML = '';

    editorTabs.forEach(tab => {
        const item = document.createElement('div');
        item.className = `file-tab ${tab.id === currentTabId ? 'active' : ''}`;
        item.innerHTML = `
            <span>${tab.title}${tab.saved ? '' : ' •'}</span>
            <button title="Close tab">×</button>
        `;

        item.addEventListener('click', () => switchTab(tab.id));
        item.querySelector('button').addEventListener('click', (event) => {
            event.stopPropagation();
            closeTab(tab.id);
        });
        tabsContainer.appendChild(item);
    });
}

function switchTab(tabId) {
    const tab = editorTabs.find(item => item.id === tabId);
    if (!tab) return;
    currentTabId = tabId;
    updateEditorLanguage(tab.language);
    updateEditorContent(tab.content);
    document.getElementById('languageSelect').value = tab.language;
    document.getElementById('currentLanguage').textContent = capitalize(tab.language);
    renderTabs();
}

function closeTab(tabId) {
    const index = editorTabs.findIndex(tab => tab.id === tabId);
    if (index === -1) return;
    editorTabs.splice(index, 1);
    if (currentTabId === tabId) {
        if (editorTabs.length) {
            currentTabId = editorTabs[0].id;
            switchTab(currentTabId);
        } else {
            const freshTab = createNewTab('main.py', 'python', TEMPLATE_SNIPPETS.python, true);
            currentTabId = freshTab.id;
            renderTabs();
            updateEditorContent(freshTab.content);
        }
    } else {
        renderTabs();
    }
    saveWorkspace();
}

function getCurrentTab() {
    return editorTabs.find(tab => tab.id === currentTabId);
}

function getMonacoLanguage(language) {
    if (language === 'python') return 'python';
    if (language === 'java') return 'java';
    if (language === 'c') return 'c';
    if (language === 'cpp') return 'cpp';
    if (language === 'javascript') return 'javascript';
    return 'plaintext';
}

function getFileExtension(language) {
    if (language === 'python') return 'py';
    if (language === 'java') return 'java';
    if (language === 'c') return 'c';
    if (language === 'cpp') return 'cpp';
    if (language === 'javascript') return 'js';
    return 'txt';
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

let saveTimer;
function debounceSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveWorkspace, 700);
}

function saveWorkspace() {
    const payload = {
        tabs: editorTabs,
        activeTabId: currentTabId,
        theme: getStoredTheme(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.textContent = 'Saved';
        setTimeout(() => { saveBtn.textContent = 'Auto Save'; }, 1200);
    }
}

function loadWorkspace() {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        if (!value) return null;
        return JSON.parse(value);
    } catch (error) {
        console.warn('Could not load workspace cache:', error);
        return null;
    }
}

function executeCode() {
    const current = getCurrentTab();
    if (!current) return;

    if (!window.Code || typeof window.Code.executeCode !== 'function') {
        highlightConsole('Execution helper failed to load. Please refresh the page.');
        updateStatusBadge('Error');
        return;
    }

    highlightConsole('Compiling and running, please wait...');
    const stdin = document.getElementById('stdinInput').value || '';

    window.Code.executeCode({ language: current.language, code: current.content, stdin })
        .then(response => {
            highlightConsole(response.output || 'No output returned.');
            if (response.status) {
                updateStatusBadge(response.status);
            }
            if (response.status && response.status.toLowerCase().includes('error')) {
                showSuggestion(response.output);
            }
        })
        .catch(error => {
            highlightConsole(`Execution error: ${error.message}`);
            updateStatusBadge('Error');
        });
}

function highlightConsole(message) {
    const output = document.getElementById('consoleOutput');
    if (!output) return;
    output.textContent = message;
}

function updateStatusBadge(status) {
    const statusText = document.getElementById('runStatus');
    if (statusText) {
        statusText.textContent = status;
    }
}

function showSuggestion(message) {
    if (!message) return;
    const output = document.getElementById('consoleOutput');
    output.textContent = `Suggestion:\n${message}`;
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-demon');
    const theme = isLight ? 'light' : 'dark';
    window.monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    localStorage.setItem('editorTheme', theme);
    updateThemeLabel();
}

function getStoredTheme() {
    return localStorage.getItem('editorTheme') || 'dark';
}

function updateThemeLabel() {
    const label = document.getElementById('themeLabel');
    if (label) {
        label.textContent = getStoredTheme() === 'dark' ? 'Infinity Castle' : 'Butterfly Mansion';
    }

    if (getStoredTheme() === 'light') {
        document.body.classList.add('light-demon');
    } else {
        document.body.classList.remove('light-demon');
    }
}
