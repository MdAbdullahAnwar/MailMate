import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Async thunk to fetch unread email count for the inbox
export const fetchUnreadCount = createAsyncThunk(
  'email/fetchUnreadCount',
  async (userEmail) => {
    const q = query(
      collection(db, 'emails'),
      where('owner', '==', userEmail),
      where('folder', '==', 'inbox'),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }
);

// Async thunk to fetch trash email count
export const fetchTrashCount = createAsyncThunk(
  'email/fetchTrashCount',
  async (userEmail) => {
    const q = query(
      collection(db, 'emails'),
      where('owner', '==', userEmail),
      where('folder', '==', 'trash')
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }
);

// Redux slice
const emailSlice = createSlice({
  name: 'email',
  initialState: {
    unreadCount: 0,
    trashCount: 0,
    status: 'idle',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchUnreadCount lifecycle
      .addCase(fetchUnreadCount.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state) => {
        state.status = 'failed';
      })

      // fetchTrashCount fulfillment
      .addCase(fetchTrashCount.fulfilled, (state, action) => {
        state.trashCount = action.payload;
      });
  },
});

export default emailSlice.reducer;
