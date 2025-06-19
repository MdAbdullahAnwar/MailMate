import React, { useState, Fragment, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { format } from 'date-fns';
import EmailModal from '../components/EmailModal';
import { usePaginatedEmails } from '../hooks/usePaginatedEmails';
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
import { Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, collection, query, where, orderBy, limit, startAfter, getDocs, writeBatch } from 'firebase/firestore';
import useSyncMailCounts from '../hooks/useSyncMailCounts';

const ITEMS_PER_PAGE = 5;

const Starred = () => {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const [selectedEmail, setSelectedEmail] = useState(null);

  useSyncMailCounts(userEmail);

  const fetchStarredEmails = async (params) => {
    try {
      let q = query(
        collection(db, 'emails'),
        where('owner', '==', userEmail),
        where('starred', '==', true),
        orderBy('timestamp', 'desc')
      );

      if (params.countOnly) {
        const snapshot = await getDocs(q);
        return snapshot.size;
      }

      if (params.pageSize) {
        q = query(q, limit(params.pageSize));
      }

      if (params.pageCursor) {
        q = query(q, startAfter(params.pageCursor));
      }

      const snapshot = await getDocs(q);
      const emails = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));

      return { 
        emails, 
        lastVisible: snapshot.docs[snapshot.docs.length - 1] 
      };
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  };

  const {
    emails,
    page: currentPage,
    setPage: setCurrentPage,
    totalPages,
    refresh,
    loading
  } = usePaginatedEmails({
    userEmail,
    fetchFn: fetchStarredEmails,
    pageSize: ITEMS_PER_PAGE
  });

  const toggleStar = async (email) => {
    try {
      const ref = doc(db, 'emails', email.id);
      await updateDoc(ref, { starred: false });
      refresh();
      toast.success('Email unstarred');
    } catch {
      toast.error('Failed to update star status');
    }
  };

  const clearAllStarred = async () => {
    try {
      const q = query(
        collection(db, 'emails'),
        where('owner', '==', userEmail),
        where('starred', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { starred: false });
      });

      await batch.commit();
      refresh();
      toast.success('All starred emails cleared');
    } catch (error) {
      console.error('Error clearing all starred:', error);
      toast.error('Failed to clear all starred emails');
    }
  };

  return (
    <Fragment>
      <Card className="w-[90.4%] h-fit ml-28">
        <CardHeader className="flex flex-row items-center justify-between h-5 mt-1">
          <CardTitle className="flex items-center gap-2">
            ⭐ Starred
          </CardTitle>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearAllStarred}
            disabled={loading}
            className="cursor-pointer"
          >
            Clear All Starred
          </Button>
        </CardHeader>

        <CardContent>
          {loading && emails.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-500">No starred emails</p>
            </div>
          ) : (
            <>
              <Table className="my-1 border-separate [border-spacing:0.5rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Star</TableHead>
                    <TableHead>From / To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map(email => (
                    <TableRow
                      key={email.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedEmail(email)}
                    >
                      <TableCell
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(email);
                        }}
                        className="cursor-pointer"
                      >
                        <Star className="text-yellow-500" />
                      </TableCell>
                      <TableCell>
                        {email.folder === 'sent' ? `To: ${email.to}` : `From: ${email.from}`}
                      </TableCell>
                      <TableCell>{email.subject || '(No subject)'}</TableCell>
                      <TableCell>
                        {format(email.timestamp, 'MMM dd, yyyy hh:mm a')}
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
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedEmail && (
        <EmailModal
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </Fragment>
  );
};

export default Starred;
