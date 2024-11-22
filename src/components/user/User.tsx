import { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { toggleForm, toggleFormType } from "../../store/reducers/user/userSlice";
import UserSignUpForm from "./authorization/signup/UserSignUpForm";
import UserLoginForm from "./authorization/login/UserLoginForm";
import { LOGIN, SIGN_UP } from "../../utils/constants";

const User: FC = () => {
	const dispatch = useAppDispatch();

	const { showForm, formType } = useAppSelector((state) => state.userReducer);

	const handleCloseModal = () => {
		dispatch(toggleForm(false));
	};

	const toggleCurrentFormType = (type: string) => dispatch(toggleFormType(type));

	return (
		<>
			<UserSignUpForm
				formType={SIGN_UP}
				toggleCurrentFormType={toggleCurrentFormType}
					closeModal={handleCloseModal}
					isOpen={showForm && formType === SIGN_UP}
			/>

			<UserLoginForm
				formType={LOGIN}
				toggleCurrentFormType={toggleCurrentFormType}
				closeModal={handleCloseModal}
				isOpen={showForm && formType === LOGIN}
			/>
		</>
	);
};

export default User;
