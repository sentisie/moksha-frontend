import { CSSProperties, FC, MouseEvent, ReactNode } from "react";
import classes from "./Overlay.module.scss";

interface OverlayProps {
	children?: ReactNode;
	className?: string;
	style?: CSSProperties;
	onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

const Overlay: FC<OverlayProps> = ({ children, className, style, onClick }) => {
	return (
		<div
			className={`${classes.overlay} ${className || ""}`}
			style={style}
			onClick={onClick}
		>
			{children}
		</div>
	);
};

export default Overlay;
