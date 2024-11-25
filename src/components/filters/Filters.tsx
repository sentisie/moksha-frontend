import { FC, useState, useEffect } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import classes from "./Filters.module.scss";
import { useAppSelector } from "../../hooks/redux";
import MyButton from "../../UI/button/MyButton";

interface FiltersProps {
	sortOption: string;
	setSortOption: (value: string) => void;
	priceRange: [number, number];
	setPriceRange: (value: [number, number]) => void;
	appliedPriceRange: [number, number] | null;
	appliedDeliveryTime: string | null;
	deliveryTime: string;
	setDeliveryTime: (value: string) => void;
	setAppliedPriceRange: (value: [number, number] | null) => void;
	setAppliedDeliveryTime: (value: string | null) => void;
	handleResetFilters: () => void;
	zone_id: number | null;
 }
 
const Filters: FC<FiltersProps> = ({
	sortOption,
	setSortOption,
	priceRange,
	setPriceRange,
	appliedPriceRange,
	appliedDeliveryTime,
	deliveryTime,
	setDeliveryTime,
	setAppliedPriceRange,
	setAppliedDeliveryTime,
	handleResetFilters,
	zone_id,
}) => {
	const [openFilter, setOpenFilter] = useState<string | null>(null);

	const currency = useAppSelector((state) => state.currencyReducer.currency);

	const sortOptionsLabels: { [key: string]: string } = {
		popularity: "По популярности",
		rating: "По рейтингу",
		priceAsc: "По возрастанию цены",
		priceDesc: "По убыванию цены",
		bestDeal: "Сначала выгодные",
	};

	const isFiltersApplied =
		sortOption !== "popularity" ||
		(appliedPriceRange !== null &&
			(appliedPriceRange[0] !== 0 || appliedPriceRange[1] !== 10000)) ||
		(appliedDeliveryTime !== null && appliedDeliveryTime !== "any");

	const handlePriceFilterApply = () => {
		setAppliedPriceRange(priceRange);
		setOpenFilter(null);
	};

	useEffect(() => {
		if (!zone_id) {
			setDeliveryTime("any");
			setAppliedDeliveryTime(null);
		}
	}, [setAppliedDeliveryTime, setDeliveryTime, zone_id]);

	return (
		<div className={classes.filters}>
			<div className="container">
				<div className={classes.inner}>
					<div
						className={classes.filter}
						onMouseEnter={() => setOpenFilter("sort")}
						onMouseLeave={() => setOpenFilter(null)}
					>
						<div className={classes.filterHeader}>
							{sortOptionsLabels[sortOption]}
						</div>
						<div
							className={`${classes.filterContent} ${
								openFilter === "sort" ? classes.filterContentOpen : ""
							}`}
						>
							{Object.entries(sortOptionsLabels).map(([option, label]) => (
								<label key={option} className="radio-btn">
									<input
										type="radio"
										name="sortOption"
										value={option}
										checked={sortOption === option}
										onChange={() => {
											setSortOption(option);
											setOpenFilter(null);
										}}
									/>
									<span>{label}</span>
								</label>
							))}
						</div>
					</div>
					<div
						className={classes.filter}
						onMouseEnter={() => setOpenFilter("price")}
						onMouseLeave={() => setOpenFilter(null)}
					>
						<div className={classes.filterHeader}>Цена, {currency}</div>
						<div
							className={`${classes.filterContent} ${
								openFilter === "price" ? classes.filterContentOpen : ""
							}`}
						>
							<Slider
								range
								min={0}
								max={10000}
								value={priceRange}
								onChange={(value: number | number[]) => {
									if (Array.isArray(value)) {
										setPriceRange([value[0], value[1]]);
									}
								}}
								step={100}
								className={classes.slider}
							/>
							<div className={classes.priceInputs}>
								<input
									type="number"
									value={priceRange[0]}
									onChange={(e) =>
										setPriceRange([Number(e.target.value), priceRange[1]])
									}
									placeholder="Мин"
									className={classes.input}
								/>
								<input
									type="number"
									value={priceRange[1]}
									onChange={(e) =>
										setPriceRange([priceRange[0], Number(e.target.value)])
									}
									placeholder="Макс"
									className={classes.input}
								/>
							</div>
							<MyButton
								onClick={handlePriceFilterApply}
								className={classes.buttonApply}
							>
								Применить
							</MyButton>
						</div>
					</div>
					<div
						className={classes.filter}
						onMouseEnter={() => setOpenFilter("delivery")}
						onMouseLeave={() => setOpenFilter(null)}
					>
						<div className={classes.filterHeader}>Срок доставки</div>
						<div
							className={`${classes.filterContent} ${
								openFilter === "delivery" ? classes.filterContentOpen : ""
							}`}
						>
							{["any", "3", "7"].map((option) => (
								<label key={option} className="radio-btn">
									<input
										type="radio"
										name="deliveryTime"
										value={option}
										checked={deliveryTime === option}
										onChange={() => {
											setDeliveryTime(option);
											setAppliedDeliveryTime(option);
											setOpenFilter(null);
										}}
									/>
									<span>
										{option === "any" && "Любой"}
										{option === "3" && "До 3 дней"}
										{option === "7" && "До 7 дней"}
									</span>
								</label>
							))}
						</div>
					</div>
					<MyButton
						onClick={handleResetFilters}
						className={classes.buttonReset}
						disabled={!isFiltersApplied}
					>
						Сбросить
					</MyButton>
				</div>
			</div>
		</div>
	);
};

export default Filters;
