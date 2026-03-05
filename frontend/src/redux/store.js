import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import movieReducer from "./slices/movie.slice";
import settingsReducer from "./slices/settings.slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: movieReducer,
    settings: settingsReducer,
  },
  devTools: true,
});
export default store;
