import { FC, useEffect, useState } from "react";
import classes from "./Product.module.scss";
import { DeliveryTimeRequestData, IProduct } from "../../types/types";
import { Link } from "react-router-dom";
import useColorTranslation from "../../hooks/useColorTranslation";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { removeItemFromCart } from "../../store/reducers/user/userSlice";
import MyButton from "../../UI/button/MyButton";
import { toast } from "react-toastify";
import StarRating from "../rating/StarRating";
import ProductImages from "./ProductImages";
import { convertPrice } from "../../utils/priceConverter";
import { currencyRates } from "../../utils/constants";
import { getTotalQuantityInCart } from "../../utils/cartUtils";
import DeliveryTime from "../delivery/DeliveryTime";
import { useCalculateDeliveryTimeMutation } from "../../services/DeliveryServices";
import QuantityInput from "../quantity/QuantityInput";
import {
	addFavorite,
	removeFavorite,
} from "../../store/reducers/favorites/favoriteActionCreator";
import { addItemToCart } from "../../store/reducers/user/userActionCreator";

const Product: FC<IProduct> = (item) => {
	const {
		id,
		title,
		images,
		price,
		description,
		category,
		purchases,
		quantity,
		discount,
	} = item;
	const [curImage, setCurImage] = useState<string>();
	const [isInCart, setIsInCart] = useState(false);
	const [isAddingToCart, setIsAddingToCart] = useState(false);

	const { cart, curUser } = useAppSelector((state) => state.userReducer);
	const { currency, rates } = useAppSelector((state) => state.currencyReducer);
	const { location } = useAppSelector((state) => state.deliveryReducer);
	const symbol = currencyRates[currency as keyof typeof currencyRates].symbol;

	const dispatch = useAppDispatch();

	const colorTranslation = useColorTranslation(title, description);

	const cartItem = cart.find((cartItem) => cartItem.id === item.id);
	const currentQuantityInCart = cartItem ? cartItem.quantity : 0;

	const convertedPrice = convertPrice(price, currency, rates);
	const discountedPrice = discount
		? convertPrice(price - (price * discount.percentage) / 100, currency, rates)
		: convertedPrice;

	useEffect(() => {
		setIsInCart(cart.some((cartItem) => cartItem.id === item.id));
	}, [cart, item.id]);

	useEffect(() => {
		if (!images.length) return;
		setCurImage(images[0]);
	}, [images]);

	const handleAddToCart = async () => {
		try {
			setIsAddingToCart(true);
			
			const totalQuantityInCart = cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
			
			if (totalQuantityInCart >= 200) {
				toast.warning(
					<>
						<div>Лимит товаров</div>
						<div className="toast-details">
							Максимальное количество в корзине: 200 шт.
						</div>
					</>
				);
				return;
			}

			const cartItem = {
				...item,
				quantity: 1,
			};

			const result = await dispatch(addItemToCart(cartItem)).unwrap();
			
			if (result) {
				setIsInCart(true);
				toast.success(
					<>
						Добавлено в корзину: <br /> {title}
					</>,
					{
						icon: <img src={images[0]} alt={title} />,
						onClick: () => {
							window.location.href = "/cart";
						},
						className: "cartToast",
					}
				);
			}
		} catch (error) {
			toast.error(typeof error === 'string' ? error : 'Ошибка при добавлении товара в корзину');
		} finally {
			setIsAddingToCart(false);
		}
	};

	const [calculateDeliveryTime, { data: deliveryInfos }] =
		useCalculateDeliveryTimeMutation();

	const [deliverySpeed] = useState<"regular" | "fast">(
		(localStorage.getItem("deliverySpeed") as "regular" | "fast") || "regular"
	);

	useEffect(() => {
		if (!location?.deliveryMode) return;

		const requestData: DeliveryTimeRequestData = {
			productIds: [id],
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
	}, [id, location, calculateDeliveryTime, deliverySpeed]);

	const deliveryInfo = deliveryInfos?.find((item) => item.productId === id);

	const { favorites, loadingItems } = useAppSelector((state) => state.favoritesReducer);
	const isFavorite = favorites.some((fav) => fav.id === item.id);
	const isItemLoading = loadingItems[item.id];

	const handleFavoriteClick = async () => {
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
		<section className={classes.product}>
			<div className="container">
				<div className={classes.inner}>
					<ProductImages
						images={images}
						curImage={curImage}
						setCurImage={setCurImage}
					/>

					<div className={classes.info}>
						<h2 className="h2-title">{title}</h2>
						<StarRating productId={item.id} onClick={() => {}} />

						{colorTranslation && (
							<div className={classes.color}>
								<span className={classes.name}>Цвет: </span> {colorTranslation}
							</div>
						)}
						{category.name === "Clothes" && (
							<div className={classes.sizes}>
								<span className={classes.name}>Размеры:</span>
								<div className={classes.list}></div>
							</div>
						)}
						<p className={classes.description}>{description}</p>
					</div>

					<div className={classes.buyBlock}>
						<article className={classes.prices}>
							<h3 className={`${classes.price} h2-title`}>
								{discountedPrice?.toFixed(0)} {symbol}
							</h3>
							{discount && (
								<>
									<div className={classes.oldPrice}>
										{convertedPrice?.toFixed(0)} {symbol}
									</div>
									<div className={classes.discount}>
										-{discount.percentage}%
									</div>
								</>
							)}
						</article>

						<div className={classes.actions}>
							{isInCart ? (
								<div className={classes.cartControls}>
									<QuantityInput
										value={currentQuantityInCart}
										onChange={(newQuantity) => {
											if (newQuantity === 0) {
												dispatch(removeItemFromCart(item.id));
												setIsInCart(false);
												toast.info(
													<>
														<div>Товар удален из корзины</div>
														<div className="toast-details">{title}</div>
													</>
												);
												return;
											}

											dispatch(
												addItemToCart({ ...item, quantity: newQuantity })
											);
										}}
										min={1}
										max={Math.min(200, quantity)}
										onIncrease={() => {
											const totalQuantityInCart = getTotalQuantityInCart(cart);
											if (
												currentQuantityInCart >= quantity ||
												totalQuantityInCart >= 200
											) {
												toast.warning(
													<>
														<div>Лимит товаров</div>
														<div className="toast-details">
															{currentQuantityInCart >= quantity
																? `Доступно: ${quantity} шт.`
																: "Максимальное количество в корзине: 200 шт."}
														</div>
													</>
												);
												return;
											}
											dispatch(
												addItemToCart({
													...item,
													quantity: currentQuantityInCart + 1,
												})
											);
										}}
										onDecrease={() => {
											if (currentQuantityInCart <= 1) {
												dispatch(removeItemFromCart(item.id));
												setIsInCart(false);
												toast.info(
													<>
														<div>Товар удален из корзины</div>
														<div className="toast-details">{title}</div>
													</>
												);
											} else {
												dispatch(
													addItemToCart({
														...item,
														quantity: currentQuantityInCart - 1,
													})
												);
											}
										}}
										availableQuantity={quantity}
										productTitle={title}
										onRemove={() => {
											dispatch(removeItemFromCart(item.id));
											setIsInCart(false);
											toast.info(
												<>
													<div>Товар удален из корзины</div>
													<div className="toast-details">{title}</div>
												</>
											);
										}}
										productId={item.id}
									/>
									<Link to="/cart" className="main-btn">
										Перейти в корзину
									</Link>
								</div>
							) : (
								<>
									{quantity === 0 ? (
										<div className={classes.outOfStock}>Нет в наличии</div>
									) : (
										<MyButton
											className={`${classes.add} main-btn`}
											onClick={handleAddToCart}
											disabled={isAddingToCart}
										>
											{isAddingToCart ? "Добавление..." : "Добавить в корзину"}
										</MyButton>
									)}
								</>
							)}
						</div>
						{deliveryInfo?.deliveryDays !== undefined ? (
							<DeliveryTime deliveryDays={deliveryInfo.deliveryDays} />
						) : (
							<div>
								Загрузите адрес доставки для отображения времени доставки
							</div>
						)}
						<div className={classes.bottom}>
							<div className={classes.purchase}>{purchases} куплено</div>
							<button
								className={classes.favoriteButton}
								onClick={handleFavoriteClick}
								disabled={isItemLoading}
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
											fill="#A9A8B0"
										/>
									</svg>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Product;
