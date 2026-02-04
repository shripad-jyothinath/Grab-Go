import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { UserRole } from './types';
import Auth from './components/Auth';
import Layout from './components/Layout';
import StudentDashboard from './components/Student/StudentDashboard';
import RestaurantView from './components/Student/RestaurantView';
import OrderHistory from './components/Student/OrderHistory';
import RestaurantDashboard from './components/Restaurant/RestaurantDashboard';
import MenuManager from './components/Restaurant/MenuManager';
import AdminDashboard from './components/Admin/AdminDashboard';
import Cart from './components/Student/Cart';

const ProtectedRoute = ({ children, allowedRoles }: React.PropsWithChildren<{ allowedRoles: UserRole[] }>) => {
  const { currentUser } = useStore();
  
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(currentUser.role)) return <Navigate to="/" replace />; // Redirect to home if unauthorized
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { currentUser } = useStore();

  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <Auth /> : <Navigate to="/" />} />
      
      {/* Root redirects based on role */}
      <Route path="/" element={
        currentUser ? (
          currentUser.role === UserRole.STUDENT ? <Navigate to="/student/restaurants" /> :
          currentUser.role === UserRole.RESTAURANT ? <Navigate to="/restaurant/dashboard" /> :
          <Navigate to="/admin" />
        ) : <Navigate to="/login" />
      } />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]}><Layout /></ProtectedRoute>}>
        <Route path="restaurants" element={<StudentDashboard />} />
        <Route path="restaurant/:id" element={<RestaurantView />} />
        <Route path="orders" element={<OrderHistory />} />
        <Route path="cart" element={<Cart />} />
      </Route>

      {/* Restaurant Routes */}
      <Route path="/restaurant" element={<ProtectedRoute allowedRoles={[UserRole.RESTAURANT]}><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<RestaurantDashboard />} />
        <Route path="menu" element={<MenuManager />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><Layout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
      </Route>

    </Routes>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <AppRoutes />
      </Router>
    </StoreProvider>
  );
}