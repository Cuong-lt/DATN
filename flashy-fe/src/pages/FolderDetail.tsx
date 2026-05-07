import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layers, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getFolderById,
  getSetsByFolder,
  type FolderResponse,
  type FlashcardSetResponse,
} from "../services/folderService";
import "./FolderDetail.css";

const ITEMS_PER_PAGE = 5;

export default function FolderDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderId = Number(searchParams.get("id"));

  const [folder, setFolder] = useState<FolderResponse | null>(null);
  const [sets, setSets] = useState<FlashcardSetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (!folderId) {
      setError("Không tìm thấy thư mục");
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setCurrentPage(0);
      try {
        const [folderRes, setsRes] = await Promise.all([
          getFolderById(folderId),
          getSetsByFolder(folderId),
        ]);
        setFolder(folderRes.data);
        setSets(setsRes.data);
      } catch {
        setError("Không thể tải thư mục");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [folderId]);

  const totalPages = Math.ceil(sets.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const paginatedSets = sets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="folder-detail-page">
      <header className="folder-detail-header">
        <div className="folder-detail-header-left">
          <div className="folder-detail-breadcrumbs">
            <Link to="/library">Thư viện</Link>
            <span>›</span>
            <span>{folder?.name || "Thư mục"}</span>
          </div>
        </div>
      </header>

      <div className="folder-detail-content">
        {loading ? (
          <div className="folder-detail-loading">Đang tải...</div>
        ) : error ? (
          <div className="folder-detail-error">{error}</div>
        ) : (
          <>
            <div className="folder-detail-top">
              <div className="folder-detail-title">
                <h2>{folder?.name || "Folder"}</h2>
              </div>
              <button
                className="btn-add-set"
                onClick={() => navigate(`/create-set?folderId=${folderId}`)}
              >
                <Plus size={18} /> Thêm Bộ Thẻ Học
              </button>
            </div>

            <section className="folder-detail-stats">
              <div className="stat-card">
                <strong>{sets.length}</strong>
                <span>Bộ Thẻ Học</span>
              </div>
              <div className="stat-card">
                <strong>
                  {sets.reduce((acc, item) => acc + item.flashcardCount, 0)}
                </strong>
                <span>Tổng Thẻ</span>
              </div>
              <div className="stat-card">
                <strong>
                  {sets.length
                    ? Math.round(
                        sets.reduce(
                          (acc, item) => acc + item.flashcardCount,
                          0,
                        ) / sets.length,
                      )
                    : 0}
                </strong>
                <span>Trung bình Thẻ / Bộ</span>
              </div>
            </section>

            <div className="folder-result-header">
              <h3>Kết Quả Tìm Thấy</h3>
            </div>

            {sets.length === 0 ? (
              <div className="folder-detail-empty">
                <Layers size={48} />
                <h3>Chưa có bộ thẻ học nào</h3>
                <p>Thêm bộ thẻ học đầu tiên vào thư mục này</p>
              </div>
            ) : (
              <>
                <div className="folder-set-list">
                  {paginatedSets.map((set) => (
                    <Link
                      to={`/study-set?id=${set.id}`}
                      key={set.id}
                      className="folder-set-card"
                    >
                      <div className="folder-set-card-icon">
                        <Layers size={20} />
                      </div>
                      <div className="folder-set-card-body">
                        <h3>{set.title}</h3>
                        {set.description && (
                          <p className="folder-set-desc">{set.description}</p>
                        )}
                        <div className="folder-set-meta">
                          <span>{set.flashcardCount} Thẻ</span>
                          <span
                            className={`folder-set-visibility ${set.visibility}`}
                          >
                            {set.visibility === "public"
                              ? "Công khai"
                              : "Riêng tư"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="folder-pagination">
                    <button
                      className="folder-pagination-btn"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft size={18} />
                      Trước
                    </button>
                    <div className="folder-pagination-info">
                      Trang {currentPage + 1} / {totalPages}
                    </div>
                    <button
                      className="folder-pagination-btn"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages - 1}
                    >
                      Tiếp
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}

                <section className="folder-insights">
                  <h3>Thông tin Thư mục</h3>
                  <div className="folder-insights-body">
                    <div className="folder-insights-text">
                      <h4>Tiến độ Thành thạo</h4>
                      <p>
                        Thư mục này chứa{" "}
                        <strong>
                          {sets.reduce((a, s) => a + s.flashcardCount, 0)}
                        </strong>{" "}
                        thẻ trong <strong>{sets.length}</strong> bộ{" "}
                        {sets.length === 1 ? "thẻ học" : "thẻ học"}. Tiếp tục để
                        đạt mục tiêu hàng tuần của bạn!
                      </p>
                      <div className="folder-progress-bar">
                        <div
                          className="folder-progress-fill"
                          style={{
                            width: `${Math.min(
                              sets.reduce((a, s) => a + s.flashcardCount, 0),
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="folder-insights-stats">
                      <div className="folder-progress-card">
                        <strong>
                          {sets.reduce((a, s) => a + s.flashcardCount, 0)}
                        </strong>
                        <span>Tổng Thẻ</span>
                      </div>
                      <div className="folder-progress-card">
                        <strong>{sets.length}</strong>
                        <span>Bộ Thẻ Học</span>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
