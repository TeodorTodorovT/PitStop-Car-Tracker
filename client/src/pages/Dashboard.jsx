import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsApi } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import AddCarForm from '../components/cars/AddCarForm';
import DeleteCarDialog from '../components/cars/DeleteCarDialog';
import Button from '../components/ui/Button';
import { MoreVertical } from 'lucide-react';
import pitstopLogo from '../assets/pitstop-logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/DropdownMenu';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, car: null });

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: carsApi.getCars,
  });

  const deleteCarMutation = useMutation({
    mutationFn: carsApi.deleteCar,
    onSuccess: () => {
      queryClient.invalidateQueries(['cars']);
      addToast('Car deleted successfully', { type: 'success' });
    },
    onError: (error) => {
      addToast(error.message || 'Failed to delete car', { type: 'error' });
    },
  });

  const addCarMutation = useMutation({
    mutationFn: carsApi.addCar,
    onSuccess: () => {
      queryClient.invalidateQueries(['cars']);
      addToast('Car added successfully', { type: 'success' });
      setShowAddCarForm(false);
    },
    onError: (error) => {
      addToast(error.message || 'Failed to add car', { type: 'error' });
    },
  });

  const handleDeleteCar = async (car) => {
    setDeleteDialog({ isOpen: false, car: null });
    await deleteCarMutation.mutateAsync(car._id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mx-auto" />
        </div>
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4" />
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-primary">Welcome, Test! 🚗</h1>
      </div>
      
      {showAddCarForm ? (
        <AddCarForm 
          onSuccess={addCarMutation.mutateAsync} 
          onCancel={() => setShowAddCarForm(false)} 
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold">Your Cars</h2>
            <Button variant="primary" onClick={() => setShowAddCarForm(true)}>
              + Add Another Car
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div key={car._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative aspect-video bg-white">
                  <img
                    src={car.image || pitstopLogo}
                    alt={`${car.make} ${car.model}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="bg-white/80">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/cars/${car._id}/edit`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => setDeleteDialog({ isOpen: true, car })}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{car.make} {car.model}</h3>
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>Year: {car.year}</p>
                    <p>License Plate: {car.licensePlate}</p>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full mt-4"
                    onClick={() => navigate(`/dashboard/cars/${car._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <DeleteCarDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, car: null })}
        onConfirm={() => handleDeleteCar(deleteDialog.car)}
        carName={deleteDialog.car ? `${deleteDialog.car.make} ${deleteDialog.car.model}` : ''}
      />
    </>
  );
};

export default Dashboard; 