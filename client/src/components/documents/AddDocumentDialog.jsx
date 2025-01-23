import { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Upload, X } from 'lucide-react';
import { cn } from "../../lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const VALID_FILE_TYPES = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const MAX_FILENAME_LENGTH = 100;

const documentTypes = [
  { value: 'insurance', label: 'Insurance' },
  { value: 'registration', label: 'Registration' },
  { value: 'tax', label: 'Tax' },
  { value: 'other', label: 'Other' }
];

const AddDocumentDialog = ({ isOpen, onClose, onSubmit, carId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [serverErrors, setServerErrors] = useState({});
  const [selectedType, setSelectedType] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, clearErrors, setError } = useForm({
    defaultValues: {
      type: '',
      title: '',
      description: '',
      expiryDate: ''
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur'
  });

  const validateFile = (file) => {
    if (!file) {
      return null; // File is now optional
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must not exceed 10MB';
    }

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!VALID_FILE_TYPES.includes(fileExtension)) {
      return 'Invalid file type. Please upload a PDF, Word, or Image file';
    }

    if (file.name.length > MAX_FILENAME_LENGTH) {
      return `File name is too long. Maximum ${MAX_FILENAME_LENGTH} characters allowed`;
    }

    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        setSelectedFile(null);
        e.target.value = '';
      } else {
        setFileError('');
        setSelectedFile(file);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError('');
    const fileInput = document.getElementById('file');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        setSelectedFile(null);
      } else {
        setFileError('');
        setSelectedFile(file);
        // Update the hidden file input
        const fileInput = document.getElementById('file');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
      }
    }
  };

  const onSubmitForm = async (data) => {
    setServerErrors({});
    clearErrors();

    // Validate required fields
    if (!selectedType) {
      setError('type', {
        type: 'required',
        message: 'Document type is required'
      });
      return;
    }

    if (!data.title?.trim()) {
      setError('title', {
        type: 'required',
        message: 'Title is required'
      });
      return;
    }

    try {
      const formData = new FormData();
      
      // Add required fields
      formData.append('type', selectedType);
      formData.append('title', data.title.trim());
      formData.append('carId', carId);

      // Add optional fields only if they have values
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      if (data.description && data.description.trim() !== '') {
        formData.append('description', data.description.trim());
      }

      if (data.expiryDate) {
        formData.append('expiryDate', data.expiryDate);
      }

      await onSubmit(formData);
      handleClose();
    } catch (error) {
      if (error.response?.data?.errors) {
        const newErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.param) {
            newErrors[err.param] = err.msg;
            setError(err.param, {
              type: 'server',
              message: err.msg
            });
          }
        });
        setServerErrors(newErrors);
      }
      console.error('Document submission failed:', error);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedType('');
    setSelectedFile(null);
    setFileError('');
    setServerErrors({});
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            Upload a document for your car. Supported formats include PDF, Word, and image files.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Document Type<span className="text-red-500">*</span></Label>
              <Select 
                value={selectedType}
                onValueChange={(value) => {
                  setSelectedType(value);
                  clearErrors('type');
                  setServerErrors(prev => ({ ...prev, type: undefined }));
                }}
                name="type"
                modal={false}
              >
                <SelectTrigger 
                  id="type"
                  className={cn(
                    "w-full",
                    (errors.type || serverErrors.type) && "border-red-500 focus:ring-red-500"
                  )}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(errors.type || serverErrors.type) && (
                <p className="text-sm text-red-500 mt-1" role="alert">
                  {errors.type?.message || serverErrors.type}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title<span className="text-red-500">*</span></Label>
              <Input
                id="title"
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 2, message: 'Title must be at least 2 characters' },
                  maxLength: { value: 100, message: 'Title must not exceed 100 characters' }
                })}
                className={cn(
                  (errors.title || serverErrors.title) && "border-red-500 focus:ring-red-500"
                )}
                aria-invalid={errors.title ? 'true' : 'false'}
              />
              {(errors.title || serverErrors.title) && (
                <p className="text-sm text-red-500" role="alert">
                  {errors.title?.message || serverErrors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description', {
                  maxLength: { value: 500, message: 'Description must not exceed 500 characters' },
                  pattern: {
                    value: /^[a-zA-Z0-9\s.,!?-]*$/,
                    message: 'Description can only contain letters, numbers, spaces, and basic punctuation'
                  }
                })}
                className={cn(
                  (errors.description || serverErrors.description) && "border-red-500 focus:ring-red-500"
                )}
                aria-invalid={errors.description ? 'true' : 'false'}
              />
              {(errors.description || serverErrors.description) && (
                <p className="text-sm text-red-500" role="alert">
                  {errors.description?.message || serverErrors.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                type="date"
                id="expiryDate"
                {...register('expiryDate', {
                  validate: (value) => {
                    if (!value) return true;
                    const date = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date >= today || 'Expiry date cannot be in the past';
                  },
                  onChange: () => setServerErrors(prev => ({ ...prev, expiryDate: undefined }))
                })}
                min={new Date().toISOString().split('T')[0]}
                className={cn(
                  (errors.expiryDate || serverErrors.expiryDate) && "border-red-500 focus:ring-red-500"
                )}
                aria-invalid={errors.expiryDate ? 'true' : 'false'}
              />
              {(errors.expiryDate || serverErrors.expiryDate) && (
                <p className="text-sm text-red-500" role="alert">
                  {errors.expiryDate?.message || serverErrors.expiryDate}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="file">Document File</Label>
              <div className="mt-1">
                {!selectedFile ? (
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 ${
                        isDragging 
                          ? 'border-primary bg-primary/5' 
                          : fileError 
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                      } border-dashed rounded-lg cursor-pointer transition-colors duration-200`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-primary' : fileError ? 'text-red-500' : 'text-gray-500'}`} />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, Word, or Image files (max. 10MB)
                        </p>
                      </div>
                      <input
                        id="file"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        aria-invalid={fileError ? 'true' : 'false'}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="flex-shrink-0">
                        <Upload className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-red-500"
                      onClick={handleRemoveFile}
                      aria-label="Remove selected file"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {fileError && (
                  <p className="text-sm text-red-500 mt-1" role="alert">{fileError}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !!fileError}
            >
              {isSubmitting ? 'Adding...' : 'Add Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

AddDocumentDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  carId: PropTypes.string.isRequired
};

export default AddDocumentDialog; 