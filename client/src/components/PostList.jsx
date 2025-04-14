import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function PostList({ posts }) {

  if (posts.length === 0) return <p>No posts yet.</p>;

  return (
    <div>
      {posts.map(post => (
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
    </div>
  );
}

export default PostList;
