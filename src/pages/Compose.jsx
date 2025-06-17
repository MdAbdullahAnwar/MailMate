import React, { useState, useRef, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Compose = () => {
  const editor = useRef(null);
  const [content, setContent] = useState('');
  const [email, setEmail] = useState({
    to: '',
    subject: '',
    from: ''
  });
  const { user } = useUser();

  const config = {
    readonly: false,
    toolbar: true,
    spellcheck: true,
    language: 'en',
    toolbarButtonSize: 'medium',
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'font', 'fontsize', '|',
      'ul', 'ol', '|',
      'align', '|',
      'undo', 'redo', '|',
      'image', 'table', 'link', '|',
      'hr', 'eraser', 'copyformat', '|',
      'fullsize', 'selectall'
    ],
    uploader: {
      insertImageAsBase64URI: true
    },
    height: 200
  };

  useEffect(() => {
    if (user) {
      setEmail(prev => ({
        ...prev,
        from: user.primaryEmailAddress.emailAddress
      }));
    }
  }, [user]);

  const handleSendEmail = async () => {
    if (!email.to || !email.subject || !content) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const emailData = {
        to: email.to,
        from: email.from,
        subject: email.subject,
        content: content,
        timestamp: serverTimestamp(),
        read: false
      };

      // Sent copy
      await addDoc(collection(db, 'emails'), {
        ...emailData,
        folder: 'sent',
        owner: email.from
      });

      // Inbox copy
      await addDoc(collection(db, 'emails'), {
        ...emailData,
        folder: 'inbox',
        owner: email.to
      });

      toast.success('Email sent successfully!');
      setContent('');
      setEmail(prev => ({ ...prev, to: '', subject: '' }));
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md py-2.4 px-8 ml-28 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 pt-3 mb-1">Compose Email</h1>
      <div className="space-y-1">
        <div>
          <label className="block text-sm font-medium text-gray-700">To:</label>
          <input
            type="email"
            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email.to}
            onChange={(e) => setEmail({ ...email, to: e.target.value })}
            placeholder="recipient@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Subject:</label>
          <input
            type="text"
            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email.subject}
            onChange={(e) => setEmail({ ...email, subject: e.target.value })}
            placeholder="Email subject"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
          <JoditEditor
            ref={editor}
            value={content}
            config={config}
            onBlur={(newContent) => setContent(newContent)}
            onChange={() => {}}
          />
        </div>

        <button
          onClick={handleSendEmail}
          className="bg-blue-600 text-white px-6 py-2 my-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Send Email
        </button>
      </div>
    </div>
  );
};

export default Compose;
