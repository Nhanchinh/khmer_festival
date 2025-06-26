import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

const ArticleDetail = ({ articles, incrementViews }) => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({
        name: '',
        email: '',
        content: '',
        rating: 5
    });
    const viewCountedRef = useRef(new Set());

    // Load comments from localStorage
    useEffect(() => {
        const savedComments = localStorage.getItem(`comments_${id}`);
        if (savedComments) {
            setComments(JSON.parse(savedComments));
        } else {
            const mockComments = [
                {
                    id: 1,
                    name: "Nguyễn Văn A",
                    content: "Bài viết rất hay và bổ ích! Cảm ơn admin đã chia sẻ về văn hóa Khmer.",
                    rating: 5,
                    date: "2024-01-15",
                    avatar: "🧑‍💼"
                },
                {
                    id: 2,
                    name: "Trần Thị B",
                    content: "Mình đã tham gia lễ hội này rồi, thực sự rất ý nghĩa và vui vẻ. Recommend mọi người nên đi.",
                    rating: 5,
                    date: "2024-01-10",
                    avatar: "👩‍🎓"
                },
                {
                    id: 3,
                    name: "Lê Minh C",
                    content: "Thông tin rất chi tiết và đầy đủ. Giúp mình hiểu thêm về văn hóa dân tộc Khmer.",
                    rating: 4,
                    date: "2024-01-08",
                    avatar: "👨‍💻"
                }
            ];
            setComments(mockComments);
            localStorage.setItem(`comments_${id}`, JSON.stringify(mockComments));
        }
    }, [id]);

    useEffect(() => {
        const foundArticle = articles.find(a => a.id === parseInt(id));
        if (foundArticle) {
            setArticle(foundArticle);

            const articleId = foundArticle.id;
            if (!viewCountedRef.current.has(articleId)) {
                incrementViews(articleId);
                viewCountedRef.current.add(articleId);
            }

            const related = articles
                .filter(a => a.category === foundArticle.category && a.id !== foundArticle.id)
                .slice(0, 3);
            setRelatedArticles(related);
        }
    }, [id, articles]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();

        if (!newComment.name.trim() || !newComment.content.trim()) {
            alert('Vui lòng điền đầy đủ tên và nội dung bình luận!');
            return;
        }

        const avatars = ["🧑‍💼", "👩‍🎓", "👨‍💻", "👩‍💼", "🧑‍🎓", "👨‍🎨", "👩‍🔬", "🧑‍🍳"];
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

        const comment = {
            id: Date.now(),
            name: newComment.name.trim(),
            email: newComment.email.trim(),
            content: newComment.content.trim(),
            rating: newComment.rating,
            date: new Date().toISOString().split('T')[0],
            avatar: randomAvatar
        };

        const updatedComments = [comment, ...comments];
        setComments(updatedComments);
        localStorage.setItem(`comments_${id}`, JSON.stringify(updatedComments));

        setNewComment({
            name: '',
            email: '',
            content: '',
            rating: 5
        });

        alert('🎉 Cảm ơn bạn đã chia sẻ! Bình luận đã được thêm thành công.');
    };

    const averageRating = comments.length > 0
        ? (comments.reduce((sum, comment) => sum + comment.rating, 0) / comments.length).toFixed(1)
        : 0;

    if (!article) {
        return (
            <div className="article-detail-balanced">
                <div className="error-state">
                    <div className="error-icon">🔍</div>
                    <h2>Không tìm thấy bài viết</h2>
                    <p>Bài viết bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
                    <Link to="/" className="btn-balanced primary">← Về trang chủ</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="article-detail-balanced">
            {/* Breadcrumb với accent */}
            <nav className="breadcrumb-balanced">
                <Link to="/">🏠 Trang chủ</Link>
                <span className="separator">→</span>
                <span className="current">{article.title}</span>
            </nav>

            {/* Article */}
            <article className="article-main-balanced">
                {/* Header với gradient */}
                <header className="article-header-balanced">
                    <div className="category-badge">{article.category}</div>
                    <h1 className="article-title-balanced">{article.title}</h1>

                    <div className="article-meta-balanced">
                        <div className="meta-item">
                            <span className="icon">📍</span>
                            <span>{article.location}</span>
                        </div>
                        <div className="meta-item">
                            <span className="icon">📅</span>
                            <span>{new Date(article.date).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="meta-item">
                            <span className="icon">👁️</span>
                            <span>{article.views.toLocaleString('vi-VN')} lượt xem</span>
                        </div>
                        <div className="meta-item special">
                            <span className="icon">⭐</span>
                            <span>{averageRating}/5 ({comments.length} đánh giá)</span>
                        </div>
                    </div>

                    <div className="tags-balanced">
                        {article.tags.map(tag => (
                            <span key={tag} className="tag-balanced">#{tag}</span>
                        ))}
                    </div>
                </header>

                {/* Image với overlay */}
                <div className="article-image-balanced">
                    <img src={article.image} alt={article.title} />
                    <div className="image-overlay"></div>
                </div>

                {/* Content */}
                <div className="article-content-balanced">
                    {article.content.split('\n').map((paragraph, index) => (
                        paragraph.trim() && (
                            <p key={index}>{paragraph}</p>
                        )
                    ))}
                </div>

                {/* Share với gradient background */}
                <div className="share-balanced">
                    <div className="share-content">
                        <h3>📢 Chia sẻ bài viết</h3>
                        <p>Hãy lan tỏa văn hóa Khmer đến nhiều người hơn!</p>
                        <div className="share-buttons-balanced">
                            <button
                                className="btn-balanced secondary"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('✅ Đã sao chép link!');
                                }}
                            >
                                📋 Sao chép link
                            </button>
                            <button
                                className="btn-balanced secondary"
                                onClick={() => window.print()}
                            >
                                🖨️ In bài viết
                            </button>
                            <button
                                className="btn-balanced secondary"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: article.title,
                                            text: article.excerpt,
                                            url: window.location.href
                                        });
                                    }
                                }}
                            >
                                📤 Chia sẻ
                            </button>
                        </div>
                    </div>
                </div>
            </article>

            {/* Comments với accent colors */}
            <section className="comments-balanced">
                <div className="comments-header-balanced">
                    <h2>💬 Bình luận & Đánh giá</h2>
                    <div className="rating-summary-balanced">
                        <div className="rating-score-balanced">{averageRating}</div>
                        <div className="stars-balanced">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={star <= Math.round(averageRating) ? 'star active' : 'star'}>
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className="rating-text">{comments.length} đánh giá từ độc giả</span>
                    </div>
                </div>

                {/* Comment Form với màu sắc */}
                <div className="comment-form-balanced">
                    <h3>✍️ Chia sẻ cảm nhận của bạn</h3>
                    <form onSubmit={handleCommentSubmit}>
                        <div className="form-grid-balanced">
                            <input
                                type="text"
                                placeholder="Tên của bạn *"
                                value={newComment.name}
                                onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email (không bắt buộc)"
                                value={newComment.email}
                                onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                            />
                        </div>

                        <div className="rating-input-balanced">
                            <span>Đánh giá của bạn:</span>
                            <div className="stars-input">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={star <= newComment.rating ? 'star-btn active' : 'star-btn'}
                                        onClick={() => setNewComment({ ...newComment, rating: star })}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <span className="rating-value">({newComment.rating}/5)</span>
                        </div>

                        <textarea
                            placeholder="Chia sẻ cảm nhận của bạn về bài viết này..."
                            value={newComment.content}
                            onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                            rows="4"
                            required
                        />

                        <button type="submit" className="btn-balanced primary">
                            📝 Gửi bình luận
                        </button>
                    </form>
                </div>

                {/* Comments List với avatars */}
                <div className="comments-list-balanced">
                    {comments.length === 0 ? (
                        <div className="no-comments-balanced">
                            <div className="empty-illustration">💬</div>
                            <h3>Chưa có bình luận nào</h3>
                            <p>Hãy là người đầu tiên chia sẻ cảm nhận về bài viết này!</p>
                        </div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="comment-balanced">
                                <div className="comment-avatar-balanced">
                                    {comment.avatar}
                                </div>
                                <div className="comment-body-balanced">
                                    <div className="comment-header-balanced">
                                        <div className="author-info">
                                            <strong className="author-name">{comment.name}</strong>
                                            <div className="comment-rating-balanced">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span key={star} className={star <= comment.rating ? 'star active' : 'star'}>
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <span className="comment-date-balanced">
                                            {new Date(comment.date).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <p className="comment-content-balanced">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Related Articles với hover effects */}
            {relatedArticles.length > 0 && (
                <section className="related-balanced">
                    <h2>📖 Bài viết liên quan</h2>
                    <div className="related-grid-balanced">
                        {relatedArticles.map(relatedArticle => (
                            <Link
                                to={`/article/${relatedArticle.id}`}
                                key={relatedArticle.id}
                                className="related-card-balanced"
                            >
                                <div className="related-image-balanced">
                                    <img src={relatedArticle.image} alt={relatedArticle.title} />
                                    <div className="related-overlay"></div>
                                </div>
                                <div className="related-content-balanced">
                                    <h3>{relatedArticle.title}</h3>
                                    <p className="related-location">📍 {relatedArticle.location}</p>
                                    <div className="related-meta-balanced">
                                        <span>👁️ {relatedArticle.views.toLocaleString('vi-VN')}</span>
                                        <span>📅 {new Date(relatedArticle.date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Navigation */}
            <div className="article-nav-balanced">
                <Link to="/" className="btn-balanced outline">← Về trang chủ</Link>
            </div>
        </div>
    );
};

export default ArticleDetail; 