import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "./notifications/notificationSlice";

export const store = configureStore({
  reducer: {
    notifications: notificationReducer,
  },
});

export default store;
