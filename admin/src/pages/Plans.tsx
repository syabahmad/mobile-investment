import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Edit3, Trash2, X, ToggleLeft, ToggleRight, FolderOpen } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface Plan {
  _id: string;
  category: Category;
  name: string;
  dailyReturnRate: number;
  minInvestment: number;
  maxInvestment: number | null;
  description: string;
  isActive: boolean;
}

interface CategoryOption {
  _id: string;
  name: string;
}

const defaultForm = {
  category: '',
  name: '',
  dailyReturnRate: '',
  minInvestment: '0',
  maxInvestment: '',
  description: '',
};

const Plans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [plansRes, catsRes] = await Promise.all([
        api.get('/admin/plans'),
        api.get('/admin/categories'),
      ]);
      setPlans(plansRes.data.plans);
      setCategories(catsRes.data.categories);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(defaultForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setForm({
      category: plan.category?._id || '',
      name: plan.name,
      dailyReturnRate: String(plan.dailyReturnRate * 100),
      minInvestment: String(plan.minInvestment),
      maxInvestment: plan.maxInvestment ? String(plan.maxInvestment) : '',
      description: plan.description,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!editingPlan && !form.category) {
      setError('Please select a category');
      return;
    }

    const dailyReturnRateNum = parseFloat(form.dailyReturnRate) / 100;
    if (isNaN(dailyReturnRateNum) || dailyReturnRateNum <= 0) {
      setError('Daily return rate must be a positive number');
      return;
    }

    const payload: Record<string, unknown> = {
      name: form.name,
      dailyReturnRate: dailyReturnRateNum,
      minInvestment: form.minInvestment ? parseFloat(form.minInvestment) : 0,
      maxInvestment: form.maxInvestment ? parseFloat(form.maxInvestment) : null,
      description: form.description,
    };

    if (!editingPlan) {
      payload.category = form.category;
    }

    try {
      if (editingPlan) {
        await api.put(`/admin/plans/${editingPlan._id}`, payload);
      } else {
        await api.post('/admin/plans', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleDelete = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await api.delete(`/admin/plans/${planId}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete plan');
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      await api.put(`/admin/plans/${plan._id}`, { isActive: !plan.isActive });
      fetchData();
    } catch (err) {
      alert('Failed to toggle plan status');
    }
  };

  if (loading) return <div className="text-center py-10">Loading plans...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Investment Plans</h1>
          <p className="text-slate-500">Create and manage plans under each investment system</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary" disabled={categories.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Create Plan
        </button>
      </div>

      {categories.length === 0 && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
          No investment systems exist yet. Create a system first in the <strong>Systems</strong> page.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-500">No plans created yet.</div>
        ) : (
          plans.map((plan) => (
            <div key={plan._id} className={`card p-6 ${!plan.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  {plan.category && (
                    <span className="inline-flex items-center text-xs text-indigo-600 mt-1">
                      <FolderOpen className="mr-1 h-3 w-3" />
                      {plan.category.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleToggleActive(plan)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                    {plan.isActive ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" />}
                  </button>
                  <button onClick={() => openEdit(plan)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(plan._id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-indigo-600">{(plan.dailyReturnRate * 100).toFixed(1)}%</span>
                <span className="text-slate-500 text-sm ml-1">daily</span>
              </div>

              <div className="space-y-1 text-sm text-slate-600">
                <p>Min: <span className="font-semibold">Rs. {plan.minInvestment.toLocaleString()}</span></p>
                <p>Max: <span className="font-semibold">{plan.maxInvestment ? `Rs. ${plan.maxInvestment.toLocaleString()}` : 'Unlimited'}</span></p>
              </div>

              {plan.description && (
                <p className="mt-3 text-xs text-slate-500">{plan.description}</p>
              )}
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingPlan ? 'Edit Plan' : 'Create Plan'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Investment System</label>
                <select
                  required={!editingPlan}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  disabled={!!editingPlan}
                >
                  <option value="">Select a system</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Plan Name</label>
                <input type="text" required className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Economy Car" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Daily Return Rate (%)</label>
                <input type="number" required step="0.1" min="0" className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. 2.0" value={form.dailyReturnRate} onChange={(e) => setForm({ ...form, dailyReturnRate: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Min Investment</label>
                  <input type="number" min="0" className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="0" value={form.minInvestment} onChange={(e) => setForm({ ...form, minInvestment: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Max Investment</label>
                  <input type="number" min="0" className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Unlimited" value={form.maxInvestment} onChange={(e) => setForm({ ...form, maxInvestment: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" rows={2} placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingPlan ? 'Update Plan' : 'Create Plan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
