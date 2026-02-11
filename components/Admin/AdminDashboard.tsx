import React from 'react';
import { useStore } from '../../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, TrendingUp, Users, Store, XCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminDashboard() {
  const { restaurants, orders, users, isTestMode, toggleTestMode, verifyRestaurant, declineRestaurant } = useStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  // Calculate Real Chart Data (Last 7 Days)
  const chartData = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateKey = d.toLocaleDateString(); // Matches local date format
      
      // Count orders created on this specific date
      const count = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === dateKey).length;
      
      chartData.push({ name: dayName, orders: count });
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Overview</h1>
        <button 
          onClick={toggleTestMode} 
          className={`px-4 py-2 rounded-lg font-bold text-sm transition ${isTestMode ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
        >
          {isTestMode ? 'Test Mode: ON' : 'Enable Test Mode'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} icon={TrendingUp} color="bg-green-500" />
        <StatCard title="Total Orders" value={orders.length} icon={ShieldCheck} color="bg-indigo-500" />
        <StatCard title="Active Users" value={users.length} icon={Users} color="bg-blue-500" />
        <StatCard title="Restaurants" value={restaurants.length} icon={Store} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Weekly Order Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Pending Approvals</h3>
          <div className="space-y-4">
            {restaurants.filter(r => !r.verified).map(r => (
              <div key={r.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <img src={r.imageUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{r.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ID: {r.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                          if(window.confirm(`Are you sure you want to decline ${r.name}? This will delete the restaurant entry.`)) {
                              declineRestaurant(r.id);
                          }
                      }}
                      className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1.5 rounded text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition flex items-center gap-1"
                    >
                      <XCircle size={16} /> Decline
                    </button>
                    <button 
                      onClick={() => verifyRestaurant(r.id, true)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                </div>
              </div>
            ))}
             {restaurants.filter(r => !r.verified).length === 0 && (
                <div className="text-center text-slate-400 dark:text-slate-500 py-8">All pending requests approved.</div>
             )}
          </div>
        </div>
      </div>

      {/* Active Restaurants List */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <h3 className="font-bold text-slate-800 dark:text-white mb-6">Active Restaurants (Live on Dashboard)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.filter(r => r.verified).map(r => (
                 <div key={r.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <img src={r.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{r.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                {r.isOpen ? <span className="text-green-500">● Open</span> : <span className="text-red-500">● Closed</span>}
                            </p>
                        </div>
                    </div>
                    <div>
                        <button 
                            onClick={() => verifyRestaurant(r.id, false)}
                            className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition flex flex-col items-center gap-1 text-xs"
                            title="Hide Restaurant from Dashboard"
                        >
                            <EyeOff size={20} />
                            <span>Hide</span>
                        </button>
                    </div>
                 </div>
            ))}
            {restaurants.filter(r => r.verified).length === 0 && (
                <div className="col-span-full text-center text-slate-400 dark:text-slate-500 py-8">No active restaurants found.</div>
            )}
        </div>
      </div>
    </div>
  );
}