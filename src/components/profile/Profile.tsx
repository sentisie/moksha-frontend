import { FC, useEffect, useState } from "react";
import classes from "./Profile.module.scss";
import { getUserProfile } from "../../store/reducers/user/userActionCreator";
import PersonalInfo from "./PersonalInfo";
import PurchaseHistory from "./PurchaseHistory";
import ReviewHistory from "./ReviewHistory";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { logoutUser } from "../../store/reducers/user/userSlice";
import MyButton from "../../UI/button/MyButton";
import Loader from "../../UI/loaders/main-loader/Loader";

type TabType = "personal" | "purchases" | "reviews";

const Profile: FC = () => {
	const [activeTab, setActiveTab] = useState<TabType>("personal");
	const dispatch = useAppDispatch();
	const { userProfile, isUserLoading } = useAppSelector(
		(state) => state.userReducer
	);

	useEffect(() => {
		dispatch(getUserProfile());
	}, [dispatch]);

	const handleLogout = () => {
		dispatch(logoutUser());
	};

	if (isUserLoading) {
		return (
			<div className="container">
				<Loader />
			</div>
		);
	}

	if (!userProfile) {
		return <div>Профиль не найден</div>;
	}

	return (
		<div className={classes.profile}>
			<div className={classes.header}>
				<h2 className={`h2-title ${classes.title}`}>Профиль пользователя</h2>
				<MyButton className={classes.logoutButton} onClick={handleLogout}>
					Выйти
				</MyButton>
			</div>
			<div className={classes.tabs}>
				<button
					className={`${classes.tab} ${
						activeTab === "personal" ? classes.active : ""
					}`}
					onClick={() => setActiveTab("personal")}
				>
					Личные данные
				</button>
				<button
					className={`${classes.tab} ${
						activeTab === "purchases" ? classes.active : ""
					}`}
					onClick={() => setActiveTab("purchases")}
				>
					История покупок
				</button>
				<button
					className={`${classes.tab} ${
						activeTab === "reviews" ? classes.active : ""
					}`}
					onClick={() => setActiveTab("reviews")}
				>
					История отзывов
				</button>
			</div>

			<div className={classes.content}>
				{activeTab === "personal" && (
					<PersonalInfo personalInfo={userProfile.personalInfo} />
				)}
				{activeTab === "purchases" && (
					<PurchaseHistory purchases={userProfile.purchaseHistory} />
				)}
				{activeTab === "reviews" && (
					<ReviewHistory
						submitted={userProfile.reviewHistory.submitted}
						pending={userProfile.reviewHistory.pending}
					/>
				)}
			</div>
		</div>
	);
};

export default Profile;
