import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { documentsApi } from '../../lib/api';
import DocumentList from './DocumentList';
import AddDocumentDialog from './AddDocumentDialog';
import EditDocumentDialog from './EditDocumentDialog';
import DeleteDocumentDialog from './DeleteDocumentDialog';
import { Button } from '../ui/Button';

const DocumentsTab = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, document: null });
  const { addToast } = useToast();
  const { id: carId } = useParams();

  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', carId],
    queryFn: () => documentsApi.getDocuments(carId),
    enabled: !!carId
  });

  const addDocumentMutation = useMutation({
    mutationFn: documentsApi.addDocument,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['documents', carId]);
      addToast({
        description: `${data.title} was added successfully`,
        variant: 'success',
        duration: 3000
      });
    },
    onError: (error) => {
      if (!error.response?.data?.errors) {
        addToast({
          description: error.message || 'Failed to add document. Please try again.',
          variant: 'error',
          duration: 5000
        });
      }
      throw error;
    }
  });

  const editDocumentMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      return documentsApi.updateDocument(id, formData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['documents', carId]);
      addToast({
        description: `${data.title} was updated successfully`,
        variant: 'success',
        duration: 3000
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      if (!error.response?.data?.errors) {
        addToast({
          description: error.message || 'Failed to update document. Please try again.',
          variant: 'error',
          duration: 5000
        });
      }
      throw error;
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId) => {
      return documentsApi.deleteDocument(documentId);
    },
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries(['documents', carId]);
      const document = documents.find(doc => doc._id === documentId);
      addToast({
        description: `${document?.title || 'Document'} was deleted successfully`,
        variant: 'success',
        duration: 3000
      });
    },
    onError: (error) => {
      console.error('Delete mutation failed:', error);
      addToast({
        description: error.message || 'Failed to delete document. Please try again.',
        variant: 'error',
        duration: 5000
      });
      throw error;
    }
  });

  const handleAddDocument = async (formData) => {
    await addDocumentMutation.mutateAsync(formData);
    setAddDialogOpen(false);
  };

  const handleEditDocument = async (updatedDoc) => {
    
    const formData = new FormData();
    
    // Ensure we have all required fields
    if (!updatedDoc.title || !updatedDoc.type || !carId) {
      throw new Error('Missing required fields');
    }

    // Required fields
    formData.append('carId', carId);
    formData.append('title', updatedDoc.title);
    formData.append('type', updatedDoc.type);
    
    // Optional fields
    if (updatedDoc.description) {
      formData.append('description', updatedDoc.description);
    }
    
    if (updatedDoc.expiryDate) {
      formData.append('expiryDate', updatedDoc.expiryDate);
    }
    
    formData.append('removeFile', updatedDoc.removeFile ? 'true' : 'false');
    
    if (updatedDoc.file instanceof File) {
      formData.append('file', updatedDoc.file);
    }


    await editDocumentMutation.mutateAsync({
      id: updatedDoc._id,
      formData
    });
    setEditingDocument(null);
  };

  const handleDeleteDocument = (document) => {
    setDeleteDialog({ isOpen: true, document });
  };

  const confirmDelete = async () => {
    const documentId = typeof deleteDialog.document === 'string' 
      ? deleteDialog.document 
      : deleteDialog.document?._id;

    if (documentId) {
      try {
        await deleteDocumentMutation.mutateAsync(documentId);
        setDeleteDialog({ isOpen: false, document: null });
      } catch (error) {
        console.error('Error in confirmDelete:', error);
        throw error;
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Documents</h2>
        <Button onClick={() => setAddDialogOpen(true)}>Add Document</Button>
      </div>

      <DocumentList
        documents={documents}
        onEdit={setEditingDocument}
        onDelete={handleDeleteDocument}
      />

      <AddDocumentDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddDocument}
        carId={carId}
      />

      {editingDocument && (
        <EditDocumentDialog
          isOpen={!!editingDocument}
          onClose={() => setEditingDocument(null)}
          onSubmit={handleEditDocument}
          document={editingDocument}
        />
      )}

      <DeleteDocumentDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, document: null })}
        onConfirm={confirmDelete}
        documentTitle={typeof deleteDialog.document === 'string' 
          ? 'this document' 
          : deleteDialog.document?.title || 'this document'}
      />
    </div>
  );
};

export default DocumentsTab; 