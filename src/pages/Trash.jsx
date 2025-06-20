import { useState, Fragment } from 'react';
import { useUser } from '@clerk/clerk-react';
import { format } from 'date-fns';
import EmailModal from '../components/EmailModal';
import { useMailAPI } from '../hooks/useMailAPI';
import { usePaginatedEmails } from '../hooks/usePaginatedEmails';
import useSyncMailCounts from '../hooks/useSyncMailCounts';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCw, Loader2 } from 'lucide-react';

const Trash = () => {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const [selectedEmail, setSelectedEmail] = useState(null);
  
  useSyncMailCounts(userEmail);

  const mailAPI = useMailAPI(userEmail);
  const { loading, deleteDoc, updateEmailFolder } = mailAPI;
  
  const {
    emails,
    page: currentPage,
    setPage: setCurrentPage,
    totalPages,
    refresh
  } = usePaginatedEmails({
    userEmail,
    fetchFn: mailAPI.fetchEmails,
    folder: 'trash',
    pageSize: 5
  });

  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePermanentDelete = async (emailId) => {
    try {
      await deleteDoc(emailId);
      refresh();
      toast.success('Email permanently deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete email');
    }
  };

  const handleRestore = async (emailId) => {
    try {
      const restoredEmail = emails.find(email => email.id === emailId);
      if (!restoredEmail) {
        throw new Error('Email not found');
      }

      const destinationFolder = restoredEmail.to === userEmail ? 'inbox' : 'sent';

      await updateEmailFolder(emailId, destinationFolder);
      refresh();

      toast.success(`Email restored to ${destinationFolder.charAt(0).toUpperCase() + destinationFolder.slice(1)}`);
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore email');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedEmails.map(id => deleteDoc(id)));
      refresh();
      setSelectedEmails([]);
      toast.success('Selected emails deleted');
    } catch (error) {
      console.error('Delete selected error:', error);
      toast.error('Failed to delete selected emails');
    }
  };

  const handleClearAll = async () => {
    try {
      await Promise.all(emails.map(email => deleteDoc(email.id)));
      refresh();
      setSelectedEmails([]);
      toast.success('Trash cleared');
    } catch (error) {
      console.error('Clear all error:', error);
      toast.error('Failed to clear trash');
    }
    setShowConfirm(false);
  };

  const toggleSelect = (id) => {
    setSelectedEmails(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isSelected = (id) => selectedEmails.includes(id);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <Fragment>
      <Card className="w-[90.4%] h-fit ml-28">
        <CardHeader className="flex flex-row items-center justify-between h-1 m-2">
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Trash
          </CardTitle>
          <div className="flex gap-2">
            {selectedEmails.length > 0 && (
              <Button
                variant="destructive"
                className="cursor-pointer"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Selected
              </Button>
            )}
            {emails.length > 0 && (
              <Button
                variant="destructive"
                className="cursor-pointer" 
                onClick={() => setShowConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All Trash
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading && emails.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Trash2 className="h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-500">Trash is empty</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead />
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow 
                      key={email.id}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          className="cursor-pointer"
                          checked={isSelected(email.id)}
                          onChange={() => toggleSelect(email.id)}
                        />
                      </TableCell>
                      <TableCell onClick={() => setSelectedEmail(email)}>{email.from}</TableCell>
                      <TableCell onClick={() => setSelectedEmail(email)}>{email.subject || '(No subject)'}</TableCell>
                      <TableCell>{format(email.timestamp, 'MMM dd, yyyy hh:mm a')}</TableCell>
                      <TableCell className="flex gap-2 justify-center">
                        <Button 
                          variant="outline" 
                          className="cursor-pointer" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(email.id);
                          }}
                        >
                          <RotateCw className="w-4 h-4 mr-1" />
                          Restore
                        </Button>
                        <Button
                          variant="destructive"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePermanentDelete(email.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 px-4">
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
            <p className="mb-6 text-gray-600">
              This will permanently delete all emails in Trash.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="cursor-pointer" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="cursor-pointer" onClick={handleClearAll}>
                Yes, Delete All
              </Button>
            </div>
          </div>
        </div>
      )}
      {selectedEmail && (
        <EmailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}
    </Fragment>
  );
};

export default Trash;
