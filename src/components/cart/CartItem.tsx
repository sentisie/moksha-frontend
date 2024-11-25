import { FC, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
	removeItemFromCart,
} from "../../store/reducers/user/userSlice";
import { useGetProductQuery } from "../../services/ProductServices";
import classes from "./Cart.module.scss";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ICartProduct } from "../../store/reducers/user/userSlice";
import { convertPrice } from "../../utils/priceConverter";
import { currencyRates } from "../../utils/constants";
import QuantityInput from "../quantity/QuantityInput";
import { toggleItemSelection } from "../../store/reducers/delivery/deliverySlice";
import { useSpring, animated } from "@react-spring/web";
import { removeItemSelection } from "../../store/reducers/delivery/deliverySlice";
import {
	addFavorite,
	removeFavorite,
} from "../../store/reducers/favorites/favoriteActionCreator";
import { addItemToCart } from "../../store/reducers/user/userActionCreator";

interface CartItemProps {
	item: ICartProduct;
	deliveryDays?: number;
	isLoading?: boolean;
}

const CartItem: FC<CartItemProps> = ({ item, deliveryDays, isLoading }) => {
	const dispatch = useAppDispatch();
	const { data: product } = useGetProductQuery(String(item.id));
	const { currency, rates, loading } = useAppSelector(
		(state) => state.currencyReducer
	);
	const symbol = currencyRates[currency as keyof typeof currencyRates].symbol;
	const selectedItems = useAppSelector(
		(state) => state.deliveryReducer.selectedItems
	);
	const cart = useAppSelector((state) => state.userReducer.cart);
	const isSelected = selectedItems.includes(item.id);
	const { favorites } = useAppSelector((state) => state.favoritesReducer);
	const { curUser } = useAppSelector((state) => state.userReducer);
	const isFavorite = favorites.some((fav) => fav.id === item.id);

	const [totalPriceSpring, totalPriceSpringApi] = useSpring(() => ({
		number: 0,
		config: {
			tension: 170,
			friction: 26,
		},
	}));

	const [originalTotalPriceSpring, originalTotalPriceSpringApi] = useSpring(
		() => ({
			number: 0,
			config: {
				tension: 170,
				friction: 26,
			},
		})
	);

	useEffect(() => {
		const originalItemPrice = product?.price || 0;
		const itemPrice = product?.discount
			? product.price - (product.price * product.discount.percentage) / 100
			: originalItemPrice;
		const convertedPrice = convertPrice(itemPrice, currency, rates);
		const convertedOriginalPrice = convertPrice(
			originalItemPrice,
			currency,
			rates
		);
		const totalPrice = item.quantity * convertedPrice;
		const originalTotalPrice = item.quantity * convertedOriginalPrice;

		totalPriceSpringApi.start({ number: totalPrice });
		originalTotalPriceSpringApi.start({ number: originalTotalPrice });
	}, [
		item.quantity,
		product,
		currency,
		rates,
		totalPriceSpringApi,
		originalTotalPriceSpringApi,
	]);

	const changeQuantity = async (newQuantity: number) => {
		try {
			if (newQuantity <= 0) {
				dispatch(removeItemFromCart(item.id));
				return;
			}
			
			const totalQuantityInCart = cart.reduce((sum, cartItem) => {
				if (cartItem.id === item.id) {
					return sum;
				}
				return sum + cartItem.quantity;
			}, 0);
			
			if (totalQuantityInCart + newQuantity > 200) {
				toast.warning('Превышен лимит товаров в корзине (максимум 200)');
				return;
			}
			
			await dispatch(addItemToCart({ ...item, quantity: newQuantity })).unwrap();
		} catch (error) {
			toast.error('Ошибка при изменении количества товара');
		}
	};

	const removeItem = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
		dispatch(removeItemFromCart(item.id));
		dispatch(removeItemSelection(item.id));
		toast.info(
			<>
				<div>Товар удален из корзины</div>
				<div className="toast-details">{item.title}</div>
			</>
		);
	};

	const getDeliveryDate = (days: number) => {
		const date = new Date();
		date.setDate(date.getDate() + days);
		return date.toLocaleDateString();
	};

	const handleFavoriteClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		if (!curUser) {
			toast.warning("Авторизуйтесь, чтобы добавить товар в избранное");
			return;
		}
		
		try {
			if (isFavorite) {
				await dispatch(removeFavorite(item.id)).unwrap();
				toast.info("Товар удален из избранного");
			} else {
				await dispatch(addFavorite(item.id)).unwrap();
				toast.success("Товар добавлен в избранное");
			}
		} catch (error) {
			toast.error(typeof error === 'string' ? error : 'Ошибка при обновлении избранного');
		}
	};

	return (
		<Link to={`/products/${item.id}`} className={classes.item}>
			<div className={classes.image}>
				<div className={classes.checkbox}>
					<label>
						<input
							type="checkbox"
							checked={isSelected}
							onChange={() => dispatch(toggleItemSelection(item.id))}
							onClick={(event) => event.stopPropagation()}
						/>
					</label>
				</div>
				<img src={item.images[0]} alt={item.title} />
			</div>
			<div className={classes.info}>
				<h3 className={classes.name}>{item.title}</h3>
				{isLoading ? (
					<div className={classes.deliveryInfo}>Идёт загрузка...</div>
				) : deliveryDays !== undefined ? (
					<div className={classes.deliveryInfo}>
						<span>Время доставки:</span>
						<strong>{deliveryDays} дней</strong>
						<div className={classes.deliveryDate}>
							Ожидаемая дата доставки: {getDeliveryDate(deliveryDays)}
						</div>
					</div>
				) : (
					<div className={classes.deliveryInfo}>
						Загрузите адрес доставки для отображения времени доставки
					</div>
				)}
				<div className={classes.actions}>
					<button
						type="button"
						className={classes.favorite}
						onClick={handleFavoriteClick}
					>
						{isFavorite ? (
							<svg
								fill="red"
								width="20px"
								height="20px"
								viewBox="0 0 36 36"
								version="1.1"
								preserveAspectRatio="xMidYMid meet"
								xmlns="http://www.w3.org/2000/svg"
							>
								<title>heart-solid</title>
								<path
									d="M33,7.64c-1.34-2.75-5.2-5-9.69-3.69A9.87,9.87,0,0,0,18,7.72a9.87,9.87,0,0,0-5.31-3.77C8.19,2.66,4.34,4.89,3,7.64c-1.88,3.85-1.1,8.18,2.32,12.87C8,24.18,11.83,27.9,17.39,32.22a1,1,0,0,0,1.23,0c5.55-4.31,9.39-8,12.07-11.71C34.1,15.82,34.88,11.49,33,7.64Z"
								></path>
								<rect x="0" y="0" width="36" height="36" fill-opacity="0" />
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								fill="none"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M13.378 3.084c-1.21.365-2.195 1.24-2.569 1.921a.927.927 0 0 1-1.614.015c-.379-.66-1.354-1.536-2.553-1.908-1.135-.352-2.435-.249-3.645.953-1.341 1.377-1.141 3.62.185 5.616l.004.006.004.006c.521.816 1.806 2.21 3.22 3.631a130.695 130.695 0 0 0 3.586 3.455c.768-.722 2.203-2.088 3.59-3.487 1.414-1.428 2.706-2.821 3.231-3.611 1.318-1.985 1.538-4.158.175-5.627-1.17-1.194-2.468-1.315-3.614-.97Zm-.48-1.596c1.657-.499 3.628-.296 5.293 1.408l.007.007.006.007c2.135 2.29 1.518 5.41.001 7.693-.631.95-2.047 2.46-3.435 3.862a151.175 151.175 0 0 1-3.641 3.536c-.635.597-1.62.6-2.258.008a132.494 132.494 0 0 1-3.644-3.51c-1.385-1.393-2.801-2.909-3.437-3.902-1.507-2.273-2.14-5.492.018-7.701l.009-.008C3.52 1.192 5.488 1.008 7.136 1.52a6.705 6.705 0 0 1 2.853 1.801 6.609 6.609 0 0 1 2.909-1.833Z"
									fill="#A9A8B0"
								/>
							</svg>
						)}
					</button>
					<button type="button" className={classes.remove} onClick={removeItem}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							fill="none"
						>
							<path
								fill="#A9A8B0"
								fillRule="evenodd"
								clipRule="evenodd"
								d="M8.806.833h2.387c.21 0 .415 0 .588.014.19.016.415.053.642.168.313.16.568.415.728.728.115.226.152.451.168.642.014.173.014.378.014.588v.36H17.499A.833.833 0 1 1 17.5 5h-.883l-.553 8.835c-.04.632-.072 1.155-.133 1.58-.063.444-.164.849-.378 1.227a3.334 3.334 0 0 1-1.444 1.356c-.39.19-.8.266-1.247.301-.429.034-.953.034-1.586.034H8.724c-.633 0-1.157 0-1.586-.034-.446-.035-.857-.111-1.247-.301a3.334 3.334 0 0 1-1.444-1.357c-.214-.377-.315-.782-.379-1.226-.06-.425-.093-.948-.133-1.58L3.383 5H2.5a.833.833 0 1 1 0-1.667h4.167V2.973c0-.21 0-.415.014-.588.016-.19.052-.416.168-.642.16-.313.414-.568.728-.728.226-.115.451-.152.641-.168a7.65 7.65 0 0 1 .59-.014Zm-.473 2.5h3.333V3a6.781 6.781 0 0 0-.01-.49l-.01-.001a6.823 6.823 0 0 0-.48-.01H8.833a6.821 6.821 0 0 0-.49.01l-.002.011a6.821 6.821 0 0 0-.008.48v.333ZM5.053 5l.544 8.697c.042.674.07 1.13.121 1.483.05.342.11.518.18.64.166.295.418.531.721.679.127.062.306.111.651.139.355.028.812.029 1.487.029h2.485c.674 0 1.132-.001 1.487-.03.344-.027.523-.076.65-.138.304-.148.556-.384.722-.678.07-.123.13-.299.18-.641.05-.352.079-.809.121-1.482L14.946 5H5.053Z"
							/>
						</svg>
					</button>
				</div>
			</div>

			<div className={classes.end}>
				<QuantityInput
					value={item.quantity}
					onChange={(newQuantity) => changeQuantity(newQuantity)}
					min={1}
					max={Math.min(200, product?.quantity || 0)}
					isLoading={!product}
					onIncrease={() => changeQuantity(item.quantity + 1)}
					onDecrease={() => changeQuantity(item.quantity - 1)}
					onRemove={() => {
						dispatch(removeItemFromCart(item.id));
						dispatch(removeItemSelection(item.id));
						toast.info(
							<>
								<div>Товар удален из корзины</div>
								<div className="toast-details">{item.title}</div>
							</>
						);
					}}
					availableQuantity={product?.quantity}
					productTitle={item.title}
					productId={item.id}
					disableMinusAtMin={true}
				/>
				<div className={classes.total}>
					{loading ? (
						<span className={classes.loading}>Загрузка...</span>
					) : (
						<>
							<animated.span className={classes.totalPrice}>
								{totalPriceSpring.number.to((n) => `${n.toFixed(0)} ${symbol}`)}
							</animated.span>
							{product?.discount && (
								<animated.span className={classes.originalTotalPrice}>
									{originalTotalPriceSpring.number.to(
										(n) => `${n.toFixed(0)} ${symbol}`
									)}
								</animated.span>
							)}
						</>
					)}
				</div>
			</div>
		</Link>
	);
};

export default CartItem;
