"use client";
import { configureStore } from '@reduxjs/toolkit'
import positionSliceReducer from './positionSlice'

export const store = configureStore({
  reducer: {
    position: positionSliceReducer
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch