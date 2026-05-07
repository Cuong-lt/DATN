import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  ChevronLeft,
  ArrowRight,
  Search,
  ChevronRight,
  BookOpen,
  Github,
  Twitter,
  Instagram,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import {
  fetchPublicSets,
  type FlashcardSetResponse,
} from "../services/setService";
import "./LandingPage.css";

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #1a3a4a 0%, #2d6a4f 100%)",
  "linear-gradient(135deg, #4a1a2e 0%, #6b2fa0 100%)",
  "linear-gradient(135deg, #3a2a1a 0%, #8b6914 100%)",
  "linear-gradient(135deg, #1a2a4a 0%, #c0392b 100%)",
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredSets, setFeaturedSets] = useState<FlashcardSetResponse[]>([]);
  const [featuredPage, setFeaturedPage] = useState(0);
  const [featuredTotal, setFeaturedTotal] = useState(0);

  useEffect(() => {
    fetchPublicSets("", featuredPage, 4)
      .then((res) => {
        setFeaturedSets(res.data.content);
        setFeaturedTotal(res.data.totalPages);
      })
      .catch(() => {});
  }, [featuredPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="landing">
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          <Layers size={24} /> Flashy
        </Link>
        <form className="header-search-box" onSubmit={handleSearch}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <div className="landing-header-actions">
          <ThemeToggle />
          <Link to="/login" className="header-login">
            Đăng Nhập
          </Link>
          <Link to="/register" className="header-signup">
            Đăng Ký
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-badge">
          <ChevronLeft size={14} /> HỌC TẬP TRỢ LỰC AI
        </div>
        <h1 className="hero-title">
          Thành thạo bất kỳ chủ đề nào với{" "}
          <span className="highlight">flashcard thông minh</span>
        </h1>
        <p className="hero-subtitle">
          Tham gia hơn 50 triệu sinh viên sử dụng các công cụ hỗ trợ khoa học
          của FlashLearn để cải thiện điểm số và đạt được mục tiêu của họ.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn-primary">
            Bắt Đầu Học Tập Ngay <ArrowRight size={18} />
          </Link>
          <button className="btn-secondary">Xem Demo</button>
        </div>
        <div className="hero-rating">
          <div className="hero-avatars">
            <div
              className="hero-avatar"
              style={{
                background: "linear-gradient(135deg, #f97316, #ef4444)",
              }}
            />
            <div
              className="hero-avatar"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              }}
            />
            <div
              className="hero-avatar"
              style={{
                background: "linear-gradient(135deg, #10b981, #06b6d4)",
              }}
            />
          </div>
          <span className="hero-rating-text">
            <strong>4.9/5</strong> từ 10k+ sinh viên hoạt động
          </span>
        </div>
      </section>

      <section className="landing-featured">
        <div className="featured-header">
          <div>
            <h2>Bộ Học Tập Nổi Bật</h2>
            <p>
              Các bộ sưu tập được chọn lọc kỹ lưỡng để giúp bạn bắt đầu hành
              trình của mình.
            </p>
          </div>
          <div className="featured-nav">
            <button
              onClick={() => setFeaturedPage((p) => Math.max(0, p - 1))}
              disabled={featuredPage === 0}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setFeaturedPage((p) => p + 1)}
              disabled={featuredPage >= featuredTotal - 1}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="featured-grid">
          {featuredSets.map((set, i) => (
            <Link to="/login" key={set.id} className="study-card">
              <div
                className="card-image"
                style={{
                  background: CARD_GRADIENTS[i % CARD_GRADIENTS.length],
                }}
              >
                <span className="card-tag">{set.username}</span>
              </div>
              <div className="card-body">
                <h3>{set.title}</h3>
                <div className="card-meta">
                  <BookOpen size={14} /> {set.flashcardCount} thẻ &middot;{" "}
                  {set.description || set.username}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <h2>Sẵn sàng vượt qua bài kiểm tra tiếp theo?</h2>
        <p>
          Tạo bộ học tập đầu tiên của bạn trong vài phút hoặc chọn từ hàng triệu
          flashcard được chuẩn bị sẵn bởi các chuyên gia.
        </p>
        <Link to="/register" className="btn-outline">
          Bắt Đầu Miễn Phí
        </Link>
      </section>

      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="landing-logo">
              <Layers size={20} /> FlashLearn
            </div>
            <p>
              Nền tảng flashcard nâng cao nhất thế giới, được hỗ trợ bởi công
              nghệ lặp lại có khoảng cách và AI.
            </p>
          </div>
          <div className="footer-col">
            <h4>Sản Phẩm</h4>
            <a href="#">Tính Năng</a>
            <a href="#">Công Cụ Học Tập</a>
            <a href="#">AI Writer</a>
            <a href="#">Giá Cả</a>
          </div>
          <div className="footer-col">
            <h4>Cộng Đồng</h4>
            <a href="#">Giáo Viên</a>
            <a href="#">Chuẩn Bị Bài Kiểm Tra</a>
            <a href="#">Giải Pháp</a>
            <a href="#">Flashcard</a>
          </div>
          <div className="footer-col">
            <h4>Pháp Lý</h4>
            <a href="#">Quyền Riêng Tư</a>
            <a href="#">Điều Khoản</a>
            <a href="#">Chính Sách Cookie</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2024 FlashLearn Inc. Bảo lưu mọi quyền.</span>
          <div className="footer-social">
            <a href="#">
              <Github size={18} />
            </a>
            <a href="#">
              <Twitter size={18} />
            </a>
            <a href="#">
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
