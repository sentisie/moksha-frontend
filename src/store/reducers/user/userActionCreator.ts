import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IUser, IUserLogin } from "../../../types/types";
import { BASE_URL } from "../../../utils/constants";
import { ICartProduct } from "./userSlice";

export const setAuthToken = (token: string | null) => {
	if (token) {
		axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	} else {
		delete axios.defaults.headers.common["Authorization"];
	}
};

export const createUser = createAsyncThunk<
	IUser,
	IUser,
	{ rejectValue: string }
>("users/createUser", async (payload, thunkAPI) => {
	try {
		const response = await axios.post(`${BASE_URL}/auth/register`, payload);
		const { token, user } = response.data;

		setAuthToken(token);
		localStorage.setItem("token", token);

		return user;
	} catch (err: unknown) {
		let errorMessage = "Ошибка при регистрации";
		if (axios.isAxiosError(err)) {
			errorMessage = err.response?.data?.error || errorMessage;
		}
		return thunkAPI.rejectWithValue(errorMessage);
	}
});

export const loginUser = createAsyncThunk<
	IUser,
	IUserLogin,
	{ rejectValue: string }
>("users/loginUser", async (payload, thunkAPI) => {
	try {
		const response = await axios.post(`${BASE_URL}/auth/login`, payload);
		const { token, user } = response.data;

		setAuthToken(token);
		localStorage.setItem("token", token);

		return user;
	} catch (err: unknown) {
		let errorMessage = "Ошибка при авторизации";
		if (axios.isAxiosError(err)) {
			errorMessage = err.response?.data?.error || errorMessage;
		}
		return thunkAPI.rejectWithValue(errorMessage);
	}
});

export const updateUser = createAsyncThunk<
	IUser,
	{ rejectValue: string }
>("users/updateUser", async (payload, thunkAPI) => {
	try {
		const response = await axios.put(`${BASE_URL}/auth/profile`, payload);
		return response.data;
	} catch (err: unknown) {
		let errorMessage = "Ошибка при обновлении пользователя";
		if (axios.isAxiosError(err)) {
			errorMessage = err.response?.data?.error || errorMessage;
		}
		return thunkAPI.rejectWithValue(errorMessage);
	}
});

export const checkAuth = createAsyncThunk(
	"users/checkAuth",
	async (_, thunkAPI) => {
		try {
			const token = localStorage.getItem("token");
			if (token) {
				setAuthToken(token);
				const response = await axios.get(`${BASE_URL}/auth/profile`);
				return response.data;
			}
			return null;
		} catch (err: unknown) {
			console.error("Error during authorization check:", err);
			localStorage.removeItem("token");
			setAuthToken(null);
			let errorMessage = "Ошибка сервера";
			if (axios.isAxiosError(err)) {
				errorMessage = err.response?.data?.message || errorMessage;
			}
			return thunkAPI.rejectWithValue(errorMessage);
		}
	}
);

export const saveCart = createAsyncThunk(
	"users/saveCart",
	async (cart: ICartProduct[], thunkAPI) => {
		try {
			await axios.post(`${BASE_URL}/cart`, { cart });
		} catch (err: unknown) {
			let errorMessage = "Ошибка сохранения корзины";
			if (axios.isAxiosError(err)) {
				errorMessage = err.response?.data?.message || errorMessage;
			}
			return thunkAPI.rejectWithValue(errorMessage);
		}
	}
);

export const loadCart = createAsyncThunk(
	"users/loadCart",
	async (_, thunkAPI) => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				return [];
			}
			const response = await axios.get(`${BASE_URL}/cart`);
			return response.data;
		} catch (err: unknown) {
			let errorMessage = "Ошибка загрузки корзины";
			if (axios.isAxiosError(err)) {
				errorMessage = err.response?.data?.message || errorMessage;
			}
			return thunkAPI.rejectWithValue(errorMessage);
		}
	}
);

export const getUserProfile = createAsyncThunk(
	"users/getProfile",
	async (_, thunkAPI) => {
		try {
			const response = await axios.get(`${BASE_URL}/auth/profile/full`);
			return response.data;
		} catch (err: unknown) {
			let errorMessage = "Ошибка получения профиля";
			if (axios.isAxiosError(err)) {
				errorMessage = err.response?.data?.message || errorMessage;
			}
			return thunkAPI.rejectWithValue(errorMessage);
		}
	}
);

export const updateAvatar = createAsyncThunk(
	"user/updateAvatar",
	async (file: File | null, thunkAPI) => {
		try {
			let response;
			if (file) {
				const formData = new FormData();
				formData.append("avatar", file);

				response = await axios.post(
					`${BASE_URL}/auth/profile/avatar`,
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);
			} else {
				response = await axios.delete(`${BASE_URL}/auth/profile/avatar`);
			}
			return response.data;
		} catch (error: unknown) {
			let errorMessage = "Ошибка при обновлении аватара";
			if (axios.isAxiosError(error)) {
				errorMessage = error.response?.data?.error || errorMessage;
			}
			return thunkAPI.rejectWithValue(errorMessage);
		}
	}
);

export const updatePassword = createAsyncThunk(
	"users/updatePassword",
	async (
		{
			currentPassword,
			newPassword,
		}: { currentPassword: string; newPassword: string },
		thunkAPI
	) => {
		try {
			const response = await axios.put(`${BASE_URL}/auth/profile/password`, {
				currentPassword,
				newPassword,
			});
			return response.data;
		} catch (err: unknown) {
			let errorMessage = "Ошибка обновления пароля";
			if (axios.isAxiosError(err)) {
				errorMessage = err.response?.data?.message || errorMessage;
			}
			return thunkAPI.rejectWithValue(errorMessage);
		}
	}
);

export const updatePhone = createAsyncThunk(
	"users/updatePhone",
	async (phone: string, thunkAPI) => {
		try {
			const response = await axios.put(`${BASE_URL}/auth/profile/phone`, {
				phone,
			});
			return response.data;
		} catch (err: unknown) {
			let errorMessage = "Ошибка обновления телефона";
			if (axios.isAxiosError(err)) {
				errorMessage = err.response?.data?.message || errorMessage;
			}
			return thunkAPI.rejectWithValue(errorMessage);
		}
	}
);

export const updateProfile = createAsyncThunk(
	"users/updateProfile",
	async (formData: FormData, thunkAPI) => {
		try {
			const response = await axios.put(`${BASE_URL}/auth/profile`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			return response.data;
		} catch (err: unknown) {
			let errorMessage = "Ошибка обновления профиля";
			if (axios.isAxiosError(err)) {
				errorMessage = err.response?.data?.error || errorMessage;
			}
			return thunkAPI.rejectWithValue(errorMessage);
		}
	}
);

export const addItemToCart = createAsyncThunk(
	'user/addItemToCart',
	async (item: ICartProduct, { rejectWithValue }) => {
		try {
			await new Promise(resolve => setTimeout(resolve, 500));
			
			const cart = JSON.parse(localStorage.getItem('cart') || '[]');
			const existingItemIndex = cart.findIndex((cartItem: ICartProduct) => cartItem.id === item.id);
			
			if (existingItemIndex !== -1) {
				cart[existingItemIndex] = item;
			} else {
				cart.push(item);
			}
			
			localStorage.setItem('cart', JSON.stringify(cart));
			return item;
		} catch (error) {
			return rejectWithValue('Ошибка при добавлении товара в корзину');
		}
	}
);
