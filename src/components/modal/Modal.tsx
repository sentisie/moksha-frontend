import { FC, ReactNode } from "react";
import classes from "./Modal.module.scss";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import Overlay from "../../UI/overlay/Overlay";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
	useBodyScrollLock(isOpen);

	return (
		<Overlay
			onClick={onClose}
			style={{
				visibility: isOpen ? "visible" : "hidden",
				opacity: isOpen ? 1 : 0,
			}}
		>
			<div
				className={classes.modalContent}
				onClick={(e) => e.stopPropagation()}
				style={{
					transform: isOpen ? "scale(1)" : "scale(0.95)",
					opacity: isOpen ? 1 : 0,
				}}
			>
				<button className={classes.closeButton} onClick={onClose}>
					&times;
				</button>
				{children}
			</div>
		</Overlay>
	);
};

export default Modal;
