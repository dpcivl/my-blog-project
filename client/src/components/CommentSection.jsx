import { useState, useEffect } from 'react';
import axios from 'axios';

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ name: '', password: '', content: '' });
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const res = await axios.get(`/comments/${postId}`);
    setComments(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.content.length < 5) {
      alert('댓글은 최소 5자 이상이어야 합니다.');
      return;
    }

    await axios.post('/comments', { ...form, postId });
    setForm({ name: '', password: '', content: '' });
    fetchComments();
  };

  const handleDelete = async (id) => {
    const password = prompt('댓글 작성 시 입력한 비밀번호를 입력하세요');
    if (!password) return;

    try {
      await axios.delete(`/comments/${id}`, { data: { password } });
      fetchComments();
    } catch (err) {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleEdit = (comment) => {
    setEditId(comment._id);
    setEditContent(comment.content);
    setEditPassword('');
  };

  const submitEdit = async () => {
    if (!editPassword) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      await axios.put(`/comments/${editId}`, {
        content: editContent,
        password: editPassword
      });
      setEditId(null);
      setEditContent('');
      setEditPassword('');
      fetchComments();
    } catch (err) {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h4>💬 댓글 ({comments.length})</h4>

      {comments.map(comment => (
        <div key={comment._id} style={{ borderBottom: '1px solid #ccc', padding: '8px 0' }}>
          <p><strong>{comment.name}</strong> 🕒 {new Date(comment.date).toLocaleString()}</p>

          {editId === comment._id ? (
            <div>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
              />
              <input
                type="password"
                placeholder="비밀번호 입력"
                value={editPassword}
                onChange={e => setEditPassword(e.target.value)}
              />
              <button onClick={submitEdit}>수정 완료</button>
              <button onClick={() => setEditId(null)}>취소</button>
            </div>
          ) : (
            <>
              <p>{comment.content}</p>
              <button onClick={() => handleEdit(comment)}>수정</button>
              <button onClick={() => handleDelete(comment._id)}>삭제</button>
            </>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
        <input
          placeholder="이름"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="비밀번호"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <textarea
          placeholder="댓글을 입력하세요"
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
        />
        <button type="submit">댓글 작성</button>
      </form>
    </div>
  );
}

export default CommentSection;
