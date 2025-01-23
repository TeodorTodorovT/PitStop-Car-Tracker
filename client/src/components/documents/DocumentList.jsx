import { useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { FileText, Download, Trash2, Calendar, Pencil } from 'lucide-react';

const DocumentList = ({ documents, onDelete, onEdit }) => {
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter documents based on type and search query
  const filteredDocuments = documents.filter(doc => {
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Sort documents based on selected criteria
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'expiryDate':
        return new Date(b.expiryDate) - new Date(a.expiryDate);
      default: // createdAt
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const documentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'registration', label: 'Registration' },
    { value: 'tax', label: 'Tax' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Added' },
    { value: 'title', label: 'Title' },
    { value: 'type', label: 'Type' },
    { value: 'expiryDate', label: 'Expiry Date' }
  ];

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {documentTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {sortedDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No documents found
          </div>
        ) : (
          sortedDocuments.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">{doc.title}</h3>
                    {doc.description && (
                      <p className="text-sm text-gray-600 mt-1 max-w-xl">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                      <span className="capitalize">{doc.type}</span>
                      {doc.expiryDate && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Expires: {format(new Date(doc.expiryDate), 'MMM d, yyyy')}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(doc)}
                    className="text-gray-500 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {doc.fileUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(doc._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

DocumentList.propTypes = {
  documents: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    description: PropTypes.string,
    fileUrl: PropTypes.string,
    fileName: PropTypes.string,
    fileType: PropTypes.string,
    fileSize: PropTypes.number,
    expiryDate: PropTypes.string,
    createdAt: PropTypes.string.isRequired
  })).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired
};

export default DocumentList; 