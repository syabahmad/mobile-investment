import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Edit3, Trash2, X, Layers, ToggleLeft, ToggleRight } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editing) {
        await api.put(`/admin/categories/${editing._id}`, form);
      } else {
        await api.post('/admin/categories', form);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category? Plans linked to it must be removed first.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleToggle = async (cat: Category) => {
    try {
      await api.put(`/admin/categories/${cat._id}`, { isActive: !cat.isActive });
      fetchCategories();
    } catch (err) {
      alert('Failed to toggle');
    }
  };

  if (loading) return <div className="text-center py-10">Loading categories...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Investment Systems</h1>
          <p className="text-slate-500">Create and manage investment categories (Car Rental, Apartment Rental, etc.)</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="mr-2 h-4 w-4" /> New System
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-500">No systems yet. Click "New System" to create one.</div>
        ) : (
          categories.map((cat) => (
            <div key={cat._id} className={`card p-6 ${!cat.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{cat.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">{cat.slug}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={() => handleToggle(cat)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                    {cat.isActive ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" />}
                  </button>
                  <button onClick={() => openEdit(cat)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(cat._id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {cat.description && (
                <p className="text-sm text-slate-500">{cat.description}</p>
              )}
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing ? 'Edit System' : 'New Investment System'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">System Name</label>
                <input
                  type="text" required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Car Rental System"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={2} placeholder="Optional description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
