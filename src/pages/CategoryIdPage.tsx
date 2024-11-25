import { FC, useRef, useState, useEffect } from "react";
import Category from "../components/category/Category";
import { useGetCategoryProductsQuery } from "../services/ProductServices";
import { useParams } from "react-router-dom";
import { useObserver } from "../hooks/useObserver";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { resetFilters } from "../store/reducers/filters/filtersSlice";

const CategoryIdPage: FC = () => {
	const { id } = useParams();
	const [offset, setOffset] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const limit = 18;

	const dispatch = useAppDispatch();

	const { sortOption, appliedPriceRange, appliedDeliveryTime } = useAppSelector(
		(state) => state.filtersReducer
	);

	const { zone_id: zoneId, location } = useAppSelector((state) => state.deliveryReducer);

	useEffect(() => {
		dispatch(resetFilters());
		setOffset(0);
		setHasMore(true);
	}, [id, dispatch]);

	useEffect(() => {
		setOffset(0);
		setHasMore(true);
	}, [id, zoneId, location]);

	const {
		data: products,
		isLoading,
		error,
		isFetching,
	} = useGetCategoryProductsQuery(
		{
			categoryId: id,
			limit,
			offset,
			sortOption,
			priceRange: appliedPriceRange ?? undefined,
			deliveryTime: appliedDeliveryTime,
			zoneId: zoneId || 1,
		},
		{
			skip: !id || !zoneId,
			refetchOnMountOrArgChange: true,
			refetchOnFocus: false,
			refetchOnReconnect: false,
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
		<>
			<Category
				id={id}
				data={products || []}
				error={error}
				isLoading={isLoading}
				isFetching={isFetching}
				hasMore={hasMore}
				lastElement={lastElement}
				zoneId={zoneId}
			/>
		</>
	);
};

export default CategoryIdPage;
