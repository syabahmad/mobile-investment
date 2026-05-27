import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Edit3, User as UserIcon, Phone, Mail, Wallet, TrendingUp,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Search, ArrowRight, Shield, ShieldCheck, Calendar,
  Users as UsersIcon, BadgeCheck, Target, DollarSign, LayoutGrid, ArrowUpDown,
  X
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  currentBalance: number;
  activePlan: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Pagination {
  page: number; limit: number; total: number; pages: number;
}

interface Stats {
  verified: number; activePlans: number; totalBalance: number;
}

const AVATAR_GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-600',
  'from-sky-500 to-blue-600',
  'from-pink-500 to-fuchsia-600',
  'from-amber-500 to-yellow-600',
  'from-violet-500 to-indigo-600',
  'from-lime-500 to-green-600',
];

function getAvatarGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-xl font-bold text-slate-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'balance-high', label: 'Balance: High to Low' },
  { value: 'balance-low', label: 'Balance: Low to High' },
  { value: 'name', label: 'Name (A-Z)' },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-slate-200" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-3 w-48 rounded bg-slate-100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-8 rounded bg-slate-100" />
              <div className="h-8 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaginationBar({ pagination, onPageChange }: {
  pagination: Pagination; onPageChange: (p: number) => void;
}) {
  const { page, pages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const getPages = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) range.push(i);
    return range;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-4">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{from}</span> to <span className="font-semibold text-slate-700">{to}</span> of{' '}
        <span className="font-semibold text-slate-700">{total}</span> users
      </p>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onPageChange(1)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button onClick={() => onPageChange(1)}
          className={`min-w-[2.25rem] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${page === 1 ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
          1
        </button>

        {getPages()[0] > 2 && <span className="px-1 text-slate-300">...</span>}

        {getPages().map((p) => (
          <button key={p} onClick={() => onPageChange(p)}
            className={`min-w-[2.25rem] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${page === p ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            {p}
          </button>
        ))}

        {getPages()[getPages().length - 1] < pages - 1 && <span className="px-1 text-slate-300">...</span>}

        {pages > 1 && (
          <button onClick={() => onPageChange(pages)}
            className={`min-w-[2.25rem] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${page === pages ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            {pages}
          </button>
        )}

        <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </button>
        <button disabled={page >= pages} onClick={() => onPageChange(pages)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function BalanceModal({ user, onClose, onUpdate }: {
  user: User; onClose: () => void; onUpdate: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'add' | 'subtract'>('add');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/update-balance', {
        userId: user._id, amount: parseFloat(amount), type,
      });
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Update Balance</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(user.name)} text-sm font-bold text-white`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">Current: Rs. {user.currentBalance.toLocaleString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
            <input type="number" required min="1" step="any"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Enter amount" value={amount}
              onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Action</label>
            <div className="flex gap-2">
              {(['add', 'subtract'] as const).map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    type === t
                      ? t === 'add'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-rose-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {t === 'add' ? 'Add Funds' : 'Subtract Funds'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={!amount || parseFloat(amount) <= 0 || submitting}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Updating...' : type === 'add' ? 'Add Balance' : 'Subtract Balance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 1 });
  const [stats, setStats] = useState<Stats>({ verified: 0, activePlans: 0, totalBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [modalUser, setModalUser] = useState<User | null>(null);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${page}&limit=24`);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
      if (res.data.stats) setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Sort & filter
  const processed = React.useMemo(() => {
    let result = [...users];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
      );
    }

    switch (sort) {
      case 'oldest': result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case 'balance-high': result.sort((a, b) => b.currentBalance - a.currentBalance); break;
      case 'balance-low': result.sort((a, b) => a.currentBalance - b.currentBalance); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break; // newest is default from API
    }

    return result;
  }, [users, search, sort]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-slate-500">Manage users, view balances, and drill into details</p>
        </div>
      </div>

      {/* Stat Cards */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={UsersIcon} label="Total Users" value={pagination.total} color="bg-indigo-500" />
          <StatCard icon={BadgeCheck} label="Verified" value={stats.verified}
            sub={`${pagination.total ? Math.round(stats.verified / pagination.total * 100) : 0}% of users`}
            color="bg-emerald-500" />
          <StatCard icon={Target} label="Users on Plans" value={stats.activePlans} color="bg-amber-500" />
          <StatCard icon={DollarSign} label="Total Balance" value={`Rs. ${stats.totalBalance.toLocaleString()}`} color="bg-sky-500" />
        </div>
      )}

      {/* Controls: Search + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name, email, phone..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="outline-none bg-transparent text-slate-600 font-medium text-sm cursor-pointer">
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? <LoadingSkeleton /> : (
        <>
          {processed.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-20">
              <div className="mb-4 rounded-full bg-slate-100 p-4">
                <UserIcon className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-700">
                {search ? 'No users match your search' : 'No users found'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {search ? 'Try a different search term' : 'Users will appear here once they register'}
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {processed.map((user) => (
                <div key={user._id}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-indigo-200 hover:shadow-md">
                  {/* Card content */}
                  <div className="p-5 cursor-pointer" onClick={() => navigate(`/users/${user._id}`)}>
                    {/* Top row: Avatar + badges */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(user.name)} text-base font-bold text-white shadow-sm`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[160px]">{user.name}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[160px]">{user.email}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-1" />
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="h-3 w-3 shrink-0" /> {user.phone}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3 shrink-0" /> Joined {formatDate(user.createdAt)}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {user.activePlan !== 'None' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                            <Target className="h-3 w-3" /> {user.activePlan}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-400">
                            No plan
                          </span>
                        )}
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700">
                            <Shield className="h-3 w-3" /> Admin
                          </span>
                        )}
                        {user.isVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            <BadgeCheck className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50/50 p-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Balance</p>
                        <p className="text-xl font-bold text-indigo-600">Rs. {user.currentBalance.toLocaleString()}</p>
                      </div>
                      <LayoutGrid className="h-8 w-8 text-indigo-200" />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex border-t border-slate-100 divide-x divide-slate-100">
                    <button onClick={(e) => { e.stopPropagation(); setModalUser(user); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600">
                      <Wallet className="h-3.5 w-3.5" /> Edit Balance
                    </button>
                    <button onClick={() => navigate(`/users/${user._id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                      <UserIcon className="h-3.5 w-3.5" /> View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <PaginationBar pagination={pagination} onPageChange={(p) => fetchUsers(p)} />
          )}
        </>
      )}

      {/* Balance Modal */}
      {modalUser && (
        <BalanceModal user={modalUser} onClose={() => setModalUser(null)}
          onUpdate={() => { setModalUser(null); fetchUsers(pagination.page); }} />
      )}
    </div>
  );
}
