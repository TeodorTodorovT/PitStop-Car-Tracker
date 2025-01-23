import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import PropTypes from 'prop-types';
import { useState } from 'react';

const DeleteDocumentDialog = ({ isOpen, onClose, onConfirm, documentTitle }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      setIsDeleting(true);
      await onConfirm();
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Delete Document</DialogTitle>
          <DialogDescription className="text-gray-500">
            Are you sure you want to delete {documentTitle}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            disabled={isDeleting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

DeleteDocumentDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  documentTitle: PropTypes.string.isRequired,
};

export default DeleteDocumentDialog; 