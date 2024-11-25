import { FC } from "react";
import classes from "./DeliveryTime.module.scss";
import { formatDate } from "../../utils/formDate";

interface DeliveryTimeProps {
  deliveryDays: number;
}

const DeliveryTime: FC<DeliveryTimeProps> = ({ deliveryDays }) => {
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + deliveryDays);
    return formatDate(date.toISOString());
  };

  return (
    <div className={classes.deliveryTime}>
      <div className={classes.estimatedTime}>
        <span>Примерное время доставки:</span>
        <strong>
          {deliveryDays} {deliveryDays === 1 ? "день" : "дней"}
        </strong>
      </div>
      <div className={classes.deliveryDate}>
        <span>Ожидаемая дата доставки:</span>
        <strong>{getDeliveryDate()}</strong>
      </div>
    </div>
  );
};

export default DeliveryTime;