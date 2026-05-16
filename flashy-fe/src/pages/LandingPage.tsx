import { Link } from "react-router-dom";
import {
  Layers,
  Search,
  Brain,
  ClipboardCheck,
  BarChart3,
  PenLine,
  Check,
  Star,
  Share2,
  X,
  Instagram,
  BookOpen,
} from "lucide-react";
import "./LandingPage.css";

const TESTIMONIALS = [
  {
    text: "Tôi từ C- lên A trong Sinh học bằng cách sử dụng các bộ lặp lại có khoảng cách. Cảm giác như tôi đang hack bộ não của mình!",
    name: "Sarah J.",
    role: "Sinh viên Y khoa",
    stars: 5,
    initials: "SJ",
    color: "#f59e0b",
  },
  {
    text: "Giao diện rất sạch sẽ. Tôi đã thử các ứng dụng khác nhưng Flashy là ứng dụng duy nhất mà tôi thực sự sử dụng hơn một tuần.",
    name: "Leo K.",
    role: "Người học ngôn ngữ",
    stars: 5,
    initials: "LK",
    color: "#10b981",
  },
  {
    text: "Tính năng bài kiểm tra là một cứu cánh. Tôi sử dụng nó để tự kiểm tra trước kỳ thi luật cuối cùng của tôi. Rất khuyến nghị!!",
    name: "David M.",
    role: "Sinh viên Luật",
    stars: 5,
    initials: "DM",
    color: "#3b82f6",
  },
];

