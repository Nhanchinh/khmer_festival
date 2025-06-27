import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

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

    const getFirstImage = (imageData) => {
        if (Array.isArray(imageData) && imageData.length > 0) {
            return imageData[0];
        }
        if (typeof imageData === 'string' && imageData) {
            return imageData;
        }
        return '/placeholder.jpg';
    };

    return (
        <div className="homepage-container">
            <div className="homepage-main">
                <div className="homepage-content">
                    {/* Hero Section */}
                    <section className="homepage-hero">
                        <div className="homepage-hero-content">
                            <h1 className="homepage-hero-title">
                                Khám phá văn hóa<br />
                                <span className="homepage-hero-highlight">dân tộc Khmer</span>
                            </h1>
                            <p className="homepage-hero-description">
                                Tìm hiểu về những lễ hội truyền thống đặc sắc và ý nghĩa sâu sắc
                                của cộng đồng người Khmer Nam Bộ
                            </p>
                            <div className="homepage-hero-stats">
                                <div className="homepage-hero-stat">
                                    <span className="homepage-stat-number">{articles.length}</span>
                                    <span className="homepage-stat-label">Lễ hội</span>
                                </div>
                                <div className="homepage-hero-stat">
                                    <span className="homepage-stat-number">{categories.length}</span>
                                    <span className="homepage-stat-label">Danh mục</span>
                                </div>
                                <div className="homepage-hero-stat">
                                    <span className="homepage-stat-number">{featuredArticles.length}</span>
                                    <span className="homepage-stat-label">Nổi bật</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Featured Articles */}
                    {featuredArticles.length > 0 && (
                        <section>
                            <div className="homepage-section-header">
                                <h2 className="homepage-section-title">✨ Lễ hội nổi bật</h2>
                                <p className="homepage-section-subtitle">Những lễ hội truyền thống đặc biệt quan trọng</p>
                            </div>

                            <div className="homepage-featured-grid">
                                {featuredArticles.map(article => (
                                    <Link to={`/article/${article.id}`} key={article.id} className="homepage-featured-card">
                                        <div className="homepage-featured-image">
                                            <img src={getFirstImage(article.image)} alt={article.title} />
                                            <div className="homepage-featured-badge">Nổi bật</div>
                                        </div>
                                        <div className="homepage-featured-content">
                                            <h3 className="homepage-featured-title">{article.title}</h3>
                                            <p className="homepage-featured-location">📍 {article.location}</p>
                                            <p className="homepage-featured-excerpt">{article.excerpt}</p>
                                            <div className="homepage-featured-meta">
                                                <span>👁️ {article.views.toLocaleString('vi-VN')}</span>
                                                <span>{new Date(article.date).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Filters */}
                    <section className="homepage-filters-section">
                        <div className="homepage-filters-container">
                            <div className="homepage-filter-group">
                                <label>Danh mục</label>
                                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                    <option value="">Tất cả</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="homepage-filter-group">
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
                    <section>
                        <div className="homepage-section-header">
                            <h2 className="homepage-section-title">🏮 Tất cả lễ hội</h2>
                            <p className="homepage-section-subtitle">
                                Hiển thị {filteredAndSortedArticles.length} lễ hội
                            </p>
                        </div>

                        {filteredAndSortedArticles.length === 0 ? (
                            <div className="homepage-empty-state">
                                <div className="homepage-empty-icon">🔍</div>
                                <h3>Không tìm thấy lễ hội nào</h3>
                                <p>Thử thay đổi bộ lọc để xem kết quả khác</p>
                            </div>
                        ) : (
                            <div className="homepage-articles-grid">
                                {filteredAndSortedArticles.map(article => (
                                    <Link to={`/article/${article.id}`} key={article.id} className="homepage-article-card">
                                        <div className="homepage-article-image">
                                            <img src={getFirstImage(article.image)} alt={article.title} />
                                            <div className="homepage-article-category">{article.category}</div>
                                        </div>
                                        <div className="homepage-article-content">
                                            <h3 className="homepage-article-title">{article.title}</h3>
                                            <p className="homepage-article-location">📍 {article.location}</p>
                                            <div className="homepage-article-tags">
                                                {article.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="homepage-article-tag">#{tag}</span>
                                                ))}
                                            </div>
                                            <div className="homepage-article-meta">
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
            </div>
        </div>
    );
};

export default HomePage; 