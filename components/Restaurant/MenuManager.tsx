import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { extractMenuFromImage } from '../../services/geminiService';
import { MenuItem } from '../../types';
import { Plus, Trash2, Edit2, Sparkles, Loader2, Upload } from 'lucide-react';

export default function MenuManager() {
  const { currentUser, menuItems, addMenuItem, deleteMenuItem, updateMenuItem } = useStore();
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myItems = menuItems.filter(m => m.restaurantId === currentUser?.restaurantId);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({ name: '', description: '', price: 0, category: 'Main' });

  const handleAIUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsAIProcessing(true);
    try {
      const extractedItems = await extractMenuFromImage(file);
      if (extractedItems.length > 0) {
        if(window.confirm(`AI found ${extractedItems.length} items. Import them?`)) {
            extractedItems.forEach(item => {
                if (item.name && item.price && currentUser?.restaurantId) {
                    addMenuItem({
                        name: item.name,
                        description: item.description || '',
                        price: item.price,
                        category: item.category || 'Main',
                        restaurantId: currentUser.restaurantId,
                        isAvailable: true
                    });
                }
            });
        }
      } else {
        alert("Could not identify menu items. Please try a clearer image.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to analyze menu image.");
    } finally {
      setIsAIProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.restaurantId) {
      if (editingId) {
        updateMenuItem({ ...formData, id: editingId, restaurantId: currentUser.restaurantId } as MenuItem);
      } else {
        addMenuItem({ ...formData, restaurantId: currentUser.restaurantId, isAvailable: true } as MenuItem);
      }
      setFormData({ name: '', description: '', price: 0, category: 'Main' });
      setEditingId(null);
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setFormData(item);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Menu List */}
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Menu</h1>
          <button onClick={() => fileInputRef.current?.click()} disabled={isAIProcessing} className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-2">
            {isAIProcessing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            AI Import
          </button>
          <input type="file" ref={fileInputRef} onChange={handleAIUpload} className="hidden" accept="image/*" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Item</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Category</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Price</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-200">{item.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.category}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(item)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"><Edit2 size={16} /></button>
                      <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {myItems.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">No items yet. Add manually or use AI Import.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Form */}
      <div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 sticky top-8">
          <h2 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">{editingId ? 'Edit Item' : 'Add New Item'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea 
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Price</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                />
              </div>
               <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>
            </div>
            
            <div className="pt-2 flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                {editingId ? 'Update Item' : 'Add Item'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', description: '', price: 0, category: 'Main' }); }} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}