function HeroIllustration() {
  return (
    <div className="hero-illustration">
      <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="480" height="360" rx="20" fill="url(#heroGrad)" />
        <circle cx="390" cy="55" r="45" fill="rgba(255,255,255,0.07)" />
        <circle cx="55" cy="290" r="60" fill="rgba(255,255,255,0.05)" />

        <ellipse cx="240" cy="295" rx="195" ry="28" fill="rgba(0,0,0,0.13)" />

        <rect
          x="115"
          y="168"
          width="250"
          height="148"
          rx="12"
          fill="rgba(255,255,255,0.93)"
        />
        <rect
          x="105"
          y="314"
          width="270"
          height="11"
          rx="5.5"
          fill="rgba(255,255,255,0.72)"
        />
        <rect x="131" y="184" width="218" height="116" rx="6" fill="#e8edff" />
        <rect
          x="143"
          y="198"
          width="135"
          height="10"
          rx="5"
          fill="#4361EE"
          opacity="0.7"
        />
        <rect
          x="143"
          y="216"
          width="95"
          height="8"
          rx="4"
          fill="#6366f1"
          opacity="0.5"
        />
        <rect
          x="143"
          y="230"
          width="115"
          height="8"
          rx="4"
          fill="#6366f1"
          opacity="0.4"
        />
        <rect
          x="143"
          y="255"
          width="72"
          height="26"
          rx="7"
          fill="#4361EE"
          opacity="0.85"
        />
        <rect x="225" y="255" width="72" height="26" rx="7" fill="#e2e8f0" />

        <circle cx="98" cy="152" r="27" fill="#fbbf24" />
        <path
          d="M98 179 C85 210 62 248 55 275"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="30"
          fill="none"
          strokeLinecap="round"
        />

        <rect
          x="16"
          y="92"
          width="90"
          height="54"
          rx="11"
          fill="rgba(255,255,255,0.93)"
        />
        <rect
          x="27"
          y="106"
          width="52"
          height="9"
          rx="4.5"
          fill="#4361EE"
          opacity="0.7"
        />
        <rect
          x="27"
          y="121"
          width="36"
          height="7"
          rx="3.5"
          fill="#a5b4fc"
          opacity="0.65"
        />

        <circle cx="376" cy="142" r="27" fill="#f87171" />
        <path
          d="M376 169 C390 200 410 240 418 268"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="30"
          fill="none"
          strokeLinecap="round"
        />

        <rect
          x="396"
          y="210"
          width="50"
          height="80"
          rx="9"
          fill="rgba(255,255,255,0.93)"
        />
        <rect x="402" y="220" width="38" height="54" rx="5" fill="#c7d2fe" />
        <rect
          x="407"
          y="228"
          width="28"
          height="7"
          rx="3.5"
          fill="#4361EE"
          opacity="0.7"
        />
        <rect
          x="407"
          y="241"
          width="20"
          height="6"
          rx="3"
          fill="#a5b4fc"
          opacity="0.6"
        />

        <rect
          x="370"
          y="52"
          width="90"
          height="54"
          rx="11"
          fill="rgba(255,255,255,0.93)"
        />
        <rect
          x="381"
          y="66"
          width="52"
          height="9"
          rx="4.5"
          fill="#4361EE"
          opacity="0.7"
        />
        <rect
          x="381"
          y="81"
          width="36"
          height="7"
          rx="3.5"
          fill="#a5b4fc"
          opacity="0.65"
        />

        <rect
          x="152"
          y="82"
          width="176"
          height="62"
          rx="12"
          fill="rgba(255,255,255,0.93)"
        />
        <rect
          x="166"
          y="96"
          width="85"
          height="9"
          rx="4.5"
          fill="#111827"
          opacity="0.55"
        />
        <rect x="166" y="113" width="134" height="7" rx="3.5" fill="#e2e8f0" />
        <rect
          x="166"
          y="113"
          width="106"
          height="7"
          rx="3.5"
          fill="#4361EE"
          opacity="0.8"
        />
        <circle cx="315" cy="110" r="11" fill="#10b981" opacity="0.9" />
        <path
          d="M310 110 l3 3.5 l7 -7"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <defs>
          <linearGradient
            id="heroGrad"
            x1="0"
            y1="0"
            x2="480"
            y2="360"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="phone-mockup">
      <div className="phone-screen-inner">
        <div className="phone-flashcard">
          <p className="phone-question">Thủ đô của Pháp là gì?</p>
          <div className="phone-options">
            <div className="phone-opt active">Paris</div>
            <div className="phone-opt">London</div>
            <div className="phone-opt">Berlin</div>
            <div className="phone-opt">Madrid</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          <Layers size={20} />
          Flashy
        </Link>
        <nav className="landing-nav">
          <a href="#features">Tính năng</a>
          <a href="#how-it-works">Hướng dẫn</a>
          <a href="#showcase">Giới thiệu</a>
          <a href="#testimonials">Nhận xét</a>
        </nav>
        <div className="landing-header-actions">
          <Link to="/login" className="header-login">
            Đăng nhập
          </Link>
          <Link to="/register" className="header-signup">
            Đăng ký
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Học thông minh hơn với
            <br />
            <span className="highlight">Thẻ ghi nhớ</span>
          </h1>
          <p className="hero-subtitle">
            Flashy kết hợp các thuật toán lặp lại có cơ sở khoa học với giao
            diện thú vị để giúp học sinh nắm vững bất kỳ môn học nào với nửa nỗ
            lực.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">
              Bắt đầu
            </Link>
            <Link to="/explore" className="btn-secondary">
              Khám phá các bộ
            </Link>
          </div>
          <div className="hero-social-proof">
            <div className="hero-avatars">
              <div
                className="hero-avatar"
                style={{
                  background: "linear-gradient(135deg,#f97316,#ef4444)",
                }}
              />
              <div
                className="hero-avatar"
                style={{
                  background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                }}
              />
              <div
                className="hero-avatar"
                style={{
                  background: "linear-gradient(135deg,#10b981,#06b6d4)",
                }}
              />
            </div>
            <span className="hero-social-text">
              Được tham gia bởi 50k+ học sinh hoạt động
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <HeroIllustration />
        </div>
      </section>

      <section className="landing-features" id="features">
        <h2 className="section-title">Công cụ cho sự xuất sắc học tập</h2>
        <p className="section-subtitle">
          Mọi thứ bạn cần để ghi nhớ các khái niệm phức tạp và vượt qua các kỳ
          thi của mình.
        </p>
        <div className="features-bento">
          <div className="feature-card feature-create">
            <div className="feature-icon">
              <PenLine size={20} />
            </div>
            <h3>Tạo dễ dàng</h3>
            <p>
              Nhập từ Quizlet, CSV hoặc chỉ cần gõ. Trình chỉnh sửa thông minh
              của chúng tôi định dạng thẻ của bạn ngay lập tức với hỗ trợ LaTeX
              cho toán học và khoa học.
            </p>
            <div className="feature-card-preview">
              <div className="fp-line accent" />
              <div className="fp-line" />
              <div className="fp-line sm" />
              <div className="fp-input" />
            </div>
          </div>

          <div className="feature-card feature-tall">
            <div className="feature-icon-inv">
              <Brain size={22} />
            </div>
            <h3>Lặp lại thông minh</h3>
            <p>
              Các thuật toán lặp lại có khoảng cách phù hợp với sức mạnh bộ nhớ
              của bạn, hiển thị cho bạn những gì bạn cần, khi bạn cần nó.
            </p>
          </div>

          <div className="feature-card feature-quiz">
            <div className="feature-icon-inv">
              <ClipboardCheck size={20} />
            </div>
            <h3>Làm bài kiểm tra</h3>
            <p>
              Chuyển đổi các bộ của bạn thành các bài kiểm tra trắc nghiệm hoặc
              các thách thức đúng/sai chỉ bằng một cú nhấp chuột.
            </p>
          </div>

          <div className="feature-card feature-progress">
            <div className="feature-icon">
              <BarChart3 size={20} />
            </div>
            <h3>Theo dõi tiến độ</h3>
            <p>
              Phân tích chi tiết hiển thị các chuỗi học tập, mức độ thành thạo
              và lịch trình ôn tập sắp tới của bạn.
            </p>
            <div className="feature-progress-preview">
              <div className="fp-progress-row">
                <span>Thành thạo</span>
                <span>99%</span>
              </div>
              <div className="fp-progress-track">
                <div className="fp-progress-fill" style={{ width: "99%" }} />
              </div>
              <div className="fp-streak">Chuỗi 24 ngày 🔥</div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-steps" id="how-it-works">
        <h2 className="section-title">
          Con đường dẫn đến sự thành thạo của bạn
        </h2>
        <div className="steps-grid">
          <div className="step-item">
            <div className="step-icon">
              <Search size={24} />
            </div>
            <h3>1. Tìm</h3>
            <p>
              Duyệt qua hàng triệu bộ được tạo sẵn hoặc xây dựng bộ tùy chỉnh
              của riêng bạn.
            </p>
          </div>
          <div className="step-item">
            <div className="step-icon">
              <BookOpen size={24} />
            </div>
            <h3>2. Học</h3>
            <p>
              Sử dụng gọi lại tích cực và lặp lại có khoảng cách để ghi nhớ các
              thẻ.
            </p>
          </div>
          <div className="step-item">
            <div className="step-icon">
              <ClipboardCheck size={24} />
            </div>
            <h3>3. Kiểm tra</h3>
            <p>
              Xác thực kiến thức của bạn bằng các bài kiểm tra thích ứng và theo
              dõi tiến độ của bạn.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-showcase" id="showcase">
        <div className="showcase-phone-col">
          <PhoneMockup />
        </div>
        <div className="showcase-content">
          <h2>Người bạn học tập trực quan nhất</h2>
          <p>
            Chúng tôi đã suy tư về từng pixel để làm cho việc học trở nên giống
            như một trò chơi. Với các cử chỉ mượt mà, phản hồi xúc giác và bố
            cục không có phiền nhiễu, bạn thực sự sẽ mong chờ các phiên ôn tập
            của mình.
          </p>
          <div className="showcase-features">
            {[
              "Tối ưu hóa cho điện thoại di động và máy tính bảng",
              "Chế độ tối cho các phiên học tối",
              "Chế độ ngoại tuyến để học khi di chuyển",
            ].map((feat) => (
              <div className="showcase-feat-item" key={feat}>
                <div className="check-icon">
                  <Check size={11} />
                </div>
                {feat}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-testimonials" id="testimonials">
        <h2 className="section-title">
          Học sinh <span className="heart">♥</span> Flashy
        </h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <div className="testimonial-stars">
                {Array(t.stars)
                  .fill(0)
                  .map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" strokeWidth={0} />
                  ))}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div
                  className="testimonial-avatar"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="cta-wrapper">
        <section className="landing-cta">
          <h2>Bắt đầu học hôm nay</h2>
          <p>
            Tham gia với hàng ngàn học sinh đang sử dụng Flashy để phát huy toàn
            bộ tiềm năng học tập của họ.
          </p>
          <Link to="/register" className="btn-white">
            Đăng ký miễn phí
          </Link>
          <p className="cta-note">
            Không cần thẻ tín dụng. Miễn phí mãi mãi các tính năng cơ bản.
          </p>
        </section>
      </div>

      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="landing-logo footer-logo">
              <Layers size={18} />
              Flashy
            </div>
            <p>Trao quyền cho học sinh thông qua học tập có cơ sở khoa học.</p>
          </div>
          <div className="footer-links">
            <a href="#">Quyền riêng tư</a>
            <a href="#">Điều khoản</a>
            <a href="#">Hỗ trợ</a>
            <a href="#">Sự nghiệp</a>
          </div>
          <div className="footer-icons">
            <a href="#" aria-label="share">
              <Share2 size={16} />
            </a>
            <a href="#" aria-label="twitter">
              <X size={16} />
            </a>
            <a href="#" aria-label="instagram">
              <Instagram size={16} />
            </a>
          </div>
        </div>
        <p className="footer-copyright">
          © 2026 Flashy. Trao quyền cho học sinh thông qua học tập có cơ sở khoa
          học.
        </p>
      </footer>
    </div>
  );
}
