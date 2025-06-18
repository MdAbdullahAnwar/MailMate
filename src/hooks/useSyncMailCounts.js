import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { fetchUnreadCount, fetchTrashCount, fetchSentCount } from '../store/emailSlice';

const useSyncMailCounts = (userEmail) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!userEmail) return;

    const pollMails = async () => {
      dispatch(fetchUnreadCount(userEmail));
      dispatch(fetchTrashCount(userEmail));
      dispatch(fetchSentCount(userEmail));
    };

    pollMails();
    intervalRef.current = setInterval(pollMails, 2000);

    return () => clearInterval(intervalRef.current);
  }, [userEmail, dispatch]);
};

export default useSyncMailCounts;
