import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ICategory } from "../../../types/types";
import { getCategories } from "./categoriesActionCreator";

interface CategoriesState {
	categories: ICategory[];
	isCatLoading: boolean;
	catError: null | string;
}

const initialState: CategoriesState = {
	categories: [],
	isCatLoading: false,
	catError: "",
};

export const categoriesSlice = createSlice({
	name: "categories",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(getCategories.pending, (state = initialState) => {
			state.isCatLoading = true;
		});
		builder.addCase(
			getCategories.fulfilled,
			(state = initialState, action: PayloadAction<ICategory[]>) => {
				state.isCatLoading = false;
				state.catError = "";
				state.categories = action.payload;
			}
		);
		builder.addCase(getCategories.rejected, (state = initialState) => {
			state.isCatLoading = false;
			state.catError = "Fetch categories error!";
		});
	},
});

export default categoriesSlice.reducer;
