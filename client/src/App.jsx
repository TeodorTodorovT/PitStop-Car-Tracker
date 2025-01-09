import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContextProvider } from './contexts/ToastContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <ToastContextProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </ToastContextProvider>
    </Router>
  );
};

export default App;
