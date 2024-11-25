import { combineReducers, configureStore } from "@reduxjs/toolkit";
import categoriesReducer from "./reducers/categories/categoriesSlice";
import { productApi } from "../services/ProductServices";
import userReducer from "../store/reducers/user/userSlice";
import currencyReducer from "../store/reducers/currency/currencySlice";
import deliveryReducer from "../store/reducers/delivery/deliverySlice";
import filtersReducer from "../store/reducers/filters/filtersSlice";
import { reviewApi } from "../services/ReviewsServices";
import { searchApi } from "../services/SearchServices";
import { deliveryApi } from "../services/DeliveryServices";
import favoritesReducer from "./reducers/favorites/favoritesSlice";
import { orderApi } from '../services/OrderService';

const rootReducer = combineReducers({
	categoriesReducer,
	userReducer,
	currencyReducer,
	deliveryReducer,
	filtersReducer,
	favoritesReducer,
	[productApi.reducerPath]: productApi.reducer,
	[reviewApi.reducerPath]: reviewApi.reducer,
	[searchApi.reducerPath]: searchApi.reducer,
	[deliveryApi.reducerPath]: deliveryApi.reducer,
	[orderApi.reducerPath]: orderApi.reducer,
});

export const setupStore = () => {
	return configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(
				productApi.middleware,
				reviewApi.middleware,
				searchApi.middleware,
				deliveryApi.middleware,
				orderApi.middleware
			),
	});
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
