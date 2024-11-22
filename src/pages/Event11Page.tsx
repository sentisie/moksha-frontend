import { FC, useRef, useState, useEffect } from "react";
import { useGetEvent11ProductsQuery } from "../services/ProductServices";
import Products from "../components/products/Products";
import { useObserver } from "../hooks/useObserver";
import Loader from "../UI/loaders/main-loader/Loader";

const Event11Page: FC = () => {
	const [offset, setOffset] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const limit = 18;

	const {
		data: products,
		isLoading,
		error,
		isFetching,
	} = useGetEvent11ProductsQuery(
		{ limit, offset },
		{
			refetchOnMountOrArgChange: false,
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
			{products && products.length ? (
				<Products
					title="Скидки 11.11"
					products={products || []}
					isLoading={isLoading}
					error={error ? "Ошибка при загрузке продуктов" : null}
				/>
			) : (
				<div>Товары не найдены</div>
			)}
			{hasMore && <div ref={lastElement} />}
			{isFetching && <Loader />}
		</>
	);
};

export default Event11Page;
