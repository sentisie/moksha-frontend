import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import classes from "./Header.module.scss";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { toggleForm } from "../../store/reducers/user/userSlice";
import AVATAR from "/src/assets/icons/profile.svg";
import LOGO from "/src/assets/icons/logo.svg";
import UserLoader from "../../UI/loaders/user-loader/UserLoader";
import SearchBar from "../searchbar/SearchBar";
import Sidebar from "../sidebar/Sidebar";
import Overlay from "../../UI/overlay/Overlay";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { toast } from "react-toastify";
import CurrencyDropdown from "../dropdown/CurrencyDropdown";
import DeliveryModal from "../delivery/DeliveryModal";
import { useGetUserOrdersQuery } from "../../services/OrderService";
import { loadCart } from "../../store/reducers/user/userActionCreator";

const Header: FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const { curUser, isUserLoading, userError, cart } = useAppSelector(
		(state) => state.userReducer
	);

	const { location } = useAppSelector((state) => state.deliveryReducer);

	const [values, setValues] = useState({ name: "Войти", avatar: AVATAR });
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isFixed, setIsFixed] = useState(false);
	const [isCatalogActive, setIsCatalogActive] = useState(false);
	const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

	const { favorites } = useAppSelector((state) => state.favoritesReducer);

	const { data: orders } = useGetUserOrdersQuery(undefined, {
		skip: !curUser
	});

	const activeOrders = orders?.filter(order => order.status === "new").length || 0;

	const handleClick = () => {
		if (!curUser) dispatch(toggleForm(true));
		else navigate("/Profile");
	};

	const handleCatalogClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setIsSidebarOpen(!isSidebarOpen);
		setIsCatalogActive(!isCatalogActive);
		event.stopPropagation();
	};
	const handleOverlayClick = () => {
		setIsSidebarOpen(false);
		setIsCatalogActive(false);
	};

	const handleHeaderClick = () => {
		setIsSidebarOpen(false);
		setIsCatalogActive(false);
	};

	useBodyScrollLock(isSidebarOpen);

	useEffect(() => {
		if (curUser) {
			setValues({
				name: curUser.name,
				avatar: curUser.avatar || AVATAR,
			});
		} else {
			setValues({ name: "Войти", avatar: AVATAR });
		}
	}, [curUser]);

	useEffect(() => {
		if (userError) {
			toast.error(userError);
		}
	}, [userError]);

	useEffect(() => {
		const handleScroll = () => {
			const headerHeight =
				document.querySelector(`.${classes.containerBottom}`)?.clientHeight ||
				0;
			const scrollTop = window.pageYOffset;
			const documentHeight = document.documentElement.scrollHeight;
			const windowHeight = window.innerHeight;

			const shouldFixHeader =
				documentHeight > windowHeight * 1.5 && scrollTop >= headerHeight;
			setIsFixed(shouldFixHeader);
			document.body.style.paddingTop = shouldFixHeader
				? `${headerHeight}px`
				: "0";
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token && curUser) {
			dispatch(loadCart());
		}
	}, [dispatch, curUser]);

	return (
		<>
			<header className={classes.header} onClick={handleHeaderClick}>
				<div className={`${classes.containerTop} container`}>
					<article className={classes.headerTop}>
						<article className={classes.left}>
							<CurrencyDropdown />
							<address
								className={classes.location}
								onClick={() => setIsDeliveryModalOpen(true)}
								style={{ cursor: "pointer" }}
							>
								{`${location?.address || "Выберите город"}`}
							</address>
						</article>
						<ul className={classes.headerTopUl}>
							<li className={classes.headerTopLink}>Стать продавцом</li>
							<li className={classes.headerTopLink}>Покупать как компания</li>
							<li className={classes.headerTopLink}>Подарочные сертификаты</li>
							<li className={classes.headerTopLink}>Помощь</li>
							<li className={classes.headerTopLink}>Пункты выдачи</li>
						</ul>
					</article>
				</div>

				<div className={`${classes.wrapper} ${isFixed ? classes.fixed : ""}`}>
					<div className={`${classes.containerBottom} container `}>
						<article className={classes.headerBottom}>
							<article className={classes.navigation}>
								<article className={classes.logo}>
									<Link to="/Home">
										<img src={LOGO} alt="" />
										Мокша
									</Link>
								</article>
								<button
									className={`${classes.catalog} ${
										isCatalogActive ? classes.active : ""
									}`}
									onClick={handleCatalogClick}
								>
									<span></span>
								</button>
								<SearchBar />
							</article>
							{isUserLoading ? (
								<UserLoader />
							) : (
								<article className={classes.user} onClick={handleClick}>
									<div
										className={classes.avatar}
										style={{ backgroundImage: `url(${values.avatar})` }}
									></div>
									<div className={classes.username}>{values.name}</div>
								</article>
							)}
							<article className={classes.info}>
								<Link to="/orders">
									<article className={classes.orders}>
										{activeOrders > 0 && (
											<span className={classes.badge}>{activeOrders}</span>
										)}
									</article>
									Доставки
								</Link>
								<Link to="/favorites">
									<article className={classes.favorites}>
										{curUser && favorites.length > 0 && (
											<span className={classes.badge}>{favorites.length}</span>
											)}
									</article>
									Избранное
								</Link>
								<Link to="/cart">
									<article className={classes.cart}>
										{cart.length > 0 && (
											<span className={classes.badge}>{cart.length}</span>
										)}
									</article>
									Корзина
								</Link>
							</article>
						</article>
					</div>
					<Sidebar
						style={
							isSidebarOpen
								? { transform: "translateX(0)" }
								: { transform: "translateX(-100%)" }
						}
						setIsSidebarOpen={setIsSidebarOpen}
						setIsCatalogActive={setIsCatalogActive}
					/>
					<Overlay
						className="overlay-sidebar"
						style={
							isSidebarOpen
								? {
										visibility: "visible",
										opacity: "1",
										top: "100%",
										position: "absolute",
								}
								: { visibility: "hidden", opacity: "0" }
						}
						onClick={handleOverlayClick}
					/>
				</div>
			</header>
			<DeliveryModal
				isOpen={isDeliveryModalOpen}
				onClose={() => setIsDeliveryModalOpen(false)}
			/>
		</>
	);
};

export default Header;
