import React, { FC, useEffect, useState } from "react";
import { IProduct } from "../../types/types";
import Loader from "../../UI/loaders/main-loader/Loader";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCards } from "swiper/modules";
import "swiper/css";
import "swiper/css/bundle";
import classes from "./Products.module.scss";
import ProductCard from "../card/ProductCard";

interface ProductsProps {
	title?: string;
	products: IProduct[];
	style?: {
		[key: string]: string;
	};
	amount: number;
	isLoading: boolean;
	error?: string | null;
}

const SliderProducts: FC<ProductsProps> = React.memo(
	({ title, products, amount, isLoading, error }) => {
		const [slidesPerView, setSlidesPerView] = useState(1);

		useEffect(() => {
			const handleResize = () => {
				const width = window.innerWidth;
				if (width < 576) setSlidesPerView(1);
				else if (width < 768) setSlidesPerView(2);
				else if (width < 992) setSlidesPerView(3);
				else if (width < 1200) setSlidesPerView(4);
				else setSlidesPerView(6);
			};

			handleResize();
			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}, []);

		const list = products.filter((_, i) => i < amount);

		return (
			<section className={`${classes.products} animate-fade-in`}>
				<div className="container">
					{title && <h2 className="h2-title">{title}</h2>}
					{isLoading ? (
						<div className={classes.loaderContainer}>
							<Loader />
						</div>
					) : list.length !== 0 ? (
						<Swiper
							modules={[Navigation, EffectCards]}
							spaceBetween={16}
							slidesPerView={slidesPerView}
							slidesPerGroup={6}
							navigation
							allowTouchMove={false}
							className={classes.swiper}
						>
							{error ? (
								<p>{error}</p>
							) : (
								list.map((item) => (
									<SwiperSlide className={classes.swiperSlide} key={item.id}>
										<ProductCard key={item.id} item={item} />
									</SwiperSlide>
								))
							)}
						</Swiper>
					) : null}
				</div>
			</section>
		);
	}
);

export default SliderProducts;
