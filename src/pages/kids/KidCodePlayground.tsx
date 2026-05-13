import { useState, useCallback, useEffect, useRef } from "react";
import {
  Play, Save, RefreshCw, Code2, Settings, Copy, Check,
  Terminal, Sparkles, Trash2, Moon, Sun, Maximize2, Minimize2,
  Download, Upload, Star, Share2, Search, X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  setCode, setLanguage, setFontSize, toggleDarkMode,
  clearExecutionResult, clearCurrentSnippet, loadSnippetIntoEditor,
  resetPlaygroundState, createSnippet, updateSnippet, deleteSnippet,
  toggleFavorite, executeCode, saveSession, getSession, getSnippets,
  getStats, generateShareLink, searchSnippets,
} from "../../store/slices/codePlaygroundSlice";
import type { CodeSnippet, PlaygroundLanguage } from "../../interfaces/codePlayground.interface";

type Timeout = ReturnType<typeof setTimeout>;

interface LanguageConfig {
  name: string;
  extension: string;
  defaultCode: string;
  color: string;
  icon: string;
}

const DEFAULT_CODE: Record<PlaygroundLanguage, string> = {
  javascript: `// Welcome to the JavaScript Playground!\nconsole.log("Hello, young coder! 🎉");\n\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\nconsole.log(greet("Coder"));\n\nfor (let i = 1; i <= 5; i++) {\n  console.log("Count: " + i);\n}`,
  python: `# Welcome to the Python Playground!\nprint("Hello, young coder! 🎉")\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Coder"))\n\nfor i in range(1, 6):\n    print(f"Count: {i}")`,
  html: `<!DOCTYPE html>\n<html>\n<head>\n  <title>My Playground</title>\n  <style>\n    body { font-family: Arial, sans-serif; background: #667eea; color: white; text-align: center; padding: 50px; }\n    button { background: #ff6b6b; border: none; padding: 10px 20px; border-radius: 10px; color: white; cursor: pointer; font-size: 16px; }\n  </style>\n</head>\n<body>\n  <h1>✨ Welcome to HTML Playground! ✨</h1>\n  <button onclick="alert('Hello!')">Click Me!</button>\n</body>\n</html>`,
  css: `/* Welcome to the CSS Playground! */\n.fancy-button {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  border: none;\n  color: white;\n  padding: 15px 30px;\n  border-radius: 50px;\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n\n.fancy-button:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 20px rgba(0,0,0,0.3);\n}`,
};

const languages: Record<PlaygroundLanguage, LanguageConfig> = {
  javascript: { name: "JavaScript",    extension: "js",   defaultCode: DEFAULT_CODE.javascript, color: "bg-yellow-500", icon: "🟨" },
  python:     { name: "Python",        extension: "py",   defaultCode: DEFAULT_CODE.python,     color: "bg-blue-500",   icon: "🐍" },
  html:       { name: "HTML/CSS",      extension: "html", defaultCode: DEFAULT_CODE.html,       color: "bg-orange-500", icon: "🌐" },
  css:        { name: "CSS Playground",extension: "css",  defaultCode: DEFAULT_CODE.css,        color: "bg-purple-500", icon: "🎨" },
};

const KidCodePlayground = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ── Selectors ───────────────────────────────────────────────────────────────
  const code            = useSelector((s: RootState) => s.codePlayground.code);
