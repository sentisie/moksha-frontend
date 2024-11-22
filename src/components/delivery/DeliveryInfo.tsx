import { FC } from "react";
import { useAppSelector } from "../../hooks/redux";
import classes from "./DeliveryInfo.module.scss";

const DeliveryInfo: FC = () => {
	const { location, selectedItems, deliveryCost } = useAppSelector(
		(state) => state.deliveryReducer
	);

	if (!location || selectedItems.length === 0) return null;

	return (
		<div className={classes.deliveryInfo}>
			<h3>Информация о доставке</h3>
			<div className={classes.location}>
				<span>Адрес доставки:</span>
				<strong>{location.address}</strong>
			</div>
			<div className={classes.mode}>
				<span>Способ доставки:</span>
				<strong>
					{location.deliveryMode === 'pickup' ? 'На пункт выдачи' : 'Курьером'}
				</strong>
			</div>
			{location.deliveryMode === 'courier' && (
				<div className={classes.speed}>
					<span>Скорость доставки:</span>
					<strong>
						{location.deliverySpeed === 'fast' ? 'Быстрая доставка' : 'Обычная доставка'}
					</strong>
				</div>
			)}
			<div className={classes.time}>
				<span>Ожидаемое время доставки:</span>
				<strong>{location.deliveryDays} дней</strong>
			</div>
			{deliveryCost > 0 && (
				<div className={classes.cost}>
					<span>Стоимость доставки:</span>
					<strong>{deliveryCost}₽</strong>
				</div>
			)}
		</div>
	);
};

export default DeliveryInfo;
