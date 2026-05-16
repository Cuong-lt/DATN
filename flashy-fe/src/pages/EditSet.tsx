import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Globe,
  Lock,
  Plus,
  Trash2,
  GripVertical,
  Save,
} from "lucide-react";
import { getSetById, updateSet, deleteSet } from "../services/setService";
import {
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
} from "../services/flashcardService";
import { getMyFolders, type FolderResponse } from "../services/folderService";
import "./CreateSet.css";

interface CardDraft {
  localId: number;
  serverId: number | null; // null = new card, number = existing card
  term: string;
  definition: string;
  deleted: boolean;
}

let nextLocalId = 1;

export default function EditSet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setId = Number(searchParams.get("id"));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [folderId, setFolderId] = useState<number | "">("");
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [cards, setCards] = useState<CardDraft[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!setId) {
      setError("Study set not found");
      setLoading(false);
      return;
    }

    Promise.all([getSetById(setId), getMyFolders()])
      .then(([setRes, foldersRes]) => {
        const s = setRes.data;
        setTitle(s.title);
        setDescription(s.description || "");
        setVisibility(s.visibility);
        setFolderId(s.folderId || "");
        setFolders(foldersRes.data);

        const existingCards: CardDraft[] = s.flashcards.map((fc) => ({
          localId: nextLocalId++,
          serverId: fc.id,
          term: fc.term,
          definition: fc.definition,
          deleted: false,
        }));

        if (existingCards.length === 0) {
          existingCards.push({
            localId: nextLocalId++,
            serverId: null,
            term: "",
            definition: "",
            deleted: false,
          });
        }

        setCards(existingCards);
      })
      .catch(() =>
        setError("Bộ thẻ không tồn tại hoặc bạn không có quyền chỉnh sửa."),
      )
      .finally(() => setLoading(false));
  }, [setId]);

  const activeCards = cards.filter((c) => !c.deleted);

  const updateCard = (
    localId: number,
    field: "term" | "definition",
    value: string,
  ) => {
    setCards((prev) =>
      prev.map((c) => (c.localId === localId ? { ...c, [field]: value } : c)),
    );
  };

  const removeCard = (localId: number) => {
    const card = cards.find((c) => c.localId === localId);
    if (!card) return;

    if (activeCards.length <= 1) return;

    if (card.serverId) {
      // Mark existing card for deletion
      setCards((prev) =>
        prev.map((c) => (c.localId === localId ? { ...c, deleted: true } : c)),
      );
    } else {
      // Remove new card entirely
      setCards((prev) => prev.filter((c) => c.localId !== localId));
    }
  };

  const addCard = () => {
    setCards((prev) => [
      ...prev,
      {
        localId: nextLocalId++,
        serverId: null,
        term: "",
        definition: "",
        deleted: false,
      },
    ]);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setError("");
    setSaving(true);
    try {
      // 1. Update set info
      await updateSet(setId, {
        title: title.trim(),
        description: description.trim() || undefined,
        visibility,
        folderId: folderId ? Number(folderId) : null,
      });

      // 2. Handle flashcard changes
      const promises: Promise<unknown>[] = [];

      for (const card of cards) {
        if (card.deleted && card.serverId) {
          // Delete existing card
          promises.push(deleteFlashcard(card.serverId));
        } else if (
          !card.deleted &&
          card.serverId &&
          card.term.trim() &&
          card.definition.trim()
        ) {
          // Update existing card
          promises.push(
            updateFlashcard(card.serverId, {
              term: card.term.trim(),
              definition: card.definition.trim(),
            }),
          );
        } else if (
          !card.deleted &&
          !card.serverId &&
          card.term.trim() &&
          card.definition.trim()
        ) {
          // Create new card
          promises.push(
            createFlashcard(setId, {
              term: card.term.trim(),
              definition: card.definition.trim(),
            }),
          );
        }
      }

      await Promise.all(promises);

      navigate(`/study-set?id=${setId}`);
    } catch (err: any) {
      setError(err?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSet = async () => {
    setDeleting(true);
    try {
      await deleteSet(setId);
      navigate("/library");
    } catch (err: any) {
      setError(err?.message || "Failed to delete set.");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="create-set-page">
        <div className="edit-set-loading">Loading...</div>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="create-set-page">
        <header className="create-set-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1>Chỉnh sửa bộ thẻ</h1>
        </header>
        <div className="create-set-content">
          <div className="create-set-error">{error}</div>
        </div>
      </div>
    );
  }

  const filledCards = activeCards.filter(
    (c) => c.term.trim() || c.definition.trim(),
  ).length;

  return (
    <div className="create-set-page">
      <header className="create-set-header">
        <button
          className="back-btn"
          onClick={() => navigate(`/study-set?id=${setId}`)}
        >
          <ArrowLeft size={20} />
        </button>
        <h1>Chỉnh sửa bộ thẻ</h1>
        <button
          type="button"
          className="page-create-btn"
          disabled={saving || !title.trim()}
          onClick={() => handleSave()}
        >
          <Save size={16} />
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </header>

      <div className="create-set-content">
        {error && <div className="create-set-error">{error}</div>}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <input
              type="text"
              className="form-input title-input"
              placeholder="Enter a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <span className="form-hint">Tiêu đề</span>
          </div>

          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <span className="form-hint">Mô tả</span>
          </div>

          <div className="settings-row">
            <div className="setting-item">
              <label className="form-hint">Hiển thị</label>
              <div className="visibility-options">
                <button
                  type="button"
                  className={`visibility-btn ${visibility === "private" ? "active" : ""}`}
                  onClick={() => setVisibility("private")}
                >
                  <Lock size={14} /> Riêng tư
                </button>
                <button
                  type="button"
                  className={`visibility-btn ${visibility === "public" ? "active" : ""}`}
                  onClick={() => setVisibility("public")}
                >
                  <Globe size={14} /> Công khai
                </button>
              </div>
            </div>
            <div className="setting-item">
              <label className="form-hint">Thư mục</label>
              <select
                className="form-select"
                value={folderId}
                onChange={(e) =>
                  setFolderId(e.target.value ? Number(e.target.value) : "")
                }
              >
                <option value="">Không</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Flashcards */}
          <div className="cards-section">
            <div className="cards-section-header">
              <h2>Thẻ</h2>
              <span className="cards-count">
                {filledCards} / {activeCards.length}
              </span>
            </div>

            <div className="cards-list">
              {activeCards.map((card, index) => (
                <div key={card.localId} className="card-editor">
                  <div className="card-editor-top">
                    <span className="card-number">{index + 1}</span>
                    <div className="card-editor-actions">
                      <GripVertical size={16} className="drag-handle" />
                      <button
                        type="button"
                        className="card-delete-btn"
                        onClick={() => removeCard(card.localId)}
                        disabled={activeCards.length <= 1}
                        title="Xóa thẻ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="card-editor-fields">
                    <div className="card-field">
                      <input
                        type="text"
                        placeholder="Enter term"
                        value={card.term}
                        onChange={(e) =>
                          updateCard(card.localId, "term", e.target.value)
                        }
                      />
                      <span className="card-field-label">Thuật ngữ</span>
                    </div>
                    <div className="card-field-divider" />
                    <div className="card-field">
                      <input
                        type="text"
                        placeholder="Enter definition"
                        value={card.definition}
                        onChange={(e) =>
                          updateCard(card.localId, "definition", e.target.value)
                        }
                      />
                      <span className="card-field-label">Định nghĩa</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="btn-add-card" onClick={addCard}>
              <Plus size={20} />
              <span>Thêm thẻ mới</span>
            </button>
          </div>

          <button
            type="submit"
            className="btn-create-final"
            disabled={saving || !title.trim()}
          >
            {saving
              ? "Đang lưu ..."
              : `Lưu ${filledCards} thẻ${filledCards !== 1 ? "" : ""}`}
          </button>
        </form>

        {/* Delete set */}
        <div className="delete-set-section">
          {!showDeleteConfirm ? (
            <button
              className="btn-delete-set"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={16} /> Xóa bộ thẻ này
            </button>
          ) : (
            <div className="delete-confirm">
              <p>
                Bạn có chắc chắn muốn xóa bộ thẻ này không? Hành động này sẽ xóa
                vĩnh viễn bộ thẻ và tất cả các thẻ trong nó.
              </p>
              <div className="delete-confirm-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Hủy
                </button>
                <button
                  className="btn-confirm-delete"
                  onClick={handleDeleteSet}
                  disabled={deleting}
                >
                  {deleting ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
