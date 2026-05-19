import { useEffect, useState, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Trash2, Globe, Lock, Layers, Heart, X, BookOpen
} from 'lucide-react';
import {
  getAllSets, adminDeleteSet,
  type AdminSet,
} from '../services/adminService';
import './AdminSets.css';

const VISIBILITY_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'public', label: 'Công khai' },
  { value: 'private', label: 'Riêng tư' },
];

export default function AdminSets() {
  const [sets, setSets] = useState<AdminSet[]>([]);
  const [search, setSearch] = useState('');
  const [visibility, setVisibility] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailSet, setDetailSet] = useState<AdminSet | null>(null);

  const fetchSets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllSets(search, visibility, page, 10);
      setSets(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, visibility, page]);

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  const handleDelete = async (set: AdminSet) => {
    if (!confirm(`Bạn có chắc muốn xóa bộ thẻ "${set.title}"?\nToàn bộ flashcard trong bộ thẻ sẽ bị xóa.\nHành động này KHÔNG THỂ hoàn tác.`)) return;
    try {
      await adminDeleteSet(set.id);
      if (detailSet?.id === set.id) setDetailSet(null);
      fetchSets();
    } catch (err: any) {
      alert(err?.message || 'Không thể xóa bộ thẻ.');
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });

  return (
    <div className="admin-sets">
      <div className="admin-sets-header">
        <div>
          <h1 className="admin-sets-title">Quản lý nội dung</h1>
          <p className="admin-sets-subtitle">Tổng cộng {totalElements} bộ thẻ trong hệ thống</p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="admin-sets-toolbar">
        <div className="admin-search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề bộ thẻ..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <div className="admin-sets-filter">
          {VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`admin-filter-btn ${visibility === opt.value ? 'active' : ''}`}
              onClick={() => { setVisibility(opt.value); setPage(0); }}
            >
              {opt.value === 'public' && <Globe size={14} />}
              {opt.value === 'private' && <Lock size={14} />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-sets-content">
        {/* Table */}
        <div className={`admin-sets-table-wrapper ${detailSet ? 'with-detail' : ''}`}>
          <table className="admin-sets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Chủ sở hữu</th>
                <th>Trạng thái</th>
                <th>Thẻ</th>
                <th>Yêu thích</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="admin-table-empty">Đang tải...</td></tr>
              ) : sets.length === 0 ? (
                <tr><td colSpan={8} className="admin-table-empty">Không tìm thấy bộ thẻ nào.</td></tr>
              ) : (
                sets.map((set) => (
                  <tr key={set.id} className={detailSet?.id === set.id ? 'row-selected' : ''}>
                    <td>{set.id}</td>
                    <td>
                      <button className="admin-set-title-btn" onClick={() => setDetailSet(set)}>
                        {set.title}
                      </button>
                    </td>
                    <td className="admin-owner-cell">{set.ownerUsername}</td>
                    <td>
                      <span className={`admin-visibility-badge ${set.visibility === 'public' ? 'vis-public' : 'vis-private'}`}>
                        {set.visibility === 'public'
                          ? <><Globe size={11} /> Công khai</>
                          : <><Lock size={11} /> Riêng tư</>}
                      </span>
                    </td>
                    <td className="admin-count-cell">{set.cardCount}</td>
                    <td className="admin-count-cell">{set.favoriteCount}</td>
                    <td className="admin-date-cell">{formatDate(set.createdAt)}</td>
                    <td>
                      <button
                        className="admin-action-btn delete-btn"
                        onClick={() => handleDelete(set)}
                        title="Xóa bộ thẻ"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {detailSet && (
          <div className="admin-set-detail">
            <div className="detail-header">
              <h3>Chi tiết bộ thẻ</h3>
              <button className="detail-close" onClick={() => setDetailSet(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="set-detail-icon">
              <BookOpen size={28} />
            </div>

            <h4 className="set-detail-title">{detailSet.title}</h4>

            {detailSet.description && (
              <p className="set-detail-desc">{detailSet.description}</p>
            )}

            <span className={`admin-visibility-badge ${detailSet.visibility === 'public' ? 'vis-public' : 'vis-private'}`}>
              {detailSet.visibility === 'public'
                ? <><Globe size={11} /> Công khai</>
                : <><Lock size={11} /> Riêng tư</>}
            </span>

            <div className="detail-stats">
              <div className="detail-stat-item">
                <Layers size={16} />
                <span>{detailSet.cardCount} flashcard</span>
              </div>
              <div className="detail-stat-item">
                <Heart size={16} />
                <span>{detailSet.favoriteCount} yêu thích</span>
              </div>
            </div>

            <div className="detail-info">
              <div className="detail-info-row">
                <span className="detail-label">Chủ sở hữu</span>
                <span className="detail-value">{detailSet.ownerUsername}</span>
              </div>
              <div className="detail-info-row">
                <span className="detail-label">Ngày tạo</span>
                <span className="detail-value">{formatDate(detailSet.createdAt)}</span>
              </div>
              <div className="detail-info-row">
                <span className="detail-label">Set ID</span>
                <span className="detail-value">#{detailSet.id}</span>
              </div>
            </div>

            <div className="detail-actions">
              <button className="detail-action-btn danger" onClick={() => handleDelete(detailSet)}>
                <Trash2 size={16} /> Xóa bộ thẻ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-page-btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="admin-page-info">Trang {page + 1} / {totalPages}</span>
          <button
            className="admin-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
