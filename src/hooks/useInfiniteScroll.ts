import { useEffect, useRef, useState } from "react";
import { IProduct } from "../types/types";

export const useInfiniteScroll = (
	initialProducts: IProduct[] | undefined,
	isLoading: boolean,
	itemsPerPage: number = 20
) => {
	const [displayedProducts, setDisplayedProducts] = useState<IProduct[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const observerTarget = useRef(null);

	useEffect(() => {
		if (initialProducts) {
			setDisplayedProducts(initialProducts.slice(0, itemsPerPage));
		}
	}, [initialProducts, itemsPerPage]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isLoading && initialProducts) {
					const nextProducts = initialProducts.slice(
						0,
						(currentPage + 1) * itemsPerPage
					);

					if (nextProducts.length > displayedProducts.length) {
						setDisplayedProducts(nextProducts);
						setCurrentPage((prev) => prev + 1);
					}
				}
			},
			{ threshold: 0.1 }
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => observer.disconnect();
	}, [
		currentPage,
		displayedProducts.length,
		initialProducts,
		isLoading,
		itemsPerPage,
	]);

	return { displayedProducts, observerTarget };
};
