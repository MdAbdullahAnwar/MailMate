import { useState, useEffect, Fragment } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';
import { format } from 'date-fns';
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
import { Trash2, RotateCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { fetchUnreadCount, fetchTrashCount } from '../store/emailSlice';

const Trash = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user } = useUser();
  const dispatch = useDispatch();

  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastEmail = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstEmail = indexOfLastEmail - ITEMS_PER_PAGE;
  const currentEmails = emails.slice(indexOfFirstEmail, indexOfLastEmail);
  const totalPages = Math.ceil(emails.length / ITEMS_PER_PAGE);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  useEffect(() => {
    const fetchTrash = async () => {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) return;

      const q = query(
        collection(db, 'emails'),
        where('owner', '==', userEmail),
        where('folder', '==', 'trash'),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      const emailsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
      setEmails(emailsData);
    };

    fetchTrash();
  }, [user]);

  const handlePermanentDelete = async (emailId) => {
    try {
      await deleteDoc(doc(db, 'emails', emailId));
      setEmails(prev => prev.filter(email => email.id !== emailId));
      toast.success('Email permanently deleted');
      dispatch(fetchTrashCount(user.primaryEmailAddress.emailAddress));
    } catch (error) {
      toast.error('Failed to delete email');
    }
  };

  const handleRestore = async (emailId) => {
    try {
      await updateDoc(doc(db, 'emails', emailId), { folder: 'inbox' });
      const restoredEmail = emails.find(email => email.id === emailId);
      setEmails(prev => prev.filter(email => email.id !== emailId));

      if (restoredEmail && !restoredEmail.read) {
        dispatch(fetchUnreadCount(user.primaryEmailAddress.emailAddress));
      }

      dispatch(fetchTrashCount(user.primaryEmailAddress.emailAddress));
      toast.success('Email restored to Inbox');
    } catch (error) {
      toast.error('Failed to restore email');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedEmails.map(id => deleteDoc(doc(db, 'emails', id)))
      );
      setEmails(prev => prev.filter(email => !selectedEmails.includes(email.id)));
      setSelectedEmails([]);
      toast.success('Selected emails deleted');
      dispatch(fetchTrashCount(user.primaryEmailAddress.emailAddress));
    } catch (error) {
      toast.error('Failed to delete selected emails');
    }
  };

  const handleClearAll = async () => {
    try {
      await Promise.all(
        emails.map(email => deleteDoc(doc(db, 'emails', email.id)))
      );
      setEmails([]);
      setSelectedEmails([]);
      toast.success('Trash cleared');
      dispatch(fetchTrashCount(user.primaryEmailAddress.emailAddress));
    } catch (error) {
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

  return (
    <Fragment>
      <Card className="w-[90.4%] ml-28">
        <CardHeader className="flex flex-row items-center justify-between">
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
          {emails.length === 0 ? (
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
                  {currentEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="cursor-pointer"
                          checked={isSelected(email.id)}
                          onChange={() => toggleSelect(email.id)}
                        />
                      </TableCell>
                      <TableCell>{email.from}</TableCell>
                      <TableCell>{email.subject || '(No subject)'}</TableCell>
                      <TableCell>{format(email.timestamp, 'MMM dd, yyyy hh:mm a')}</TableCell>
                      <TableCell className="flex gap-2 justify-center">
                        <Button variant="outline" className="cursor-pointer" onClick={() => handleRestore(email.id)}>
                          <RotateCw className="w-4 h-4 mr-1" />
                          Restore
                        </Button>
                        <Button
                          variant="destructive"
                          className="cursor-pointer"
                          onClick={() => handlePermanentDelete(email.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {emails.length > ITEMS_PER_PAGE && (
                <div className="flex justify-center mt-4 gap-4">
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="self-center text-sm text-gray-600">
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

      {/* Confirmation Modal */}
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
    </Fragment>
  );
};

export default Trash;
