import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = ({ articles, searchTerm }) => {
    const location = useLocation();
    const [results, setResults] = useState([]);
    const [currentSearchTerm, setCurrentSearchTerm] = useState('');

    // Function to get first image from article
    const getFirstImage = (imageData) => {
        if (Array.isArray(imageData) && imageData.length > 0) {
            return imageData[0];
        }
        if (typeof imageData === 'string' && imageData) {
            return imageData;
        }
        return '/placeholder.jpg';
    };

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
        <div className="search-results-container">
            <div className="search-results-main">
                <div className="search-results-header">
                    <h1 className="search-results-title">🔍 Kết quả tìm kiếm</h1>
                    {currentSearchTerm && (
                        <p className="search-results-query">
                            Tìm kiếm cho: <strong>"{currentSearchTerm}"</strong>
                        </p>
                    )}
                    <p className="search-results-count">
                        Tìm thấy <strong>{results.length}</strong> kết quả
                    </p>
                </div>

                {!currentSearchTerm ? (
                    <div className="search-results-empty">
                        <h3>Vui lòng nhập từ khóa tìm kiếm</h3>
                        <p>Sử dụng thanh tìm kiếm ở trên để tìm các lễ hội và sự kiện Khmer</p>
                        <Link to="/" className="search-results-back-link">← Về trang chủ</Link>
                    </div>
                ) : results.length === 0 ? (
                    <div className="search-results-empty">
                        <h3>Không tìm thấy kết quả nào</h3>
                        <p>Không có bài viết nào phù hợp với từ khóa "{currentSearchTerm}"</p>
                        <div className="search-results-suggestions">
                            <p><strong>Gợi ý tìm kiếm:</strong></p>
                            <ul>
                                <li>• Thử tìm kiếm với từ khóa ngắn gọn hơn</li>
                                <li>• Sử dụng từ khóa tiếng Việt: "chol chnam thmay", "ok om bok"</li>
                                <li>• Tìm theo danh mục: "lễ hội truyền thống", "lễ hội mùa vụ"</li>
                                <li>• Tìm theo địa điểm: "Trà Vinh", "Sóc Trăng", "An Giang"</li>
                            </ul>
                        </div>
                        <Link to="/" className="search-results-back-link">← Về trang chủ</Link>
                    </div>
                ) : (
                    <div className="search-results-list">
                        {results.map(article => (
                            <article key={article.id} className="search-results-card">
                                <div className="search-results-card-content">
                                    <img
                                        src={getFirstImage(article.image)}
                                        alt={article.title}
                                        className="search-results-image"
                                        onError={(e) => {
                                            e.target.src = '/placeholder.jpg';
                                        }}
                                    />
                                    <div className="search-results-info">
                                        <div className="search-results-article-header">
                                            <h3 className="search-results-article-title">{article.title}</h3>
                                        </div>

                                        <p className="search-results-location">🗺️ {article.location}</p>
                                        <p className="search-results-excerpt">{article.excerpt}</p>

                                        {/* Highlight matching tags */}
                                        {article.tags.filter(tag =>
                                            tag.toLowerCase().includes(currentSearchTerm.toLowerCase())
                                        ).length > 0 && (
                                                <div className="search-results-tags">
                                                    {article.tags
                                                        .filter(tag => tag.toLowerCase().includes(currentSearchTerm.toLowerCase()))
                                                        .map(tag => (
                                                            <span key={tag} className="search-results-tag">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                </div>
                                            )}

                                        <div className="search-results-article-footer">
                                            <div className="search-results-meta">
                                                <span>👁️ {article.views.toLocaleString('vi-VN')} lượt xem</span>
                                                <span>📅 {new Date(article.date).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <Link to={`/article/${article.id}`} className="search-results-view-btn">
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
                <div className="search-results-quick">
                    <h3>🎯 Tìm kiếm nhanh</h3>
                    <div className="search-results-quick-links">
                        <Link to="/search?q=chol chnam thmay" className="search-results-quick-link">
                            Chol Chnam Thmay
                        </Link>
                        <Link to="/search?q=ok om bok" className="search-results-quick-link">
                            Ok Om Bok
                        </Link>
                        <Link to="/search?q=pchum ben" className="search-results-quick-link">
                            Pchum Ben
                        </Link>
                        <Link to="/search?q=lễ hội truyền thống" className="search-results-quick-link">
                            Lễ hội truyền thống
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchResults; 