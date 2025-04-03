import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function PostForm({ onPostCreated, mode = 'create' }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Blender');
    const [image, setImage] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(mode === 'edit');

    useEffect(() => {
        if (mode === 'edit' && id) {
          axios.get(`http://localhost:3000/posts/${id}`)
            .then(res => {
              const post = res.data;
              setTitle(post.title);
              setContent(post.content);
              setCategory(post.category);
              setExistingImage(post.image);
              setIsLoading(false); // ✅ done loading
            })
            .catch(() => {
              alert("Failed to load post");
              setIsLoading(false);
            });
        }
      }, [mode, id]);

    function handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        if (image) formData.append('image', image);

        const url = mode === 'edit'
            ? `http://localhost:3000/posts/${id}`
            : 'http://localhost:3000/posts';

        const method = mode === 'edit' ? 'put' : 'post';

        axios[method](url, formData)
            .then(() => {
                alert(mode === 'edit' ? 'Post updated' : 'Post created!');
                navigate('/');
            })
            .catch(err => {
                alert('Failed to submit.');
                console.error(err);
            });
    }

    if (mode === 'edit' && isLoading) {
        return <p>Loading post...</p>;
      }

    return (
        
        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
            <h2>{mode === 'edit' ? 'Edit Post' : 'Create New Post'}</h2>

            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required style={{ width: '100%', marginBottom: '8px' }} />

            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" required rows={5} style={{ width: '100%', marginBottom: '8px'}} />

            <select value={category} onChange={e => setCategory(e.target.value)} style={{ marginBottom: '8px' }}>
                <option>Blender</option>
                <option>Roblox Studio</option>
                <option>JavaScript</option>
            </select>

            {existingImage && (
                <p>Current image: <img src={`http://localhost:3000/uploads/${existingImage}`} style={{ width: '100px' }} /></p>
            )}

            <input type="file" onChange={e => setImage(e.target.files[0])} style={{ display: 'block', marginBottom: '12px'}} />

            <button type="submit">Post</button>
        </form>
    );
}

export default PostForm;