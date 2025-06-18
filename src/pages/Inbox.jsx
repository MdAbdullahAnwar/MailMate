import { useState, useEffect, Fragment } from 'react';
import { Star, StarOff } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import EmailModal from '../components/EmailModal';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MailPlus, Inbox as InboxIcon, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ITEMS_PER_PAGE = 5;

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [page, setPage] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const { user } = useUser();
  const navigate = useNavigate();

  const fetchEmails = async (pageNum = 1) => {
    try {
      setLoading(true);
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) return;

      let q;
      if (pageNum === 1) {
        q = query(
          collection(db, 'emails'),
          where('owner', '==', userEmail),
          where('folder', '==', 'inbox'),
          orderBy('timestamp', 'desc'),
          limit(ITEMS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, 'emails'),
          where('owner', '==', userEmail),
          where('folder', '==', 'inbox'),
          orderBy('timestamp', 'desc'),
          startAfter(lastVisible),
          limit(ITEMS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);
      const emailsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);

      if (pageNum === 1) {
        const countQuery = query(
          collection(db, 'emails'),
          where('owner', '==', userEmail),
          where('folder', '==', 'inbox')
        );
        const countSnapshot = await getDocs(countQuery);
        setTotalEmails(countSnapshot.size);
      }

      setEmails(emailsData);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails(page);
  }, [user, page]);

  const handleCompose = () => {
    navigate('/compose');
  };

  const handleEmailClick = async (emailId) => {
    try {
      const emailRef = doc(db, 'emails', emailId);
      await updateDoc(emailRef, { read: true });

      const email = emails.find(e => e.id === emailId);
      setSelectedEmail(email);

      setEmails(emails.map(email =>
        email.id === emailId ? { ...email, read: true } : email
      ));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
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

  const toggleStar = async (email) => {
    try {
      const ref = doc(db, 'emails', email.id);
      const updatedStarred = !email.starred;

      await updateDoc(ref, { starred: updatedStarred });

      // Update local state for instant UI feedback
      setEmails(prev =>
        prev.map(e =>
          e.id === email.id ? { ...e, starred: updatedStarred } : e
        )
      );

      toast.success(updatedStarred ? 'Starred' : 'Unstarred');
    } catch (error) {
      toast.error('Failed to update star status');
    }
  };

  const totalPages = Math.ceil(totalEmails / ITEMS_PER_PAGE);

  return (
    <Fragment>
      <Card className="w-260 h-fit ml-28">
        <CardHeader className="h-8.5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <InboxIcon className="h-5 w-5" />
              Inbox
            </CardTitle>
            <Button onClick={handleCompose} className="cursor-pointer">
              <MailPlus className="mr-2 h-4 w-4" />
              Compose
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && emails.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <InboxIcon className="h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-500">Your inbox is empty</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Star</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow key={email.id} onClick={() => handleEmailClick(email.id)} className="cursor-pointer hover:bg-gray-50">
                      <TableCell onClick={(e) => { e.stopPropagation(); toggleStar(email); }}>
                        {email.starred === true ? (
                          <Star className="text-yellow-500 cursor-pointer" />
                        ) : (
                          <StarOff className="cursor-pointer" />
                        )}
                      </TableCell>
                      <TableCell>
                        {!email.read && (
                          <Badge variant="default" className="bg-blue-500">New</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{email.from?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className={!email.read ? "font-semibold" : ""}>{email.from}</span>
                        </div>
                      </TableCell>
                      <TableCell className={!email.read ? "font-semibold" : ""}>
                        {email.subject || '(No subject)'}
                      </TableCell>
                      <TableCell>
                        {format(email.timestamp, 'MMM dd, yyyy hh:mm a')}
                      </TableCell>
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
                <div className="flex justify-between items-center mt-1">
                  <Button variant="outline" className="cursor-pointer" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button variant="outline" className="cursor-pointer" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
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

export default Inbox;
