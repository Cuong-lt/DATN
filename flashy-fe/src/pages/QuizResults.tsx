import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  X,
  Trophy,
  ListChecks,
  CheckCircle,
  XCircle,
  RotateCcw,
  RefreshCw,
  Share2,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { getQuizById, type QuizResponse } from "../services/quizService";
import "./QuizResults.css";

interface LegacyAnswer {
  flashcardId?: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
}

interface LegacyState {
  setTitle: string;
  setId: number;
  answers: LegacyAnswer[];
  totalQuestions: number;
}

interface QuizIdState {
  quizId: number;
}

type ResultsState = LegacyState | QuizIdState | null;

function isQuizIdState(state: ResultsState): state is QuizIdState {
  return state !== null && "quizId" in state;
}

function isLegacyState(state: ResultsState): state is LegacyState {
  return state !== null && "answers" in state && "setTitle" in state;
}

interface NormalizedResult {
  setTitle: string;
  setId: number;
  quizId?: number;
  totalQuestions: number;
  correctCount: number;
  answers: {
    flashcardId?: number;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    correct: boolean;
  }[];
}

function normalizeFromApi(quiz: QuizResponse): NormalizedResult {
  return {
    setTitle: quiz.setTitle,
    setId: quiz.setId,
    quizId: quiz.id,
    totalQuestions: quiz.totalQuestion,
    correctCount: quiz.score,
    answers: quiz.answers.map((a) => ({
      flashcardId: a.flashcardId,
      question: a.term,
      userAnswer: a.userAnswer,
      correctAnswer: a.correctAnswer,
      correct: a.isCorrect,
    })),
  };
}

function normalizeFromLegacy(state: LegacyState): NormalizedResult {
  const correctCount = state.answers.filter((a) => a.correct).length;
  return {
    setTitle: state.setTitle,
    setId: state.setId,
    totalQuestions: state.totalQuestions,
    correctCount,
    answers: state.answers,
  };
}

