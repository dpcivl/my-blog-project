import { useEffect, useState } from 'react';
import axios from 'axios';

function Guestbook() {
    const [messages, setMessages] = useState([]);
    const [name, setName] = useState('');
    const [msg, setMsg] = useState('');

    function fetchMessages() {
        axios.get('https://my-blog-project-2485.onrender.com/guestbook')
            .then(res => setMessages(res.data));
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
            axios.delete(`https://my-blog-project-2485.onrender.com/guestbook/${id}`)
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
            <div key={m.id} style={{ marginBottom: '12px' }}>
                <p><strong>{m.name}</strong> - {new Date(m.date).toLocaleString()}</p>
                <p>{m.message}</p>
                <button onClick={() => handleDelete(m.id)}>🗑️</button>
            </div>
            ))}
        </div>
    );
}

export default Guestbook;