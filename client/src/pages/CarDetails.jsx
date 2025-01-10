import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Calendar, Key, Hash, Clock, Pencil, Trash2 } from 'lucide-react';
import logo from '../assets/pitstop-logo.png';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/cars/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch car details');
        }

        const data = await response.json();
        setCar(data);
      } catch (error) {
        addToast({
          description: error.message,
          variant: 'error'
        });
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarDetails();
  }, [id, navigate, addToast]);

  const handleDeleteCar = async (carId) => {
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

      addToast({
        description: 'Car deleted successfully',
        variant: 'success'
      });
      navigate('/dashboard');
    } catch (error) {
      addToast({
        description: error.message,
        variant: 'error'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bgColor flex items-center justify-center">
        <p className="text-gray-500">Loading car details...</p>
      </div>
    );
  }

  if (!car) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-bgColor">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          className="mb-6 flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 border border-gray-200"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex justify-center">
          {/* Car Details Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl">
            <div className="relative h-80">
              <img
                src={car.image || logo}
                alt={car.image ? `${car.make} ${car.model}` : 'PitStop Logo'}
                className={`w-full h-full ${car.image ? 'object-cover' : 'object-contain p-8 bg-gray-50'}`}
              />
            </div>

            <div className="p-8">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {car.make} {car.model}
                  </h1>
                  <div className="flex gap-2">
                    <Button
                      className="bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
                      onClick={() => navigate(`/dashboard/cars/${car._id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this car?')) {
                          handleDeleteCar(car._id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{car.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    <span>{car.licensePlate}</span>
                  </div>
                  {car.vin && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      <span>VIN: {car.vin}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Last Updated
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(car.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Added to PitStop
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(car.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails; 