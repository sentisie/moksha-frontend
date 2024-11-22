import React from "react";
import classes from "./StarRating.module.scss";
import { useGetReviewsQuery } from "../../services/ReviewsServices";

const StarRating: React.FC<{ productId: number; onClick?: () => void }> = ({
	productId,
	onClick,
}) => {
	const { data: reviews, isLoading } = useGetReviewsQuery(productId);

	if (isLoading) {
		return (
			<div className={classes.starRating}>
				<div className={classes.ratingLoader}>
					<span className={classes.loadingDot}></span>
					<span className={classes.loadingDot}></span>
					<span className={classes.loadingDot}></span>
				</div>
			</div>
		);
	}

	const totalRating =
		reviews?.reduce((sum, review) => sum + review.rating, 0) || 0;
	const averageRating =
		reviews && reviews.length > 0
			? (totalRating / reviews.length).toFixed(1)
			: "0.0";

	const renderStars = () => {
		return Array.from({ length: 5 }, (_, index) => {
			const value = index + 1;
			const isFilledStar = value <= Math.floor(Number(averageRating));
			const isHalfStar =
				!isFilledStar &&
				value <= Math.ceil(Number(averageRating)) &&
				Number(averageRating) % 1 >= 0.5;

			let className = classes.empty;
			if (isFilledStar) {
				className = classes.filled;
			} else if (isHalfStar) {
				className = classes.half;
			}

			return (
				<span key={index} className={className}>
					★
				</span>
			);
		});
	};

	return (
		<div className={classes.starRating} onClick={onClick}>
			{renderStars()}
			{reviews && reviews.length > 0 ? (
				<>
					<span className={classes.ratingText}>{averageRating}</span>
					<span className={classes.reviewCount}>
						{`${reviews.length} отзывов`}
					</span>
				</>
			) : (
				<span className={classes.reviewCount}>Нет отзывов</span>
			)}
		</div>
	);
};

export default StarRating;
