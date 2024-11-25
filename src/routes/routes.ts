import Cart from "../pages/CartPage";
import CategoryIdPage from "../pages/CategoryIdPage";
import Event11Page from "../pages/Event11Page";
import FavoritesPage from "../pages/FavoritesPage";
import Home from "../pages/Home";
import NotFoundPage from "../pages/NotFoundPage";
import ProductIdPage from "../pages/ProductIdPage";
import ProfilePage from "../pages/ProfilePage";
import RegularSalesPage from "../pages/RegularSalesPage";
import SearchPage from "../pages/SearchPage";
import OrdersPage from "../pages/OrdersPage";
import { Route } from "../types/types";

export const routes: Route[] = [
	{
		path: "/",
		element: Home,
	},
	{
		path: "/home",
		element: Home,
	},
	{
		path: "/cart",
		element: Cart,
	},
	{
		path: "/favorites",
		element: FavoritesPage,
	},
	{
		path: "/profile",
		element: ProfilePage,
	},
	{
		path: "/categories/:id",
		element: CategoryIdPage,
	},
	{
		path: "/products/:id",
		element: ProductIdPage,
	},
	{
		path: "/sales",
		element: RegularSalesPage,
	},
	{
		path: "/sales/11-11",
		element: Event11Page,
	},
	{
		path: "/search",
		element: SearchPage,
	},
	{
		path: "/orders",
		element: OrdersPage,
	},
	{
		path: "/*",
		element: NotFoundPage,
	},
];
