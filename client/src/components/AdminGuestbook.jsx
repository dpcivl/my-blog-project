import { useEffect, useState } from 'react';
import axios from 'axios';

function AdminGuestbook() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get('https://my-blog-project-2485.onrender.com/guestbook/all')
      .then(res => setMessages(res.data));
  }, []);

  function handleHide(id) {
    if (confirm("Hide this message?")) {
      axios.post(`https://my-blog-project-2485.onrender.com/guestbook/hide/${id}`)
        .then(() => window.location.reload());
    }
  }

  function handleUnhide(id) {
    if (confirm("Unhide this message?")) {
      axios.post(`https://my-blog-project-2485.onrender.com/guestbook/unhide/${id}`)
        .then(() => window.location.reload());
    }
  }

  function handleDelete(id) {
    if (confirm("Delete this message permanently?")) {
      axios.delete(`https://my-blog-project-2485.onrender.com/guestbook/delete/${id}`, {
        data: {}  // ✅ Let backend know this is admin (no password)
      })
      .then(() => {
        alert("Message deleted");
        setMessages(prev => prev.filter(m => m._id !== id));
      })
      .catch(err => {
        alert("Failed to delete");
        console.error(err);
      });
    }
  }

  return (
    <div>
      <h2>📂 Admin Guestbook View</h2>
      {messages.map(m => (
        <div key={m._id} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 12px',
          marginBottom: '10px',
          backgroundColor: m.hidden ? '#ffecec' : '#f0fff0',
          border: '1px solid #ccc',
          borderRadius: '6px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ margin: '0 0 4px 0' }}>
              <strong>{m.name}</strong> • {new Date(m.date).toLocaleString()}
            </p>
            <p style={{ margin: 0 }}>{m.message}</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => m.hidden ? handleUnhide(m._id) : handleHide(m._id)}
              style={{
                padding: '6px 10px',
                fontSize: '0.9rem',
                backgroundColor: m.hidden ? '#5cb85c' : '#f0ad4e',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {m.hidden ? '✅ Unhide' : '🙈 Hide'}
            </button>

            <button
              onClick={() => handleDelete(m._id)}
              style={{
                padding: '6px 10px',
                fontSize: '0.9rem',
                backgroundColor: '#d9534f',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}

    </div>
  );
}

export default AdminGuestbook;
