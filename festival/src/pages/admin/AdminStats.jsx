import React, { useState } from 'react';

const AdminStats = ({ articles }) => {
    const [timeRange, setTimeRange] = useState('all');

    // Calculate statistics
    const totalArticles = articles.length;
    const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
    const avgViews = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;
    const featuredCount = articles.filter(article => article.featured).length;

    // Category statistics
    const categoryStats = [...new Set(articles.map(article => article.category))].map(category => {
        const categoryArticles = articles.filter(article => article.category === category);
        const categoryViews = categoryArticles.reduce((sum, article) => sum + article.views, 0);
        return {
            category,
            count: categoryArticles.length,
            views: categoryViews,
            avgViews: categoryArticles.length > 0 ? Math.round(categoryViews / categoryArticles.length) : 0
        };
    }).sort((a, b) => b.views - a.views);

    // Top articles by views
    const topArticles = [...articles]
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

    // Monthly statistics (simulate based on article dates)
    const monthlyStats = {};
    articles.forEach(article => {
        const date = new Date(article.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyStats[monthKey]) {
            monthlyStats[monthKey] = { articles: 0, views: 0 };
        }
        monthlyStats[monthKey].articles += 1;
        monthlyStats[monthKey].views += article.views;
    });

    const monthlyData = Object.entries(monthlyStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6); // Last 6 months

    // Tag statistics
    const tagStats = {};
    articles.forEach(article => {
        article.tags.forEach(tag => {
            if (!tagStats[tag]) {
                tagStats[tag] = { count: 0, views: 0 };
            }
            tagStats[tag].count += 1;
            tagStats[tag].views += article.views;
        });
    });

    const topTags = Object.entries(tagStats)
        .map(([tag, stats]) => ({ tag, ...stats }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return (
        <div className="admin-stats">
            <div style={{ marginBottom: '2rem' }}>
                <h1>📈 Thống Kê Website</h1>
                <p>Phân tích chi tiết về hiệu quả và lưu lượng truy cập website</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-2" style={{ marginBottom: '3rem' }}>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ fontSize: '3em', marginBottom: '0.5rem' }}>📝</div>
                    <div className="stat-number">{totalArticles}</div>
                    <div className="stat-label">Tổng số bài viết</div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ fontSize: '3em', marginBottom: '0.5rem' }}>👁️</div>
                    <div className="stat-number">{totalViews.toLocaleString('vi-VN')}</div>
                    <div className="stat-label">Tổng lượt xem</div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ fontSize: '3em', marginBottom: '0.5rem' }}>📊</div>
                    <div className="stat-number">{avgViews.toLocaleString('vi-VN')}</div>
                    <div className="stat-label">Trung bình lượt xem/bài</div>
                </div>


            </div>

            <div className="grid grid-2">
                {/* Category Statistics */}
                <div className="card">
                    <h2>📊 Thống kê theo danh mục</h2>
                    <div style={{ marginTop: '1.5rem' }}>
                        {categoryStats.map(stat => (
                            <div key={stat.category} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                marginBottom: '0.5rem'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>
                                        {stat.category}
                                    </div>
                                    <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                                        {stat.count} bài viết • TB: {stat.avgViews.toLocaleString('vi-VN')} lượt xem
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                                        {stat.views.toLocaleString('vi-VN')}
                                    </div>
                                    <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                                        lượt xem
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Articles */}
                <div className="card">
                    <h2>🔥 Top 10 bài viết phổ biến</h2>
                    <div style={{ marginTop: '1.5rem' }}>
                        {topArticles.map((article, index) => (
                            <div key={article.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.8rem 0',
                                borderBottom: index < topArticles.length - 1 ? '1px solid var(--border-color)' : 'none'
                            }}>
                                <span style={{
                                    fontWeight: 'bold',
                                    marginRight: '1rem',
                                    color: index < 3 ? 'var(--accent-color)' : 'var(--text-secondary)',
                                    minWidth: '30px'
                                }}>
                                    #{index + 1}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>
                                        {article.title.length > 40 ? article.title.substring(0, 40) + '...' : article.title}
                                    </div>
                                    <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                                        {article.category}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                                        {article.views.toLocaleString('vi-VN')}
                                    </div>
                                    <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                                        lượt xem
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <h2>📈 Xu hướng theo tháng (6 tháng gần đây)</h2>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'end',
                    height: '200px',
                    marginTop: '2rem',
                    padding: '1rem 0'
                }}>
                    {monthlyData.map(([month, data]) => (
                        <div key={month} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{
                                background: 'var(--primary-color)',
                                width: '60px',
                                height: `${Math.max(20, (data.views / Math.max(...monthlyData.map(([, d]) => d.views))) * 120)}px`,
                                margin: '0 auto 0.5rem',
                                borderRadius: '4px 4px 0 0',
                                display: 'flex',
                                alignItems: 'end',
                                justifyContent: 'center',
                                color: 'var(--text-primary)',
                                fontWeight: 'bold',
                                fontSize: '0.8em'
                            }}>
                                {data.views}
                            </div>
                            <div style={{ fontSize: '0.8em', fontWeight: 'bold' }}>
                                {new Date(month + '-01').toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' })}
                            </div>
                            <div style={{ fontSize: '0.7em', color: 'var(--text-secondary)' }}>
                                {data.articles} bài
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tag Statistics */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <h2>🏷️ Thống kê từ khóa phổ biến</h2>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginTop: '1.5rem'
                }}>
                    {topTags.map(tag => (
                        <div key={tag.tag} style={{
                            background: `hsl(${Math.random() * 360}, 70%, 90%)`,
                            color: 'var(--text-primary)',
                            padding: '0.5em 1em',
                            borderRadius: '20px',
                            fontSize: '0.9em',
                            fontWeight: 'bold',
                            border: '2px solid var(--border-color)'
                        }}>
                            #{tag.tag} ({tag.count})
                        </div>
                    ))}
                </div>
            </div>

            {/* Export Options */}
            <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
                <h2>📊 Xuất báo cáo</h2>
                <p>Tải báo cáo thống kê chi tiết về website</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <button
                        className="nav-button"
                        onClick={() => {
                            const data = {
                                overview: { totalArticles, totalViews, avgViews, featuredCount },
                                categories: categoryStats,
                                topArticles: topArticles.slice(0, 5),
                                topTags: topTags.slice(0, 5),
                                generatedAt: new Date().toISOString()
                            };
                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `khmer-festival-stats-${new Date().toISOString().split('T')[0]}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                    >
                        📥 Tải JSON
                    </button>
                    <button
                        className="nav-button btn-secondary"
                        onClick={() => window.print()}
                    >
                        🖨️ In báo cáo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminStats; 