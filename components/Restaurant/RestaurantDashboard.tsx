import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus, Order } from '../../types';
import { Check, X, Clock, BellRing, User } from 'lucide-react';

const OrderCard: React.FC<{ order: Order; action?: React.ReactNode }> = ({ order, action }) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-3 animate-in fade-in slide-in-from-bottom-2">
    <div className="flex justify-between items-start mb-2">
      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">#{order.id.slice(-4)}</span>
      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">${order.totalAmount.toFixed(2)}</span>
    </div>
    <div className="space-y-1 mb-3">
      {order.items.map((item, idx) => (
        <div key={idx} className="flex justify-between text-sm">
          <span className="text-slate-700 dark:text-slate-200">{item.name}</span>
          <span className="font-bold text-slate-500 dark:text-slate-400">x{item.quantity}</span>
        </div>
      ))}
    </div>
    {order.transactionRef && (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs p-2 rounded mb-3">
        UPI Ref: {order.transactionRef}
      </div>
    )}
    {action}
  </div>
);

export default function RestaurantDashboard() {
  const { currentUser, orders, updateOrderStatus, verifyPickup } = useStore();
  const [verifyCode, setVerifyCode] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const myOrders = orders.filter(o => o.restaurantId === currentUser?.restaurantId);
  const pending = myOrders.filter(o => o.status === OrderStatus.PENDING);
  const accepted = myOrders.filter(o => o.status === OrderStatus.ACCEPTED);
  const ready = myOrders.filter(o => o.status === OrderStatus.READY);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeOrderId) {
      if (verifyPickup(activeOrderId, verifyCode)) {
        alert("Pickup Verified! Order Completed.");
        setVerifyCode('');
        setActiveOrderId(null);
      } else {
        alert("Incorrect Pickup Code!");
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Order Board</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-x-auto pb-4">
        {/* Pending Column */}
        <div className="min-w-[300px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-orange-100 dark:bg-orange-900/40 p-2 rounded-lg text-orange-600 dark:text-orange-300"><Clock size={20} /></div>
            <h2 className="font-bold text-slate-700 dark:text-slate-200">Incoming ({pending.length})</h2>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl min-h-[500px] border border-transparent dark:border-slate-800">
            {pending.map(order => (
              <OrderCard key={order.id} order={order} action={
                <div className="flex gap-2 mt-2">
                  <button onClick={() => updateOrderStatus(order.id, OrderStatus.CANCELLED)} className="flex-1 py-2 rounded bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 font-medium text-sm transition">Decline</button>
                  <button onClick={() => updateOrderStatus(order.id, OrderStatus.ACCEPTED)} className="flex-1 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 font-medium text-sm transition">Accept</button>
                </div>
              } />
            ))}
            {pending.length === 0 && <p className="text-center text-slate-400 dark:text-slate-500 text-sm mt-10">No new orders</p>}
          </div>
        </div>

        {/* Preparation Column */}
        <div className="min-w-[300px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-blue-600 dark:text-blue-300"><User size={20} /></div>
            <h2 className="font-bold text-slate-700 dark:text-slate-200">Preparing ({accepted.length})</h2>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl min-h-[500px] border border-transparent dark:border-slate-800">
            {accepted.map(order => (
              <OrderCard key={order.id} order={order} action={
                <button onClick={() => updateOrderStatus(order.id, OrderStatus.READY)} className="w-full mt-2 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2 transition">
                  <BellRing size={16} /> Mark Ready
                </button>
              } />
            ))}
          </div>
        </div>

        {/* Ready / Verification Column */}
        <div className="min-w-[300px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg text-green-600 dark:text-green-300"><Check size={20} /></div>
            <h2 className="font-bold text-slate-700 dark:text-slate-200">Ready for Pickup ({ready.length})</h2>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl min-h-[500px] border border-transparent dark:border-slate-800">
             {ready.map(order => (
              <OrderCard key={order.id} order={order} action={
                activeOrderId === order.id ? (
                  <form onSubmit={handleVerify} className="mt-2 flex gap-2">
                    <input 
                      type="text" 
                      maxLength={4}
                      placeholder="Code" 
                      className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-center font-mono focus:ring-2 focus:ring-green-500 outline-none"
                      value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="flex-1 bg-green-600 text-white rounded font-medium text-sm hover:bg-green-700 transition">Verify</button>
                    <button type="button" onClick={() => setActiveOrderId(null)} className="px-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition"><X size={16} /></button>
                  </form>
                ) : (
                  <button onClick={() => { setActiveOrderId(order.id); setVerifyCode(''); }} className="w-full mt-2 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-medium text-sm transition">
                    Complete Pickup
                  </button>
                )
              } />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}