import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ErrorBoundary from './components/ErrorBoundary';
import AuthLayout from './components/layout/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CarDetails from './pages/CarDetails';
import EditCar from './pages/EditCar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<AuthLayout><Dashboard /></AuthLayout>} />
              <Route path="/dashboard/cars/:id" element={<AuthLayout><CarDetails /></AuthLayout>} />
              <Route path="/dashboard/cars/:id/edit" element={<AuthLayout><EditCar /></AuthLayout>} />
              <Route path="/" element={<AuthLayout><Dashboard /></AuthLayout>} />
              <Route path="*" element={<Login />} />
            </Routes>
          </Router>
        </ToastProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
