import { FC, useEffect, useState, useMemo, useCallback, useRef } from "react";
import classes from "./Cart.module.scss";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import MyButton from "../../UI/button/MyButton";
import CartItem from "./CartItem";
import {
	ICartProduct,
	setCart,
	removeItemsFromCart,
} from "../../store/reducers/user/userSlice";
import { useCheckoutMutation } from "../../services/ProductServices";
import { toast } from "react-toastify";
import { currencyRates } from "../../utils/constants";
import {
	selectAllItems,
	clearSelectedItems,
	setSelectedItems,
} from "../../store/reducers/delivery/deliverySlice";
import DeliveryModal from "../delivery/DeliveryModal";
import { useCalculateDeliveryTimeMutation } from "../../services/DeliveryServices";
import { useSpring, animated } from "@react-spring/web";
import { convertPrice } from "../../utils/priceConverter";
import { Link } from "react-router-dom";
import { isEqual } from "lodash";
import {
	loadCart,
	saveCart,
} from "../../store/reducers/user/userActionCreator";
import { DeliveryTimeRequestData } from "../../types/types";
import { useGetUserOrdersQuery } from "../../services/OrderService";

const Cart: FC = () => {
	const dispatch = useAppDispatch();
	const { cart, curUser } = useAppSelector((state) => state.userReducer);
	const { location, selectedItems } = useAppSelector(
		(state) => state.deliveryReducer
	);
	const [checkout, { isLoading: isCheckingOut }] = useCheckoutMutation();
	const { currency, rates, loading } = useAppSelector(
		(state) => state.currencyReducer
	);
	const symbol = currencyRates[currency as keyof typeof currencyRates].symbol;
	const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
	const [deliverySpeed, setDeliverySpeed] = useState<"regular" | "fast">(
		(localStorage.getItem("deliverySpeed") as "regular" | "fast") || "regular"
	);

	const [prevCart, setPrevCart] = useState<ICartProduct[]>(cart);
	const [isMergingCarts, setIsMergingCarts] = useState(false);
	const [hasMergedCarts, setHasMergedCarts] = useState(false);

	const { refetch: refetchOrders } = useGetUserOrdersQuery();

	const handleSelectAll = () => {
		if (selectedItems.length === cart.length) {
			dispatch(clearSelectedItems());
		} else {
			dispatch(selectAllItems(cart.map((item) => item.id)));
		}
	};

	useEffect(() => {
		const updatedSelectedItems = selectedItems.filter((id) =>
			cart.some((item) => item.id === id)
		);

		if (updatedSelectedItems.length !== selectedItems.length) {
			dispatch(setSelectedItems(updatedSelectedItems));
		}
	}, [cart, selectedItems, dispatch]);

	const prevProductIdsRef = useRef<number[]>([]);

	const productIds = useMemo(() => {
		const ids = cart.map((item) => item.id);
		if (!isEqual(ids, prevProductIdsRef.current)) {
			prevProductIdsRef.current = ids;
		}
		return prevProductIdsRef.current;
	}, [cart]);

	const [calculateDeliveryTimeTrigger, { data, isLoading }] =
		useCalculateDeliveryTimeMutation();

	const calculateDeliveryTime = useCallback(
		(requestData: DeliveryTimeRequestData) => {
			calculateDeliveryTimeTrigger(requestData);
		},
		[calculateDeliveryTimeTrigger]
	);

	useEffect(() => {
		const requestData: DeliveryTimeRequestData = {
			productIds,
			deliveryMode: location?.deliveryMode || "pickup",
		};

		if (
			location?.deliveryMode === "courier" &&
			location.coordinates?.lat >= -90 &&
			location.coordinates?.lat <= 90 &&
			location.coordinates?.lng >= -180 &&
			location.coordinates?.lng <= 180
		) {
			requestData.deliverySpeed = deliverySpeed;
			requestData.coordinates = {
				lat: location.coordinates?.lat,
				lng: location.coordinates?.lng,
			};
		} else if (location?.deliveryMode === "pickup") {
			requestData.locationId = location.id;
		} else {
			return;
		}

		if (productIds.length > 0) {
			calculateDeliveryTime(requestData);
		}
	}, [productIds, location, deliverySpeed, calculateDeliveryTime]);

	const deliveryData = data;

	const selectedCartItems = cart.filter((item) =>
		selectedItems.includes(item.id)
	);

	const cartTotal = selectedCartItems.reduce((total, item) => {
		const itemPrice = item.discount
			? item.price - (item.price * item.discount.percentage) / 100
			: item.price;

		const convertedItemPrice = convertPrice(itemPrice, currency, rates);

		return total + item.quantity * convertedItemPrice;
	}, 0);

	const rawDeliveryCost =
		location?.deliveryMode === "courier"
			? deliverySpeed === "fast"
				? 600
				: 320
			: 0;

	const convertedDeliveryCost = convertPrice(rawDeliveryCost, currency, rates);

	const totalPrice = cartTotal + convertedDeliveryCost;

	const [cartTotalSpring, cartTotalSpringApi] = useSpring(() => ({
		number: cartTotal,
		config: {
			tension: 170,
			friction: 26,
		},
	}));

	const [totalSpring, totalSpringApi] = useSpring(() => ({
		number: totalPrice,
		config: {
			tension: 170,
			friction: 26,
		},
	}));

	const [deliveryCostSpring, deliveryCostSpringApi] = useSpring(() => ({
		number: 0,
		config: {
			tension: 170,
			friction: 26,
		},
	}));

	useEffect(() => {
		cartTotalSpringApi.start({ number: cartTotal });
	}, [cartTotal, cartTotalSpringApi]);

	useEffect(() => {
		totalSpringApi.start({ number: totalPrice });
	}, [totalPrice, totalSpringApi]);

	useEffect(() => {
		deliveryCostSpringApi.start({ number: convertedDeliveryCost });
	}, [convertedDeliveryCost, deliveryCostSpringApi]);

	const proceedCheckout = async () => {
		if (
			!location ||
			selectedCartItems.length === 0 ||
			(location.deliveryMode === "courier" && !location.address)
		) {
			toast.error("Пожалуйста, выберите адрес доставки и товары для заказа.");
			return;
		}

		try {
			const totalQuantity = selectedCartItems.reduce(
				(acc, item) => acc + item.quantity,
				0
			);

			await checkout({
				cart: selectedCartItems,
				totalQuantity,
				location: {
					...location,
					deliverySpeed: deliverySpeed,
				},
				currency,
			}).unwrap();
			toast.success("Заказ успешно оформлен!");

			await refetchOrders();
			dispatch(removeItemsFromCart(selectedCartItems.map((item) => item.id)));
			dispatch(clearSelectedItems());
		} catch (error) {
			if (typeof error === "object" && error !== null && "data" in error) {
				const errorMessage = (error as { data: string }).data;
				toast.error(errorMessage);
			} else if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Произошла неизвестная ошибка");
			}
		}
	};

	useEffect(() => {
		localStorage.setItem("deliverySpeed", deliverySpeed);
	}, [deliverySpeed]);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token && curUser && !hasMergedCarts) {
			setIsMergingCarts(true);
			dispatch(loadCart())
				.then((response) => {
					if (response.payload) {
						const serverCart = response.payload as ICartProduct[];
						const mergedCart = mergeCarts(serverCart, cart);
						dispatch(setCart(mergedCart));
						setPrevCart(mergedCart);
						setHasMergedCarts(true);
					}
				})
				.finally(() => {
					setIsMergingCarts(false);
				});
		}
	}, [curUser, dispatch, hasMergedCarts, cart]);

	useEffect(() => {
		if (curUser && !isMergingCarts && !isEqual(cart, prevCart)) {
			dispatch(saveCart(cart));
			setPrevCart(cart);
		}
	}, [cart, prevCart, dispatch, curUser, isMergingCarts]);

	const mergeCarts = (
		serverCart: ICartProduct[],
		localCart: ICartProduct[]
	): ICartProduct[] => {
		const cartMap = new Map<number, ICartProduct>();

		serverCart.forEach((item) => {
			cartMap.set(item.id, { ...item });
		});

		localCart.forEach((item) => {
			if (!cartMap.has(item.id)) {
				cartMap.set(item.id, { ...item });
			}
		});

		return Array.from(cartMap.values());
	};

	return (
		<section className={classes.cart}>
			<div className="container">
				{cart.length === 0 ? (
					<div style={{ paddingBlock: "60px" }}>
						<h2 className="h2-title">Ваша корзина пуста</h2>
						<p className={classes.title}>Но это легко исправить 🙂</p>
						<Link to="/" className={`main-btn ${classes.goHomeButton}`}>
							Вернуться на главную
						</Link>
					</div>
				) : (
					<>
						<h2 className={`h2-title ${classes.mainTitle}`}>Корзина</h2>

						<div className={classes.cartContent}>
							<div className={classes.cartTop}>
								<div className={classes.items}>
									<div className={classes.checkbox}>
										<label>
											<input
												type="checkbox"
												checked={selectedItems.length === cart.length}
												onChange={handleSelectAll}
											/>
											<span>Выбрать все</span>
										</label>
									</div>
									{cart.map((item) => {
										const deliveryInfo = deliveryData?.find(
											(dataItem) => dataItem.productId === item.id
										);
										return (
											<CartItem
												key={item.id}
												item={item}
												deliveryDays={deliveryInfo?.deliveryDays}
												isLoading={isLoading}
											/>
										);
									})}
								</div>

								<div className={classes.summary}>
									<div className={classes.subtotal}>
										<span>Сумма товаров:</span>
										{loading ? (
											<span>Загрузка...</span>
										) : (
											<animated.span>
												{cartTotalSpring.number.to(
													(n) => `${n.toFixed(0)} ${symbol}`
												)}
											</animated.span>
										)}
									</div>
									<div className={classes.deliveryCost}>
										<span>Стоимость доставки:</span>
										{loading ? (
											<span>Загрузка...</span>
										) : (
											<animated.span>
												{deliveryCostSpring.number.to(
													(n) => `${n.toFixed(0)} ${symbol}`
												)}
											</animated.span>
										)}
									</div>
									<div className={classes.total}>
										<span>Итого:</span>
										{loading ? (
											<span>Загрузка...</span>
										) : (
											<animated.span>
												{totalSpring.number.to(
													(n) => `${n.toFixed(0)} ${symbol}`
												)}
											</animated.span>
										)}
									</div>
									<MyButton
										className={classes.checkoutBtn}
										type="button"
										onClick={proceedCheckout}
										disabled={
											isCheckingOut ||
											selectedCartItems.length === 0 ||
											!location ||
											!location.deliveryMode ||
											(location.deliveryMode === "courier" &&
												!location.address) ||
											loading
										}
									>
										{isCheckingOut
											? "Обработка..."
											: loading
											? "Загрузка..."
											: "Оформить заказ"}
									</MyButton>
									<DeliveryModal
										isOpen={isDeliveryModalOpen}
										onClose={() => setIsDeliveryModalOpen(false)}
									/>
								</div>
							</div>
							<div className={classes.deliveryButtonContainer}>
								<div className={classes.left}>
									<MyButton onClick={() => setIsDeliveryModalOpen(true)}>
										Выбрать способ доставки
									</MyButton>
									{location?.deliveryMode === "courier" && (
										<div className={classes.deliverySpeedContainer}>
											<label className="radio-btn">
												<input
													type="radio"
													value="regular"
													checked={deliverySpeed === "regular"}
													onChange={() => setDeliverySpeed("regular")}
												/>
												<span>Обычная доставка (+320₽)</span>
											</label>
											<label className="radio-btn">
												<input
													type="radio"
													value="fast"
													checked={deliverySpeed === "fast"}
													onChange={() => setDeliverySpeed("fast")}
												/>
												<span>Быстрая доставка (+600₽)</span>
											</label>
										</div>
									)}
								</div>
								<span className={classes.selectedDelivery}>
									{location
										? `Выбранный способ: ${
												location.deliveryMode === "courier"
													? "Курьером"
													: "Самовывоз"
										  }`
										: "Способ доставки не выбран"}
								</span>
							</div>
						</div>
					</>
				)}
			</div>
		</section>
	);
};
export default Cart;
