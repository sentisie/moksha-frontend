import { FC, useState } from "react";
import classes from "./OrderTracking.module.scss";
import MyButton from "../../UI/button/MyButton";
import { toast } from "react-toastify";
import { IOrder, OrderStatus } from "../../types/types";
import DeliveryTracking from "../delivery/DeliveryTracking";

interface OrderTrackingProps {
	orders: IOrder[];
	onStatusUpdate: (orderId: number, status: OrderStatus) => void;
}

const OrderTracking: FC<OrderTrackingProps> = ({ orders, onStatusUpdate }) => {
	const [loadingStates, setLoadingStates] = useState<{
		[key: number]: boolean;
	}>({});
	const activeOrders = orders.filter((order) => order.status === "new");

	const handleCancel = async (orderId: number) => {
		try {
			setLoadingStates((prev) => ({ ...prev, [orderId]: true }));
			await onStatusUpdate(orderId, "cancelled");
			toast.success("Заказ успешно отменен");
		} catch (error) {
			toast.error("Ошибка при отмене заказа");
		} finally {
			setLoadingStates((prev) => {
				const newState = { ...prev };
				delete newState[orderId];
				return newState;
			});
		}
	};

	const handleDelivered = async (orderId: number) => {
		try {
			setLoadingStates((prev) => ({ ...prev, [orderId]: true }));
			await onStatusUpdate(orderId, "delivered");
			toast.success("Заказ отмечен как полученный");
		} catch (error) {
			toast.error("Ошибка при обновлении статуса заказа");
		} finally {
			setLoadingStates((prev) => {
				const newState = { ...prev };
				delete newState[orderId];
				return newState;
			});
		}
	};

	return (
		<div className={classes.orderTracking}>
			{activeOrders.length === 0 ? (
				<p className={classes.emptyMessage}>У вас нет активных доставок</p>
			) : (
				<div className={classes.ordersList}>
					{activeOrders.map((order) => (
						<div key={order.id} className={classes.orderCard}>
							<div className={classes.orderHeader}>
								<span>Заказ №{order.id}</span>
								<span className={classes.date}>
									{new Date(order.date).toLocaleDateString("ru-RU", {
										timeZone: "UTC",
									})}
								</span>
							</div>
							<div className={classes.products}>
								{order.products.map((product) => (
									<div key={product.id} className={classes.product}>
										<div className={classes.productImage}>
											<img src={product.image} alt={product.title} />
										</div>
										<div className={classes.productInfo}>
											<h3>{product.title}</h3>
											<p>Количество: {product.quantity}</p>
											<p className={classes.price}>
												{Math.round(product.price)} {order.currency}
											</p>
											<div className={classes.deliveryInfo}>
												<span>Ожидаемая дата доставки: </span>
												<strong>
													{new Date(
														product.expected_delivery_date + "Z"
													).toLocaleDateString("ru-RU", { timeZone: "UTC" })}
												</strong>
											</div>
										</div>
									</div>
								))}
							</div>
							<div className={classes.orderFooter}>
								<div className={classes.deliverySpeed}>
									<span>Скорость доставки: </span>
									<strong>
										{order.delivery_speed === "fast"
											? "Быстрая доставка"
											: "Обычная доставка"}
									</strong>
								</div>
								<div className={classes.actions}>
									<MyButton
										onClick={() => handleDelivered(order.id)}
										className={classes.deliveredButton}
										disabled={!!loadingStates[order.id]}
									>
										{loadingStates[order.id] ? "Обработка..." : "Заказ получен"}
									</MyButton>
									<MyButton
										onClick={() => handleCancel(order.id)}
										className={classes.cancelButton}
										disabled={!!loadingStates[order.id]}
									>
										{loadingStates[order.id] ? "Отмена..." : "Отменить заказ"}
									</MyButton>
								</div>
							</div>
							{order.tracking_number && (
								<DeliveryTracking
									trackingNumber={order.tracking_number}
									courierCode={order.courier_code}
								/>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default OrderTracking;
