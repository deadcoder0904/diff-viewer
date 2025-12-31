import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { DiffEditor } from "@monaco-editor/react";
import { FileText, ArrowRightLeft, Upload, Sparkles } from "lucide-react";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { handleFileSelect, triggerFileInput } from "./utils/fileUtils";
import { calculateDiffStats } from "./utils/diffUtils";
import { SAMPLE_ORIGINAL, SAMPLE_CHANGED } from "./constants/sampleData";

type ViewMode = "input" | "diff";

interface SpotlightProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function Spotlight({ containerRef }: SpotlightProps) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPosition({ x, y });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef]);

  return (
    <div
      className="pointer-events-none transition-opacity duration-300 rounded-full"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(94, 106, 210, 0.12) 0%, transparent 70%)",
        transform: "translate(-50%, -50%)",
        opacity: isVisible ? 1 : 0,
      }}
    />
  );
}

function App() {
  const [originalText, setOriginalText] = useState<string>("");
  const [changedText, setChangedText] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("input");
  const [activeFileInput, setActiveFileInput] = useState<"original" | "changed" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const originalCardRef = useRef<HTMLDivElement>(null);
  const changedCardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const changedTextareaRef = useRef<HTMLTextAreaElement>(null);
  const diffEditorRef = useRef<import("monaco-editor").editor.IStandaloneDiffEditor | null>(null);
  const findDiffButtonRef = useRef<HTMLButtonElement>(null);

  const canDiff = originalText.length > 0 && changedText.length > 0;

  useKeyboardNavigation({
    viewMode,
    canDiff,
    originalTextareaRef,
    changedTextareaRef,
    findDiffButtonRef,
  });

  useEffect(() => {
    if (viewMode === "diff") {
      diffEditorRef.current?.layout();
    }
  }, [viewMode]);

  const onFileLoaded = useCallback((content: string, target: "original" | "changed") => {
    if (target === "original") {
      setOriginalText(content);
    } else {
      setChangedText(content);
    }
  }, []);

  const handleFileSelectWrapper = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(event, activeFileInput, onFileLoaded, setActiveFileInput);
    },
    [activeFileInput, onFileLoaded],
  );

  const triggerFileInputWrapper = useCallback((target: "original" | "changed") => {
    triggerFileInput(setActiveFileInput, fileInputRef, target);
  }, []);

  const loadSample = useCallback(() => {
    setOriginalText(SAMPLE_ORIGINAL);
    setChangedText(SAMPLE_CHANGED);
    setViewMode("diff");
  }, []);

  const toggleViewMode = useCallback(() => {
    if (viewMode === "input") {
      if (originalText && changedText) {
        setViewMode("diff");
      }
    } else {
      setViewMode("input");
      setTimeout(() => originalTextareaRef.current?.focus(), 100);
    }
  }, [viewMode, originalText, changedText]);

  const diffStats = useMemo(
    () => calculateDiffStats(originalText, changedText),
    [originalText, changedText],
  );

  return (
    <div ref={containerRef} className="flex flex-col h-screen relative">
      <div className="fixed -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full pointer-events-none z-0 animate-[float-slow_10s_ease-in-out_infinite] bg-[radial-gradient(circle,rgba(94,106,210,0.25)_0%,transparent_70%)] blur-[100px]" />
      <div className="fixed bottom-[10%] left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none z-0 animate-[float_12s_ease-in-out_infinite] bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,transparent_60%)] blur-[80px]" />
      <div className="fixed top-[30%] right-[5%] w-[500px] h-[500px] rounded-full pointer-events-none z-0 animate-[float-slow_14s_ease-in-out_infinite_reverse] bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_60%)] blur-[60px]" />

      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,#0a0a0f_0%,transparent_50%),radial-gradient(ellipse_60%_40%_at_80%_20%,rgba(94,106,210,0.15)_0%,transparent_40%),radial-gradient(ellipse_50%_30%_at_20%_70%,rgba(139,92,246,0.1)_0%,transparent_40%)]" />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015] bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20400%20400%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noiseFilter%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.9%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelectWrapper}
        accept=".txt,.json,.js,.ts,.jsx,.tsx,.html,.css,.md"
        className="hidden"
      />

      <header className="relative flex items-center gap-3 px-8 py-5 border-b border-white/6 bg-[#0a0a0c]/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#5E6AD2]/20 to-[#8B5CF6]/10 border border-white/10">
          <Sparkles className="w-5 h-5 text-[#5E6AD2]" />
        </div>
        <div className="relative flex flex-col">
          <h1 className="relative text-lg font-semibold text-[#EDEDEF] tracking-tight">
            Diff Viewer
          </h1>
          <p className="relative text-xs text-[#8A8F98]">Compare text differences side by side</p>
        </div>
      </header>

      <main className="relative flex flex-col flex-1 min-h-0 w-full overflow-auto">
        {viewMode === "input" ? (
          <div className="flex-1 min-h-0 w-full grid grid-cols-1 lg:grid-cols-2 grid-rows-1 gap-6 p-6 lg:p-8 max-w-[90vw] mx-auto h-full">
            <div
              ref={originalCardRef}
              className="group relative flex flex-col min-h-0 bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/6 overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.4),0_0_80px_rgba(94,106,210,0.08)] focus-within:border-[#5E6AD2]/30 focus-within:shadow-[0_0_0_1px_rgba(94,106,210,0.2),0_8px_40px_rgba(0,0,0,0.4),0_0_60px_rgba(94,106,210,0.1)]"
            >
              <Spotlight containerRef={originalCardRef} />
              <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/6 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#5E6AD2] to-[#6872D9]" />
                  <span className="font-medium text-[#EDEDEF] text-sm tracking-tight">
                    Original text
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => triggerFileInputWrapper("original")}
                  tabIndex={-1}
                  className="relative flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-[#8A8F98] bg-white/[0.05] hover:bg-white/[0.08] hover:text-[#EDEDEF] rounded-lg border border-white/6 hover:border-white/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c] focus-visible:border-white/10"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Open File
                </button>
              </div>
              <textarea
                ref={originalTextareaRef}
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Paste or upload your original text here..."
                className="relative flex-1 w-full p-5 bg-transparent text-[#EDEDEF] placeholder:text-[#8A8F98]/50 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-inset font-mono text-sm leading-relaxed"
                spellCheck={false}
                tabIndex={0}
              />
            </div>

            <div
              ref={changedCardRef}
              className="group relative flex flex-col min-h-0 bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/6 overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.4),0_0_80px_rgba(94,106,210,0.08)] focus-within:border-[#5E6AD2]/30 focus-within:shadow-[0_0_0_1px_rgba(94,106,210,0.2),0_8px_40px_rgba(0,0,0,0.4),0_0_60px_rgba(94,106,210,0.1)]"
            >
              <Spotlight containerRef={changedCardRef} />
              <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/6 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#8B5CF6] to-[#A78BFA]" />
                  <span className="font-medium text-[#EDEDEF] text-sm tracking-tight">
                    Changed text
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => triggerFileInputWrapper("changed")}
                  tabIndex={-1}
                  className="relative flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-[#8A8F98] bg-white/[0.05] hover:bg-white/[0.08] hover:text-[#EDEDEF] rounded-lg border border-white/6 hover:border-white/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c] focus-visible:border-white/10"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Open File
                </button>
              </div>
              <textarea
                ref={changedTextareaRef}
                value={changedText}
                onChange={(e) => setChangedText(e.target.value)}
                placeholder="Paste or upload your changed text here..."
                className="relative flex-1 w-full p-5 bg-transparent text-[#EDEDEF] placeholder:text-[#8A8F98]/50 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/50 focus-visible:ring-inset font-mono text-sm leading-relaxed"
                spellCheck={false}
                tabIndex={0}
              />
            </div>
          </div>
        ) : null}
        <div
          className={`${
            viewMode === "diff" ? "flex" : "hidden"
          } flex-1 min-h-0 w-full p-6 lg:p-8 max-w-[90vw] mx-auto`}
        >
          <div className="relative flex flex-col flex-1 min-h-0 bg-gradient-to-b from-white/[0.05] to-white/[0.01] rounded-2xl border border-white/6 overflow-hidden focus-within:border-[#5E6AD2]/30 focus-within:shadow-[0_0_0_1px_rgba(94,106,210,0.2),0_0_60px_rgba(94,106,210,0.1)]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5E6AD2]/20 to-transparent" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/6 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#5E6AD2] to-[#6872D9]" />
                <span className="font-medium text-[#EDEDEF] text-sm tracking-tight">
                  Diff summary
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold tracking-tight">
                <span className="px-3 py-1 rounded-full bg-[#5E6AD2]/30 text-[#EEF2FF] border border-[#5E6AD2]/60 shadow-[0_0_10px_rgba(94,106,210,0.25)]">
                  +{diffStats.added}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#8B5CF6]/30 text-[#F5E9FF] border border-[#8B5CF6]/60 shadow-[0_0_10px_rgba(139,92,246,0.25)]">
                  -{diffStats.removed}
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden" style={{ borderRadius: "16px" }}>
              <DiffEditor
                original={originalText}
                modified={changedText}
                language="javascript"
                theme="bun-dark"
                beforeMount={(monaco) => {
                  monaco.editor.defineTheme("bun-dark", {
                    base: "vs-dark",
                    inherit: true,
                    rules: [
                      { token: "comment", foreground: "8A8F98" },
                      { token: "keyword", foreground: "8B5CF6" },
                      { token: "delimiter", foreground: "EDEDEF" },
                      { token: "number", foreground: "5E6AD2" },
                      { token: "string", foreground: "F5D77B" },
                      { token: "type.identifier", foreground: "7DD3FC" },
                      { token: "identifier", foreground: "EDEDEF" },
                      { token: "operator", foreground: "5E6AD2" },
                    ],
                    colors: {
                      "editor.background": "#0A0A0C",
                      "editor.foreground": "#EDEDEF",
                      "editorLineNumber.foreground": "#4B4F57",
                      "editorLineNumber.activeForeground": "#A7AEB8",
                      "editor.selectionBackground": "#5E6AD24D",
                      "editor.inactiveSelectionBackground": "#5E6AD233",
                      "editorCursor.foreground": "#EDEDEF",
                      "editorWhitespace.foreground": "#2F3238",
                      "editorIndentGuide.background": "#2A2D33",
                      "editorIndentGuide.activeBackground": "#3C4048",
                      "editor.lineHighlightBackground": "#111118",
                      "editor.lineHighlightBorder": "#1D1F26",
                      "editor.selectionHighlightBackground": "#5E6AD226",
                      "editorBracketMatch.background": "#1A1C24",
                      "editorBracketMatch.border": "#5E6AD280",
                      "editorWidget.background": "#0B0B10",
                      "editorWidget.border": "#1C1F26",
                      "editorHoverWidget.background": "#0B0B10",
                      "editorHoverWidget.border": "#1C1F26",
                      "diffEditor.insertedTextBackground": "#5E6AD244",
                      "diffEditor.removedTextBackground": "#8B5CF644",
                      "diffEditor.insertedLineBackground": "#5E6AD222",
                      "diffEditor.removedLineBackground": "#8B5CF622",
                      "diffEditor.border": "#1C1F26",
                    },
                  });
                }}
                originalModelPath="inmemory://diff/original.js"
                modifiedModelPath="inmemory://diff/modified.js"
                keepCurrentOriginalModel
                keepCurrentModifiedModel
                onMount={(editor) => {
                  diffEditorRef.current = editor;
                }}
                height="100%"
                options={{
                  automaticLayout: true,
                  renderSideBySide: true,
                  scrollBeyondLastLine: false,
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  wordWrap: "on",
                  fontSize: 14,
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  padding: { top: 16, bottom: 16 },
                  scrollbar: {
                    vertical: "visible",
                    horizontal: "visible",
                    verticalScrollbarSize: 12,
                    horizontalScrollbarSize: 12,
                    useShadows: false,
                    handleMouseWheel: true,
                  },
                  overviewRulerLanes: 0,
                  hideCursorInOverviewRuler: true,
                  overviewRulerBorder: false,
                  contextmenu: false,
                }}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="relative sticky bottom-0 px-6 py-5 border-t border-white/6 bg-[#0a0a0c]/80 backdrop-blur-xl z-40">
        <div className="absolute inset-0 bg-gradient-to-t from-[#5E6AD2]/3 to-transparent pointer-events-none" />
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={loadSample}
            tabIndex={-1}
            className="group relative flex items-center gap-2 px-5 py-3 font-medium text-sm rounded-xl transition-all duration-300 bg-white/5 hover:bg-white/10 text-[#EDEDEF] border border-white/6 hover:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]"
          >
            <FileText className="w-4.5 h-4.5" />
            Load Sample
          </button>
          <button
            type="button"
            onClick={toggleViewMode}
            disabled={!canDiff}
            ref={findDiffButtonRef}
            tabIndex={viewMode === "input" ? 0 : -1}
            className={`group relative flex items-center gap-2.5 px-8 py-3 font-medium text-sm rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c] ${
              !canDiff
                ? "bg-white/5 text-white/30 cursor-not-allowed"
                : "bg-gradient-to-r from-[#5E6AD2] to-[#6872D9] hover:from-[#6872D9] hover:to-[#5E6AD2] text-white shadow-[0_0_0_1px_rgba(94,106,210,0.3),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_8px_24px_rgba(94,106,210,0.4),inset_0_1px_0_0_rgba(255,255,255,0.25)] active:scale-[0.98] focus-visible:ring-[#5E6AD2]"
            }`}
          >
            <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 animate-shimmer" />
            </div>
            {viewMode === "input" ? (
              <>
                <ArrowRightLeft className="w-4.5 h-4.5" />
                Find Difference
              </>
            ) : (
              <>
                <FileText className="w-4.5 h-4.5" />
                Back to Edit
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
