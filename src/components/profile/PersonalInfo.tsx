import { FC, useState, useRef, useCallback, useEffect } from "react";
import classes from "./PersonalInfo.module.scss";
import { FaEdit, FaCamera, FaTrash } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
	updateProfile,
	updatePassword,
} from "../../store/reducers/user/userActionCreator";
import AVATAR from "/src/assets/icons/profile.svg";
import MyInput from "../../UI/input/MyInput";
import MyButton from "../../UI/button/MyButton";

interface PersonalInfoProps {
	personalInfo: {
		name: string;
		email: string;
		phone?: string;
		avatar?: string;
	};
}

const defaultPersonalInfo = {
	name: "",
	email: "",
	phone: "",
	avatar: "",
};

const PersonalInfo: FC<PersonalInfoProps> = () => {
	const dispatch = useAppDispatch();
	const { personalInfo } = useAppSelector(
		(state) =>
			state.userReducer.userProfile ?? { personalInfo: defaultPersonalInfo }
	);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewUrl, setPreviewUrl] = useState<string>(
		personalInfo.avatar || AVATAR
	);
	const [isEditingPassword, setIsEditingPassword] = useState(false);
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [isEditingInfo, setIsEditingInfo] = useState(false);
	const [editedInfo, setEditedInfo] = useState({
		name: personalInfo.name,
		email: personalInfo.email,
		phone: personalInfo.phone || "",
		avatarFile: null as File | null,
	});

	useEffect(() => {
		if (!isEditingInfo) {
			setEditedInfo({
				name: personalInfo.name,
				email: personalInfo.email,
				phone: personalInfo.phone || "",
				avatarFile: null,
			});
			setPreviewUrl(personalInfo.avatar || AVATAR);
		}
	}, [personalInfo, isEditingInfo]);

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleAvatarChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onloadend = () => {
					setPreviewUrl(reader.result as string);
					setEditedInfo((prevInfo) => ({ ...prevInfo, avatarFile: file }));
				};
				reader.readAsDataURL(file);
			}
		},
		[]
	);

	const handleAvatarDelete = () => {
		setPreviewUrl(AVATAR);
		setEditedInfo((prevInfo) => ({ ...prevInfo, avatarFile: null }));
	};

	const handlePasswordSubmit = () => {
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			alert("Пароли не совпадают");
			return;
		}
		dispatch(
			updatePassword({
				currentPassword: passwordData.currentPassword,
				newPassword: passwordData.newPassword,
			})
		);
		setIsEditingPassword(false);
		setPasswordData({
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
	};

	const handleInfoSubmit = () => {
		const formData = new FormData();
		formData.append("name", editedInfo.name);
		formData.append("email", editedInfo.email);
		formData.append("phone", editedInfo.phone);
		if (editedInfo.avatarFile) {
			formData.append("avatar", editedInfo.avatarFile);
		} else if (editedInfo.avatarFile === null && previewUrl === AVATAR) {
			formData.append("avatar", "");
		}
		dispatch(updateProfile(formData));
		setIsEditingInfo(false);
	};

	const handleInfoCancel = () => {
		setIsEditingInfo(false);
		setEditedInfo({
			name: personalInfo.name,
			email: personalInfo.email,
			phone: personalInfo.phone || "",
			avatarFile: null,
		});
		setPreviewUrl(personalInfo.avatar || AVATAR);
	};

	return (
		<div className={classes.personalInfo}>
			<div className={classes.avatarSection}>
				<div className={classes.avatarWrapper}>
					<div className={classes.avatarContainer}>
						<img
							src={previewUrl}
							alt="Аватар пользователя"
							className={classes.avatar}
						/>
						{isEditingInfo && (
							<div className={classes.avatarOverlay}>
								<button
									className={classes.avatarEdit}
									onClick={handleAvatarClick}
								>
									<FaCamera />
								</button>
								{personalInfo.avatar && (
									<button
										className={classes.avatarDelete}
										onClick={handleAvatarDelete}
									>
										<FaTrash />
									</button>
								)}
							</div>
						)}
					</div>
					{isEditingInfo && (
						<MyInput
							type="file"
							ref={fileInputRef}
							onChange={handleAvatarChange}
							accept="image/*"
							hidden
						/>
					)}
				</div>
			</div>

			<div className={classes.infoSection}>
				<div className={classes.infoItem}>
					<label>Имя:</label>
					{isEditingInfo ? (
						<MyInput
							type="text"
							value={editedInfo.name}
							onChange={(e) =>
								setEditedInfo({ ...editedInfo, name: e.target.value })
							}
						/>
					) : (
						<div className={classes.displayField}>
							<span>{personalInfo.name}</span>
						</div>
					)}
				</div>

				<div className={classes.infoItem}>
					<label>Email:</label>
					{isEditingInfo ? (
						<MyInput
							type="email"
							value={editedInfo.email}
							onChange={(e) =>
								setEditedInfo({ ...editedInfo, email: e.target.value })
							}
						/>
					) : (
						<div className={classes.displayField}>
							<span>{personalInfo.email}</span>
						</div>
					)}
				</div>

				<div className={classes.infoItem}>
					<label>Телефон:</label>
					{isEditingInfo ? (
						<MyInput
							type="tel"
							value={editedInfo.phone}
							onChange={(e) =>
								setEditedInfo({ ...editedInfo, phone: e.target.value })
							}
							placeholder="+7 (___) ___-__-__"
						/>
					) : (
						<div className={classes.displayField}>
							<span>{personalInfo.phone || "Не указан"}</span>
						</div>
					)}
				</div>

				{isEditingInfo ? (
					<div className={classes.buttons}>
						<MyButton onClick={handleInfoSubmit}>Сохранить</MyButton>
						<MyButton onClick={handleInfoCancel}>Отмена</MyButton>
					</div>
				) : (
					<MyButton
						className={classes.editInfo}
						onClick={() => setIsEditingInfo(true)}
					>
						<FaEdit /> Редактировать
					</MyButton>
				)}

				<div className={classes.infoItem}>
					<label>Пароль:</label>
					{isEditingPassword ? (
						<div className={classes.passwordEdit}>
							<MyInput
								type="password"
								placeholder="Текущий пароль"
								value={passwordData.currentPassword}
								onChange={(e) =>
									setPasswordData({
										...passwordData,
										currentPassword: e.target.value,
									})
								}
							/>
							<MyInput
								type="password"
								placeholder="Новый пароль"
								value={passwordData.newPassword}
								onChange={(e) =>
									setPasswordData({
										...passwordData,
										newPassword: e.target.value,
									})
								}
							/>
							<MyInput
								type="password"
								placeholder="Подтвердите новый пароль"
								value={passwordData.confirmPassword}
								onChange={(e) =>
									setPasswordData({
										...passwordData,
										confirmPassword: e.target.value,
									})
								}
							/>
							<MyButton onClick={handlePasswordSubmit}>Сохранить</MyButton>
							<MyButton onClick={() => setIsEditingPassword(false)}>
								Отмена
							</MyButton>
						</div>
					) : (
						<div className={classes.displayField}>
							<span>••••••••</span>
							<MyButton
								className={classes.editPassword}
								onClick={() => setIsEditingPassword(true)}
							>
								<FaEdit />
							</MyButton>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PersonalInfo;
