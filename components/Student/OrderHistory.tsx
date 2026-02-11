import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus } from '../../types';
import { formatToIST } from '../../utils/dateTime';

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const colors = {
    [OrderStatus.PENDING]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200',
    [OrderStatus.ACCEPTED]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200',
    [OrderStatus.READY]: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200 animate-pulse',
    [OrderStatus.COMPLETED]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    [OrderStatus.CANCELLED]: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[status]}`}>
      {status}
    </span>
  );
};

export default function OrderHistory() {
  const { orders, restaurants, currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const myOrders = orders.filter(o => o.userId === currentUser?.id);
  
  const activeOrders = myOrders.filter(o => [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.READY].includes(o.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const historyOrders = myOrders.filter(o => [OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(o.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Orders</h1>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'active' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                  Active
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                  History
              </button>
          </div>
      </div>
      
      {displayedOrders.length === 0 ? (
        <div className="text-center text-slate-400 dark:text-slate-500 py-10">
            {activeTab === 'active' ? "No active orders. Hungry?" : "No past orders found."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedOrders.map(order => {
            const restaurant = restaurants.find(r => r.id === order.restaurantId);
            const isActive = [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.READY].includes(order.status);
            
            return (
              <div key={order.id} className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border-l-4 overflow-hidden flex flex-col justify-between transition-colors ${isActive ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white truncate pr-2">{restaurant?.name || 'Unknown Restaurant'}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatToIST(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  
                  <div className="text-sm text-slate-600 dark:text-slate-300 mb-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800">
                    {order.items.map(i => (
                        <div key={i.id} className="flex justify-between">
                            <span>{i.name}</span>
                            <span className="font-medium text-slate-400 dark:text-slate-500">x{i.quantity}</span>
                        </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 pt-0">
                    <span className="font-bold text-slate-900 dark:text-white">₹{order.totalAmount.toFixed(2)}</span>
                    
                    {isActive ? (
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-indigo-100 dark:border-indigo-900/30">
                         <span className="text-xs text-indigo-700 dark:text-indigo-300 uppercase font-bold">Pickup Code</span>
                         <span className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">{order.pickupCode}</span>
                      </div>
                    ) : (
                       <span className="text-xs text-slate-400">ID: {order.id.slice(-6)}</span>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}