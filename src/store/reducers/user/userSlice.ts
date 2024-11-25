import { PayloadAction, createSlice, SerializedError } from "@reduxjs/toolkit";
import { IProduct, IUser, IUserProfile } from "../../../types/types";
import {
	createUser,
	loginUser,
	updateUser,
	checkAuth,
	saveCart,
	loadCart,
	getUserProfile,
	updateAvatar,
	updatePhone,
	updateProfile,
	addItemToCart
} from "./userActionCreator";
import { SIGN_UP } from "../../../utils/constants";

export interface ICartProduct extends IProduct {
	quantity: number;
}

interface UserState {
	curUser: IUser | null;
	userProfile: IUserProfile | null;
	cart: ICartProduct[];
	favorites: number[];
	formType: string;
	showForm: boolean;
	isUserLoading: boolean;
	userError: string | null;
	isCartLoading: boolean;
	cartError: string | null;
	isAuthChecked: boolean;
}

const initialState: UserState = {
	curUser: null,
	userProfile: null,
	cart: JSON.parse(localStorage.getItem('cart') || '[]'),
	favorites: JSON.parse(localStorage.getItem("favorites") || "[]"),
	formType: SIGN_UP,
	showForm: false,
	isUserLoading: false,
	userError: "",
	isCartLoading: false,
	cartError: "",
	isAuthChecked: false,
};

const handlePending = (state: UserState) => {
	state.isUserLoading = true;
};

const handleFulfilled = (state: UserState, action: PayloadAction<IUser>) => {
	state.isUserLoading = false;
	state.curUser = action.payload;
	state.userError = "";
};

