import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminArticles = ({ articles, onAdd, onUpdate, onDelete }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        image: '',
        category: 'Lễ hội truyền thống',
        location: '',
        tags: '',
        featured: false
    });
    const [filter, setFilter] = useState('');
    const [sortBy, setSortBy] = useState('date');

    const categories = [
        'Lễ hội truyền thống',
        'Lễ hội tôn giáo',
        'Lễ hội mùa vụ',
        'Lễ hội văn hóa',
        'Lễ hội ẩm thực'
    ];

    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            image: '',
            category: 'Lễ hội truyền thống',
            location: '',
            tags: '',
            featured: false
        });
        setEditingArticle(null);
        setShowAddForm(false);
        setShowEditModal(false);
    };

    const handleEdit = (article) => {
        setFormData({
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            image: article.image,
            category: article.category,
            location: article.location,
            tags: article.tags.join(', '),
            featured: article.featured
        });
        setEditingArticle(article);
        setShowEditModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        const articleData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        if (editingArticle) {
            onUpdate(editingArticle.id, articleData);
            alert('Cập nhật bài viết thành công!');
        } else {
            onAdd(articleData);
            alert('Thêm bài viết thành công!');
        }

        resetForm();
    };

    const handleDelete = (article) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${article.title}"?`)) {
            onDelete(article.id);
            alert('Xóa bài viết thành công!');
        }
    };

    const filteredAndSortedArticles = articles
        .filter(article =>
            article.title.toLowerCase().includes(filter.toLowerCase()) ||
            article.category.toLowerCase().includes(filter.toLowerCase()) ||
            article.location.toLowerCase().includes(filter.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.date) - new Date(a.date);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'views':
                    return b.views - a.views;
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });

    return (
        <div className="admin-articles-clean">
            {/* Header */}
            <div className="admin-header-clean">
                <h1>Quản Lý Bài Viết</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn-clean btn-primary"
                >
                    {showAddForm ? 'Hủy' : '+ Thêm bài viết'}
                </button>
            </div>

            {/* Filters */}
            <div className="filters-clean">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="search-clean"
                    />
                    <span className="search-icon">🔍</span>
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-clean"
                >
                    <option value="date">Mới nhất</option>
                    <option value="title">Tên A-Z</option>
                    <option value="views">Lượt xem</option>
                    <option value="category">Danh mục</option>
                </select>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="form-card-clean">
                    <h3>Thêm bài viết mới</h3>
                    <form onSubmit={handleSubmit} className="form-clean">
                        <div className="form-grid-clean">
                            <input
                                type="text"
                                placeholder="Tiêu đề *"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Địa điểm"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                            <input
                                type="url"
                                placeholder="Link hình ảnh"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Tags (phân cách bằng dấu phẩy)"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="full-width"
                            />
                        </div>
                        <textarea
                            placeholder="Tóm tắt *"
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            rows="3"
                            required
                        />
                        <textarea
                            placeholder="Nội dung chi tiết *"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows="6"
                            required
                        />
                        <div className="form-actions-clean">
                            <label className="checkbox-clean">
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                />
                                Bài viết nổi bật
                            </label>
                            <div>
                                <button type="button" onClick={resetForm} className="btn-clean btn-secondary">
                                    Hủy
                                </button>
                                <button type="submit" className="btn-clean btn-primary">
                                    Thêm bài viết
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Articles Table */}
            <div className="table-container-clean">
                <table className="table-clean">
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tiêu đề</th>
                            <th>Danh mục</th>
                            <th>Địa điểm</th>
                            <th>Lượt xem</th>
                            <th>Ngày đăng</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedArticles.map(article => (
                            <tr key={article.id}>
                                <td>
                                    <div className="thumbnail-cell">
                                        {article.image ? (
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className="article-thumbnail"
                                            />
                                        ) : (
                                            <div className="no-image">📷</div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="article-title-cell">
                                        <strong>{article.title}</strong>
                                        {article.featured && <span className="featured-badge">Nổi bật</span>}
                                    </div>
                                </td>
                                <td>{article.category}</td>
                                <td>{article.location}</td>
                                <td>{article.views.toLocaleString()}</td>
                                <td>{new Date(article.date).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <div className="actions-clean">
                                        <Link to={`/article/${article.id}`} className="btn-clean btn-view">
                                            Xem
                                        </Link>
                                        <button
                                            onClick={() => handleEdit(article)}
                                            className="btn-clean btn-edit"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(article)}
                                            className="btn-clean btn-delete"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredAndSortedArticles.length === 0 && (
                    <div className="empty-state-clean">
                        <p>Không tìm thấy bài viết nào.</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chỉnh sửa bài viết</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="modal-close"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-grid-modal">
                                <input
                                    type="text"
                                    placeholder="Tiêu đề *"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Địa điểm"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                                <input
                                    type="url"
                                    placeholder="Link hình ảnh"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Tags (phân cách bằng dấu phẩy)"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="full-width"
                                />
                            </div>

                            <textarea
                                placeholder="Tóm tắt *"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                rows="3"
                                required
                            />

                            <textarea
                                placeholder="Nội dung chi tiết *"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows="6"
                                required
                            />

                            <div className="modal-actions">
                                <label className="checkbox-clean">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    />
                                    Bài viết nổi bật
                                </label>

                                <div className="modal-buttons">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="btn-clean btn-secondary"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-clean btn-primary"
                                    >
                                        Cập nhật
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminArticles; 