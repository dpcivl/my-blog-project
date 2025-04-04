import { useEffect, useState } from 'react';
import axios from 'axios';

function Guestbook({ isAdmin }) {
    const [messages, setMessages] = useState([]);
    const [name, setName] = useState('');
    const [msg, setMsg] = useState('');

    function fetchMessages() {
        axios.get('https://my-blog-project-2485.onrender.com/guestbook')
          .then(res => {
            // only show non-hidden messages
            const visible = res.data.filter(m => !m.hidden);
            setMessages(visible);
          });
      }

    useEffect(() => {
        fetchMessages();
    }, []);

    function handlePost() {
        axios.post('https://my-blog-project-2485.onrender.com/guestbook', {
            name,
            message: msg
        }).then(() => {
            setName('');
            setMsg('');
            fetchMessages();
        });
    }

    function handleDelete(id) {
        if (confirm("Delete this message?")) {
          axios.delete(`https://my-blog-project-2485.onrender.com/guestbook/delete/${id}`)
            .then(() => fetchMessages());
        }
      }

    function handleHide(id) {
        if (confirm("Hide this message from the public?")) {
          axios.post(`https://my-blog-project-2485.onrender.com/guestbook/hide/${id}`)
            .then(() => fetchMessages());
        }
      }

    return (
        <div>
            <h2>Guestbook</h2>

            <div style={{ marginBottom: '16px' }}>
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    style={{ display: 'block', marginBottom: '8px'}}
                />
                <textarea
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    placeholder="Leave a message..."
                    rows={4}
                    style={{ width: '100%' }}
                />
                <button onClick={handlePost}>Post</button>
            </div>
            
            <hr />

            {messages.map(m => (
                <div key={m._id} style={{ marginBottom: '12px' }}>
                    <p><strong>{m.name}</strong> - {new Date(m.date).toLocaleString()}</p>
                    <p>{m.message}</p>

                    {/* ✅ Admin sees hide button */}
                    {isAdmin ? (
                    <button onClick={() => handleHide(m._id)}>🙈 Hide</button>
                    ) : (
                    <button onClick={() => handleDelete(m._id)}>🗑️ Delete</button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Guestbook;