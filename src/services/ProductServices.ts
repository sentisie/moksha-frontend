import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CheckoutRequest, IProduct } from "../types/types";
import { BASE_URL } from "../utils/constants";

export const productApi = createApi({
	reducerPath: "productAPI",
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
	tagTypes: [
		"Product",
		"Products",
		"TopProducts",
		"PriceProducts",
		"TopRated",
		"RegularDiscount",
		"Event11",
	],
	endpoints: (build) => ({
		getProduct: build.query<IProduct, string>({
			query: (id) => `products/${id}`,
			providesTags: (_result, _error, id) => [{ type: "Product", id }],
		}),

		getProducts: build.query<IProduct[], void>({
			query: () => "/products",
			providesTags: (result) =>
				result
					? [
							...result.map(({ id }) => ({ type: "Products", id } as const)),
							{ type: "Products" },
					]
					: [{ type: "Products" }],
		}),

		getTopProducts: build.query<IProduct[], void>({
			query: () => ({
				url: "/products",
				params: {
					limit: 18,
					sort: "purchases",
				},
			}),
			providesTags: ["TopProducts"],
		}),

		getPriceProducts: build.query<IProduct[], number>({
			query: (price) => ({
				url: "/products",
				params: {
					limit: 18,
					price_max: price,
				},
			}),
			providesTags: ["PriceProducts"],
		}),

		getTopRatedProducts: build.query<IProduct[], void>({
			query: () => ({
				url: "/products",
				params: {
					limit: 18,
					sort: "rating",
				},
			}),
			providesTags: ["TopRated"],
		}),

		getRegularDiscountProducts: build.query<
			IProduct[],
			{ limit: number; offset: number }
		>({
			query: (params) => ({
				url: "discount/regular",
				params: {
					limit: params.limit,
					offset: params.offset,
				},
			}),
			providesTags: ["RegularDiscount"],
			serializeQueryArgs: ({ endpointName }) => {
				return endpointName;
			},
			merge: (currentCache, newItems, { arg: { offset } }) => {
				if (offset === 0) return newItems;
				return [...new Set([...currentCache, ...newItems])];
			},
			forceRefetch({ currentArg, previousArg }) {
				return currentArg?.offset !== previousArg?.offset;
			},
		}),

		getEvent11Products: build.query<
			IProduct[],
			{ limit: number; offset: number }
		>({
			query: (params) => ({
				url: "discount/11-11",
				params: {
					limit: params.limit,
					offset: params.offset,
				},
			}),
			providesTags: ["Event11"],
			serializeQueryArgs: ({ endpointName }) => {
				return endpointName;
			},
			merge: (currentCache, newItems, { arg: { offset } }) => {
				if (offset === 0) return newItems;
				return [...(currentCache || []), ...newItems];
			},
			forceRefetch({ currentArg, previousArg }) {
				return currentArg?.offset !== previousArg?.offset;
			},
			keepUnusedDataFor: 300,
		}),

		getRelatedProducts: build.query<IProduct[], number>({
			query: (id) => `/products/${id}/related`,
			providesTags: ["Products"],
		}),

		checkout: build.mutation<void, CheckoutRequest>({
			query: (body) => ({
				url: "/checkout",
				method: "POST",
				body,
			}),
			invalidatesTags: ["Products"],
		}),

		getCategoryProducts: build.query<
			IProduct[],
			{
				categoryId: string | undefined;
				limit: number;
				offset: number;
				sortOption?: string;
				priceRange?: [number, number];
				deliveryTime?: string | null;
				zoneId?: number;
			}
		>({
			query: ({
				categoryId,
				limit,
				offset,
				sortOption,
				priceRange,
				deliveryTime,
				zoneId,
			}) => {
				const params = {
					limit,
					offset,
					sort: sortOption,
					price_min: priceRange ? priceRange[0] : undefined,
					price_max: priceRange ? priceRange[1] : undefined,
					delivery_time:
						deliveryTime && deliveryTime !== "any" ? deliveryTime : undefined,
					zone_id: zoneId,
				};

				return {
					url: `categories/${categoryId}/products`,
					params,
				};
			},
			serializeQueryArgs: ({ queryArgs }) => {
				const { categoryId, zoneId, sortOption, priceRange, deliveryTime } =
					queryArgs;
				return `${categoryId}-${zoneId}-${sortOption}-${priceRange?.join(
					"-"
				)}-${deliveryTime}`;
			},
			merge: (currentCache, newItems, { arg: { offset } }) => {
				if (offset === 0) return newItems;
				return [...new Set([...currentCache, ...newItems])];
			},
			forceRefetch({ currentArg, previousArg }) {
				return (
					currentArg?.categoryId !== previousArg?.categoryId ||
					currentArg?.offset !== previousArg?.offset ||
					currentArg?.zoneId !== previousArg?.zoneId ||
					currentArg?.sortOption !== previousArg?.sortOption ||
					currentArg?.priceRange?.[0] !== previousArg?.priceRange?.[0] ||
					currentArg?.priceRange?.[1] !== previousArg?.priceRange?.[1] ||
					currentArg?.deliveryTime !== previousArg?.deliveryTime
				);
			},
		}),

		searchProducts: build.query<IProduct[], { title: string }>({
			query: ({ title }) => ({
				url: `/products/search`,
				params: { title },
			}),
		}),

		getProductsByIds: build.query<IProduct[], number[]>({
			query: (ids) => ({
				url: `/products/byIds`,
				method: 'POST',
				body: { ids }
			}),
			transformResponse: (response: IProduct[]) => {
				return response.map(product => {
					const discountedPrice = product.discount
						? product.price - (product.price * product.discount.percentage) / 100
						: product.price;
					
					return {
						...product,
						currentPrice: discountedPrice
					};
				});
			}
		}),

		searchProductsWithFilters: build.query<
			IProduct[],
			{
				query: string;
				limit: number;
				offset: number;
				sortOption?: string;
				priceRange?: [number, number];
				deliveryTime?: string | null;
				zoneId?: number | null;
			}
		>({
			query: ({
				query,
				limit,
				offset,
				sortOption,
				priceRange,
				deliveryTime,
				zoneId,
			}) => ({
				url: "/products/search/filters",
				params: {
					title: query,
					limit,
					offset,
					sort: sortOption,
					price_min: priceRange?.[0],
					price_max: priceRange?.[1],
					delivery_time:
						deliveryTime && deliveryTime !== "any" ? deliveryTime : undefined,
					zone_id: zoneId,
				},
			}),
			serializeQueryArgs: ({ queryArgs }) => {
				const { query, zoneId, sortOption, priceRange, deliveryTime } =
					queryArgs;
				return `${query}-${zoneId}-${sortOption}-${priceRange?.join(
					"-"
				)}-${deliveryTime}`;
			},
			merge: (currentCache, newItems, { arg: { offset } }) => {
				if (offset === 0) return newItems;
				return [...currentCache, ...newItems];
			},
			forceRefetch({ currentArg, previousArg }) {
				return (
					currentArg?.query !== previousArg?.query ||
					currentArg?.offset !== previousArg?.offset ||
					currentArg?.zoneId !== previousArg?.zoneId ||
					currentArg?.sortOption !== previousArg?.sortOption ||
					currentArg?.priceRange?.[0] !== previousArg?.priceRange?.[0] ||
					currentArg?.priceRange?.[1] !== previousArg?.priceRange?.[1] ||
					currentArg?.deliveryTime !== previousArg?.deliveryTime
				);
			},
		}),
	}),
});

export const {
	useGetProductQuery,
	useGetProductsQuery,
	useGetTopProductsQuery,
	useGetPriceProductsQuery,
	useGetTopRatedProductsQuery,
	useGetRegularDiscountProductsQuery,
	useGetEvent11ProductsQuery,
	useGetRelatedProductsQuery,
	useCheckoutMutation,
	useGetCategoryProductsQuery,
	useSearchProductsQuery,
	useGetProductsByIdsQuery,
	useSearchProductsWithFiltersQuery,
} = productApi;
