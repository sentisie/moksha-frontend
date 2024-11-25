import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IFavoriteProduct } from "../../../types/types";
import { addFavorite, removeFavorite } from "./favoriteActionCreator";
import { fetchFavorites } from "./favoriteActionCreator";
import { toast } from "react-toastify";
import { logoutUser } from "../user/userSlice";

interface FavoritesState {
	favorites: IFavoriteProduct[];
	isLoading: boolean;
	loadingItems: { [key: number]: boolean };
	error: string | null;
}

const initialState: FavoritesState = {
	favorites: [],
	isLoading: false,
	loadingItems: {},
	error: null,
};

const favoritesSlice = createSlice({
	name: "favorites",
	initialState,
	reducers: {
		resetFavorites(state) {
			state.favorites = [];
			state.error = null;
			state.loadingItems = {};
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchFavorites.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(
				fetchFavorites.fulfilled,
				(state, action: PayloadAction<IFavoriteProduct[]>) => {
					state.isLoading = false;
					state.favorites = action.payload;
					state.error = null;
				}
			)
			.addCase(fetchFavorites.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})
			.addCase(
				addFavorite.fulfilled,
				(state, action: PayloadAction<IFavoriteProduct>) => {
					state.favorites.push(action.payload);
				}
			)
			.addCase(addFavorite.rejected, (state, action) => {
				state.error = action.payload as string;
				toast.warning(state.error);
			})
			.addCase(
				removeFavorite.fulfilled,
				(state, action: PayloadAction<number>) => {
					state.favorites = state.favorites.filter(
						(item) => item.id !== action.payload
					);
				}
			)
			.addCase(logoutUser, (state) => {
				state.favorites = [];
				state.error = null;
			});
	},
});

export const { resetFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
