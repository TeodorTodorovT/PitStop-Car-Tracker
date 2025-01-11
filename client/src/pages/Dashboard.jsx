import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, carsApi } from '../lib/api';
import Button from '../components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../components/ui/DropdownMenu';
import AddCarForm from '../components/cars/AddCarForm';
import EditCarForm from '../components/cars/EditCarForm';
import DeleteCarDialog from '../components/cars/DeleteCarDialog';
import CarSkeleton from '../components/cars/CarSkeleton';
import { MoreVertical, Info, Pencil, Trash2 } from 'lucide-react';
import logo from '../assets/pitstop-logo.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, car: null });
  const [openMenuId, setOpenMenuId] = useState(null);

  // Fetch user profile
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getProfile,
    onError: (error) => {
      addToast({
        description: error.message,
        variant: 'error'
      });
      navigate('/login');
    }
  });

  // Fetch cars
  const { data: cars = [], isLoading: isLoadingCars } = useQuery({
    queryKey: ['cars'],
    queryFn: carsApi.getCars,
    onError: (error) => {
      addToast({
        description: error.message,
        variant: 'error'
      });
    }
  });

  // Add car mutation
  const addCarMutation = useMutation({
    mutationFn: carsApi.addCar,
    onSuccess: (newCar) => {
      queryClient.setQueryData(['cars'], (old = []) => {
        // Ensure we don't add duplicates
        const exists = old.some(car => car._id === newCar._id);
        if (exists) return old;
        return [newCar, ...old];
      });
      setShowAddCarForm(false);
      addToast({
        description: 'Car added successfully!',
        variant: 'success'
      });
    },
    onError: (error) => {
      addToast({
        description: error.message,
        variant: 'error'
      });
    }
  });

  // Update car mutation
  const updateCarMutation = useMutation({
    mutationFn: ({ id, data }) => carsApi.updateCar(id, data),
    onSuccess: (updatedCar) => {
      queryClient.setQueryData(['cars'], (old) => 
        old?.map(car => car._id === updatedCar._id ? updatedCar : car)
      );
      setEditingCar(null);
      addToast({
        description: 'Car updated successfully!',
        variant: 'success'
      });
    },
    onError: (error) => {
      addToast({
        description: error.message,
        variant: 'error'
      });
    }
  });

  // Delete car mutation
  const deleteCarMutation = useMutation({
    mutationFn: (id) => carsApi.deleteCar(id),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['cars']);

      // Snapshot the previous value
      const previousCars = queryClient.getQueryData(['cars']);

      // Optimistically remove the car from the cache
      queryClient.setQueryData(['cars'], old => old?.filter(car => car._id !== deletedId));

      return { previousCars };
    },
    onSuccess: () => {
      setDeleteDialog({ isOpen: false, car: null });
      addToast({
        description: 'Car deleted successfully',
        variant: 'success'
      });
    },
    onError: (error, _, context) => {
      // Rollback to the previous value on error
      queryClient.setQueryData(['cars'], context.previousCars);
      addToast({
        description: error.message,
        variant: 'error'
      });
      setDeleteDialog({ isOpen: false, car: null });
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['cars']);
    }
  });

  const handleAddCarSuccess = async (formData) => {
    if (addCarMutation.isLoading) return null;
    try {
      const result = await addCarMutation.mutateAsync(formData);
      return result;
    } catch {
      return null;
    }
  };

  const handleEditCarSuccess = (data) => {
    updateCarMutation.mutate({ id: editingCar._id, data });
  };

  const handleDeleteCar = async () => {
    if (!deleteDialog.car) return;
    deleteCarMutation.mutate(deleteDialog.car._id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    queryClient.clear();
    addToast({
      description: 'You have been logged out',
      variant: 'success'
    });
    navigate('/login');
  };

  const isLoading = isLoadingUser || isLoadingCars;

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-bgColor">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <CarSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgColor">
      <nav className="bg-white shadow-md" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">
              Welcome, {user.username}! 🚗
            </h1>
            <Button 
              onClick={handleLogout} 
              className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-200"
              aria-label="Logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
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
            </div>
            <AddCarForm 
              onSuccess={handleAddCarSuccess} 
              onCancel={() => setShowAddCarForm(false)}
            />
          </div>
        ) : (
          <div>
            {isLoading ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Your Cars</h2>
                  <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, index) => (
                    <CarSkeleton key={index} />
                  ))}
                </div>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-12" role="status" aria-label="No cars found">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  No cars added yet
                </h2>
                <p className="text-gray-500 mb-8">
                  Add your first car to start tracking its maintenance
                </p>
                <Button
                  onClick={() => setShowAddCarForm(true)}
                  className="inline-flex items-center bg-primary hover:bg-primary/90 text-white"
                  aria-label="Add your first car"
                >
                  <span className="mr-2" aria-hidden="true">+</span> Add Your First Car
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Your Cars</h2>
                  <Button
                    onClick={() => setShowAddCarForm(true)}
                    className="inline-flex items-center bg-primary hover:bg-primary/90 text-white"
                    aria-label="Add another car"
                  >
                    <span className="mr-2" aria-hidden="true">+</span> Add Another Car
                  </Button>
                </div>
                <div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  role="list"
                  aria-label="Cars list"
                >
                  {cars.map((car) => (
                    <div
                      key={car._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      role="listitem"
                    >
                      <div className="relative">
                        <img
                          src={car.image || logo}
                          alt={car.image ? `${car.make} ${car.model}` : 'PitStop Logo'}
                          className={`w-full h-48 ${car.image ? 'object-cover' : 'object-contain p-8 bg-gray-50'}`}
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2">
                          <DropdownMenu 
                            open={openMenuId === car._id}
                            onOpenChange={(open) => setOpenMenuId(open ? car._id : null)}
                          >
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="h-8 w-8 p-0 bg-white hover:bg-gray-100 border border-gray-200"
                                size="icon"
                                aria-label="Car options"
                              >
                                <MoreVertical className="h-4 w-4 text-gray-600" aria-hidden="true" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                                onClick={() => {
                                  setEditingCar(car);
                                  setOpenMenuId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingCar(car);
                                    setOpenMenuId(null);
                                  }
                                }}
                                role="menuitem"
                                tabIndex={0}
                              >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 focus:bg-red-50"
                                onClick={() => {
                                  setDeleteDialog({ isOpen: true, car });
                                  setOpenMenuId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setDeleteDialog({ isOpen: true, car });
                                    setOpenMenuId(null);
                                  }
                                }}
                                role="menuitem"
                                tabIndex={0}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
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
                            aria-label={`View details for ${car.make} ${car.model}`}
                          >
                            <Info className="h-4 w-4 mr-2" aria-hidden="true" />
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

      <DeleteCarDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, car: null })}
        onConfirm={handleDeleteCar}
        carName={deleteDialog.car ? `${deleteDialog.car.make} ${deleteDialog.car.model}` : ''}
      />
    </div>
  );
};

export default Dashboard; 