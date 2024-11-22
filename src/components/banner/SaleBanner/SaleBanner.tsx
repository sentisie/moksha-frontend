import { FC } from "react";
import classes from "./SaleBanner.module.scss";
import bannerImg from "../../../assets/images/banners/sale-3.jpg";
import { Link } from "react-router-dom";

const SaleBanner: FC = () => {
	return (
		<section className={classes.banner}>
			<div className={`${classes.container} container`}>
				<article
					className={classes.inner}
					style={{ backgroundImage: `url(${bannerImg})` }}
				>
					<p className={classes.content}>
						Акции <br />
						<span> на все</span>
					</p>
					<Link to="/sales" className="main-btn">
						За покупками!
					</Link>
				</article>
			</div>
		</section>
	);
};

export default SaleBanner;
