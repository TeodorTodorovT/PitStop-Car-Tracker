import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        addToast({
          title: 'Error',
          description: 'Failed to load user data',
          variant: 'error',
        });
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, addToast]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    addToast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
      variant: 'success',
    });
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgColor">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bgColor p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-primary">
              Welcome, {user.username}! 🚗
            </h1>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="hover:bg-red-50 hover:text-red-500 hover:border-red-500"
            >
              Logout
            </Button>
          </div>
          <p className="text-gray-600">
            Your car maintenance dashboard is coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 