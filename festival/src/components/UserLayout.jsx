import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const UserLayout = ({ searchTerm, setSearchTerm }) => {
    const navigate = useNavigate();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <div className="user-layout">
            {/* Modern Minimal Header */}
            <header className="modern-header">
                <div className="header-container">
                    <Link to="/" className="brand">
                        <span className="brand-icon">🏮</span>
                        <span className="brand-text">Khmer Festival</span>
                    </Link>

                    <div className="header-actions">
                        <form onSubmit={handleSearch} className="search-form">
                            <div className="search-wrapper">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm lễ hội..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <button type="submit" className="search-btn-q">
                                    🔍
                                </button>
                            </div>
                        </form>

                        <nav className="nav-menu">
                            <Link to="/" className="nav-item">Trang chủ</Link>
                            <Link to="/admin/login" className="nav-item nav-admin">Admin</Link>
                        </nav>

                        <button
                            className="mobile-menu-btn"
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                        >
                            ☰
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="mobile-menu">
                        <form onSubmit={handleSearch} className="mobile-search">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mobile-search-input"
                            />
                            <button type="submit" className="mobile-search-btn-q">Q</button>
                        </form>
                        <Link to="/" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
                            🏠 Trang chủ
                        </Link>
                        <Link to="/admin/login" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
                            👤 Admin
                        </Link>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="main-container">
                <Outlet />
            </main>

            {/* Modern Footer */}
            <footer className="modern-footer">
                <div className="footer-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="footer-icon">🏮</span>
                            <span>Khmer Festival</span>
                        </div>
                        <p>Bảo tồn và phát huy văn hóa dân tộc Khmer Nam Bộ</p>
                    </div>
                    <div className="footer-copy">
                        © 2024 Khmer Festival. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default UserLayout; 