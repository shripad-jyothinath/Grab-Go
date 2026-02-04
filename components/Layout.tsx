import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import { 
  Home, 
  ShoppingBag, 
  LayoutDashboard, 
  Menu as MenuIcon, 
  LogOut, 
  ShieldAlert,
  ShoppingCart
} from 'lucide-react';

const Layout: React.FC = () => {
  const { currentUser, logout, isTestMode, cart } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Student Layout (Responsive: Bottom Nav on Mobile, Top Nav on Desktop)
  if (currentUser?.role === UserRole.STUDENT) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0 transition-colors duration-200">
        {isTestMode && (
          <div className="bg-yellow-400 text-yellow-900 text-xs text-center py-1 font-bold">
            TEST MODE ENABLED - ORDERS ARE SIMULATED
          </div>
        )}
        
        {/* Responsive Header */}
        <header className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-slate-800/50 sticky top-0 z-30 px-4 py-3 border-b border-transparent dark:border-slate-800 transition-colors duration-200">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Grab&Go</h1>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/student/restaurants" className={`text-sm font-medium transition ${location.pathname.includes('restaurants') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Eat</Link>
                <Link to="/student/orders" className={`text-sm font-medium transition ${location.pathname.includes('orders') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Orders</Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
               <Link to="/student/cart" className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition group">
                <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
                {cart.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                    {cart.length}
                  </span>
                )}
              </Link>
              <button onClick={handleLogout} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1">
                <span className="hidden md:inline">Logout</span>
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="max-w-7xl mx-auto p-4 md:p-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-3 pb-safe z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-200">
          <Link to="/student/restaurants" className={`flex flex-col items-center gap-1 text-xs ${location.pathname.includes('restaurants') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
            <Home size={22} />
            <span>Eat</span>
          </Link>
          <Link to="/student/orders" className={`flex flex-col items-center gap-1 text-xs ${location.pathname.includes('orders') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
            <ShoppingBag size={22} />
            <span>Orders</span>
          </Link>
        </nav>
      </div>
    );
  }

  // Restaurant & Admin Layout (Responsive: Sidebar on Desktop, Header + Bottom Nav on Mobile)
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row pb-20 md:pb-0 transition-colors duration-200">
       {isTestMode && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 text-yellow-900 text-xs text-center py-1 font-bold md:hidden">
            TEST MODE
          </div>
        )}
      
      {/* Mobile Header */}
      <header className="bg-white dark:bg-slate-900 p-4 shadow md:hidden flex justify-between items-center sticky top-0 z-10 border-b dark:border-slate-800">
        <span className="font-bold text-indigo-600 dark:text-indigo-400">Grab&Go Panel</span>
        <button onClick={handleLogout} className="text-slate-600 dark:text-slate-300"><LogOut size={20} /></button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 dark:bg-black text-white min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight">Grab&Go</h2>
          <p className="text-slate-400 text-sm mt-1 capitalize">{currentUser?.role.toLowerCase()} Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {currentUser?.role === UserRole.RESTAURANT && (
            <>
              <Link to="/restaurant/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${location.pathname.includes('dashboard') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <Link to="/restaurant/menu" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${location.pathname.includes('menu') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <MenuIcon size={20} />
                Menu Manager
              </Link>
            </>
          )}

          {currentUser?.role === UserRole.ADMIN && (
            <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${location.pathname.includes('admin') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
              <ShieldAlert size={20} />
              Admin Overview
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-white transition w-full px-4 py-2">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full text-slate-900 dark:text-slate-100">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav for Restaurant/Admin */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-3 pb-safe z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-200">
         {currentUser?.role === UserRole.RESTAURANT && (
            <>
              <Link to="/restaurant/dashboard" className={`flex flex-col items-center gap-1 text-xs ${location.pathname.includes('dashboard') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                <LayoutDashboard size={22} />
                <span>Dashboard</span>
              </Link>
              <Link to="/restaurant/menu" className={`flex flex-col items-center gap-1 text-xs ${location.pathname.includes('menu') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                <MenuIcon size={22} />
                <span>Menu</span>
              </Link>
            </>
          )}
          {currentUser?.role === UserRole.ADMIN && (
             <Link to="/admin" className={`flex flex-col items-center gap-1 text-xs ${location.pathname.includes('admin') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
              <ShieldAlert size={22} />
              <span>Overview</span>
            </Link>
          )}
      </nav>
    </div>
  );
};

export default Layout;