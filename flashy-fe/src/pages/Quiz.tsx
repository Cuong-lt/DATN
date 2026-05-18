import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Lightbulb,
  Star,
  SkipForward,
} from "lucide-react";
import { getSetById, type FlashcardSetResponse } from "../services/setService";
import { submitQuiz, type QuizAnswerRequest } from "../services/quizService";
import "./Quiz.css";

interface QuizQuestion {
  flashcardId: number;
  term: string;
  correctAnswer: string;
  options: string[];
}

interface QuizConfig {
  questionCount: number | "all";
  direction: "term-to-def" | "def-to-term";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(
  set: FlashcardSetResponse,
  config: QuizConfig,
  retryIds?: number[]
): QuizQuestion[] {
  const allCards = set.flashcards;
  const targetCards = retryIds?.length
    ? allCards.filter((c) => retryIds.includes(c.id))
    : allCards;

  if (!targetCards.length || allCards.length < 2) return [];

  const count =
    config.questionCount === "all"
      ? targetCards.length
      : Math.min(config.questionCount, targetCards.length);

  const selected = shuffle(targetCards).slice(0, count);

  return shuffle(selected).map((card) => {
    const wrongPool = allCards.filter((c) => c.id !== card.id);
    const wrongAnswers = shuffle(wrongPool)
      .slice(0, 3)
      .map((c) =>
        config.direction === "term-to-def" ? c.definition : c.term
      );

    const term =
      config.direction === "term-to-def" ? card.term : card.definition;
    const correctAnswer =
      config.direction === "term-to-def" ? card.definition : card.term;

    return {
      flashcardId: card.id,
      term,
      correctAnswer,
      options: shuffle([correctAnswer, ...wrongAnswers]),
    };
  });
}

interface LocalAnswer {
  flashcardId: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
}

const OPTION_COLORS = ["#6B7FE0", "#E0A96B", "#6BC9E0", "#B56BE0"];

export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const setId = Number(searchParams.get("id"));
  const retryIds = (location.state as { retryIds?: number[] } | null)
    ?.retryIds;
  const isRetryMode = !!(retryIds?.length);

