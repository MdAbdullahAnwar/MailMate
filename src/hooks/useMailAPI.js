import { useState } from 'react';
import {
  collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, updateDoc,
  doc as firestoreDoc, deleteDoc as firestoreDeleteDoc, limit, startAfter
} from 'firebase/firestore';
import { db } from '../firebase';

export const useMailAPI = (userEmail) => {
  const [loading, setLoading] = useState(false);

  const sendEmail = async (emailData) => {
    try {
      setLoading(true);

      if (!emailData.to || !emailData.from || !emailData.subject || !emailData.content) {
        throw new Error('Missing required email fields');
      }

      const sentEmail = {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        content: emailData.content,
        folder: 'sent',
        owner: userEmail,
        read: true,
        starred: false,
        timestamp: serverTimestamp()
      };

      const receivedEmail = {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        content: emailData.content,
        folder: 'inbox',
        owner: emailData.to,
        read: false,
        starred: false,
        timestamp: serverTimestamp()
      };

      await Promise.all([
        addDoc(collection(db, 'emails'), sentEmail),
        addDoc(collection(db, 'emails'), receivedEmail)
      ]);

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async ({ folder, starred = null, pageSize = 5, pageCursor = null, countOnly = false }) => {
    try {
      setLoading(true);
      let q = query(
        collection(db, 'emails'),
        where('owner', '==', userEmail),
        where('folder', '==', folder),
        orderBy('timestamp', 'desc')
      );

      if (starred !== null) {
        q = query(q, where('starred', '==', starred));
      }

      if (countOnly) {
        const snapshot = await getDocs(q);
        return snapshot.size;
      }

      if (pageSize) {
        q = query(q, limit(pageSize));
      }

      if (pageCursor) {
        q = query(q, startAfter(pageCursor));
      }

      const snapshot = await getDocs(q);
      const emails = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      return { emails, lastVisible: snapshot.docs[snapshot.docs.length - 1] };
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (emailId) => {
    await updateDoc(firestoreDoc(db, 'emails', emailId), { read: true });
  };

  const toggleStar = async (emailId, currentStarred) => {
    await updateDoc(firestoreDoc(db, 'emails', emailId), { starred: !currentStarred });
  };

  const moveToTrash = async (emailId) => {
    await updateDoc(firestoreDoc(db, 'emails', emailId), { folder: 'trash' });
  };

  const deleteDoc = async (emailId) => {
    await firestoreDeleteDoc(firestoreDoc(db, 'emails', emailId));
  };

  const updateEmailFolder = async (emailId, folder) => {
    await updateDoc(firestoreDoc(db, 'emails', emailId), { folder });
  };

  return {
    loading,
    sendEmail,
    fetchEmails,
    markAsRead,
    toggleStar,
    moveToTrash,
    deleteDoc,
    updateEmailFolder
  };
};
