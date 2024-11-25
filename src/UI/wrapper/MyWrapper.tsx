import { CSSProperties, FC, MouseEvent, ReactNode } from "react";
import classes from "./MyWrapper.module.scss";

interface WrapperProps {
	className?: string;
	children: ReactNode;
	style?: CSSProperties;
	onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}
const MyWrapper: FC<WrapperProps> = ({
	children,
	className,
	style,
	onClick,
}) => {
	return (
		<section
			className={`${classes.myWrapper} ${className}`}
			style={style}
			onClick={onClick}
		>
			{children}
		</section>
	);
};

export default MyWrapper;
