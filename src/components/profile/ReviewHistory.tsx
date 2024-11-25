import { FC } from "react";
import { Link } from "react-router-dom";
import classes from "./ReviewHistory.module.scss";
import { IReview, IPendingReview } from "../../types/types";

interface ReviewHistoryProps {
  submitted: IReview[];
  pending: IPendingReview[];
}

const ReviewHistory: FC<ReviewHistoryProps> = ({ submitted, pending }) => {
    const eligiblePending = pending.filter(item => item.can_review);

    return (
        <div className={classes.reviewHistory}>
            <div className={classes.submittedReviews}>
                <h3>Оставленные отзывы</h3>
                {submitted.length === 0 ? (
                    <p className={classes.emptyMessage}>
                        Вы еще не оставили ни одного отзыва
                    </p>
                ) : (
                    <div className={classes.reviewsList}>
                        {submitted.map((review) => (
                            <div key={review.id} className={classes.reviewCard}>
                                <div className={classes.reviewHeader}>
                                    <span>Заказ №{review.order_id}</span>
                                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                    <span>Оценка: {review.rating}/5</span>
                                </div>
                                <div className={classes.productInfo}>
                                </div>
                                <p className={classes.reviewText}>{review.text}</p>
                                {Array.isArray(review.media_urls) && review.media_urls.length > 0 && (
                                    <div className={classes.reviewImages}>
                                        {review.media_urls.map((image, index) => (
                                            <img 
                                                key={index} 
                                                src={image} 
                                                alt={`Отзыв ${index + 1}`} 
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={classes.pendingReviews}>
                <h3>Товары для отзыва</h3>
                {eligiblePending.length === 0 ? (
                    <p className={classes.emptyMessage}>
                        Нет товаров, ожидающих отзыва
                    </p>
                ) : (
                    <div className={classes.pendingList}>
                        {eligiblePending.map((item) => (
                            <div key={item.product_id} className={classes.pendingCard}>
                                <img
                                    src={item.product_image}
                                    alt={item.product_title}
                                    className={classes.productImage}
                                />
                                <div className={classes.pendingInfo}>
                                    <h4>{item.product_title}</h4>
                                    <p>
                                        Куплено:{" "}
                                        {new Date(item.purchase_date).toLocaleDateString()}
                                    </p>
                                    <Link
                                        to={`/products/${item.product_id}`}
                                        className={`main-btn ${classes.reviewLink}`}
                                    >
                                        Оставить отзыв
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewHistory;