import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';

const AdminLogin = ({ setIsAdminAuthenticated, isAuthenticated }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // If already authenticated, redirect to admin dashboard
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            console.log('Starting login process...');

            // Validate input
            if (!credentials.email.trim()) {
                throw new Error('Vui lòng nhập email');
            }
            if (!credentials.password.trim()) {
                throw new Error('Vui lòng nhập mật khẩu');
            }

            // Call API login
            const response = await authAPI.login(credentials.email.trim(), credentials.password);

            if (response.user) {
                console.log('Login successful:', response.user);

                // Set admin authentication
                localStorage.setItem('adminAuth', 'true');
                setIsAdminAuthenticated(true);
                navigate('/admin');
            } else {
                throw new Error('Phản hồi từ server không hợp lệ');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Đăng nhập thất bại');
        } finally {
            setIsLoading(false);
        }
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
                            <label>Email</label>
                            <input
                                type="email"
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                placeholder="Nhập email..."
                                required
                                autoComplete="email"
                                disabled={isLoading}
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
                                disabled={isLoading}
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