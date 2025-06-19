import { useState, Fragment } from 'react';
import { useUser } from '@clerk/clerk-react';
import { format } from 'date-fns';
import EmailModal from '../components/EmailModal';
import { useMailAPI } from '../hooks/useMailAPI';
import { usePaginatedEmails } from '../hooks/usePaginatedEmails';
import useSyncMailCounts from '../hooks/useSyncMailCounts';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MailPlus, Trash2, ChevronLeft, ChevronRight, Loader2, Send, Star, StarOff
} from 'lucide-react';
import { toast } from 'react-toastify';

const Sent = () => {
  const { user } = useUser();
  const [selectedEmail, setSelectedEmail] = useState(null);
  
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  useSyncMailCounts(userEmail);

  const mailAPI = useMailAPI(userEmail);
  const { loading, toggleStar, moveToTrash } = mailAPI;
  
  const {
    emails,
    page,
    setPage,
    totalPages,
    refresh
  } = usePaginatedEmails({
    userEmail,
    fetchFn: mailAPI.fetchEmails,
    folder: 'sent',
    pageSize: 5
  });

  const handleEmailClick = (emailId) => {
    const email = emails.find(e => e.id === emailId);
    setSelectedEmail(email);
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
      <Card className="w-260 h-fit ml-28">
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
                    <TableHead>Star</TableHead>
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
                      <TableCell
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(email);
                        }}
                      >
                        {email.starred ? (
                          <Star className="text-yellow-500" />
                        ) : (
                          <StarOff className="text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {email.to?.charAt(0).toUpperCase()}
                            </AvatarFallback>
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
                  <Button 
                    variant="outline" 
                    className="cursor-pointer" 
                    disabled={page === 1} 
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    disabled={page === totalPages} 
                    className="cursor-pointer" 
                    onClick={() => setPage(p => p + 1)}
                  >
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
