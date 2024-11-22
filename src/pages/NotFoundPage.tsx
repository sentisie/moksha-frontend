import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
	const navigate = useNavigate();
	const [countdown, setCountdown] = useState(5);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (countdown <= 1) {
				navigate("/home");
			} else {
				setCountdown(countdown - 1);
			}
		}, 1000);

		return () => clearTimeout(timer);
	}, [countdown, navigate]);

	return (
		<div style={{ textAlign: "center", marginBlock: "120px" }}>
			<h2 className="h2-title">404 - Страница не найдена</h2>
			<p>
				Вы будете перенаправлены на главную страницу через {countdown} секунд...
			</p>
		</div>
	);
};

export default NotFoundPage;
