import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const SearchResults = ({ articles, searchTerm }) => {
    const location = useLocation();
    const [results, setResults] = useState([]);
    const [currentSearchTerm, setCurrentSearchTerm] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get('q') || searchTerm;
        setCurrentSearchTerm(query);

        if (query && query.trim()) {
            const searchResults = articles.filter(article => {
                const searchText = query.toLowerCase();
                return (
                    article.title.toLowerCase().includes(searchText) ||
                    article.excerpt.toLowerCase().includes(searchText) ||
                    article.content.toLowerCase().includes(searchText) ||
                    article.category.toLowerCase().includes(searchText) ||
                    article.location.toLowerCase().includes(searchText) ||
                    article.tags.some(tag => tag.toLowerCase().includes(searchText))
                );
            });
            setResults(searchResults);
        } else {
            setResults([]);
        }
    }, [location.search, searchTerm, articles]);

    return (
        <div className="search-results">
            <div className="search-header" style={{ marginBottom: '2rem' }}>
                <h1>🔍 Kết quả tìm kiếm</h1>
                {currentSearchTerm && (
                    <p style={{ fontSize: '1.1em', color: 'var(--text-secondary)' }}>
                        Tìm kiếm cho: <strong>"{currentSearchTerm}"</strong>
                    </p>
                )}
                <p style={{ color: 'var(--text-secondary)' }}>
                    Tìm thấy <strong>{results.length}</strong> kết quả
                </p>
            </div>

            {!currentSearchTerm ? (
                <div className="card text-center">
                    <h3>Vui lòng nhập từ khóa tìm kiếm</h3>
                    <p>Sử dụng thanh tìm kiếm ở trên để tìm các lễ hội và sự kiện Khmer</p>
                    <Link to="/" className="nav-button">← Về trang chủ</Link>
                </div>
            ) : results.length === 0 ? (
                <div className="card text-center">
                    <h3>Không tìm thấy kết quả nào</h3>
                    <p>Không có bài viết nào phù hợp với từ khóa "{currentSearchTerm}"</p>
                    <div style={{ marginTop: '1.5rem' }}>
                        <p><strong>Gợi ý tìm kiếm:</strong></p>
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                            <li>• Thử tìm kiếm với từ khóa ngắn gọn hơn</li>
                            <li>• Sử dụng từ khóa tiếng Việt: "chol chnam thmay", "ok om bok"</li>
                            <li>• Tìm theo danh mục: "lễ hội truyền thống", "lễ hội mùa vụ"</li>
                            <li>• Tìm theo địa điểm: "Trà Vinh", "Sóc Trăng", "An Giang"</li>
                        </ul>
                    </div>
                    <Link to="/" className="nav-button" style={{ marginTop: '1.5rem' }}>← Về trang chủ</Link>
                </div>
            ) : (
                <div className="results-list">
                    {results.map(article => (
                        <article key={article.id} className="card festival-card" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    style={{
                                        width: '200px',
                                        height: '150px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        flexShrink: 0
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div className="festival-header">
                                        <h3 className="festival-title">{article.title}</h3>
                                        <span className="festival-date">{article.category}</span>
                                    </div>
                                    <p className="festival-location">📍 {article.location}</p>
                                    <p className="festival-description">{article.excerpt}</p>

                                    {/* Highlight matching tags */}
                                    <div className="festival-tags" style={{ marginBottom: '1rem' }}>
                                        {article.tags
                                            .filter(tag => tag.toLowerCase().includes(currentSearchTerm.toLowerCase()))
                                            .map(tag => (
                                                <span key={tag} style={{
                                                    background: 'var(--primary-color)',
                                                    color: 'var(--text-primary)',
                                                    padding: '0.2em 0.5em',
                                                    borderRadius: '10px',
                                                    fontSize: '0.8em',
                                                    marginRight: '0.5rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    #{tag}
                                                </span>
                                            ))}
                                    </div>

                                    <div className="flex flex-space-between" style={{ alignItems: 'center' }}>
                                        <div className="article-meta">
                                            <span>👁️ {article.views} lượt xem</span>
                                            <span style={{ margin: '0 1rem' }}>•</span>
                                            <span>📅 {new Date(article.date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <Link to={`/article/${article.id}`} className="nav-button">
                                            Xem chi tiết →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* Quick Links */}
            <div className="card" style={{ marginTop: '3rem', textAlign: 'center' }}>
                <h3>🎯 Tìm kiếm nhanh</h3>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <Link to="/search?q=chol chnam thmay" className="nav-button btn-secondary">
                        Chol Chnam Thmay
                    </Link>
                    <Link to="/search?q=ok om bok" className="nav-button btn-secondary">
                        Ok Om Bok
                    </Link>
                    <Link to="/search?q=pchum ben" className="nav-button btn-secondary">
                        Pchum Ben
                    </Link>
                    <Link to="/search?q=lễ hội truyền thống" className="nav-button btn-secondary">
                        Lễ hội truyền thống
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SearchResults; 