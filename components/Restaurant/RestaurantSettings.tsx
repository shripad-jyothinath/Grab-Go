import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { Save, Store, Clock, CreditCard, Image as ImageIcon, Loader2, Upload } from 'lucide-react';

export default function RestaurantSettings() {
  const { currentUser, restaurants, updateRestaurantProfile } = useStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Find current restaurant data
  const myRestaurant = restaurants.find(r => r.id === currentUser?.restaurantId);

  // Time States
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('22:00');

  const [formData, setFormData] = useState({
      name: '',
      upiId: '',
      imageUrl: ''
  });

  // Helpers for time conversion
  const to24 = (t: string) => {
    if(!t) return '10:00';
    const [time, modifier] = t.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const formatTime = (time: string) => {
     if(!time) return '';
     const [h, m] = time.split(':');
     const hour = parseInt(h);
     const ampm = hour >= 12 ? 'PM' : 'AM';
     const hour12 = hour % 12 || 12;
     return `${hour12}:${m} ${ampm}`;
  };

  useEffect(() => {
      if (myRestaurant) {
          setFormData({
              name: myRestaurant.name || '',
              upiId: myRestaurant.upiId || '',
              imageUrl: myRestaurant.imageUrl || ''
          });
          
          if(myRestaurant.hours && myRestaurant.hours.includes(' - ')) {
              const [start, end] = myRestaurant.hours.split(' - ');
              setOpenTime(to24(start));
              setCloseTime(to24(end));
          }
      }
  }, [myRestaurant]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
          const res = await api.uploadFile(file);
          setFormData(prev => ({ ...prev, imageUrl: res.url }));
      } catch (e) {
          alert("Failed to upload image");
      } finally {
          setUploading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!myRestaurant) return;

      setLoading(true);
      setSuccess(false);
      
      const hoursStr = `${formatTime(openTime)} - ${formatTime(closeTime)}`;
      
      try {
          await updateRestaurantProfile(myRestaurant.id, {
              ...formData,
              hours: hoursStr
          });
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
          alert("Failed to update settings");
      } finally {
          setLoading(false);
      }
  };

  if (!myRestaurant) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Restaurant Settings</h1>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Cover Image Upload */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cover Image</label>
                    <div className="h-48 w-full rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 relative group">
                        {formData.imageUrl ? (
                            <img src={formData.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                type="button" 
                                disabled={uploading}
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-100 transition"
                            >
                                {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                                Upload New
                            </button>
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                {/* Form Fields */}
                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Restaurant Name</label>
                        <div className="relative">
                            <Store className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Opening Time</label>
                             <div className="relative">
                                <Clock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input 
                                    type="time" 
                                    required
                                    value={openTime}
                                    onChange={e => setOpenTime(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                             </div>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Closing Time</label>
                             <div className="relative">
                                <Clock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input 
                                    type="time" 
                                    required
                                    value={closeTime}
                                    onChange={e => setCloseTime(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                             </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">UPI ID (for payments)</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                required
                                placeholder="merchant@upi"
                                value={formData.upiId}
                                onChange={e => setFormData({...formData, upiId: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {success && <span className="text-green-600 dark:text-green-400 text-sm font-medium animate-in fade-in">Settings Saved Successfully!</span>}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="ml-auto bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}