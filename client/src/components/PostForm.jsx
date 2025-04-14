import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

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
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

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
    const textarea = contentRef.current;
    if (!textarea) return;

    const handlePaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          const file = item.getAsFile();

          const formData = new FormData();
          formData.append("image", file);
          const res = await axios.post("https://my-blog-project-2485.onrender.com/upload-image", formData);

          const url = res.data.url;
          const imgMarkdown = `\n![screenshot](${url})\n`;
          setContent(prev => prev + imgMarkdown);

          alert("✅ Screenshot uploaded and inserted into content!");
        }
      }
    };

    textarea.addEventListener('paste', handlePaste);
    return () => textarea.removeEventListener('paste', handlePaste);
  }, []);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setRemoveExistingImage(false); // Prevent unintentional deletion
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    if (image) formData.append('image', image);
    formData.append('removeImage', removeExistingImage);

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

      <label style={{ fontWeight: 'bold', marginBottom: '6px', display: 'block' }}>
        📌 Post Title
      </label>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Enter a catchy title..."
        required
        style={{
          width: '100%',
          fontSize: '1.4rem',
          fontWeight: 'bold',
          padding: '12px 16px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          marginBottom: '16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}
      />

      <label style={{ fontWeight: 'bold', marginTop: '12px', display: 'block' }}>
        ✏️ Write your post
      </label>

      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'start',
        flexWrap: 'wrap',
        marginBottom: '16px'
      }}>
        <textarea
          ref={contentRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write markdown here..."
          required
          rows={20}
          style={{
            flex: 1,
            minWidth: '300px',
            height: '500px',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            overflow: 'auto',
          }}
        />

        <div
          style={{
            flex: 1,
            minWidth: '300px',
            height: '500px',
            overflowY: 'auto',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            background: '#f9f9f9',
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
          }}
        >
          <ReactMarkdown
            children={content}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              img: ({ node, ...props }) => (
                <img
                  {...props}
                  style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '10px' }}
                  alt=""
                />
              ),
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" />
              ),
              code({ node, inline, className, children, ...props }) {
                return !inline ? (
                  <pre>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          />
        </div>
      </div>

      <label style={{ fontWeight: 'bold', marginTop: '16px', display: 'block' }}>
        🗂️ Category
      </label>

      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setCustomCategory(''); // reset custom input if user selects
        }}
        style={{ marginBottom: '4px' }}
      >
        <option value="">— Choose a category —</option>
        <option>Blender</option>
        <option>Game</option>
        <option>Krita</option>
      </select>

      <p style={{ margin: '8px 0', textAlign: 'center' }}>— or —</p>

      <input
        type="text"
        placeholder="Write your own category..."
        value={customCategory}
        onChange={(e) => {
          setCustomCategory(e.target.value);
          setCategory(''); // reset dropdown
        }}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          marginBottom: '16px',
        }}
      />

      <label style={{ fontWeight: 'bold', marginBottom: '6px', display: 'block' }}>
        🖼️ Thumbnail Image
      </label>

      {existingImage && !imagePreviewUrl && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: '4px 0' }}>📷 Click current image to remove:</p>
          <img
            src={existingImage}
            alt="Current"
            onClick={() => {
              setExistingImage(null);
              setRemoveExistingImage(true);
            }}
            style={{
              width: '100px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              opacity: 0.9,
              transition: 'opacity 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = 0.6}
            onMouseOut={(e) => e.currentTarget.style.opacity = 0.9}
            title="Click to remove"
          />
        </div>
      )}

      {!existingImage && !imagePreviewUrl && (
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginBottom: '12px' }}
        />
      )}

      {imagePreviewUrl && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: '4px 0' }}>📷 Click image to remove:</p>
          <img
            src={imagePreviewUrl}
            alt="Preview"
            onClick={() => {
              setImage(null);
              setImagePreviewUrl(null);
            }}
            style={{
              width: '100px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              opacity: 0.9,
              transition: 'opacity 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = 0.6}
            onMouseOut={(e) => e.currentTarget.style.opacity = 0.9}
            title="Click to remove"
          />
        </div>
      )}

    <hr style={{ margin: '16px 0' }} />
    
    <button type="submit">Post</button>
    </form>
  );
}

export default PostForm;
