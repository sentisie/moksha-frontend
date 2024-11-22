import { ChangeEvent, FC, useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import classes from "./SearchBar.module.scss";
import { IProduct } from "../../types/types";
import Loader from "../../UI/loaders/main-loader/Loader";
import useDebounce from "../../hooks/useDeboune";
import { useSearchProductsQuery } from "../../services/ProductServices";
import Overlay from "../../UI/overlay/Overlay";
import useHoverEffect from "../../hooks/useHoverEffect";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import {
	useGetTopSearchedProductsQuery,
	useUpdateSearchStatisticsMutation,
} from "../../services/SearchServices";

const SearchBar: FC = () => {
	const [isOverlayVisible, setOverlayVisible] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [searchHistory, setSearchHistory] = useState<IProduct[]>(() => {
		const savedHistory = localStorage.getItem("searchHistory");
		return savedHistory ? JSON.parse(savedHistory) : [];
	});

	const [viewedProducts, setViewedProducts] = useState<number[]>(() => {
		const saved = localStorage.getItem("viewedProducts");
		return saved ? JSON.parse(saved) : [];
	});

	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const formRef = useRef<HTMLFormElement | null>(null);

	const { data: topSearchedProducts, isLoading: isTopSearchLoading } =
		useGetTopSearchedProductsQuery();
	const [updateSearchStatistics] = useUpdateSearchStatisticsMutation();

	useHoverEffect(buttonRef, formRef);

	const debouncedSearchValue = useDebounce(searchValue, 500);

	const { data, isLoading } = useSearchProductsQuery(
		{ title: debouncedSearchValue },
		{ skip: !debouncedSearchValue }
	);

	const navigate = useNavigate();

	const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		setSearchValue(value);
	};

	const handleItemClick = async (item: IProduct) => {
		setSearchValue("");
		setSearchHistory((prevHistory) => {
			const newHistory = [item, ...prevHistory.filter((i) => i.id !== item.id)];
			newHistory.splice(3);
			return newHistory;
		});
		setOverlayVisible(false);

		if (!viewedProducts.includes(item.id)) {
			try {
				await updateSearchStatistics(item.id);
				const newViewedProducts = [...viewedProducts, item.id];
				setViewedProducts(newViewedProducts);
				localStorage.setItem(
					"viewedProducts",
					JSON.stringify(newViewedProducts)
				);
			} catch (error) {
				console.error("Ошибка при обновлении статистики поиска:", error);
			}
		}
	};

	const handleFocus = () => {
		setOverlayVisible(true);
	};

	useBodyScrollLock(isOverlayVisible);

	const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (!formRef.current?.contains(event.target as Node)) {
			setOverlayVisible(false);
		}
	};

	const handleRemoveHistoryItem = (itemId: number) => {
		setSearchHistory((prevHistory) => {
			const filtered = prevHistory.filter((item) => item.id !== itemId);
			return filtered;
		});
	};

	useEffect(() => {
		localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
	}, [searchHistory]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchValue.trim()) {
			navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
			setOverlayVisible(false);
			setSearchValue("");
		}
	};

	return (
		<>
			<Overlay
				className={`${isOverlayVisible ? "visible" : "hidden"}`}
				onClick={handleOverlayClick}
			/>

			<form ref={formRef} className={classes.form} onSubmit={handleSubmit}>
				<input
					type="search"
					name="search"
					placeholder="Искать на Мокша"
					autoComplete="off"
					onChange={handleSearch}
					value={searchValue}
					onFocus={handleFocus}
				/>
				<button
					type="button"
					className={classes.clearButton}
					onClick={() => setSearchValue("")}
				/>
				<button ref={buttonRef} className={classes.button} type="submit" />
				<article
					className={`${classes.box} ${
						isOverlayVisible ? "visible" : "hidden"
					}`}
				>
					{searchValue === "" && searchHistory.length > 0 && (
						<div className={classes.history}>
							<h4>История поиска</h4>
							<ul>
								{searchHistory.map((item) => (
									<li key={item.id} onClick={() => handleItemClick(item)}>
										<Link to={`/products/${item.id}`} className={classes.item}>
											<div className={classes.left}>
												<div
													className={classes.image}
													style={{
														backgroundImage: `url(${item.images[0]})`,
													}}
												/>
												<div className={classes.title}>{item.title}</div>
											</div>
											<button
												className={classes.removeButton}
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													handleRemoveHistoryItem(item.id);
												}}
											/>
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}
					{isLoading || isTopSearchLoading ? (
						<Loader />
					) : searchValue && !data?.length ? (
						"Нет результатов"
					) : (
						<div className={classes.products}>
							{searchValue === "" && (
								<>
									<h4>Часто ищут</h4>
									<ul>
										{topSearchedProducts?.map((item) => (
											<li key={item.id} onClick={() => handleItemClick(item)}>
												<Link
													className={classes.item}
													to={`/products/${item.id}`}
												>
													<div
														className={classes.image}
														style={{
															backgroundImage: `url(${item.images[0]})`,
														}}
													/>
													<div className={classes.title}>{item.title}</div>
												</Link>
											</li>
										))}
									</ul>
								</>
							)}
							{searchValue && (
								<ul>
									{data?.map((item) => (
										<li key={item.id} onClick={() => handleItemClick(item)}>
											<Link
												className={classes.item}
												to={`/products/${item.id}`}
											>
												<div
													className={classes.image}
													style={{
														backgroundImage: `url(${item.images[0]})`,
													}}
												/>
												<div className={classes.title}>{item.title}</div>
											</Link>
										</li>
									))}
								</ul>
							)}
						</div>
					)}
				</article>
			</form>
		</>
	);
};

export default SearchBar;
