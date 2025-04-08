import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function PostForm({ onPostCreated, mode = 'create' }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Blender');
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const contentRef = useRef(null);

  useEffect(() => {
    if (mode === 'edit' && id) {
      axios.get(`https://my-blog-project-2485.onrender.com/posts/${id}`)
        .then(res => {
          const post = res.data;
          setTitle(post.title);
          setContent(post.content);
          setCategory(post.category);
          setExistingImage(post.image);
          setIsLoading(false);
        })
        .catch(() => {
          alert("Failed to load post");
          setIsLoading(false);
        });
    }
  }, [mode, id]);

  useEffect(() => {
    const handlePaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
  
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          const file = item.getAsFile();
  
          // Upload to Firebase
          const formData = new FormData();
          formData.append("image", file);
          const res = await axios.post("https://my-blog-project-2485.onrender.com/upload-image", formData);
  
          // Insert markdown image link
          const url = res.data.url;
          const imgMarkdown = `\n![screenshot](${url})\n`;
          setContent(prev => prev + imgMarkdown);
  
          alert("✅ Screenshot uploaded and inserted into content!");
        }
      }
    };
  
    const textarea = contentRef.current;
    textarea.addEventListener('paste', handlePaste);
    return () => textarea.removeEventListener('paste', handlePaste);
  }, []);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    if (image) formData.append('image', image);

    const url = mode === 'edit'
      ? `https://my-blog-project-2485.onrender.com/posts/${id}`
      : 'https://my-blog-project-2485.onrender.com/posts';

    const method = mode === 'edit' ? 'put' : 'post';

    axios[method](url, formData)
      .then(() => {
        alert(mode === 'edit' ? 'Post updated' : 'Post created!');
        if (onPostCreated) onPostCreated();
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

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        required
        style={{ width: '100%', marginBottom: '8px' }}
      />

      <textarea
        ref={contentRef}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Content"
        required
        rows={5}
        style={{ width: '100%', marginBottom: '8px' }}
      />

      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        style={{ marginBottom: '8px' }}
      >
        <option>Blender</option>
        <option>Game</option>
        <option>IoT</option>
      </select>

      {existingImage && (
        <p>
          Current image: <br />
          <img
            src={existingImage}
            alt=""
            style={{ width: '100px', marginTop: '4px' }}
          />
        </p>
      )}

      <input
        type="file"
        onChange={handleImageChange}
        style={{ display: 'block', marginBottom: '8px' }}
      />

      {imagePreviewUrl && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: '4px 0' }}>📷 Image Preview:</p>
          <img
            src={imagePreviewUrl}
            alt="Preview"
            style={{
              width: '100px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
      )}

      <button type="submit">Post</button>
    </form>
  );
}

export default PostForm;
