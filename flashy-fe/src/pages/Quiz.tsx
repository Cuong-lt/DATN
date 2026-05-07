import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(set: FlashcardSetResponse): QuizQuestion[] {
  const cards = set.flashcards;
  if (cards.length < 2) return [];

  return shuffle(cards).map((card) => {
    const wrongAnswers = shuffle(
      cards.filter((c) => c.id !== card.id).map((c) => c.definition),
    ).slice(0, 3);

    const options = shuffle([card.definition, ...wrongAnswers]);

    return {
      flashcardId: card.id,
      term: card.term,
      correctAnswer: card.definition,
      options,
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
  const [searchParams] = useSearchParams();
  const setId = Number(searchParams.get("id"));

  const [studySet, setStudySet] = useState<FlashcardSetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      .catch(() => setError("Failed to load study set"))
      .finally(() => setLoading(false));
  }, [setId]);

  const questions = useMemo(() => {
    if (!studySet) return [];
    return generateQuestions(studySet);
  }, [studySet]);

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
      // Fallback: navigate with local data if API fails
      navigate("/quiz-results", {
        state: {
          setTitle: studySet?.title,
          setId,
          answers: finalAnswers.map((a) => ({
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

  if (error || !studySet || !currentQuestion) {
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

  const getOptionClass = (idx: number) => {
    if (!showFeedback) return selected === idx ? "selected" : "";
    const opt = currentQuestion.options[idx];
    if (opt === currentQuestion.correctAnswer) return "correct";
    if (idx === selected) return "wrong";
    return "";
  };

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
              <span className="quiz-card-label">Định nghĩa</span>
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
              <h4 className="quiz-select-label">Chọn thuật ngữ phù hợp</h4>
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
