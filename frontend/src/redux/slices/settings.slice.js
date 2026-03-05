import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSettingsAPI } from '../../services/settingsService';

export const getSettings = createAsyncThunk('settings/get', async () => {
  return await fetchSettingsAPI();
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    siteName: 'MovieDeck',
    currencySymbol: '$',
    loading: false
  },
  reducers: {
    // Optional: immediate update for UI optimism
    setGlobalSettings: (state, action) => {
        state.siteName = action.payload.siteName;
        state.currencySymbol = action.payload.currencySymbol;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.siteName = action.payload.siteName;
        state.currencySymbol = action.payload.currencySymbol;
      });
  },
});

export const { setGlobalSettings } = settingsSlice.actions;
export default settingsSlice.reducer;