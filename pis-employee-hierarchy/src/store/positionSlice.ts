import { 
  createSlice, 
  createAsyncThunk, 
  PayloadAction } from "@reduxjs/toolkit";
import { getPositions, 
  getPositionById,
  getChildren,
  createPosition as apiCreatePosition,
  updatePosition as apiUpdatePosition,
  deletePosition as apiDeletePosition
 } from "../service/positionApi"; // adjust path

// Types
export interface Position {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  parent?: { id: string; name: string } | null;
  parentId?: string | null;
  children?: Position[] | null;
}

interface PositionState {
  positions: Position[];
  selectedPosition: Position | null;
  children: Position[];
  loading: {
    positions: boolean;
    selectedPosition: boolean;
    children: boolean;
  };
  error: {
    positions: string | null;
    selectedPosition: string | null;
    children: string | null;
  };
}

interface PositionUpdateData {
  name: string;
  description?: string;
  parentId?: string | null;
}

const initialState: PositionState = {
  positions: [],
  selectedPosition: null,
  children: [],
  loading: {
    positions: false,
    selectedPosition: false,
    children: false,
  },
  error: {
    positions: null,
    selectedPosition: null,
    children: null,
  },
};

// Thunks
export const fetchPositions = createAsyncThunk(
  "positions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getPositions();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPositionById = createAsyncThunk(
  "positions/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getPositionById(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChildren = createAsyncThunk(
  "positions/fetchChildren",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getChildren(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPosition = createAsyncThunk(
  "positions/create",
  async (positionData: Position, { rejectWithValue }) => {
    try {
      const data = {
        ...positionData,
        parentId: positionData.parentId ?? undefined,
      };

      return await apiCreatePosition(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ??
        error.message ??
        "Something went wrong"
      );
    }
  }
);

export const updatePosition = createAsyncThunk(
  "positions/update",
  async (
    {
      id,
      positionData,
    }: {
      id: string;
      positionData: PositionUpdateData;
    },
    { rejectWithValue }
  ) => {
    try {
      return await apiUpdatePosition(id, positionData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePosition = createAsyncThunk(
  "positions/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      return await apiDeletePosition(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ??
        error.message ??
        "Something went wrong"
      );
    }
  }
);


// Slice
const positionSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    clearSelectedPosition(state) {
      state.selectedPosition = null;
      state.error.selectedPosition = null;
    },
    clearChildren(state) {
      state.children = [];
      state.error.children = null;
    },
    clearErrors(state) {
      state.error = { positions: null, selectedPosition: null, children: null };
    },
  },
  extraReducers: (builder) => {
    // fetchPositions
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.loading.positions = true;
        state.error.positions = null;
      })
      .addCase(fetchPositions.fulfilled, (state, action: PayloadAction<Position[]>) => {
        state.loading.positions = false;
        state.positions = action.payload;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading.positions = false;
        state.error.positions = action.payload as string;
      });

    // fetchPositionById
    builder
      .addCase(fetchPositionById.pending, (state) => {
        state.loading.selectedPosition = true;
        state.error.selectedPosition = null;
      })
      .addCase(fetchPositionById.fulfilled, (state, action: PayloadAction<Position>) => {
        state.loading.selectedPosition = false;
        state.selectedPosition = action.payload;
      })
      .addCase(fetchPositionById.rejected, (state, action) => {
        state.loading.selectedPosition = false;
        state.error.selectedPosition = action.payload as string;
      });

    // fetchChildren
    builder
      .addCase(fetchChildren.pending, (state) => {
        state.loading.children = true;
        state.error.children = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action: PayloadAction<Position[]>) => {
        state.loading.children = false;
        state.children = action.payload;
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.loading.children = false;
        state.error.children = action.payload as string;
      });

      // createPosition
      builder
      .addCase(createPosition.pending, (state) => {
        state.loading.positions = true;
        state.error.positions = null;
      })
      .addCase(createPosition.fulfilled, (state, action: PayloadAction<Position>) => {
        state.loading.positions = false;
        state.positions.push(action.payload);
      })
      .addCase(createPosition.rejected, (state, action) => {
        state.loading.positions = false;
        state.error.positions = action.payload as string;
      });
      

      // updatePosition
      builder
      .addCase(updatePosition.pending, (state) => { 
        state.loading.positions = true;
        state.error.positions = null;
      })
      .addCase(updatePosition.fulfilled, (state, action: PayloadAction<Position>) => {
        state.loading.positions = false;
        const index = state.positions.findIndex(pos => pos.id === action.payload.id);
        if (index !== -1) {
          state.positions[index] = action.payload;
        }
      })
     .addCase(updatePosition.rejected, (state, action) => {
        state.loading.positions = false;
        state.error.positions = action.payload as string;
      })

      // deletePosition   
      builder
      .addCase(deletePosition.pending, (state) => {
        state.loading.positions = true;
        state.error.positions = null;
      })
      .addCase(deletePosition.fulfilled, (state, action: PayloadAction<{ id: string }>) => {
        state.loading.positions = false;
        state.positions = state.positions.filter(pos => pos.id !== action.payload.id);
      })
      .addCase(deletePosition.rejected, (state, action) => {
        state.loading.positions = false;
        state.error.positions = action.payload as string;
      });
  },
});

export const { clearSelectedPosition, clearChildren, clearErrors } = positionSlice.actions;
export default positionSlice.reducer;