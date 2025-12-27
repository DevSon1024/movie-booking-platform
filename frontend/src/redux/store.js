import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import movieReducer from './slices/movieSlice';
import settingsReducer from './slices/settingsSlice';

const store = configureStore({
    reducer:{
        auth: authReducer,
        movies: movieReducer,
        settings: settingsReducer,
    },
    devTools:true,
});
export default store;