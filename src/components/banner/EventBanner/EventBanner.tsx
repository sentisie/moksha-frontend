import { FC } from "react";
import classes from "./EventBanner.module.scss";
import bannerImg from "../../../assets/images/banners/sale.jpg";
import { Link } from "react-router-dom";

const EventBanner: FC = () => {
	return (
		<section className={classes.banner}>
			<div className={`${classes.container} container`}>
				<article className={classes.left}>
					<p className={classes.content}>
						большие
						<span> скидки</span>
					</p>
					<Link to="/sales/11-11" className="main-btn">
						Перейти в каталог
					</Link>
				</article>
				<article
					className={classes.right}
					style={{ backgroundImage: `url(${bannerImg})` }}
				>
					<p className={classes.discount}>
						Скидки <span> 50% </span> на все товары
					</p>
				</article>
			</div>
		</section>
	);
};

export default EventBanner;
