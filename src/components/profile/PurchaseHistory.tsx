import { FC } from "react";
import classes from "./PurchaseHistory.module.scss";
import { IPurchaseHistory } from "../../types/types";
import { currencyRates } from "../../utils/constants";

interface PurchaseHistoryProps {
	purchases: IPurchaseHistory[];
}

const PurchaseHistory: FC<PurchaseHistoryProps> = ({ purchases }) => {
	const getStatusText = (status: string) => {
		switch (status) {
			case "new":
				return "В доставке";
			case "cancelled":
				return "Отменен";
			case "delivered":
				return "Получен";
			default:
				return status;
		}
	};

	const getStatusClass = (status: string) => {
		switch (status) {
			case "new":
				return classes.statusNew;
			case "cancelled":
				return classes.statusCancelled;
			case "delivered":
				return classes.statusDelivered;
			default:
				return "";
		}
	};

	return (
		<div className={classes.purchaseHistory}>
			<h3>История покупок</h3>
			{purchases.length === 0 ? (
				<p className={classes.emptyMessage}>У вас пока нет покупок</p>
			) : (
				<div className={classes.ordersList}>
					{purchases.map((order) => (
						<div
							key={`${order.order_id}-${order.date}`}
							className={classes.orderCard}
						>
							<div className={classes.orderHeader}>
								<span>Заказ №{order.order_number}</span>
								<span>{new Date(order.date).toLocaleDateString()}</span>
								<span
									className={`${classes.status} ${getStatusClass(
										order.status
									)}`}
								>
									{getStatusText(order.status)}
								</span>
							</div>
							<div className={classes.products}>
								{order.products.map((product) => (
									<div
										key={`${order.order_id}-${product.id}`}
										className={classes.product}
									>
										<img src={product.image} alt={product.title} />
										<div className={classes.productInfo}>
											<h3>{product.title}</h3>
											<p>Количество: {product.quantity}</p>
											<p>
												Цена: {Math.round(product.price)}{" "}
												{
													currencyRates[
														order.currency as keyof typeof currencyRates
													].symbol
												}
											</p>
										</div>
									</div>
								))}
							</div>
							<div className={classes.orderFooter}>
								<span className={classes.total}>
									Итого: {Math.round(order.total)}{" "}
									{
										currencyRates[order.currency as keyof typeof currencyRates]
											.symbol
									}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default PurchaseHistory;
