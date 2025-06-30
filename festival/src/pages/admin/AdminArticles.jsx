import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { authAPI, imageAPI } from '../../utils/api';

// ✅ SỬA: MultiImageUpload để handle filenames
const MultiImageUpload = ({ images, onImagesChange, disabled }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});

    const uploadImage = async (file) => {
        // ✅ Return filename thay vì full URL
        return await imageAPI.upload(file);
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        const newImageFilenames = []; // ✅ Array of filenames

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

                const filename = await uploadImage(file); // ✅ Nhận filename
                newImageFilenames.push(filename);

                setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
            }

            // ✅ Combine filenames (không phải URLs)
            onImagesChange([...images, ...newImageFilenames]);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Có lỗi khi upload ảnh: ' + error.message);
        } finally {
            setIsUploading(false);
            setUploadProgress({});
            e.target.value = '';
        }
    };

    const removeImage = (indexToRemove) => {
        onImagesChange(images.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="compact-image-upload">
            <label className="upload-label">
                Hình ảnh bài viết
                {images.length > 0 && (
                    <span className="image-count">({images.length} ảnh)</span>
                )}
            </label>

            {/* Upload Button */}
            <div className="upload-section">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={disabled || isUploading}
                    id="compact-image-upload"
                    style={{ display: 'none' }}
                />
                <label
                    htmlFor="compact-image-upload"
                    className={`compact-upload-btn ${disabled || isUploading ? 'disabled' : ''}`}
                >
                    {isUploading ? (
                        <>
                            <span className="loading-spinner"></span>
                            Đang upload...
                        </>
                    ) : (
                        <>
                            📷 Chọn ảnh
                        </>
                    )}
                </label>
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="compact-upload-progress">
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                        <div key={fileName} className="compact-progress-item">
                            <span className="progress-filename">{fileName}</span>
                            <div className="compact-progress-bar">
                                <div
                                    className="compact-progress-fill"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ✅ SỬA: Image Preview với filename → URL conversion */}
            {images.length > 0 && (
                <div className="compact-image-grid">
                    {images.map((imageFilename, index) => (
                        <div key={index} className="compact-image-item">
                            {/* ✅ Convert filename to URL for display */}
                            <img
                                src={imageAPI.getImageUrl(imageFilename)}
                                alt={`Preview ${index + 1}`}
                                onError={(e) => {
                                    e.target.src = '/placeholder.jpg';
                                }}
                            />

                            <button
                                type="button"
                                className="compact-remove-btn"
                                onClick={() => removeImage(index)}
                                disabled={disabled}
                                title="Xóa ảnh này"
                            >
                                ✕
                            </button>

                            {index === 0 && (
                                <div className="compact-main-badge">Chính</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Hint */}
            <p className="compact-upload-hint">
                💡 Ảnh đầu tiên sẽ được dùng làm ảnh đại diện
            </p>
        </div>
    );
};

const AdminArticles = ({ articles, onAdd, onUpdate, onDelete }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        images: [],
        videoUrl: '',
        location: '',
        tags: '',
        featured: false,
        startDate: '',
        endDate: ''
    });

    const [sortBy, setSortBy] = useState('date');
    const [filterBy, setFilterBy] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Predefined tags for Khmer festivals
    const predefinedTags = [
        'lễ hội truyền thống',
        'người khmer',
        'tết khmer',
        'chol chnam thmay',
        'ok om bok',
        'pchum ben',
        'dolta',
        'văn hóa',
        'tôn giáo',
        'mùa vụ',
        'nghệ thuật',
        'âm nhạc',
        'múa lam thon',
        'đua ghe ngo',
        'cúng phật',
        'chùa khmer'
    ];

    const categories = [
        'Lễ hội truyền thống',
        'Lễ hội tôn giáo',
        'Lễ hội mùa vụ',
        'Lễ hội văn hóa',
        'Lễ hội nghệ thuật'
    ];

    // Reset form when editing changes
    useEffect(() => {
        if (editingArticle) {
            const descriptionText = editingArticle.excerpt || editingArticle.description || '';
            const existingDates = parseExistingDates(descriptionText);

            setFormData({
                title: editingArticle.title || '',
                content: editingArticle.content || '',
                images: Array.isArray(editingArticle.image) ? editingArticle.image : [editingArticle.image] || [],
                videoUrl: editingArticle.videoUrl || '',
                location: editingArticle.location || '',
                tags: Array.isArray(editingArticle.tags) ? editingArticle.tags.join(', ') : '',
                featured: editingArticle.featured || false,
                startDate: existingDates.startDate,
                endDate: existingDates.endDate
            });
        } else {
            setFormData({
                title: '',
                content: '',
                images: [],
                videoUrl: '',
                location: '',
                tags: '',
                featured: false,
                startDate: '',
                endDate: ''
            });
        }
    }, [editingArticle]);

    // Filter and sort articles
    const filteredAndSortedArticles = articles
        .filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.date) - new Date(a.date);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'views':
                    return b.views - a.views;
                default:
                    return 0;
            }
        });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        console.log('🔍 Input change:', { name, value }); // Debug

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // ✅ THÊM: Handler cho images
    const handleImagesChange = (newImages) => {
        setFormData(prev => ({
            ...prev,
            images: newImages
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        // ✅ Validation đơn giản
        if (!formData.startDate || !formData.endDate) {
            alert('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
            return;
        }

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            alert('Ngày bắt đầu không thể sau ngày kết thúc');
            return;
        }

        const currentUser = authAPI.getCurrentUser();
        if (!currentUser) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // ✅ AUTO GENERATE description từ date picker
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);

            const formatDate = (date) => {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            };

            const autoDescription = startDate.getTime() === endDate.getTime()
                ? `Ngày: ${formatDate(startDate)}`
                : `Ngày: ${formatDate(startDate)} - ${formatDate(endDate)}`;

            const articleData = {
                title: formData.title.trim(),
                description: autoDescription, // ✅ Tự động từ date picker
                body: formData.content.trim(),
                image: formData.images,
                videoUrl: formData.videoUrl.trim() || undefined,
                mapLocation: formData.location.trim() || undefined,
                tagList: formData.tags.trim() ?
                    formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) :
                    []
            };

            console.log('🔍 Final article data:', articleData);

            if (editingArticle) {
                await onUpdate(editingArticle.slug || editingArticle.id, articleData);
            } else {
                await onAdd(articleData);
            }

            handleCloseModal();
            alert('✅ Bài viết đã được lưu thành công!');
        } catch (error) {
            console.error('Error saving article:', error);
            setError(error.message || 'Có lỗi xảy ra khi lưu bài viết');
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Parse ngày từ description ẩn để điền date picker
    const parseExistingDates = (description) => {
        console.log('🔍 Parsing hidden description for dates:', description);

        if (!description) return { startDate: '', endDate: '' };

        const datePattern = /Ngày:\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})/;
        const singleDatePattern = /Ngày:\s*(\d{1,2}\/\d{1,2}\/\d{4})/;

        const dateMatch = description.match(datePattern);
        if (dateMatch) {
            console.log('✅ Found date range:', dateMatch[1], '-', dateMatch[2]);

            const convertToInputFormat = (dateStr) => {
                try {
                    const [day, month, year] = dateStr.split('/');
                    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                } catch (error) {
                    console.error('Error converting date:', error);
                    return '';
                }
            };

            return {
                startDate: convertToInputFormat(dateMatch[1]),
                endDate: convertToInputFormat(dateMatch[2])
            };
        }

        const singleMatch = description.match(singleDatePattern);
        if (singleMatch) {
            console.log('✅ Found single date:', singleMatch[1]);

            const convertToInputFormat = (dateStr) => {
                try {
                    const [day, month, year] = dateStr.split('/');
                    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                } catch (error) {
                    console.error('Error converting date:', error);
                    return '';
                }
            };

            const date = convertToInputFormat(singleMatch[1]);
            return { startDate: date, endDate: date };
        }

        console.log('❌ No date pattern found');
        return { startDate: '', endDate: '' };
    };

    const handleEdit = (article) => {
        console.log('🔍 Editing article:', article);

        const currentUser = authAPI.getCurrentUser();
        if (!currentUser) {
            alert('Vui lòng đăng nhập để chỉnh sửa bài viết!');
            return;
        }

        // ✅ Parse ngày từ description ẩn
        const descriptionText = article.excerpt || article.description || '';
        const existingDates = parseExistingDates(descriptionText);

        console.log('🔍 Parsed dates for date picker:', existingDates);

        setEditingArticle(article);
        setFormData({
            title: article.title || '',
            content: article.content || '',
            images: article.image ? (Array.isArray(article.image) ? article.image : [article.image]) : [],
            videoUrl: article.videoUrl || '',
            location: article.location || '',
            tags: article.tags ? (Array.isArray(article.tags) ? article.tags.join(', ') : article.tags) : '',
            featured: article.featured || false,
            startDate: existingDates.startDate, // ✅ Điền từ description ẩn
            endDate: existingDates.endDate       // ✅ Điền từ description ẩn
        });
        setShowModal(true);
    };

    const handleAdd = () => {
        const currentUser = authAPI.getCurrentUser();
        if (!currentUser) {
            alert('Vui lòng đăng nhập để tạo bài viết!');
            return;
        }

        setEditingArticle(null);
        setFormData({
            title: '',
            content: '',
            images: [],
            videoUrl: '',
            location: '',
            tags: '',
            featured: false,
            startDate: '',
            endDate: ''
        });
        setShowModal(true);
    };

    const handleDelete = async (article) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${article.title}"?`)) {
            try {
                setIsLoading(true);
                await onDelete(article.id);
            } catch (error) {
                console.error('Delete error:', error);
                setError('Có lỗi xảy ra khi xóa bài viết: ' + error.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCloseModal = () => {
        setFormData({
            title: '',
            content: '',
            images: [],
            videoUrl: '',
            location: '',
            tags: '',
            featured: false,
            startDate: '',
            endDate: ''
        });
        setEditingArticle(null);
        setShowModal(false);
        setError('');
    };

    return (
        <div className="admin-articles-clean">
            {/* Header */}
            <div className="admin-header-clean">
                <h1>Quản lý bài viết</h1>
                <button
                    className="btn-primary"
                    onClick={handleAdd}
                    disabled={isLoading}
                >
                    Thêm bài viết mới
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError('')}>✕</button>
                </div>
            )}

            {/* Filters */}
            <div className="filters-clean">
                <div className="search-box">
                    <input
                        type="text"
                        className="search-clean"
                        placeholder="Tìm kiếm bài viết..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="sort-clean"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="date">Mới nhất</option>
                    <option value="title">Tên A-Z</option>
                    <option value="views">Lượt xem</option>
                </select>
            </div>

            {/* Articles Table */}
            {filteredAndSortedArticles.length === 0 ? (
                <div className="empty-state-clean">
                    <h3>Chưa có bài viết nào</h3>
                    <p>Thêm bài viết đầu tiên để bắt đầu!</p>
                    <button
                        className="btn-primary"
                        onClick={handleAdd}
                    >
                        Thêm bài viết đầu tiên
                    </button>
                </div>
            ) : (
                <div className="table-container-clean">
                    <table className="table-clean">
                        <thead>
                            <tr>
                                <th>Bài viết</th>
                                <th>Địa điểm</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedArticles.map(article => (
                                <tr key={article.id}>
                                    <td>
                                        <div className="article-title-cell">
                                            <div className="thumbnail-cell">
                                                <img
                                                    src={
                                                        (() => {
                                                            if (Array.isArray(article.image) && article.image.length > 0) {
                                                                return article.image[0];
                                                            }
                                                            if (typeof article.image === 'string' && article.image) {
                                                                return article.image;
                                                            }
                                                            return '/placeholder.jpg';
                                                        })()
                                                    }
                                                    alt={article.title}
                                                    className="article-thumbnail"
                                                />
                                            </div>
                                            <div>
                                                <strong>{article.title}</strong>
                                                <p>{article.excerpt}</p>
                                                {article.featured && <span className="featured-badge">Nổi bật</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{article.location}</td>
                                    <td>{new Date(article.date).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <div className="actions-clean">
                                            <button
                                                onClick={() => handleEdit(article)}
                                                className="btn-edit"
                                                disabled={isLoading}
                                                title="Chỉnh sửa"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(article)}
                                                className="btn-delete"
                                                disabled={isLoading}
                                                title="Xóa"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingArticle ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</h3>
                            <button
                                className="modal-close"
                                onClick={handleCloseModal}
                                disabled={isLoading}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-grid-modal">
                                {/* Title */}
                                <div className="form-group">
                                    <label>
                                        Tiêu đề <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tiêu đề bài viết..."
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* ✅ CHỈ HIỂN THỊ: 2 Date pickers */}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            Ngày bắt đầu <span className="required">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            Ngày kết thúc <span className="required">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* ✅ THÊM: Preview mô tả sẽ được tạo (optional) */}
                                {formData.startDate && formData.endDate && (
                                    <div className="form-group">
                                        <label>Mô tả về ngày bắt đầu và ngày kết thúc sự kiện:</label>
                                        <div className="auto-description-preview">
                                            {(() => {
                                                const startDate = new Date(formData.startDate);
                                                const endDate = new Date(formData.endDate);

                                                const formatDate = (date) => {
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const year = date.getFullYear();
                                                    return `${day}/${month}/${year}`;
                                                };

                                                return startDate.getTime() === endDate.getTime()
                                                    ? `📅 Ngày: ${formatDate(startDate)}`
                                                    : `📅 Ngày: ${formatDate(startDate)} - ${formatDate(endDate)}`;
                                            })()}
                                        </div>
                                        <small className="form-hint">
                                            💡 Mô tả này sẽ tự động được tạo và gửi lên server
                                        </small>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="form-group">
                                    <label>
                                        Nội dung chi tiết <span className="required">*</span>
                                    </label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        placeholder="Nhập nội dung chi tiết về lễ hội..."
                                        rows="8"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Images */}
                                <div className="form-group">
                                    <MultiImageUpload
                                        images={formData.images}
                                        onImagesChange={handleImagesChange}
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Location and Tags Row */}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Địa điểm tổ chức</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="Tỉnh/thành phố..."
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Thẻ tags</label>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleInputChange}
                                            placeholder="tag1, tag2, tag3..."
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Featured Checkbox */}

                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={isLoading}
                                    className="btn-secondary"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            Đang lưu...
                                        </>
                                    ) : (
                                        editingArticle ? '💾 Cập nhật' : '✨ Thêm mới'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminArticles; 