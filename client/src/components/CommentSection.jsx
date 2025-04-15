import { useState, useEffect } from 'react';
import axios from '../axios';

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
    const password = prompt('비밀번호를 입력하세요');
    if (!password) return;
  
    try {
      await axios.post(`/comments/delete/${id}`, { password });
      fetchComments();
    } catch (err) {
      alert(err.response?.data?.message || "삭제 중 오류 발생");
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
    <div className="comment-section">
      <h4 className="comment-title">💬 댓글 ({comments.length})</h4>

      {/* 댓글 목록 */}
      <div className="comment-list">
        {comments.map(comment => (
          <div key={comment._id} className="comment-card">
            <div className="comment-header">
              <strong>{comment.name}</strong>
              <span className="comment-date">{new Date(comment.date).toLocaleString()}</span>
            </div>

            {editId === comment._id ? (
              <>
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="comment-textarea"
                />
                <input
                  type="password"
                  placeholder="비밀번호 입력"
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  className="comment-input"
                />
                <button onClick={submitEdit}>수정 완료</button>
                <button onClick={() => setEditId(null)}>취소</button>
              </>
            ) : (
              <>
                <p className="comment-content">{comment.content}</p>
                <div className="comment-actions">
                  <button onClick={() => handleEdit(comment)}>수정</button>
                  <button onClick={() => handleDelete(comment._id)}>삭제</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="comment-form">
        <input
          placeholder="이름"
          className="comment-input"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="비밀번호"
          type="password"
          className="comment-input"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <textarea
          placeholder="댓글을 입력하세요"
          className="comment-textarea"
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
        />
        <button type="submit">댓글 작성</button>
      </form>
    </div>
  );
}

export default CommentSection;
