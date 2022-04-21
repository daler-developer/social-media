import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import * as api from '../../utils/api'

const login = createAsyncThunk('auth/login', async ({ username, password }, thunkAPI) => {
  try {
    const { data } = await api.login({ username, password })
    
    localStorage.setItem('auth-token', data.token)

    return data
  } catch (e) {
    return thunkAPI.rejectWithValue({ errorType: e.response.data.errorType })
  }
})

const register = createAsyncThunk('auth/register', async ({ username, password }, thunkAPI) => {
  try {
    const { data } = await api.register({ username, password })

    localStorage.setItem('auth-token', data.token)

    return data
  } catch (e) {
    return thunkAPI.rejectWithValue({ errorType: e.response.data.errorType })
  }
})

const fetchCurrentUser = createAsyncThunk('auth/get-current-user', async (_, thunkAPI) => {
  try {
    const { data } = await api.getCurrentUser()

    return data
  } catch (e) {
    return thunkAPI.rejectWithValue({ errorType: e.response.data.errorType })
  }
})

const initialState = {
  currentUser: null,
  isLoadingCurrentUser: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser(state, { payload }) {
      state.currentUser = payload
    }
  },
  extraReducers: (builder) => {
    builder

      .addCase(login.fulfilled, (state, { payload }) => {
        state.currentUser = payload.user
      })

      .addCase(register.fulfilled, (state, { payload }) => {
        state.currentUser = payload.user
      })

      .addCase(fetchCurrentUser.pending, (state, { payload }) => {
        state.isLoadingCurrentUser = true
        state.currentUser = null
      })
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.isLoadingCurrentUser = false
        state.currentUser = payload.user
      })
  }
})

export const selectCurrentUser = (state) => {
  return state.auth.currentUser
}

export const selectIsLoadingCurrentUser = (state) => {
  return state.auth.isLoadingCurrentUser
}

export const authActions = {
  ...authSlice.actions,
  login,
  register,
  fetchCurrentUser
}

const authReducer = authSlice.reducer

export default authReducer