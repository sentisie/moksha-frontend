import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../utils/constants";
import { IReview } from "../types/types";

export const reviewApi = createApi({
	reducerPath: "reviewApi",
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
	tagTypes: ["Reviews"],
	endpoints: (builder) => ({
		getReviews: builder.query<IReview[], number>({
			query: (productId) => `/products/${productId}/reviews`,
			providesTags: (_, __, productId) => [{ type: "Reviews", id: productId }],
		}),

		addReview: builder.mutation<
			IReview,
			{ productId: number; formData: FormData }
		>({
			query: ({ productId, formData }) => ({
				url: `/products/${productId}/reviews`,
				method: "POST",
				body: formData,
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			}),
			invalidatesTags: (_, __, { productId }) => [
				{ type: "Reviews", id: productId },
			],
		}),
	}),
});

export const { useGetReviewsQuery, useAddReviewMutation } = reviewApi;
