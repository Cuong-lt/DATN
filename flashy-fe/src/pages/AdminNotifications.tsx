import { useState } from 'react';
import { Send, Users, Shield, UsersRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { sendBroadcast, type BroadcastRequest, type BroadcastResult } from '../services/adminService';
import './AdminNotifications.css';

const TARGET_OPTIONS = [
  { value: 'ALL', label: 'Tất cả người dùng', icon: UsersRound, description: 'Gửi đến mọi tài khoản trong hệ thống' },
  { value: 'USER', label: 'Chỉ người dùng thường', icon: Users, description: 'Gửi đến các tài khoản có role USER' },
  { value: 'ADMIN', label: 'Chỉ Admin', icon: Shield, description: 'Gửi đến các tài khoản có role ADMIN' },
];

export default function AdminNotifications() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSending(true);
    setResult(null);
    setError('');

    try {
      const req: BroadcastRequest = { subject: subject.trim(), message: message.trim(), targetRole };
      const res = await sendBroadcast(req);
      setResult(res.data);
    } catch (err: any) {
      setError(err?.message || 'Gửi thông báo thất bại. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setSubject('');
    setMessage('');
    setTargetRole('ALL');
    setResult(null);
    setError('');
  };

  return (
    <div className="admin-notif">
      <div className="admin-notif-header">
        <div>
          <h1 className="admin-notif-title">Gửi thông báo</h1>
          <p className="admin-notif-subtitle">Gửi email thông báo hàng loạt đến người dùng trong hệ thống</p>
        </div>
      </div>

      <div className="admin-notif-layout">
        <form className="admin-notif-form" onSubmit={handleSend}>

          {/* Target selection */}
          <div className="admin-notif-section">
            <label className="admin-notif-label">Đối tượng nhận</label>
            <div className="admin-notif-targets">
              {TARGET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`admin-notif-target-card ${targetRole === opt.value ? 'active' : ''}`}
                  onClick={() => setTargetRole(opt.value)}
                >
                  <div className="target-card-icon">
                    <opt.icon size={20} />
                  </div>
                  <div className="target-card-text">
                    <span className="target-card-label">{opt.label}</span>
                    <span className="target-card-desc">{opt.description}</span>
                  </div>
                  {targetRole === opt.value && (
                    <div className="target-card-check">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="admin-notif-section">
            <label className="admin-notif-label" htmlFor="subject">Tiêu đề email</label>
            <input
              id="subject"
              type="text"
              className="admin-notif-input"
              placeholder="Ví dụ: Thông báo bảo trì hệ thống"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              required
            />
            <span className="admin-notif-char-count">{subject.length}/200</span>
          </div>

          {/* Message */}
          <div className="admin-notif-section">
            <label className="admin-notif-label" htmlFor="message">Nội dung thông báo</label>
            <textarea
              id="message"
              className="admin-notif-textarea"
              placeholder="Nhập nội dung thông báo bạn muốn gửi đến người dùng..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              maxLength={2000}
              required
            />
            <span className="admin-notif-char-count">{message.length}/2000</span>
          </div>

          {/* Error */}
          {error && (
            <div className="admin-notif-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="admin-notif-actions">
            <button type="button" className="admin-notif-btn-reset" onClick={handleReset} disabled={sending}>
              Xóa form
            </button>
            <button
              type="submit"
              className="admin-notif-btn-send"
              disabled={sending || !subject.trim() || !message.trim()}
            >
              <Send size={16} />
              {sending ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
          </div>
        </form>

        {/* Result panel */}
        {result && (
          <div className="admin-notif-result">
            <div className="result-icon-wrap">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="result-title">Gửi hoàn tất!</h3>
            <div className="result-stats">
              <div className="result-stat">
                <span className="result-stat-value">{result.totalTargeted}</span>
                <span className="result-stat-label">Tổng đối tượng</span>
              </div>
              <div className="result-stat success">
                <span className="result-stat-value">{result.sentCount}</span>
                <span className="result-stat-label">Gửi thành công</span>
              </div>
              {result.failedCount > 0 && (
                <div className="result-stat failed">
                  <span className="result-stat-value">{result.failedCount}</span>
                  <span className="result-stat-label">Gửi thất bại</span>
                </div>
              )}
            </div>
            <button className="admin-notif-btn-new" onClick={handleReset}>
              Gửi thông báo khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
