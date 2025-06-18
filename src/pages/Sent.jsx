import { useState, useEffect, Fragment } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';
import { format } from 'date-fns';
import EmailModal from '../components/EmailModal';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { MailPlus, Trash2, ChevronLeft, ChevronRight, Loader2, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 5;

const Sent = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [pagesCursor, setPagesCursor] = useState([]);

  const { user } = useUser();

  const fetchSentEmails = async (pageNum = 1) => {
    try {
        setLoading(true);
        const userEmail = user?.primaryEmailAddress?.emailAddress;
        if (!userEmail) return;

        let q;
        if (pageNum === 1) {
        q = query(
            collection(db, 'emails'),
            where('owner', '==', userEmail),
            where('folder', '==', 'sent'),
            orderBy('timestamp', 'desc'),
            limit(ITEMS_PER_PAGE)
        );
        } else {
        const previousCursor = pagesCursor[pageNum - 2];
        if (!previousCursor) return;

        q = query(
            collection(db, 'emails'),
            where('owner', '==', userEmail),
            where('folder', '==', 'sent'),
            orderBy('timestamp', 'desc'),
            startAfter(previousCursor),
            limit(ITEMS_PER_PAGE)
        );
        }

        const querySnapshot = await getDocs(q);

        const emailsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
        }));

        if (pageNum === 1) {
        const countQuery = query(
            collection(db, 'emails'),
            where('owner', '==', userEmail),
            where('folder', '==', 'sent')
        );
        const countSnapshot = await getDocs(countQuery);
        setTotalEmails(countSnapshot.size);
        }

        // 👇 This is the key fix
        if (querySnapshot.docs.length > 0) {
        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        const updatedCursors = [...pagesCursor];
        updatedCursors[pageNum - 1] = newLastVisible;
        setPagesCursor(updatedCursors);
        }

        setEmails(emailsData);
    } catch (error) {
        console.error('Error fetching sent emails:', error);
        toast.error('Failed to load sent emails');
    } finally {
        setLoading(false);
    }
    };

  useEffect(() => {
    fetchSentEmails(page);
  }, [user, page]);

  const handleEmailClick = (emailId) => {
    const email = emails.find(e => e.id === emailId);
    setSelectedEmail(email);
  };

  const handleDelete = async (emailId) => {
    try {
      const emailRef = doc(db, 'emails', emailId);
      await updateDoc(emailRef, { folder: 'trash' });
      setEmails(emails.filter(email => email.id !== emailId));
      toast.success('Email moved to trash');
    } catch (error) {
      toast.error('Failed to delete email');
    }
  };

  const totalPages = Math.ceil(totalEmails / ITEMS_PER_PAGE);

  return (
    <Fragment>
      <Card className="w-260 h-113.5 ml-28">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Sent Emails
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading && emails.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Send className="h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-500">No sent emails yet</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow
                      key={email.id}
                      onClick={() => handleEmailClick(email.id)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{email.to?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span>{email.to}</span>
                        </div>
                      </TableCell>
                      <TableCell>{email.subject || '(No subject)'}</TableCell>
                      <TableCell>{format(email.timestamp, 'MMM dd, yyyy hh:mm a')}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(email.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-2">
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
        <EmailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}
    </Fragment>
  );
};

export default Sent;
