// Monaco Editor Manager - loads Monaco Editor from CDN and controls its lifecycle and state

let monacoInstance = null;
let editorInstance = null;

// Map user-friendly language keys to Monaco supported language tags
const languageMap = {
  javascript: 'javascript',
  python: 'python',
  cpp: 'cpp',
  java: 'java',
  sql: 'sql'
};

export const EditorManager = {
  // Initialize Monaco Editor inside the container
  async init(containerEl, initialLang, initialCode, onReady) {
    if (editorInstance) {
      this.destroy();
    }

    if (!window.require) {
      // Dynamic RequireJS loading for Monaco loader
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return new Promise((resolve) => {
      window.require.config({
        paths: {
          vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.43.0/min/vs'
        }
      });

      window.require(['vs/editor/editor.main'], () => {
        monacoInstance = window.monaco;
        
        // Define Custom Carbon/Obsidian Theme
        monacoInstance.editor.defineTheme('obsidian-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
            { token: 'keyword', foreground: '60a5fa', fontStyle: 'bold' },
            { token: 'identifier', foreground: 'f3f4f6' },
            { token: 'string', foreground: '10b981' },
            { token: 'number', foreground: 'f59e0b' },
            { token: 'operator', foreground: '3b82f6' }
          ],
          colors: {
            'editor.background': '#121824',
            'editor.foreground': '#f3f4f6',
            'editor.lineHighlightBackground': '#1a2333',
            'editorLineNumber.foreground': '#4b5563',
            'editorLineNumber.activeForeground': '#3b82f6',
            'editor.selectionBackground': '#233047',
            'editorCursor.foreground': '#3b82f6',
            'editorWidget.background': '#1a2333',
            'editorWidget.border': '#3b82f6',
            'scrollbarSlider.background': '#1a2333',
            'scrollbarSlider.hoverBackground': '#233047',
            'scrollbarSlider.activeBackground': '#3b82f6'
          }
        });

        // Define Light Theme overrides
        monacoInstance.editor.defineTheme('obsidian-light', {
          base: 'vs',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
            { token: 'keyword', foreground: '2563eb', fontStyle: 'bold' },
            { token: 'identifier', foreground: '0f172a' },
            { token: 'string', foreground: '16a34a' },
            { token: 'number', foreground: 'd97706' }
          ],
          colors: {
            'editor.background': '#ffffff',
            'editor.foreground': '#0f172a',
            'editor.lineHighlightBackground': '#f1f5f9',
            'editorLineNumber.foreground': '#94a3b8',
            'editorLineNumber.activeForeground': '#2563eb',
            'editor.selectionBackground': '#e2e8f0',
            'editorCursor.foreground': '#2563eb'
          }
        });

        // Define Monokai Retro Theme
        monacoInstance.editor.defineTheme('monokai-retro', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'f92672', fontStyle: 'bold' },
            { token: 'identifier', foreground: 'f8f8f2' },
            { token: 'string', foreground: 'e6db74' },
            { token: 'number', foreground: 'ae81ff' },
            { token: 'operator', foreground: 'f92672' }
          ],
          colors: {
            'editor.background': '#272822',
            'editor.foreground': '#f8f8f2',
            'editor.lineHighlightBackground': '#3e3d32',
            'editorLineNumber.foreground': '#75715e',
            'editorLineNumber.activeForeground': '#a6e22e',
            'editor.selectionBackground': '#49483e',
            'editorCursor.foreground': '#f8f8f0'
          }
        });

        // Define Cyberpunk Neon Theme
        monacoInstance.editor.defineTheme('cyberpunk-neon', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '7c52a5', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'ff0055', fontStyle: 'bold' },
            { token: 'identifier', foreground: '#00f0ff' },
            { token: 'string', foreground: '#fefe22' },
            { token: 'number', foreground: '#ff00ff' },
            { token: 'operator', foreground: '#00f0ff' }
          ],
          colors: {
            'editor.background': '#0d0015',
            'editor.foreground': '#f5f0fa',
            'editor.lineHighlightBackground': '#19012a',
            'editorLineNumber.foreground': '#7c52a5',
            'editorLineNumber.activeForeground': '#00f0ff',
            'editor.selectionBackground': '#2d004d',
            'editorCursor.foreground': '#ff0055'
          }
        });

        // Define Forest Evergreen Theme
        monacoInstance.editor.defineTheme('forest-evergreen', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '6b8f79', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'fbbf24', fontStyle: 'bold' },
            { token: 'identifier', foreground: '#f2f7f4' },
            { token: 'string', foreground: '#34d399' },
            { token: 'number', foreground: '#f59e0b' },
            { token: 'operator', foreground: '#10b981' }
          ],
          colors: {
            'editor.background': '#0f1712',
            'editor.foreground': '#f2f7f4',
            'editor.lineHighlightBackground': '#1b261f',
            'editorLineNumber.foreground': '#6b8f79',
            'editorLineNumber.activeForeground': '#10b981',
            'editor.selectionBackground': '#2a3d31',
            'editorCursor.foreground': '#10b981'
          }
        });

        // Determine initial theme
        const themeVal = document.body.getAttribute('data-theme') || 'dark';
        let currentTheme = 'obsidian-dark';
        if (themeVal === 'light') currentTheme = 'obsidian-light';
        else if (themeVal === 'monokai') currentTheme = 'monokai-retro';
        else if (themeVal === 'cyberpunk') currentTheme = 'cyberpunk-neon';
        else if (themeVal === 'forest') currentTheme = 'forest-evergreen';

        // Create editor instance
        editorInstance = monacoInstance.editor.create(containerEl, {
          value: initialCode,
          language: languageMap[initialLang] || 'javascript',
          theme: currentTheme,
          fontSize: 14,
          fontFamily: "'Fira Code', Consolas, monospace",
          minimap: { enabled: false },
          automaticLayout: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 16, bottom: 16 },
          roundedSelection: true,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8
          }
        });

        if (onReady) onReady();
        resolve(editorInstance);
      });
    });
  },

  // Set the current code inside Monaco
  setCode(code) {
    if (editorInstance) {
      editorInstance.setValue(code);
    }
  },

  // Get the current code draft
  getCode() {
    return editorInstance ? editorInstance.getValue() : '';
  },

  // Set language mode
  setLanguage(lang) {
    if (editorInstance && monacoInstance) {
      const model = editorInstance.getModel();
      if (model) {
        monacoInstance.editor.setModelLanguage(model, languageMap[lang] || 'javascript');
      }
    }
  },

  // Set editor theme
  setTheme(theme) {
    if (monacoInstance) {
      let monacoTheme = 'obsidian-dark';
      if (theme === 'light') monacoTheme = 'obsidian-light';
      else if (theme === 'monokai') monacoTheme = 'monokai-retro';
      else if (theme === 'cyberpunk') monacoTheme = 'cyberpunk-neon';
      else if (theme === 'forest') monacoTheme = 'forest-evergreen';
      monacoInstance.editor.setTheme(monacoTheme);
    }
  },

  // Update Font Size
  setFontSize(size) {
    if (editorInstance) {
      editorInstance.updateOptions({ fontSize: parseInt(size, 10) });
    }
  },

  // Destroy editor reference
  destroy() {
    if (editorInstance) {
      editorInstance.dispose();
      editorInstance = null;
    }
  }
};
