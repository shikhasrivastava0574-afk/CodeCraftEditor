# 💻 CodeCraft Editor: Premium Coding Editor & CS Learning Hub

CodeCraft Editor is a stunning, Obsidian-themed personal practice room designed to prepare you for coding interviews and software engineering roles. It functions entirely client-side, using WebAssembly (WASM) to run code directly inside the user's browser with zero server configuration.

🔗 **Live Deployment**: [code-craft-editor-ebon.vercel.app](https://code-craft-editor-ebon.vercel.app)

---

## 🚀 Key Features

### 1. In-Browser WebAssembly Runners
*   **Python WASM Compiler**: Integrates **Pyodide** to execute Python code natively in WebAssembly in the browser, redirecting standard output stream prints and converting data structures dynamically.
*   **Sandboxed JavaScript Runner**: Runs JS code using isolated evaluation closures, capturing console logging streams and mapping results.

### 2. Premium Custom Themes
Toggle between **5 custom themes** that dynamically skin the Monaco Editor and the surrounding workspace:
*   🌑 **Obsidian Dark**: Charcoal dashboard with neon blue borders.
*   ☀️ **Obsidian Light**: High contrast clean slate/white layout.
*   🎨 **Monokai Retro**: Vintage code editor theme with classic neon syntax highlights.
*   ⚡ **Cyberpunk 2077**: Dark violet layout with magenta and cyan highlights.
*   🌲 **Forest Moss**: Calming organic theme with sage and amber highlights.

### 3. Integrated DSA & SQL Question Sheets
*   **247 DSA Questions**: Topic-wise coverage inspired by Striver's sheet (Arrays, Strings, Linked Lists, Trees, DP, etc.).
*   **92 SQL Problems**: Practice schemas for CAB bookings, Library systems, and CodeChef database query cases.
*   **Custom Question Creator**: Add your own custom coding questions with markdown descriptions and dynamic JSON test cases.

### 4. Client-Side Authentication & Session Persistence
*   **Login & Sign Up Screen**: Glassmorphic overlay protecting data access.
*   **User-Specific Progress Tracking**: Solved/attempted statistics are saved under separate user keys (`codecraft_submissions_[username]`) so different profiles can practice on the same machine.
*   **Gamified Ranks**: Rise through the ranks based on solved count: `Newbie` ➡️ `Apprentice` ➡️ `Specialist` ➡️ `Expert` ➡️ `Candidate Master` ➡️ `Grandmaster`.

### 5. CS Core Subjects Reference
A dedicated split-view directory with comprehensive, interview-ready study notes for:
*   **Object-Oriented Programming (OOPS)**
*   **Database Management Systems (DBMS)**
*   **Computer Networks (CN)**
*   **Operating Systems (OS)**
*   *Parsed dynamically from Markdown into clean list elements and tables.*

### 6. Personal Study Notes Workspace
*   A personal text editor workspace to draft, save, edit, and delete study notes.
*   Saved entries are isolated per profile (`codecraft_notes_[username]`).

---

## 📂 Project Structure

```bash
├── index.html            # Main markup and overlays
├── style.css             # Obsidian styling system and CSS variables
├── js/
│   ├── app.js            # Main application state controller and event router
│   ├── editor.js         # Monaco Editor loader, configurations, and theme definitions
│   ├── runner.js         # Python Pyodide and JavaScript sandboxing execution engines
│   ├── questions.js      # Metadata for core dashboard challenges
│   ├── dsa_sheet.js      # Consolidated DSA & SQL questions catalog
│   ├── subjects_notes.js # Interview databases for OOPS, DBMS, CN, and OS
│   └── dsa_list.txt      # DSA questions source list
├── parse_dsa.py          # Array/String challenges builder script
├── parse_sql.py          # Database queries challenges builder script
└── walkthrough.md        # Walkthrough instructions
```

---

## 🛠️ Tech Stack
*   **Core**: HTML5, Vanilla ES6 JavaScript, CSS3 variables.
*   **Monaco Editor**: Loaded via RequireJS from Microsoft CDNs.
*   **Pyodide WASM**: Python execution core loaded asynchronously.
*   **Lucide Icons**: Modern vector icon pack.

---

## ⚙️ Quick Start

No Node/NPM dependencies are required. All libraries are fetched asynchronously via CDNs:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/shikhasrivastava0574-afk/CodeCraftEditor.git
    cd CodeCraftEditor
    ```

2.  **Start a Local Server**:
    To ensure proper Web Worker imports for the Monaco Editor, serve the project folder locally. You can use Python's built-in server:
    ```bash
    python3 -m http.server 8000
    ```

3.  **Open in Browser**:
    Visit **[http://localhost:8000](http://localhost:8000)** in your web browser. Create an account, choose your theme, and start coding!
