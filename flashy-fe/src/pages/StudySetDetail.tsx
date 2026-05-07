import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Layers,
  SlidersHorizontal,
  Plus,
  FileQuestion,
  Shuffle,
  Pencil,
  Trash2,
  MoreHorizontal,
  Share2,
  Download,
  Copy,
  FolderOpen,
  Star,
  Volume2,
  Brain,
} from "lucide-react";
import {
  getSetById,
  deleteSet,
  exportSet,
  cloneSet,
  updateSet,
  type FlashcardSetResponse,
} from "../services/setService";
import {
  getFolderById,
  getMyFolders,
  type FolderResponse,
} from "../services/folderService";
import { getSRSStats } from "../services/srsService";
import { recordRecentSet } from "../services/recentSetsService";
import "./StudySetDetail.css";

export default function StudySetDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setId = Number(searchParams.get("id"));

  const [studySet, setStudySet] = useState<FlashcardSetResponse | null>(null);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [addingToFolder, setAddingToFolder] = useState(false);
  const [srsDueCount, setSrsDueCount] = useState(0);

  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target as Node)
      ) {
        setShowMoreMenu(false);
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
      .then((res) => {
        setStudySet(res.data);
        recordRecentSet(res.data);
        if (res.data.folderId) {
          getFolderById(res.data.folderId)
            .then((folderRes) => setFolderName(folderRes.data.name))
            .catch(() => {});
        }
      })
      .catch(() => setError("Failed to load study set"))
      .finally(() => setLoading(false));

    getSRSStats(setId)
      .then((stats) => setSrsDueCount(stats.dueCards))
      .catch(() => {});
  }, [setId]);

  const openFolderPicker = () => {
    setShowMoreMenu(false);
    setShowFolderPicker(true);
    setFoldersLoading(true);
    getMyFolders()
      .then((res) => setFolders(res.data))
      .catch(() => {})
      .finally(() => setFoldersLoading(false));
  };

  const handleAddToFolder = async (folderId: number, folderNameVal: string) => {
    if (!studySet) return;
    setAddingToFolder(true);
    try {
      await updateSet(studySet.id, {
        title: studySet.title,
        description: studySet.description || undefined,
        visibility: studySet.visibility,
        folderId,
      });
      setStudySet((prev) => (prev ? { ...prev, folderId } : prev));
      setFolderName(folderNameVal);
      setShowFolderPicker(false);
    } catch {
      setError("Failed to add to folder. Please try again.");
    } finally {
      setAddingToFolder(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSet(setId);
      navigate("/library");
    } catch {
      setError("Failed to delete set");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="studyset-page">
        <div className="studyset-loading">Đang tải...</div>
      </div>
    );
  }

  if (error || !studySet) {
    return (
      <div className="studyset-page">
        <header className="studyset-header">
          <button className="studyset-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <h1>Study Set</h1>
        </header>
        <div className="studyset-error">{error || "Study set not found"}</div>
      </div>
    );
  }

  return (
    <div className="studyset-page">
      <header className="studyset-header">
        <div className="studyset-header-info">
          {folderName && studySet.folderId && (
            <Link
              to={`/folder-detail?id=${studySet.folderId}`}
              className="studyset-folder-link"
            >
              <FolderOpen size={22} />
              {folderName}
            </Link>
          )}
        </div>
        <div className="studyset-header-actions">
          <button
            onClick={() => navigate(`/edit-set?id=${studySet.id}`)}
            title="Sửa"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="Xóa"
            className="studyset-delete-icon"
          >
            <Trash2 size={18} />
          </button>
          <div className="studyset-more-wrapper" ref={moreMenuRef}>
            <button onClick={() => setShowMoreMenu(!showMoreMenu)} title="Thêm">
              <MoreHorizontal size={20} />
            </button>
            {showMoreMenu && (
              <div className="studyset-more-dropdown">
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                  }}
                >
                  <Share2 size={16} /> Chia sẻ
                </button>
                <button
                  onClick={async () => {
                    setShowMoreMenu(false);
                    setExporting(true);
                    try {
                      await exportSet(studySet.id);
                    } catch (err) {
                      console.error("Export set failed", err);
                    } finally {
                      setExporting(false);
                    }
                  }}
                  disabled={exporting}
                >
                  <Download size={16} /> {exporting ? "Đang xuất..." : "Xuất"}
                </button>
                <button
                  disabled={cloning}
                  onClick={async () => {
                    setShowMoreMenu(false);
                    setCloning(true);
                    try {
                      const res = await cloneSet(studySet);
                      navigate(`/study-set?id=${res.data.id}`);
                    } catch {
                      setError("Failed to duplicate set. Please try again.");
                    } finally {
                      setCloning(false);
                    }
                  }}
                >
                  <Copy size={16} /> {cloning ? "Đang nhân bản..." : "Nhân bản"}
                </button>
                {studySet.folderId ? (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      navigate(`/folder-detail?id=${studySet.folderId}`);
                    }}
                  >
                    <FolderOpen size={16} /> Đi đến thư mục
                  </button>
                ) : (
                  <button onClick={openFolderPicker}>
                    <FolderOpen size={16} /> Thêm vào thư mục
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="studyset-content">
        <div className="studyset-hero">
          <div className="studyset-image" />
          <div className="studyset-hero-info">
            <h2>{studySet.title}</h2>
            <p className="studyset-meta">
              {studySet.flashcardCount} Từ vựng
              {studySet.description && <> &bull; {studySet.description}</>}
            </p>
          </div>
        </div>

        {/* Study mode buttons only */}
        <div className="studyset-actions">
          <Link to={`/study-mode?id=${studySet.id}`} className="btn-study">
            <Play size={18} /> Học
          </Link>
          <Link to={`/srs-mode?id=${studySet.id}`} className="btn-srs">
            <Brain size={18} /> SRS
            {srsDueCount > 0 && (
              <span className="srs-due-badge">{srsDueCount}</span>
            )}
          </Link>
          <Link to={`/quiz?id=${studySet.id}`} className="btn-quiz">
            <FileQuestion size={18} /> Quiz
          </Link>
          <Link to={`/match?id=${studySet.id}`} className="btn-match">
            <Shuffle size={18} /> Nối thẻ
          </Link>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="studyset-delete-confirm">
            <p>
              Delete "<strong>{studySet.title}</strong>" and all its flashcards?
              This cannot be undone.
            </p>
            <div className="studyset-delete-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}

        <div className="terms-header">
          <h3>Từ vựng ({studySet.flashcards.length})</h3>
          <button className="terms-sort">
            <SlidersHorizontal size={16} /> Bảng chữ cái
          </button>
        </div>

        {studySet.flashcards.length === 0 ? (
          <div className="studyset-empty">
            <Layers size={40} />
            <p>No flashcards yet. Add your first one!</p>
          </div>
        ) : (
          <div className="terms-list">
            {studySet.flashcards.map((fc, idx) => (
              <div key={fc.id} className="term-card">
                <div className="term-card-top">
                  <span className="term-index">{idx + 1}</span>
                  <div className="term-card-actions">
                    <button className="term-action-btn" title="Nghe">
                      <Volume2 size={18} />
                    </button>
                    <button
                      className="term-action-btn"
                      title="Sửa"
                      onClick={() => navigate(`/edit-set?id=${studySet.id}`)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button className="term-action-btn" title="Yêu thích">
                      <Star size={18} />
                    </button>
                  </div>
                </div>
                <div className="term-content">
                  <div className="term-word">{fc.term}</div>
                  <div className="term-divider" />
                  <div className="term-definition">{fc.definition}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className="add-card"
          onClick={() => navigate(`/edit-set?id=${studySet.id}`)}
        >
          <div className="add-card-icon">
            <Plus size={18} />
          </div>
          Thêm thẻ mới
        </button>
      </div>

      {/* Folder picker modal */}
      {showFolderPicker && (
        <div
          className="folder-picker-overlay"
          onClick={() => setShowFolderPicker(false)}
        >
          <div
            className="folder-picker-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="folder-picker-header">
              <h2>Add to folder</h2>
              <button
                className="folder-picker-close"
                onClick={() => setShowFolderPicker(false)}
              >
                ×
              </button>
            </div>

            {foldersLoading ? (
              <div className="folder-picker-loading">Loading folders…</div>
            ) : folders.length === 0 ? (
              <div className="folder-picker-empty">
                <p>You have no folders yet.</p>
                <button
                  className="folder-picker-create-btn"
                  onClick={() => navigate("/create-folder")}
                >
                  <FolderOpen size={16} /> Create a folder
                </button>
              </div>
            ) : (
              <ul className="folder-picker-list">
                {folders.map((folder) => (
                  <li key={folder.id}>
                    <button
                      className="folder-picker-item"
                      disabled={addingToFolder}
                      onClick={() => handleAddToFolder(folder.id, folder.name)}
                    >
                      <FolderOpen size={18} />
                      <span>{folder.name}</span>
                      <span className="folder-picker-count">
                        {folder.sets.length} sets
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!foldersLoading && folders.length > 0 && (
              <div className="folder-picker-footer">
                <button
                  className="folder-picker-create-btn"
                  onClick={() => navigate("/create-folder")}
                >
                  <Plus size={15} /> New folder
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
