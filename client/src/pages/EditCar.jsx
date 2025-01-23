import { useNavigate, useParams } from 'react-router-dom';
import EditCarForm from '../components/cars/EditCarForm';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const EditCar = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="secondary"
          className="flex items-center gap-2"
          onClick={() => navigate(`/dashboard/cars/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Car Details
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <EditCarForm />
      </div>
    </>
  );
};

export default EditCar; 