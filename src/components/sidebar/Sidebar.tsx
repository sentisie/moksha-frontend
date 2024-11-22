import { FC } from "react";
import classes from "./Sidebar.module.scss";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";
import Loader from "../../UI/loaders/main-loader/Loader";
import MyWrapper from "../../UI/wrapper/MyWrapper";

const Sidebar: FC<{
	style: React.CSSProperties;
	setIsSidebarOpen: (isOpen: boolean) => void;
	setIsCatalogActive: (isActive: boolean) => void;
}> = ({ style, setIsSidebarOpen, setIsCatalogActive }) => {
	const { categories = [], catError, isCatLoading } = useAppSelector(
		(state) => state.categoriesReducer
	);

	return (
		<MyWrapper
			className={classes.sidebar}
			style={style}
			onClick={(event) => event.stopPropagation()}
		>
			<h3 className={classes.title}>Категории</h3>
			<nav>
				<ul className={classes.menu}>
					{isCatLoading ? (
						<Loader />
					) : catError ? (
						<p>{catError}</p>
					) : Array.isArray(categories) && categories.length > 0 ? (
						categories.map((cat) => (
							<li key={cat.id}>
								<NavLink
									className={({ isActive }) =>
										`${classes.link} ${isActive ? classes.active : ""}`
									}
									to={`/categories/${cat.id}`}
									onClick={() => {
										setIsSidebarOpen(false);
										setIsCatalogActive(false);
										window.scrollTo(0, 0);
									}}
								>
									{cat.name.slice(0, 1).toUpperCase() + cat.name.slice(1)}
								</NavLink>
							</li>
						))
					) : (
						<p>Нет доступных категорий</p>
					)}
				</ul>
			</nav>
			<div className={classes.footer}>
				<a href="#" target="_blank" className={classes.link}>
					Помощь
				</a>
				<a
					href="#"
					target="_blank"
					className={classes.link}
					style={{ textDecoration: "underline", opacity: "0.4" }}
				>
					Правила и условия
				</a>
			</div>
		</MyWrapper>
	);
};

export default Sidebar;