const language        = useSelector((s: RootState) => s.codePlayground.language);
const fontSize        = useSelector((s: RootState) => s.codePlayground.fontSize);
const isDarkMode      = useSelector((s: RootState) => s.codePlayground.isDarkMode);
const executing       = useSelector((s: RootState) => s.codePlayground.executing);
const executionResult = useSelector((s: RootState) => s.codePlayground.executionResult);
const snippets        = useSelector((s: RootState) => s.codePlayground.snippets);
const snippetsLoading = useSelector((s: RootState) => s.codePlayground.snippetsLoading);
const currentSnippet  = useSelector((s: RootState) => s.codePlayground.currentSnippet);
const stats           = useSelector((s: RootState) => s.codePlayground.stats);
const shareLink       = useSelector((s: RootState) => s.codePlayground.shareLink);
const searchResults   = useSelector((s: RootState) => s.codePlayground.searchResults);
const searchLoading   = useSelector((s: RootState) => s.codePlayground.searchLoading);
const error           = useSelector((s: RootState) => s.codePlayground.error);

  // ── Local state ──────────────────────────────────────────────────────────────
  const [isFullscreen,    setIsFullscreen]    = useState(false);
  const [copied,          setCopied]          = useState(false);
  const [showSaveModal,   setShowSaveModal]   = useState(false);
  const [showLoadModal,   setShowLoadModal]   = useState(false);
  const [showSettings,    setShowSettings]    = useState(false);
  const [saveName,        setSaveName]        = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [searchQuery,     setSearchQuery]     = useState("");
  const [activeTab,       setActiveTab]       = useState<"all" | "favorites" | "search">("all");
  const [isSaving,        setIsSaving]        = useState(false);

  const autoSaveTimer  = useRef<Timeout | null>(null);
  const isInitialMount = useRef(true);

  // ── Init ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(getSession());
    dispatch(getSnippets({ limit: 50 }));
    dispatch(getStats());
  }, [dispatch]);

  // ── Auto-save session ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      dispatch(saveSession({
        current_code: code,
        current_language: language,
        is_dark_mode: isDarkMode,
        font_size: fontSize,
      }));
    }, 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [code, language, fontSize, isDarkMode, dispatch]);

  // ── Error toast ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetPlaygroundState());
    }
  }, [error, dispatch]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const displayedSnippets =
    activeTab === "search"    ? searchResults :
    activeTab === "favorites" ? snippets.filter((s) => s.is_favorite) :
    snippets;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleLanguageChange = useCallback((lang: PlaygroundLanguage) => {
    dispatch(setLanguage(lang));
    setShowSettings(false);
    toast.success(`Switched to ${languages[lang].name}`);
  }, [dispatch]);

  const handleRunCode = useCallback(async () => {
  try {
    const result = await dispatch(executeCode({
      code,
      language,
      snippetId: currentSnippet?.id ?? null,
    })).unwrap();

    if (result.success) {
      toast.success("Code executed successfully!");
    } else {
      toast.error("Execution failed");
    }
  } catch {
    toast.error("Failed to execute code");
  }
}, [dispatch, code, language, currentSnippet]);

  const handleClearCode = useCallback(() => {
    if (!window.confirm("Clear all your code?")) return;
    dispatch(setCode(DEFAULT_CODE[language]));
    dispatch(clearCurrentSnippet());
    dispatch(clearExecutionResult());
    toast.success("Code cleared!");
  }, [dispatch, language]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  }, [code]);

  const handleSaveCode = useCallback(async () => {
    if (!saveName.trim()) { toast.error("Please enter a name for your code"); return; }
    setIsSaving(true);
    try {
      if (currentSnippet) {
        await dispatch(updateSnippet({
          id: currentSnippet.id,
          data: { name: saveName, code, description: saveDescription },
        })).unwrap();
        toast.success("Code updated successfully!");
      } else {
        await dispatch(createSnippet({
          name: saveName, code, language, description: saveDescription,
        })).unwrap();
        toast.success("Code saved successfully!");
      }
      setSaveName("");
      setSaveDescription("");
      setShowSaveModal(false);
      dispatch(getSnippets({ limit: 50 }));
      dispatch(getStats());
    } catch {
      toast.error("Failed to save code");
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, saveName, saveDescription, code, language, currentSnippet]);

  const handleLoadCode = useCallback((snippet: CodeSnippet) => {
    dispatch(loadSnippetIntoEditor(snippet));
    dispatch(clearExecutionResult());
    setShowLoadModal(false);
    toast.success(`Loaded: ${snippet.name}`);
  }, [dispatch]);

  const handleDeleteCode = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this code?")) return;
    try {
      await dispatch(deleteSnippet(id)).unwrap();
      toast.success("Code deleted");
      dispatch(getSnippets({ limit: 50 }));
      dispatch(getStats());
    } catch {
      toast.error("Failed to delete code");
    }
  }, [dispatch]);

  const handleToggleFavorite = useCallback(async (snippet: CodeSnippet) => {
    try {
      await dispatch(toggleFavorite(snippet.id)).unwrap();
      toast.success(snippet.is_favorite ? "Removed from favorites" : "Added to favorites");
    } catch {
      toast.error("Failed to update favorite");
    }
  }, [dispatch]);

  const handleDownload = useCallback(() => {
    const ext  = languages[language].extension;
    const blob = new Blob([code], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `playground.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code downloaded!");
  }, [code, language]);

  const handleReset = useCallback(() => {
    if (!window.confirm("Reset to default code? Unsaved changes will be lost.")) return;
    dispatch(setCode(DEFAULT_CODE[language]));
    dispatch(clearCurrentSnippet());
    dispatch(clearExecutionResult());
    toast.success("Reset to default code");
  }, [dispatch, language]);

  const handleShare = useCallback(async () => {
    if (!currentSnippet) { toast.error("Please save your code before sharing"); return; }
    try {
      const url = await dispatch(generateShareLink(currentSnippet.id)).unwrap();
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard!");
    } catch {
      toast.error("Failed to generate share link");
    }
  }, [dispatch, currentSnippet]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    try {
      await dispatch(searchSnippets(searchQuery)).unwrap();
      setActiveTab("search");
    } catch {
      toast.error("Search failed");
    }
  }, [dispatch, searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setActiveTab("all");
  }, []);

  const handleNewCode = useCallback(() => {
    dispatch(setCode(DEFAULT_CODE[language]));
    dispatch(clearCurrentSnippet());
    dispatch(clearExecutionResult());
    toast.success("New playground ready!");
  }, [dispatch, language]);

  const dk = (dark: string, light: string) => isDarkMode ? dark : light;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${dk("bg-gray-900", "bg-gray-50")} transition-colors duration-300`}>

      {/* ── Header ── */}
      <header className={`sticky top-0 z-20 ${dk("bg-gray-800 border-gray-700", "bg-white border-gray-200")} border-b shadow-sm`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Code2 size={24} className="text-purple-500" />
              <span className={`font-bold ${dk("text-white", "text-gray-800")}`}>Code Playground</span>
            </div>
            <div className="h-6 w-px bg-gray-600 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              {(Object.entries(languages) as [PlaygroundLanguage, LanguageConfig][]).map(([key, lang]) => (
                <button
                  key={key}
                  onClick={() => handleLanguageChange(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1
                    ${language === key
                      ? `${lang.color} text-white shadow-md`
                      : dk("bg-gray-700 text-gray-300 hover:bg-gray-600", "bg-gray-100 text-gray-600 hover:bg-gray-200")
                    }`}
                >
                  <span>{lang.icon}</span>
                  <span className="hidden md:inline">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stats && (
              <div className={`hidden lg:flex items-center gap-2 px-2 py-1 rounded-lg text-xs ${dk("bg-gray-700", "bg-gray-100")}`}>
                <span>📊 {stats.total} snippets</span>
                <span>⭐ {stats.favorites} favs</span>
              </div>
            )}
            <button onClick={() => dispatch(toggleDarkMode())} className={`p-2 rounded-lg transition ${dk("hover:bg-gray-700 text-yellow-500", "hover:bg-gray-100 text-gray-600")}`}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setShowSettings((s) => !s)} className={`p-2 rounded-lg transition ${dk("hover:bg-gray-700", "hover:bg-gray-100")} text-gray-400`}>
              <Settings size={18} />
            </button>
            <button onClick={() => setIsFullscreen((s) => !s)} className={`p-2 rounded-lg transition ${dk("hover:bg-gray-700", "hover:bg-gray-100")} text-gray-400 hidden sm:block`}>
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>

        {showSettings && (
          <div className={`px-4 py-3 border-t ${dk("border-gray-700 bg-gray-800", "border-gray-200 bg-gray-50")}`}>
            <div className="flex items-center gap-4">
              <label className={`text-sm ${dk("text-gray-300", "text-gray-600")}`}>Font Size:</label>
              <input
                type="range" min="10" max="24" value={fontSize}
                onChange={(e) => dispatch(setFontSize(parseInt(e.target.value)))}
                className="w-32"
              />
              <span className={`text-sm ${dk("text-gray-300", "text-gray-600")}`}>{fontSize}px</span>
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-57px)]">

        {/* ── Code Editor ── */}
        <div className={`flex-1 flex flex-col border-r ${dk("border-gray-700", "border-gray-200")}`}>
          <div className={`flex items-center justify-between px-4 py-2 ${dk("bg-gray-800 border-gray-700", "bg-gray-100 border-gray-200")} border-b`}>
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-purple-500" />
              <span className={`text-sm font-medium ${dk("text-gray-300", "text-gray-600")}`}>
                Code Editor — {languages[language].name}
                {currentSnippet && (
                  <span className="ml-2 text-xs text-purple-500">✏️ {currentSnippet.name}</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[
                { icon: <Code2 size={14} />,                               title: "New",      action: handleNewCode },
                { icon: copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />, title: "Copy", action: handleCopyCode },
                { icon: <Trash2 size={14} />,                              title: "Clear",    action: handleClearCode },
                { icon: <Save size={14} />,                                title: "Save",     action: () => setShowSaveModal(true) },
                { icon: <Upload size={14} />,                              title: "Load",     action: () => setShowLoadModal(true) },
                { icon: <Download size={14} />,                            title: "Download", action: handleDownload },
                { icon: <RefreshCw size={14} />,                           title: "Reset",    action: handleReset },
                ...(currentSnippet ? [{ icon: <Share2 size={14} />, title: "Share", action: handleShare }] : []),
              ].map(({ icon, title, action }) => (
                <button
                  key={title}
                  onClick={action}
                  title={title}
                  className={`p-1.5 rounded transition ${dk("hover:bg-gray-700 text-gray-400", "hover:bg-gray-200 text-gray-500")}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => dispatch(setCode(e.target.value))}
            className={`flex-1 p-4 font-mono outline-none resize-none ${dk("bg-gray-900 text-green-400", "bg-white text-gray-800")}`}
            style={{ fontSize: `${fontSize}px`, fontFamily: "'Courier New', monospace" }}
            spellCheck={false}
          />
        </div>

        {/* ── Output Panel ── */}
        <div className="lg:w-1/2 flex flex-col">
          <div className={`flex items-center justify-between px-4 py-2 ${dk("bg-gray-800 border-gray-700", "bg-gray-100 border-gray-200")} border-b`}>
            <div className="flex items-center gap-2">
              <Play size={16} className="text-green-500" />
              <span className={`text-sm font-medium ${dk("text-gray-300", "text-gray-600")}`}>Output</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search snippets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className={`px-3 py-1 text-sm rounded-lg pr-8 border ${dk("bg-gray-700 text-white border-gray-600", "bg-white text-gray-800 border-gray-300")}`}
                />
                {searchQuery ? (
                  <button onClick={handleClearSearch} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <X size={14} className="text-gray-400 hover:text-gray-600" />
                  </button>
                ) : (
                  <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Search size={14} className="text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={handleRunCode}
                disabled={executing}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                  ${executing
                    ? "bg-gray-600 cursor-not-allowed text-gray-300"
                    : "bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
                  }`}
              >
                {executing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                Run Code
              </button>
            </div>
          </div>

          <div className={`flex-1 p-4 overflow-y-auto font-mono text-sm ${dk("bg-gray-900 text-gray-300", "bg-gray-50 text-gray-700")}`}>
            {executionResult ? (
              <div>
                {executionResult.error ? (
                  <pre className="whitespace-pre-wrap break-words text-red-400">{executionResult.error}</pre>
                ) : (
                  <pre className="whitespace-pre-wrap break-words">{executionResult.output}</pre>
                )}
                {executionResult.executionTimeMs !== undefined && (
                  <p className="text-xs text-gray-500 mt-4">⏱ {executionResult.executionTimeMs}ms</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <Sparkles size={48} className="mb-4 opacity-50" />
                <p>Click "Run Code" to see your output!</p>
                <p className="text-sm mt-2">Write code and experiment freely ✨</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Save Modal ── */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowSaveModal(false)}>
          <div className={`rounded-2xl max-w-md w-full p-6 ${dk("bg-gray-800", "bg-white")}`} onClick={(e) => e.stopPropagation()}>
            <h2 className={`text-xl font-bold mb-4 ${dk("text-white", "text-gray-800")}`}>
              {currentSnippet ? "Update Your Code" : "Save Your Code"}
            </h2>
            <input
              autoFocus
              type="text"
              placeholder="Enter a name for your code..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveCode()}
              className={`w-full px-4 py-2 rounded-lg border mb-3 outline-none focus:ring-2 focus:ring-purple-500 ${dk("bg-gray-700 border-gray-600 text-white", "bg-gray-50 border-gray-200")}`}
            />
            <textarea
              placeholder="Description (optional)..."
              value={saveDescription}
              onChange={(e) => setSaveDescription(e.target.value)}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-purple-500 ${dk("bg-gray-700 border-gray-600 text-white", "bg-gray-50 border-gray-200")}`}
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSaveModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSaveCode} disabled={isSaving} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50">
                {isSaving ? "Saving..." : currentSnippet ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Load Modal ── */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowLoadModal(false)}>
          <div className={`rounded-2xl max-w-2xl w-full p-6 ${dk("bg-gray-800", "bg-white")}`} onClick={(e) => e.stopPropagation()}>
            <h2 className={`text-xl font-bold mb-4 ${dk("text-white", "text-gray-800")}`}>Load Saved Code</h2>

            <div className={`flex gap-2 mb-4 border-b ${dk("border-gray-700", "border-gray-200")}`}>
              {(["all", "favorites", "search"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm capitalize transition ${activeTab === tab ? "text-purple-500 border-b-2 border-purple-500" : "text-gray-400"}`}
                >
                  {tab === "search" ? `Search Results${searchResults.length ? ` (${searchResults.length})` : ""}` : tab === "favorites" ? "Favorites" : "All Snippets"}
                </button>
              ))}
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {snippetsLoading || searchLoading ? (
                <div className="text-center py-8">
                  <RefreshCw size={32} className="animate-spin mx-auto text-purple-500" />
                </div>
              ) : displayedSnippets.length === 0 ? (
                <p className={`text-center py-8 ${dk("text-gray-400", "text-gray-500")}`}>
                  {activeTab === "favorites" ? "No favorites yet. Star some code to see them here!"
                   : activeTab === "search"  ? "No results found."
                   : "No saved code yet. Write something and save it!"}
                </p>
              ) : (
                displayedSnippets.map((snippet) => (
                  <div
                    key={snippet.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${dk("hover:bg-gray-700 border-gray-700", "hover:bg-gray-50 border-gray-200")}`}
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => handleLoadCode(snippet)}>
                      <div className="flex items-center gap-2">
                        <span>{languages[snippet.language].icon}</span>
                        <p className={`font-medium ${dk("text-white", "text-gray-800")}`}>{snippet.name}</p>
                        {snippet.is_favorite && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                      </div>
                      {snippet.description && (
                        <p className={`text-xs mt-1 ${dk("text-gray-400", "text-gray-500")}`}>{snippet.description}</p>
                      )}
                      <p className={`text-xs ${dk("text-gray-500", "text-gray-400")}`}>
                        Updated: {new Date(snippet.updated_at).toLocaleDateString()} · Runs: {snippet.execution_count}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleFavorite(snippet)} className="p-2 hover:bg-yellow-50 rounded-lg transition">
                        <Star size={16} className={snippet.is_favorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} />
                      </button>
                      <button onClick={() => handleDeleteCode(snippet.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6">
              <button onClick={() => setShowLoadModal(false)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Share link toast ── */}
      {shareLink && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Share link copied! ✓
        </div>
      )}
    </div>
  );
};

export default KidCodePlayground;