import { FC, useEffect, useState } from "react";
import PageLoader from "../UI/loaders/page-loader/PageLoader";
import Poster from "../components/poster/Poster";
import {
	useGetTopProductsQuery,
	useGetPriceProductsQuery,
	useGetTopRatedProductsQuery,
} from "../services/ProductServices";
import SliderProducts from "../components/products/SliderProducts";
import NewsletterSubscription from "../components/newsletter/NewsletterSubscription";
import EventBanner from "../components/banner/EventBanner/EventBanner";
import SaleBanner from "../components/banner/SaleBanner/SaleBanner";

const Home: FC = () => {
	const [isPageLoading, setIsPageLoading] = useState(true);

	const {
		data: topProducts = [],
		isLoading: isTopLoading,
		error: topError,
	} = useGetTopProductsQuery();
	const {
		data: priceProducts = [],
		isLoading: isPriceLoading,
		error: priceError,
	} = useGetPriceProductsQuery(1500);
	const {
		data: topRatedProducts = [],
		isLoading: isRatedLoading,
		error: ratedError,
	} = useGetTopRatedProductsQuery();

	const isLoading = isTopLoading || isPriceLoading || isRatedLoading;
	const error = topError || priceError || ratedError;

	useEffect(() => {
		if (!isLoading) {
			const timer = setTimeout(() => {
				setIsPageLoading(false);
			}, 500);

			return () => clearTimeout(timer);
		}
	}, [isLoading]);

	if (isPageLoading) {
		return <PageLoader />;
	}

	return (
		<>
			<Poster />
			{!isLoading && !error && topProducts.length > 0 && (
				<SliderProducts
					products={topProducts}
					amount={18}
					title="Берут чаще всего"
					isLoading={isLoading}
					error={error ? "Ошибка при загрузке продуктов" : null}
				/>
			)}
			{!isLoading && !error && priceProducts.length > 0 && (
				<SliderProducts
					isLoading={isLoading}
					error={error ? "Ошибка при загрузке продуктов" : null}
					products={priceProducts}
					title="Выгодное до 1500 ₽"
					amount={18}
				/>
			)}
			<EventBanner />
			{!isLoading && !error && topRatedProducts.length > 0 && (
				<SliderProducts
					isLoading={isLoading}
					error={error ? "Ошибка при загрузке продуктов" : null}
					products={topRatedProducts}
					amount={18}
					title="Лучшее по мнению покупателей"
				/>
			)}
			<NewsletterSubscription />
			<SaleBanner />
		</>
	);
};

export default Home;