export default function QuizResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
const [sidebarOpen, setSidebarOpen] = useState(true);
  const [result, setResult] = useState<NormalizedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const reviewRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const state = location.state as ResultsState;
    const quizIdParam = searchParams.get("id");

    if (isQuizIdState(state)) {
      loadQuizFromApi(state.quizId);
    } else if (quizIdParam) {
      loadQuizFromApi(Number(quizIdParam));
    } else if (isLegacyState(state)) {
      setResult(normalizeFromLegacy(state));
      setLoading(false);
    } else {
      setError("No quiz results found. Take a quiz first!");
      setLoading(false);
    }
  }, []);

  const loadQuizFromApi = async (quizId: number) => {
    try {
      const res = await getQuizById(quizId);
      setResult(normalizeFromApi(res.data));
    } catch {
      setError("Failed to load quiz results");
    } finally {
      setLoading(false);
    }
  };

  // Track which card is most visible as user scrolls
  const handleScroll = useCallback(() => {
    if (!result) return;
    const container = mainRef.current;
    if (!container) return;

    let closestIdx = -1;
    let closestDist = Infinity;
    const containerCenter = container.scrollTop + container.clientHeight / 2;

    reviewRefs.current.forEach((el, idx) => {
      if (!el) return;
      const elCenter = el.offsetTop + el.offsetHeight / 2;
      const dist = Math.abs(containerCenter - elCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    if (closestIdx !== -1 && closestIdx !== activeIndex) {
      setActiveIndex(closestIdx);
    }
  }, [result, activeIndex]);

  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToQuestion = (idx: number) => {
    setActiveIndex(idx);
    reviewRefs.current[idx]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  if (loading) {
    return (
      <div className="results-page">
        <div className="results-empty">Loading results...</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="results-page">
        <header className="results-header">
          <div className="results-header-left">
            <h1>Quiz Results</h1>
          </div>
          <button
            className="results-close-btn"
            onClick={() => navigate("/home")}
          >
            <X size={22} />
          </button>
        </header>
        <div className="results-empty">
          {error || "No quiz results found. Take a quiz first!"}
        </div>
      </div>
    );
  }

  const { setTitle, setId, totalQuestions, correctCount, answers } = result;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const wrongIds = answers
    .filter((a) => !a.correct && a.flashcardId != null)
    .map((a) => a.flashcardId as number);

  const getMessage = () => {
    if (scorePercent >= 90) return "Tuyệt vời!";
    if (scorePercent >= 70) return "Tốt lắm!";
    if (scorePercent >= 50) return "Tốt!";
    return "Bạn cần cố gắng hơn!";
  };

  const getSubMessage = () => {
    if (scorePercent >= 90) return "Bạn đã nắm vững hầu hết các khái niệm.";
    if (scorePercent >= 70) return "Bạn đã nắm vững phần lớn các khái niệm.";
    if (scorePercent >= 50) return "Bạn đang tiến bộ, tiếp tục học tập.";
    return "Xem lại các thẻ và thử lại.";
  };

  return (
    <div className="results-page">
      <header className="results-header">
        <div className="results-header-left">
          <h1>Quiz - {setTitle}</h1>
        </div>
        <button className="results-close-btn" onClick={() => navigate("/home")}>
          <X size={22} />
        </button>
      </header>

      <div className="results-body">
        {/* Question sidebar */}
        <aside
          className={`results-sidebar ${sidebarOpen ? "open" : "collapsed"}`}
        >
          <div className="results-sidebar-inner">
            <div className="results-sidebar-header">
              {sidebarOpen && <h3>Questions</h3>}
              <button
                className="results-sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <ChevronsLeft size={18} />
                ) : (
                  <ChevronsRight size={18} />
                )}
              </button>
            </div>
            {sidebarOpen && (
              <>
                <div className="results-sidebar-grid">
                  {answers.map((a, idx) => (
                    <button
                      key={idx}
                      className={`results-q-btn ${a.correct ? "correct" : "wrong"} ${activeIndex === idx ? "active" : ""}`}
                      onClick={() => scrollToQuestion(idx)}
                      title={`Q${idx + 1}: ${a.question}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <div className="results-sidebar-summary">
                  <div className="sidebar-stat correct">
                    <CheckCircle size={14} />
                    <span>{correctCount} đúng</span>
                  </div>
                  <div className="sidebar-stat wrong">
                    <XCircle size={14} />
                    <span>{totalQuestions - correctCount} sai</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="results-main" ref={mainRef}>
          <div className="results-content">
            {/* Score summary card */}
            <div className="results-score-hero">
              <div className="trophy-icon">
                <Trophy size={36} />
              </div>
              <div className="score-hero-info">
                <h2>{getMessage()}</h2>
                <p>{getSubMessage()}</p>
              </div>
              <div className="score-hero-number">
                <span className="score-hero-percent">{scorePercent}%</span>
                <span className="score-hero-fraction">
                  {correctCount}/{totalQuestions}
                </span>
              </div>
            </div>

            {/* Review cards */}
            <div className="review-section-header">
              <ListChecks size={20} />
              <h3>Xem lại câu trả lời</h3>
              <span className="review-count">{answers.length} Câu hỏi</span>
            </div>

            <div className="review-cards-list">
              {answers.map((a, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    reviewRefs.current[i] = el;
                  }}
                  className={`review-card-full ${a.correct ? "is-correct" : "is-wrong"}`}
                >
                  {/* Card header */}
                  <div className="rcard-header">
                    <span className="rcard-label">Định nghĩa</span>
                    <div className="rcard-meta">
                      <span className="rcard-qnum">Q{i + 1}</span>
                      <span
                        className={`rcard-status ${a.correct ? "correct" : "wrong"}`}
                      >
                        {a.correct ? (
                          <>
                            <CheckCircle size={14} /> Đúng
                          </>
                        ) : (
                          <>
                            <XCircle size={14} /> Sai
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Term display */}
                  <div className="rcard-term">{a.question}</div>

                  {/* Answer feedback */}
                  {a.correct ? (
                    <div className="rcard-feedback">
                      <p className="rcard-feedback-label correct-label">
                        Your answer is correct!
                      </p>
                      <div className="rcard-answer-box correct-box">
                        {a.userAnswer}
                      </div>
                    </div>
                  ) : (
                    <div className="rcard-feedback">
                      <p className="rcard-feedback-label wrong-label">
                        Câu trả lời của bạn
                      </p>
                      <div className="rcard-answer-box wrong-box">
                        {a.userAnswer}
                      </div>
                      <p className="rcard-feedback-label correct-label">
                        Câu trả lời đúng
                      </p>
                      <div className="rcard-answer-box correct-box">
                        {a.correctAnswer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="results-actions">
              <button
                className="btn-restart"
                onClick={() => navigate(`/quiz?id=${setId}`)}
              >
                <RotateCcw size={18} /> Làm lại Quiz
              </button>
              {wrongIds.length > 0 && (
                <button
                  className="btn-retry-wrong"
                  onClick={() =>
                    navigate(`/quiz?id=${setId}`, {
                      state: { retryIds: wrongIds },
                    })
                  }
                >
                  <RefreshCw size={18} /> Làm lại câu sai ({wrongIds.length})
                </button>
              )}
              <button className="btn-share">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
