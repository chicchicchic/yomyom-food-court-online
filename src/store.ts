import { createStore, applyMiddleware, Store } from 'redux';
import { ThunkMiddleware, thunk } from 'redux-thunk';
import rootReducer from './reducers';
import { persistStore, persistReducer, PersistConfig, Persistor } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Infer the AppState type from the rootReducer
type AppState = ReturnType<typeof rootReducer>;

// Define the persist config with the correct types
const persistConfig: PersistConfig<AppState> = {
  key: 'root',
  storage,
};

// Create the persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with the persisted reducer and middleware
const store: Store<AppState> = createStore(
  persistedReducer,
  applyMiddleware(thunk as ThunkMiddleware<AppState>)
);

// Create the persistor
const persistor: Persistor = persistStore(store);

export { store, persistor };
