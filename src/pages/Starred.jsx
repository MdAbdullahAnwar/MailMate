import React, { useState, useEffect, Fragment } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';
import { format } from 'date-fns';
import EmailModal from '../components/EmailModal';

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
import { Star, StarOff, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 5;

const Starred = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const [pagesCursor, setPagesCursor] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const { user } = useUser();

  const fetchStarredEmails = async (pageNum = 1) => {
    try {
      setLoading(true);
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) return;

      let q;
      if (pageNum === 1) {
        q = query(
          collection(db, 'emails'),
          where('owner', '==', userEmail),
          where('starred', '==', true),
          orderBy('timestamp', 'desc'),
          limit(ITEMS_PER_PAGE)
        );
      } else {
        const previousCursor = pagesCursor[pageNum - 2];
        if (!previousCursor) return;
        q = query(
          collection(db, 'emails'),
          where('owner', '==', userEmail),
          where('starred', '==', true),
          orderBy('timestamp', 'desc'),
          startAfter(previousCursor),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snap = await getDocs(q);

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
    //   console.log("Fetched emails:", data);
      if (pageNum === 1) {
        const countSnap = await getDocs(
          query(
            collection(db, 'emails'),
            where('owner', '==', userEmail),
            where('starred', '==', true)
          )
        );
        setTotalEmails(countSnap.size);
      }

      if (snap.docs.length > 0) {
        const newLastVisible = snap.docs[snap.docs.length - 1];
        const updatedCursors = [...pagesCursor];
        updatedCursors[pageNum - 1] = newLastVisible;
        setPagesCursor(updatedCursors);
      }

      setEmails(data);
    } catch (err) {
      toast.error('Failed to load starred emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      fetchStarredEmails(page);
    }
  }, [user?.primaryEmailAddress?.emailAddress, page]);

  const toggleStar = async (email) => {
    try {
      const ref = doc(db, 'emails', email.id);
      await updateDoc(ref, { starred: !email.starred });
      setEmails(prev => prev.filter(e => e.id !== email.id));
      toast.success(email.starred ? 'Unstarred' : 'Starred');
    } catch {
      toast.error('Failed to update star status');
    }
  };

  const clearAllStarred = async () => {
    const updates = emails.map(email => {
      const ref = doc(db, 'emails', email.id);
      return updateDoc(ref, { starred: false });
    });

    try {
      await Promise.all(updates);
      toast.success('All emails unstarred');
      setEmails([]);
    } catch (error) {
      toast.error('Failed to unstar all emails');
    }
  };

  const totalPages = Math.ceil(totalEmails / ITEMS_PER_PAGE);

  return (
    <Fragment>
      <Card className="w-260 h-fit ml-28">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle>⭐ Starred</CardTitle>
          {emails.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAllStarred}
              className="mt-2 md:mt-0 cursor-pointer"
            >
              Clear Starred
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {loading && emails.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <StarOff className="h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-500">No starred emails</p>
            </div>
          ) : (
            <>
              <Table className="border-separate border-spacing-y-2">
                <TableHeader>
                  <TableRow>
                    <TableHead>Star</TableHead>
                    <TableHead>From / To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200">
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
                      >
                        {email.starred ? (
                          <Star className="text-yellow-500" />
                        ) : (
                          <StarOff />
                        )}
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
                <div className="flex justify-between items-center mt-4">
                  <Button variant="outline" className="cursor-pointer" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>
                  <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                  <Button variant="outline" className="cursor-pointer" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    Next <ChevronRight className="h-4 w-4 ml-2" />
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
