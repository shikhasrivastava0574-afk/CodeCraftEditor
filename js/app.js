import { initialQuestions } from './questions.js';
import { dsaQuestions } from './dsa_sheet.js';
import { EditorManager } from './editor.js';
import { runJavaScript, runPython, runMockCompiler, isEqual } from './runner.js';
import { subjectNotes } from './subjects_notes.js';

// Syntax Reference Cheatsheets Dictionary
const referenceSheets = {
  js: `// 1. Loops & Iteration
for (let i = 0; i < arr.length; i++) { ... }
for (let item of arr) { ... } // Array values
for (let key in obj) { ... }  // Object keys

// 2. Arrays (Lists)
let arr = [1, 2, 3];
arr.push(4);        // Add to end
let last = arr.pop(); // Remove from end
arr.shift();        // Remove from start
arr.unshift(0);     // Add to start

// 3. HashMaps (Object / Map)
let map = new Map();
map.set(key, val);
map.get(key);      // returns value
map.has(key);      // true/false
map.delete(key);`,
  py: `# 1. Loops & Iteration
for i in range(10): # 0 to 9
    print(i)
for item in arr:
    print(item)
for key, val in my_dict.items():
    print(key, val)

# 2. Lists (Arrays)
arr = [1, 2, 3]
arr.append(4)     # Add to end
last = arr.pop()  # Remove from end
arr.insert(0, 0)  # Insert at index 0

# 3. Dictionaries (HashMaps)
d = {}
d[key] = val
val = d.get(key, default_val) # safe retrieve
if key in d:
    del d[key]`,
  cpp: `// 1. Loops & Iteration
for (int i = 0; i < n; ++i) { ... }
for (int val : vec) { ... } // Range-based loop

// 2. Vectors (Dynamic Arrays)
#include <vector>
std::vector<int> vec = {1, 2, 3};
vec.push_back(4);    // Add to end
vec.pop_back();      // Remove from end
int len = vec.size();

// 3. Maps & HashMaps
#include <unordered_map>
std::unordered_map<string, int> mp;
mp[key] = val;
if (mp.find(key) != mp.end()) {
    // Key exists
    int val = mp[key];
}
mp.erase(key); // Remove key`,
  java: `// 1. Loops & Iteration
for (int i = 0; i < n; i++) { ... }
for (int val : arr) { ... } // For-each loop

// 2. ArrayLists (Dynamic Arrays)
import java.util.ArrayList;
ArrayList<Integer> list = new ArrayList<>();
list.add(4);          // Add to end
list.remove(list.size() - 1); // Remove from end
int len = list.size();

// 3. HashMaps
import java.util.HashMap;
HashMap<String, Integer> map = new HashMap<>();
map.put(key, val);
if (map.containsKey(key)) {
    int value = map.get(key);
}
map.remove(key);`,
  sql: `-- 1. Basic Data Selection
SELECT column_name, COUNT(*) 
FROM table_name 
WHERE condition 
GROUP BY column_name 
HAVING COUNT(*) > 1 
ORDER BY column_name DESC;

-- 2. Joins
SELECT t1.col1, t2.col2 
FROM table1 t1
INNER JOIN table2 t2 ON t1.id = t2.foreign_id;

-- 3. CASE Statement (Conditional Fetch)
SELECT name,
       CASE WHEN rating > 2000 THEN 'Pro'
            WHEN rating > 1500 THEN 'Intermediate'
            ELSE 'Novice' END AS user_level
FROM users;`
};

// Application State Manager
class App {
  constructor() {
    this.questions = [];
    this.codeDrafts = {};
    this.submissions = {};
    
    this.currentUser = null;
    this.authMode = 'login'; // 'login' or 'signup'
    
    this.currentView = 'dashboard'; // 'dashboard' or 'workspace'
    this.activeQuestion = null;
    this.activeLanguage = 'javascript';
    this.activeTab = 'description'; // 'description', 'hints'
    this.consoleTab = 'testcases'; // 'testcases', 'result'
    
    this.activeTestCaseIndex = 0;
    this.runResults = null;
    this.isRunning = false;
    this.fontSize = 14;
    
    this.refExpanded = false;
    this.refLang = 'js';
    
    // Subjects & Notes view states
    this.activeDashboardSubView = 'practice'; // 'practice', 'subjects', 'notes'
    this.activeSubject = 'oops';
    this.activeTopicIndex = 0;
    this.userNotes = [];
    this.activeNoteId = null;

    this.init();
  }

