import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Flame,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  Brain,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { getUsername } from "../services/authService";
import { getMySets } from "../services/setService";
import { getMyFolders } from "../services/folderService";
import { getSRSOverview, type SRSSetSummary } from "../services/srsService";
import {
  getRecentSets,
  type RecentSetRecord,
} from "../services/recentSetsService";
import "./Home.css";


export default function Home() {
  const navigate = useNavigate();
  const username = getUsername();

  const [recentSets] = useState<RecentSetRecord[]>(getRecentSets);
  const [totalSets, setTotalSets] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [totalFolders, setTotalFolders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [srsOverview, setSrsOverview] = useState<SRSSetSummary[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [setsRes, foldersRes, srsRes] = await Promise.all([
          getMySets(0, 10),
          getMyFolders(),
          getSRSOverview(),
        ]);
        const pageData = setsRes.data;
        setTotalSets(pageData.totalElements);
        setTotalCards(
          pageData.content.reduce((sum, s) => sum + s.flashcardCount, 0),
        );
        setTotalFolders(foldersRes.data.length);
        setSrsOverview(srsRes);
      } catch {
        // not authenticated
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="home-page">
      <div className="home-content">
        <h1 className="home-welcome">
          Chào mừng trở lại, {username || "Người Dùng"}!
        </h1>
        <div className="section-header">
          <h2>Tiến Độ Học Tập</h2>
          <Link to="/library">Xem Chi Tiết</Link>
        </div>

        <div className="progress-cards">
          <div className="progress-card">
            <div className="progress-card-info">
              <p className="progress-label">Tổng Thẻ</p>
              <p className="progress-value">
                {loading ? "..." : totalCards.toLocaleString()}
              </p>
            </div>
            <div className="progress-card-icon green">
              <TrendingUp size={22} />
            </div>
          </div>

          <div className="progress-card">
            <div className="progress-card-info">
              <p className="progress-label">Bộ Học Tập</p>
              <p className="progress-value">{loading ? "..." : totalSets}</p>
            </div>
            <div className="progress-card-icon orange">
              <Flame size={22} />
            </div>
          </div>

          <div className="progress-card">
            <div className="progress-card-info">
              <p className="progress-label">Thư Mục</p>
              <p className="progress-value">{loading ? "..." : totalFolders}</p>
            </div>
            <div className="progress-card-icon blue">
              <Zap size={22} />
            </div>
          </div>
        </div>

        {/* ── SRS Widget ── */}
        {!loading &&
          (() => {
            const totalDue = srsOverview.reduce((s, x) => s + x.dueCards, 0);
            const dueSets = srsOverview.filter((x) => x.dueCards > 0);
            return (
              <div className="srs-widget">
                <div className="srs-widget-header">
                  <div className="srs-widget-title">
                    <Brain size={18} />
                    <span>Ôn tập hôm nay</span>
                  </div>
                  {totalDue > 0 && (
                    <span className="srs-widget-total-badge">
                      {totalDue} thẻ
                    </span>
                  )}
                </div>

                {totalDue === 0 ? (
                  <div className="srs-widget-done">
                    <CheckCircle2 size={20} />
                    <span>Tuyệt vời! Bạn đã ôn xong tất cả hôm nay.</span>
                  </div>
                ) : (
                  <div className="srs-widget-list">
                    {dueSets.slice(0, 5).map((set) => (
                      <Link
                        key={set.setId}
                        to={`/srs-mode?id=${set.setId}`}
                        className="srs-widget-row"
                      >
                        <div className="srs-widget-row-info">
                          <span className="srs-widget-set-name">
                            {set.setTitle}
                          </span>
                          <span className="srs-widget-meta">
                            {set.newCards > 0 && (
                              <span className="srs-tag new">
                                {set.newCards} mới
                              </span>
                            )}
                            {set.dueCards - set.newCards > 0 && (
                              <span className="srs-tag due">
                                {set.dueCards - set.newCards} ôn lại
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="srs-widget-row-right">
                          <span className="srs-widget-due-count">
                            {set.dueCards}
                          </span>
                          <ArrowRight size={15} className="srs-widget-arrow" />
                        </div>
                      </Link>
                    ))}
                    {dueSets.length > 5 && (
                      <p className="srs-widget-more">
                        +{dueSets.length - 5} bộ thẻ khác
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

        <div className="recent-sets">
          <div className="section-header">
            <h2>Bộ Học Tập Gần Đây</h2>
            <div className="nav-arrows">
              <button onClick={() => scroll("left")}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scroll("right")}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="home-loading">Loading...</div>
          ) : recentSets.length === 0 ? (
            <div className="home-empty">
              <Layers size={36} />
              {totalSets === 0 ? (
                <>
                  <p>Chưa có bộ học tập nào. Tạo bộ đầu tiên của bạn!</p>
                  <button
                    className="btn-create-first"
                    onClick={() => navigate("/create-set")}
                  >
                    <Plus size={16} /> Tạo Bộ Học Tập
                  </button>
                </>
              ) : (
                <p>Bạn chưa mở bộ học tập nào gần đây.</p>
              )}
            </div>
          ) : (
            <div className="recent-scroll" ref={scrollRef}>
              {recentSets.map((set) => (
                <Link
                  to={`/study-set?id=${set.id}`}
                  key={set.id}
                  className="recent-card"
                >
                  <div className="recent-card-header">
                    <Layers size={18} />
                    <span className={`recent-card-badge ${set.visibility}`}>
                      {set.visibility === "public" ? "Công Khai" : "Riêng Tư"}
                    </span>
                  </div>
                  <h3 className="recent-card-title">{set.title}</h3>
                  {set.description && (
                    <p className="recent-card-desc">{set.description}</p>
                  )}
                  <div className="recent-card-footer">
                    <span className="recent-card-count">
                      {set.flashcardCount} Thẻ
                    </span>
                    {set.username && (
                      <span className="recent-card-author">
                        bởi {set.username}
                      </span>
                    )}
                    <span className="recent-card-date">
                      {new Date(set.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
