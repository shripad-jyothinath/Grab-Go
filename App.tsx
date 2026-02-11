import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { UserRole } from './types';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Loading from './components/Loading';

// === CODE SPLITTING ===
// Lazy load pages to reduce initial bundle size
const StudentDashboard = lazy(() => import('./components/Student/StudentDashboard'));
const RestaurantView = lazy(() => import('./components/Student/RestaurantView'));
const OrderHistory = lazy(() => import('./components/Student/OrderHistory'));
const Cart = lazy(() => import('./components/Student/Cart'));

const RestaurantDashboard = lazy(() => import('./components/Restaurant/RestaurantDashboard'));
const MenuManager = lazy(() => import('./components/Restaurant/MenuManager'));
const RestaurantSettings = lazy(() => import('./components/Restaurant/RestaurantSettings'));
const RestaurantHistory = lazy(() => import('./components/Restaurant/RestaurantHistory'));

const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));

const ProtectedRoute = ({ children, allowedRoles }: React.PropsWithChildren<{ allowedRoles: UserRole[] }>) => {
  const { currentUser } = useStore();
  
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(currentUser.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { currentUser } = useStore();

  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <Auth /> : <Navigate to="/" replace />} />
      
      {/* Root redirects based on role */}
      <Route path="/" element={
        currentUser ? (
          currentUser.role === UserRole.STUDENT ? <Navigate to="/student/restaurants" replace /> :
          currentUser.role === UserRole.RESTAURANT ? <Navigate to="/restaurant/dashboard" replace /> :
          <Navigate to="/admin" replace />
        ) : <Navigate to="/login" replace />
      } />

      {/* Student Routes */}
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
          <Layout>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="restaurants" element={<StudentDashboard />} />
                <Route path="restaurant/:id" element={<RestaurantView />} />
                <Route path="orders" element={<OrderHistory />} />
                <Route path="cart" element={<Cart />} />
                <Route path="*" element={<Navigate to="restaurants" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />

      {/* Restaurant Routes */}
      <Route path="/restaurant/*" element={
        <ProtectedRoute allowedRoles={[UserRole.RESTAURANT]}>
          <Layout>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="dashboard" element={<RestaurantDashboard />} />
                <Route path="menu" element={<MenuManager />} />
                <Route path="settings" element={<RestaurantSettings />} />
                <Route path="history" element={<RestaurantHistory />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <Layout>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />

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