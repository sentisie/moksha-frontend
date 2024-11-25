import { FC, useEffect, useState } from "react";
import Loader from "../../UI/loaders/main-loader/Loader";
import Products from "../products/Products";
import { IProduct } from "../../types/types";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { useNavigate } from "react-router-dom";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import styles from "./Category.module.scss";

import {
	setSortOption,
	setPriceRange,
	setAppliedPriceRange,
	setDeliveryTime,
	setAppliedDeliveryTime,
	resetFilters,
} from "../../store/reducers/filters/filtersSlice";
import Filters from "../filters/Filters";

interface CategoryProps {
	id: string | undefined;
	data: IProduct[];
	isLoading: boolean;
	error: FetchBaseQueryError | SerializedError | undefined;
	isFetching: boolean;
	hasMore: boolean;
	lastElement: React.RefObject<HTMLDivElement>;
	zoneId: number | null;
	title?: string;
}

const Category: FC<CategoryProps> = ({
	id,
	data,
	isLoading,
	error,
	isFetching,
	hasMore,
	lastElement,
	zoneId,
	title
}) => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const { categories } = useAppSelector((state) => state.categoriesReducer);
	const {
		sortOption,
		priceRange,
		deliveryTime,
		appliedPriceRange,
		appliedDeliveryTime,
	} = useAppSelector((state) => state.filtersReducer);


	const [cat, setCat] = useState("");

	useEffect(() => {
		if (!id || !categories.length) return;
		const category = categories.find((item) => item.id === Number(id));
		if (category) {
			setCat(category.name);
		} else {
			navigate("/Home");
		}
	}, [categories, id, navigate]);

	const handleResetFilters = () => {
			dispatch(resetFilters());
	};

	const handleSortOptionChange = (value: string) => {
		dispatch(setSortOption(value));
	};

	const handlePriceRangeChange = (value: [number, number]) => {
		dispatch(setPriceRange(value));
	};

	const handleDeliveryTimeChange = (value: string) => {
		dispatch(setDeliveryTime(value));
	};

	const handleAppliedPriceRangeChange = (value: [number, number] | null) => {
		dispatch(setAppliedPriceRange(value));
	};

	const handleAppliedDeliveryTimeChange = (value: string | null) => {
		dispatch(setAppliedDeliveryTime(value));
	};

	return (
		<div className="animate-fade-in">
			<Filters
				sortOption={sortOption}
				setSortOption={handleSortOptionChange}
				priceRange={priceRange}
				setPriceRange={handlePriceRangeChange}
				appliedPriceRange={appliedPriceRange}
				appliedDeliveryTime={appliedDeliveryTime}
				deliveryTime={deliveryTime}
				setDeliveryTime={handleDeliveryTimeChange}
				setAppliedPriceRange={handleAppliedPriceRangeChange}
				setAppliedDeliveryTime={handleAppliedDeliveryTimeChange}
				handleResetFilters={handleResetFilters}
				zone_id={zoneId}
			/>

			{isLoading ? (
				<div className={styles.loaderContainer}>
					<Loader />
				</div>
			) : data && data.length ? (
				<>
					<Products
						title={title || cat}
						products={data}
						isLoading={isLoading}
						error={error ? "Ошибка при загрузке продуктов" : null}
					/>
					{hasMore && <div ref={lastElement} />}
					{isFetching && <Loader />}
				</>
			) : (
				<div className={styles.noProducts}>Товары не найдены 😢</div>
			)}
		</div>
	);
};

export default Category;
