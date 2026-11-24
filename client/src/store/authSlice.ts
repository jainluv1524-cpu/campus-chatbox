import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// API base URL
const API_BASE = 'http://localhost:3002/api';

// Socket.IO integration
let socket: any = null;

// Initialize Socket.IO connection
export const initSocket = (token: string) => {
  if (socket) {
    socket.disconnect();
  }
  
  socket = io('http://localhost:3001', {
    auth: { token },
    transports: ['websocket']
  });

  // Listen for incoming messages
  socket.on('receive-message', (message: any) => {
    // Message received - would dispatch to state
    console.log('New message received:', message);
  });

  // Listen for user status updates
  socket.on('user-status', (data: { userId: string; isOnline: boolean }) => {
    // Update user online status in state
    console.log('User status:', data);
  });

  // Listen for typing indicators
  socket.on('typing', (data: { conversationId: string; senderId: string; isTyping: boolean }) => {
    // Handle typing indicator
    console.log('Typing indicator:', data);
  });

  return socket;
};

// Terminate Socket.IO connection
export const terminateSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Auth state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  status: 'idle',
  error: null,
  socketConnected: false,
};

// Login user (async thunk)
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Initialize Socket.IO with the token
      if (socket) {
        socket.disconnect();
      }
      initSocket(data.token);
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Register user (async thunk)
export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    fullName: string;
    displayName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    college?: string;
    department?: string;
    academicYear?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Registration failed');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', data.token || '');
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  if (socket) {
    terminateSocket();
  }
  localStorage.removeItem('token');
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Manual token verification
    verifyToken: (state, action) => {
      const token = action.payload;
      if (token && token !== 'undefined') {
        state.token = token;
        state.isAuthenticated = true;
        // Decode token to get user info (simplified)
        try {
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          state.user = {
            id: payload.sub || uuidv4(),
            fullName: payload.fullName || '',
            displayName: payload.displayName || '',
            email: payload.email || '',
            college: payload.college || '',
          };
        } catch {
          state.user = null;
        }
      } else {
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setUserOnline: (state, action) => {
      const { userId, isOnline } = action.payload;
      if (state.user && state.user.id === userId) {
        state.user.isOnline = isOnline;
      }
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.socketConnected = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
    
    // Register cases
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.socketConnected = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
    
    // Logout cases
    builder
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
        state.socketConnected = false;
        if (socket) {
          terminateSocket();
        }
      });
  },
});

export const { verifyToken, clearError, setUserOnline } = authSlice.actions;
export default authSlice.reducer;