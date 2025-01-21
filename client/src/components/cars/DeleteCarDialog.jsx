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

const DeleteCarDialog = ({ isOpen, onClose, onConfirm, carName }) => {
  const handleDelete = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Delete Car</DialogTitle>
          <DialogDescription className="text-gray-500">
            Are you sure you want to delete {carName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

DeleteCarDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  carName: PropTypes.string.isRequired,
};

export default DeleteCarDialog; 