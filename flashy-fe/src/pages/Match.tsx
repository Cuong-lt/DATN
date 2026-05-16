import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, RotateCcw, Trophy, Clock, Zap } from "lucide-react";
import { getSetById, type FlashcardSetResponse } from "../services/setService";
import "./Match.css";

interface MatchCard {
  id: string;
  flashcardId: number;
  text: string;
  type: "term" | "definition";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  }
  return `${seconds}.${centiseconds.toString().padStart(2, "0")}s`;
}

export default function Match() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setId = Number(searchParams.get("id"));

  const [studySet, setStudySet] = useState<FlashcardSetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Fetch study set
  useEffect(() => {
    if (!setId) {
      setError("Study set not found");
      setLoading(false);
      return;
    }
    getSetById(setId)
      .then((res) => {
        if (res.data.flashcards.length < 2) {
          setError("Need at least 2 flashcards to play Match");
        } else {
          setStudySet(res.data);
        }
      })
      .catch(() =>
        setError("Bộ thẻ không tồn tại hoặc bạn không có quyền truy cập."),
      )
      .finally(() => setLoading(false));
  }, [setId]);

  // Initialize game
  const initGame = useCallback(() => {
    if (!studySet) return;

    // Take up to 6 cards for a manageable grid
    const flashcards = shuffle(studySet.flashcards).slice(0, 6);

    const termCards: MatchCard[] = flashcards.map((fc) => ({
      id: `term-${fc.id}`,
      flashcardId: fc.id,
      text: fc.term,
      type: "term",
    }));

    const defCards: MatchCard[] = flashcards.map((fc) => ({
      id: `def-${fc.id}`,
      flashcardId: fc.id,
      text: fc.definition,
      type: "definition",
    }));

    setCards(shuffle([...termCards, ...defCards]));
    setSelected(null);
    setMatched(new Set());
    setWrongPair(null);
    setGameStarted(false);
    setGameComplete(false);
    setElapsedTime(0);
    setMatchCount(0);
    setWrongCount(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [studySet]);

  useEffect(() => {
    if (studySet) initGame();
  }, [studySet, initGame]);

  // Timer
  useEffect(() => {
    if (gameStarted && !gameComplete) {
      startTimeRef.current = Date.now() - elapsedTime;
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 10);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameComplete]);

  const totalPairs = cards.length / 2;

  const handleCardClick = (cardId: string) => {
    if (gameComplete || wrongPair) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || matched.has(cardId)) return;

    // Start timer on first click
    if (!gameStarted) setGameStarted(true);

    if (!selected) {
      setSelected(cardId);
      return;
    }

    // Clicking same card - deselect
    if (selected === cardId) {
      setSelected(null);
      return;
    }

    const firstCard = cards.find((c) => c.id === selected)!;

    // Check if same type (term-term or def-def) - just switch selection
    if (firstCard.type === card.type) {
      setSelected(cardId);
      return;
    }

    // Check match
    if (firstCard.flashcardId === card.flashcardId) {
      // Correct match
      const newMatched = new Set(matched);
      newMatched.add(firstCard.id);
      newMatched.add(card.id);
      setMatched(newMatched);
      setSelected(null);
      setMatchCount((prev) => prev + 1);

      // Check completion
      if (newMatched.size === cards.length) {
        setGameComplete(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } else {
      // Wrong match
      setWrongPair([selected, cardId]);
      setWrongCount((prev) => prev + 1);
      setTimeout(() => {
        setWrongPair(null);
        setSelected(null);
      }, 600);
    }
  };

  const getCardState = (cardId: string) => {
    if (matched.has(cardId)) return "matched";
    if (wrongPair && (wrongPair[0] === cardId || wrongPair[1] === cardId))
      return "wrong";
    if (selected === cardId) return "selected";
    return "";
  };

  if (loading) {
    return (
      <div className="match-page">
        <div className="match-loading">Loading...</div>
      </div>
    );
  }

  if (error || !studySet) {
    return (
      <div className="match-page">
        <header className="match-header">
          <h1>Nối thẻ</h1>
          <button className="match-close-btn" onClick={() => navigate(-1)}>
            <X size={22} />
          </button>
        </header>
        <div className="match-error">{error || "Could not load"}</div>
      </div>
    );
  }

  return (
    <div className="match-page">
      <header className="match-header">
        <div className="match-header-left">
          <h1>{studySet.title} - Nối thẻ</h1>
        </div>
        <div className="match-header-right">
          <div className="match-timer">
            <Clock size={16} />
            <span>{formatTime(elapsedTime)}</span>
          </div>
          <div className="match-progress-badge">
            <Zap size={14} />
            <span>
              {matchCount}/{totalPairs}
            </span>
          </div>
          <button
            className="match-restart-btn"
            onClick={initGame}
            title="Restart"
          >
            <RotateCcw size={18} />
          </button>
          <button className="match-close-btn" onClick={() => navigate(-1)}>
            <X size={22} />
          </button>
        </div>
      </header>

      <div className="match-body">
        {gameComplete ? (
          <div className="match-complete">
            <div className="match-complete-card">
              <div className="match-trophy">
                <Trophy size={48} />
              </div>
              <h2>Tuyệt vời!</h2>
              <p className="match-final-time">{formatTime(elapsedTime)}</p>
              <div className="match-stats">
                <div className="match-stat">
                  <span className="match-stat-value">{matchCount}</span>
                  <span className="match-stat-label">Đúng</span>
                </div>
                <div className="match-stat">
                  <span className="match-stat-value">{wrongCount}</span>
                  <span className="match-stat-label">Sai</span>
                </div>
              </div>
              <div className="match-complete-actions">
                <button className="btn-play-again" onClick={initGame}>
                  <RotateCcw size={16} /> Chơi lại
                </button>
                <button
                  className="btn-back-set"
                  onClick={() => navigate(`/study-set?id=${setId}`)}
                >
                  Trở lại danh sách
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {!gameStarted && (
              <div className="match-hint">Chọn một thẻ để bắt đầu!</div>
            )}
            <div className={`match-grid ${cards.length > 8 ? "large" : ""}`}>
              {cards.map((card) => (
                <button
                  key={card.id}
                  className={`match-card ${getCardState(card.id)} ${card.type}`}
                  onClick={() => handleCardClick(card.id)}
                  disabled={matched.has(card.id)}
                >
                  <span className="match-card-type">
                    {card.type === "term" ? "Thuật ngữ" : "Định nghĩa"}
                  </span>
                  <span className="match-card-text">{card.text}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
