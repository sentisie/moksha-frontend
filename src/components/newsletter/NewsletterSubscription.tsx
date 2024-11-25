import { FC, useState } from "react";
import classes from "./NewsletterSubscription.module.scss";
import MyInput from "../../UI/input/MyInput";
import MyButton from "../../UI/button/MyButton";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const NewsletterSubscription: FC = () => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email) {
			toast.error("Пожалуйста, введите email");
			return;
		}

		try {
			setIsLoading(true);
			await axios.post(`${BASE_URL}/subscribe`, { email });
			toast.success("Спасибо за подписку!");
			setEmail("");
		} catch (error) {
			toast.error("Ошибка при подписке. Попробуйте позже.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={classes.newsletter}>
			<div className={classes.content}>
				<h2 className={`${classes.title} h2-title`}>Выгода с доставкой</h2>
				<p className={classes.description}>
					Подпишитесь и получайте промокоды, акции и подборки товаров на свою
					почту.
				</p>
				<form onSubmit={handleSubmit} className={classes.form}>
					<MyInput
						type="email"
						placeholder="Введите e-mail"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className={classes.input}
					/>
					<MyButton
						type="submit"
						className={`${classes.button} main-btn`}
						disabled={isLoading}
					>
						{isLoading ? "Подписка..." : "Подписаться"}
					</MyButton>
				</form>
				<p className={classes.terms}>
					Нажимая «Подписаться» вы даёте{" "}
					<Link to="/privacy" className={classes.link}>
						согласие на обработку персональных данных
					</Link>{" "}
					в рекламных и маркетинговых целях
				</p>
			</div>
		</div>
	);
};

export default NewsletterSubscription;
