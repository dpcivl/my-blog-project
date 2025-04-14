import { Link } from 'react-router-dom';
import { useState } from 'react';

function PostList({ posts }) {
  const postsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  if (posts.length === 0) return <p>No posts yet.</p>;

  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const visiblePosts = posts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <div>
      {visiblePosts.map(post => (
        <div key={post._id} style={{
          border: "1px solid #ccc",
          padding: "12px",
          marginBottom: "12px",
          borderRadius: "8px"
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="post-text-content">
              <h3 className="main-post-title">
                <Link to={`/post/${post._id}`}>{post.title}</Link>
              </h3>
              <p className="post-date">
                📅 {new Date(post.date).toLocaleDateString()}
              </p>
            </div>
            {post.image && (
              <img
                src={post.image}
                alt=""
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  marginLeft: "12px"
                }}
              />
            )}
          </div>
        </div>
      ))}

      {/* Pagination controls */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', gap: '8px' }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          ◀ Prev
        </button>
        <span style={{ padding: '0 8px' }}>
          Page {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}

export default PostList;