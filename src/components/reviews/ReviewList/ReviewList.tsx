import { FC, useState } from "react";
import Loader from "../../../UI/loaders/main-loader/Loader";
import classes from "../Reviews.module.scss";
import { formatDate } from "../../../utils/formDate";
import { useGetReviewsQuery } from "../../../services/ReviewsServices";
import AVATAR from "/src/assets/icons/profile.svg";
import { BASE_URL } from "../../../utils/constants";

interface ReviewListProps {
	productId: number;
}

const ReviewList: FC<ReviewListProps> = ({ productId }) => {
	const { data: reviews, isLoading, error } = useGetReviewsQuery(productId);
	const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

	const sortedReviews = reviews
		? [...reviews].sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		  )
		: [];

	const handleMediaClick = (url: string) => {
		setSelectedMedia(url);
	};

	const closeModal = () => {
		setSelectedMedia(null);
	};

	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, index) => (
			<span
				key={index}
				className={index < rating ? classes.starFilled : classes.starEmpty}
			>
				★
			</span>
		));
	};

	return (
		<>
			<div className="container">
				{isLoading ? (
					<Loader />
				) : error ? (
					<div>Ошибка при загрузке отзывов</div>
				) : (
					<div className={classes.reviewsList}>
						{sortedReviews.map((review) => (
							<div key={review.id} className={classes.review}>
								<div className={classes.reviewHeader}>
									<div className={classes.userInfo}>
										<div
											className={classes.userAvatar}
											style={{
												backgroundImage: `url(${
													review.user_avatar
														? review.user_avatar.startsWith("http")
															? review.user_avatar
															: `${BASE_URL}${review.user_avatar}`
														: AVATAR
												})`,
											}}
										/>
										<div className={classes.userDetails}>
											<span className={classes.userName}>{review.user_name}</span>
											<div className={classes.ratingContainer}>
												<div className={classes.stars}>
													{renderStars(review.rating)}
												</div>
												<span className={classes.ratingValue}>
													{review.rating}
												</span>
											</div>
											<span className={classes.reviewDate}>
												{formatDate(review.created_at)}
											</span>
										</div>
									</div>
									<p className={classes.reviewText}>{review.text}</p>
								</div>
								<div className={classes.mediaContainer}>
									{Array.isArray(review.media_urls) &&
										review.media_urls.map((url) => (
											<div
												key={url}
												className={classes.mediaItem}
												onClick={() => handleMediaClick(url)}
											>
												{url.toLowerCase().endsWith(".mp4") ? (
													<video src={url} className={classes.mediaPreview} />
												) : (
													<img
														src={url}
														alt="Медиа к отзыву"
														className={classes.mediaPreview}
													/>
												)}
											</div>
										))}
								</div>
							</div>
						))}
					</div>
				)}
				{selectedMedia && (
					<div className={classes.modal} onClick={closeModal}>
						<div
							className={classes.modalContent}
							onClick={(e) => e.stopPropagation()}
						>
							{selectedMedia.toLowerCase().endsWith(".mp4") ||
							selectedMedia.toLowerCase().endsWith(".webm") ? (
								<video
									src={selectedMedia}
									className={classes.modalMedia}
									controls
									autoPlay
								/>
							) : (
								<img
									src={selectedMedia}
									alt="Медиа к отзыву"
									className={classes.modalMedia}
								/>
							)}
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default ReviewList;
