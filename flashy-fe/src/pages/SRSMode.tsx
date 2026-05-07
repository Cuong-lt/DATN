import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  X,
  Trophy,
  RotateCcw,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import {
  getDueCards,
  reviewCard,
  getSRSStats,
  SRS_QUALITY,
  type SRSCardResponse,
  type SRSStatsResponse,
} from "../services/srsService";
import { getSetById, type FlashcardSetResponse } from "../services/setService";
import "./SRSMode.css";

type SessionResult = {
  card: SRSCardResponse;
  quality: number;
};

export default function SRSMode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setId = Number(searchParams.get("id"));

  const [studySet, setStudySet] = useState<FlashcardSetResponse | null>(null);
  const [stats, setStats] = useState<SRSStatsResponse | null>(null);
  const [queue, setQueue] = useState<SRSCardResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!setId) {
      setError("Set not found");
      setLoading(false);
      return;
    }
    Promise.all([
      getSetById(setId),
      getDueCards(setId),
      getSRSStats(setId),
    ])
      .then(([setRes, cards, statsRes]) => {
        setStudySet(setRes.data);
        setQueue(cards);
        setStats(statsRes);
      })
      .catch(() => setError("Failed to load SRS session"))
      .finally(() => setLoading(false));
  }, [setId]);

  const currentCard = queue[currentIndex];
  const totalInSession = queue.length;

  const handleFlip = () => {
    if (!submitting) setFlipped(true);
  };

  const handleRate = async (quality: number) => {
    if (submitting || !currentCard) return;
    setSubmitting(true);
    try {
      const updated = await reviewCard(setId, currentCard.flashcardId, quality);
      setSessionResults((prev) => [...prev, { card: updated, quality }]);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= totalInSession) {
        setCompleted(true);
      } else {
        setCurrentIndex(nextIndex);
        setFlipped(false);
      }
    } catch {
      // tiếp tục dù lỗi
      const nextIndex = currentIndex + 1;
      if (nextIndex >= totalInSession) {
        setCompleted(true);
      } else {
        setCurrentIndex(nextIndex);
        setFlipped(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(false);
    setSessionResults([]);
  };

  const formatNextReview = (intervalDays: number): string => {
    if (intervalDays === 0) return "ngay bây giờ";
    if (intervalDays === 1) return "ngày mai";
    if (intervalDays < 7) return `${intervalDays} ngày`;
    if (intervalDays < 30) return `${Math.round(intervalDays / 7)} tuần`;
    return `${Math.round(intervalDays / 30)} tháng`;
  };

  // ── Loading / Error ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="srs-page">
        <div className="srs-loading">Đang tải phiên ôn tập...</div>
      </div>
    );
  }

  if (error || !studySet) {
    return (
      <div className="srs-page">
        <div className="srs-error">{error || "Không tìm thấy bộ thẻ"}</div>
      </div>
    );
  }

  // ── Không có thẻ cần ôn ──────────────────────────────────────────────
  if (totalInSession === 0) {
    return (
      <div className="srs-page">
        <header className="srs-header">
          <div className="srs-header-left">
            <Brain size={20} className="srs-brain-icon" />
            <h1>{studySet.title}</h1>
          </div>
          <button className="srs-close-btn" onClick={() => navigate(-1)}>
            <X size={22} />
          </button>
        </header>
        <div className="srs-empty">
          <CheckCircle2 size={56} className="srs-empty-icon" />
          <h2>Tất cả đã ôn xong!</h2>
          <p>Bạn không có thẻ nào cần ôn hôm nay. Quay lại sau nhé!</p>
          {stats && (
            <div className="srs-stats-grid">
              <div className="srs-stat-card">
                <span className="srs-stat-value">{stats.totalCards}</span>
                <span className="srs-stat-label">Tổng thẻ</span>
              </div>
              <div className="srs-stat-card srs-stat-green">
                <span className="srs-stat-value">{stats.learnedCards}</span>
                <span className="srs-stat-label">Đã thuộc</span>
              </div>
            </div>
          )}
          <button className="srs-btn-back" onClick={() => navigate(`/study-set?id=${setId}`)}>
            <ArrowRight size={18} /> Về bộ thẻ
          </button>
        </div>
      </div>
    );
  }

  // ── Màn hình kết thúc phiên ──────────────────────────────────────────
  if (completed) {
    const againCount = sessionResults.filter((r) => r.quality === SRS_QUALITY.AGAIN).length;
    const hardCount = sessionResults.filter((r) => r.quality === SRS_QUALITY.HARD).length;
    const goodCount = sessionResults.filter((r) => r.quality === SRS_QUALITY.GOOD).length;
    const easyCount = sessionResults.filter((r) => r.quality === SRS_QUALITY.EASY).length;
    const remembered = goodCount + easyCount;

    return (
      <div className="srs-page">
        <header className="srs-header">
          <div className="srs-header-left">
            <Brain size={20} className="srs-brain-icon" />
            <h1>{studySet.title}</h1>
          </div>
          <button className="srs-close-btn" onClick={() => navigate(-1)}>
            <X size={22} />
          </button>
        </header>
        <div className="srs-complete">
          <div className="srs-trophy">
            <Trophy size={56} />
          </div>
          <h2>Phiên ôn tập hoàn thành!</h2>
          <p className="srs-complete-msg">
            Bạn vừa ôn <strong>{totalInSession}</strong> thẻ.
            Hệ thống sẽ nhắc lại đúng thời điểm bạn sắp quên.
          </p>
          <div className="srs-result-grid">
            <div className="srs-result-item srs-result-easy">
              <span className="srs-result-count">{easyCount}</span>
              <span className="srs-result-label">Dễ</span>
            </div>
            <div className="srs-result-item srs-result-good">
              <span className="srs-result-count">{goodCount}</span>
              <span className="srs-result-label">Tốt</span>
            </div>
            <div className="srs-result-item srs-result-hard">
              <span className="srs-result-count">{hardCount}</span>
              <span className="srs-result-label">Khó</span>
            </div>
            <div className="srs-result-item srs-result-again">
              <span className="srs-result-count">{againCount}</span>
              <span className="srs-result-label">Quên</span>
            </div>
          </div>
          <p className="srs-accuracy">
            Tỷ lệ nhớ: <strong>{Math.round((remembered / totalInSession) * 100)}%</strong>
          </p>
          <div className="srs-complete-actions">
            <button className="srs-btn-restart" onClick={handleRestart}>
              <RotateCcw size={18} /> Ôn lại
            </button>
            <button className="srs-btn-back" onClick={() => navigate(`/study-set?id=${setId}`)}>
              <ArrowRight size={18} /> Về bộ thẻ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Màn hình ôn tập chính ────────────────────────────────────────────
  const isNew = currentCard.reviewCount === 0;
  const progressPct = Math.round((currentIndex / totalInSession) * 100);

  return (
    <div className="srs-page">
      <header className="srs-header">
        <div className="srs-header-left">
          <Brain size={20} className="srs-brain-icon" />
          <h1>{studySet.title}</h1>
        </div>
        <button className="srs-close-btn" onClick={() => navigate(-1)}>
          <X size={22} />
        </button>
      </header>

      <div className="srs-content">
        {/* Progress */}
        <div className="srs-progress-wrap">
          <div className="srs-progress-row">
            <span className="srs-progress-label">
              {isNew ? (
                <><Zap size={13} /> Thẻ mới</>
              ) : (
                <><Clock size={13} /> Ôn tập</>
              )}
            </span>
            <span className="srs-progress-count">{currentIndex + 1} / {totalInSession}</span>
          </div>
          <div className="srs-progress-bar">
            <div className="srs-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Card */}
        <div
          className={`srs-card-container ${flipped ? "srs-flipped" : ""}`}
          onClick={!flipped ? handleFlip : undefined}
        >
          <div className="srs-card">
            <div className="srs-card-front">
              <span className="srs-card-side-label">Thuật ngữ</span>
              <p className="srs-card-text">{currentCard.term}</p>
              {!flipped && (
                <span className="srs-tap-hint">Nhấn để xem đáp án</span>
              )}
            </div>
            <div className="srs-card-back">
              <span className="srs-card-side-label">Định nghĩa</span>
              <p className="srs-card-text srs-card-answer">{currentCard.definition}</p>
            </div>
          </div>
        </div>

        {/* Rating buttons - chỉ hiện sau khi lật thẻ */}
        {flipped && (
          <div className="srs-rating-section">
            <p className="srs-rating-question">Bạn nhớ tốt đến đâu?</p>
            <div className="srs-rating-btns">
              <button
                className="srs-btn-rating srs-btn-again"
                onClick={() => handleRate(SRS_QUALITY.AGAIN)}
                disabled={submitting}
              >
                <span className="srs-btn-label">Quên</span>
                <span className="srs-btn-interval">Ôn lại ngay</span>
              </button>
              <button
                className="srs-btn-rating srs-btn-hard"
                onClick={() => handleRate(SRS_QUALITY.HARD)}
                disabled={submitting}
              >
                <span className="srs-btn-label">Khó</span>
                <span className="srs-btn-interval">{formatNextReview(1)}</span>
              </button>
              <button
                className="srs-btn-rating srs-btn-good"
                onClick={() => handleRate(SRS_QUALITY.GOOD)}
                disabled={submitting}
              >
                <span className="srs-btn-label">Tốt</span>
                <span className="srs-btn-interval">
                  {formatNextReview(
                    currentCard.repetition === 0 ? 1 :
                    currentCard.repetition === 1 ? 6 :
                    Math.round((currentCard.intervalDays || 1) * (currentCard.easeFactor || 2.5))
                  )}
                </span>
              </button>
              <button
                className="srs-btn-rating srs-btn-easy"
                onClick={() => handleRate(SRS_QUALITY.EASY)}
                disabled={submitting}
              >
                <span className="srs-btn-label">Dễ</span>
                <span className="srs-btn-interval">
                  {formatNextReview(
                    Math.round(
                      (currentCard.repetition === 0 ? 1 :
                      currentCard.repetition === 1 ? 6 :
                      Math.round((currentCard.intervalDays || 1) * (currentCard.easeFactor || 2.5))) * 1.3
                    )
                  )}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
