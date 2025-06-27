import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import API utilities
import { articlesAPI, convertApiArticleToFrontend, authAPI } from './utils/api';

// Import components
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';
import HomePage from './pages/user/HomePage';
import ArticleDetail from './pages/user/ArticleDetail';
import SearchResults from './pages/user/SearchResults';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminArticles from './pages/admin/AdminArticles';
import AdminStats from './pages/admin/AdminStats';

function App() {
  const [articles, setArticles] = useState([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load articles from API
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await articlesAPI.getAll({ limit: 100 });

        if (response && response.articles) {
          const convertedArticles = response.articles.map(convertApiArticleToFrontend);
          setArticles(convertedArticles);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
      }
    };

    loadArticles();
  }, []);

  useEffect(() => {
    // Check if admin is already logged in
    const adminAuth = localStorage.getItem('adminAuth');
    const authToken = localStorage.getItem('authToken');

    if (adminAuth === 'true' && authToken) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const addArticle = async (newArticle) => {
    try {
      const response = await articlesAPI.create(newArticle);

      if (response && response.article) {
        const convertedArticle = convertApiArticleToFrontend(response.article);
        if (convertedArticle) {
          setArticles(prev => [convertedArticle, ...prev]);
          return convertedArticle;
        }
      }
      throw new Error('Không nhận được phản hồi hợp lệ từ server');
    } catch (error) {
      throw new Error(`Không thể tạo bài viết: ${error.message}`);
    }
  };

  const updateArticle = async (id, updatedArticle) => {
    try {
      const article = articles.find(a => a.id === id || a.slug === id);
      if (!article) {
        throw new Error('Không tìm thấy bài viết');
      }

      const response = await articlesAPI.update(article.slug, updatedArticle);

      if (response && response.article) {
        const convertedArticle = convertApiArticleToFrontend(response.article);
        if (convertedArticle) {
          setArticles(prev => prev.map(a =>
            (a.id === id || a.slug === id) ? convertedArticle : a
          ));
          return convertedArticle;
        }
      }
      throw new Error('Không nhận được phản hồi hợp lệ từ server');
    } catch (error) {
      throw new Error(`Không thể cập nhật bài viết: ${error.message}`);
    }
  };

  const deleteArticle = async (id) => {
    try {
      const article = articles.find(a => a.id === id || a.slug === id);
      if (!article) {
        throw new Error('Không tìm thấy bài viết');
      }

      await articlesAPI.delete(article.slug);
      setArticles(prev => prev.filter(a => a.id !== id && a.slug !== id));
    } catch (error) {
      throw new Error(`Không thể xóa bài viết: ${error.message}`);
    }
  };

  const incrementViews = (id) => {
    setArticles(prev => prev.map(article =>
      article.id === id ? { ...article, views: article.views + 1 } : article
    ));
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAdminAuthenticated(false);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<UserLayout searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}>
            <Route index element={<HomePage articles={articles} />} />
            <Route path="article/:id" element={<ArticleDetail articles={articles} incrementViews={incrementViews} />} />
            <Route path="search" element={<SearchResults articles={articles} searchTerm={searchTerm} />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={
            <AdminLogin
              setIsAdminAuthenticated={setIsAdminAuthenticated}
              isAuthenticated={isAdminAuthenticated}
            />
          } />

          <Route path="/admin" element={
            isAdminAuthenticated ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/admin/login" />
          }>
            <Route index element={<AdminDashboard articles={articles} />} />
            <Route path="articles" element={
              <AdminArticles
                articles={articles}
                onAdd={addArticle}
                onUpdate={updateArticle}
                onDelete={deleteArticle}
              />
            } />
            <Route path="stats" element={<AdminStats articles={articles} />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
