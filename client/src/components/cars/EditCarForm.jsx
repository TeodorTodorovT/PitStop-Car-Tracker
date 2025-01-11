import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PropTypes from 'prop-types';

const EditCarForm = ({ initialData, onSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(!initialData);
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    mode: 'onBlur'
  });

  useEffect(() => {
    // If we have initial data, use it
    if (initialData) {
      reset({
        make: initialData.make,
        model: initialData.model,
        year: initialData.year,
        licensePlate: initialData.licensePlate,
        vin: initialData.vin || ''
      });
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch the data using the route parameter
    const fetchCarData = async () => {
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
          throw new Error('Failed to fetch car data');
        }

        const car = await response.json();
        reset({
          make: car.make,
          model: car.model,
          year: car.year,
          licensePlate: car.licensePlate,
          vin: car.vin || ''
        });
        setImagePreview(car.image);
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

    if (id) {
      fetchCarData();
    }
  }, [id, navigate, addToast, reset, initialData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const formData = {
        make: data.make,
        model: data.model,
        year: data.year,
        licensePlate: data.licensePlate,
        vin: data.vin || undefined,
        image: data.image,
      };

      if (onSuccess) {
        await onSuccess(formData);
      } else {
        navigate(`/dashboard/cars/${id}`);
      }
    } catch (error) {
      addToast({
        description: error.message,
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading car details...</p>
      </div>
    );
  }

  const inputClasses = "mt-1 block w-full rounded-xl border-2 border-gray-200 px-4 py-2 text-gray-700 focus:border-primary focus:ring-primary transition-colors duration-200 bg-white shadow-sm hover:border-primary";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-1";
  const errorClasses = "mt-1 text-sm text-red-500";

  return (
    <>
      {!initialData && (
        <Button
          variant="outline"
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate(`/dashboard/cars/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Car Details
        </Button>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-primary mb-2">Edit Your Car 🚗</h3>
          <p className="text-gray-500">Update your car&apos;s details below</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="make" className={labelClasses}>
                Make
              </label>
              <input
                type="text"
                id="make"
                placeholder="e.g., Toyota"
                {...register('make', {
                  required: 'Make is required',
                  minLength: { value: 2, message: 'Make must be at least 2 characters' },
                  maxLength: { value: 30, message: 'Make must not exceed 30 characters' }
                })}
                className={inputClasses}
              />
              {errors.make && (
                <p className={errorClasses}>{errors.make.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="model" className={labelClasses}>
                Model
              </label>
              <input
                type="text"
                id="model"
                placeholder="e.g., Camry"
                {...register('model', {
                  required: 'Model is required',
                  minLength: { value: 2, message: 'Model must be at least 2 characters' },
                  maxLength: { value: 30, message: 'Model must not exceed 30 characters' }
                })}
                className={inputClasses}
              />
              {errors.model && (
                <p className={errorClasses}>{errors.model.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="year" className={labelClasses}>
                Year
              </label>
              <input
                type="number"
                id="year"
                placeholder={new Date().getFullYear().toString()}
                {...register('year', {
                  required: 'Year is required',
                  min: { value: 1900, message: 'Year must be 1900 or later' },
                  max: { value: new Date().getFullYear() + 1, message: `Year must not exceed ${new Date().getFullYear() + 1}` }
                })}
                className={inputClasses}
              />
              {errors.year && (
                <p className={errorClasses}>{errors.year.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="licensePlate" className={labelClasses}>
                License Plate
              </label>
              <input
                type="text"
                id="licensePlate"
                placeholder="e.g., ABC-123"
                {...register('licensePlate', {
                  required: 'License plate is required',
                  minLength: { value: 2, message: 'License plate must be at least 2 characters' },
                  maxLength: { value: 10, message: 'License plate must not exceed 10 characters' },
                  pattern: {
                    value: /^[A-Z0-9 -]+$/i,
                    message: 'License plate can only contain letters, numbers, spaces, and hyphens'
                  }
                })}
                className={inputClasses}
              />
              {errors.licensePlate && (
                <p className={errorClasses}>{errors.licensePlate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="vin" className={labelClasses}>
              VIN (optional)
            </label>
            <input
              type="text"
              id="vin"
              placeholder="17-character VIN number"
              {...register('vin', {
                minLength: { value: 17, message: 'VIN must be exactly 17 characters' },
                maxLength: { value: 17, message: 'VIN must be exactly 17 characters' },
                pattern: {
                  value: /^[A-HJ-NPR-Z0-9]+$/,
                  message: 'Invalid VIN format'
                }
              })}
              className={inputClasses}
            />
            {errors.vin && (
              <p className={errorClasses}>{errors.vin.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="image" className={labelClasses}>
              Car Image (optional)
            </label>
            <input
              type="file"
              id="image"
              accept="image/jpeg,image/png,image/webp"
              {...register('image')}
              onChange={(e) => {
                register('image').onChange(e);
                handleImageChange(e);
              }}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-3 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary/90
                cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-4 rounded-xl overflow-hidden shadow-md">
                <img
                  src={imagePreview}
                  alt="Car preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            {errors.image && (
              <p className={errorClasses}>{errors.image.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => navigate(`/dashboard/cars/${id}`))}
              className="w-full md:w-auto bg-white hover:bg-gray-100 text-gray-900 border border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white"
            >
              {isSubmitting ? 'Updating...' : 'Update Car'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

EditCarForm.propTypes = {
  initialData: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    make: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    year: PropTypes.number.isRequired,
    licensePlate: PropTypes.string.isRequired,
    vin: PropTypes.string,
    image: PropTypes.string
  }),
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func
};

export default EditCarForm; 