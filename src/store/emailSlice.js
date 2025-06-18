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

export const fetchSentCount = createAsyncThunk(
  'email/fetchSentCount',
  async (userEmail) => {
    const q = query(
      collection(db, 'emails'),
      where('owner', '==', userEmail),
      where('folder', '==', 'sent')
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }
);

export const fetchStarredCount = createAsyncThunk(
  'email/fetchStarredCount',
  async (userEmail) => {
    const q = query(
      collection(db, 'emails'),
      where('owner', '==', userEmail),
      where('starred', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }
);

const emailSlice = createSlice({
  name: 'email',
  initialState: {
    unreadCount: 0,
    trashCount: 0,
    sentCount: 0,
    starredCount: 0,
    status: 'idle',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchTrashCount.fulfilled, (state, action) => {
        state.trashCount = action.payload;
      })
      .addCase(fetchSentCount.fulfilled, (state, action) => {
        state.sentCount = action.payload;
      })
      .addCase(fetchStarredCount.fulfilled, (state, action) => {
        state.starredCount = action.payload;
      });
  },
});

export default emailSlice.reducer;