const handleRejected = (
	state: UserState,
	action: PayloadAction<string | undefined, string, unknown, SerializedError>
) => {
	state.isUserLoading = false;
	state.userError = action.payload || action.error.message || "Неизвестная ошибка";
};

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		removeItemFromCart: (state, action: PayloadAction<number>) => {
			state.cart = state.cart.filter((item) => item.id !== action.payload);
			localStorage.setItem("cart", JSON.stringify(state.cart));
		},

		removeItemsFromCart: (state, action: PayloadAction<number[]>) => {
			state.cart = state.cart.filter((item) => !action.payload.includes(item.id));
			localStorage.setItem("cart", JSON.stringify(state.cart));
		},

		toggleForm: (state, action) => {
			state.showForm = action.payload;
		},

		toggleFormType: (state, action) => {
			state.formType = action.payload;
		},

		logoutUser(state) {
			state.curUser = null;
			state.cart = [];
			state.favorites = [];
			localStorage.removeItem("token");
			localStorage.removeItem("cart");
			localStorage.removeItem("favorites");
			localStorage.removeItem("selectedCartItems");
		},

		clearCart: (state) => {
			state.cart = [];
			localStorage.setItem("cart", JSON.stringify(state.cart));
		},

		setCart(state, action: PayloadAction<ICartProduct[]>) {
			state.cart = action.payload;
			localStorage.setItem("cart", JSON.stringify(state.cart));
		},
	},

	extraReducers: (builder) => {
		builder
			// sign-up
			.addCase(createUser.pending, (state) => {
				state.isUserLoading = true;
				state.userError = "";
			})
			.addCase(createUser.fulfilled, handleFulfilled)
			.addCase(createUser.rejected, handleRejected)

			// login
			.addCase(loginUser.pending, (state) => {
				state.isUserLoading = true;
				state.userError = "";
			})
			.addCase(loginUser.fulfilled, handleFulfilled)
			.addCase(loginUser.rejected, handleRejected)

			// update
			.addCase(updateUser.pending.type, handlePending)
			.addCase(updateUser.fulfilled.type, handleFulfilled)
			.addCase(updateUser.rejected.type, handleRejected)

			// check auth
			.addCase(checkAuth.pending.type, (state) => {
				state.isUserLoading = true;
			})
			.addCase(checkAuth.fulfilled.type, (state, action: PayloadAction<IUser>) => {
				state.isUserLoading = false;
				state.curUser = action.payload;
				state.isAuthChecked = true;
				state.userError = "";
			})
			.addCase(checkAuth.rejected.type, (state, action: PayloadAction<string>) => {
				state.isUserLoading = false;
				state.isAuthChecked = true;
				state.userError = action.payload;
			})

			// save сart
			.addCase(saveCart.pending.type, (state) => {
				state.isCartLoading = true;
			})
			.addCase(saveCart.fulfilled.type, (state) => {
				state.isCartLoading = false;
				state.cartError = null;
			})
			.addCase(
				saveCart.rejected.type,
				(state, action: PayloadAction<string>) => {
					state.isCartLoading = false;
					state.cartError = action.payload;
				}
			)

			// load сart
			.addCase(loadCart.pending.type, (state) => {
				state.isCartLoading = true;
			})
			.addCase(
					loadCart.fulfilled.type,
					(state, action: PayloadAction<ICartProduct[]>) => {
						state.isCartLoading = false;
						state.cart = action.payload;
						localStorage.setItem("cart", JSON.stringify(state.cart));
						state.cartError = null;
					}
			)
			.addCase(
					loadCart.rejected.type,
					(state, action: PayloadAction<string>) => {
						state.isCartLoading = false;
						state.cartError = action.payload;
					}
			)

			// get user profile
			.addCase(getUserProfile.pending, (state) => {
				state.isUserLoading = true;
			})
			.addCase(getUserProfile.fulfilled, (state, action: PayloadAction<IUserProfile>) => {
				state.isUserLoading = false;
				state.userProfile = action.payload;
			})
			.addCase(getUserProfile.rejected, (state, action) => {
				state.isUserLoading = false;
				state.userError = action.payload as string;
			})

			// update avatar
			.addCase(updateAvatar.fulfilled, (state, action) => {
				if (state.curUser) {
					state.curUser.avatar = action.payload.avatar || null;
				}
				if (state.userProfile) {
					state.userProfile.personalInfo.avatar = action.payload.avatar || null;
				}
			})

			// update phone
			.addCase(updatePhone.fulfilled, (state, action) => {
				if (state.curUser) {
					state.curUser.phone = action.payload.phone;
				}
				if (state.userProfile) {
					state.userProfile.personalInfo.phone = action.payload.phone;
				}
			})

			.addCase(updateProfile.pending, (state) => {
				state.isUserLoading = true;
			})
			.addCase(updateProfile.fulfilled, (state, action) => {
				state.isUserLoading = false;
				if (state.userProfile) {
					state.userProfile.personalInfo = action.payload;
				}
				if (state.curUser) {
					state.curUser.name = action.payload.name;
					state.curUser.avatar = action.payload.avatar;
					state.curUser.email = action.payload.email;
					state.curUser.phone = action.payload.phone;
				}
				state.userError = null;
			})
			.addCase(updateProfile.rejected, (state, action) => {
				state.isUserLoading = false;
				state.userError = action.payload as string;
			})

			.addCase(addItemToCart.pending, (state) => {
				state.isCartLoading = true;
				state.cartError = null;
			})
			.addCase(addItemToCart.fulfilled, (state, action) => {
				state.isCartLoading = false;
				const existingItem = state.cart.find(item => item.id === action.payload.id);
				
				if (existingItem) {
					state.cart = state.cart.map(item =>
						item.id === action.payload.id ? action.payload : item
					);
				} else {
					state.cart.push(action.payload);
				}
			})
			.addCase(addItemToCart.rejected, (state, action) => {
				state.isCartLoading = false;
				state.cartError = action.payload as string;
			});
	},
});

export const {
	removeItemFromCart,
	removeItemsFromCart,
	toggleForm,
	toggleFormType,
	logoutUser,
	clearCart,
	setCart,
} = userSlice.actions;

export default userSlice.reducer;
