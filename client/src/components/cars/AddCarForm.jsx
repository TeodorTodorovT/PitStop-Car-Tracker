import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import PropTypes from 'prop-types';

const AddCarForm = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    mode: 'onBlur'
  });
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('make', data.make);
      formData.append('model', data.model);
      formData.append('year', data.year);
      formData.append('licensePlate', data.licensePlate);
      if (data.vin) {
        formData.append('vin', data.vin);
      }
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }

      const response = await fetch('http://localhost:5000/api/cars', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.msg || 'Failed to add car');
      }

      const newCar = await response.json();
      onSuccess(newCar);
      reset();
      setImagePreview(null);
    } catch (error) {
      addToast({
        description: error.message,
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "mt-1 block w-full rounded-xl border-2 border-gray-200 px-4 py-2 text-gray-700 focus:border-primary focus:ring-primary transition-colors duration-200 bg-white shadow-sm hover:border-primary";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-1";
  const errorClasses = "mt-1 text-sm text-red-500";

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-primary mb-2">Add Your Car 🚗</h3>
        <p className="text-gray-500">Fill in your car's details below</p>
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

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto text-lg py-3 px-8"
          >
            {isSubmitting ? 'Adding Car...' : 'Add Car'}
          </Button>
        </div>
      </form>
    </div>
  );
};

AddCarForm.propTypes = {
  onSuccess: PropTypes.func.isRequired
};

export default AddCarForm; 