import React, { FC, useState, useEffect } from "react";
import { useAppDispatch } from "../../hooks/redux";
import { useGetDeliveryPointsQuery, useGetZoneByCoordinatesQuery } from "../../services/DeliveryServices";
import { setLocation } from "../../store/reducers/delivery/deliverySlice";
import { toast } from "react-toastify";
import DeliveryMap from "./DeliveryMap";
import classes from "./DeliveryModal.module.scss";
import { YMaps } from "@pbe/react-yandex-maps";
import Modal from "../modal/Modal";
import MyInput from "../../UI/input/MyInput";
import MyButton from "../../UI/button/MyButton";
import { skipToken } from "@reduxjs/toolkit/query";

interface DeliveryModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const DeliveryModal: FC<DeliveryModalProps> = ({ isOpen, onClose }) => {
	const dispatch = useAppDispatch();
	const { data: deliveryPoints } = useGetDeliveryPointsQuery();
	const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
	const [city, setCity] = useState<string>("");
	const [addressDetails, setAddressDetails] = useState<string>("");
	const [coordinates, setCoordinates] = useState<number[] | null>(null);
	const [deliveryMode, setDeliveryMode] = useState<"pickup" | "courier">(
		"pickup"
	);
	const [zoneId, setZoneId] = useState<number | null>(null);

	const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAddressDetails(e.target.value);
	};

	const handleConfirm = () => {
		if (!coordinates || !city || coordinates.length !== 2) {
			toast.error("Пожалуйста, выберите адрес на карте.");
			return;
		}

		let fullAddress = city;
		let deliveryDays = 3;
		let zoneId = 1;

		if (deliveryMode === "pickup") {
			if (selectedPoint) {
				const point = deliveryPoints?.find((p) => p.id === selectedPoint);
				if (point) {
					fullAddress = `${city}, ${point.address}`;
					deliveryDays = point.delivery_days;
					zoneId = point.zone_id;
				}
			} else {
				toast.error("Пожалуйста, выберите пункт выдачи на карте.");
				return;
			}
		} else {
			if (addressDetails) {
				fullAddress = `${city}, ${addressDetails}`;
				if (!zoneId) {
					toast.error("Зона доставки не определена для выранного адреса.");
					return;
				}
			} else {
				toast.error("Пожалуйста, укажите адрес доставки.");
				return;
			}
		}

		dispatch(
			setLocation({
					location: {
						id: selectedPoint || 0,
						city: city,
						region: "",
						address: fullAddress,
						coordinates: {
							lat: coordinates[0],
							lng: coordinates[1],
						},
						deliveryDays: deliveryDays,
						deliveryMode: deliveryMode,
						deliverySpeed: deliveryMode === "courier" ? "regular" : null,
					},
					zone_id: zoneId || 1,
				})
		);
		onClose();
		toast.success(`Адрес доставки изменён на: ${fullAddress}`);
	};

	const { data: zoneData, error: zoneError } = useGetZoneByCoordinatesQuery(
		coordinates && coordinates.length === 2
			? { lat: coordinates[0], lng: coordinates[1] }
			: skipToken
	);

	useEffect(() => {
		if (zoneData) {
			setZoneId(zoneData.id);
		}
	}, [zoneData]);

	useEffect(() => {
		if (zoneError) {
			setCoordinates(null);
			toast.error("Доставка по выбранному адресу недоступна");
		}
	}, [zoneError, zoneId]);

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<h2 className="h3-title">Выбор адреса доставки</h2>

			<div className={classes.switchContainer}>
				<button
					className={`${classes.switchButton} ${
						deliveryMode === "pickup" ? classes.active : ""
					}`}
					onClick={() => setDeliveryMode("pickup")}
				>
					На пункт выдачи
				</button>
				<button
					className={`${classes.switchButton} ${
						deliveryMode === "courier" ? classes.active : ""
					}`}
					onClick={() => setDeliveryMode("courier")}
				>
					Курьером
				</button>
			</div>

			<YMaps
				query={{
					apikey: apiKey,
					lang: "ru_RU",
					load: "package.full",
				}}
			>
				<DeliveryMap
					deliveryPoints={deliveryPoints || []}
					selectedPoint={selectedPoint}
					onPointSelect={setSelectedPoint}
					setCity={setCity}
					coordinates={coordinates}
					setCoordinates={setCoordinates}
					deliveryMode={deliveryMode}
				/>
			</YMaps>
			<div className={classes.modalBottom}>
				{deliveryMode === "courier" ? (
					<MyInput
						type="text"
						placeholder="Уточните адрес (улица, дом)"
						value={addressDetails}
						onChange={handleInputChange}
					/>
				) : selectedPoint ? (
					<div className={classes.selectedPointAddress}>
						Адрес пункта выдачи:{" "}
						{deliveryPoints?.find((p) => p.id === selectedPoint)?.address}
					</div>
				) : null}
				<MyButton
					onClick={handleConfirm}
					disabled={
						!coordinates ||
						!city ||
						(deliveryMode === "pickup" && !selectedPoint) ||
						(deliveryMode === "courier" && addressDetails.trim() === "")
					}
					className={`${classes.confirmButton} ${classes.modalButton}`}
				>
					Подтвердить
				</MyButton>
			</div>
		</Modal>
	);
};

export default DeliveryModal;
