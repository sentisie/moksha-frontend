import React, { useEffect } from 'react';
import AppRouter from "./components/router/AppRouter";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import User from "./components/user/User";
import { checkAuth } from "./store/reducers/user/userActionCreator";
import { getCategories } from "./store/reducers/categories/categoriesActionCreator";
import Notifications from "./components/notifications/Notifications";
import { updateCurrencyRates } from "./store/reducers/currency/currencySlice";
import { fetchFavorites } from './store/reducers/favorites/favoriteActionCreator';

const App: React.FC = () => {
	const dispatch = useAppDispatch();
	const { curUser, isAuthChecked } = useAppSelector((state) => state.userReducer);

	useEffect(() => {
		dispatch(getCategories());
		dispatch(checkAuth());
		dispatch(updateCurrencyRates());

		const interval = setInterval(() => {
			dispatch(updateCurrencyRates());
		}, 3600000);

		return () => clearInterval(interval);
	}, [dispatch]);

	useEffect(() => {
		if (isAuthChecked && curUser) {
			dispatch(fetchFavorites({ limit: 100, offset: 0 }));
		}
	}, [dispatch, isAuthChecked, curUser]);

	return (
		<>
			<Notifications />
			<Header />
			<main>
				<AppRouter />
			</main>
			<Footer />
			<User />
		</>
	);
};

export default App;
