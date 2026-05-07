import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Layers,
  Globe,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Users,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import {
  searchPublicSets,
  type FlashcardSetResponse,
  type PageResponse,
} from "../services/setService";
import "./Explore.css";

const PAGE_SIZE = 10;

const POPULAR_TOPICS = [
  {
    label: "Sinh Học Phân Tử",
    icon: "🧬",
    description:
      "Khám phá di truyền, quá trình tế bào và các yếu tố cơ bản của sinh hóa.",
    count: "1.2K bộ thẻ có sẵn",
    color: "var(--accent-green)",
  },
  {
    label: "Giải Tích Cao Cấp",
    icon: "📐",
    description: "Từ vi phân đến tích phân phức tạp và định lý.",
    count: "850 bộ thẻ có sẵn",
    color: "var(--accent-blue)",
  },
  {
    label: "Lịch Sử Thế Giới",
    icon: "📜",
    description: "Lịch sử của các nền văn minh lớn và phong trào toàn cầu.",
    count: "2.4K bộ thẻ có sẵn",
    color: "var(--accent-purple)",
  },
  {
    label: "Lý Thuyết Nghệ Thuật",
    icon: "🎨",
    description: "Nghiên cứu kỹ thuật bố cục và các thời kỳ lịch sử.",
    count: "560 bộ thẻ có sẵn",
    color: "var(--accent-green)",
  },
];

