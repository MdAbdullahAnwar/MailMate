import { useState, Fragment } from 'react';
import { Star, StarOff } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import EmailModal from '../components/EmailModal';
import { useMailAPI } from '../hooks/useMailAPI';
import { usePaginatedEmails } from '../hooks/usePaginatedEmails';
import useSyncMailCounts from '../hooks/useSyncMailCounts';
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

const Inbox = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedEmail, setSelectedEmail] = useState(null);
  
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  useSyncMailCounts(userEmail);

  const { loading, fetchEmails, toggleStar, moveToTrash, markAsRead } = useMailAPI(userEmail);
  
  const {
    emails,
    page,
    setPage,
    totalPages,
    refresh
  } = usePaginatedEmails({
    userEmail,
    fetchFn: fetchEmails,
    folder: 'inbox',
    pageSize: 5
  });

  const handleCompose = () => {
    navigate('/compose');
  };

  const handleEmailClick = async (emailId) => {
    try {
      const email = emails.find(e => e.id === emailId);
      setSelectedEmail(email);

      if (!email.read) {
        await markAsRead(emailId);
        refresh();
      }
    } catch (error) {
      toast.error('Failed to open email');
    }
  };

  const handleDelete = async (emailId) => {
    try {
      await moveToTrash(emailId);
      toast.success('Email moved to trash');
      refresh();
    } catch (error) {
      toast.error('Failed to delete email');
    }
  };

  const handleToggleStar = async (email) => {
    try {
      await toggleStar(email.id, email.starred);
      toast.success(email.starred ? 'Unstarred' : 'Starred');
      refresh();
    } catch (error) {
      toast.error('Failed to update star status');
    }
  };

  return (
    <Fragment>
      <Card className="h-fit ml-28">
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
                    <TableRow 
                      key={email.id} 
                      onClick={() => handleEmailClick(email.id)} 
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell onClick={(e) => { e.stopPropagation(); handleToggleStar(email); }}>
                        {email.starred ? (
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
                  <Button 
                    variant="outline" 
                    className="cursor-pointer" 
                    disabled={page === 1} 
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    className="cursor-pointer" 
                    disabled={page === totalPages} 
                    onClick={() => setPage(p => p + 1)}
                  >
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
