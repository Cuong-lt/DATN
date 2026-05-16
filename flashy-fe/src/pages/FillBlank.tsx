import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  SkipForward,
  CheckCircle2,
  XCircle,
  RotateCcw,
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

interface Question {
  flashcardId: number;
  definition: string;
  term: string;
}

interface Answer {
  flashcardId: number;
  term: string;
  userAnswer: string;
  correct: boolean;
  skipped: boolean;
}

type FeedbackState = "none" | "correct" | "wrong";

export default function FillBlank() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setId = Number(searchParams.get("id"));

  const [studySet, setStudySet] = useState<FlashcardSetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    if (!studySet) return [];
    return shuffle(
      studySet.flashcards.map((c) => ({
        flashcardId: c.id,
        definition: c.definition,
        term: c.term,
      })),
    );
  }, [studySet]);

  const total = questions.length;
  const current = questions[currentIndex];

  useEffect(() => {
    if (feedback === "none") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentIndex, feedback]);

  const getHint = (term: string, level: number): string => {
    if (level === 0) return "";
    const revealed = Math.min(level, term.length);
    return term.slice(0, revealed) + "_ ".repeat(term.length - revealed).trim();
  };

  const handleCheck = () => {
    if (feedback !== "none" || !current) return;
    const isCorrect = normalize(input) === normalize(current.term);
    setFeedback(isCorrect ? "correct" : "wrong");
    const newAnswer: Answer = {
      flashcardId: current.flashcardId,
      term: current.term,
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
    const newAnswer: Answer = {
      flashcardId: current.flashcardId,
      term: current.term,
      userAnswer: "",
      correct: false,
      skipped: true,
    };
    advance([...answers, newAnswer]);
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
    const maxLevel = current.term.length;
    if (hintLevel < maxLevel) {
      const next = hintLevel + 1;
      setHintLevel(next);
      setInput(current.term.slice(0, next));
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setInput("");
    setAnswers([]);
    setFeedback("none");
    setHintLevel(0);
    setDone(false);
  };

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
    return <div className="fb-page"><div className="fb-loading">Đang tải...</div></div>;
  }

  if (error || !studySet) {
    return (
      <div className="fb-page">
        <header className="fb-header">
          <h1>Điền từ</h1>
          <button className="fb-close-btn" onClick={() => navigate(-1)}><X size={22} /></button>
        </header>
        <div className="fb-error">{error || "Không tải được bộ thẻ"}</div>
      </div>
    );
  }

  if (done) {
    const correct = answers.filter((a) => a.correct).length;
    const skipped = answers.filter((a) => a.skipped).length;
    const wrong = answers.filter((a) => !a.correct && !a.skipped).length;
    const pct = Math.round((correct / total) * 100);

    return (
      <div className="fb-page">
        <header className="fb-header">
          <h1>{studySet.title} — Điền từ</h1>
          <button className="fb-close-btn" onClick={() => navigate(-1)}><X size={22} /></button>
        </header>
        <div className="fb-results">
          <div className="fb-results-score-ring" style={{ "--pct": pct } as React.CSSProperties}>
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" className="fb-ring-bg" />
              <circle cx="60" cy="60" r="50" className="fb-ring-fill"
                strokeDasharray={`${(pct / 100) * 314} 314`} />
            </svg>
            <div className="fb-ring-text">
              <span className="fb-ring-pct">{pct}%</span>
              <span className="fb-ring-label">Đúng</span>
            </div>
          </div>

          <div className="fb-results-stats">
            <div className="fb-stat correct"><CheckCircle2 size={18} /><span>{correct} đúng</span></div>
            <div className="fb-stat wrong"><XCircle size={18} /><span>{wrong} sai</span></div>
            {skipped > 0 && <div className="fb-stat skipped"><SkipForward size={18} /><span>{skipped} bỏ qua</span></div>}
          </div>

          <div className="fb-results-list">
            {answers.map((a, i) => (
              <div key={i} className={`fb-result-row ${a.correct ? "correct" : a.skipped ? "skipped" : "wrong"}`}>
                <span className="fb-result-index">{i + 1}</span>
                <div className="fb-result-content">
                  <span className="fb-result-term">{a.term}</span>
                  {!a.correct && !a.skipped && (
                    <span className="fb-result-user">Bạn: "{a.userAnswer || "—"}"</span>
                  )}
                  {a.skipped && <span className="fb-result-user">Bỏ qua</span>}
                </div>
                <span className="fb-result-icon">
                  {a.correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </span>
              </div>
            ))}
          </div>

          <div className="fb-results-actions">
            <button className="fb-btn-restart" onClick={handleRestart}>
              <RotateCcw size={16} /> Làm lại
            </button>
            <button className="fb-btn-back" onClick={() => navigate(-1)}>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hint = getHint(current.term, hintLevel);

  return (
    <div className="fb-page">
      <header className="fb-header">
        <h1>{studySet.title} — Điền từ</h1>
        <button className="fb-close-btn" onClick={() => navigate(-1)}><X size={22} /></button>
      </header>

      <div className="fb-body">
        {/* Sidebar */}
        <aside className={`fb-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
          <div className="fb-sidebar-inner">
            <div className="fb-sidebar-head">
              <h3>Câu hỏi</h3>
              <button className="fb-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
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
                <button className="fb-skip-btn" onClick={handleSkip} disabled={feedback !== "none"}>
                  <SkipForward size={16} /> Bỏ qua
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="fb-main">
          <div className="fb-progress-bar">
            <div className="fb-progress-fill" style={{ width: `${(answers.length / total) * 100}%` }} />
          </div>
          <span className="fb-progress-text">{answers.length} / {total}</span>

          <div className={`fb-card ${feedback}`}>
            <p className="fb-card-label">Định nghĩa</p>
            <p className="fb-definition">{current.definition}</p>

            {hint && (
              <p className="fb-hint-text">Gợi ý: <strong>{hint}</strong></p>
            )}

            <div className="fb-input-row">
              <input
                ref={inputRef}
                className={`fb-input ${feedback}`}
                type="text"
                placeholder="Nhập thuật ngữ..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={feedback !== "none"}
                autoComplete="off"
              />
            </div>

            {feedback === "none" && (
              <div className="fb-actions">
                <button className="fb-hint-btn" onClick={handleHint} disabled={hintLevel >= current.term.length}>
                  <Lightbulb size={16} /> Gợi ý
                </button>
                <button className="fb-check-btn" onClick={handleCheck} disabled={!input.trim()}>
                  Kiểm tra
                </button>
              </div>
            )}

            {feedback === "correct" && (
              <div className="fb-feedback correct">
                <CheckCircle2 size={20} /> Chính xác!
              </div>
            )}

            {feedback === "wrong" && (
              <div className="fb-feedback wrong">
                <XCircle size={20} />
                <div>
                  <p>Sai rồi. Đáp án đúng:</p>
                  <strong>{current.term}</strong>
                </div>
                <button className="fb-next-btn" onClick={handleNext}>Tiếp theo</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
