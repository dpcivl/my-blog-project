import { Routes, Route, Link } from 'react-router-dom';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import PostDetail from './components/PostDetail';
import CategoryTabs from './components/CategoryTabs';
import Guestbook from './components/Guestbook';
import AdminLogin from "./components/AdminLogin";
import AdminGuestbook from './components/AdminGuestbook';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('All');
  const [isAdmin, setIsAdmin] = useState(false);

  function calculateStreak(posts, category) {
    if (!Array.isArray(posts)) return 0;
  
    const dates = posts
      .filter(p => p.category === category)
      .map(p => new Date(p.date).toISOString().split('T')[0])
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b) - new Date(a));
  
    let streak = 0;
    let current = new Date().toISOString().split('T')[0];
  
    for (let date of dates) {
      if (date === current) {
        streak++;
        current = new Date(new Date(current).setDate(new Date(current).getDate() - 1))
          .toISOString()
          .split('T')[0];
      } else {
        break;
      }
    }
  
    return streak;
  }

  function fetchPosts() {
    axios.get('https://my-blog-project-2485.onrender.com/posts')
      .then(res => setPosts(res.data));
  }

  useEffect(() => {
    setIsAdmin(sessionStorage.getItem("isAdmin") === "true");
    fetchPosts();
  }, []);

  const filtered = category === 'All'
  ? posts
  : posts.filter(p => p.category === category);

  return (
    <div className="app-wrapper">
      <h1 style={{
        fontFamily: "'Press Start 2P'",
        fontSize: '2rem',
        color: '#fff',
        marginBottom: '16px',
        textShadow: `
          2px 1px 0 #2e8b57,
          -1px -2px 0 #2e8b57,
          1px -1px 0 #2e8b57,
          -1px 1px 0 #2e8b57
        `
      }}>
        Hyoin Park
      </h1>

      <div style={{ marginBottom: '20px' }}>
        <Link to="/" className="nav-button">🏠 Home</Link>
        <Link to="/guestbook" className="nav-button">💬 Guestbook</Link>
        {isAdmin && (
          <Link to="/admin/guestbook" className="nav-button">📂 Manage Guestbook</Link>
        )}

        {!isAdmin && (
          <Link to="/admin" className="nav-button">🔐 Admin Login</Link>
        )}

        {isAdmin && (
          <button
            className="nav-button logout-button"
            onClick={() => {
              sessionStorage.removeItem("isAdmin");
              setIsAdmin(false);
            }}
          >
            🔓 Logout
          </button>
        )}
      </div>

      <Routes>
        <Route path="/" element={
          <>
            <div className="main-content">
              <CategoryTabs current={category} onChange={setCategory} />
              <PostList posts={filtered} key={category + posts.length} />
              {isAdmin && (
                <div style={{ marginBottom: '16px' }}>
                  <Link to="/new" className="nav-button">➕ Create New Post</Link>
                </div>
              )}
            </div>

            {/* ✅ Moved streaks to bottom */}
            <section className="streak-container">
              <h2 className="streak-title">🔥 Current Streaks</h2>
              <div className="streak-bar">
                <span className="streak">📙 Blender: {calculateStreak(posts, 'Blender')}</span>
                <span className="streak">📘 Game: {calculateStreak(posts, 'Game')}</span>
                <span className="streak">📗 Krita: {calculateStreak(posts, 'Krita')}</span>
              </div>
            </section>
          </>
        } />

        <Route path="/new" element={<PostForm onPostCreated={fetchPosts} />} />
        <Route path="/post/:id" element={<PostDetail isAdmin={isAdmin} onPostDeleted={fetchPosts} />} />
        <Route path="/edit/:id" element={<PostForm mode="edit" isAdmin={isAdmin} />} />
        <Route path="/guestbook" element={<Guestbook isAdmin={isAdmin} />} />
        <Route path="/admin" element={<AdminLogin onLogin={setIsAdmin} />} />
        <Route path="/admin/guestbook" element={isAdmin ? <AdminGuestbook /> : <p>Access denied</p>} />
      </Routes>
    </div>
  );
}

export default App;
