import { FC } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	onClick?: (event?: any) => void;
}

const MyButton: FC<ButtonProps> = ({ children, className, ...props }) => {
	return (
		<button {...props} className={`main-btn ${className}`}>
			{children}
		</button>
	);
};

export default MyButton;
