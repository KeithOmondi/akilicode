import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import type {
  CodeSnippet,
  CodeExecution,
  CodePlaygroundSession,
  CodeExecutionResult,
  SnippetStats,
  CreateSnippetPayload,
  UpdateSnippetPayload,
  GetSnippetsParams,
  ExecuteCodePayload,
  SaveSessionPayload,
  PlaygroundLanguage,
} from "../../interfaces/codePlayground.interface";
import { codePlaygroundService } from "../../components/service/codePlaygroundService";

// ── State ─────────────────────────────────────────────────────────────────────

interface CodePlaygroundState {
  code: string;
  language: PlaygroundLanguage;
  isDarkMode: boolean;
  fontSize: number;
  snippets: CodeSnippet[];
  currentSnippet: CodeSnippet | null;
  snippetsLoading: boolean;
  executionResult: CodeExecutionResult | null;
  executionHistory: CodeExecution[];
  executing: boolean;
  session: CodePlaygroundSession | null;
  sessionLoading: boolean;
  searchResults: CodeSnippet[];
  searchLoading: boolean;
  stats: SnippetStats | null;
  shareLink: string | null;
  shareLoading: boolean;
  sharedSnippet: CodeSnippet | null;
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: CodePlaygroundState = {
  code: "// Start coding here\nconsole.log('Hello, AkiliCode!');",
  language: "javascript",
  isDarkMode: true,
  fontSize: 14,
  snippets: [],
  currentSnippet: null,
  snippetsLoading: false,
  executionResult: null,
  executionHistory: [],
  executing: false,
  session: null,
  sessionLoading: false,
  searchResults: [],
  searchLoading: false,
  stats: null,
  shareLink: null,
  shareLoading: false,
  sharedSnippet: null,
  loading: false,
  error: null,
  message: null,
};

// ── Thunk Configuration ───────────────────────────────────────────────────────

/**
 * Common configuration for ThunkAPI to avoid repeating types.
 * Specifying 'rejectValue' as string allows thunkAPI.rejectWithValue() 
 * to return a type that matches the Thunk's signature.
 */
interface AsyncThunkConfig {
  rejectValue: string;
}

// Helper to extract axios error messages
const getErrorMessage = (err: unknown, fallback: string): string => {
  const error = err as AxiosError<{ message: string }>;
  return error.response?.data?.message ?? fallback;
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const createSnippet = createAsyncThunk<CodeSnippet, CreateSnippetPayload, AsyncThunkConfig>(
  "playground/createSnippet",
  async (data, { rejectWithValue }) => {
    try {
      return await codePlaygroundService.createSnippet(data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to create snippet"));
    }
  }
);

export const getSnippets = createAsyncThunk<CodeSnippet[], GetSnippetsParams | undefined, AsyncThunkConfig>(
  "playground/getSnippets",
  async (params, { rejectWithValue }) => {
    try {
      return await codePlaygroundService.getSnippets(params);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch snippets"));
    }
  }
);

export const getSnippetById = createAsyncThunk<CodeSnippet, string, AsyncThunkConfig>(
  "playground/getSnippetById",
  async (id, { rejectWithValue }) => {
    try {
      return await codePlaygroundService.getSnippetById(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch snippet"));
    }
  }
);

export const updateSnippet = createAsyncThunk<CodeSnippet, { id: string; data: UpdateSnippetPayload }, AsyncThunkConfig>(
  "playground/updateSnippet",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await codePlaygroundService.updateSnippet(id, data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to update snippet"));
    }
  }
);

export const deleteSnippet = createAsyncThunk<string, string, AsyncThunkConfig>(
  "playground/deleteSnippet",
  async (id, { rejectWithValue }) => {
    try {
      await codePlaygroundService.deleteSnippet(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to delete snippet"));
    }
  }
);

export const toggleFavorite = createAsyncThunk<CodeSnippet, string, AsyncThunkConfig>(
  "playground/toggleFavorite",
  async (id, { rejectWithValue }) => {
    try {
      return await codePlaygroundService.toggleFavorite(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to toggle favorite"));
    }
  }
);

export const executeCode = createAsyncThunk<CodeExecutionResult, ExecuteCodePayload, AsyncThunkConfig>(
  "playground/executeCode",
  async (payload, { rejectWithValue }) => {
    try {
      return await codePlaygroundService.executeCode(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Execution failed"));
    }
  }
);

export const getExecutionHistory = createAsyncThunk<CodeExecution[], { snippetId: string; limit?: number }, AsyncThunkConfig>(
  "playground/getExecutionHistory",
  async ({ snippetId, limit }, { rejectWithValue }) => {
    try {
      return await codePlaygroundService.getExecutionHistory(snippetId, limit);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch execution history"));
    }
  }
);

export const saveSession = createAsyncThunk<CodePlaygroundSession, SaveSessionPayload, AsyncThunkConfig>(
  "playground/saveSession",
  async (payload, { rejectWithValue }) => {
    try {
      return await codePlaygroundService.saveSession(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to save session"));
    }
  }
);

export const getSession = createAsyncThunk<CodePlaygroundSession | null, void, AsyncThunkConfig>(
  "playground/getSession",
  async (_, { rejectWithValue }) => {
    try {
      return await codePlaygroundService.getSession();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to load session"));
    }
  }
);

export const searchSnippets = createAsyncThunk<CodeSnippet[], string, AsyncThunkConfig>(
  "playground/searchSnippets",
  async (query, { rejectWithValue }) => {
    try {
      return await codePlaygroundService.searchSnippets(query);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Search failed"));
    }
  }
);

export const getStats = createAsyncThunk<SnippetStats, void, AsyncThunkConfig>(
  "playground/getStats",
  async (_, { rejectWithValue }) => {
    try {
      return await codePlaygroundService.getStats();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch stats"));
    }
  }
);

export const generateShareLink = createAsyncThunk<string, string, AsyncThunkConfig>(
  "playground/generateShareLink",
  async (id, { rejectWithValue }) => {
    try {
      const { shareUrl } = await codePlaygroundService.generateShareLink(id);
      return shareUrl;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to generate share link"));
    }
  }
);

export const getSharedSnippet = createAsyncThunk<CodeSnippet, string, AsyncThunkConfig>(
  "playground/getSharedSnippet",
  async (token, { rejectWithValue }) => {
    try {
      return await codePlaygroundService.getSharedSnippet(token);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Shared snippet not found"));
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const EXCLUDED_PENDING = [
  "playground/executeCode",
  "playground/getSnippets",
  "playground/saveSession",
  "playground/getSession",
  "playground/searchSnippets",
  "playground/generateShareLink",
];

const codePlaygroundSlice = createSlice({
  name: "playground",
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    setLanguage: (state, action: PayloadAction<PlaygroundLanguage>) => {
      state.language = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload;
    },
    clearExecutionResult: (state) => {
      state.executionResult = null;
    },
    clearShareLink: (state) => {
      state.shareLink = null;
    },
    clearCurrentSnippet: (state) => {
      state.currentSnippet = null;
    },
    loadSnippetIntoEditor: (state, action: PayloadAction<CodeSnippet>) => {
      state.currentSnippet = action.payload;
      state.code = action.payload.code;
      state.language = action.payload.language;
    },
    resetPlaygroundState: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSnippet.fulfilled, (state, action: PayloadAction<CodeSnippet>) => {
        state.loading = false;
        state.currentSnippet = action.payload;
        state.snippets.unshift(action.payload);
        state.message = "Snippet saved!";
      })

      .addCase(getSnippets.pending, (state) => {
        state.snippetsLoading = true;
      })
      .addCase(getSnippets.fulfilled, (state, action: PayloadAction<CodeSnippet[]>) => {
        state.snippetsLoading = false;
        state.snippets = action.payload;
      })
      .addCase(getSnippets.rejected, (state) => {
        state.snippetsLoading = false;
      })

      .addCase(getSnippetById.fulfilled, (state, action: PayloadAction<CodeSnippet>) => {
        state.loading = false;
        state.currentSnippet = action.payload;
      })

      .addCase(updateSnippet.fulfilled, (state, action: PayloadAction<CodeSnippet>) => {
        state.loading = false;
        state.currentSnippet = action.payload;
        state.snippets = state.snippets.map((s) => (s.id === action.payload.id ? action.payload : s));
        state.message = "Snippet updated!";
      })

      .addCase(deleteSnippet.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.snippets = state.snippets.filter((s) => s.id !== action.payload);
        if (state.currentSnippet?.id === action.payload) state.currentSnippet = null;
        state.message = "Snippet deleted";
      })

      .addCase(toggleFavorite.fulfilled, (state, action: PayloadAction<CodeSnippet>) => {
        state.loading = false;
        state.snippets = state.snippets.map((s) => (s.id === action.payload.id ? action.payload : s));
        if (state.currentSnippet?.id === action.payload.id) state.currentSnippet = action.payload;
      })

      .addCase(executeCode.pending, (state) => {
        state.executing = true;
        state.executionResult = null;
      })
      .addCase(executeCode.fulfilled, (state, action: PayloadAction<CodeExecutionResult>) => {
        state.executing = false;
        state.executionResult = action.payload;
        if (state.currentSnippet) {
          state.currentSnippet.execution_count += 1;
          state.snippets = state.snippets.map((s) =>
            s.id === state.currentSnippet!.id ? { ...s, execution_count: s.execution_count + 1 } : s
          );
        }
      })
      .addCase(executeCode.rejected, (state, action) => {
        state.executing = false;
        state.error = action.payload ?? "Execution failed";
      })

      .addCase(getExecutionHistory.fulfilled, (state, action: PayloadAction<CodeExecution[]>) => {
        state.loading = false;
        state.executionHistory = action.payload;
      })

      .addCase(saveSession.pending, (state) => {
        state.sessionLoading = true;
      })
      .addCase(saveSession.fulfilled, (state, action: PayloadAction<CodePlaygroundSession>) => {
        state.sessionLoading = false;
        state.session = action.payload;
      })
      .addCase(saveSession.rejected, (state) => {
        state.sessionLoading = false;
      })

      .addCase(getSession.pending, (state) => {
        state.sessionLoading = true;
      })
      .addCase(getSession.fulfilled, (state, action: PayloadAction<CodePlaygroundSession | null>) => {
        state.sessionLoading = false;
        state.session = action.payload;
        if (action.payload && !state.currentSnippet) {
          state.code = action.payload.current_code;
          state.language = action.payload.current_language as PlaygroundLanguage;
          state.isDarkMode = action.payload.is_dark_mode;
          if (action.payload.font_size) state.fontSize = action.payload.font_size;
        }
      })
      .addCase(getSession.rejected, (state) => {
        state.sessionLoading = false;
      })

      .addCase(searchSnippets.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchSnippets.fulfilled, (state, action: PayloadAction<CodeSnippet[]>) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchSnippets.rejected, (state) => {
        state.searchLoading = false;
      })

      .addCase(getStats.fulfilled, (state, action: PayloadAction<SnippetStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })

      .addCase(generateShareLink.pending, (state) => {
        state.shareLoading = true;
        state.shareLink = null;
      })
      .addCase(generateShareLink.fulfilled, (state, action: PayloadAction<string>) => {
        state.shareLoading = false;
        state.shareLink = action.payload;
      })
      .addCase(generateShareLink.rejected, (state) => {
        state.shareLoading = false;
      })

      .addCase(getSharedSnippet.fulfilled, (state, action: PayloadAction<CodeSnippet>) => {
        state.loading = false;
        state.sharedSnippet = action.payload;
      })

      // ── Global pending (excludes thunks with dedicated loading flags) ────────
      .addMatcher(
        (action) =>
          action.type.startsWith("playground/") &&
          action.type.endsWith("/pending") &&
          !EXCLUDED_PENDING.some((prefix) => action.type.startsWith(prefix)),
        (state) => {
          state.loading = true;
          state.error = null;
          state.message = null;
        }
      )

      // ── Global rejected ──────────────────────────────────────────────────────
      .addMatcher(
        (action) => action.type.startsWith("playground/") && action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          // Use the typed action.payload provided by rejectWithValue
          state.error = action.payload ?? "Something went wrong";
        }
      );
  },
});

export const {
  setCode,
  setLanguage,
  toggleDarkMode,
  setFontSize,
  clearExecutionResult,
  clearShareLink,
  clearCurrentSnippet,
  loadSnippetIntoEditor,
  resetPlaygroundState,
} = codePlaygroundSlice.actions;

export default codePlaygroundSlice.reducer;
