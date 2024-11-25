import { ICartProduct } from "../store/reducers/user/userSlice";

export const getTotalQuantityInCart = (cart: ICartProduct[]) => {
	return cart.reduce((sum, item) => sum + item.quantity, 0);
};

