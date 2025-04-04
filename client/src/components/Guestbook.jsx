import { useEffect, useState } from 'react';
import axios from 'axios';

function Guestbook({ isAdmin }) {
    const [messages, setMessages] = useState([]);
    const [name, setName] = useState('');
    const [msg, setMsg] = useState('');
    const [password, setPassword] = useState('');

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
            message: msg,
            password
          })
          .then(() => {
            setName('');
            setMsg('');
            setPassword('');
            fetchMessages();
          });
    }

    function handleDelete(id) {
        const pw = prompt("Enter your password to delete this post:");
        if (!pw) return;
      
        axios.delete(`https://my-blog-project-2485.onrender.com/guestbook/delete/${id}`, {
          data: { password: pw }
        })
        .then(() => fetchMessages())
        .catch(err => {
          alert("Wrong password or failed to delete.");
        });
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
                <div key={m._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    marginBottom: '8px',
                    backgroundColor: '#fdfdfd',
                    border: '1px solid #ddd',
                    borderRadius: '6px'
                }}>
                    <div style={{
                    flex: 1,
                    textAlign: 'left' // ✅ left-align content
                    }}>
                    <strong>{m.name}</strong> — {m.message}
                    </div>
                    
                    <button
                    onClick={() => isAdmin ? handleHide(m._id) : handleDelete(m._id)}
                    style={{
                        marginLeft: '12px',
                        padding: '4px 8px',
                        fontSize: '0.9rem',
                        backgroundColor: isAdmin ? '#f0ad4e' : '#d9534f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                    >
                    {isAdmin ? '🙈 Hide' : '🗑️ Delete'}
                    </button>
                </div>
                ))}

        </div>
    );
}

export default Guestbook;