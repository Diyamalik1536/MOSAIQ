
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  status: "idle",
  error: null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,

  reducers: {
    setPosts(state, action) {
      state.items = action.payload;
      state.status = "succeeded";
      state.error = null;
    },

    addPost(state, action) {
      const exists = state.items.some(
        (post) => post.id === action.payload.id
      );

      if (!exists) {
        state.items.unshift(action.payload);
      }
    },

    removePost(state, action) {
      state.items = state.items.filter(
        (post) => post.id !== action.payload
      );
    },

    setPostsLoading(state) {
      state.status = "loading";
      state.error = null;
    },

    setPostsError(state, action) {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const {
  setPosts,
  addPost,
  removePost,
  setPostsLoading,
  setPostsError,
} = postsSlice.actions;

export default postsSlice.reducer;
