import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Layers, X, ChevronLeft, ChevronRight,
  BookOpen, Globe, TrendingUp,
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { fetchPublicSets, type FlashcardSetResponse, type PageResponse } from '../services/setService';
import './PublicSearch.css';

const PAGE_SIZE = 10;

const POPULAR_TOPICS = [
  { label: 'English', icon: '🇬🇧' },
  { label: 'Japanese', icon: '🇯🇵' },
  { label: 'Korean', icon: '🇰🇷' },
  { label: 'Math', icon: '📐' },
  { label: 'Physics', icon: '⚛️' },
  { label: 'Chemistry', icon: '🧪' },
  { label: 'Biology', icon: '🧬' },
  { label: 'History', icon: '📜' },
  { label: 'Geography', icon: '🌍' },
  { label: 'Programming', icon: '💻' },
  { label: 'Literature', icon: '📚' },
  { label: 'Economics', icon: '📊' },
];

export default function PublicSearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [sets, setSets] = useState<FlashcardSetResponse[]>([]);
  const [pageInfo, setPageInfo] = useState<Omit<PageResponse<FlashcardSetResponse>, 'content'> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [apiError, setApiError] = useState(false);

  const fetchResults = useCallback(async (kw: string, page: number) => {
    setLoading(true);
    setApiError(false);
    try {
      const res = await fetchPublicSets(kw, page, PAGE_SIZE);
      setSets(res.data.content);
      setPageInfo({
        page: res.data.page,
        size: res.data.size,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
        last: res.data.last,
      });
    } catch (err) {
      console.error('Search error:', err);
      setSets([]);
      setPageInfo(null);
      setApiError(true);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  // Sync input + results whenever URL param changes (mount, F5, browser back/forward)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setInputValue(q);
    setCurrentPage(0);
    if (q) {
      fetchResults(q, 0);
    } else {
      setSets([]);
      setPageInfo(null);
      setSearched(false);
    }
  }, [searchParams.get('q')]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setCurrentPage(0);
    // Update URL → triggers the useEffect above to fetch
    setSearchParams(trimmed ? { q: trimmed } : {});
  };

  const clearSearch = () => {
    setSearchParams({});
  };

  const handleTopicClick = (topic: string) => {
    setSearchParams({ q: topic });
  };

  const handlePageChange = (page: number) => {
    const q = searchParams.get('q') || '';
    setCurrentPage(page);
    fetchResults(q, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="ps-page">
      {/* Header */}
      <header className="ps-header">
        <Link to="/" className="ps-logo">
          <Layers size={22} /> FlashLearn
        </Link>

        <form className="ps-header-search" onSubmit={handleSearch}>
          <Search size={16} className="ps-header-search-icon" />
          <input
            type="text"
            placeholder="Search public sets..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
          {inputValue && (
            <button type="button" className="ps-clear-btn" onClick={clearSearch}>
              <X size={14} />
            </button>
          )}
        </form>

        <div className="ps-header-actions">
          <ThemeToggle />
          <Link to="/login" className="ps-btn-login">Log In</Link>
          <Link to="/register" className="ps-btn-signup">Sign Up</Link>
        </div>
      </header>

      {/* Body */}
      <main className="ps-main">
        {/* Loading */}
        {loading && <div className="ps-loading">Searching...</div>}

        {/* Results */}
        {!loading && searched && (
          <>
            {pageInfo && (
              <div className="ps-results-info">
                {(() => {
                  const q = searchParams.get('q') || '';
                  return pageInfo.totalElements > 0
                    ? `Found ${pageInfo.totalElements} result${pageInfo.totalElements !== 1 ? 's' : ''}${q ? ` for "${q}"` : ''}`
                    : `No results found${q ? ` for "${q}"` : ''}`;
                })()}
              </div>
            )}

            {sets.length > 0 && (
              <>
                <div className="ps-set-list">
                  {sets.map((set) => (
                    <div
                      key={set.id}
                      className="ps-set-card"
                      onClick={() => navigate('/login')}
                      title="Log in to view this set"
                    >
                      <div className="ps-set-card-header">
                        <Layers size={16} />
                        <span className="ps-set-badge">Public</span>
                      </div>
                      <h3>{set.title}</h3>
                      {set.description && <p className="ps-set-desc">{set.description}</p>}
                      <div className="ps-set-footer">
                        <BookOpen size={13} />
                        <span>{set.flashcardCount} cards</span>
                        {set.username && (
                          <span className="ps-set-author">by {set.username}</span>
                        )}
                        <span className="ps-set-date">
                          {new Date(set.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {pageInfo && pageInfo.totalPages > 1 && (
                  <div className="ps-pagination">
                    <button
                      className="ps-page-btn"
                      disabled={currentPage === 0}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <div className="ps-page-numbers">
                      {Array.from({ length: pageInfo.totalPages }, (_, i) => (
                        <button
                          key={i}
                          className={`ps-page-num ${i === currentPage ? 'active' : ''}`}
                          onClick={() => handlePageChange(i)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      className="ps-page-btn"
                      disabled={pageInfo.last}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}

            {sets.length === 0 && (
              <div className="ps-empty">
                <Search size={44} />
                {apiError ? (
                  <>
                    <h3>Could not load results</h3>
                    <p>The search service is unavailable. Please <a href="/login">log in</a> to search.</p>
                  </>
                ) : (
                  <>
                    <h3>No results found</h3>
                    <p>Try a different keyword or browse popular topics below</p>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {!searched && !loading && (
          <div className="ps-empty">
            <Globe size={44} />
            <h3>Find public study sets</h3>
            <p>Search by title or pick a topic below</p>
          </div>
        )}

        {/* Popular Topics */}
        <section className="ps-section">
          <div className="ps-section-title">
            <TrendingUp size={18} />
            <h3>Popular Topics</h3>
          </div>
          <div className="ps-topics">
            {POPULAR_TOPICS.map((t) => (
              <button
                key={t.label}
                className="ps-topic-chip"
                onClick={() => handleTopicClick(t.label)}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="ps-cta">
          <h3>Want to save sets and track your progress?</h3>
          <p>Create a free account to study, quiz yourself, and build your library.</p>
          <Link to="/register" className="ps-cta-btn">Get Started Free</Link>
        </section>
      </main>
    </div>
  );
}
