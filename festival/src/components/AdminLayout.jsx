import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        navigate('/admin/login');
        window.location.reload();
    };

    return (
        <div className="admin-layout">
            {/* Modern Admin Header */}
            <header className="admin-header">
                <div className="header-container">
                    <Link to="/admin" className="admin-brand">
                        <span className="brand-icon">🛠️</span>
                        <span className="brand-text">Admin Panel</span>
                    </Link>

                    <nav className="admin-nav">
                        <Link to="/admin" className="admin-nav-item">
                            📊 Dashboard
                        </Link>
                        <Link to="/admin/articles" className="admin-nav-item">
                            📝 Bài viết
                        </Link>
                        <Link to="/admin/stats" className="admin-nav-item">
                            📈 Thống kê
                        </Link>
                        <Link to="/" className="admin-nav-item view-site">
                            🌐 Xem trang chính
                        </Link>
                        <button onClick={handleLogout} className="logout-btn">
                            🚪 Đăng xuất
                        </button>
                    </nav>
                </div>
            </header>

            {/* Admin Content */}
            <main className="admin-main">
                <div className="admin-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout; 