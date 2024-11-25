import { FC, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectCards } from "swiper/modules";
import classes from "./Poster.module.scss";
import "swiper/css";
import "swiper/css/bundle";
import bg1 from "../../assets/images/posters/poster-1.jpg";
import bg2 from "../../assets/images/posters/poster-2.jpg";
import bg3 from "../../assets/images/posters/poster-3.jpg";
import bg4 from "../../assets/images/posters/poster-4.jpg";

const images = [bg1, bg2, bg3, bg4];

const Poster: FC = () => {
	const [slidesPerView, setSlidesPerView] = useState(0);

	useEffect(() => {
		setSlidesPerView(1.3);
	}, []);

	return (
		<article className={classes.poster}>
			<div className="container">
				<Swiper
					modules={[Navigation, Autoplay, EffectCards]}
					spaceBetween={20}
					slidesPerView={slidesPerView}
					slidesPerGroup={1}
					navigation
					className={classes.swiper}
					loop
					autoplay={{ delay: 5000, disableOnInteraction: false }}
				>
					{images.map((image, index) => (
						<SwiperSlide className={classes.slide} key={index}>
							<img className={classes.image} src={image} alt="poster" />
							<div className={classes.advertising}>
								<span>Реклама</span>
								<span className={classes.icon}></span>
							</div>
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</article>
	);
};

export default Poster;
