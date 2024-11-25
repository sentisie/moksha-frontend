import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../utils/constants";
import { IProduct } from "../types/types";

export const searchApi = createApi({
	reducerPath: "searchApi",
	baseQuery: fetchBaseQuery({
		baseUrl: BASE_URL,
	}),
	tagTypes: ["TopSearched"],
	endpoints: (builder) => ({
		getTopSearchedProducts: builder.query<IProduct[], void>({
			query: () => "/products/top-searched",
			providesTags: ["TopSearched"],
		}),

		updateSearchStatistics: builder.mutation<void, number>({
			query: (productId) => ({
				url: "/products/search-statistics",
				method: "POST",
				body: { productId },
			}),
			invalidatesTags: ["TopSearched"],
		}),
	}),
});

export const {
	useGetTopSearchedProductsQuery,
	useUpdateSearchStatisticsMutation,
} = searchApi;
