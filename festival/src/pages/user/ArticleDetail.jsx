import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { commentsAPI, authAPI, articlesAPI } from '../../utils/api';
import './ArticleDetail.css';
import GoogleMap from '../../components/GoogleMap';

// Image Gallery Component
const ImageGallery = ({ images, title }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const imageArray = Array.isArray(images) ? images : (images ? [images] : []);

    if (imageArray.length === 0) {
        return (
            <div className="article-detail-image-gallery">
                <img src="/placeholder.jpg" alt={title} className="article-detail-image" />
            </div>
        );
    }

    const openModal = (index) => {
        setCurrentImageIndex(index);
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % imageArray.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + imageArray.length) % imageArray.length);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showModal) return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showModal]);

    const getGridLayout = (count) => {
        if (count === 1) return 'single';
        if (count === 2) return 'two';
        if (count === 3) return 'three';
        if (count === 4) return 'four';
        return 'many';
    };

    const gridLayout = getGridLayout(imageArray.length);

    return (
        <>
            <div className="article-detail-image-gallery">
                <div className={`article-detail-image-grid ${gridLayout}`}>
                    {imageArray.slice(0, 4).map((image, index) => (
                        <div
                            key={index}
                            className={`article-detail-grid-image ${index === 0 ? 'main' : ''}`}
                            onClick={() => openModal(index)}
                        >
                            <img src={image} alt={`${title} - Ảnh ${index + 1}`} />

                            {index === 3 && imageArray.length > 4 && (
                                <div className="article-detail-more-overlay">
                                    <span>+{imageArray.length - 4}</span>
                                    <span>ảnh khác</span>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="article-detail-image-count-badge">
                        📷 {imageArray.length} ảnh
                    </div>

                    <div className="article-detail-gallery-hint">
                        🔍 Click để xem gallery
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="article-detail-modal-overlay" onClick={closeModal}>
                    <div className="article-detail-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="article-detail-modal-close" onClick={closeModal}>✕</button>

                        {imageArray.length > 1 && (
                            <>
                                <button className="article-detail-modal-nav prev" onClick={prevImage}>‹</button>
                                <button className="article-detail-modal-nav next" onClick={nextImage}>›</button>
                            </>
                        )}

                        <img
                            src={imageArray[currentImageIndex]}
                            alt={`${title} - Ảnh ${currentImageIndex + 1}`}
                            className="article-detail-modal-image"
                        />

                        <div className="article-detail-modal-footer">
                            <div className="article-detail-image-counter">
                                {currentImageIndex + 1} / {imageArray.length}
                            </div>

                            {imageArray.length > 1 && (
                                <div className="article-detail-modal-thumbnails">
                                    {imageArray.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            className={`article-detail-modal-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Thêm helper function để format date an toàn
const formatCommentDate = (dateString) => {
    if (!dateString) return 'Vừa xong';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Vừa xong';

    return date.toLocaleDateString('vi-VN');
};

// ✅ THÊM: Helper function để parse ngày từ description
const parseEventDates = (description) => {
    if (!description) return { hasDate: false };

    const datePattern = /Ngày:\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})/;
    const singleDatePattern = /Ngày:\s*(\d{1,2}\/\d{1,2}\/\d{4})/;

    const dateMatch = description.match(datePattern);
    if (dateMatch) {
        return {
            startDate: dateMatch[1],
            endDate: dateMatch[2],
            hasDate: true,
            isRange: true
        };
    }

    const singleMatch = description.match(singleDatePattern);
    if (singleMatch) {
        return {
            startDate: singleMatch[1],
            endDate: singleMatch[1],
            hasDate: true,
            isRange: false
        };
    }

    return { hasDate: false };
};

// ✅ THÊM: Helper function để format date range
const formatDateRange = (startDate, endDate, isRange) => {
    if (!startDate) return null;

    if (isRange && startDate !== endDate) {
        return `${startDate} - ${endDate}`;
    } else {
        return startDate;
    }
};

const ArticleDetail = ({ articles, incrementViews }) => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [commentsPerPage] = useState(5);
    const [newComment, setNewComment] = useState({
        name: '',
        email: '',
        content: '',
        rating: 5
    });
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const viewCountedRef = useRef(new Set());
    const currentViewsRef = useRef(null);

    // ✅ THÊM: Scroll to top khi vào trang chi tiết
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]); // Chạy khi id thay đổi

    const handleIncrementView = useCallback(async (articleSlug, articleId) => {
        const trackingKey = articleSlug || articleId;

        if (!trackingKey || viewCountedRef.current.has(trackingKey)) {
            console.log('👁️ View already counted for:', trackingKey);
            return;
        }

        console.log('👁️ Incrementing view for:', trackingKey);
        viewCountedRef.current.add(trackingKey);

        try {
            const currentViews = article?.views || 0;
            currentViewsRef.current = currentViews + 1;

            setArticle(prev => prev ? {
                ...prev,
                views: currentViews + 1
            } : null);

            await articlesAPI.incrementView(articleSlug || articleId);
            console.log('✅ Backend view incremented successfully');

        } catch (error) {
            console.error('❌ Failed to increment view:', error);
            setArticle(prev => prev ? {
                ...prev,
                views: currentViews
            } : null);
            viewCountedRef.current.delete(trackingKey);
            currentViewsRef.current = null;
        }
    }, [article?.views]);

    useEffect(() => {
        console.log('📄 ArticleDetail useEffect - ID:', id, 'Articles length:', articles?.length);

        if (!articles || articles.length === 0) {
            console.log('⏳ Articles not loaded yet, waiting...');
            return;
        }

        const foundArticle = articles.find(a => a.id === id) ||
            articles.find(a => a.id === parseInt(id)) ||
            articles.find(a => a.slug === id) ||
            articles.find(a => String(a.id) === String(id));

        if (foundArticle) {
            console.log('✅ Found article:', foundArticle.title, 'Views:', foundArticle.views);

            setArticle(prev => {
                if (!prev) {
                    return foundArticle;
                }

                const newViews = Math.max(foundArticle.views, currentViewsRef.current || 0, prev.views || 0);
                return {
                    ...foundArticle,
                    views: newViews
                };
            });

            if (foundArticle.comments && foundArticle.comments.length > 0) {
                setComments(foundArticle.comments);
            } else {
                loadCommentsFromAPI(foundArticle.slug || foundArticle.id);
            }

            const slugToUse = foundArticle.slug || foundArticle.id;
            if (slugToUse) {
                handleIncrementView(slugToUse, foundArticle.id);
            }

            if (incrementViews && !viewCountedRef.current.has('local_' + foundArticle.id)) {
                incrementViews(foundArticle.id);
                viewCountedRef.current.add('local_' + foundArticle.id);
            }
        } else {
            console.log('❌ Article not found with ID:', id);
            setArticle(null);
        }
    }, [id, articles, handleIncrementView, incrementViews]);

    useEffect(() => {
        return () => {
            console.log('🧹 Cleaning up ArticleDetail');
        };
    }, []);

    const loadCommentsFromAPI = async (slug) => {
        if (!slug) return;

        setIsLoadingComments(true);
        try {
            const response = await commentsAPI.getByArticle(slug);
            if (response && response.comments) {
                const processedComments = response.comments.map(comment => ({
                    id: comment.id,
                    author: comment.author?.username || comment.author || 'Khách',
                    content: comment.body,
                    rating: comment.rate || 5,
                    date: comment.createdAt || new Date().toISOString(),
                    email: comment.author?.email || ''
                }));
                setComments(processedComments);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            setComments([]);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        if (!newComment.name.trim() || !newComment.content.trim()) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        setIsSubmittingComment(true);

        try {
            const response = await commentsAPI.create(article.slug, {
                body: newComment.content.trim(),
                rate: newComment.rating
            });

            if (response && response.comment) {
                const processedComment = {
                    id: response.comment.id,
                    author: newComment.name.trim(),
                    content: response.comment.body,
                    rating: response.comment.rate || newComment.rating,
                    date: response.comment.createdAt || new Date().toISOString(),
                    email: newComment.email
                };

                setComments(prev => [processedComment, ...prev]);
                setNewComment({ name: '', email: '', content: '', rating: 5 });
                setCurrentPage(1);
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Không thể gửi bình luận. Vui lòng thử lại!');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

        try {
            await commentsAPI.delete(article.slug, commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Không thể xóa bình luận!');
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (!article && articles && articles.length > 0) {
        return (
            <div className="article-detail-container">
                <div className="article-detail-main">
                    <div className="article-detail-card">
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <h2>😕 Không tìm thấy bài viết</h2>
                            <p>Bài viết với ID <strong>{id}</strong> không tồn tại hoặc đã bị xóa.</p>
                            <Link to="/" style={{ color: '#667eea', textDecoration: 'none' }}>
                                🏠 Quay về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="article-detail-container">
                <div className="article-detail-main">
                    <div className="article-detail-card">
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <div className="loading-spinner"></div>
                            <p>Đang tải bài viết...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ THÊM: Parse ngày bắt đầu và kết thúc từ description
    const eventDates = parseEventDates(article.excerpt || article.description || '');

    const averageRating = comments.length > 0
        ? comments.reduce((sum, comment) => sum + (Number(comment.rating) || 5), 0) / comments.length
        : 0;

    const indexOfLastComment = currentPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);
    const totalPages = Math.ceil(comments.length / commentsPerPage);

    return (
        <div className="article-detail-container">
            <div className="article-detail-main">
                <article className="article-detail-card">
                    <div className="article-detail-breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        <span className="article-detail-separator">/</span>
                        <span className="article-detail-current">{article.title}</span>
                    </div>

                    <header className="article-detail-header">
                        <h1 className="article-detail-title">{article.title}</h1>

                        <div className="article-detail-meta">
                            {/* ✅ Dòng 1: Ngày đăng, Lượt xem, Tags */}
                            <div className="article-detail-meta-row-1">
                                <div className="article-detail-meta-basic">
                                    <div className="article-detail-meta-item">
                                        <span className="meta-icon">📅</span>
                                        <span>Đăng: {new Date(article.date).toLocaleDateString('vi-VN')}</span>
                                    </div>

                                    <div className="article-detail-meta-item">
                                        <span className="meta-icon">👁️</span>
                                        <span>{(article.views || 0).toLocaleString('vi-VN')} lượt xem</span>
                                    </div>
                                </div>

                                {/* Tags bên phải */}
                                {article.tags && article.tags.length > 0 && (
                                    <div className="article-detail-tags">
                                        {article.tags.map(tag => (
                                            <span key={tag} className="article-detail-tag">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ✅ Dòng 2: Địa điểm và Thời gian diễn ra */}
                            <div className="article-detail-meta-row-2">
                                <div className="article-detail-meta-item">
                                    <span className="meta-icon">🗺️</span>
                                    <span>{article.location}</span>
                                </div>

                                {eventDates.hasDate && (
                                    <div className="article-detail-meta-item event-dates">
                                        <span className="meta-icon">🗓️</span>
                                        <span>
                                            Diễn ra: {formatDateRange(eventDates.startDate, eventDates.endDate, eventDates.isRange)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    <ImageGallery images={article.image} title={article.title} />

                    <div className="article-detail-content">
                        {article.content.split('\n').map((paragraph, index) => (
                            paragraph.trim() && <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    <GoogleMap location={article.location} title={article.title} />

                    <section className="article-detail-comments">
                        <div className="article-detail-comments-header">
                            <h2 className="article-detail-comments-title">💬 Bình luận ({comments.length})</h2>

                            {comments.length > 0 && (
                                <div className="article-detail-rating-summary">
                                    <div className="article-detail-rating-score">
                                        {averageRating.toFixed(1)}
                                    </div>
                                    <div className="article-detail-stars">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span
                                                key={star}
                                                className={`article-detail-star ${star <= averageRating ? 'active' : ''}`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                                        {comments.length} đánh giá
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleCommentSubmit} className="article-detail-comment-form">
                            <h3>Để lại bình luận của bạn</h3>

                            <div className="article-detail-form-grid">
                                <input
                                    type="text"
                                    placeholder="Tên của bạn *"
                                    value={newComment.name}
                                    onChange={(e) => setNewComment(prev => ({ ...prev, name: e.target.value }))}
                                    className="article-detail-form-input"
                                    required
                                />

                                <input
                                    type="email"
                                    placeholder="Email (không bắt buộc)"
                                    value={newComment.email}
                                    onChange={(e) => setNewComment(prev => ({ ...prev, email: e.target.value }))}
                                    className="article-detail-form-input"
                                />

                                <div className="article-detail-rating-input">
                                    <label>Đánh giá:</label>
                                    <div className="article-detail-stars-input">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={`article-detail-star-btn ${star <= newComment.rating ? 'active' : ''}`}
                                                onClick={() => setNewComment(prev => ({ ...prev, rating: star }))}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <span className="article-detail-rating-value">({newComment.rating}/5)</span>
                                </div>

                                <textarea
                                    placeholder="Nội dung bình luận *"
                                    value={newComment.content}
                                    onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                                    className="article-detail-form-textarea"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="article-detail-btn"
                                disabled={isSubmittingComment}
                            >
                                {isSubmittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                            </button>
                        </form>

                        {isLoadingComments ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                Đang tải bình luận...
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="article-detail-no-comments">
                                <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                            </div>
                        ) : (
                            <>
                                <div className="article-detail-comments-list">
                                    {currentComments.map(comment => (
                                        <div key={comment.id} className="article-detail-comment">
                                            <div className="article-detail-comment-header">
                                                <div>
                                                    <div className="article-detail-comment-author">{comment.author}</div>
                                                    <div className="article-detail-comment-rating">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <span
                                                                key={star}
                                                                className={`article-detail-star ${star <= (Number(comment.rating) || 5) ? 'active' : ''}`}
                                                            >
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="article-detail-comment-date">
                                                    {formatCommentDate(comment.date)}
                                                </span>
                                            </div>
                                            <div className="article-detail-comment-content">
                                                {comment.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="article-detail-pagination">
                                        <button
                                            className="article-detail-page-btn"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            ‹ Trước
                                        </button>

                                        {[...Array(totalPages)].map((_, index) => (
                                            <button
                                                key={index + 1}
                                                className={`article-detail-page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                                onClick={() => handlePageChange(index + 1)}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}

                                        <button
                                            className="article-detail-page-btn"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Sau ›
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </article>
            </div>
        </div>
    );
};

export default ArticleDetail; 