const ExplorerFilters = [
  "Theo Lớp",
  "Theo Môn Học",
  "Phổ Biến Nhất",
  "Được Xác Minh Bởi Chuyên Gia",
];

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialKeyword = searchParams.get("search") || "";
  const [keyword, setKeyword] = useState(initialKeyword);
  const [inputValue, setInputValue] = useState(initialKeyword);
  const [sets, setSets] = useState<FlashcardSetResponse[]>([]);
  const [pageInfo, setPageInfo] = useState<Omit<
    PageResponse<FlashcardSetResponse>,
    "content"
  > | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [recentViewed, setRecentViewed] = useState<FlashcardSetResponse[]>([]);

  const fetchResults = useCallback(async (kw: string, page: number) => {
    setLoading(true);
    try {
      const res = await searchPublicSets(kw, page, PAGE_SIZE);
      setSets(res.data.content);
      setPageInfo({
        page: res.data.page,
        size: res.data.size,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
        last: res.data.last,
      });
    } catch {
      setSets([]);
      setPageInfo(null);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  // Load results on mount (all public sets or from search param)
  useEffect(() => {
    fetchResults(initialKeyword, 0);

    const saved = localStorage.getItem("exploreRecent");
    if (saved) {
      try {
        setRecentViewed(JSON.parse(saved));
      } catch {
        setRecentViewed([]);
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setKeyword(trimmed);
    setCurrentPage(0);
    if (trimmed) {
      setSearchParams({ search: trimmed });
    } else {
      setSearchParams({});
    }
    fetchResults(trimmed, 0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchResults(keyword, page);
  };

  const clearSearch = () => {
    setInputValue("");
    setKeyword("");
    setCurrentPage(0);
    setSearchParams({});
    fetchResults("", 0);
  };

  const handleTopicClick = (topic: string) => {
    setInputValue(topic);
    setKeyword(topic);
    setCurrentPage(0);
    setSearchParams({ search: topic });
    fetchResults(topic, 0);
  };

  return (
    <div className="explore-page">
      <div className="explore-content">
        <h2>Khám phá tài liệu</h2>
        <p>Tìm kiếm các tài liệu công khai được tạo bởi cộng đồng</p>

        <form className="explore-search-form" onSubmit={handleSearch}>
          <div className="explore-search-box">
            <Search size={18} className="explore-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm bộ thẻ, hoặc chủ đề..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
            {inputValue && (
              <button
                type="button"
                className="explore-search-clear"
                onClick={clearSearch}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="explore-search-btn"
            disabled={loading}
          >
            {loading ? "Đang tìm kiếm..." : "Tìm kiếm"}
          </button>
        </form>

        <div className="explore-filter-row">
          {ExplorerFilters.map((filter) => (
            <button type="button" key={filter} className="explore-filter-chip">
              {filter}
            </button>
          ))}
        </div>

        {loading && <div className="explore-loading">Đang tìm kiếm...</div>}

        {!loading && searched && (
          <>
            {pageInfo && (
              <div className="explore-results-info">
                {pageInfo.totalElements > 0
                  ? `Tìm thấy ${pageInfo.totalElements} kết quả${pageInfo.totalElements !== 1 ? "" : ""}${keyword ? ` cho "${keyword}"` : ""}`
                  : `Không tìm thấy kết quả${keyword ? ` cho "${keyword}"` : ""}`}
              </div>
            )}

            {sets.length > 0 && (
              <>
                <section className="explore-results-panel">
                  <div className="explore-results-header">
                    <h3>Kết Quả Tìm Thấy</h3>
                    <div className="explore-view-switch">
                      <button
                        type="button"
                        className={`view-switch-btn ${viewMode === "grid" ? "active" : ""}`}
                        onClick={() => setViewMode("grid")}
                      >
                        <LayoutGrid size={16} /> Lưới
                      </button>
                      <button
                        type="button"
                        className={`view-switch-btn ${viewMode === "list" ? "active" : ""}`}
                        onClick={() => setViewMode("list")}
                      >
                        <LayoutList size={16} /> Danh Sách
                      </button>
                    </div>
                  </div>
                  <div className={`explore-set-list ${viewMode}`}>
                    {sets.map((set) => (
                      <div
                        key={set.id}
                        className="explore-set-card"
                        onClick={() => {
                          const next = [
                            set,
                            ...recentViewed.filter(
                              (item) => item.id !== set.id,
                            ),
                          ].slice(0, 5);
                          setRecentViewed(next);
                          localStorage.setItem(
                            "exploreRecent",
                            JSON.stringify(next),
                          );
                          navigate(`/study-set?id=${set.id}`);
                        }}
                      >
                        <div className="explore-set-card-header">
                          <Layers size={18} />
                          <span className="explore-set-badge">Công Khai</span>
                        </div>
                        <h3>{set.title}</h3>
                        {set.description && (
                          <p className="explore-set-desc">{set.description}</p>
                        )}
                        <div className="explore-set-footer">
                          <span>{set.flashcardCount} Thẻ</span>
                          {set.username && (
                            <span className="explore-set-author">
                              bởi {set.username}
                            </span>
                          )}
                          <span className="explore-set-date">
                            {new Date(set.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View more button */}
                  <div className="explore-more-wrap">
                    <button
                      className="explore-more-btn"
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                    >
                      Khám Phá Thêm Bộ Thẻ
                    </button>
                  </div>

                  {/* Pagination */}
                  {pageInfo && pageInfo.totalPages > 1 && (
                    <div className="pagination">
                      <button
                        className="pagination-btn"
                        disabled={currentPage === 0}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        <ChevronLeft size={16} /> Trước
                      </button>
                      <div className="pagination-pages">
                        {Array.from({ length: pageInfo.totalPages }, (_, i) => (
                          <button
                            key={i}
                            className={`pagination-page ${i === currentPage ? "active" : ""}`}
                            onClick={() => handlePageChange(i)}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        className="pagination-btn"
                        disabled={pageInfo.last}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Tiếp <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </section>
              </>
            )}

            {sets.length === 0 && searched && !loading && (
              <div className="explore-empty">
                <Search size={48} />
                <h3>Không tìm thấy kết quả</h3>
                <p>Thử từ khóa tìm kiếm khác hoặc duyệt với tìm kiếm trống</p>
              </div>
            )}
          </>
        )}

        {!searched && !loading && (
          <div className="explore-empty">
            <Globe size={48} />
            <h3>Bắt đầu khám phá</h3>
            <p>
              Tìm kiếm bộ thẻ học theo tiêu đề để tìm nội dung được tạo bởi cộng
              đồng
            </p>
          </div>
        )}

        {recentViewed.length > 0 && (
          <section className="explore-section explore-recent-section">
            <div className="explore-section-header">
              <h3>Đã Xem Gần Đây</h3>
            </div>
            <div className="explore-set-list recent">
              {recentViewed.map((set) => (
                <div
                  key={set.id}
                  className="explore-set-card"
                  onClick={() => {
                    navigate(`/study-set?id=${set.id}`);
                  }}
                >
                  <div className="explore-set-card-header">
                    <Layers size={18} />
                    <span className="explore-set-badge">Gần Đây</span>
                  </div>
                  <h3>{set.title}</h3>
                  <p className="explore-set-desc">
                    {set.description || "Không có mô tả"}
                  </p>
                  <div className="explore-set-footer">
                    <span>{set.flashcardCount} Thẻ</span>
                    {set.username && (
                      <span className="explore-set-author">
                        bởi {set.username}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular Topics */}
        <section className="explore-section explore-popular-section">
          <div className="explore-section-header">
            <h3>Chủ Đề Phổ Biến</h3>
            <button type="button" className="explore-view-all">
              Xem tất cả
            </button>
          </div>
          <div className="explore-topic-grid">
            {POPULAR_TOPICS.map((topic) => (
              <div
                key={topic.label}
                className="explore-topic-card"
                onClick={() => handleTopicClick(topic.label)}
              >
                <div
                  className="explore-topic-color"
                  style={{ backgroundColor: topic.color }}
                >
                  {topic.icon}
                </div>
                <h4>{topic.label}</h4>
                <p>{topic.description}</p>
                <span className="topic-count">{topic.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="explore-section">
          <div className="explore-section-header">
            <h3>Cách sử dụng</h3>
          </div>
          <div className="explore-steps">
            <div className="explore-step-card">
              <div className="explore-step-icon">
                <Search size={24} />
              </div>
              <h4>Tìm kiếm</h4>
              <p>
                Tìm kiếm bộ thẻ học theo chủ đề, từ khóa, hoặc duyệt các danh
                mục phổ biến
              </p>
            </div>
            <div className="explore-step-card">
              <div className="explore-step-icon">
                <BookOpen size={24} />
              </div>
              <h4>Học</h4>
              <p>
                Mở bất kỳ bộ thẻ học công khai nào và bắt đầu học với thẻ thông
                minh ngay lập tức
              </p>
            </div>
            <div className="explore-step-card">
              <div className="explore-step-icon">
                <Users size={24} />
              </div>
              <h4>Chia sẻ</h4>
              <p>Tạo bộ thẻ học của riêng bạn và chia sẻ chúng với cộng đồng</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
