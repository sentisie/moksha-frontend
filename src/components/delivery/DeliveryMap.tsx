import { FC, useRef, useState } from "react";
import classes from "./DeliveryMap.module.scss";
import { IDeliveryPoint } from "../../types/types";
import ymaps from "yandex-maps";
import {
	Map,
	Placemark,
	SearchControl,
	ZoomControl,
	GeolocationControl,
} from "@pbe/react-yandex-maps";
import { YMapsApi } from "@pbe/react-yandex-maps/typings/util/typing";
import markerIcon from "/src/assets/icons/logo.svg";
import { toast } from "react-toastify";

interface ExtendedGeoObject extends ymaps.GeoObject {
	getLocalities?(): string[];
	getAdministrativeAreas?(): string[];
	getCountry?(): string;
	getThoroughfare?(): string;
	getAddressLine?(): string;
}

interface DeliveryMapProps {
	deliveryPoints?: IDeliveryPoint[];
	selectedPoint?: number | null;
	onPointSelect: (id: number) => void;
	setCity: (city: string) => void;
	coordinates?: number[] | null;
	setCoordinates: (coords: number[]) => void;
	deliveryMode?: "pickup" | "courier";
}

const DeliveryMap: FC<DeliveryMapProps> = ({
	deliveryPoints = [],
	onPointSelect,
	setCity,
	coordinates = null,
	setCoordinates,
	deliveryMode = "pickup",
}) => {
	const [mapState, setMapState] = useState({
		center: [60.0, 90.0],
		zoom: 3,
		controls: [],
	});

	const ymapsInstance = useRef<YMapsApi | null>(null);

	const onLoad = (ymapsLoaded: YMapsApi) => {
		ymapsInstance.current = ymapsLoaded;
	};

	const handleGeoLocation = () => {
		if ("geolocation" in navigator && ymapsInstance.current) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;

					ymapsInstance.current!
						.geocode([latitude, longitude])
						.then((result: ymaps.IGeocodeResult) => {
							const firstGeoObject = result.geoObjects.get(
								0
							) as ExtendedGeoObject;

							if (firstGeoObject) {
								const country = firstGeoObject.getCountry?.();

								if (country === "Россия") {
									setCoordinates([latitude, longitude]);
									setMapState((prevState) => ({
										...prevState,
										center: [latitude, longitude],
										zoom: 12,
									}));

									if (deliveryMode === "courier") {
										const cityName =
											firstGeoObject.getLocalities?.()[0] ||
											firstGeoObject.getAdministrativeAreas?.()[0] ||
											firstGeoObject.getThoroughfare?.() ||
											firstGeoObject.getAddressLine?.() ||
											"";

										setCity(cityName);
									}
								} else {
									alert("Мы не предоставляем доставку за пределы России.");
								}
							}
						});
				},
				(error) => {
					console.error("Ошибка при получении геолокации:", error);
				}
			);
		} else {
			console.error("Геолокация не поддерживается вашим браузером.");
		}
	};

	const handleMapClick = async (e: ymaps.IEvent) => {
		if (deliveryMode !== "courier") return;

		const coords = e.get("coords");

		if (ymapsInstance.current) {
			try {
				const result = await ymapsInstance.current.geocode(coords);
				const firstGeoObject = result.geoObjects.get(0) as ExtendedGeoObject;

				if (firstGeoObject) {
					const country = firstGeoObject.getCountry?.();

					if (country === "Россия") {
						const cityName =
							firstGeoObject.getLocalities?.()[0] ||
							firstGeoObject.getAdministrativeAreas?.()[0] ||
							firstGeoObject.getThoroughfare?.() ||
							firstGeoObject.getAddressLine?.() ||
							"";

						const tempCoords = coords;
						
						const response = await fetch(
							`/api/delivery/zone?lat=${tempCoords[0]}&lng=${tempCoords[1]}`
						);

						if (response.ok) {
							setCoordinates(tempCoords);
							setCity(cityName);
						} else {
							toast.error("Доставка по выбранному адресу недоступна");
						}
					} else {
						toast.error("Мы не предоставляем доставку за пределы России");
					}
				}
			} catch (error) {
				console.error("Ошибка при геокодировании:", error);
			}
		}
	};

	return (
		<Map
			state={mapState}
			className={classes.mapContainer}
			onLoad={onLoad}
			onClick={handleMapClick}
			options={{
				suppressMapOpenBlock: true,
			}}
			modules={[
				"control.ZoomControl",
				"control.SearchControl",
				"control.GeolocationControl",
				"geolocation",
				"geocode",
			]}
		>
			<SearchControl
				options={{
					position: { right: 10, top: 10 },
					placeholderContent: "Введите адрес",
					maxWidth: 300,
					noPlacemark: true,
					size: "large",
					provider: "yandex#search",
				}}
				onResultSelect={async (e: ymaps.IEvent) => {
					const index = e.get("index");
					const searchControl = e.get("target");
					const result = await searchControl.getResult(index);
					const geometry = result.geometry as ymaps.IPointGeometry;
					
					if (geometry) {
						const coords = geometry.getCoordinates();
						if (coords) {
							try {
								const geoResult = await ymapsInstance.current?.geocode(coords);
								const firstGeoObject = geoResult?.geoObjects.get(0) as ExtendedGeoObject;
								
								if (firstGeoObject) {
									const country = firstGeoObject.getCountry?.();
									if (country === "Россия") {
										const response = await fetch(
											`/api/delivery/zone?lat=${coords[0]}&lng=${coords[1]}`
										);

										if (response.ok) {
											setCoordinates(coords);
											setMapState((prevState) => ({
												...prevState,
												center: coords,
												zoom: 12,
											}));

											const cityName =
												firstGeoObject.getLocalities?.()[0] ||
												firstGeoObject.getAdministrativeAreas?.()[0] ||
												firstGeoObject.getThoroughfare?.() ||
												firstGeoObject.getAddressLine?.() ||
												"";

											setCity(cityName);
										} else {
											toast.error("Доставка по выбранному адресу недоступна");
										}
									} else {
										toast.error("Мы не предоставляем доставку за пределы России");
									}
								}
							} catch (error) {
								console.error("Ошибка при проверке зоны доставки:", error);
							}
						}
					}
				}}
			/>

			<ZoomControl
				options={{
					position: { right: 10, bottom: 40 },
					size: "small",
				}}
			/>

			<GeolocationControl
				options={{
					position: { right: 10, bottom: 106 },
				}}
				onClick={handleGeoLocation}
			/>

			{deliveryMode === "pickup" &&
				deliveryPoints.map((point) => (
					<Placemark
						key={point.id}
						geometry={[point.lat, point.lng]}
						properties={{ balloonContent: point.address }}
						options={{
							iconLayout: "default#image",
							iconImageHref: markerIcon,
							iconImageSize: [30, 42],
							iconImageOffset: [-15, -42],
						}}
						modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
						onClick={() => {
							onPointSelect(point.id);
							setCoordinates([point.lat, point.lng]);
							setCity(point.city);
						}}
					/>
				))}

			{deliveryMode === "courier" && coordinates && (
				<Placemark
					geometry={coordinates}
					options={{
						preset: "islands#violetDotIcon",
					}}
				/>
			)}
		</Map>
	);
};

export default DeliveryMap;
