
import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "../features/posts/postsSlice.js";

export const store = configureStore({
  reducer: {
    posts: postsReducer,
  },
});
