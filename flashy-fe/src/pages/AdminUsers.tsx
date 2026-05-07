import { useEffect, useState, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Trash2, Shield, ShieldOff,
  Edit3, Lock, Unlock, X, Eye, EyeOff, KeyRound, BookOpen, FolderOpen, Brain, Layers
} from 'lucide-react';
import {
  getAllUsers, updateUser, deleteUser,
  type AdminUser, type AdminUpdateUserRequest
} from '../services/adminService';
import './AdminUsers.css';

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editLocked, setEditLocked] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Detail panel
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsers(search, page, 10);
      setUsers(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  // Open edit modal
  const openEditModal = (user: AdminUser) => {
    setEditUser(user);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditLocked(user.locked);
    setEditPassword('');
    setShowPassword(false);
    setEditError('');
  };

  const closeEditModal = () => {
    setEditUser(null);
    setEditError('');
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    setSaving(true);
    setEditError('');
    try {
      const data: AdminUpdateUserRequest = {};
      if (editEmail !== editUser.email) data.email = editEmail;
      if (editRole !== editUser.role) data.role = editRole;
      if (editLocked !== editUser.locked) data.locked = editLocked;
      if (editPassword.trim()) data.newPassword = editPassword.trim();

      await updateUser(editUser.id, data);
      closeEditModal();
      fetchUsers();
    } catch (err: any) {
      setEditError(err?.message || 'Không thể cập nhật người dùng.');
    } finally {
      setSaving(false);
    }
  };

  // Quick actions
  const handleToggleLock = async (user: AdminUser) => {
    const action = user.locked ? 'mở khóa' : 'khóa';
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản "${user.username}"?`)) return;
    try {
      await updateUser(user.id, { locked: !user.locked });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(`Không thể ${action} tài khoản.`);
    }
  };

  const handleToggleRole = async (user: AdminUser) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Bạn có chắc muốn đổi role của "${user.username}" thành ${newRole}?`)) return;
    try {
      await updateUser(user.id, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Không thể cập nhật role.');
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${user.username}"?\nToàn bộ dữ liệu (bộ thẻ, thư mục, quiz) của người dùng sẽ bị xóa.\nHành động này KHÔNG THỂ hoàn tác.`)) return;
    try {
      await deleteUser(user.id);
      if (detailUser?.id === user.id) setDetailUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err?.message || 'Không thể xóa người dùng.');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-users">
      <div className="admin-users-header">
        <div>
          <h1 className="admin-users-title">Quản lý người dùng</h1>
          <p className="admin-users-subtitle">Tổng cộng {totalElements} người dùng trong hệ thống</p>
        </div>
      </div>

      <form className="admin-users-search" onSubmit={handleSearch}>
        <div className="admin-search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
      </form>

      <div className="admin-users-content">
        {/* Table */}
        <div className={`admin-users-table-wrapper ${detailUser ? 'with-detail' : ''}`}>
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="admin-table-empty">Đang tải...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-table-empty">Không tìm thấy người dùng nào.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={detailUser?.id === user.id ? 'row-selected' : ''}>
                    <td>{user.id}</td>
                    <td>
                      <button className="admin-user-name-btn" onClick={() => setDetailUser(user)}>
                        {user.username}
                      </button>
                    </td>
                    <td className="admin-email-cell">{user.email}</td>
                    <td>
                      <span className={`admin-role-badge ${user.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${user.locked ? 'status-locked' : 'status-active'}`}>
                        {user.locked ? 'Đã khóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td className="admin-date-cell">{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-action-btn edit-btn"
                          onClick={() => openEditModal(user)}
                          title="Chỉnh sửa"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="admin-action-btn toggle-role"
                          onClick={() => handleToggleRole(user)}
                          title={user.role === 'ADMIN' ? 'Hạ xuống USER' : 'Nâng lên ADMIN'}
                        >
                          {user.role === 'ADMIN' ? <ShieldOff size={15} /> : <Shield size={15} />}
                        </button>
                        <button
                          className="admin-action-btn lock-btn"
                          onClick={() => handleToggleLock(user)}
                          title={user.locked ? 'Mở khóa' : 'Khóa tài khoản'}
                        >
                          {user.locked ? <Unlock size={15} /> : <Lock size={15} />}
                        </button>
                        <button
                          className="admin-action-btn delete-btn"
                          onClick={() => handleDelete(user)}
                          title="Xóa người dùng"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {detailUser && (
          <div className="admin-user-detail">
            <div className="detail-header">
              <h3>Chi tiết người dùng</h3>
              <button className="detail-close" onClick={() => setDetailUser(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="detail-avatar">
              {detailUser.username.charAt(0).toUpperCase()}
            </div>
            <h4 className="detail-username">{detailUser.username}</h4>
            <p className="detail-email">{detailUser.email}</p>
            <div className="detail-badges">
              <span className={`admin-role-badge ${detailUser.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                {detailUser.role}
              </span>
              <span className={`admin-status-badge ${detailUser.locked ? 'status-locked' : 'status-active'}`}>
                {detailUser.locked ? 'Đã khóa' : 'Hoạt động'}
              </span>
            </div>
            <div className="detail-stats">
              <div className="detail-stat-item">
                <BookOpen size={16} />
                <span>{detailUser.totalSets} bộ thẻ</span>
              </div>
              <div className="detail-stat-item">
                <Layers size={16} />
                <span>{detailUser.totalCards} flashcard</span>
              </div>
              <div className="detail-stat-item">
                <FolderOpen size={16} />
                <span>{detailUser.totalFolders} thư mục</span>
              </div>
              <div className="detail-stat-item">
                <Brain size={16} />
                <span>{detailUser.totalQuizzes} bài quiz</span>
              </div>
            </div>
            <div className="detail-info">
              <div className="detail-info-row">
                <span className="detail-label">Ngày tạo</span>
                <span className="detail-value">{formatDate(detailUser.createdAt)}</span>
              </div>
              <div className="detail-info-row">
                <span className="detail-label">User ID</span>
                <span className="detail-value">#{detailUser.id}</span>
              </div>
            </div>
            <div className="detail-actions">
              <button className="detail-action-btn primary" onClick={() => openEditModal(detailUser)}>
                <Edit3 size={16} /> Chỉnh sửa
              </button>
              <button
                className={`detail-action-btn ${detailUser.locked ? 'success' : 'warning'}`}
                onClick={() => handleToggleLock(detailUser)}
              >
                {detailUser.locked ? <><Unlock size={16} /> Mở khóa</> : <><Lock size={16} /> Khóa</>}
              </button>
              <button className="detail-action-btn danger" onClick={() => handleDelete(detailUser)}>
                <Trash2 size={16} /> Xóa
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
          <span className="admin-page-info">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            className="admin-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="admin-modal-overlay" onClick={closeEditModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Chỉnh sửa người dùng: {editUser.username}</h3>
              <button className="admin-modal-close" onClick={closeEditModal}>
                <X size={20} />
              </button>
            </div>

            {editError && <div className="admin-modal-error">{editError}</div>}

            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>

              <div className="admin-form-group">
                <label>Role</label>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Trạng thái tài khoản</label>
                <div className="admin-toggle-group">
                  <button
                    className={`admin-toggle-btn ${!editLocked ? 'active' : ''}`}
                    onClick={() => setEditLocked(false)}
                    type="button"
                  >
                    <Unlock size={16} /> Hoạt động
                  </button>
                  <button
                    className={`admin-toggle-btn locked ${editLocked ? 'active' : ''}`}
                    onClick={() => setEditLocked(true)}
                    type="button"
                  >
                    <Lock size={16} /> Khóa
                  </button>
                </div>
              </div>

              <div className="admin-form-group">
                <label><KeyRound size={16} /> Đặt lại mật khẩu (để trống nếu không đổi)</label>
                <div className="admin-password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn-cancel" onClick={closeEditModal}>Hủy</button>
              <button className="admin-btn-save" onClick={handleSaveUser} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
