import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Plus, User, MapPin, Tag, Box,
  CheckCircle, Shield, LogOut, Phone,
  Package, Lock, Eye, EyeOff, AlertTriangle,
  ClipboardCheck, Database, Trash2, RefreshCw,
  ArrowRight, FileText, LayoutDashboard, History, Inbox,
  ArrowDownCircle, X, Calendar, Users, PenTool, Globe
} from 'lucide-react';

// --- ROBUST LOCAL DATABASE ---
const DB_KEYS = {
  USERS: 'campus_final_v6_users',
  ITEMS: 'campus_final_v6_items',
  SESSION: 'campus_final_v6_session'
};

const LocalDB = {
  getUsers: () => JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]'),
  getItems: () => JSON.parse(localStorage.getItem(DB_KEYS.ITEMS) || '[]'),

  saveUser: (user) => {
    const users = LocalDB.getUsers();
    users.push(user);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  },

  addItem: (item) => {
    const items = LocalDB.getItems();
    const newId = `CASE-${Math.floor(10000 + Math.random() * 90000)}-${Date.now() % 1000}`;
    items.unshift({ ...item, id: newId });
    localStorage.setItem(DB_KEYS.ITEMS, JSON.stringify(items));
  },

  updateItem: (itemId, updates) => {
    const items = LocalDB.getItems();
    const index = items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      localStorage.setItem(DB_KEYS.ITEMS, JSON.stringify(items));
      return true;
    }
    return false;
  },

  setSession: (user) => localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user)),
  getSession: () => JSON.parse(localStorage.getItem(DB_KEYS.SESSION)),
  clearSession: () => localStorage.removeItem(DB_KEYS.SESSION),

  hardReset: () => {
    if (window.confirm("⚠️ RESET ALL DATA? This action cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  }
};

// --- COMPONENTS ---

// 1. Auth Screen
const AuthScreen = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({ fullName: '', id: '', mobile: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setLoading(true);

    setTimeout(() => {
      const userId = formData.id.trim().toUpperCase();
      const users = LocalDB.getUsers();
      const existingUser = users.find(u => u.id === userId);

      if (isRegistering) {
        if (existingUser) {
          setError(`User ID already exists. Please Login.`);
        } else {
          if (!formData.fullName || !formData.mobile || !formData.password || !userId) {
            setError("Please fill all registration fields.");
            setLoading(false);
            return;
          }
          const newUser = {
            id: userId, name: formData.fullName, mobile: formData.mobile, role: role, password: formData.password,
            joinedAt: new Date().toISOString()
          };
          LocalDB.saveUser(newUser);
          setSuccessMsg("Account Created! Switched to Login.");
          setIsRegistering(false);
          setFormData(prev => ({ ...prev, password: '' }));
        }
      } else {
        if (!existingUser) setError("ID not found. Please Register.");
        else if (existingUser.password !== formData.password) setError("Incorrect Password.");
        else if (existingUser.role !== role) {
          setError(`This is a ${existingUser.role.toUpperCase()} ID. Switching tabs...`);
          setRole(existingUser.role);
        } else {
          LocalDB.setSession(existingUser);
          onLoginSuccess(existingUser);
        }
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans relative overflow-hidden">
      <button onClick={LocalDB.hardReset} className="absolute top-4 right-4 text-[10px] font-bold text-slate-300 hover:text-red-500 z-50 uppercase tracking-widest">Reset App</button>
      <div className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ${role === 'staff' ? 'bg-slate-900' : 'bg-blue-600'}`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 pb-0 text-center">
          <div className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg mb-4 transition-colors duration-500 ${role === 'staff' ? 'bg-slate-800 text-white' : 'bg-blue-500 text-white'}`}>
            {role === 'staff' ? <Shield size={32} /> : <User size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Campus Portal</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isRegistering ? `Register New ${role === 'staff' ? 'Staff' : 'Student'}` : 'Secure Access Gateway'}
          </p>
        </div>

        <div className="flex justify-center gap-2 mt-6 px-8">
          <button onClick={() => setRole('student')} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${role === 'student' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'text-slate-400 hover:bg-slate-50'}`}>Student</button>
          <button onClick={() => setRole('staff')} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${role === 'staff' ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'text-slate-400 hover:bg-slate-50'}`}>Staff</button>
        </div>

        <div className="p-8 pt-6">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2"><AlertTriangle size={14} />{error}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-600 text-xs font-bold rounded-lg flex items-center gap-2"><CheckCircle size={14} />{successMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-4 animate-in slide-in-from-left-4">
                <div className="grid grid-cols-1 gap-4">
                  <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                  <input required type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    placeholder="Mobile Number" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                </div>
              </div>
            )}
            <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              placeholder={role === 'staff' ? "Staff ID (e.g. ADM01)" : "Student ID (e.g. STU01)"}
              value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} />
            <input required type="password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />

            <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98] ${role === 'staff' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Login')}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccessMsg(''); }} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wide transition-colors">
              {isRegistering ? 'Back to Login' : 'Create New Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Item Card
const ItemCard = ({ item, userRole, onTakeCustody, onHandover }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <div className={`px-5 py-3 flex justify-between items-center border-b border-slate-100 ${item.status === 'open' ? 'bg-blue-50/50' : item.status === 'in_custody' ? 'bg-purple-50/50' : 'bg-emerald-50/50'}`}>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${item.type === 'lost' ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-600'}`}>
            {item.type}
          </span>
          <span className="text-xs font-bold text-slate-400 opacity-60">#{item.id}</span>
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${item.status === 'open' ? 'text-blue-600' : item.status === 'in_custody' ? 'text-purple-600' : 'text-emerald-600'}`}>
          {item.status === 'open' && <Inbox size={12} />}
          {item.status === 'in_custody' && <Box size={12} />}
          {item.status === 'resolved' && <CheckCircle size={12} />}
          {item.status.replace('_', ' ')}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h3>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4 font-medium">
          <span className="flex items-center gap-1"><MapPin size={12} /> {item.location}</span>
          <span className="flex items-center gap-1"><Tag size={12} /> {item.category}</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl mb-4 flex-1 border border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed">"{item.description}"</p>
        </div>

        <div className="space-y-0 border-t border-slate-100 pt-2">
          {/* Reporter Info - Visible to Staff */}
          {userRole === 'staff' && (
            <div className="py-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">R</div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Reported By</p>
                  <p className="text-xs font-bold text-slate-700">{item.reporterName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Contact</p>
                <a href={`tel:${item.reporterMobile}`} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 justify-end">
                  <Phone size={10} /> {item.reporterMobile}
                </a>
              </div>
            </div>
          )}

          {/* Receiver Info - Visible if Resolved */}
          {item.status === 'resolved' && (
            <div className="bg-emerald-50 -mx-5 -mb-5 p-4 border-t border-emerald-100 mt-2">
              <p className="text-[10px] font-black text-emerald-700 uppercase mb-3 flex items-center gap-1">
                <CheckCircle size={10} /> Handover Complete
              </p>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase mb-0.5">Receiver Name</p>
                  <p className="text-sm font-bold text-emerald-900">{item.claimedBy}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase mb-0.5">Receiver Mobile</p>
                  <p className="text-xs font-bold text-emerald-800">{item.claimedContact}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Staff Actions */}
        {userRole === 'staff' && (
          <div className="mt-4 pt-2">
            {item.status === 'open' && (
              <button onClick={(e) => { e.stopPropagation(); onTakeCustody(item); }} className="w-full py-3 bg-purple-600 text-white text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
                <Box size={16} /> Take Custody
              </button>
            )}
            {item.status === 'in_custody' && (
              <button onClick={(e) => { e.stopPropagation(); onHandover(item); }} className="w-full py-3 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
                <ClipboardCheck size={16} /> Handover to Owner
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Modals
const CustodyModal = ({ item, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-in fade-in">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4 text-purple-600">
        <Box size={28} />
        <h2 className="text-xl font-bold text-gray-800">Take Custody</h2>
      </div>
      <p className="text-slate-600 mb-6">Confirm item <strong>"{item.title}"</strong> is in office possession?</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 font-bold text-slate-600">Cancel</button>
        <button onClick={() => onConfirm(item.id)} className="flex-1 py-3 rounded-xl bg-purple-600 font-bold text-white">Confirm</button>
      </div>
    </div>
  </div>
);

const ResolutionModal = ({ item, onClose, onConfirm }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onConfirm(item.id, name, phone); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-0 shadow-2xl overflow-hidden">
        <div className="bg-emerald-600 p-4 flex items-center gap-3 text-white">
          <ClipboardCheck size={24} />
          <h2 className="text-lg font-bold">Handover Verification</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-400 uppercase font-bold">Item</p>
            <p className="font-bold text-slate-800 text-lg">{item.title}</p>
          </div>
          <input required className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2" placeholder="Receiver Name" value={name} onChange={e => setName(e.target.value)} />
          <input required type="tel" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2" placeholder="Receiver Mobile" value={phone} onChange={e => setPhone(e.target.value)} />
          <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-lg bg-emerald-600 font-bold text-white shadow-lg">Confirm</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReportModal = ({ currentUser, onClose, onRefresh }) => {
  const [type, setType] = useState('lost');
  const [form, setForm] = useState({ title: '', location: '', category: 'Electronics', description: '', mobile: currentUser.mobile || '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      ...form, type, status: 'open',
      reporterName: currentUser.name, reporterId: currentUser.id, reporterMobile: form.mobile,
      createdAt: new Date().toISOString()
    };
    LocalDB.addItem(newItem); onRefresh(); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in slide-in-from-bottom-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-0 shadow-2xl overflow-hidden">
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold">Submit New Report</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button type="button" onClick={() => setType('lost')} className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${type === 'lost' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}>Lost Item</button>
            <button type="button" onClick={() => setType('found')} className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${type === 'found' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Found Item</button>
          </div>
          <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Item Name" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option>Electronics</option><option>Clothing</option><option>ID/Docs</option><option>Keys</option><option>Other</option>
            </select>
          </div>
          <input required type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Your Contact Number" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
          <textarea rows="3" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 resize-none" placeholder="Description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <button type="submit" className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold shadow-lg hover:bg-slate-900">Submit Report</button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

function App() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedCustodyItem, setSelectedCustodyItem] = useState(null);
  const [selectedHandoverItem, setSelectedHandoverItem] = useState(null);
  const [filter, setFilter] = useState('all'); // all, lost, found

  // Load session on mount
  useEffect(() => {
    const session = LocalDB.getSession();
    if (session) setUser(session);
    refreshItems();
  }, []);

  const refreshItems = () => {
    setItems(LocalDB.getItems());
  };

  const handleLogout = () => {
    LocalDB.clearSession();
    setUser(null);
  };

  // Staff Actions
  const handleTakeCustody = (id) => {
    LocalDB.updateItem(id, { status: 'in_custody' });
    setSelectedCustodyItem(null);
    refreshItems();
  };

  const handleHandover = (id, name, phone) => {
    LocalDB.updateItem(id, {
      status: 'resolved',
      claimedBy: name,
      claimedContact: phone,
      resolvedAt: new Date().toISOString()
    });
    setSelectedHandoverItem(null);
    refreshItems();
  };

  // Filter logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filter === 'all') return true;
      return item.type === filter;
    });
  }, [items, filter]);

  if (!user) {
    return <AuthScreen onLoginSuccess={(u) => { setUser(u); refreshItems(); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${user.role === 'staff' ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'}`}>
              {user.role === 'staff' ? <Shield size={18} /> : <User size={18} />}
            </div>
            <h1 className="font-bold text-slate-800 hidden sm:block">Campus Portal</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              {user.name} ({user.role})
             </span>
             <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
               <LogOut size={20}/>
             </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
           <div>
             <h2 className="text-2xl font-bold text-slate-800">Lost & Found Feed</h2>
             <p className="text-slate-500 text-sm">Current active reports around campus</p>
           </div>
           
           <button onClick={() => setShowReportModal(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95">
             <Plus size={20} /> New Report
           </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'lost', 'found'].map(f => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
             >
               {f}
             </button>
          ))}
        </div>

        {/* Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="h-16 w-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32}/>
            </div>
            <p className="text-slate-400 font-bold">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                userRole={user.role}
                onTakeCustody={(i) => setSelectedCustodyItem(i)}
                onHandover={(i) => setSelectedHandoverItem(i)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals Overlay */}
      {showReportModal && (
        <ReportModal 
          currentUser={user} 
          onClose={() => setShowReportModal(false)} 
          onRefresh={refreshItems} 
        />
      )}

      {selectedCustodyItem && (
        <CustodyModal 
          item={selectedCustodyItem} 
          onClose={() => setSelectedCustodyItem(null)} 
          onConfirm={handleTakeCustody}
        />
      )}

      {selectedHandoverItem && (
        <ResolutionModal 
          item={selectedHandoverItem} 
          onClose={() => setSelectedHandoverItem(null)} 
          onConfirm={handleHandover} 
        />
      )}
    </div>
  );
}

export default App;