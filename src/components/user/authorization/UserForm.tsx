import { ChangeEventHandler, FC, FormEventHandler, MouseEvent } from "react";
import MyWrapper from "../../../UI/wrapper/MyWrapper";
import classes from "./UserForm.module.scss";
import MyInput from "../../../UI/input/MyInput";
import MyButton from "../../../UI/button/MyButton";
import { LOGIN, SIGN_UP, UPDATE } from "../../../utils/constants";
import { useAppDispatch } from "../../../hooks/redux";
import { logoutUser } from "../../../store/reducers/user/userSlice";
import { resetFavorites } from "../../../store/reducers/favorites/favoritesSlice";

interface UserFormProps {
	formType: string;
	userValues: { [key: string]: string };
	initialValues?: { [key: string]: string };
	handleSubmit: FormEventHandler<HTMLFormElement>;
	handleChange: ChangeEventHandler<HTMLInputElement>;
	toggleType?: (type: string) => void;
	closeModal?: (event?: MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
}

const UserForm: FC<UserFormProps> = ({
	formType,
	userValues,
	handleSubmit,
	handleChange,
	toggleType,
}) => {
	const dispatch = useAppDispatch();

	const handleLogout = () => {
		dispatch(logoutUser());
		dispatch(resetFavorites());
	};

	const isDisabled = !(
		(formType === SIGN_UP ? userValues.name : true) &&
		userValues.email &&
		userValues.password
	);
	return (
		<MyWrapper
			className={classes.modal}
			style={formType === UPDATE ? { width: "100%" } : {}}
		>
			<h2 className={`${classes.title} h2-title`}>
				{formType === SIGN_UP
					? "Регистрация"
					: formType === LOGIN
					? "Авторизация"
					: "Профиль"}
			</h2>

			<form action="#" className={classes.form} onSubmit={handleSubmit}>
				{formType !== LOGIN && (
					<div className={classes.group}>
						<MyInput
							type="name"
							placeholder="Ваше имя"
							name="name"
							value={userValues.name}
							onChange={handleChange}
							required
						/>
					</div>
				)}

				<div className={classes.group}>
					<MyInput
						type="email"
						placeholder="Почта"
						name="email"
						value={userValues.email}
						onChange={handleChange}
						required
					/>
				</div>

				<div className={classes.group}>
					<MyInput
						type="password"
						placeholder="Пароль"
						name="password"
						value={userValues.password}
						onChange={handleChange}
						required
					/>
				</div>

				{toggleType && (
					<div
						className={classes.link}
						onClick={() => toggleType(formType === SIGN_UP ? LOGIN : SIGN_UP)}
					>
						{formType === SIGN_UP
							? "У меня уже есть аккаунт"
							: "Создать аккаунт"}
					</div>
				)}

				<MyButton
					type="submit"
					className={classes.submit}
					disabled={isDisabled}
				>
					{formType === SIGN_UP
						? "Создать"
						: formType === LOGIN
						? "Войти"
						: "Обновить данные"}
				</MyButton>

				{formType === UPDATE && (
					<MyButton className={classes.logout} onClick={handleLogout}>
						Logout
					</MyButton>
				)}
			</form>
		</MyWrapper>
	);
};

export default UserForm;
