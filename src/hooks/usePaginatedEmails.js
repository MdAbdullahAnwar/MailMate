import { useEffect, useState } from 'react';

export const usePaginatedEmails = ({ userEmail, fetchFn, folder, starred = null, pageSize = 5 }) => {
  const [emails, setEmails] = useState([]);
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = () => {
    // Reset to page 1 when refreshing to avoid empty pages
    setPage(1);
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchPage = async () => {
      if (!userEmail) return;
      
      const pageCursor = page > 1 ? cursors[page - 2] : null;
      
      try {
        const result = await fetchFn({
          folder,
          starred,
          pageSize,
          pageCursor,
        });

        if (result) {
          setEmails(result.emails || []);

          if (result.lastVisible) {
            const newCursors = [...cursors];
            newCursors[page - 1] = result.lastVisible;
            setCursors(newCursors);
          }

          const count = await fetchFn({ folder, starred, countOnly: true });
          setTotalCount(count || 0);

          if (result.emails?.length === 0 && page > 1) {
            setPage(prev => prev - 1);
          }
        }
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    fetchPage();
  }, [userEmail, page, refreshTrigger]);

  return {
    emails,
    page,
    setPage,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    refresh
  };
};
