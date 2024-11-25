import React, { useEffect, useState } from "react";
import { FC } from "react";
import { Link } from "react-router-dom";
import { DeliveryTimeRequestData, IProduct } from "../../types/types";
import classes from "./ProductCard.module.scss";
import CompactStarRating from "../rating/CompactStarRating";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { convertPrice } from "../../utils/priceConverter";
import { currencyRates } from "../../utils/constants";
import { toast } from "react-toastify";
import { addFavorite } from "../../store/reducers/favorites/favoriteActionCreator";
import { removeFavorite } from "../../store/reducers/favorites/favoriteActionCreator";
import MyButton from "../../UI/button/MyButton";
import { useCalculateDeliveryTimeMutation } from "../../services/DeliveryServices";
import { addItemToCart } from "../../store/reducers/user/userActionCreator";

interface ProductCardProps {
	item: IProduct;
	showAddToCartButton?: boolean;
}

const ProductCard: FC<ProductCardProps> = ({ item, showAddToCartButton }) => {
	const dispatch = useAppDispatch();
	const { currency, rates } = useAppSelector((state) => state.currencyReducer);
	const symbol = currencyRates[currency as keyof typeof currencyRates].symbol;
	const { favorites } = useAppSelector((state) => state.favoritesReducer);
	const { cart, curUser } = useAppSelector((state) => state.userReducer);
	const { location, deliverySpeed } = useAppSelector(
		(state) => state.deliveryReducer
	);

	const [calculateDeliveryTime, { data: deliveryInfos }] =
		useCalculateDeliveryTimeMutation();

	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		if (!location) return;

		const requestData: DeliveryTimeRequestData = {
			productIds: [item.id],
			deliveryMode: location.deliveryMode,
		};

		if (location.deliveryMode === "courier") {
			requestData.deliverySpeed = deliverySpeed;
			requestData.coordinates = {
				lat: location.coordinates?.lat,
				lng: location.coordinates?.lng,
			};
		} else if (location.deliveryMode === "pickup") {
			requestData.locationId = location.id;
		}

		calculateDeliveryTime(requestData);
	}, [item.id, location, deliverySpeed, calculateDeliveryTime]);

	const convertedPrice = convertPrice(item.price, currency, rates);
	const convertedOldPrice = item.discount
		? convertPrice(item.price, currency, rates)
		: null;
	const discountedPrice = item.discount
		? convertPrice(
				item.price - (item.price * item.discount.percentage) / 100,
				currency,
				rates
		  )
		: null;

	const isFavorite = favorites.some((fav) => fav.id === item.id);
	const isInCart = cart.some((cartItem) => cartItem.id === item.id);

	const handleFavoriteClick = async (
		event: React.MouseEvent<HTMLButtonElement>
	) => {
		event.preventDefault();

		if (!curUser) {
			toast.warning("Авторизуйтесь, чтобы добавить товар в избранное");
			return;
		}

		if (isProcessing) return;

		try {
			setIsProcessing(true);
			if (isFavorite) {
				await dispatch(removeFavorite(item.id)).unwrap();
				toast.info("Товар удален из избранного");
			} else {
				await dispatch(addFavorite(item.id)).unwrap();
				toast.success("Товар добавлен в избранное");
			}
		} catch (error) {
			toast.error(
				typeof error === "string" ? error : "Ошибка при обновлении избранного"
			);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleAddToCart = async (
		event: React.MouseEvent<HTMLButtonElement>
	) => {
		event.preventDefault();
		event.stopPropagation();

		try {
			const result = await dispatch(
				addItemToCart({ ...item, quantity: 1 })
			).unwrap();

			if (result) {
				toast.success(
					<>
						Добавлено в корзину: <br /> {item.title}
					</>,
					{
						icon: <img src={item.images[0]} alt={item.title} />,
						onClick: () => {
							window.location.href = "/cart";
						},
						className: "cartToast",
					}
				);
			}
		} catch (error) {
			toast.error(
				typeof error === "string"
					? error
					: "Ошибка при добавлении товара в корзину"
			);
		}
	};

	const deliveryInfo = deliveryInfos?.find(
		(info) => info.productId === item.id
	);

	const formatDeliveryDate = (deliveryDays: number) => {
		const date = new Date();
		date.setDate(date.getDate() + deliveryDays);
		return date.toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "long",
		});
	};

	return (
		<Link
			onClick={(event) => {
				event.stopPropagation();
			}}
			className={classes.product}
			to={`/products/${item.id}`}
		>
			<div
				className={classes.image}
				style={{
					backgroundImage:
						item.images && item.images[0] ? `url(${item.images[0]})` : "",
				}}
			>
				<div className={classes.category}>
					{item.category && item.category.name
						? item.category.name
						: "Без категории"}
				</div>
				{item.discount && item.discount.type === "EVENT_11_11" ? (
					<div className={classes.type}>11.11</div>
				) : item.discount && item.discount.type === "REGULAR" ? (
					<div className={classes.type}>SALE</div>
				) : (
					""
				)}
				<button
					className={classes.favoriteButton}
					onClick={handleFavoriteClick}
					disabled={isProcessing}
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
							<path d="M33,7.64c-1.34-2.75-5.2-5-9.69-3.69A9.87,9.87,0,0,0,18,7.72a9.87,9.87,0,0,0-5.31-3.77C8.19,2.66,4.34,4.89,3,7.64c-1.88,3.85-1.1,8.18,2.32,12.87C8,24.18,11.83,27.9,17.39,32.22a1,1,0,0,0,1.23,0c5.55-4.31,9.39-8,12.07-11.71C34.1,15.82,34.88,11.49,33,7.64Z"></path>
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
								fill="#ffffff"
							/>
						</svg>
					)}
				</button>
			</div>
			<div className={classes.wrapper}>
				<div className={classes.info}>
					<div className={classes.prices}>
						<div className={classes.price}>
							{discountedPrice
								? `${discountedPrice.toFixed(0)} ${symbol}`
								: `${convertedPrice?.toFixed(0)} ${symbol}`}
						</div>
						{item.discount && (
							<>
								<div className={classes.oldPrice}>
									{`${convertedOldPrice?.toFixed(0)} ${symbol}`}
								</div>
								<div className={classes.discount}>
									-{item.discount.percentage}%
								</div>
							</>
						)}
					</div>
					<h3 className={classes.title}>
						{item.title ? item.title : "Без названия"}
					</h3>
					<div className={classes.purchases}>{item.purchases} куплено</div>
				</div>
				<CompactStarRating productId={item.id} />
				{showAddToCartButton && isInCart ? (
					<Link to="/cart" className={`${classes.addToCart} main-btn`}>
						В корзине
					</Link>
				) : (
					showAddToCartButton && (
						<MyButton
							className={classes.addToCart}
							onClick={handleAddToCart}
							disabled={item.quantity === 0}
						>
							{item.quantity === 0 ? (
								<span>Нет в наличии</span>
							) : deliveryInfo ? (
								<span>{formatDeliveryDate(deliveryInfo.deliveryDays)}</span>
							) : !location ? (
								<span className={classes.deliveryLoading}>В корзину</span>
							) : (
								<span className={classes.deliveryLoading}>Загрузка...</span>
							)}
						</MyButton>
					)
				)}
			</div>
		</Link>
	);
};

export default ProductCard;
