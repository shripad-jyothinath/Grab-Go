import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Search, MapPin, Clock } from 'lucide-react';

export default function StudentDashboard() {
  const { restaurants } = useStore();
  const [search, setSearch] = useState('');

  const filteredRestaurants = restaurants.filter(r => 
    r.verified && 
    (r.name.toLowerCase().includes(search.toLowerCase()) || 
     r.cuisine.some(c => c.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-2xl mx-auto md:mx-0">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search food or restaurants..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-none shadow-sm rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 transition-colors"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map(restaurant => (
          <Link to={`/student/restaurant/${restaurant.id}`} key={restaurant.id} className={`block bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-slate-800/50 overflow-hidden transition hover:shadow-md hover:-translate-y-1 ${!restaurant.isOpen ? 'opacity-75 grayscale' : ''}`}>
            <div className="h-40 w-full relative">
              <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
              {!restaurant.isOpen && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Closed</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{restaurant.name}</h3>
                {restaurant.isOpen && (
                   <span className="text-green-600 dark:text-green-400 text-xs font-medium bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                     <Clock size={12} /> 15-20 min
                   </span>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 line-clamp-1">{restaurant.description}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                {restaurant.cuisine.map(c => (
                  <span key={c} className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">{c}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
        {filteredRestaurants.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-400 dark:text-slate-500">
            <p>No restaurants found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}