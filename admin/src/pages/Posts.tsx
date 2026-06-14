import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Posts() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('update');
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/community/posts');
      setPosts(res.data.posts || []);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return alert('Title and body required');
    setLoading(true);
    try {
      const authorAvatar = import.meta.env.VITE_ADMIN_AVATAR || undefined;
      const res = await api.post('/admin/posts', { title, body, category, isPublished, authorAvatar });
      setPosts(prev => [res.data.post, ...prev]);
      setTitle(''); setBody(''); setCategory('update'); setIsPublished(true);
      alert('Post created');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create post');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-4 shadow">
        <h3 className="text-lg font-bold">Create Community Post</h3>
        <form onSubmit={onSubmit} className="mt-3 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg border px-3 py-2 text-sm" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message body" rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" />
          <div className="flex items-center gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
              <option value="update">Update</option>
              <option value="announcement">Announcement</option>
              <option value="education">Education</option>
            </select>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} /> Published
            </label>
            <button type="submit" disabled={loading} className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-semibold">{loading ? 'Saving...' : 'Publish'}</button>
          </div>
        </form>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h3 className="text-lg font-bold">Recent Posts</h3>
        <ul className="mt-3 space-y-3">
          {posts.map((p: any) => (
            <li key={p._id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <strong>{p.title}</strong>
                <span className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{p.body}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span>{p.category}</span>
                <span>·</span>
                <span>{p.author}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
