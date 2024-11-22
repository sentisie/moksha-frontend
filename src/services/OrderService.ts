import { createApi } from "@reduxjs/toolkit/query/react";
import { IOrder, OrderStatus } from "../types/types";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const orderApi = createApi({
	reducerPath: "orderApi",
	baseQuery: baseQueryWithReauth,
	tagTypes: ["Orders"],
	endpoints: (build) => ({
		getUserOrders: build.query<IOrder[], void>({
			query: () => ({
				url: "/orders/user-orders",
			}),
			providesTags: ["Orders"],
		}),
		updateOrderStatus: build.mutation<
			IOrder,
			{ orderId: number; status: OrderStatus }
		>({
			query: ({ orderId, status }) => ({
				url: `/orders/${orderId}/status`,
				method: "PUT",
				body: { status },
			}),
			invalidatesTags: ["Orders"],
		}),
	}),
});

export const { useGetUserOrdersQuery, useUpdateOrderStatusMutation } = orderApi;
