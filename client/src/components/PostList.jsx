import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function PostList({ posts }) {
  const postsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Defensive check
  if (!Array.isArray(posts) || posts.length === 0) {
    return <p>No posts yet.</p>;
  }

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const visiblePosts = posts.slice(startIndex, endIndex);

  // ✅ Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

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
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', gap: '8px', flexWrap: 'wrap' }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          ◀ Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              padding: '4px 8px',
              fontWeight: currentPage === i + 1 ? 'bold' : 'normal',
              background: currentPage === i + 1 ? '#2e8b57' : '#f0f0f0',
              color: currentPage === i + 1 ? '#fff' : '#000',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {i + 1}
          </button>
        ))}

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
