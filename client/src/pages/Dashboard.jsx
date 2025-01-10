import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../components/ui/DropdownMenu';
import AddCarForm from '../components/cars/AddCarForm';
import EditCarForm from '../components/cars/EditCarForm';
import { MoreVertical, Info, Pencil, Trash2 } from 'lucide-react';
import logo from '../assets/pitstop-logo.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
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

  const handleEditCarSuccess = (updatedCar) => {
    setCars(prevCars => 
      prevCars.map(car => car._id === updatedCar._id ? updatedCar : car)
    );
    setEditingCar(null);
    addToast({
      description: 'Car updated successfully!',
      variant: 'success'
    });
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/cars/${carId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete car');
      }

      setCars(prevCars => prevCars.filter(car => car._id !== carId));
      addToast({
        description: 'Car deleted successfully',
        variant: 'success'
      });
    } catch (error) {
      addToast({
        description: error.message,
        variant: 'error'
      });
    }
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
            <Button 
              onClick={handleLogout} 
              className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-200"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {editingCar ? (
          <div className="mb-8">
            <EditCarForm
              initialData={editingCar}
              onSuccess={handleEditCarSuccess}
              onCancel={() => setEditingCar(null)}
            />
          </div>
        ) : showAddCarForm ? (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Add New Car</h2>
              <Button
                className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-200"
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
                  className="inline-flex items-center bg-primary hover:bg-primary/90 text-white"
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
                    className="inline-flex items-center bg-primary hover:bg-primary/90 text-white"
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
                      <div className="relative">
                        <img
                          src={car.image || logo}
                          alt={car.image ? `${car.make} ${car.model}` : 'PitStop Logo'}
                          className={`w-full h-48 ${car.image ? 'object-cover' : 'object-contain p-8 bg-gray-50'}`}
                        />
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="h-8 w-8 p-0 bg-white hover:bg-gray-100 border border-gray-200"
                                size="icon"
                              >
                                <MoreVertical className="h-4 w-4 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                                onClick={() => setEditingCar(car)}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 focus:bg-red-50"
                                onClick={() => handleDeleteCar(car._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
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
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                            onClick={() => navigate(`/dashboard/cars/${car._id}`)}
                          >
                            <Info className="h-4 w-4 mr-2" />
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