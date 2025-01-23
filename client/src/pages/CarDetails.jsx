import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsApi } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import EditCarForm from '../components/cars/EditCarForm';
import DeleteCarDialog from '../components/cars/DeleteCarDialog';
import Button from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import DocumentsTab from '../components/documents/DocumentsTab';
import pitstopLogo from '../assets/pitstop-logo.png';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: car, isLoading } = useQuery({
    queryKey: ['cars', id],
    queryFn: () => carsApi.getCar(id),
  });

  const deleteCarMutation = useMutation({
    mutationFn: () => carsApi.deleteCar(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['cars']);
      addToast('Car deleted successfully', { type: 'success' });
      navigate('/dashboard');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to delete car', { type: 'error' });
    },
  });

  const handleDeleteCar = () => {
    setShowDeleteDialog(false);
    deleteCarMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3F8FF] p-8">
        <div className="mx-auto max-w-5xl">
          <div className="h-96 animate-pulse rounded-lg bg-white shadow-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F8FF] p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/dashboard/cars/${id}/edit`)}
              className="text-primary hover:bg-primary/10"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          {isEditing ? (
            <EditCarForm
              car={car}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start border-b bg-transparent p-0">
                <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary">
                  Details
                </TabsTrigger>
                <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary">
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="p-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={car.image || pitstopLogo}
                      alt={`${car.make} ${car.model}`}
                      className="absolute inset-0 h-full w-full object-contain bg-white"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">{car.make} {car.model}</h2>
                      <p className="text-gray-500">{car.year}</p>
                    </div>
                    <div className="space-y-2">
                      <p><span className="font-semibold">License Plate:</span> {car.licensePlate}</p>
                      {car.vin && <p><span className="font-semibold">VIN:</span> {car.vin}</p>}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="p-6">
                <DocumentsTab carId={id} />
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DeleteCarDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteCar}
          carName={`${car.make} ${car.model}`}
        />
      </div>
    </div>
  );
};

export default CarDetails; 