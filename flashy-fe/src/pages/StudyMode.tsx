import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  X,
  Settings,
  Shuffle,
  Volume2,
  Eye,
  EyeOff,
  RotateCcw,
  Trophy,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getSetById, type FlashcardSetResponse } from "../services/setService";
import "./StudyMode.css";

export default function StudyMode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setId = Number(searchParams.get("id"));

  const [studySet, setStudySet] = useState<FlashcardSetResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | "">(
    "",
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [showTermFirst, setShowTermFirst] = useState(true);

  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!setId) {
      setError("Study set not found");
      setLoading(false);
      return;
    }
    getSetById(setId)
      .then((res) => setStudySet(res.data))
      .catch(() => setError("Failed to load study set"))
      .finally(() => setLoading(false));
  }, [setId]);

  const flashcards = studySet?.flashcards || [];
  const totalCards = flashcards.length;
  const currentCard = flashcards[currentIndex];

  const handleFlip = () => {
    if (!isAnimating) setFlipped(!flipped);
  };

  const animateSlide = (direction: "left" | "right", callback: () => void) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideDirection(direction);
    setTimeout(() => {
      callback();
      setFlipped(false);
      setSlideDirection("");
      setIsAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      animateSlide("right", () => setCurrentIndex(currentIndex - 1));
    }
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      animateSlide("left", () => setCurrentIndex(currentIndex + 1));
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(false);
    setSlideDirection("");
  };

  const handleShuffle = () => {
    if (studySet) {
      const shuffledCards = [...studySet.flashcards].sort(
        () => Math.random() - 0.5,
      );
      setStudySet({ ...studySet, flashcards: shuffledCards });
      setShuffled(!shuffled);
      setCurrentIndex(0);
      setFlipped(false);
      setCompleted(false);
    }
    setShowSettings(false);
  };

  const handleToggleTermFirst = () => {
    setShowTermFirst(!showTermFirst);
    setFlipped(false);
    setShowSettings(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (completed) return;
      if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, totalCards, flipped, isAnimating, completed]);

  if (loading) {
    return (
      <div className="study-page">
        <div className="study-loading">Loading...</div>
      </div>
    );
  }

  if (error || !studySet) {
    return (
      <div className="study-page">
        <header className="study-header">
          <div className="study-header-left">
            <h1>Study Mode</h1>
          </div>
          <button className="study-close-btn" onClick={() => navigate(-1)}>
            <X size={22} />
          </button>
        </header>
        <div className="study-error">{error || "Study set not found"}</div>
      </div>
    );
  }

  if (totalCards === 0) {
    return (
      <div className="study-page">
        <header className="study-header">
          <div className="study-header-left">
            <h1>{studySet.title}</h1>
          </div>
          <button className="study-close-btn" onClick={() => navigate(-1)}>
            <X size={22} />
          </button>
        </header>
        <div className="study-empty">
          <p>No flashcards in this set yet.</p>
          <button className="btn-back-lib" onClick={() => navigate("/library")}>
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  // Completion screen
  if (completed) {
    return (
      <div className="study-page">
        <header className="study-header">
          <div className="study-header-left">
            <h1>{studySet.title}</h1>
          </div>
          <button className="study-close-btn" onClick={() => navigate(-1)}>
            <X size={22} />
          </button>
        </header>
        <div className="study-complete">
          <div className="complete-trophy">
            <Trophy size={56} />
          </div>
          <h2>Chúc mừng!</h2>
          <p className="complete-message">
            Bạn đã học xong <strong>{totalCards}</strong> thẻ trong bộ này. Hãy
            tiếp tục duy trì nhé!
          </p>
          <div className="complete-stats">
            <div className="complete-stat">
              <span className="complete-stat-value">{totalCards}</span>
              <span className="complete-stat-label">Thẻ đã học</span>
            </div>
          </div>
          <div className="complete-actions">
            <button className="btn-restart" onClick={handleRestart}>
              <RotateCcw size={18} /> Học lại
            </button>
            <button
              className="btn-back-set"
              onClick={() => navigate(`/study-set?id=${setId}`)}
            >
              <ArrowRight size={18} /> Trở lại danh sách thẻ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const frontContent = showTermFirst
    ? currentCard.term
    : currentCard.definition;
  const backContent = showTermFirst ? currentCard.definition : currentCard.term;

  return (
    <div className="study-page">
      <header className="study-header">
        <div className="study-header-left">
          <h1>{studySet.title}</h1>
          <span>{studySet.description || `${totalCards} cards`}</span>
        </div>
        <div className="study-header-right">
          <div className="study-settings-wrapper" ref={settingsRef}>
            <button
              className="study-settings-btn"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={20} />
            </button>
            {showSettings && (
              <div className="study-settings-dropdown">
                <button onClick={handleShuffle}>
                  <Shuffle size={16} />
                  <span>{shuffled ? "Sắp xếp lại" : "Trộn thẻ"}</span>
                </button>
                <button onClick={handleToggleTermFirst}>
                  {showTermFirst ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>
                    {showTermFirst
                      ? "Hiển thị định nghĩa trước"
                      : "Hiển thị thuật ngữ trước"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    handleRestart();
                    setShowSettings(false);
                  }}
                >
                  <RotateCcw size={16} />
                  <span>Khởi động lại phiên học</span>
                </button>
                <button onClick={() => setShowSettings(false)}>
                  <Volume2 size={16} />
                  <span>Tự động phát âm thanh</span>
                </button>
              </div>
            )}
          </div>
          <button className="study-close-btn" onClick={() => navigate(-1)}>
            <X size={22} />
          </button>
        </div>
      </header>

      <div className="study-content">
        <div className="session-progress">
          <div className="session-progress-row">
            <span>Tiến trình</span>
            <span className="session-count">
              {currentIndex + 1} / {totalCards} Thẻ
            </span>
          </div>
          <div className="session-bar">
            <div
              className="session-bar-fill"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            />
          </div>
        </div>

        <div
          className={`flashcard-container ${slideDirection === "left" ? "slide-out-left" : ""} ${slideDirection === "right" ? "slide-out-right" : ""}`}
          onClick={handleFlip}
        >
          <div className={`flashcard ${flipped ? "flipped" : ""}`}>
            <div className="flashcard-front">
              <h2 className="flashcard-question">{frontContent}</h2>
            </div>
            <div className="flashcard-back">
              <h2 className="flashcard-answer">{backContent}</h2>
            </div>
          </div>
        </div>

        <div className="card-navigation">
          <button
            className="btn-nav-arrow"
            onClick={handlePrev}
            disabled={currentIndex <= 0}
          >
            <ChevronLeft size={24} />
          </button>
          <span className="nav-counter">
            {currentIndex + 1} / {totalCards}
          </span>
          <button className="btn-nav-arrow" onClick={handleNext}>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