  const [studySet, setStudySet] = useState<FlashcardSetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    questionCount: "all",
    direction: "term-to-def",
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<LocalAnswer[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!setId) {
      setError("Study set not found");
      setLoading(false);
      return;
    }
    getSetById(setId)
      .then((res) => {
        if (res.data.flashcards.length < 2) {
          setError("Need at least 2 flashcards to start a quiz");
        } else {
          setStudySet(res.data);
        }
      })
      .catch(() =>
        setError("Bộ thẻ không tồn tại hoặc bạn không có quyền truy cập.")
      )
      .finally(() => setLoading(false));
  }, [setId]);

  const questions = useMemo(() => {
    if (!studySet || !quizStarted) return [];
    return generateQuestions(studySet, quizConfig, retryIds ?? undefined);
  }, [studySet, quizStarted, quizConfig, retryIds]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  const finishQuiz = async (finalAnswers: LocalAnswer[]) => {
    setSubmitting(true);
    try {
      const apiAnswers: QuizAnswerRequest[] = finalAnswers.map((a) => ({
        flashcardId: a.flashcardId,
        userAnswer: a.userAnswer,
      }));

      const res = await submitQuiz(setId, { answers: apiAnswers });

      navigate("/quiz-results", {
        state: { quizId: res.data.id },
        replace: true,
      });
    } catch {
      navigate("/quiz-results", {
        state: {
          setTitle: studySet?.title,
          setId,
          answers: finalAnswers.map((a) => ({
            flashcardId: a.flashcardId,
            question: a.question,
            userAnswer: a.userAnswer,
            correctAnswer: a.correctAnswer,
            correct: a.correct,
          })),
          totalQuestions,
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOptionClick = (idx: number) => {
    if (showFeedback || submitting) return;
    setSelected(idx);
    setShowFeedback(true);

    const userAnswer = currentQuestion.options[idx];
    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    const newAnswers: LocalAnswer[] = [
      ...answers,
      {
        flashcardId: currentQuestion.flashcardId,
        question: currentQuestion.term,
        userAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        correct: isCorrect,
      },
    ];

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setAnswers(newAnswers);
        setCurrentIndex(currentIndex + 1);
        setSelected(null);
        setShowFeedback(false);
      } else {
        finishQuiz(newAnswers);
      }
    }, 1000);
  };

  const handleSkip = () => {
    if (showFeedback || !currentQuestion || submitting) return;

    const newAnswers: LocalAnswer[] = [
      ...answers,
      {
        flashcardId: currentQuestion.flashcardId,
        question: currentQuestion.term,
        userAnswer: "(Bỏ qua)",
        correctAnswer: currentQuestion.correctAnswer,
        correct: false,
      },
    ];

    if (currentIndex < totalQuestions - 1) {
      setAnswers(newAnswers);
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const jumpToQuestion = (idx: number) => {
    if (idx <= answers.length) {
      setCurrentIndex(idx);
      setSelected(null);
      setShowFeedback(false);
    }
  };

  const getQuestionState = (idx: number) => {
    if (idx < answers.length) {
      return answers[idx].correct ? "correct" : "wrong";
    }
    if (idx === currentIndex) return "current";
    return "default";
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="quiz-loading">Đang tải quiz...</div>
      </div>
    );
  }

  if (error || !studySet) {
    return (
      <div className="quiz-page">
        <header className="quiz-header">
          <div className="quiz-header-left">
            <h1>Quiz</h1>
          </div>
          <button className="quiz-close-btn" onClick={() => navigate(-1)}>
            <X size={22} />
          </button>
        </header>
        <div className="quiz-error">{error || "Could not load quiz"}</div>
      </div>
    );
  }

  // Config screen shown before quiz starts
  if (!quizStarted) {
    const availableCount = isRetryMode
      ? (retryIds?.filter((id) =>
          studySet.flashcards.some((c) => c.id === id)
        ).length ?? 0)
      : studySet.flashcards.length;
    const countOptions = [10, 20].filter((n) => n < availableCount);

    return (
      <div className="quiz-page">
        <header className="quiz-header">
          <div className="quiz-header-left">
            <h1>{studySet.title} - Quiz</h1>
          </div>
          <button className="quiz-close-btn" onClick={() => navigate(-1)}>
            <X size={22} />
          </button>
        </header>

        <div className="quiz-config-screen">
          <div className="quiz-config-card">
            {isRetryMode && (
              <div className="quiz-retry-badge">
                Ôn lại {availableCount} câu sai
              </div>
            )}

            <div className="quiz-config-meta">
              <h2 className="quiz-config-title">{studySet.title}</h2>
              <p className="quiz-config-subtitle">
                {availableCount} thẻ &middot; {studySet.flashcards.length} tổng
              </p>
            </div>

            <div className="quiz-config-section">
              <h3 className="quiz-config-section-label">Số câu hỏi</h3>
              <div className="quiz-config-options">
                {countOptions.map((n) => (
                  <button
                    key={n}
                    className={`quiz-config-opt-btn ${quizConfig.questionCount === n ? "active" : ""}`}
                    onClick={() =>
                      setQuizConfig((c) => ({ ...c, questionCount: n }))
                    }
                  >
                    {n}
                  </button>
                ))}
                <button
                  className={`quiz-config-opt-btn ${quizConfig.questionCount === "all" ? "active" : ""}`}
                  onClick={() =>
                    setQuizConfig((c) => ({ ...c, questionCount: "all" }))
                  }
                >
                  Tất cả ({availableCount})
                </button>
              </div>
            </div>

            <div className="quiz-config-section">
              <h3 className="quiz-config-section-label">Hướng học</h3>
              <div className="quiz-config-options">
                <button
                  className={`quiz-config-opt-btn ${quizConfig.direction === "term-to-def" ? "active" : ""}`}
                  onClick={() =>
                    setQuizConfig((c) => ({ ...c, direction: "term-to-def" }))
                  }
                >
                  Thuật ngữ → Định nghĩa
                </button>
                <button
                  className={`quiz-config-opt-btn ${quizConfig.direction === "def-to-term" ? "active" : ""}`}
                  onClick={() =>
                    setQuizConfig((c) => ({ ...c, direction: "def-to-term" }))
                  }
                >
                  Định nghĩa → Thuật ngữ
                </button>
              </div>
            </div>

            <button
              className="quiz-start-btn"
              onClick={() => setQuizStarted(true)}
            >
              Bắt đầu Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="quiz-page">
        <div className="quiz-error">Không thể tạo câu hỏi từ bộ thẻ này.</div>
      </div>
    );
  }

  const getOptionClass = (idx: number) => {
    if (!showFeedback) return selected === idx ? "selected" : "";
    const opt = currentQuestion.options[idx];
    if (opt === currentQuestion.correctAnswer) return "correct";
    if (idx === selected) return "wrong";
    return "";
  };

  const cardLabel =
    quizConfig.direction === "term-to-def" ? "Thuật ngữ" : "Định nghĩa";
  const selectLabel =
    quizConfig.direction === "term-to-def"
      ? "Chọn định nghĩa phù hợp"
      : "Chọn thuật ngữ phù hợp";

  return (
    <div className="quiz-page">
      <header className="quiz-header">
        <div className="quiz-header-left">
          <h1>{studySet.title} - Quiz</h1>
        </div>
        <button className="quiz-close-btn" onClick={() => navigate(-1)}>
          <X size={22} />
        </button>
      </header>

      <div className="quiz-body">
        {/* Sidebar */}
        <aside className={`quiz-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
          <div className="sidebar-inner">
            <div className="sidebar-header">
              <h3>Câu hỏi</h3>
              <button
                className="sidebar-toggle"
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
                <div className="sidebar-grid">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      className={`sidebar-q-btn ${getQuestionState(idx)}`}
                      onClick={() => jumpToQuestion(idx)}
                      disabled={idx > answers.length}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="sidebar-skip-btn"
                  onClick={handleSkip}
                  disabled={showFeedback || submitting}
                >
                  <SkipForward size={16} />
                  Bỏ qua
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="quiz-main">
          <div className="quiz-card-wrapper">
            <div className="quiz-card-header">
              <span className="quiz-card-label">{cardLabel}</span>
              <div className="quiz-card-actions">
                <button className="quiz-action-btn hint-btn" title="Get a hint">
                  <Lightbulb size={16} />
                  Gợi ý
                </button>
                <button className="quiz-action-btn" title="Nghe">
                  <Volume2 size={18} />
                </button>
                <button className="quiz-action-btn" title="Yêu thích">
                  <Star size={18} />
                </button>
              </div>
            </div>

            <div className="quiz-card-body">
              <p className="quiz-definition-text">{currentQuestion.term}</p>
            </div>

            <div className="quiz-select-section">
              <h4 className="quiz-select-label">{selectLabel}</h4>
              <div className="quiz-options-grid">
                {currentQuestion.options.map((opt, i) => (
                  <button
                    key={i}
                    className={`quiz-option-card ${getOptionClass(i)}`}
                    onClick={() => handleOptionClick(i)}
                    disabled={showFeedback || submitting}
                  >
                    <span
                      className="option-number"
                      style={{ background: OPTION_COLORS[i] }}
                    >
                      {i + 1}
                    </span>
                    <span className="option-text">{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            {submitting && (
              <div className="quiz-submitting">Đang gửi quiz...</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
