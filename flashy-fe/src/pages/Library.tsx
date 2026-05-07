import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen,
  FolderPlus,
  Lightbulb,
  Plus,
  Layers,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Heart,
  MoreVertical,
  Clock,
  Star,
  GraduationCap,
  LayoutGrid,
  Play,
  BookOpen,
} from "lucide-react";
import {
  getMyFolders,
  updateFolder,
  deleteFolder,
  type FolderResponse,
} from "../services/folderService";
import {
  getMySets,
  type FlashcardSetResponse,
  type PageResponse,
} from "../services/setService";
import { getMyFavorites, toggleFavorite } from "../services/favoriteService";
import {
  getRecentSets,
  type RecentSetRecord,
} from "../services/recentSetsService";
import "./Library.css";

const tabs = ["Tất Cả Thư Mục", "Bộ Học Tập", "Gần Đây", "Yêu Thích"];

const folderThemes = [
  { border: "#2563eb", iconBg: "#dbeafe", iconColor: "#2563eb" },
  { border: "#16a34a", iconBg: "#dcfce7", iconColor: "#16a34a" },
  { border: "#ea580c", iconBg: "#ffedd5", iconColor: "#ea580c" },
  { border: "#9333ea", iconBg: "#f3e8ff", iconColor: "#9333ea" },
];

const folderIconsList = [GraduationCap, LayoutGrid, BookOpen, Lightbulb];

const setThumbColors = ["#2563eb", "#ea580c", "#16a34a", "#9333ea", "#dc2626"];

const PAGE_SIZE = 10;
const FOLDERS_PER_PAGE = 5;

