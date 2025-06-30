// API base configuration
// const API_BASE_URL = 'http://localhost:5000';

const API_BASE_URL = 'https://henry-mapping-liquid-spend.trycloudflare.com';
// API helper function
const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Sending request with token:', token.substring(0, 20) + '...');
    } else {
        console.log('⚠️ No token found in localStorage');
    }

    console.log('📡 API Call:', {
        url,
        method: options.method || 'GET',
        headers: config.headers,
        hasBody: !!options.body
    });

    try {
        const response = await fetch(url, config);

        console.log('📥 Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ API Error:', {
                status: response.status,
                statusText: response.statusText,
                errorData
            });
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Handle empty responses (like DELETE)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('✅ Response data:', data);
            return data;
        }

        return null;
    } catch (error) {
        console.error('💥 API call failed:', error);
        throw error;
    }
};

// Auth API calls
export const authAPI = {
    login: async (email, password) => {
        console.log('🔐 Attempting login with:', { email });

        const response = await apiCall('/users/login', {
            method: 'POST',
            body: JSON.stringify({
                user: {
                    email,
                    password
                }
            }),
        });

        console.log('🎉 Login response:', response);

        // Store token for future requests
        if (response.user?.token) {
            localStorage.setItem('authToken', response.user.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            console.log('💾 Stored token:', response.user.token.substring(0, 20) + '...');
            console.log('💾 Stored user:', response.user);
        }

        return response;
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('adminAuth');
        console.log('👋 Logged out - cleared localStorage');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('currentUser');
        const user = userStr ? JSON.parse(userStr) : null;
        console.log('👤 Current user:', user);
        return user;
    },

    isAuthenticated: () => {
        const hasToken = !!localStorage.getItem('authToken');
        console.log('🔍 Is authenticated:', hasToken);
        return hasToken;
    },

    // Debug function to check current auth state
    debugAuth: () => {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        const adminAuth = localStorage.getItem('adminAuth');

        console.log('🔍 Auth Debug:', {
            hasToken: !!token,
            token: token ? token.substring(0, 20) + '...' : null,
            hasUser: !!user,
            user: user ? JSON.parse(user) : null,
            adminAuth
        });

        return {
            hasToken: !!token,
            token,
            user: user ? JSON.parse(user) : null,
            adminAuth
        };
    }
};

// Articles API calls
export const articlesAPI = {
    // Get all articles - GET /articles
    getAll: async (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.tag) searchParams.append('tag', params.tag);
        if (params.author) searchParams.append('author', params.author);
        if (params.favorited) searchParams.append('favorited', params.favorited);
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.offset) searchParams.append('offset', params.offset.toString());

        const queryString = searchParams.toString();
        const endpoint = `/articles${queryString ? `?${queryString}` : ''}`;

        console.log('📄 Fetching articles from:', endpoint);
        const response = await apiCall(endpoint);
        return response;
    },

    // Get single article by slug - GET /articles/{slug}
    getBySlug: async (slug) => {
        console.log('📄 Fetching article by slug:', slug);
        const response = await apiCall(`/articles/${slug}`);
        return response;
    },

    // Create new article - POST /articles
    create: async (articleData) => {
        console.log('🔍 Creating article with data:', articleData);
        const token = localStorage.getItem('authToken');

        if (!token) {
            throw new Error('Vui lòng đăng nhập để tạo bài viết');
        }

        // ✅ SỬA: Đúng format mà backend expect
        const requestBody = {
            article: {
                title: articleData.title,
                description: articleData.description,
                body: articleData.body,
                image: articleData.image || [], // 👈 Array of image URLs
                tagList: articleData.tagList || [],
                videoUrl: articleData.videoUrl || null,
                mapLocation: articleData.mapLocation || null
            }
        };

        console.log('🔍 Sending request body:', requestBody);

        const response = await fetch(`${API_BASE_URL}/articles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // 👈 Bắt buộc có token
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('🔍 API Error:', errorData);
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    },

    // Update article - PUT /articles/{slug}
    update: async (slug, articleData) => {
        console.log('🔍 Updating article:', slug, articleData);
        const token = localStorage.getItem('authToken');

        if (!token) {
            throw new Error('Vui lòng đăng nhập để cập nhật bài viết');
        }

        // ✅ SỬA: Đúng format cho update
        const requestBody = {
            article: {
                title: articleData.title,
                description: articleData.description,
                body: articleData.body,
                image: articleData.image || [],
                tagList: articleData.tagList || [],
                videoUrl: articleData.videoUrl || null,
                mapLocation: articleData.mapLocation || null
            }
        };

        console.log('🔍 Sending update request body:', requestBody);

        const response = await fetch(`${API_BASE_URL}/articles/${slug}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('🔍 Update API Error:', errorData);
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    },

    // Delete article - DELETE /articles/{slug}
    delete: async (slug) => {
        console.log('🗑️ Deleting article:', slug);

        // Debug auth state before deleting article
        const authState = authAPI.debugAuth();
        if (!authState.hasToken) {
            throw new Error('Không có token authentication. Vui lòng đăng nhập lại.');
        }

        await apiCall(`/articles/${slug}`, {
            method: 'DELETE',
        });

        console.log('✅ Article deleted successfully');
    },

    // ✅ API tăng view - ĐƠN GIẢN VÀ RÕ RÀNG
    incrementView: async (slug) => {
        console.log('👁️ [API] POST /articles/' + slug + '/view');

        try {
            const response = await apiCall(`/articles/${slug}/view`, {
                method: 'POST',
            });
            console.log('✅ [API] View incremented successfully');
            return response;
        } catch (error) {
            console.error('❌ [API] Failed to increment view:', error.message);
            throw error;
        }
    }
};

