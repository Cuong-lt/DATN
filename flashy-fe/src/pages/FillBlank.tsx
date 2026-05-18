import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  SkipForward,
  CheckCircle2,
  XCircle,
  RotateCcw,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { getSetById, type FlashcardSetResponse } from "../services/setService";
import "./FillBlank.css";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

interface FillBlankConfig {
  questionCount: number | "all";
  direction: "def-to-term" | "term-to-def";
}

interface Question {
  flashcardId: number;
  prompt: string;
  correctAnswer: string;
  promptLabel: string;
  inputPlaceholder: string;
}

interface Answer {
  flashcardId: number;
  prompt: string;
  correctAnswer: string;
  userAnswer: string;
  correct: boolean;
  skipped: boolean;
}

type FeedbackState = "none" | "correct" | "wrong";

export default function FillBlank() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const setId = Number(searchParams.get("id"));
  const initialRetryIds =
    (location.state as { internalRetryIds?: number[] } | null)
      ?.internalRetryIds ?? null;
  const [internalRetryIds, setInternalRetryIds] = useState<number[] | null>(
    initialRetryIds,
  );
  const isRetryMode = !!internalRetryIds?.length;

  const [studySet, setStudySet] = useState<FlashcardSetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [config, setConfig] = useState<FillBlankConfig>({
    questionCount: "all",
    direction: "def-to-term",
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>("none");
  const [hintLevel, setHintLevel] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [done, setDone] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!setId) {
      setError("Study set not found");
      setLoading(false);
      return;
    }
    getSetById(setId)
      .then((res) => {
        if (res.data.flashcards.length < 1) {
          setError("Bộ thẻ này chưa có flashcard nào.");
        } else {
          setStudySet(res.data);
        }
      })
      .catch(() =>
        setError("Bộ thẻ không tồn tại hoặc bạn không có quyền truy cập."),
      )
      .finally(() => setLoading(false));
  }, [setId]);

  const questions = useMemo<Question[]>(() => {
    if (!studySet || !sessionStarted) return [];
    const allCards = studySet.flashcards;
    const targetCards = internalRetryIds?.length
      ? allCards.filter((c) => internalRetryIds.includes(c.id))
      : allCards;
    const count =
      config.questionCount === "all"
        ? targetCards.length
        : Math.min(config.questionCount, targetCards.length);
    return shuffle(targetCards)
      .slice(0, count)
      .map((c) => ({
        flashcardId: c.id,
        prompt: config.direction === "def-to-term" ? c.definition : c.term,
        correctAnswer:
          config.direction === "def-to-term" ? c.term : c.definition,
        promptLabel:
          config.direction === "def-to-term" ? "Định nghĩa" : "Thuật ngữ",
        inputPlaceholder:
          config.direction === "def-to-term"
            ? "Nhập thuật ngữ..."
            : "Nhập định nghĩa...",
      }));
  }, [studySet, sessionStarted, config, internalRetryIds]);

  const total = questions.length;
  const current = questions[currentIndex];

  useEffect(() => {
    if (feedback === "none" && sessionStarted && !done) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentIndex, feedback, sessionStarted, done]);

  const getHint = (answer: string, level: number): string => {
    if (level === 0) return "";
    const revealed = Math.min(level, answer.length);
    return (
      answer.slice(0, revealed) + "_ ".repeat(answer.length - revealed).trim()
    );
  };

  const handleCheck = () => {
    if (feedback !== "none" || !current) return;
    const isCorrect = normalize(input) === normalize(current.correctAnswer);
    setFeedback(isCorrect ? "correct" : "wrong");
    const newAnswer: Answer = {
      flashcardId: current.flashcardId,
      prompt: current.prompt,
      correctAnswer: current.correctAnswer,
      userAnswer: input.trim(),
      correct: isCorrect,
      skipped: false,
    };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    if (isCorrect) {
      setTimeout(() => advance(newAnswers), 900);
    }
  };

  const handleSkip = () => {
    if (feedback !== "none" || !current) return;
    advance([
      ...answers,
      {
        flashcardId: current.flashcardId,
        prompt: current.prompt,
        correctAnswer: current.correctAnswer,
        userAnswer: "",
        correct: false,
        skipped: true,
      },
    ]);
  };

  const handleNext = () => {
    advance(answers);
  };

  const advance = (finalAnswers: Answer[]) => {
    if (currentIndex >= total - 1) {
      setAnswers(finalAnswers);
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setInput("");
      setFeedback("none");
      setHintLevel(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (feedback === "none") handleCheck();
      else if (feedback === "wrong") handleNext();
    }
  };

  const handleHint = () => {
    if (!current) return;
    const maxLevel = current.correctAnswer.length;
    if (hintLevel < maxLevel) {
      const next = hintLevel + 1;
      setHintLevel(next);
      setInput(current.correctAnswer.slice(0, next));
    }
  };

  const resetSession = (
    retryWith: number[] | null,
    autoStart: boolean = false,
  ) => {
    setInternalRetryIds(retryWith);
    setSessionStarted(autoStart);
    setCurrentIndex(0);
    setInput("");
    setAnswers([]);
    setFeedback("none");
    setHintLevel(0);
    setDone(false);
  };

  const handleRestart = () => resetSession(null, true);

  const handleRetryWrong = (wrongIds: number[]) => resetSession(wrongIds, true);

  const getQuestionState = (idx: number) => {
    if (idx < answers.length) return answers[idx].correct ? "correct" : "wrong";
    if (idx === currentIndex) return "current";
    return "default";
  };

  const jumpTo = (idx: number) => {
    if (idx <= answers.length && !done) {
      setCurrentIndex(idx);
      setInput("");
      setFeedback("none");
      setHintLevel(0);
    }
  };

  if (loading) {
    return (
      <div className="fb-page">
        <div className="fb-loading">Đang tải...</div>
      </div>
    );
  }

  if (error || !studySet) {
    return (
      <div className="fb-page">
        <header className="fb-header">
          <h1>Điền từ</h1>
          <button className="fb-close-btn" onClick={() => navigate(-1)}>
            <X size={22} />
          </button>
        </header>
        <div className="fb-error">{error || "Không tải được bộ thẻ"}</div>
      </div>
    );
  }

  // Config screen
  if (!sessionStarted) {
    const availableCount = isRetryMode
      ? (internalRetryIds?.filter((id) =>
          studySet.flashcards.some((c) => c.id === id),
        ).length ?? 0)
      : studySet.flashcards.length;
    const countOptions = [10, 20].filter((n) => n < availableCount);

    return (
      <div className="fb-page">
        <header className="fb-header">
          <h1>{studySet.title} — Điền từ</h1>
          <button className="fb-close-btn" onClick={() => navigate(-1)}>
            <X size={22} />
          </button>
        </header>

        <div className="fb-config-screen">
          <div className="fb-config-card">
            {isRetryMode && (
              <div className="fb-retry-badge">
                Ôn lại {availableCount} câu sai
              </div>
            )}

            <div className="fb-config-meta">
              <h2 className="fb-config-title">{studySet.title}</h2>
              <p className="fb-config-subtitle">
                {availableCount} thẻ &middot; {studySet.flashcards.length} tổng
              </p>
            </div>

            <div className="fb-config-section">
              <h3 className="fb-config-section-label">Số câu hỏi</h3>
              <div className="fb-config-options">
                {countOptions.map((n) => (
                  <button
                    key={n}
                    className={`fb-config-opt-btn ${config.questionCount === n ? "active" : ""}`}
                    onClick={() =>
                      setConfig((c) => ({ ...c, questionCount: n }))
                    }
                  >
                    {n}
                  </button>
                ))}
                <button
                  className={`fb-config-opt-btn ${config.questionCount === "all" ? "active" : ""}`}
                  onClick={() =>
                    setConfig((c) => ({ ...c, questionCount: "all" }))
                  }
                >
                  Tất cả ({availableCount})
                </button>
              </div>
            </div>

            <div className="fb-config-section">
              <h3 className="fb-config-section-label">Hướng học</h3>
              <div className="fb-config-options">
                <button
                  className={`fb-config-opt-btn ${config.direction === "def-to-term" ? "active" : ""}`}
                  onClick={() =>
                    setConfig((c) => ({ ...c, direction: "def-to-term" }))
                  }
                >
                  Điền thuật ngữ
                </button>
                <button
                  className={`fb-config-opt-btn ${config.direction === "term-to-def" ? "active" : ""}`}
                  onClick={() =>
                    setConfig((c) => ({ ...c, direction: "term-to-def" }))
                  }
                >
                  Điền định nghĩa
                </button>
              </div>
            </div>

            <button
              className="fb-start-btn"
              onClick={() => setSessionStarted(true)}
            >
              Bắt đầu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (done) {
    const correct = answers.filter((a) => a.correct).length;
    const skipped = answers.filter((a) => a.skipped).length;
    const wrong = answers.filter((a) => !a.correct && !a.skipped).length;
    const pct = Math.round((correct / total) * 100);
    const wrongIds = answers
      .filter((a) => !a.correct && !a.skipped)
      .map((a) => a.flashcardId);

    return (
      <div className="fb-page">
        <header className="fb-header">
          <h1>{studySet.title} — Điền từ</h1>
          <button className="fb-close-btn" onClick={() => navigate(-1)}>
            <X size={22} />
          </button>
        </header>
        <div className="fb-results">
          <div
            className="fb-results-score-ring"
            style={{ "--pct": pct } as React.CSSProperties}
          >
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" className="fb-ring-bg" />
              <circle
                cx="60"
                cy="60"
                r="50"
                className="fb-ring-fill"
                strokeDasharray={`${(pct / 100) * 314} 314`}
              />
            </svg>
            <div className="fb-ring-text">
              <span className="fb-ring-pct">{pct}%</span>
              <span className="fb-ring-label">Đúng</span>
            </div>
          </div>

          <div className="fb-results-stats">
            <div className="fb-stat correct">
              <CheckCircle2 size={18} />
              <span>{correct} đúng</span>
            </div>
            <div className="fb-stat wrong">
              <XCircle size={18} />
              <span>{wrong} sai</span>
            </div>
            {skipped > 0 && (
              <div className="fb-stat skipped">
                <SkipForward size={18} />
                <span>{skipped} bỏ qua</span>
              </div>
            )}
          </div>

          <div className="fb-results-list">
            {answers.map((a, i) => (
              <div
                key={i}
                className={`fb-result-row ${a.correct ? "correct" : a.skipped ? "skipped" : "wrong"}`}
              >
                <span className="fb-result-index">{i + 1}</span>
                <div className="fb-result-content">
                  <span className="fb-result-prompt">{a.prompt}</span>
                  {a.correct && (
                    <span className="fb-result-answer correct-answer">
                      {a.correctAnswer}
                    </span>
                  )}
                  {!a.correct && !a.skipped && (
                    <span className="fb-result-answer wrong-answer">
                      {a.userAnswer || "—"} → {a.correctAnswer}
                    </span>
                  )}
                  {a.skipped && (
                    <span className="fb-result-answer skipped-answer">
                      Bỏ qua → {a.correctAnswer}
                    </span>
                  )}
                </div>
                <span className="fb-result-icon">
                  {a.correct ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <XCircle size={18} />
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="fb-results-actions">
            <button className="fb-btn-restart" onClick={handleRestart}>
              <RotateCcw size={16} /> Làm lại
            </button>
            {wrongIds.length > 0 && (
              <button
                className="fb-btn-retry-wrong"
                onClick={() => handleRetryWrong(wrongIds)}
              >
                <RefreshCw size={16} /> Câu sai ({wrongIds.length})
              </button>
            )}
            <button className="fb-btn-back" onClick={() => navigate(-1)}>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="fb-page">
        <div className="fb-error">Không thể tạo câu hỏi từ bộ thẻ này.</div>
      </div>
    );
  }

  const hint = getHint(current.correctAnswer, hintLevel);
  const isHintExhausted = hintLevel >= current.correctAnswer.length;

  return (
    <div className="fb-page">
      <header className="fb-header">
        <div className="fb-header-left">
          <h1>{studySet.title} — Điền từ</h1>
        </div>
        <button className="fb-close-btn" onClick={() => navigate(-1)}>
          <X size={22} />
        </button>
      </header>

      <div className="fb-body">
        {/* Sidebar */}
        <aside className={`fb-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
          <div className="fb-sidebar-inner">
            <div className="fb-sidebar-head">
              <h3>Câu hỏi</h3>
              <button
                className="fb-sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <ChevronLeft size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>
            </div>
            {sidebarOpen && (
              <>
                <div className="fb-sidebar-grid">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      className={`fb-q-btn ${getQuestionState(idx)}`}
                      onClick={() => jumpTo(idx)}
                      disabled={idx > answers.length}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="fb-skip-btn"
                  onClick={handleSkip}
                  disabled={feedback !== "none"}
                >
                  <SkipForward size={16} /> Bỏ qua
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="fb-main">
          <div className="fb-progress-wrap">
            <div className="fb-progress-bar">
              <div
                className="fb-progress-fill"
                style={{ width: `${(answers.length / total) * 100}%` }}
              />
            </div>
            <span className="fb-progress-text">
              {answers.length} / {total}
            </span>
          </div>

          <div className={`fb-card ${feedback}`}>
            <div className="fb-card-top">
              <span className="fb-question-badge">
                {currentIndex + 1}
                <span className="fb-q-sep"> / </span>
                {total}
              </span>
              <span className="fb-direction-badge">
                {config.direction === "def-to-term"
                  ? "Điền thuật ngữ"
                  : "Điền định nghĩa"}
              </span>
            </div>

            <div className="fb-prompt-section">
              <span className="fb-prompt-label">{current.promptLabel}</span>
              <p className="fb-prompt-text">{current.prompt}</p>
            </div>

            {hint && (
              <div className="fb-hint-row">
                <Lightbulb size={13} className="fb-hint-icon" />
                <span className="fb-hint-chars">{hint}</span>
              </div>
            )}

            <div className="fb-answer-section">
              <input
                ref={inputRef}
                className={`fb-input ${feedback}`}
                type="text"
                placeholder={current.inputPlaceholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={feedback !== "none"}
                autoComplete="off"
                spellCheck={false}
              />
              {feedback === "none" && (
                <span className="fb-enter-hint">↵ Enter để kiểm tra</span>
              )}
            </div>

            {feedback === "none" && (
              <div className="fb-action-row">
                <button
                  className="fb-hint-btn"
                  onClick={handleHint}
                  disabled={isHintExhausted}
                >
                  <Lightbulb size={15} /> Gợi ý
                </button>
                <button
                  className="fb-check-btn"
                  onClick={handleCheck}
                  disabled={!input.trim()}
                >
                  Kiểm tra
                </button>
              </div>
            )}

            {feedback === "correct" && (
              <div className="fb-correct-banner">
                <CheckCircle2 size={20} />
                <span>Chính xác!</span>
              </div>
            )}

            {feedback === "wrong" && (
              <div className="fb-wrong-section">
                <div className="fb-answer-comparison">
                  <div className="fb-compare-item">
                    <span className="fb-compare-label wrong-label">
                      Câu trả lời của bạn
                    </span>
                    <div className="fb-compare-box wrong-box">
                      {input.trim() || "(bỏ trống)"}
                    </div>
                  </div>
                  <div className="fb-compare-item">
                    <span className="fb-compare-label correct-label">
                      Đáp án đúng
                    </span>
                    <div className="fb-compare-box correct-box">
                      {current.correctAnswer}
                    </div>
                  </div>
                </div>
                <button className="fb-next-btn" onClick={handleNext}>
                  Tiếp theo <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
