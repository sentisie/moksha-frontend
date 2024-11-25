import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCurrencyRates } from "./currencyActionCreator";
import { CurrencyRates } from "../../../types/types";

interface CurrencyState {
	currency: string;
	rates: CurrencyRates | null;
	loading: boolean;
	error: string | null;
}

const initialState: CurrencyState = {
	currency: localStorage.getItem("currency") || "RUB",
	rates: null,
	loading: false,
	error: null,
};

export const updateCurrencyRates = createAsyncThunk(
	"currency/updateRates",
	async () => {
		const rates = await fetchCurrencyRates();
		return rates;
	}
);

const currencySlice = createSlice({
	name: "currency",
	initialState,
	reducers: {
		setCurrency(state, action) {
			state.currency = action.payload;
			localStorage.setItem("currency", action.payload);
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(updateCurrencyRates.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateCurrencyRates.fulfilled, (state, action) => {
				state.loading = false;
				state.rates = action.payload;
				state.error = null;
			})
			.addCase(updateCurrencyRates.rejected, (state, action) => {
				state.loading = false;
				state.error =
					action.error.message || "Произошла ошибка при загрузке курсов валют";
			});
	},
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
