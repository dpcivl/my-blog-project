import { Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import PostDetail from './components/PostDetail';
import CategoryTabs from './components/CategoryTabs';
import Guestbook from './components/Guestbook';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    axios.get('http://localhost:3000/posts')
      .then(res => setPosts(res.data));
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

      <Routes>
        <Route path="/" element={
          <>
          <CategoryTabs current={category} onChange={setCategory}/>
          <PostList posts={filtered} />
          <PostForm onPostCreated={() => window.location.reload()} />
            </>
        } />

        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/edit/:id" element={<PostForm mode="edit" />} />
        <Route path="/guestbook" element={<Guestbook />} />
      </Routes>
    </div>
  );
}

export default App;