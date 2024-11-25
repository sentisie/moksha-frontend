import { FC, useState, useEffect } from "react";
import classes from "../Reviews.module.scss";
import { useAppSelector } from "../../../hooks/redux";
import axios from "axios";
import { BASE_URL } from "../../../utils/constants";
import { toast } from "react-toastify";
import {
	useAddReviewMutation,
	useGetReviewsQuery,
} from "../../../services/ReviewsServices";

interface ReviewFormProps {
	productId: number;
}

const MAX_FILES = 10;

const ReviewForm: FC<ReviewFormProps> = ({ productId }) => {
	const [text, setText] = useState("");
	const [rating, setRating] = useState(1);
	const [mediaFiles, setMediaFiles] = useState<File[]>([]);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);
	const [canReview, setCanReview] = useState(false);
	const [hasExistingReview, setHasExistingReview] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [addReview] = useAddReviewMutation();
	const { data: reviews } = useGetReviewsQuery(productId);
	const { curUser } = useAppSelector((state) => state.userReducer);

	useEffect(() => {
		const checkPurchaseStatus = async () => {
			if (!curUser) return;

			try {
				const response = await axios.get(
					`${BASE_URL}/products/${productId}/purchase-status`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);
				setCanReview(response.data.hasPurchased);
			} catch (error) {
				console.error("Ошибка при проверке статуса покупки:", error);
			}
		};

		checkPurchaseStatus();
	}, [productId, curUser]);

	useEffect(() => {
		if (!curUser || !reviews) return;

		const hasReview = reviews.some((review) => review.user_id === curUser.id);
		setHasExistingReview(hasReview);
	}, [productId, curUser, reviews]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);

		if (mediaFiles.length + files.length > MAX_FILES) {
			toast.warning(`Максимальное количество файлов: ${MAX_FILES}`);
			return;
		}

		setMediaFiles((prev) => [...prev, ...files]);

		files.forEach((file) => {
			const url = URL.createObjectURL(file);
			setPreviewUrls((prev) => [...prev, url]);
		});
	};

	const removeFile = (index: number) => {
		setMediaFiles((prev) => prev.filter((_, i) => i !== index));
		setPreviewUrls((prev) => prev.filter((_, i) => i !== index));

		const fileInput = document.querySelector(
			'input[type="file"]'
		) as HTMLInputElement;
		if (fileInput) {
			fileInput.value = "";
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!curUser) {
			toast.error("Пожалуйста, войдите в систему, чтобы оставить отзыв.", {
				theme: "dark",
			});
			return;
		}

		setIsSubmitting(true);

		const formData = new FormData();
		formData.append("text", text);
		formData.append("rating", rating.toString());

		mediaFiles.forEach((file) => {
			formData.append("mediaUrls", file);
		});

		try {
			await addReview({ productId, formData }).unwrap();
			setText("");
			setRating(1);
			setMediaFiles([]);
			setPreviewUrls([]);
			toast.success("Отзыв успешно добавлен");
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.error || "Ошибка при добавлении отзыва"
				);
				console.error("Ошибка при добавлении отзыва:", error);
			} else {
				toast.error("Неизвестная ошибка");
				console.error("Неизвестная ошибка:", error);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleRatingClick = (value: number) => {
		setRating(value);
	};

	const renderStars = () => {
		return Array.from({ length: 5 }, (_, index) => {
			const value = index + 1;
			const isActive = value <= rating;

			return (
				<span
					key={index}
					className={`${classes.star} ${isActive ? classes.active : ""}`}
					onClick={() => handleRatingClick(value)}
				>
					★
				</span>
			);
		});
	};

	const getFileCountInfo = () => {
		const imageCount = mediaFiles.filter((file) =>
			file.type.startsWith("image/")
		).length;
		const videoCount = mediaFiles.filter((file) =>
			file.type.startsWith("video/")
		).length;

		return (
			<div className={classes.fileCounter}>
				{imageCount > 0 && <span>Фото: {imageCount}</span>}
				{videoCount > 0 && <span>Видео: {videoCount}</span>}
				<span className={classes.totalFiles}>
					{mediaFiles.length}/{MAX_FILES}
				</span>
			</div>
		);
	};

	if (!curUser) {
		return (
			<>
				<div className="container">
					<p className={classes.warningMessage}>
						Авторизуйтесь, чтобы оставить отзыв
					</p>
				</div>
			</>
		);
	}

	if (!canReview && curUser) {
		return (
			<>
				<div className="container">
					<p className={classes.warningMessage}>
						Чтобы оставить отзыв, необходимо приобрести этот товар
					</p>
				</div>
			</>
		);
	}

	if (hasExistingReview) {
		return (
			<>
				<div className="container">
					<p className={classes.warningMessage}>
						Вы уже оставили отзыв на этот товар
					</p>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="container">
				<form onSubmit={handleSubmit} className={classes.reviewForm}>
					<textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Ваш отзыв"
						className={classes.textarea}
					/>
					<div className={classes.ratingSelect}>
						<div className={classes.ratingStars}>{renderStars()}</div>
					</div>
					<div className={classes.mediaUpload}>
						<div className={classes.uploadHeader}>
							<input
								type="file"
								multiple
								accept="image/*,video/*"
								onChange={handleFileChange}
								disabled={mediaFiles.length >= MAX_FILES}
							/>
							{mediaFiles.length > 0 && getFileCountInfo()}
						</div>
						<div className={classes.previewContainer}>
							{previewUrls.map((url, index) => (
								<div key={index} className={classes.previewItem}>
									{mediaFiles[index].type.startsWith("video/") ? (
										<video src={url} className={classes.preview} />
									) : (
										<img src={url} alt="Preview" className={classes.preview} />
									)}
									<button
										type="button"
										onClick={() => removeFile(index)}
										className={classes.removeButton}
									>
										✕
									</button>
								</div>
							))}
						</div>
						<hr />
					</div>
					<button
						type="submit"
						disabled={text.length === 0 || isSubmitting}
						className={classes.submitButton}
					>
						{isSubmitting ? "Отправка..." : "Отправить отзыв"}
					</button>
				</form>
			</div>
		</>
	);
};

export default ReviewForm;
