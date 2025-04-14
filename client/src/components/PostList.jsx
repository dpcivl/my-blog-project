import { Link } from 'react-router-dom';
import { useState } from 'react';

function PostList({ posts }) {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // 계산
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const currentPosts = posts.slice(indexOfFirst, indexOfLast);

  if (posts.length === 0) return <p>No posts yet.</p>;

  return (
    <div>
      {/* 포스트 목록 */}
      {currentPosts.map(post => (
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

      {/* 페이지네이션 버튼 */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              margin: '0 4px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: i + 1 === currentPage ? '2px solid #333' : '1px solid #ccc',
              backgroundColor: i + 1 === currentPage ? '#2e7d32' : '#8FBC8F',
              cursor: 'pointer'
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PostList;
