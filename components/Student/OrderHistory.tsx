import React from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus } from '../../types';
import { Clock, CheckCircle, Package, XCircle, AlertCircle } from 'lucide-react';

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
  const myOrders = orders.filter(o => o.userId === currentUser?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="pb-20 md:pb-0">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Your Orders</h1>
      
      {myOrders.length === 0 ? (
        <div className="text-center text-slate-400 dark:text-slate-500 py-10">No orders yet. Hungry?</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myOrders.map(order => {
            const restaurant = restaurants.find(r => r.id === order.restaurantId);
            const isActive = [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.READY].includes(order.status);
            
            return (
              <div key={order.id} className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border-l-4 overflow-hidden flex flex-col justify-between transition-colors ${isActive ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white truncate pr-2">{restaurant?.name || 'Unknown Restaurant'}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
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
                    <span className="font-bold text-slate-900 dark:text-white">${order.totalAmount.toFixed(2)}</span>
                    
                    {isActive && (
                      <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                         <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Pickup Code</span>
                         <span className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">{order.pickupCode}</span>
                      </div>
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