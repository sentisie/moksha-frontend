import { FC, useState, ChangeEvent, FormEvent, MouseEvent } from "react";
import { SIGN_UP_VALUES } from "../../../../utils/constants";
import UserForm from "../UserForm";
import { createUser } from "../../../../store/reducers/user/userActionCreator";
import { useAppDispatch } from "../../../../hooks/redux";
import Modal from "../../../modal/Modal";

interface SignUpFormProps {
	closeModal: (event?: MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
	toggleCurrentFormType: (type: string) => void;
	formType: string;
	isOpen: boolean;
}

const UserSignUpForm: FC<SignUpFormProps> = ({
	formType,
	closeModal,
	toggleCurrentFormType,
	isOpen,
}) => {
	const [values, setValues] = useState(SIGN_UP_VALUES);

	const dispatch = useAppDispatch();

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setValues({ ...values, [name]: value });
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const isNotEmpty = Object.values(values).some((val) => val);

		if (!isNotEmpty) return;

		dispatch(createUser(values));
		setValues(SIGN_UP_VALUES);
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

export default UserSignUpForm;
