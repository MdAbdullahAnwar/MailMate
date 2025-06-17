import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

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

const emailSlice = createSlice({
  name: 'email',
  initialState: {
    unreadCount: 0,
    status: 'idle',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default emailSlice.reducer;
