import { InputHTMLAttributes, forwardRef } from "react";
import classes from "./MyInput.module.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	validate?: (value: string | number) => string | null;
}

const MyInput = forwardRef<HTMLInputElement, InputProps>(
	({ className, ...props }, ref) => {
		return (
			<input
				{...props}
				className={`${classes.myInput} ${className}`}
				ref={ref}
			/>
		);
	}
);

export default MyInput;
