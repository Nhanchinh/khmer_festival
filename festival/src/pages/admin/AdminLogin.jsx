import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = ({ setIsAdminAuthenticated, isAuthenticated }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // If already authenticated, redirect to admin dashboard
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simple authentication (in real app, this would be API call)
        setTimeout(() => {
            if (credentials.username === 'admin' && credentials.password === 'khmer2024') {
                localStorage.setItem('adminAuth', 'true');
                setIsAdminAuthenticated(true);
                navigate('/admin');
            } else {
                setError('Tên đăng nhập hoặc mật khẩu không chính xác');
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    {/* Header */}
                    <div className="login-header">
                        <div className="login-icon">🛠️</div>
                        <h1>Admin Panel</h1>
                        <p>Quản trị Website Lễ Hội Khmer</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label>Tên đăng nhập</label>
                            <input
                                type="text"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                placeholder="Nhập username..."
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                placeholder="Nhập password..."
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        {error && (
                            <div className="error-message">
                                <span className="error-icon">❌</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    Đang đăng nhập...
                                </>
                            ) : (
                                <>
                                    🚪 Đăng nhập
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Info */}
                    <div className="demo-info">
                        <h4>🔑 Thông tin demo</h4>
                        <div className="demo-credentials">
                            <p><strong>Username:</strong> <code>admin</code></p>
                            <p><strong>Password:</strong> <code>khmer2024</code></p>
                        </div>
                    </div>

                    {/* Back Link */}
                    <div className="back-link">
                        <Link to="/">← Về trang chính</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin; 