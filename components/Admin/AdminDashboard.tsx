import React from 'react';
import { useStore } from '../../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, TrendingUp, Users, Store } from 'lucide-react';

export default function AdminDashboard() {
  const { restaurants, orders, users, isTestMode, toggleTestMode, verifyRestaurant } = useStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  // Mock Chart Data
  const data = [
    { name: 'Mon', orders: 12 },
    { name: 'Tue', orders: 19 },
    { name: 'Wed', orders: 3 },
    { name: 'Thu', orders: 5 },
    { name: 'Fri', orders: 20 },
    { name: 'Sat', orders: 30 },
    { name: 'Sun', orders: 25 },
  ];

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
    <div className="space-y-8">
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
        <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={TrendingUp} color="bg-green-500" />
        <StatCard title="Total Orders" value={orders.length} icon={ShieldCheck} color="bg-indigo-500" />
        <StatCard title="Active Users" value={users.length} icon={Users} color="bg-blue-500" />
        <StatCard title="Restaurants" value={restaurants.length} icon={Store} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Weekly Order Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
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
                <button 
                  onClick={() => verifyRestaurant(r.id)}
                  className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition"
                >
                  Approve
                </button>
              </div>
            ))}
             {restaurants.filter(r => !r.verified).length === 0 && (
                <div className="text-center text-slate-400 dark:text-slate-500 py-8">All restaurants approved.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}