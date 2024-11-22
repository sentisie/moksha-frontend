import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { ICategory } from "../../../types/types";
import { BASE_URL } from "../../../utils/constants";

export const getCategories = createAsyncThunk(
	"categories/getCategories",
	async (_, thunkAPI) => {
		try {
			const response = await axios.get<ICategory[]>(`${BASE_URL}/categories`);
			return response.data;
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				return thunkAPI.rejectWithValue(err.response?.data.message);
			} else {
				return thunkAPI.rejectWithValue(
					"Неизвестная ошибка при получении категорий"
				);
			}
		}
	}
);
