import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PostContent from './PostContent';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

function PostDetail({ isAdmin, onPostDeleted }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // ✅ Load a single post by ID
    axios.get(`https://my-blog-project-2485.onrender.com/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(() => setError(true));
  }, [id]);

  function handleDelete() {
    if (confirm("Are you sure you want to delete this post?")) {
      axios.delete(`https://my-blog-project-2485.onrender.com/posts/${id}`)
        .then(() => {
          alert("Post deleted.");
          if (onPostDeleted) onPostDeleted(); // ✅ Refresh posts
          navigate('/');
        });
    }
  }

  if (error) return <p>Post not found 😢</p>;
  if (!post) return <p>Loading...</p>;

  return (
    <div>
      <div className="post-info-bar">
        <div className="post-title">{post.title}</div>
        <div className="post-meta-group">
          <span className="post-meta">📅 {new Date(post.date).toLocaleDateString()}</span>
          <span className="post-meta">🗂️ {post.category}</span>
        </div>
      </div>
      <PostContent content={post.content} />
      {post.image && (
        <img
          src={post.image}
          alt=""
          style={{
            width: '100%',
            maxWidth: '400px',
            height: 'auto',
            borderRadius: '8px',
            marginTop: '12px'
          }}
        />
      )}
      <div style={{ marginTop: "20px" }}>
          {isAdmin && (
            <>
              <button className="danger" onClick={handleDelete}>🗑️ Delete</button>
              <button onClick={() => navigate(`/edit/${post._id}`)}>✏️ Edit</button>
            </>
          )}
      </div>
    </div>
  );
}

export default PostDetail;
