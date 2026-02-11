import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Plus, Minus, ArrowLeft } from 'lucide-react';
import { isRestaurantOpen } from '../../utils/dateTime';

export default function RestaurantView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { restaurants, menuItems, addToCart, cart, updateCartQuantity, removeFromCart } = useStore();
  
  const restaurant = restaurants.find(r => r.id === id);
  // We show all items, but disable unavailable ones
  const items = menuItems.filter(m => m.restaurantId === id);

  if (!restaurant) return <div>Restaurant not found</div>;

  const getItemQuantity = (itemId: string) => {
    return cart.find(c => c.id === itemId)?.quantity || 0;
  };

  const handleAdd = (item: any) => {
    addToCart(item);
  };

  const handleRemove = (itemId: string) => {
    updateCartQuantity(itemId, -1);
  };

  // Logic: Restaurant is open if (Manually Open IN DB) AND (Currently within Operating Hours)
  
  const isWithinHours = isRestaurantOpen(restaurant.hours);
  const isOpen = restaurant.isOpen;

  return (
    <div className="pb-20 md:pb-0 relative min-h-[80vh]">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
        <ArrowLeft size={16} /> Back to Restaurants
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{restaurant.name}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">{restaurant.description}</p>
        <div className="flex gap-2 mt-3">
             {restaurant.cuisine.map(c => (
                  <span key={c} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300">{c}</span>
             ))}
        </div>
        {restaurant.hours && (
            <div className="flex items-center gap-2 mt-2">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 inline-block px-2 py-1 rounded">
                    Hours: {restaurant.hours}
                </p>
                {!isWithinHours && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded dark:bg-orange-900/30 dark:text-orange-400">
                        Currently outside hours
                    </span>
                )}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {items.map(item => {
          const qty = getItemQuantity(item.id);
          const isAvailable = item.isAvailable;
          
          return (
            <div key={item.id} className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-center border border-transparent dark:border-slate-800 hover:border-indigo-50 dark:hover:border-indigo-900/50 ${!isAvailable ? 'opacity-60 grayscale' : ''}`}>
              <div className="flex-1 pr-4">
                <div className="flex justify-between items-start">
                   <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{item.name}</h3>
                   <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded text-sm">₹{item.price.toFixed(2)}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{item.description}</p>
                <div className="flex gap-2 mt-2">
                    <span className="inline-block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                    {item.category}
                    </span>
                    {!isAvailable && (
                        <span className="inline-block text-[10px] uppercase tracking-wider text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded font-bold">
                        Sold Out
                        </span>
                    )}
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 pl-2 border-l border-slate-50 dark:border-slate-800">
                {qty === 0 ? (
                  <button 
                    onClick={() => handleAdd(item)}
                    disabled={!isOpen || !isAvailable}
                    className={`p-2 rounded-full shadow-sm transition ${isOpen && isAvailable ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
                  >
                    <Plus size={24} />
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full p-1 shadow-inner dark:shadow-none">
                    <button onClick={() => handleAdd(item)} disabled={!isAvailable} className="p-1 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition disabled:opacity-50"><Plus size={18} /></button>
                    <span className="font-bold text-sm text-indigo-900 dark:text-indigo-100 w-6 text-center">{qty}</span>
                    <button onClick={() => handleRemove(item.id)} className="p-1 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition"><Minus size={18} /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {!isOpen && (
        <div className="fixed bottom-20 left-4 right-4 md:static md:mt-8 bg-red-500 text-white text-center py-3 rounded-lg shadow-lg font-medium">
          {isWithinHours 
            ? "Restaurant is currently set to OFFLINE by owner." 
            : `Closed. Opens at ${restaurant.hours?.split(' - ')[0] || 'Unknown'}`
          }
        </div>
      )}
    </div>
  );
}