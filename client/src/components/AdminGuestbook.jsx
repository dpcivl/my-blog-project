import { useEffect, useState } from 'react';
import axios from 'axios';

function AdminGuestbook() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get('https://my-blog-project-2485.onrender.com/guestbook/all') // replace with your real URL
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

  return (
    <div>
      <h2>📂 Admin Guestbook View</h2>
      {messages.map(m => (
        <div key={m._id} style={{
          border: '1px solid #ccc',
          padding: '12px',
          marginBottom: '12px',
          backgroundColor: m.hidden ? '#ffecec' : '#f0fff0'
        }}>
          <p><strong>{m.name}</strong> - {new Date(m.date).toLocaleString()}</p>
          <p>{m.message}</p>
          {m.hidden ? (
            <button onClick={() => handleUnhide(m._id)}>✅ Unhide</button>
          ) : (
            <button onClick={() => handleHide(m._id)}>🙈 Hide</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminGuestbook;
