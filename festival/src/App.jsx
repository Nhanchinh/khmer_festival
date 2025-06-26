import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

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

// Sample data for Khmer festivals
const sampleArticles = [
  {
    id: 1,
    title: "Lễ hội Chol Chnam Thmay - Tết cổ truyền của người Khmer",
    excerpt: "Chol Chnam Thmay là lễ hội truyền thống quan trọng nhất của người Khmer, đánh dấu năm mới theo lịch Phật giáo...",
    content: `Chol Chnam Thmay là lễ hội truyền thống quan trọng nhất của người Khmer, thường được tổ chức vào tháng 4 dương lịch. Đây là dịp để cộng đồng người Khmer sum vầy, cầu nguyện cho một năm mới an khang thịnh vượng.

Trong lễ hội này, người dân thực hiện nhiều nghi lễ truyền thống như:
- Trang trí chùa và nhà cửa bằng cờ phướn nhiều màu sắc
- Tổ chức các trò chơi dân gian như chol chhoung, bay khon
- Thực hiện các nghi lễ cúng Phật tại chùa
- Gia đình sum họp, thăm hỏi người cao tuổi

Lễ hội Chol Chnam Thmay không chỉ có ý nghĩa tâm linh mà còn thể hiện sự đoàn kết của cộng đồng người Khmer Nam Bộ.`,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    category: "Lễ hội truyền thống",
    date: "2024-04-15",
    location: "Trà Vinh, Sóc Trăng, An Giang",
    author: "Admin",
    tags: ["chol chnam thmay", "tết khmer", "truyền thống"],
    views: 1250,
    featured: true
  },
  {
    id: 2,
    title: "Lễ hội Ok Om Bok - Tôn vinh mặt trăng và nước",
    excerpt: "Ok Om Bok là lễ hội truyền thống của người Khmer, tổ chức vào rằm tháng 10 âm lịch để tôn vinh mặt trăng và tạ ơn thần nước...",
    content: `Ok Om Bok là một trong những lễ hội quan trọng của người Khmer, thường được tổ chức vào đêm rằm tháng 10 âm lịch. Lễ hội này có ý nghĩa sâu sắc trong đời sống tâm linh của người Khmer.

Các hoạt động chính trong lễ hội:
- Đua ghe ngo trên sông, kênh rạch
- Thả đèn trời cầu may mắn
- Cúng bánh cốm dẹp - món ăn truyền thống
- Múa lam thon - điệu múa đặc trưng
- Thi đấu các môn thể thao dân gian

Lễ hội Ok Om Bok thể hiện mối quan hệ gắn bó của người Khmer với thiên nhiên, đặc biệt là nguồn nước - yếu tố quan trọng trong nông nghiệp.`,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop",
    category: "Lễ hội mùa vụ",
    date: "2024-10-20",
    location: "Sóc Trăng, Trà Vinh",
    author: "Admin",
    tags: ["ok om bok", "đua ghe ngo", "lễ hội nước"],
    views: 980,
    featured: true
  },
  {
    id: 3,
    title: "Lễ hội Pchum Ben - Tưởng niệm tổ tiên",
    excerpt: "Pchum Ben là lễ hội tưởng niệm tổ tiên quan trọng của người Khmer, thể hiện lòng hiếu thảo và tri ân...",
    content: `Pchum Ben là lễ hội tâm linh quan trọng của người Khmer, thường kéo dài 15 ngày từ đầu tháng 10 âm lịch. Đây là thời gian để tưởng niệm và cầu siêu cho tổ tiên đã khuất.

Những nghi lễ chính:
- Cúng bay ben (cơm nắm) tại chùa
- Thực hiện các nghi lễ cầu siêu
- Gia đình tập trung tại chùa để cầu nguyện
- Bố thí cho các sư thầy và người nghèo
- Nghe giảng kinh Phật

Lễ hội Pchum Ben không chỉ có ý nghĩa tâm linh mà còn giúp củng cố mối quan hệ gia đình và cộng đồng trong xã hội Khmer.`,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    category: "Lễ hội tôn giáo",
    date: "2024-09-28",
    location: "An Giang, Kiên Giang",
    author: "Admin",
    tags: ["pchum ben", "tưởng niệm", "tổ tiên"],
    views: 756,
    featured: false
  },
  {
    id: 4,
    title: "Lễ hội Dolta - Chào đón mùa mưa",
    excerpt: "Dolta là lễ hội của người Khmer Nam Bộ, tổ chức để chào đón mùa mưa và cầu mong mùa màng bội thu...",
    content: `Lễ hội Dolta được tổ chức vào cuối mùa khô, đầu mùa mưa (thường là tháng 5-6 dương lịch) để chào đón mùa mưa và cầu mong cho một mùa vụ thuận lợi.

Các hoạt động trong lễ hội:
- Múa robam - điệu múa truyền thống Khmer
- Hát cải lương Khmer
- Thi nấu các món ăn truyền thống
- Triển lãm văn hóa, nghệ thuật Khmer
- Các trò chơi dân gian cho trẻ em

Lễ hội Dolta thể hiện sự gắn bó mật thiết của người Khmer với thiên nhiên và chu kỳ sản xuất nông nghiệp.`,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop",
    category: "Lễ hội mùa vụ",
    date: "2024-06-10",
    location: "Cà Mau, Bạc Liêu",
    author: "Admin",
    tags: ["dolta", "mùa mưa", "nông nghiệp"],
    views: 432,
    featured: false
  }
];

function App() {
  const [articles, setArticles] = useState(sampleArticles);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if admin is already logged in
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const addArticle = (newArticle) => {
    const article = {
      ...newArticle,
      id: Date.now(),
      author: 'Admin',
      views: 0,
      date: new Date().toISOString().split('T')[0]
    };
    setArticles([article, ...articles]);
  };

  const updateArticle = (id, updatedArticle) => {
    setArticles(articles.map(article =>
      article.id === id ? { ...article, ...updatedArticle } : article
    ));
  };

  const deleteArticle = (id) => {
    setArticles(articles.filter(article => article.id !== id));
  };

  const incrementViews = (id) => {
    setArticles(articles.map(article =>
      article.id === id ? { ...article, views: article.views + 1 } : article
    ));
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
            isAdminAuthenticated ? <AdminLayout /> : <Navigate to="/admin/login" />
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
