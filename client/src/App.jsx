import { Routes, Route, Link } from 'react-router-dom';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import PostDetail from './components/PostDetail';
import CategoryTabs from './components/CategoryTabs';
import Guestbook from './components/Guestbook';
import AdminLogin from "./components/AdminLogin";
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('All');
  const [isAdmin, setIsAdmin] = useState(false);

  function fetchPosts() {
    axios.get('https://my-blog-project-2485.onrender.com/posts')
      .then(res => setPosts(res.data));
  }

  // Check Login from LocalStorage
  useEffect(() => {
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
    fetchPosts();
  }, []);

  const filtered = category === 'All'
    ? posts
    : posts.filter(p => p.category === category);

  return (
    <div className="container">
      <h1>Hyoin Park</h1>

      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ marginRight: '10px' }}>🏠 Home</Link>
        <Link to="/guestbook">💬 Guestbook</Link>
      </div>

      {!isAdmin && <Link to="/admin" style={{ marginLeft: '10px' }}>🔐 Admin Login</Link>}
      {isAdmin && (
        <button onClick={() => {
          localStorage.removeItem("isAdmin");
          setIsAdmin(false);
        }} style={{ marginLeft: '12px' }}>
          🔓 Logout
        </button>
      )}

      <Routes>
        <Route path="/" element={
          <>
          <CategoryTabs current={category} onChange={setCategory}/>
          <PostList posts={filtered} />
          {isAdmin && <PostForm onPostCreated={fetchPosts} />}
            </>
        } />

        <Route path="/post/:id" element={<PostDetail isAdmin={isAdmin} />} />
        <Route path="/edit/:id" element={<PostForm mode="edit" isAdmin={isAdmin} />} />
        <Route path="/guestbook" element={<Guestbook />} />
        <Route path="/admin" element={<AdminLogin onLogin={setIsAdmin} />} />
      </Routes>
    </div>
  );
}

export default App;