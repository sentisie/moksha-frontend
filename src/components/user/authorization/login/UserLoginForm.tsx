import { FC, useState, ChangeEvent, FormEvent, MouseEvent } from "react";
import { LOGIN_VALUES } from "../../../../utils/constants";
import UserForm from "../UserForm";
import { loginUser } from "../../../../store/reducers/user/userActionCreator";
import { useAppDispatch } from "../../../../hooks/redux";
import Modal from "../../../modal/Modal";

interface LoginFormProps {
	closeModal: (event?: MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
	toggleCurrentFormType: (type: string) => void;
	formType: string;
	isOpen: boolean;
}

const UserLoginForm: FC<LoginFormProps> = ({
	formType,
	closeModal,
	toggleCurrentFormType,
	isOpen,
}) => {
	const [values, setValues] = useState(LOGIN_VALUES);

	const dispatch = useAppDispatch();

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setValues({ ...values, [name]: value });
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const isNotEmpty = Object.values(values).some((val) => val);

		if (!isNotEmpty) return;

		dispatch(loginUser(values));
		setValues(LOGIN_VALUES);
		closeModal();
	};

	return (
		<Modal isOpen={isOpen} onClose={closeModal}>
			<UserForm
				formType={formType}
				userValues={values}
				toggleType={toggleCurrentFormType}
				handleSubmit={handleSubmit}
				handleChange={handleChange}
				closeModal={closeModal}
			/>
		</Modal>
	);
};

export default UserLoginForm;
