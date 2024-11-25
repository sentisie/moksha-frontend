import { BASE_URL } from "../../../utils/constants";

import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchFavorites = createAsyncThunk(
	"favorites/fetchFavorites",
	async (params: { limit: number; offset: number }, thunkAPI) => {
		try {
			const token = localStorage.getItem("token");
			if (!token) return [];
			
			const { limit, offset } = params;
			const response = await axios.get(`${BASE_URL}/favorites`, {
				params: { limit, offset },
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			return response.data;
		} catch (error: unknown) {
			let errorMessage = "Ошибка при загрузке избранного";
			if (axios.isAxiosError(error)) {
				errorMessage = error.response?.data?.error || errorMessage;
			}
			return thunkAPI.rejectWithValue(errorMessage);
		}
	}
);

export const addFavorite = createAsyncThunk(
	"favorites/addFavorite",
	async (productId: number, thunkAPI) => {
		try {
			const response = await axios.post(`${BASE_URL}/favorites`, { productId });
			return response.data;
		} catch (error: unknown) {
			let errorMessage = "Ошибка при добавлении в избранное";
			if (axios.isAxiosError(error)) {
				errorMessage = error.response?.data?.error || errorMessage;
			}
			return thunkAPI.rejectWithValue(errorMessage);
		}
	}
);

export const removeFavorite = createAsyncThunk(
	"favorites/removeFavorite",
	async (productId: number, thunkAPI) => {
		try {
			await axios.delete(`${BASE_URL}/favorites/${productId}`);
			return productId;
		} catch (error: unknown) {
			let errorMessage = "Ошибка при удалении из избранного";
			if (axios.isAxiosError(error)) {
				errorMessage = error.response?.data?.error || errorMessage;
			}
			return thunkAPI.rejectWithValue(errorMessage);
		}
	}
);
