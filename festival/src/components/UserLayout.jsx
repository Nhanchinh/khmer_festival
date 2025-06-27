import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './UserLayout.css';

const UserLayout = ({ searchTerm, setSearchTerm }) => {
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <div className="user-layout-container">
            <header className="user-layout-header">
                <div className="user-layout-header-container">
                    <Link to="/" className="user-layout-brand">
                        🏮 Lễ hội Khmer
                    </Link>

                    <form onSubmit={handleSearch} className="user-layout-search">
                        <input
                            type="text"
                            placeholder="Tìm kiếm lễ hội..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="user-layout-search-input"
                        />
                        <button type="submit" className="user-layout-search-btn">
                            Tìm
                        </button>
                    </form>

                    <nav className="user-layout-nav">
                        <Link to="/" className="user-layout-nav-item">Trang chủ</Link>
                        <Link to="/admin" className="user-layout-nav-item user-layout-nav-admin">
                            Admin
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="user-layout-main">
                <Outlet />
            </main>

            <footer className="user-layout-footer">
                <div className="user-layout-footer-container">
                    <p className="user-layout-footer-text">
                        © 2024 Lễ hội Khmer Nam Bộ. Bảo tồn và phát huy văn hóa truyền thống.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default UserLayout; 