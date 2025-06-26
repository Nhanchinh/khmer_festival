import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = ({ articles }) => {
    const totalArticles = articles.length;
    const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
    const featuredArticles = articles.filter(article => article.featured).length;
    const categories = [...new Set(articles.map(article => article.category))].length;

    const recentArticles = articles
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const popularArticles = articles
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <h1>📊 Dashboard</h1>
                <p>Tổng quan về hoạt động website Lễ Hội Khmer</p>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-number">{totalArticles}</div>
                    <div className="stat-label">Tổng bài viết</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👁️</div>
                    <div className="stat-number">{totalViews.toLocaleString('vi-VN')}</div>
                    <div className="stat-label">Tổng lượt xem</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-number">{featuredArticles}</div>
                    <div className="stat-label">Bài nổi bật</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🏷️</div>
                    <div className="stat-number">{categories}</div>
                    <div className="stat-label">Danh mục</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="admin-card">
                <h2>🚀 Thao tác nhanh</h2>
                <div className="quick-actions">
                    <Link to="/admin/articles" className="action-btn primary">
                        ➕ Thêm bài viết
                    </Link>
                    <Link to="/admin/stats" className="action-btn secondary">
                        📈 Xem thống kê
                    </Link>
                    <Link to="/" className="action-btn outline">
                        🌐 Xem website
                    </Link>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Recent Articles */}
                <div className="admin-card">
                    <h3>📅 Bài viết gần đây</h3>
                    {recentArticles.length === 0 ? (
                        <div className="empty-state-mini">
                            <p>Chưa có bài viết nào</p>
                        </div>
                    ) : (
                        <div className="articles-list">
                            {recentArticles.map(article => (
                                <div key={article.id} className="article-item">
                                    <div className="article-info">
                                        <div className="article-title">{article.title}</div>
                                        <div className="article-meta">
                                            📅 {new Date(article.date).toLocaleDateString('vi-VN')} •
                                            👁️ {article.views} •
                                            📂 {article.category}
                                        </div>
                                    </div>
                                    <Link to={`/article/${article.id}`} className="view-btn">
                                        Xem
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Popular Articles */}
                <div className="admin-card">
                    <h3>🔥 Bài viết phổ biến</h3>
                    {popularArticles.length === 0 ? (
                        <div className="empty-state-mini">
                            <p>Chưa có bài viết nào</p>
                        </div>
                    ) : (
                        <div className="articles-list">
                            {popularArticles.map((article, index) => (
                                <div key={article.id} className="article-item">
                                    <div className="article-rank">#{index + 1}</div>
                                    <div className="article-info">
                                        <div className="article-title">{article.title}</div>
                                        <div className="article-meta">
                                            👁️ {article.views.toLocaleString('vi-VN')} lượt xem
                                        </div>
                                    </div>
                                    <Link to={`/article/${article.id}`} className="view-btn">
                                        Xem
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 