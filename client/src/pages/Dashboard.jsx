import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.errors?.[0]?.msg || 'Failed to fetch user data');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      addToast({
        description: error.message,
        variant: 'error',
      });
      navigate('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    addToast({
      description: 'You have been logged out',
      variant: 'success',
    });
    navigate('/login');
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bgColor p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-primary">
              Welcome, {user.username}! 🚗
            </h1>
            <Button onClick={handleLogout} variant="outline">
              Sign out
            </Button>
          </div>
          
          {/* Add your dashboard content here */}
          <p className="text-gray-500">
            Your car maintenance dashboard is coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 