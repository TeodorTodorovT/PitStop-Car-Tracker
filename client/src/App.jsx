import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContextProvider } from './contexts/ToastContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CarDetails from './pages/CarDetails';
import EditCarForm from './components/cars/EditCarForm';

const App = () => {
  return (
    <Router>
      <ToastContextProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/cars/:id" element={<CarDetails />} />
          <Route path="/dashboard/cars/:id/edit" element={
            <div className="min-h-screen bg-bgColor py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <EditCarForm />
              </div>
            </div>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </ToastContextProvider>
    </Router>
  );
};

export default App;
