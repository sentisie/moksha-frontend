import React from "react";
import classes from "./DeliveryTracking.module.scss";

interface DeliveryTrackingProps {
	trackingNumber: string;
	courierCode?: string;
}

const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({
	trackingNumber,
}) => {
	const trackingUrl = `https://sentisieexe8d.trackingmore.org/${trackingNumber}?lang=ru`;

	return (
		<div className={classes.trackingContainer}>
			<h3 className={classes.title}>Отслеживание посылки</h3>
			<p>
				Номер отслеживания: <strong>{trackingNumber}</strong>
			</p>
			<a
				href={trackingUrl}
				target="_blank"
				rel="noopener noreferrer"
				className={`main-btn ${classes.trackButton}`}
			>
				Отследить посылку
			</a>
		</div>
	);
};

export default DeliveryTracking;
