import React, { useEffect, useState } from "react";
import classes from "./StarRating.module.scss";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const CompactStarRating: React.FC<{ productId: number }> = ({ productId }) => {
	const [stats, setStats] = useState<{
		review_count: number;
		average_rating: number;
	}>({
		review_count: 0,
		average_rating: 0,
	});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setIsLoading(true);
				const response = await axios.get(
					`${BASE_URL}/products/${productId}/review-stats`
				);
				setStats({
						review_count: Number(response.data.review_count),
						average_rating: Number(response.data.average_rating),
				});
			} catch (error) {
				console.error("Ошибка при получении статистики:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchStats();
	}, [productId]);

	if (isLoading) {
		return (
			<div className={classes.compactStarRating}>
				<div className={classes.ratingLoader}>
					<span className={classes.loadingDot}></span>
					<span className={classes.loadingDot}></span>
					<span className={classes.loadingDot}></span>
				</div>
			</div>
		);
	}

	if (stats.review_count === 0) {
		return (
			<div className={classes.compactStarRating}>
				<span className={classes.empty}>★</span>
				<span className={classes.reviewCount}>Нет отзывов</span>
			</div>
		);
	}

	return (
		<div className={classes.compactStarRating}>
			<span className={classes.filled}>★</span>
			<span className={classes.rating}>
				{Number(stats.average_rating).toFixed(1)}
			</span>
			<span className={classes.reviewCount}>
				({stats.review_count} отзывов)
			</span>
		</div>
	);
};

export default CompactStarRating;
