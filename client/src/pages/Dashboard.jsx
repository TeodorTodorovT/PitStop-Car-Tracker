import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import AddCarForm from '../components/cars/AddCarForm';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCars = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/cars', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cars');
      }

      const data = await response.json();
      setCars(data);
    } catch (error) {
      addToast({
        description: error.message,
        variant: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const handleAddCarSuccess = (newCar) => {
    setCars(prevCars => [newCar, ...prevCars]);
    setShowAddCarForm(false);
    addToast({
      description: 'Car added successfully!',
      variant: 'success'
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        addToast({
          description: error.message,
          variant: 'error'
        });
        navigate('/login');
      }
    };

    fetchUserData();
    fetchCars();
  }, [navigate, addToast, fetchCars]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    addToast({
      description: 'You have been logged out',
      variant: 'success'
    });
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bgColor">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">
              Welcome, {user.username}! 🚗
            </h1>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAddCarForm ? (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Add New Car</h2>
              <Button
                variant="outline"
                onClick={() => setShowAddCarForm(false)}
              >
                Cancel
              </Button>
            </div>
            <AddCarForm onSuccess={handleAddCarSuccess} />
          </div>
        ) : (
          <div>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading your cars...</p>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  No cars added yet
                </h2>
                <p className="text-gray-500 mb-8">
                  Add your first car to start tracking its maintenance
                </p>
                <Button
                  onClick={() => setShowAddCarForm(true)}
                  className="inline-flex items-center"
                >
                  <span className="mr-2">+</span> Add Your First Car
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Your Cars</h2>
                  <Button
                    onClick={() => setShowAddCarForm(true)}
                    className="inline-flex items-center"
                  >
                    <span className="mr-2">+</span> Add Another Car
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <div
                      key={car._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {car.image && (
                        <img
                          src={car.image}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {car.make} {car.model}
                        </h3>
                        <div className="mt-2 text-gray-600">
                          <p>Year: {car.year}</p>
                          <p>License Plate: {car.licensePlate}</p>
                          {car.vin && <p>VIN: {car.vin}</p>}
                        </div>
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {/* TODO: Add view details handler */}}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard; 