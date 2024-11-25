import { FC, useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearchProductsWithFiltersQuery } from "../services/ProductServices";
import { useObserver } from "../hooks/useObserver";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { resetFilters } from "../store/reducers/filters/filtersSlice";
import Category from "../components/category/Category";

const SearchPage: FC = () => {
	const [searchParams] = useSearchParams();
	const query = searchParams.get("q") || "";
	const [offset, setOffset] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const limit = 18;

	const dispatch = useAppDispatch();

	const { sortOption, appliedPriceRange, appliedDeliveryTime } = useAppSelector(
		(state) => state.filtersReducer
	);

	const { zone_id: zoneId } = useAppSelector((state) => state.deliveryReducer);

	useEffect(() => {
		dispatch(resetFilters());
		setOffset(0);
		setHasMore(true);
	}, [query, dispatch]);

	const {
		data: products,
		isLoading,
		error,
		isFetching,
	} = useSearchProductsWithFiltersQuery(
		{
			query,
			limit,
			offset,
			sortOption,
			priceRange: appliedPriceRange ?? undefined,
			deliveryTime: appliedDeliveryTime,
			zoneId: zoneId || 1,
		},
		{
			skip: !query || !zoneId,
		}
	);

	const lastElement = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (products && !isFetching) {
			setHasMore(products.length >= offset + limit);
		}
	}, [products, offset, limit, isFetching]);

	useObserver(lastElement, hasMore && !isLoading, isFetching, () => {
		if (hasMore && !isFetching) {
			setOffset((prev) => prev + limit);
		}
	});

	return (
		<Category
			id={undefined}
			data={products || []}
			error={error}
			isLoading={isLoading}
			isFetching={isFetching}
			hasMore={hasMore}
			lastElement={lastElement}
			zoneId={zoneId}
			title={`Результаты поиска: ${query}`}
		/>
	);
};

export default SearchPage;