export default function Library() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [sets, setSets] = useState<FlashcardSetResponse[]>([]);
  const [recentSets] = useState<RecentSetRecord[]>(getRecentSets);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingFolder, setEditingFolder] = useState<FolderResponse | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [deletingFolder, setDeletingFolder] = useState<FolderResponse | null>(
    null,
  );
  const [favoriteSets, setFavoriteSets] = useState<
    import("../services/folderService").FlashcardSetResponse[]
  >([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [currentFolderPage, setCurrentFolderPage] = useState(0);
  const [pageInfo, setPageInfo] = useState<Omit<
    PageResponse<FlashcardSetResponse>,
    "content"
  > | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRenameFolder = async () => {
    if (!editingFolder || !editName.trim()) return;
    try {
      await updateFolder(editingFolder.id, { name: editName.trim() });
      setFolders((prev) =>
        prev.map((f) =>
          f.id === editingFolder.id ? { ...f, name: editName.trim() } : f,
        ),
      );
      setEditingFolder(null);
    } catch {
      // silently fail
    }
  };

  const handleDeleteFolder = async () => {
    if (!deletingFolder) return;
    try {
      await deleteFolder(deletingFolder.id);
      setFolders((prev) => prev.filter((f) => f.id !== deletingFolder.id));
      setDeletingFolder(null);
    } catch {
      // silently fail
    }
  };

  const fetchSets = async (page: number) => {
    try {
      const setsRes = await getMySets(page, PAGE_SIZE);
      setSets(setsRes.data.content);
      setPageInfo({
        page: setsRes.data.page,
        size: setsRes.data.size,
        totalElements: setsRes.data.totalElements,
        totalPages: setsRes.data.totalPages,
        last: setsRes.data.last,
      });
    } catch {
      // silently fail
    }
  };

  const fetchFavorites = async () => {
    try {
      const favRes = await getMyFavorites();
      setFavoriteSets(favRes.data);
      setFavoriteIds(new Set(favRes.data.map((s) => s.id)));
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const foldersRes = await getMyFolders();
        setFolders(foldersRes.data);
        await fetchSets(0);
        await fetchFavorites();
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleToggleFavorite = async (e: React.MouseEvent, setId: number) => {
    e.stopPropagation();
    try {
      const res = await toggleFavorite(setId);
      if (res.data) {
        setFavoriteIds((prev) => new Set([...prev, setId]));
      } else {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(setId);
          return next;
        });
      }
      await fetchFavorites();
    } catch {
      // silently fail
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchSets(page);
  };

  const handleFolderPageChange = (page: number) => {
    setCurrentFolderPage(page);
  };

  const totalCards = (folder: FolderResponse) =>
    folder.sets.reduce((sum, s) => sum + s.flashcardCount, 0);

  const totalFolderPages = Math.ceil(folders.length / FOLDERS_PER_PAGE);
  const folderStartIndex = currentFolderPage * FOLDERS_PER_PAGE;
  const paginatedFolders = folders.slice(
    folderStartIndex,
    folderStartIndex + FOLDERS_PER_PAGE,
  );

  const tabIcons = [FolderOpen, Layers, Clock, Star];

  return (
    <div className="library-page">
      {/* Main Content */}
      <div className="library-main">
        {/* Main Header */}
        <div className="library-main-header">
          <div className="library-main-title-block">
            <h1>Thư Viện</h1>
          </div>
          <div className="library-main-actions">
            <button
              className="btn-create-folder"
              onClick={() => navigate("/create-folder")}
            >
              <FolderPlus size={18} /> Tạo Thư Mục
            </button>
          </div>
        </div>
        <div className="library-submenu">
          {tabs.map((tab, i) => {
            const Icon = tabIcons[i];
            return (
              <button
                key={tab}
                className={`library-submenu-item ${i === activeTab ? "active" : ""}`}
                onClick={() => setActiveTab(i)}
              >
                <Icon size={16} />
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="library-loading">Đang tải...</div>
        ) : (
          <>
            {/* All Folders Tab */}
            {activeTab === 0 && (
              <>
                {folders.length === 0 && (
                  <div className="library-empty">
                    <FolderOpen size={48} />
                    <h3>Chưa có thư mục nào</h3>
                    <p>
                      Tạo thư mục đầu tiên của bạn để tổ chức các bộ học tập
                    </p>
                  </div>
                )}

                {folders.length > 0 && (
                  <>
                    <div className="folder-grid">
                      {paginatedFolders.map((folder, idx) => {
                        const theme =
                          folderThemes[
                            (folderStartIndex + idx) % folderThemes.length
                          ];
                        const FolderIconComp =
                          folderIconsList[
                            (folderStartIndex + idx) % folderIconsList.length
                          ];
                        return (
                          <div
                            key={folder.id}
                            className="folder-card-new"
                            style={{ borderLeftColor: theme.border }}
                            onClick={() =>
                              navigate(`/folder-detail?id=${folder.id}`)
                            }
                          >
                            <div className="folder-card-top">
                              <div
                                className="folder-card-icon"
                                style={{ background: theme.iconBg }}
                              >
                                <FolderIconComp
                                  size={20}
                                  color={theme.iconColor}
                                />
                              </div>
                              <div
                                className="folder-card-menu-wrapper"
                                ref={
                                  openMenuId === folder.id ? menuRef : undefined
                                }
                              >
                                <button
                                  className="folder-card-menu-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId((prev) =>
                                      prev === folder.id ? null : folder.id,
                                    );
                                  }}
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {openMenuId === folder.id && (
                                  <div className="folder-menu">
                                    <button
                                      className="folder-menu-item"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingFolder(folder);
                                        setEditName(folder.name);
                                        setOpenMenuId(null);
                                      }}
                                    >
                                      <Pencil size={14} /> Đổi Tên
                                    </button>
                                    <button
                                      className="folder-menu-item danger"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletingFolder(folder);
                                        setOpenMenuId(null);
                                      }}
                                    >
                                      <Trash2 size={14} /> Xóa
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <h3 className="folder-card-name">{folder.name}</h3>
                            <p className="folder-card-meta">
                              <Layers size={13} /> {folder.sets.length} Bộ
                              &bull; {totalCards(folder)} Thẻ
                            </p>
                          </div>
                        );
                      })}

                      {/* Add New Folder card */}
                      {currentFolderPage === totalFolderPages - 1 && (
                        <div
                          className="folder-card-add"
                          onClick={() => navigate("/create-folder")}
                        >
                          <div className="folder-card-add-icon">
                            <Plus size={24} />
                          </div>
                          <span>Thêm Thư Mục Mới</span>
                        </div>
                      )}
                    </div>

                    {totalFolderPages > 1 && (
                      <div className="pagination">
                        <button
                          className="pagination-btn"
                          disabled={currentFolderPage === 0}
                          onClick={() =>
                            handleFolderPageChange(currentFolderPage - 1)
                          }
                        >
                          <ChevronLeft size={16} /> Trước
                        </button>
                        <div className="pagination-pages">
                          {Array.from({ length: totalFolderPages }, (_, i) => (
                            <button
                              key={i}
                              className={`pagination-page ${i === currentFolderPage ? "active" : ""}`}
                              onClick={() => handleFolderPageChange(i)}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                        <button
                          className="pagination-btn"
                          disabled={currentFolderPage === totalFolderPages - 1}
                          onClick={() =>
                            handleFolderPageChange(currentFolderPage + 1)
                          }
                        >
                          Tiếp <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Recent Study Sets section */}
                {sets.length > 0 && (
                  <div className="recent-section">
                    <div className="recent-section-header">
                      <h3>Bộ Học Tập Gần Đây</h3>
                      <button
                        className="view-all-btn"
                        onClick={() => setActiveTab(1)}
                      >
                        Xem Tất Cả
                      </button>
                    </div>
                    <div className="recent-sets-list">
                      {sets.slice(0, 2).map((set, idx) => (
                        <div
                          key={set.id}
                          className="recent-set-row"
                          onClick={() => navigate(`/study-set?id=${set.id}`)}
                        >
                          <div
                            className="recent-set-thumb"
                            style={{
                              background:
                                setThumbColors[idx % setThumbColors.length],
                            }}
                          >
                            <BookOpen size={18} color="white" />
                          </div>
                          <div className="recent-set-info">
                            <h4>{set.title}</h4>
                            <p>{set.flashcardCount} Thẻ</p>
                          </div>
                          <button
                            className="recent-set-play"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/study-set?id=${set.id}`);
                            }}
                          >
                            <Play size={14} fill="currentColor" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Study Sets Tab */}
            {activeTab === 1 && (
              <>
                {sets.length === 0 ? (
                  <div className="library-empty">
                    <Layers size={48} />
                    <h3>Chưa có bộ học tập nào</h3>
                    <p>Tạo bộ học tập đầu tiên của bạn để bắt đầu học</p>
                  </div>
                ) : (
                  <>
                    <div className="set-list">
                      {sets.map((set) => (
                        <div
                          key={set.id}
                          className="set-card"
                          onClick={() => navigate(`/study-set?id=${set.id}`)}
                        >
                          <div className="set-card-header">
                            <Layers size={18} />
                            <div className="set-card-header-right">
                              <span
                                className={`set-visibility ${set.visibility}`}
                              >
                                {set.visibility === "public"
                                  ? "Công Khai"
                                  : "Riêng Tư"}
                              </span>
                              <button
                                className={`favorite-btn ${favoriteIds.has(set.id) ? "active" : ""}`}
                                onClick={(e) => handleToggleFavorite(e, set.id)}
                                title="Yêu Thích"
                              >
                                <Heart
                                  size={16}
                                  fill={
                                    favoriteIds.has(set.id)
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                              </button>
                            </div>
                          </div>
                          <h3>{set.title}</h3>
                          {set.description && (
                            <p className="set-description">{set.description}</p>
                          )}
                          <p className="set-meta">{set.flashcardCount} Thẻ</p>
                        </div>
                      ))}
                      <div
                        className="set-card-add"
                        onClick={() => navigate("/create-set")}
                      >
                        <div className="set-card-add-icon">
                          <Plus size={24} />
                        </div>
                        <span>Thêm Bộ Mới</span>
                      </div>
                    </div>

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
                          {Array.from(
                            { length: pageInfo.totalPages },
                            (_, i) => (
                              <button
                                key={i}
                                className={`pagination-page ${i === currentPage ? "active" : ""}`}
                                onClick={() => handlePageChange(i)}
                              >
                                {i + 1}
                              </button>
                            ),
                          )}
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
                  </>
                )}
              </>
            )}

            {/* Recent Tab */}
            {activeTab === 2 && (
              <>
                {recentSets.length === 0 ? (
                  <div className="library-empty">
                    <Clock size={48} />
                    <h3>Không có hoạt động gần đây</h3>
                    <p>Mở một bộ học tập bất kỳ để xem lại ở đây</p>
                  </div>
                ) : (
                  <div className="set-list">
                    {recentSets.map((set) => (
                      <div
                        key={set.id}
                        className="set-card"
                        onClick={() => navigate(`/study-set?id=${set.id}`)}
                      >
                        <div className="set-card-header">
                          <Layers size={18} />
                          <span className={`set-visibility ${set.visibility}`}>
                            {set.visibility === "public"
                              ? "Công Khai"
                              : "Riêng Tư"}
                          </span>
                        </div>
                        <h3>{set.title}</h3>
                        {set.description && (
                          <p className="set-description">{set.description}</p>
                        )}
                        <div className="set-card-footer">
                          <span className="set-meta">
                            {set.flashcardCount} Thẻ
                          </span>
                          {set.username && (
                            <span className="set-author">
                              bởi {set.username}
                            </span>
                          )}
                          <span className="set-date">
                            {new Date(set.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Favorites Tab */}
            {activeTab === 3 && (
              <>
                {favoriteSets.length === 0 ? (
                  <div className="library-empty">
                    <Heart size={48} />
                    <h3>Chưa có yêu thích nào</h3>
                    <p>
                      Nhấn biểu tượng trái tim trên bất kỳ bộ học tập nào để
                      thêm nó vào yêu thích
                    </p>
                  </div>
                ) : (
                  <div className="set-list">
                    {favoriteSets.map((set) => (
                      <div
                        key={set.id}
                        className="set-card"
                        onClick={() => navigate(`/study-set?id=${set.id}`)}
                      >
                        <div className="set-card-header">
                          <Layers size={18} />
                          <div className="set-card-header-right">
                            <span
                              className={`set-visibility ${set.visibility}`}
                            >
                              {set.visibility === "public"
                                ? "Công Khai"
                                : "Riêng Tư"}
                            </span>
                            <button
                              className="favorite-btn active"
                              onClick={(e) => handleToggleFavorite(e, set.id)}
                            >
                              <Heart size={16} fill="currentColor" />
                            </button>
                          </div>
                        </div>
                        <h3>{set.title}</h3>
                        {set.description && (
                          <p className="set-description">{set.description}</p>
                        )}
                        <p className="set-meta">{set.flashcardCount} Thẻ</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Rename Modal */}
      {editingFolder && (
        <div className="modal-overlay" onClick={() => setEditingFolder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Đổi Tên Thư Mục</h3>
            <input
              type="text"
              className="modal-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameFolder()}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setEditingFolder(null)}
              >
                Hủy
              </button>
              <button
                className="modal-btn confirm"
                onClick={handleRenameFolder}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingFolder && (
        <div className="modal-overlay" onClick={() => setDeletingFolder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Xóa Thư Mục</h3>
            <p>
              Bạn có chắc chắn muốn xóa "<strong>{deletingFolder.name}</strong>
              "? Hành động này không thể hoàn tác.
            </p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setDeletingFolder(null)}
              >
                Hủy
              </button>
              <button className="modal-btn danger" onClick={handleDeleteFolder}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
