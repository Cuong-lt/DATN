import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Globe,
  Lock,
  Plus,
  Trash2,
  GripVertical,
  Upload,
  X,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { createSet } from "../services/setService";
import { createFlashcard } from "../services/flashcardService";
import { getMyFolders, type FolderResponse } from "../services/folderService";
import {
  generateFlashcards,
  type GeneratedFlashcard,
} from "../services/aiService";
import "./CreateSet.css";

interface CardDraft {
  id: number;
  term: string;
  definition: string;
}

let nextCardId = 1;

function makeCard(): CardDraft {
  return { id: nextCardId++, term: "", definition: "" };
}

export default function CreateSet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedFolderId = searchParams.get("folderId");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [folderId, setFolderId] = useState<number | "">(
    preselectedFolderId ? Number(preselectedFolderId) : "",
  );
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [cards, setCards] = useState<CardDraft[]>([makeCard(), makeCard()]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // AI generate modal state
  const [aiModal, setAiModal] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiCardCount, setAiCardCount] = useState(10);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiPreview, setAiPreview] = useState<GeneratedFlashcard[]>([]);
  const [aiSelected, setAiSelected] = useState<Set<number>>(new Set());

  // Import modal state
  const [importModal, setImportModal] = useState(false);
  const [importRows, setImportRows] = useState<string[][]>([]);
  const [importHasHeader, setImportHasHeader] = useState(true);
  const [importTermCol, setImportTermCol] = useState(0);
  const [importDefCol, setImportDefCol] = useState(1);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMyFolders()
      .then((res) => setFolders(res.data))
      .catch(() => {});
  }, []);

  const updateCard = (
    id: number,
    field: "term" | "definition",
    value: string,
  ) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const removeCard = (id: number) => {
    if (cards.length <= 1) return;
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const addCard = () => {
    setCards((prev) => [...prev, makeCard()]);
  };

  const openAiModal = () => {
    setAiText("");
    setAiCardCount(10);
    setAiError("");
    setAiPreview([]);
    setAiSelected(new Set());
    setAiModal(true);
  };

  const handleAiGenerate = async () => {
    if (!aiText.trim()) {
      setAiError("Please enter a topic or text.");
      return;
    }
    setAiError("");
    setAiLoading(true);
    try {
      const items = await generateFlashcards(aiText.trim(), aiCardCount);
      if (items.length === 0) {
        setAiError("No flashcards could be generated. Try a different topic.");
        return;
      }
      setAiPreview(items);
      setAiSelected(new Set(items.map((_, i) => i)));
    } catch (err) {
      const e = err as Record<string, unknown>;
      const msg =
        (e?.message as string) ||
        "Generation failed. Please check your input and try again.";
      setAiError(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleAiSelect = (index: number) => {
    setAiSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const confirmAiImport = () => {
    const selected = aiPreview.filter((_, i) => aiSelected.has(i));
    if (selected.length === 0) return;
    setCards((prev) => {
      const filled = prev.filter((c) => c.term || c.definition);
      const imported = selected.map((c) => ({ ...makeCard(), ...c }));
      return [...filled, ...imported, makeCard()];
    });
    setAiModal(false);
  };

  const openImport = () => {
    setImportRows([]);
    setImportHasHeader(true);
    setImportTermCol(0);
    setImportDefCol(1);
    setImportError("");
    setImportModal(true);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!e.target.files) return;
    e.target.value = "";
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse<string[]>(file, {
        skipEmptyLines: true,
        complete: (result) => {
          if (result.data.length === 0) {
            setImportError("File is empty or could not be parsed.");
            return;
          }
          setImportError("");
          setImportRows(result.data as string[][]);
        },
        error: () => setImportError("Failed to parse CSV file."),
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = new Uint8Array(ev.target!.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
            header: 1,
            defval: "",
          }) as string[][];
          const nonEmpty = rows.filter((r) => r.some((c) => String(c).trim()));
          if (nonEmpty.length === 0) {
            setImportError("Spreadsheet is empty.");
            return;
          }
          setImportError("");
          setImportRows(nonEmpty);
        } catch {
          setImportError("Failed to parse Excel file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setImportError("Unsupported file type. Please use .csv, .xlsx, or .xls");
    }
  };

  const previewRows = importHasHeader ? importRows.slice(1) : importRows;
  const colCount = importRows[0]?.length ?? 0;

  const confirmImport = () => {
    const newCards = previewRows
      .map((row) => ({
        term: String(row[importTermCol] ?? "").trim(),
        definition: String(row[importDefCol] ?? "").trim(),
      }))
      .filter((c) => c.term || c.definition);

    if (newCards.length === 0) {
      setImportError("No valid cards found in selected columns.");
      return;
    }

    setCards((prev) => {
      const empty = prev.filter((c) => !c.term && !c.definition);
      const filled = prev.filter((c) => c.term || c.definition);
      const imported = newCards.map((c) => ({ ...makeCard(), ...c }));
      return [
        ...filled,
        ...imported,
        ...(empty.length > 0 ? [] : [makeCard()]),
      ];
    });
    setImportModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const validCards = cards.filter(
      (c) => c.term.trim() && c.definition.trim(),
    );
    if (validCards.length === 0) {
      setError("Add at least 1 flashcard with both term and definition");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const setRes = await createSet({
        title: title.trim(),
        description: description.trim() || undefined,
        visibility,
        folderId: folderId ? Number(folderId) : undefined,
      });

      const setId = setRes.data.id;

      await Promise.all(
        validCards.map((card) =>
          createFlashcard(setId, {
            term: card.term.trim(),
            definition: card.definition.trim(),
          }),
        ),
      );

      navigate(
        preselectedFolderId
          ? `/folder-detail?id=${preselectedFolderId}`
          : "/library",
      );
    } catch (err: any) {
      setError(err?.message || "Failed to create set. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filledCards = cards.filter(
    (c) => c.term.trim() || c.definition.trim(),
  ).length;

  return (
    <div className="create-set-page">
      <header className="create-set-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1>Tạo bộ thẻ học</h1>
        <button
          type="button"
          className="page-create-btn"
          disabled={loading || !title.trim()}
          onClick={handleSubmit}
        >
          <Plus size={16} />
          {loading ? "Creating..." : "Create"}
        </button>
      </header>

      <div className="create-set-content">
        {error && <div className="create-set-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Title & Description */}
          <div className="form-group">
            <input
              type="text"
              className="form-input title-input"
              placeholder='Nhập tiêu đề (ví dụ: "Bộ thẻ Sinh học 101")'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <span className="form-hint">TIÊU ĐỀ</span>
          </div>

          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Thêm mô tả..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <span className="form-hint">MÔ TẢ</span>
          </div>

          {/* Settings row */}
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
                <option value="">No folder</option>
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
              <h2>Thẻ ghi nhớ</h2>
              <span className="cards-count">
                {filledCards} / {cards.length}
              </span>
            </div>

            <div className="cards-list">
              {cards.map((card, index) => (
                <div key={card.id} className="card-editor">
                  <div className="card-editor-top">
                    <span className="card-number">{index + 1}</span>
                    <div className="card-editor-actions">
                      <GripVertical size={16} className="drag-handle" />
                      <button
                        type="button"
                        className="card-delete-btn"
                        onClick={() => removeCard(card.id)}
                        disabled={cards.length <= 1}
                        title="Delete card"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="card-editor-fields">
                    <div className="card-field">
                      <input
                        type="text"
                        placeholder="Nhập thuật ngữ"
                        value={card.term}
                        onChange={(e) =>
                          updateCard(card.id, "term", e.target.value)
                        }
                      />
                      <span className="card-field-label">Thuật ngữ</span>
                    </div>
                    <div className="card-field-divider" />
                    <div className="card-field">
                      <input
                        type="text"
                        placeholder="Nhập định nghĩa"
                        value={card.definition}
                        onChange={(e) =>
                          updateCard(card.id, "definition", e.target.value)
                        }
                      />
                      <span className="card-field-label">Định nghĩa</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cards-add-row">
              <button type="button" className="btn-add-card" onClick={addCard}>
                <Plus size={20} />
                <span>THÊM THẺ</span>
              </button>
              <button
                type="button"
                className="btn-import-csv"
                onClick={openImport}
              >
                <FileSpreadsheet size={18} />
                <span>NHẬP FILE CSV/EXCEL</span>
              </button>
              <button
                type="button"
                className="btn-ai-generate"
                onClick={openAiModal}
              >
                <Sparkles size={18} />
                <span>TẠO THẺ VỚI AI</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-create-final"
            disabled={loading || !title.trim()}
          >
            {loading
              ? "Creating set..."
              : `Tạo với ${filledCards} thẻ${filledCards !== 1 ? "" : ""}`}{" "}
          </button>
        </form>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* AI Generate Modal */}
      {aiModal && (
        <div className="import-modal-overlay" onClick={() => setAiModal(false)}>
          <div
            className="import-modal ai-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="import-modal-header">
              <h2>
                <Sparkles size={20} />
                Tạo thẻ với AI
              </h2>
              <button
                type="button"
                className="import-modal-close"
                onClick={() => setAiModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {aiPreview.length === 0 ? (
              <div className="ai-input-section">
                <label className="ai-label">
                  Chủ đề hoặc văn bản để tạo thẻ từ
                </label>
                <textarea
                  className="ai-textarea"
                  placeholder={`Ví dụ:\n• "Quang hợp trong thực vật"\n• "Closure trong JavaScript"\n• Dán một đoạn văn từ ghi chú của bạn...`}
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  rows={6}
                  autoFocus
                />
                <div className="ai-count-row">
                  <label className="ai-label">Số lượng thẻ ghi nhớ</label>
                  <div className="ai-count-controls">
                    <button
                      type="button"
                      className="ai-count-btn"
                      onClick={() => setAiCardCount((n) => Math.max(1, n - 1))}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="ai-count-value"
                      value={aiCardCount}
                      min={1}
                      max={20}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setAiCardCount(Math.min(20, Math.max(1, val)));
                      }}
                    />
                    <button
                      type="button"
                      className="ai-count-btn"
                      onClick={() => setAiCardCount((n) => Math.min(20, n + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
                {aiError && <p className="import-modal-error">{aiError}</p>}
                <button
                  type="button"
                  className="ai-generate-btn"
                  onClick={handleAiGenerate}
                  disabled={aiLoading || !aiText.trim()}
                >
                  {aiLoading ? (
                    <>
                      <span className="ai-spinner" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Generate {aiCardCount} cards
                    </>
                  )}
                </button>
              </div>
            ) : (
              <>
                <div className="ai-preview-header">
                  <p className="import-preview-label">
                    {aiSelected.size} / {aiPreview.length} cards selected
                  </p>
                  <button
                    type="button"
                    className="ai-select-all"
                    onClick={() =>
                      setAiSelected(
                        aiSelected.size === aiPreview.length
                          ? new Set()
                          : new Set(aiPreview.map((_, i) => i)),
                      )
                    }
                  >
                    {aiSelected.size === aiPreview.length
                      ? "Deselect all"
                      : "Select all"}
                  </button>
                </div>
                <div className="import-preview-table-wrap ai-preview-list">
                  {aiPreview.map((card, i) => (
                    <label
                      key={i}
                      className={`ai-card-row ${aiSelected.has(i) ? "selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={aiSelected.has(i)}
                        onChange={() => toggleAiSelect(i)}
                      />
                      <div className="ai-card-content">
                        <span className="ai-card-term">{card.term}</span>
                        <span className="ai-card-sep">→</span>
                        <span className="ai-card-def">{card.definition}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="import-modal-actions">
                  <button
                    type="button"
                    className="import-btn-reselect"
                    onClick={() => setAiPreview([])}
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    className="import-btn-confirm"
                    onClick={confirmAiImport}
                    disabled={aiSelected.size === 0}
                  >
                    <Plus size={16} />
                    Add {aiSelected.size} cards
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModal && (
        <div
          className="import-modal-overlay"
          onClick={() => setImportModal(false)}
        >
          <div className="import-modal" onClick={(e) => e.stopPropagation()}>
            <div className="import-modal-header">
              <h2>
                <FileSpreadsheet size={20} />
                Import CSV / Excel
              </h2>
              <button
                type="button"
                className="import-modal-close"
                onClick={() => setImportModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {importRows.length === 0 ? (
              <div
                className="import-drop-area"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={36} />
                <p>Click to choose a file</p>
                <span>.csv, .xlsx, .xls</span>
                {importError && (
                  <p className="import-modal-error">{importError}</p>
                )}
              </div>
            ) : (
              <>
                {importError && (
                  <p className="import-modal-error">{importError}</p>
                )}

                <div className="import-options">
                  <label className="import-toggle">
                    <input
                      type="checkbox"
                      checked={importHasHeader}
                      onChange={(e) => setImportHasHeader(e.target.checked)}
                    />
                    First row is a header
                  </label>

                  <div className="import-col-selects">
                    <div className="import-col-select">
                      <label>Term column</label>
                      <select
                        value={importTermCol}
                        onChange={(e) =>
                          setImportTermCol(Number(e.target.value))
                        }
                      >
                        {Array.from({ length: colCount }, (_, i) => (
                          <option key={i} value={i}>
                            {importHasHeader
                              ? String(importRows[0][i] || `Column ${i + 1}`)
                              : `Column ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="import-col-select">
                      <label>Definition column</label>
                      <select
                        value={importDefCol}
                        onChange={(e) =>
                          setImportDefCol(Number(e.target.value))
                        }
                      >
                        {Array.from({ length: colCount }, (_, i) => (
                          <option key={i} value={i}>
                            {importHasHeader
                              ? String(importRows[0][i] || `Column ${i + 1}`)
                              : `Column ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="import-preview">
                  <p className="import-preview-label">
                    Preview ({previewRows.length} cards)
                  </p>
                  <div className="import-preview-table-wrap">
                    <table className="import-preview-table">
                      <thead>
                        <tr>
                          <th>TERM</th>
                          <th>DEFINITION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.slice(0, 8).map((row, i) => (
                          <tr key={i}>
                            <td>{String(row[importTermCol] ?? "")}</td>
                            <td>{String(row[importDefCol] ?? "")}</td>
                          </tr>
                        ))}
                        {previewRows.length > 8 && (
                          <tr>
                            <td colSpan={2} className="import-preview-more">
                              +{previewRows.length - 8} more rows…
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="import-modal-actions">
                  <button
                    type="button"
                    className="import-btn-reselect"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose different file
                  </button>
                  <button
                    type="button"
                    className="import-btn-confirm"
                    onClick={confirmImport}
                  >
                    <Plus size={16} />
                    Add {previewRows.length} cards
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
