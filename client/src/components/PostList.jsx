import { Link } from 'react-router-dom';

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
            <div>
              <h3 style={{ margin: 0 }}>
                <Link to={`/post/${post._id}`}>{post.title}</Link>
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                {new Date(post.date).toLocaleString()}
              </p>
            </div>
            {post.image && (
              <img
                src={`http://localhost:3000/uploads/${post.image}`}
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