// Comments API calls
export const commentsAPI = {
    // Get comments for article - GET /articles/{slug}/comments
    getByArticle: async (slug) => {
        console.log('💬 Fetching comments for article:', slug);
        const response = await apiCall(`/articles/${slug}/comments`);
        return response;
    },

    // Create comment with rating - POST /articles/{slug}/comments
    create: async (slug, commentData) => {
        console.log('💬 Creating comment for article:', slug, commentData);

        const response = await apiCall(`/articles/${slug}/comments`, {
            method: 'POST',
            body: JSON.stringify({
                comment: {
                    body: commentData.body || commentData.content,
                    rate: commentData.rating || commentData.rate || 5 // Gửi rating lên backend
                }
            }),
        });

        console.log('✅ Comment created:', response);
        return response;
    },

    // Delete comment - DELETE /articles/{slug}/comments/{id}
    delete: async (slug, commentId) => {
        console.log('🗑️ Deleting comment:', slug, commentId);
        await apiCall(`/articles/${slug}/comments/${commentId}`, {
            method: 'DELETE',
        });
        console.log('✅ Comment deleted successfully');
    }
};

// Helper function to convert API article to frontend format
export const convertApiArticleToFrontend = (apiArticle) => {
    console.log('🔍 Converting API article:', apiArticle);

    return {
        id: apiArticle.slug || apiArticle.id,
        slug: apiArticle.slug,
        title: apiArticle.title || 'Không có tiêu đề',
        excerpt: apiArticle.description || 'Không có mô tả',
        content: apiArticle.body || '',

        // ✅ SỬA: Convert images thông qua imageAPI.getImageUrls
        image: apiArticle.image && apiArticle.image.length > 0
            ? imageAPI.getImageUrls(Array.isArray(apiArticle.image) ? apiArticle.image : [apiArticle.image])
            : ['/placeholder.jpg'],

        videoUrl: apiArticle.videoUrl,
        location: apiArticle.mapLocation || 'Chưa xác định',
        date: apiArticle.createdAt || new Date().toISOString(),
        tags: apiArticle.tagList || [],
        featured: apiArticle.favorited || false,
        views: apiArticle.views || 0,
        favoritesCount: apiArticle.favoritesCount || 0,

        author: apiArticle.author ? {
            username: apiArticle.author.username,
            email: apiArticle.author.email,
            bio: apiArticle.author.bio,
            image: apiArticle.author.image
        } : null,

        comments: apiArticle.comments ? apiArticle.comments.map(comment => ({
            id: comment.id || comment.commentId,
            name: comment.author || 'Anonymous',
            content: comment.body || '',
            date: comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            rating: comment.rate || comment.Rate || 5,
            avatar: getRandomAvatar()
        })) : []
    };
};

// Helper function to get random avatar
const getRandomAvatar = () => {
    const avatars = ["🧑‍💼", "👩‍🎓", "👨‍💻", "👩‍💼", "🧑‍🎓", "👨‍🎨", "👩‍🔬", "🧑‍🍳"];
    return avatars[Math.floor(Math.random() * avatars.length)];
};

// Helper function to generate slug from title
export const generateSlug = (title) => {
    if (!title) return '';

    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single
};

// ✅ SỬA: Image upload API - chỉ return filename
export const imageAPI = {
    upload: async (file) => {
        console.log('🔍 Uploading image:', file.name);

        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_BASE_URL}/api/images/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Upload failed');
        }

        const result = await response.json();

        // ✅ THAY ĐỔI: Chỉ return filename thay vì full URL
        console.log('✅ Image uploaded, filename:', result.fileName);
        return result.fileName; // ✅ CHỈ RETURN FILENAME
    },

    // ✅ THÊM: Helper để convert filename thành full URL
    getImageUrl: (fileName) => {
        if (!fileName) return '/placeholder.jpg';

        // ✅ Nếu đã là full URL (data cũ) → giữ nguyên
        if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
            return fileName;
        }

        // ✅ Nếu là filename → ghép với base URL hiện tại
        return `${API_BASE_URL}/api/images/${fileName}`;
    },

    // ✅ THÊM: Batch convert nhiều filenames
    getImageUrls: (fileNames) => {
        if (!Array.isArray(fileNames)) return ['/placeholder.jpg'];
        return fileNames.map(fileName => imageAPI.getImageUrl(fileName));
    }
};

// ✅ EXPORT base URL để other components sử dụng
export { API_BASE_URL };