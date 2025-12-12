import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import BankAccounts from '../pages/BankAccounts.jsx';
import Transactions from '../pages/Transactions.jsx';
import Goals from '../pages/Goals.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bank-accounts" element={<BankAccounts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/goals" element={<Goals />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