  init() {
    // 1. Combine default list, prioritizing rich details from questions.js
    const combinedDefaults = [...initialQuestions];
    dsaQuestions.forEach(q => {
      if (!combinedDefaults.some(item => item.id === q.id)) {
        combinedDefaults.push(q);
      }
    });

    // 2. Load data from localStorage or fallback to defaults
    const cachedQuestions = localStorage.getItem('antigravity_questions');
    if (cachedQuestions) {
      const currentList = JSON.parse(cachedQuestions);
      let updated = false;
      combinedDefaults.forEach(q => {
        if (!currentList.some(item => item.id === q.id)) {
          currentList.push(q);
          updated = true;
        }
      });
      this.questions = currentList;
      if (updated) {
        localStorage.setItem('antigravity_questions', JSON.stringify(this.questions));
      }
    } else {
      this.questions = combinedDefaults;
      localStorage.setItem('antigravity_questions', JSON.stringify(this.questions));
    }

    const cachedDrafts = localStorage.getItem('antigravity_drafts');
    this.codeDrafts = cachedDrafts ? JSON.parse(cachedDrafts) : {};

    // 3. User Session Enforcer
    const activeSession = localStorage.getItem('codecraft_active_user');
    if (activeSession) {
      this.currentUser = JSON.parse(activeSession);
      
      // Load user specific progress
      const userSubmissionsKey = `codecraft_submissions_${this.currentUser.username}`;
      const userSubmissions = localStorage.getItem(userSubmissionsKey);
      if (userSubmissions) {
        this.submissions = JSON.parse(userSubmissions);
      } else {
        // Migrate old global submissions if any
        const oldSubmissions = localStorage.getItem('antigravity_submissions');
        this.submissions = oldSubmissions ? JSON.parse(oldSubmissions) : {};
        localStorage.setItem(userSubmissionsKey, JSON.stringify(this.submissions));
      }

      // Load user specific notes
      const userNotesKey = `codecraft_notes_${this.currentUser.username}`;
      const userNotesCached = localStorage.getItem(userNotesKey);
      this.userNotes = userNotesCached ? JSON.parse(userNotesCached) : [];
      
      // Update UI elements
      document.getElementById('auth-overlay').classList.add('inactive');
      document.getElementById('btn-user-profile').style.display = 'flex';
      document.getElementById('main-navigation-tabs').style.display = 'flex';
      document.getElementById('user-display-name').textContent = this.currentUser.username;
      document.getElementById('dashboard-greeting').textContent = `Welcome back, ${this.currentUser.username}!`;
    } else {
      document.getElementById('auth-overlay').classList.remove('inactive');
      document.getElementById('btn-user-profile').style.display = 'none';
      document.getElementById('main-navigation-tabs').style.display = 'none';
    }

    // 4. Attach global event listeners
    this.attachEventListeners();

    // 5. Setup UI Theme
    this.initTheme();

    // 6. Render initial view
    this.render();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('antigravity_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    const selector = document.getElementById('theme-selector');
    if (selector) {
      selector.value = savedTheme;
    }
  }

  changeTheme(newTheme) {
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('antigravity_theme', newTheme);
    EditorManager.setTheme(newTheme);
    this.showToast(`Theme changed to ${newTheme.toUpperCase()}`, 'success');
  }

  // Bind key UI clicks and forms
  attachEventListeners() {
    // Navigation & Tabs Switcher
    document.getElementById('nav-logo').addEventListener('click', () => {
      this.navigate('dashboard');
      this.switchDashboardSubView('practice');
    });
    
    document.getElementById('nav-tab-practice').addEventListener('click', () => this.switchDashboardSubView('practice'));
    document.getElementById('nav-tab-subjects').addEventListener('click', () => this.switchDashboardSubView('subjects'));
    document.getElementById('nav-tab-notes').addEventListener('click', () => this.switchDashboardSubView('notes'));
    
    // Notes handlers
    document.getElementById('btn-add-note').addEventListener('click', () => this.handleCreateNote());
    document.getElementById('btn-save-note').addEventListener('click', () => this.handleSaveNote());
    document.getElementById('btn-delete-note').addEventListener('click', () => this.handleDeleteNote());

    // Theme Switcher Dropdown
    document.getElementById('theme-selector').addEventListener('change', (e) => this.changeTheme(e.target.value));

    // User Profile / Logout
    document.getElementById('btn-user-profile').addEventListener('click', () => this.handleLogout());

    // Cheat Sheet Toggle & Tab Selection
    document.getElementById('btn-toggle-ref').addEventListener('click', () => this.toggleReferencePanel());
    document.querySelectorAll('[data-ref-lang]').forEach(tab => {
      tab.addEventListener('click', (e) => this.changeReferenceLang(e.target.getAttribute('data-ref-lang')));
    });

    // Auth screen tabs & Form
    document.getElementById('auth-tab-login').addEventListener('click', () => this.toggleAuthMode('login'));
    document.getElementById('auth-tab-signup').addEventListener('click', () => this.toggleAuthMode('signup'));
    document.getElementById('auth-form').addEventListener('submit', (e) => this.handleAuthSubmit(e));

    // Search and Filters
    document.getElementById('search-input').addEventListener('input', () => this.renderDashboardList());
    document.getElementById('filter-difficulty').addEventListener('change', () => this.renderDashboardList());
    document.getElementById('filter-category').addEventListener('change', () => this.renderDashboardList());
    document.getElementById('filter-status').addEventListener('change', () => this.renderDashboardList());

    // Modals
    document.getElementById('btn-add-question').addEventListener('click', () => this.toggleCustomQuestionModal(true));
    document.getElementById('btn-close-modal').addEventListener('click', () => this.toggleCustomQuestionModal(false));
    document.getElementById('btn-cancel-modal').addEventListener('click', () => this.toggleCustomQuestionModal(false));
    document.getElementById('custom-question-form').addEventListener('submit', (e) => this.handleCreateCustomQuestion(e));

    // Editor settings triggers
    document.getElementById('editor-lang-select').addEventListener('change', (e) => this.handleLanguageChange(e.target.value));
    document.getElementById('font-size-slider').addEventListener('input', (e) => {
      this.fontSize = e.target.value;
      document.getElementById('font-size-label').textContent = `${this.fontSize}px`;
      EditorManager.setFontSize(this.fontSize);
    });
    document.getElementById('btn-reset-code').addEventListener('click', () => this.handleResetCode());

    // Execution triggers
    document.getElementById('btn-run-code').addEventListener('click', () => this.handleRunCode());
    document.getElementById('btn-submit-code').addEventListener('click', () => this.handleSubmitCode());
  }

  navigate(view, questionId = null) {
    this.currentView = view;
    
    if (view === 'dashboard') {
      if (this.currentUser) {
        document.getElementById('main-navigation-tabs').style.display = 'flex';
      }
      document.getElementById('dashboard-view').style.display = 'block';
      document.getElementById('workspace-view').style.display = 'none';
      EditorManager.destroy();
      this.activeQuestion = null;
      this.runResults = null;
      this.renderDashboard();
    } else if (view === 'workspace' && questionId) {
      const q = this.questions.find(item => item.id === questionId);
      if (q) {
        this.activeQuestion = q;
        document.getElementById('main-navigation-tabs').style.display = 'none';
        document.getElementById('dashboard-view').style.display = 'none';
        document.getElementById('workspace-view').style.display = 'flex';
        this.initWorkspace();
      }
    }
  }

  // ------------------ DASHBOARD VIEW RENDERERS ------------------
  renderDashboard() {
    this.renderStats();
    this.renderCategoryFilterOptions();
    this.renderDashboardList();
    this.renderReferenceContent();
  }

  renderStats() {
    const total = this.questions.length;
    const solved = Object.values(this.submissions).filter(s => s === 'solved').length;
    const attempted = Object.values(this.submissions).filter(s => s === 'attempted').length;
    
    // Counts by difficulty
    let easyTotal = 0, mediumTotal = 0, hardTotal = 0;
    let easySolved = 0, mediumSolved = 0, hardSolved = 0;

    this.questions.forEach(q => {
      const isSolved = this.submissions[q.id] === 'solved';
      if (q.difficulty === 'easy') {
        easyTotal++;
        if (isSolved) easySolved++;
      } else if (q.difficulty === 'medium') {
        mediumTotal++;
        if (isSolved) mediumSolved++;
      } else if (q.difficulty === 'hard') {
        hardTotal++;
        if (isSolved) hardSolved++;
      }
    });

    document.getElementById('stat-total-val').textContent = `${solved}/${total}`;
    document.getElementById('stat-easy-val').textContent = `${easySolved}/${easyTotal}`;
    document.getElementById('stat-medium-val').textContent = `${mediumSolved}/${mediumTotal}`;
    document.getElementById('stat-hard-val').textContent = `${hardSolved}/${hardTotal}`;

    // Calculate Rank
    let rank = 'Newbie';
    if (solved >= 60) rank = 'Grandmaster';
    else if (solved >= 30) rank = 'Candidate Master';
    else if (solved >= 15) rank = 'Expert';
    else if (solved >= 5) rank = 'Specialist';
    else if (solved >= 1) rank = 'Apprentice';

    // Update Rank in DOM
    const rankValEl = document.getElementById('stat-rank-val');
    if (rankValEl) rankValEl.textContent = rank;

    const rankBadgeEl = document.getElementById('user-rank-badge');
    if (rankBadgeEl) {
      rankBadgeEl.textContent = rank;
      rankBadgeEl.style.display = this.currentUser ? 'inline-block' : 'none';
    }

    if (window.lucide) window.lucide.createIcons();
  }

  renderCategoryFilterOptions() {
    const select = document.getElementById('filter-category');
    // Save current selection
    const currentVal = select.value;
    
    // Extract unique categories
    const categories = new Set();
    this.questions.forEach(q => categories.add(q.category));
    
    select.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
      select.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
    
    select.value = currentVal;
  }

  renderDashboardList() {
    const searchVal = document.getElementById('search-input').value.toLowerCase();
    const difficultyVal = document.getElementById('filter-difficulty').value;
    const categoryVal = document.getElementById('filter-category').value;
    const statusVal = document.getElementById('filter-status').value;

    const tbody = document.getElementById('question-list-body');
    tbody.innerHTML = '';

    const filtered = this.questions.filter(q => {
      const matchSearch = q.title.toLowerCase().includes(searchVal) || q.category.toLowerCase().includes(searchVal);
      const matchDiff = difficultyVal === 'all' || q.difficulty === difficultyVal;
      const matchCat = categoryVal === 'all' || q.category === categoryVal;
      
      const status = this.submissions[q.id] || 'todo';
      const matchStatus = statusVal === 'all' || status === statusVal;

      return matchSearch && matchDiff && matchCat && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 40px 0;">
            No questions found matching your filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(q => {
      const status = this.submissions[q.id] || 'todo';
      let statusIcon = '';
      if (status === 'solved') {
        statusIcon = `<span class="status-indicator solved" title="Solved"><i data-lucide="check-circle-2" class="w-5 h-5"></i></span>`;
      } else if (status === 'attempted') {
        statusIcon = `<span class="status-indicator attempted" title="Attempted"><i data-lucide="circle-dot" class="w-5 h-5"></i></span>`;
      } else {
        statusIcon = `<span class="status-indicator todo" title="Todo"><i data-lucide="circle" class="w-5 h-5"></i></span>`;
      }

      const tr = document.createElement('tr');
      tr.addEventListener('click', () => this.navigate('workspace', q.id));
      tr.innerHTML = `
        <td class="col-status">${statusIcon}</td>
        <td class="col-title">${q.title}</td>
        <td class="col-category"><span class="category-badge">${q.category}</span></td>
        <td class="col-difficulty"><span class="tag-difficulty ${q.difficulty}">${q.difficulty.toUpperCase()}</span></td>
        <td class="col-action"><button class="solve-btn">Solve</button></td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // ------------------ WORKSPACE VIEW RENDERERS ------------------
  initWorkspace() {
    const q = this.activeQuestion;
    if (!q) return;

    // 1. Reset Workspace UI panels
    this.activeTab = 'description';
    this.consoleTab = 'testcases';
    this.activeTestCaseIndex = 0;
    this.runResults = null;
    
    // Set workspace titles
    document.getElementById('workspace-title').textContent = q.title;

    // Populate Left Pane Contents
    this.renderLeftPane();

    // Populate Language dropdown based on question templates
    const langSelect = document.getElementById('editor-lang-select');
    langSelect.innerHTML = '';
    const availableLangs = Object.keys(q.templates);
    availableLangs.forEach(l => {
      let displayName = l.toUpperCase();
      if (l === 'cpp') displayName = 'C++';
      if (l === 'javascript') displayName = 'JavaScript';
      if (l === 'python') displayName = 'Python';
      langSelect.innerHTML += `<option value="${l}">${displayName}</option>`;
    });

    // Default to the first available language, or last cached language for this specific question
    const cachedLang = localStorage.getItem(`antigravity_lastlang_${q.id}`);
    const defaultLang = (cachedLang && availableLangs.includes(cachedLang)) ? cachedLang : availableLangs[0];
    this.activeLanguage = defaultLang;
    langSelect.value = defaultLang;

    // Set starter code
    const draftKey = `${q.id}_${this.activeLanguage}`;
    const starterCode = this.codeDrafts[draftKey] || q.templates[this.activeLanguage];

    // Load Monaco Editor
    const container = document.getElementById('editor-container');
    container.innerHTML = '';
    EditorManager.init(container, this.activeLanguage, starterCode, () => {
      // Re-trigger layout sizing
      setTimeout(() => {
        EditorManager.setFontSize(this.fontSize);
      }, 100);
    });

    // Setup console panel
    this.renderConsolePanel();
  }

  renderLeftPane() {
    const q = this.activeQuestion;
    const content = document.getElementById('workspace-left-content');
    
    if (this.activeTab === 'description') {
      let examplesHtml = '';
      q.examples.forEach((ex, idx) => {
        examplesHtml += `
          <div class="problem-example">
            <div class="example-title">Example ${idx + 1}:</div>
            <div class="example-box">
              <strong>Input:</strong> ${ex.input}<br>
              <strong>Output:</strong> ${ex.output}
              ${ex.explanation ? `<br><strong>Explanation:</strong> ${ex.explanation}` : ''}
            </div>
          </div>
        `;
      });

      let constraintsHtml = '';
      if (q.constraints && q.constraints.length > 0) {
        constraintsHtml = `
          <div class="problem-constraints">
            <h3>Constraints:</h3>
            <ul>
              ${q.constraints.map(c => `<li><code>${c}</code></li>`).join('')}
            </ul>
          </div>
        `;
      }

      content.innerHTML = `
        <div class="problem-desc">
          <h1>${q.title}</h1>
          <div class="difficulty-row">
            <span class="tag-difficulty ${q.difficulty}">${q.difficulty.toUpperCase()}</span>
            <span class="category-badge">${q.category}</span>
          </div>
          <p>${this.parseMarkdown(q.description)}</p>
          ${examplesHtml}
          ${constraintsHtml}
        </div>
      `;
    } else if (this.activeTab === 'hints') {
      content.innerHTML = `
        <div class="problem-desc">
          <h1>Hints & Tips</h1>
          <p style="margin-top:20px;">Use the following tips if you get stuck:</p>
          <div class="example-box" style="border-left-color: var(--warning); margin-top: 16px;">
            <strong>Hint 1:</strong> Think about what time and space complexities are required. For this question, an optimal solution typically runs in O(N).
          </div>
          <div class="example-box" style="border-left-color: var(--brand-color); margin-top: 16px;">
            <strong>Hint 2:</strong> Try using a dictionary (HashMap) to keep track of elements you have already visited to resolve lookup times.
          </div>
        </div>
      `;
    }
  }

  // Switch tabs in left workspace pane
  switchLeftTab(tab) {
    this.activeTab = tab;
    document.getElementById('tab-desc').classList.remove('active');
    document.getElementById('tab-hints').classList.remove('active');
    
    if (tab === 'description') {
      document.getElementById('tab-desc').classList.add('active');
    } else {
      document.getElementById('tab-hints').classList.add('active');
    }
    
    this.renderLeftPane();
  }

  // Helper markdown parser
  parseMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Bold
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italics
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```(.*?)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Break lines
      .replace(/\n/g, '<br>');
  }

  // Language selectors click
  handleLanguageChange(newLang) {
    // 1. Cache current code draft before switching
    const currentCode = EditorManager.getCode();
    const oldDraftKey = `${this.activeQuestion.id}_${this.activeLanguage}`;
    this.codeDrafts[oldDraftKey] = currentCode;
    localStorage.setItem('antigravity_drafts', JSON.stringify(this.codeDrafts));

    // 2. Switch language
    this.activeLanguage = newLang;
    localStorage.setItem(`antigravity_lastlang_${this.activeQuestion.id}`, newLang);

    // 3. Load or configure Monaco
    const nextDraftKey = `${this.activeQuestion.id}_${newLang}`;
    const nextCode = this.codeDrafts[nextDraftKey] || this.activeQuestion.templates[newLang];
    
    EditorManager.setCode(nextCode);
    EditorManager.setLanguage(newLang);
    
    this.showToast(`Switched language to ${newLang}`, 'success');
  }

  handleResetCode() {
    if (confirm("Are you sure you want to reset the editor code to the default starter template? This will discard your current code draft.")) {
      const template = this.activeQuestion.templates[this.activeLanguage];
      EditorManager.setCode(template);
      
      const draftKey = `${this.activeQuestion.id}_${this.activeLanguage}`;
      delete this.codeDrafts[draftKey];
      localStorage.setItem('antigravity_drafts', JSON.stringify(this.codeDrafts));
      
      this.showToast("Code reset to starter template.", "warning");
    }
  }

  // ------------------ OUTPUT PANEL RENDERERS ------------------
  renderConsolePanel() {
    const q = this.activeQuestion;
    const tabsContainer = document.getElementById('console-tabs-list');
    const detailsContainer = document.getElementById('console-case-details');
    
    // Clear containers
    tabsContainer.innerHTML = '';
    detailsContainer.innerHTML = '';

    const results = this.runResults ? this.runResults.results : [];
    const totalCases = q.testCases.length;

    // Header result label
    const headerTitle = document.getElementById('console-header-label');
    const resultSummaryEl = document.getElementById('result-summary-banner');

    if (this.isRunning) {
      resultSummaryEl.style.display = 'none';
      headerTitle.textContent = "Console (Running...)";
      detailsContainer.innerHTML = `
        <div class="pyodide-loader-overlay">
          <div class="spinner"></div>
          <div id="loader-status-text" class="loader-text">Compiling and running code...</div>
        </div>
      `;
      return;
    }

    headerTitle.textContent = "Console & Run Results";

    // 1. Result summary Banner (Success/Failed)
    if (this.runResults) {
      resultSummaryEl.style.display = 'flex';
      if (this.runResults.error) {
        resultSummaryEl.className = 'test-summary failed';
        resultSummaryEl.innerHTML = `<i data-lucide="alert-triangle" class="w-5 h-5"></i><span>Compilation Error</span>`;
        detailsContainer.innerHTML = `<div class="testcase-details" style="color: var(--danger); font-size: 14px;"><strong>Compiler Diagnostics:</strong><br><pre style="white-space: pre-wrap; margin-top:10px; background: var(--bg-primary); padding: 12px; border-radius: 6px; border:1px solid var(--border-color);">${this.runResults.error}</pre></div>`;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      const allPassed = this.runResults.passed;
      if (allPassed) {
        resultSummaryEl.className = 'test-summary';
        resultSummaryEl.innerHTML = `<i data-lucide="check-check" class="w-5 h-5"></i><span>All Test Cases Passed! (${this.runResults.summary.passed}/${this.runResults.summary.total})</span>`;
      } else {
        resultSummaryEl.className = 'test-summary failed';
        resultSummaryEl.innerHTML = `<i data-lucide="x-circle" class="w-5 h-5"></i><span>Some Test Cases Failed (${this.runResults.summary.passed}/${this.runResults.summary.total})</span>`;
      }
    } else {
      resultSummaryEl.style.display = 'none';
    }

    // 2. Render Case Tabs List
    for (let i = 0; i < totalCases; i++) {
      const tab = document.createElement('div');
      tab.className = `testcase-tab ${this.activeTestCaseIndex === i ? 'active' : ''}`;
      
      let passClass = '';
      if (results && results[i]) {
        passClass = results[i].passed ? 'passed' : 'failed';
        tab.className += ` ${passClass}`;
      }

      tab.addEventListener('click', () => {
        this.activeTestCaseIndex = i;
        this.renderConsolePanel();
      });

      tab.innerHTML = `
        <span>Case ${i + 1}</span>
        <span class="testcase-status"></span>
      `;
      tabsContainer.appendChild(tab);
    }

    // 3. Render TestCase Details Pane
    const activeCase = q.testCases[this.activeTestCaseIndex];
    const caseResult = results[this.activeTestCaseIndex];

    if (activeCase) {
      let runOutputHtml = '';

      if (caseResult) {
        const isPassed = caseResult.passed;
        const actualVal = typeof caseResult.actual === 'object' ? JSON.stringify(caseResult.actual) : String(caseResult.actual);
        const expectedVal = typeof caseResult.expected === 'object' ? JSON.stringify(caseResult.expected) : String(caseResult.expected);
        
        // Logs string
        const logsHtml = (caseResult.logs && caseResult.logs.length > 0) 
          ? `<div class="details-row">
               <div class="details-label">Console/Stdout logs</div>
               <div class="details-val" style="color: var(--brand-color-hover);">${caseResult.logs.join('\n')}</div>
             </div>`
          : '';

        runOutputHtml = `
          <div class="details-row">
            <div class="details-label">Result</div>
            <div class="tag-difficulty ${isPassed ? 'easy' : 'hard'}" style="font-size:13px; padding: 6px 12px;">
              ${isPassed ? 'PASSED' : 'FAILED'}
            </div>
          </div>
          <div class="details-row">
            <div class="details-label">Your Output</div>
            <div class="details-val" style="color: ${isPassed ? 'var(--success)' : 'var(--danger)'};">${actualVal}</div>
          </div>
          <div class="details-row">
            <div class="details-label">Expected Output</div>
            <div class="details-val">${expectedVal}</div>
          </div>
          ${logsHtml}
        `;
      } else {
        runOutputHtml = `<div style="color: var(--text-secondary); margin-bottom: 12px; font-style:italic;">Run your code to view results for this test case.</div>`;
      }

      detailsContainer.innerHTML = `
        <div class="testcase-details">
          <div class="details-row">
            <div class="details-label">Input Arguments</div>
            <div class="details-val">${JSON.stringify(activeCase.input)}</div>
          </div>
          ${runOutputHtml}
        </div>
      `;
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // ------------------ CODE RUN LOGIC ------------------
  async handleRunCode() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Save draft code first
    const code = EditorManager.getCode();
    const draftKey = `${this.activeQuestion.id}_${this.activeLanguage}`;
    this.codeDrafts[draftKey] = code;
    localStorage.setItem('antigravity_drafts', JSON.stringify(this.codeDrafts));

    this.renderConsolePanel();

    const functionName = this.activeQuestion.functionName;
    const testCases = this.activeQuestion.testCases;
    const lang = this.activeLanguage;

    let results = null;

    try {
      if (lang === 'javascript') {
        results = await runJavaScript(code, functionName, testCases);
      } else if (lang === 'python') {
        const updateLoader = (statusText) => {
          const textEl = document.getElementById('loader-status-text');
          if (textEl) textEl.textContent = statusText;
        };
        results = await runPython(code, functionName, testCases, updateLoader);
      } else {
        // C++, Java, SQL
        results = runMockCompiler(code, lang, functionName, testCases);
      }
    } catch (err) {
      results = {
        error: `Execution Error: ${err.message}`,
        results: [],
        passed: false
      };
    }

    this.isRunning = false;
    this.runResults = results;

    // Save submission state
    const currentStatus = this.submissions[this.activeQuestion.id];
    if (results.passed) {
      this.submissions[this.activeQuestion.id] = 'solved';
      this.showToast("All test cases passed! Great job!", "success");
    } else {
      if (currentStatus !== 'solved') {
        this.submissions[this.activeQuestion.id] = 'attempted';
      }
      this.showToast("Tests failed. Review outputs to debug.", "danger");
    }
    if (this.currentUser) {
      localStorage.setItem(`codecraft_submissions_${this.currentUser.username}`, JSON.stringify(this.submissions));
    }
    localStorage.setItem('antigravity_submissions', JSON.stringify(this.submissions)); // Fallback compat

    this.renderConsolePanel();
  }

  async handleSubmitCode() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Save draft code first
    const code = EditorManager.getCode();
    const draftKey = `${this.activeQuestion.id}_${this.activeLanguage}`;
    this.codeDrafts[draftKey] = code;
    localStorage.setItem('antigravity_drafts', JSON.stringify(this.codeDrafts));

    // Force console panel to showing state
    this.renderConsolePanel();

    const functionName = this.activeQuestion.functionName;
    const testCases = this.activeQuestion.testCases;
    const lang = this.activeLanguage;

    let results = null;

    try {
      if (lang === 'javascript') {
        results = await runJavaScript(code, functionName, testCases);
      } else if (lang === 'python') {
        const updateLoader = (statusText) => {
          const textEl = document.getElementById('loader-status-text');
          if (textEl) textEl.textContent = statusText;
        };
        results = await runPython(code, functionName, testCases, updateLoader);
      } else {
        results = runMockCompiler(code, lang, functionName, testCases);
      }
    } catch (err) {
      results = {
        error: `Submission Error: ${err.message}`,
        results: [],
        passed: false
      };
    }

    this.isRunning = false;
    this.runResults = results;

    const currentStatus = this.submissions[this.activeQuestion.id];

    if (results.passed && !results.error) {
      // Mark as solved
      this.submissions[this.activeQuestion.id] = 'solved';
      
      // Calculate realistic metrics
      const runtime = Math.floor(Math.random() * 20) + 4;
      const memory = (Math.random() * 4 + 38.2).toFixed(1);
      const runtimePercentile = (Math.random() * 4 + 94.2).toFixed(1);
      const memoryPercentile = (Math.random() * 6 + 85.3).toFixed(1);

      // Set metrics in DOM
      document.getElementById('submit-runtime').innerHTML = `${runtime} ms <span style="display:block; font-size:10px; color:var(--success); font-weight:normal; margin-top:2px;">Beats ${runtimePercentile}%</span>`;
      document.getElementById('submit-memory').innerHTML = `${memory} MB <span style="display:block; font-size:10px; color:var(--success); font-weight:normal; margin-top:2px;">Beats ${memoryPercentile}%</span>`;

      // Trigger Modal
      document.getElementById('modal-submit-result').classList.add('active');
      this.showToast("Accepted! All test cases passed.", "success");
    } else {
      if (currentStatus !== 'solved') {
        this.submissions[this.activeQuestion.id] = 'attempted';
      }
      this.showToast("Wrong Answer / Compilation Error on system tests.", "danger");
    }

    // Save Submissions
    if (this.currentUser) {
      localStorage.setItem(`codecraft_submissions_${this.currentUser.username}`, JSON.stringify(this.submissions));
    }
    localStorage.setItem('antigravity_submissions', JSON.stringify(this.submissions));

    this.renderConsolePanel();
  }

  // ------------------ CUSTOM PROBLEMS MODAL ------------------
  toggleCustomQuestionModal(show) {
    const modal = document.getElementById('modal-add-question');
    if (show) {
      modal.classList.add('active');
    } else {
      modal.classList.remove('active');
      document.getElementById('custom-question-form').reset();
    }
  }

  handleCreateCustomQuestion(e) {
    e.preventDefault();
    
    const title = document.getElementById('q-title').value.trim();
    const category = document.getElementById('q-category').value.trim();
    const difficulty = document.getElementById('q-difficulty').value;
    const description = document.getElementById('q-description').value.trim();
    const functionName = document.getElementById('q-function-name').value.trim();
    const testcasesStr = document.getElementById('q-testcases').value.trim();

    // Validations
    if (!title || !category || !description || !functionName || !testcasesStr) {
      this.showToast("All fields are required.", "danger");
      return;
    }

    let parsedTestcases = [];
    try {
      parsedTestcases = JSON.parse(testcasesStr);
      if (!Array.isArray(parsedTestcases) || parsedTestcases.length === 0) {
        throw new Error("Must be a non-empty array of test cases.");
      }
      // Check structure of test cases
      parsedTestcases.forEach((tc, idx) => {
        if (!tc.hasOwnProperty('input') || !tc.hasOwnProperty('expected')) {
          throw new Error(`Test Case ${idx + 1} is missing "input" or "expected" property.`);
        }
        if (!Array.isArray(tc.input)) {
          throw new Error(`Test Case ${idx + 1} "input" must be an Array of arguments.`);
        }
      });
    } catch (err) {
      alert(`Invalid JSON format in Test Cases: ${err.message}\n\nFormat example:\n[\n  { "input": [[2, 7], 9], "expected": [0, 1] }\n]`);
      return;
    }

    // Generate templates dynamically
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if ID already exists
    if (this.questions.find(q => q.id === id)) {
      this.showToast("A question with this title already exists.", "danger");
      return;
    }

    const newQuestion = {
      id,
      title,
      difficulty,
      category,
      description,
      functionName,
      templates: {
        javascript: `function ${functionName}(${parsedTestcases[0].input.map((_, i) => 'arg' + (i+1)).join(', ')}) {
    // Write your code here
    
}`,
        python: `def ${functionName}(${parsedTestcases[0].input.map((_, i) => 'arg' + (i+1)).join(', ')}):
    # Write your code here
    pass`,
        cpp: `class Solution {
public:
    // Update types as appropriate
    void ${functionName}() {
        // Write your code here
        
    }
};`,
        java: `class Solution {
    // Update return and parameters types as appropriate
    public void ${functionName}() {
        // Write your code here
        
    }
}`
      },
      testCases: parsedTestcases,
      examples: [
        {
          input: JSON.stringify(parsedTestcases[0].input),
          output: JSON.stringify(parsedTestcases[0].expected),
          explanation: "Generated automatically from test cases."
        }
      ],
      constraints: ["Generated dynamically by user."]
    };

    // Save to list
    this.questions.push(newQuestion);
    localStorage.setItem('antigravity_questions', JSON.stringify(this.questions));

    this.toggleCustomQuestionModal(false);
    this.showToast("Custom Question Created successfully!", "success");
    
    // Refresh view
    this.renderDashboard();
  }

  // ------------------ TOAST ALERTS ------------------
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast-msg');
    toast.className = `toast ${type} active`;
    toast.innerHTML = `
      <span class="toast-icon"></span>
      <span class="toast-text">${message}</span>
    `;

    // Map Toast icons
    const iconSpan = toast.querySelector('.toast-icon');
    if (type === 'success') {
      iconSpan.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i>`;
    } else if (type === 'danger') {
      iconSpan.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4"></i>`;
    } else if (type === 'warning') {
      iconSpan.innerHTML = `<i data-lucide="alert-triangle" class="w-4 h-4"></i>`;
    } else {
      iconSpan.innerHTML = `<i data-lucide="info" class="w-4 h-4"></i>`;
    }

    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.classList.remove('active');
    }, 3500);
  }

  // ------------------ AUTHENTICATION HANDLERS ------------------
  toggleAuthMode(mode) {
    this.authMode = mode;
    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');
    const groupUsername = document.getElementById('auth-group-username');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (mode === 'login') {
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      groupUsername.style.display = 'none';
      document.getElementById('auth-username').required = false;
      title.textContent = "Welcome Back";
      subtitle.textContent = "Login to access your personal coding practice room";
      submitBtn.textContent = "Log In";
    } else {
      tabLogin.classList.remove('active');
      tabSignup.classList.add('active');
      groupUsername.style.display = 'block';
      document.getElementById('auth-username').required = true;
      title.textContent = "Join CodeCraft";
      subtitle.textContent = "Create an account to track your progress and stats";
      submitBtn.textContent = "Create Account";
    }
  }

  handleAuthSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    
    // Load registered users
    const cachedUsers = localStorage.getItem('codecraft_users');
    const users = cachedUsers ? JSON.parse(cachedUsers) : [];

    if (this.authMode === 'login') {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user || user.password !== password) {
        this.showToast("Invalid email or password.", "danger");
        return;
      }

      // Success Login
      this.currentUser = user;
      localStorage.setItem('codecraft_active_user', JSON.stringify(user));
      
      // Load user submissions
      const userSubmissionsKey = `codecraft_submissions_${user.username}`;
      const userSubmissions = localStorage.getItem(userSubmissionsKey);
      this.submissions = userSubmissions ? JSON.parse(userSubmissions) : {};
      
      this.loginSuccess();
    } else {
      const username = document.getElementById('auth-username').value.trim();
      
      if (username.length < 3) {
        this.showToast("Username must be at least 3 characters.", "danger");
        return;
      }
      
      if (password.length < 6) {
        this.showToast("Password must be at least 6 characters.", "danger");
        return;
      }

      // Check duplicates
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        this.showToast("Username is already taken.", "danger");
        return;
      }
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        this.showToast("Email address is already registered.", "danger");
        return;
      }

      // Create new user
      const newUser = { username, email, password };
      users.push(newUser);
      localStorage.setItem('codecraft_users', JSON.stringify(users));

      // Auto login
      this.currentUser = newUser;
      localStorage.setItem('codecraft_active_user', JSON.stringify(newUser));
      this.submissions = {}; // New progress
      localStorage.setItem(`codecraft_submissions_${username}`, JSON.stringify(this.submissions));

      this.loginSuccess();
    }
  }

  loginSuccess() {
    // Hide overlay
    document.getElementById('auth-overlay').classList.add('inactive');
    
    // Show navigation tabs
    document.getElementById('main-navigation-tabs').style.display = 'flex';

    // Load user specific notes
    const userNotesKey = `codecraft_notes_${this.currentUser.username}`;
    const userNotesCached = localStorage.getItem(userNotesKey);
    this.userNotes = userNotesCached ? JSON.parse(userNotesCached) : [];
    
    // Update Header Profile
    const profileBtn = document.getElementById('btn-user-profile');
    profileBtn.style.display = 'flex';
    document.getElementById('user-display-name').textContent = this.currentUser.username;
    
    // Update greeting
    document.getElementById('dashboard-greeting').textContent = `Welcome back, ${this.currentUser.username}!`;
    
    // Clear inputs
    document.getElementById('auth-form').reset();
    
    // Reset view
    this.switchDashboardSubView('practice');
    
    // Rerender dashboard to load correct user progress stats
    this.renderDashboard();
    
    this.showToast(`Logged in successfully as ${this.currentUser.username}!`, "success");
  }

  handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('codecraft_active_user');
      this.currentUser = null;
      this.submissions = {};
      this.userNotes = [];
      this.activeNoteId = null;
      this.activeDashboardSubView = 'practice';
      
      // Hide navigation tabs
      document.getElementById('main-navigation-tabs').style.display = 'none';
      
      // Reset active tab highlight
      document.querySelectorAll('#main-navigation-tabs .nav-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById('nav-tab-practice').classList.add('active');
      
      // Navigate dashboard and destroy editor reference
      this.navigate('dashboard');
      
      // Show auth overlay
      document.getElementById('auth-overlay').classList.remove('inactive');
      document.getElementById('btn-user-profile').style.display = 'none';
      
      this.showToast("Logged out successfully.", "warning");
    }
  }

  // ------------------ QUICK SYNTAX CHEATSHEET HANDLERS ------------------
  toggleReferencePanel() {
    this.refExpanded = !this.refExpanded;
    const panel = document.getElementById('reference-panel');
    const body = document.getElementById('reference-body');
    
    if (this.refExpanded) {
      panel.classList.add('expanded');
      body.style.display = 'block';
      this.renderReferenceContent();
    } else {
      panel.classList.remove('expanded');
      body.style.display = 'none';
    }
  }

  changeReferenceLang(lang) {
    this.refLang = lang;
    
    // Toggle active tab class
    document.querySelectorAll('[data-ref-lang]').forEach(tab => {
      if (tab.getAttribute('data-ref-lang') === lang) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    this.renderReferenceContent();
  }

  renderReferenceContent() {
    const container = document.getElementById('reference-content');
    if (container) {
      container.textContent = referenceSheets[this.refLang] || '';
    }
  }

  // ------------------ DASHBOARD SUBVIEWS SWITCHER ------------------
  switchDashboardSubView(subview) {
    this.activeDashboardSubView = subview;
    
    // Toggle active nav class
    document.querySelectorAll('#main-navigation-tabs .nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`nav-tab-${subview}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Toggle container views visibility
    const practiceContainer = document.getElementById('practice-container');
    const subjectsContainer = document.getElementById('subjects-container');
    const notesContainer = document.getElementById('notes-container');
    
    if (practiceContainer) practiceContainer.style.display = subview === 'practice' ? 'block' : 'none';
    if (subjectsContainer) subjectsContainer.style.display = subview === 'subjects' ? 'block' : 'none';
    if (notesContainer) notesContainer.style.display = subview === 'notes' ? 'block' : 'none';

    // Rerender subview content
    if (subview === 'subjects') {
      this.renderSubjects();
    } else if (subview === 'notes') {
      this.renderNotes();
    } else if (subview === 'practice') {
      this.renderDashboard();
    }
  }

  // ------------------ CORE SUBJECTS RENDERER ------------------
  renderSubjects() {
    const subjectsList = document.getElementById('subject-select-list');
    const topicsList = document.getElementById('topic-select-list');
    
    if (!subjectsList || !topicsList) return;

    // 1. Render Subjects Sidebar Options
    subjectsList.innerHTML = '';
    const subjects = Object.keys(subjectNotes);
    subjects.forEach(subjectKey => {
      const subject = subjectNotes[subjectKey];
      const activeClass = this.activeSubject === subjectKey ? 'active' : '';
      subjectsList.innerHTML += `
        <button class="subject-btn ${activeClass}" onclick="window.selectSubject('${subjectKey}')">
          <i data-lucide="folder" class="w-4 h-4"></i>
          ${subject.title.split('(')[0].trim()}
        </button>
      `;
    });

    // 2. Render Topics Sidebar Options for Selected Subject
    topicsList.innerHTML = '';
    const currentSubjectData = subjectNotes[this.activeSubject];
    if (currentSubjectData && currentSubjectData.topics) {
      currentSubjectData.topics.forEach((topic, idx) => {
        const activeClass = this.activeTopicIndex === idx ? 'active' : '';
        topicsList.innerHTML += `
          <button class="topic-btn ${activeClass}" onclick="window.selectTopic(${idx})">
            <i data-lucide="file-text" class="w-4 h-4"></i>
            ${topic.name}
          </button>
        `;
      });
    }

    // 3. Render Active Topic Content
    const activeTopic = currentSubjectData.topics[this.activeTopicIndex];
    const badgeEl = document.getElementById('subject-reader-subject-badge');
    const titleEl = document.getElementById('subject-reader-topic-title');
    const contentEl = document.getElementById('subject-reader-content');

    if (activeTopic && badgeEl && titleEl && contentEl) {
      badgeEl.textContent = currentSubjectData.title;
      titleEl.textContent = activeTopic.name;
      contentEl.innerHTML = this.parseBasicMarkdown(activeTopic.content);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  selectSubject(subjectKey) {
    this.activeSubject = subjectKey;
    this.activeTopicIndex = 0;
    this.renderSubjects();
  }

  selectTopic(idx) {
    this.activeTopicIndex = idx;
    this.renderSubjects();
  }

  parseBasicMarkdown(text) {
    if (!text) return '';
    let html = text;
    // Replace header 3
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 15px; font-weight: 700; margin-top: 18px; margin-bottom: 8px; color: var(--text-primary); border-left: 3px solid var(--brand-color-hover); padding-left: 10px;">$1</h3>');
    // Replace header 2
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 18px; font-weight: 800; margin-top: 24px; margin-bottom: 12px; color: var(--text-primary);">$1</h2>');
    // Replace bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--brand-color-hover); font-weight:600;">$1</strong>');
    // Replace inline code blocks
    html = html.replace(/`(.*?)`/g, '<code style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 4px; padding: 2px 6px; font-family: var(--font-mono); font-size: 13px; color: var(--brand-color-hover); font-weight:500;">$1</code>');
    // Replace lists
    html = html.replace(/^\- (.*$)/gim, '<li style="margin-left: 20px; margin-bottom: 6px; list-style-type: disc;">$1</li>');
    
    // Replace multiline code blocks (fenced code blocks)
    html = html.replace(/```(.*?)\n([\s\S]*?)```/g, (match, p1, p2) => {
      return `<pre style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; overflow-x: auto; font-family: var(--font-mono); font-size: 13px; margin: 16px 0; color: var(--text-primary); line-height: 1.5;"><code>${p2.trim()}</code></pre>`;
    });

    // Replace table format lines
    if (html.includes('|')) {
      const lines = html.split('\n');
      let inTable = false;
      let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">';
      const newLines = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith('|')) {
          if (!inTable) {
            inTable = true;
          }
          const cells = line.split('|').slice(1, -1).map(c => c.trim());
          if (line.includes('---')) {
            continue;
          }
          let rowHtml = '<tr style="border-bottom: 1px solid var(--border-color);">';
          for (let cell of cells) {
            const isHeader = line.includes('Feature') || i === 0 || lines[i-1] === undefined || lines[i-1].includes('---');
            const tag = isHeader ? 'th' : 'td';
            rowHtml += `<${tag} style="padding: 10px 12px; text-align: left; font-weight: ${tag === 'th' ? '600' : 'normal'}; color: ${tag === 'th' ? 'var(--text-primary)' : 'var(--text-secondary)'};">${cell}</${tag}>`;
          }
          rowHtml += '</tr>';
          tableHtml += rowHtml;
        } else {
          if (inTable) {
            inTable = false;
            tableHtml += '</table>';
            newLines.push(tableHtml);
            tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">';
          }
          newLines.push(line);
        }
      }
      if (inTable) {
        tableHtml += '</table>';
        newLines.push(tableHtml);
      }
      html = newLines.join('\n');
    }

    return html;
  }

  // ------------------ MY PERSONAL NOTES HANDLERS ------------------
  renderNotes() {
    const listEl = document.getElementById('notes-list');
    const emptyState = document.getElementById('notes-empty-state');
    const activeForm = document.getElementById('notes-active-form');

    if (!listEl) return;

    // 1. Render sidebar list
    listEl.innerHTML = '';
    if (this.userNotes.length === 0) {
      listEl.innerHTML = '<div style="color:var(--text-tertiary); font-size:13px; text-align:center; padding: 20px 0;">No notes found. Create one to begin.</div>';
    } else {
      this.userNotes.forEach(note => {
        const activeClass = this.activeNoteId === note.id ? 'active' : '';
        listEl.innerHTML += `
          <button class="note-item-btn ${activeClass}" onclick="window.selectNote('${note.id}')">
            <span class="note-item-title" style="font-weight:600; text-align:left;">${note.title}</span>
            <span class="note-item-date" style="font-size:11px; color:var(--text-tertiary); margin-top:2px;">${note.date}</span>
          </button>
        `;
      });
    }

    // 2. Toggle empty state vs active form
    if (this.activeNoteId === null) {
      emptyState.style.display = 'flex';
      activeForm.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      activeForm.style.display = 'flex';
      
      const currentNote = this.userNotes.find(n => n.id === this.activeNoteId);
      if (currentNote) {
        document.getElementById('note-title-input').value = currentNote.title;
        document.getElementById('note-body-input').value = currentNote.content;
      }
    }
  }

  selectNote(noteId) {
    this.activeNoteId = noteId;
    this.renderNotes();
  }

  handleCreateNote() {
    const newNote = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      date: new Date().toLocaleDateString()
    };
    this.userNotes.unshift(newNote);
    this.activeNoteId = newNote.id;

    // Save to user storage
    this.saveUserNotes();
    this.renderNotes();
    this.showToast("New note created!", "success");
  }

  handleSaveNote() {
    if (this.activeNoteId === null) return;
    
    const title = document.getElementById('note-title-input').value.trim() || "Untitled Note";
    const content = document.getElementById('note-body-input').value;
    
    const note = this.userNotes.find(n => n.id === this.activeNoteId);
    if (note) {
      note.title = title;
      note.content = content;
      note.date = new Date().toLocaleDateString();
      this.saveUserNotes();
      this.renderNotes();
      this.showToast("Note saved successfully", "success");
    }
  }

  handleDeleteNote() {
    if (this.activeNoteId === null) return;
    if (confirm("Are you sure you want to delete this note?")) {
      this.userNotes = this.userNotes.filter(n => n.id !== this.activeNoteId);
      this.activeNoteId = null;
      this.saveUserNotes();
      this.renderNotes();
      this.showToast("Note deleted", "warning");
    }
  }

  saveUserNotes() {
    if (this.currentUser) {
      localStorage.setItem(`codecraft_notes_${this.currentUser.username}`, JSON.stringify(this.userNotes));
    }
  }

  render() {
    this.navigate('dashboard');
  }
}

// Instantiate and expose the app
const bootApp = () => {
  if (window.appInstance) return; // Prevent double boot
  window.appInstance = new App();
  
  // Bind left-workspace click tab handlers in global space
  window.switchLeftTab = (tab) => window.appInstance.switchLeftTab(tab);
  window.selectSubject = (key) => window.appInstance.selectSubject(key);
  window.selectTopic = (idx) => window.appInstance.selectTopic(idx);
  window.selectNote = (id) => window.appInstance.selectNote(id);
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
