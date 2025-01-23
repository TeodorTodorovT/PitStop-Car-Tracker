import { useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from 'react';
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
import { X, FileText } from 'lucide-react';
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

const EditDocumentDialog = ({ isOpen = false, onClose, onSubmit, document }) => {
  const [selectedType, setSelectedType] = useState(document?.type || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [serverErrors, setServerErrors] = useState({});
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, clearErrors, setError } = useForm({
    defaultValues: {
      type: document?.type || '',
      title: document?.title || '',
      description: document?.description || '',
      expiryDate: document?.expiryDate ? new Date(document.expiryDate).toISOString().split('T')[0] : ''
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur'
  });

  useEffect(() => {
    if (document && isOpen) {
      setSelectedType(document.type);
      reset({
        type: document.type || '',
        title: document.title || '',
        description: document.description || '',
        expiryDate: document.expiryDate ? new Date(document.expiryDate).toISOString().split('T')[0] : ''
      });
      setSelectedFile(null);
      setFileError('');
      setRemoveExistingFile(false);
    }
  }, [document, isOpen, reset]);

  const validateFile = (file) => {
    if (!file) return null;
    
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
        setRemoveExistingFile(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError('');
    setRemoveExistingFile(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmitForm = async (data) => {
    try {
      // Validate type is selected
      if (!selectedType) {
        setError('type', {
          type: 'required',
          message: 'Document type is required'
        });
        return;
      }

      // Create document update object
      const updatedDocument = {
        _id: document._id,
        type: selectedType,
        title: data.title,
        description: data.description?.trim(),
        expiryDate: data.expiryDate || null,
        removeFile: removeExistingFile,
        file: selectedFile
      };

      await onSubmit(updatedDocument);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response?.data?.errors) {
        const newErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.param) {
            newErrors[err.param] = err.msg;
          }
        });
        setServerErrors(newErrors);
      }
    }
  };

  const handleClose = () => {
    reset();
    setSelectedType('');
    setSelectedFile(null);
    setFileError('');
    setRemoveExistingFile(false);
    onClose();
  };

  if (!document || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>
            Update the details of your document. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Document Type *</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => {
                  setSelectedType(value);
                  clearErrors('type');
                  setServerErrors(prev => ({ ...prev, type: undefined }));
                }}
              >
                <SelectTrigger
                  id="type"
                  className={cn(
                    "w-full",
                    (errors.type || serverErrors.type) && "border-red-500 focus:ring-red-500"
                  )}
                >
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
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
              <Label htmlFor="title">Title *</Label>
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
                <p className="text-sm text-red-500 mt-1" role="alert">
                  {errors.title?.message || serverErrors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description', {
                  maxLength: { value: 500, message: 'Description must not exceed 500 characters' }
                })}
                className={cn(
                  (errors.description || serverErrors.description) && "border-red-500 focus:ring-red-500"
                )}
                aria-invalid={errors.description ? 'true' : 'false'}
              />
              {(errors.description || serverErrors.description) && (
                <p className="text-sm text-red-500 mt-1" role="alert">
                  {errors.description?.message || serverErrors.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                {...register('expiryDate')}
              />
              {errors.expiryDate && (
                <p className="text-sm text-red-500" role="alert">
                  {errors.expiryDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Document File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={VALID_FILE_TYPES.join(',')}
                  className="flex-1"
                />
                {(selectedFile || document.fileUrl) && !removeExistingFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {fileError && (
                <p className="text-sm text-red-500" role="alert">
                  {fileError}
                </p>
              )}
              {document.fileUrl && !removeExistingFile && !selectedFile && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span>Current file: {document.fileName}</span>
                </div>
              )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

EditDocumentDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  document: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    expiryDate: PropTypes.string,
    fileUrl: PropTypes.string,
    fileName: PropTypes.string,
    car: PropTypes.string.isRequired
  }).isRequired
};

export default EditDocumentDialog; 