import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../utils/constants";
import { IDeliveryPoint, IDeliveryZone } from "../types/types";

export const deliveryApi = createApi({
	reducerPath: "deliveryApi",
	baseQuery: fetchBaseQuery({
		baseUrl: BASE_URL,
		prepareHeaders: (headers) => {
			const token = localStorage.getItem("token");
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			return headers;
		},
	}),
	endpoints: (builder) => ({
		getDeliveryPoints: builder.query<IDeliveryPoint[], void>({
			query: () => "/delivery/points",
		}),

		getDeliveryZones: builder.query<IDeliveryZone[], void>({
			query: () => "/delivery/zones",
		}),

		calculateDeliveryTime: builder.mutation<
			{ productId: number; deliveryDays: number }[],
			{
				productIds: number[];
				locationId?: number;
				coordinates?: {
					lat: number;
					lng: number;
				};
				deliveryMode: string;
				deliverySpeed?: string | null;
			}
		>({
			query: (data) => ({
				url: "/delivery/calculate",
				method: "POST",
				body: data,
			}),
		}),

		findNearestPoint: builder.query<
			IDeliveryPoint,
			{ lat: number; lng: number }
		>({
			query: ({ lat, lng }) => ({
				url: `/delivery/nearest?lat=${lat}&lng=${lng}`,
			}),
		}),

		getZoneByCoordinates: builder.query<IDeliveryZone, { lat: number; lng: number }>({
			query: ({ lat, lng }) => `/delivery/zone?lat=${lat}&lng=${lng}`,
		}),
	}),
});

export const {
	useGetDeliveryPointsQuery,
	useGetDeliveryZonesQuery,
	useCalculateDeliveryTimeMutation,
	useFindNearestPointQuery,
	useGetZoneByCoordinatesQuery,
} = deliveryApi;
