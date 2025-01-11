import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsApi } from '../lib/api';
import Button from '../components/ui/Button';
import { ArrowLeft, Calendar, Key, Hash, Clock, Pencil, Trash2 } from 'lucide-react';
import DeleteCarDialog from '../components/cars/DeleteCarDialog';
import EditCarForm from '../components/cars/EditCarForm';
import Skeleton from '../components/ui/Skeleton';
import logo from '../assets/pitstop-logo.png';

const CarDetailsSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl">
    <Skeleton className="w-full h-80" />
    <div className="p-8">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
      <div className="border-t border-gray-200 pt-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  </div>
);

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch car details
  const { data: car, isLoading } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carsApi.getCar(id),
    onError: (error) => {
      addToast({
        description: error.message,
        variant: 'error'
      });
      navigate('/dashboard');
    }
  });

  // Update car mutation
  const updateCarMutation = useMutation({
    mutationFn: ({ id, data }) => carsApi.updateCar(id, data),
    onSuccess: (updatedCar) => {
      queryClient.setQueryData(['car', id], updatedCar);
      queryClient.invalidateQueries(['cars']);
      setIsEditing(false);
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
    mutationFn: () => carsApi.deleteCar(id),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['cars']);
      await queryClient.cancelQueries(['car', id]);

      // Snapshot the previous value
      const previousCars = queryClient.getQueryData(['cars']);

      // Optimistically remove the car from the cache
      queryClient.setQueryData(['cars'], old => old?.filter(car => car._id !== id));

      return { previousCars };
    },
    onSuccess: () => {
      setShowDeleteDialog(false);
      addToast({
        description: 'Car deleted successfully',
        variant: 'success'
      });
      navigate('/dashboard');
    },
    onError: (error, _, context) => {
      // Rollback to the previous value on error
      queryClient.setQueryData(['cars'], context.previousCars);
      addToast({
        description: error.message,
        variant: 'error'
      });
      setShowDeleteDialog(false);
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['cars']);
      queryClient.invalidateQueries(['car', id]);
    }
  });

  const handleEditSuccess = (data) => {
    updateCarMutation.mutate({ id, data });
  };

  const handleDeleteCar = () => {
    deleteCarMutation.mutate();
  };

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
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Dashboard
        </Button>

        <div className="flex justify-center">
          {isLoading ? (
            <CarDetailsSkeleton />
          ) : car ? (
            isEditing ? (
              <EditCarForm
                initialData={car}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl">
                <div className="relative h-80">
                  <img
                    src={car.image || logo}
                    alt={car.image ? `${car.make} ${car.model}` : 'PitStop Logo'}
                    className={`w-full h-full ${car.image ? 'object-cover' : 'object-contain p-8 bg-gray-50'}`}
                    loading="lazy"
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
                          onClick={() => setIsEditing(true)}
                          aria-label={`Edit ${car.make} ${car.model}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                          onClick={() => setShowDeleteDialog(true)}
                          aria-label={`Delete ${car.make} ${car.model}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-gray-600" role="list">
                      <div className="flex items-center gap-2" role="listitem">
                        <Calendar className="h-5 w-5" aria-hidden="true" />
                        <span>{car.year}</span>
                      </div>
                      <div className="flex items-center gap-2" role="listitem">
                        <Key className="h-5 w-5" aria-hidden="true" />
                        <span>{car.licensePlate}</span>
                      </div>
                      {car.vin && (
                        <div className="flex items-center gap-2" role="listitem">
                          <Hash className="h-5 w-5" aria-hidden="true" />
                          <span>VIN: {car.vin}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
                    <div className="space-y-4" role="list">
                      <div className="flex items-start gap-3" role="listitem">
                        <Clock className="h-5 w-5 text-gray-400 mt-0.5" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Last Updated
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(car.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3" role="listitem">
                        <Clock className="h-5 w-5 text-gray-400 mt-0.5" aria-hidden="true" />
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
            )
          ) : null}
        </div>
      </div>

      <DeleteCarDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteCar}
        carName={car ? `${car.make} ${car.model}` : ''}
      />
    </div>
  );
};

export default CarDetails; 