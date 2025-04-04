import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function PostDetail({ isAdmin} ) {
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
          navigate('/');
        });
    }
  }

  if (error) return <p>Post not found 😢</p>;
  if (!post) return <p>Loading...</p>;

  return (
    <div>
      <h2>{post.title}</h2>
      <p><strong>Date:</strong> {new Date(post.date).toLocaleString()}</p>
      <p><strong>Category:</strong> {post.category}</p>
      <p>{post.content}</p>
      {post.image && (
        <img
          src={`https://my-blog-project-2485.onrender.com/uploads/${post.image}`}
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
              <button onClick={handleDelete}>🗑️</button>
              <button onClick={() => navigate(`/edit/${post._id}`)}>✏️</button>
            </>
          )}
      </div>
    </div>
  );
}

export default PostDetail;
