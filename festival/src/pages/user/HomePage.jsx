import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = ({ articles }) => {
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('date');

    const categories = [...new Set(articles.map(article => article.category))];

    const filteredAndSortedArticles = articles
        .filter(article => categoryFilter === '' || article.category === categoryFilter)
        .sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.date) - new Date(a.date);
                case 'views':
                    return b.views - a.views;
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

    const featuredArticles = articles.filter(article => article.featured);

    return (
        <div className="homepage">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            Khám phá văn hóa<br />
                            <span className="hero-highlight">dân tộc Khmer</span>
                        </h1>
                        <p className="hero-description">
                            Tìm hiểu về những lễ hội truyền thống đặc sắc và ý nghĩa sâu sắc
                            của cộng đồng người Khmer Nam Bộ
                        </p>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <span className="stat-number">{articles.length}</span>
                                <span className="stat-label">Lễ hội</span>
                            </div>
                            <div className="hero-stat">
                                <span className="stat-number">{categories.length}</span>
                                <span className="stat-label">Danh mục</span>
                            </div>
                            <div className="hero-stat">
                                <span className="stat-number">{featuredArticles.length}</span>
                                <span className="stat-label">Nổi bật</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-card">
                            <img
                                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
                                alt="Lễ hội Khmer"
                                className="hero-image"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
                <section className="featured-section">
                    <div className="section-header">
                        <h2 className="section-title">✨ Lễ hội nổi bật</h2>
                        <p className="section-subtitle">Những lễ hội truyền thống đặc biệt quan trọng</p>
                    </div>

                    <div className="featured-grid">
                        {featuredArticles.map(article => (
                            <Link to={`/article/${article.id}`} key={article.id} className="featured-card">
                                <div className="featured-image">
                                    <img src={article.image} alt={article.title} />
                                    <div className="featured-badge">Nổi bật</div>
                                </div>
                                <div className="featured-content">
                                    <h3 className="featured-title">{article.title}</h3>
                                    <p className="featured-location">📍 {article.location}</p>
                                    <p className="featured-excerpt">{article.excerpt}</p>
                                    <div className="featured-meta">
                                        <span className="featured-views">👁️ {article.views.toLocaleString('vi-VN')}</span>
                                        <span className="featured-date">{new Date(article.date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Filters */}
            <section className="filters-section">
                <div className="filters-container">
                    <div className="filter-group">
                        <label>Danh mục</label>
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            <option value="">Tất cả</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Sắp xếp</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="date">Mới nhất</option>
                            <option value="views">Phổ biến nhất</option>
                            <option value="title">Tên A-Z</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* All Articles */}
            <section className="articles-section">
                <div className="section-header">
                    <h2 className="section-title">🏮 Tất cả lễ hội</h2>
                    <p className="section-subtitle">
                        Hiển thị {filteredAndSortedArticles.length} lễ hội
                    </p>
                </div>

                {filteredAndSortedArticles.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>Không tìm thấy lễ hội nào</h3>
                        <p>Thử thay đổi bộ lọc để xem kết quả khác</p>
                    </div>
                ) : (
                    <div className="articles-grid">
                        {filteredAndSortedArticles.map(article => (
                            <Link to={`/article/${article.id}`} key={article.id} className="article-card">
                                <div className="article-image">
                                    <img src={article.image} alt={article.title} />
                                    <div className="article-category">{article.category}</div>
                                </div>
                                <div className="article-content">
                                    <h3 className="article-title">{article.title}</h3>
                                    <p className="article-location">📍 {article.location}</p>
                                    <div className="article-tags">
                                        {article.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="article-tag">#{tag}</span>
                                        ))}
                                    </div>
                                    <div className="article-meta">
                                        <span>👁️ {article.views.toLocaleString('vi-VN')}</span>
                                        <span>{new Date(article.date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage; 