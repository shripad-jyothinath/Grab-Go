import React from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus } from '../../types';
import { formatToIST } from '../../utils/dateTime';

export default function RestaurantHistory() {
  const { currentUser, orders } = useStore();
  
  // Filter for completed or cancelled orders for this restaurant
  const historyOrders = orders.filter(o => 
      o.restaurantId === currentUser?.restaurantId && 
      (o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CANCELLED)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order History</h1>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {historyOrders.length === 0 ? (
           <div className="p-8 text-center text-slate-400">No past orders found.</div>
        ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                 <tr>
                   <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Date</th>
                   <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Order ID</th>
                   <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Items</th>
                   <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Total</th>
                   <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {historyOrders.map(order => (
                   <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                       {formatToIST(order.createdAt)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-500">
                       #{order.id.slice(-6)}
                     </td>
                     <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                       <div className="max-w-xs truncate">
                         {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                       ₹{order.totalAmount.toFixed(2)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                         order.status === OrderStatus.COMPLETED 
                           ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                           : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                       }`}>
                         {order.status}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </div>
    </div>
  );
}