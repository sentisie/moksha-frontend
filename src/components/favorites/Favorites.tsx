import { FC, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import ProductCard from "../card/ProductCard";
import classes from "./Favorites.module.scss";
import { toggleForm } from "../../store/reducers/user/userSlice";
import { fetchFavorites } from "../../store/reducers/favorites/favoriteActionCreator";
import MyButton from "../../UI/button/MyButton";
import { useObserver } from "../../hooks/useObserver";
import { resetFavorites } from "../../store/reducers/favorites/favoritesSlice";
import Loader from "../../UI/loaders/main-loader/Loader";

const Favorites: FC = () => {
	const { curUser, isAuthChecked } = useAppSelector(
		(state) => state.userReducer
	);
	const dispatch = useAppDispatch();
	const { favorites, isLoading } = useAppSelector(
		(state) => state.favoritesReducer
	);
	const { deliverySpeed } = useAppSelector((state) => state.deliveryReducer);
	const [sortOption, setSortOption] = useState<string>("dateDesc");
	const [openFilter, setOpenFilter] = useState<string | null>(null);
	const [showInStockOnly, setShowInStockOnly] = useState<boolean>(false);
	const [hasMore, setHasMore] = useState(true);

	const limit = 18;
	const offsetRef = useRef(0);
	const lastElement = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isAuthChecked && curUser) {
			dispatch(resetFavorites());
			offsetRef.current = 0;
			dispatch(fetchFavorites({ limit, offset: offsetRef.current }));
		}
	}, [dispatch, curUser, isAuthChecked]);

	useObserver(lastElement, hasMore && !isLoading, isLoading, () => {
		if (hasMore && !isLoading) {
			offsetRef.current += limit;
			dispatch(fetchFavorites({ limit, offset: offsetRef.current }));
		}
	});

	const sortOptionsLabels: { [key: string]: string } = {
		dateDesc: "По дате добавления (сначала новые)",
		dateAsc: "По дате добавления (сначала старые)",
		priceAsc: "По возрастанию цены",
		priceDesc: "По убыванию цены",
	};

	const sortedFavorites = favorites.slice().sort((a, b) => {
		switch (sortOption) {
			case "dateDesc":
				return (
					new Date(b.date_added).getTime() - new Date(a.date_added).getTime()
				);
			case "dateAsc":
				return (
					new Date(a.date_added).getTime() - new Date(b.date_added).getTime()
				);
			case "priceAsc":
				return a.price - b.price;
			case "priceDesc":
				return b.price - a.price;
			default:
				return 0;
		}
	});

	const filteredFavorites = showInStockOnly
		? sortedFavorites.filter((item) => item.quantity > 0)
		: sortedFavorites;

	useEffect(() => {
		if (!isLoading) {
			if (favorites.length >= offsetRef.current + limit) {
				setHasMore(true);
			} else {
				setHasMore(false);
			}
		}
	}, [favorites, isLoading]);

	return (
		<div className={classes.favorites}>
			<div className="container">
				{curUser ? (
					<>
						<div className={classes.filters}>
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
							<label className="radio-btn">
								<input
									type="checkbox"
									checked={showInStockOnly}
									onChange={() => setShowInStockOnly(!showInStockOnly)}
								/>
								<span>Показать только в наличии</span>
							</label>
						</div>
						<h2 className="h2-title">Избранное</h2>

						{favorites.length === 0 && !isLoading ? (
							<p>Вы еще не добавили товары в избранное.</p>
						) : filteredFavorites.length === 0 && !isLoading ? (
							<p>Совпадений не найдено.</p>
						) : (
							<>
								<div className={classes.list}>
									{filteredFavorites.map((item) => (
										<ProductCard
											key={`${item.id}-${deliverySpeed}`}
											item={item}
											showAddToCartButton={true}
										/>
									))}
								</div>
								<div ref={lastElement}></div>
								{isLoading && <Loader />}
							</>
						)}
					</>
				) : (
					<div className={classes.notAuthorized}>
						<h2 className={`${classes.notAuthorizedTitle} h2-title`}>
							Пожалуйста, войдите в аккаунт, чтобы просмотреть избранные товары
						</h2>
						<MyButton onClick={() => dispatch(toggleForm(true))}>
							Войти
						</MyButton>
					</div>
				)}
			</div>
		</div>
	);
};

export default Favorites;
