import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import EventsCalendar from '../../components/EventsCalendar';
import { imageAPI } from '../../utils/api';

const HomePage = ({ articles }) => {
    const [sortBy, setSortBy] = useState('date');

    // ✅ Multi-factor Trending Algorithm
    const getTrendingArticles = () => {
        return articles
            .map(article => {
                // 1. Views score (40% weight)
                const views = article.views || 0;
                const viewsScore = views * 0.4;

                // 2. Comments engagement (30% weight)
                const commentsCount = article.comments?.length || 0;
                const commentsScore = commentsCount * 15; // Mỗi comment = 15 điểm

                // 3. Average rating (20% weight)
                let avgRating = 0;
                if (commentsCount > 0 && article.comments) {
                    const totalRating = article.comments.reduce((sum, comment) => {
                        return sum + (Number(comment.rating) || 5);
                    }, 0);
                    avgRating = totalRating / commentsCount;
                }
                const ratingScore = avgRating * 10; // Rating 1-5 * 10

                // 4. Recency bonus (10% weight)
                const now = new Date();
                const articleDate = new Date(article.date);
                const daysOld = Math.max((now - articleDate) / (1000 * 60 * 60 * 24), 0);
                const recencyBonus = Math.max(0, (30 - daysOld) * 2); // Bonus cho bài < 30 ngày

                // 5. Tổng điểm trending
                const trendingScore = viewsScore + commentsScore + ratingScore + recencyBonus;

                // Debug log để xem điểm số
                console.log(`📊 ${article.title}:`, {
                    views: views,
                    viewsScore: viewsScore.toFixed(1),
                    comments: commentsCount,
                    commentsScore: commentsScore,
                    avgRating: avgRating.toFixed(1),
                    ratingScore: ratingScore.toFixed(1),
                    daysOld: daysOld.toFixed(1),
                    recencyBonus: recencyBonus.toFixed(1),
                    totalScore: trendingScore.toFixed(1)
                });

                return {
                    ...article,
                    trendingScore,
                    trendingDetails: {
                        viewsScore,
                        commentsScore,
                        ratingScore,
                        recencyBonus,
                        avgRating
                    }
                };
            })
            .filter(article => article.trendingScore > 0) // Chỉ lấy bài có điểm > 0
            .sort((a, b) => b.trendingScore - a.trendingScore)
            .slice(0, 6);
    };

    // ✅ THÊM: Lấy thống kê locations
    const getLocationStats = () => {
        const locationMap = new Map();

        articles.forEach(article => {
            // Normalize: trim, lowercase, capitalize first letter
            const rawLocation = article.location || 'Chưa xác định';
            const normalizedLocation = rawLocation.trim()
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            if (!locationMap.has(normalizedLocation)) {
                locationMap.set(normalizedLocation, {
                    name: normalizedLocation,
                    count: 0,
                    articles: []
                });
            }
            locationMap.get(normalizedLocation).count++;
            locationMap.get(normalizedLocation).articles.push(article);
        });

        return Array.from(locationMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 8); // Top 8 locations
    };

    const trendingArticles = getTrendingArticles();
    const locationStats = getLocationStats();

    const filteredAndSortedArticles = articles
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
            return imageAPI.getImageUrl(imageData[0]);
        }
        if (typeof imageData === 'string' && imageData) {
            return imageAPI.getImageUrl(imageData);
        }
        return '/placeholder.jpg';
    };

    // Smart categorization
    const determineCategory = (apiArticle) => {
        const title = (apiArticle.title || '').toLowerCase();
        const content = (apiArticle.body || '').toLowerCase();
        const text = title + ' ' + content;

        if (text.includes('chol chnam thmay') || text.includes('năm mới')) return 'Lễ hội năm mới';
        if (text.includes('pchum ben') || text.includes('cúng cô hồn')) return 'Lễ hội tôn giáo';
        if (text.includes('ok om bok') || text.includes('trăng sáng')) return 'Lễ hội mùa vụ';
        if (text.includes('đua ghe') || text.includes('thể thao')) return 'Lễ hội thể thao';

        return 'Lễ hội truyền thống';
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

                            </div>
                        </div>
                    </section>

                    {/* 📅 THÊM CALENDAR COMPONENT */}
                    <section>
                        <div className="homepage-section-header">
                            <h2 className="homepage-section-title">📅 Lịch trình các sự kiện</h2>
                            <p className="homepage-section-subtitle">Lịch các lễ hội và sự kiện văn hóa Khmer</p>
                        </div>
                        <EventsCalendar articles={articles} />
                    </section>

                    {/* 🔥 TRENDING SECTION */}
                    {trendingArticles.length > 0 && (
                        <section className="homepage-trending-section">
                            <div className="homepage-section-header">
                                <h2 className="homepage-section-title">🔥 Lễ hội nổi bật</h2>
                                <p className="homepage-section-subtitle">Những lễ hội được quan tâm và tìm hiểu nhiều nhất</p>
                            </div>

                            <div className="homepage-trending-grid">
                                {trendingArticles.map((article, index) => (
                                    <Link to={`/article/${article.id}`} key={article.id} className="homepage-trending-card">
                                        <div className="homepage-trending-rank">
                                            <span className="homepage-rank-number">#{index + 1}</span>
                                            <div className="homepage-trending-badge">
                                                {index < 3 ? '🔥' : '📈'}
                                            </div>
                                        </div>

                                        <div className="homepage-trending-image">
                                            <img src={getFirstImage(article.image)} alt={article.title} />
                                        </div>

                                        <div className="homepage-trending-content">
                                            <h3 className="homepage-trending-title">{article.title}</h3>
                                            <p className="homepage-trending-location">🗺️ {article.location}</p>

                                            <div className="homepage-trending-stats">
                                                <div className="homepage-trending-stat">
                                                    <span className="homepage-stat-icon">👁️</span>
                                                    <span className="homepage-stat-value">{article.views.toLocaleString('vi-VN')}</span>
                                                </div>
                                                <div className="homepage-trending-stat">
                                                    <span className="homepage-stat-icon">💬</span>
                                                    <span className="homepage-stat-value">{article.comments?.length || 0}</span>
                                                </div>
                                                <div className="homepage-trending-stat">
                                                    <span className="homepage-stat-icon">📅</span>
                                                    <span className="homepage-stat-value">{new Date(article.date).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 🌍 LOCATIONS MAP SECTION */}
                    <section className="homepage-locations-section">
                        <div className="homepage-section-header">
                            <h2 className="homepage-section-title">🌍 Bản đồ các địa điểm</h2>
                            <p className="homepage-section-subtitle">Khám phá lễ hội Khmer trên khắp các tỉnh thành</p>
                        </div>

                        <div className="homepage-locations-container">
                            <div className="homepage-locations-map">
                                <h3 className="homepage-map-title">🗺️ Phân bố địa lý</h3>
                                <div className="homepage-locations-grid">
                                    {locationStats.map((location, index) => (
                                        <div key={location.name} className="homepage-location-item">
                                            <div className="homepage-location-header">
                                                <span className="homepage-location-name">{location.name}</span>
                                                <span className="homepage-location-count">{location.count} lễ hội</span>
                                            </div>
                                            <div className="homepage-location-bar">
                                                <div
                                                    className="homepage-location-progress"
                                                    style={{
                                                        width: `${(location.count / Math.max(...locationStats.map(l => l.count))) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="homepage-location-articles">
                                                {location.articles.slice(0, 2).map(article => (
                                                    <Link
                                                        key={article.id}
                                                        to={`/article/${article.id}`}
                                                        className="homepage-location-article"
                                                    >
                                                        {article.title}
                                                    </Link>
                                                ))}
                                                {location.articles.length > 2 && (
                                                    <span className="homepage-location-more">
                                                        +{location.articles.length - 2} lễ hội khác
                                                    </span>
                                                )}
                                            </div>

                                            {/* ✅ THÊM Google Maps link */}
                                            <div className="homepage-location-actions">
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name + ' Vietnam')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="homepage-location-map-link"
                                                >
                                                    🗺️ Xem bản đồ
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="homepage-locations-highlight">
                                <h3 className="homepage-highlight-title">📍 Điểm nổi bật</h3>
                                <div className="homepage-highlight-content">
                                    <div className="homepage-highlight-stat">
                                        <span className="homepage-highlight-number">{locationStats.length}</span>
                                        <span className="homepage-highlight-label">Tỉnh thành</span>
                                    </div>
                                    <div className="homepage-highlight-stat">
                                        <span className="homepage-highlight-number">{articles.length}</span>
                                        <span className="homepage-highlight-label">Lễ hội tổng</span>
                                    </div>
                                    <div className="homepage-highlight-stat">
                                        <span className="homepage-highlight-number">
                                            {locationStats[0]?.count || 0}
                                        </span>
                                        <span className="homepage-highlight-label">Nhiều nhất</span>
                                    </div>
                                </div>

                                <div className="homepage-highlight-top">
                                    <h4>🏆 Top 3 địa điểm</h4>
                                    {locationStats.slice(0, 3).map((location, index) => (
                                        <div key={location.name} className="homepage-top-location">
                                            <span className="homepage-top-rank">#{index + 1}</span>
                                            <span className="homepage-top-name">{location.name}</span>
                                            <span className="homepage-top-count">{location.count}</span>
                                        </div>
                                    ))}
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
                                            <p className="homepage-featured-location">🗺️ {article.location}</p>
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
                                        </div>
                                        <div className="homepage-article-content">
                                            <h3 className="homepage-article-title">{article.title}</h3>
                                            <p className="homepage-article-location">🗺️ {article.location}</p>
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