import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Mailbox, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const navigate = useNavigate();

  const [inboxPreview, setInboxPreview] = useState([]);
  const [sentPreview, setSentPreview] = useState([]);

  const fetchEmails = async (folder, setter) => {
    if (!userEmail) return;

    try {
      const q = query(
        collection(db, 'emails'),
        where('owner', '==', userEmail),
        where('folder', '==', folder),
        orderBy('timestamp', 'desc'),
        limit(3)
      );

      const snapshot = await getDocs(q);
      const emails = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));

      setter(emails);
    } catch (error) {
      console.error(`Error fetching ${folder} emails:`, error);
    }
  };

  useEffect(() => {
    fetchEmails('inbox', setInboxPreview);
    fetchEmails('sent', setSentPreview);
  }, [userEmail]);

  const renderPreview = (title, emails, icon, onClick) => (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 w-full sm:w-[45%] cursor-pointer hover:shadow-lg transition-shadow duration-200"
    >
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-blue-600 hover:text-blue-800">
        {icon}
        {title}
      </h2>
      {emails.length === 0 ? (
        <p className="text-gray-500 italic text-sm">No recent emails</p>
      ) : (
        <ul className="text-sm space-y-3">
          {emails.map(email => (
            <li key={email.id} className="border-b pb-2">
              <div className="font-semibold">{email.subject || '(No Subject)'}</div>
              <div className="text-gray-500 text-xs">
                {email.folder === 'sent' ? `To: ${email.to}` : `From: ${email.from}`}
              </div>
              <div className="text-gray-400 text-xs">
                {formatDistanceToNow(email.timestamp, { addSuffix: true })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-red-350 to-red-500 rounded-md flex flex-col items-center justify-center px-4 ml-28 sm:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600">📊 Welcome to your Dashboard!</h1>
        <p className="mt-3 text-lg text-gray-700">This is your protected dashboard area</p>
      </div>

      {/* Activity Preview Row */}
      <div className="w-full flex flex-col sm:flex-row gap-6 mt-8 justify-center">
        {renderPreview('Recent Inbox', inboxPreview, <Mailbox size={18} />, () => navigate('/inbox'))}
        {renderPreview('Recent Sent', sentPreview, <Send size={18} />, () => navigate('/sent'))}
      </div>
    </div>
  );
};

export default Dashboard;
