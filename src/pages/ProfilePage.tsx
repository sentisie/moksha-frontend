import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Profile from "../components/profile/Profile";
import { useAppSelector } from "../hooks/redux";
import Loader from "../UI/loaders/main-loader/Loader";

const ProfilePage: FC = () => {
	const navigate = useNavigate();
	const { curUser, isAuthChecked } = useAppSelector(
		(state) => state.userReducer
	);
	const [countdown, setCountdown] = useState(5);

	useEffect(() => {
		if (isAuthChecked && !curUser) {
			const timer = setInterval(() => {
				setCountdown((prevCountdown) => prevCountdown - 1);
			}, 1000);

			return () => clearInterval(timer);
		}
	}, [curUser, isAuthChecked]);

	useEffect(() => {
		if (countdown === 0 && !curUser) {
			navigate("/Home");
		}
	}, [countdown, navigate, curUser]);

	if (!isAuthChecked) {
		return (
			<div className="profile-page">
				<Loader />
			</div>
		);
	}

	if (!curUser) {
		return (
			<div style={{ paddingBlock: "120px" }}>
				<h2 className="h2-title" style={{ textAlign: "center" }}>
					Вы не авторизованы! 😢
				</h2>
				<p style={{ textAlign: "center", fontSize: "1.5rem" }}>
					Перенаправление произойдет через
					<span style={{ color: "orange" }}> {countdown} </span> секунд
				</p>
			</div>
		);
	}

	return (
		<div>
			<Profile />
		</div>
	);
};

export default ProfilePage;
