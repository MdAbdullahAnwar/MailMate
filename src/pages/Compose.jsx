import React, { useState, useRef, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import { useUser } from '@clerk/clerk-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMailAPI } from '../hooks/useMailAPI';

const Compose = () => {
  const editor = useRef(null);
  const [content, setContent] = useState('');
  const [email, setEmail] = useState({
    to: '',
    subject: '',
    from: ''
  });
  const { user } = useUser();
  const { loading, sendEmail } = useMailAPI(user?.primaryEmailAddress?.emailAddress);

  // Debugging: Log when component mounts and user state changes
  useEffect(() => {
    console.log('Compose component mounted');
    if (user) {
      console.log('User email set:', user.primaryEmailAddress.emailAddress);
    }
  }, [user]);

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

  const isValidEmail = (email) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    console.log('Email validation:', email, isValid);
    return isValid;
  };

  const handleSendEmail = async () => {
    console.log('Attempting to send email...');
    
    if (!email.to.trim()) {
      console.log('Empty recipient email');
      toast.error('Recipient email is required', { position: 'top-right' });
      return;
    }

    if (!isValidEmail(email.to.trim())) {
      console.log('Invalid email format');
      toast.error('Please enter a valid email address', { position: 'top-right' });
      return;
    }
    
    if (!email.subject.trim()) {
      console.log('Empty subject');
      toast.error('Subject is required', { position: 'top-right' });
      return;
    }
    
    if (!content.trim()) {
      console.log('Empty content');
      toast.error('Message content is required', { position: 'top-right' });
      return;
    }

    try {
      console.log('Sending email with data:', {
        to: email.to.trim(),
        from: email.from,
        subject: email.subject.trim(),
        content: content
      });
      
      await sendEmail({
        to: email.to.trim(),
        from: email.from,
        subject: email.subject.trim(),
        content: content
      });

      console.log('Email sent successfully');
      setContent('');
      setEmail({
        to: '',
        subject: '',
        from: email.from
      });
      
      toast.success('Email sent successfully!', { position: 'top-right' });
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email', { position: 'top-right' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md py-2.4 px-8 ml-28 mx-auto">
      <ToastContainer 
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <h1 className="text-2xl font-bold text-gray-800 pt-3 mb-1">Compose Email</h1>
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
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 mt-2 mb-3 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {loading ? 'Sending...' : 'Send Email'}
        </button>
      </div>
    </div>
  );
};

export default Compose;
