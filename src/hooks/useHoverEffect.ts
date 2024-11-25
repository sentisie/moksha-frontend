import { RefObject, useEffect } from "react";

const useHoverEffect = (
	buttonRef: RefObject<HTMLButtonElement>,
	formRef: RefObject<HTMLFormElement>
) => {
	useEffect(() => {
		const button = buttonRef.current;
		const form = formRef.current;

		const handleMouseEnter = () => {
			if (form && button) {
				form.style.backgroundColor = "var(--hover-accent-color)";
				button.style.backgroundColor = "var(--hover-accent-color)";
			}
		};

		const handleMouseLeave = () => {
			if (form && button) {
				form.style.backgroundColor = "var(--secondary-accent-color)";
				button.style.backgroundColor = "var(--secondary-accent-color)";
			}
		};

		const handleMouseDown = () => {
			if (form && button) {
				form.style.backgroundColor = "var(--hover-accent-color)";
				button.style.backgroundColor = "var(--hover-accent-color)";
			}
		};

		const handleMouseUp = () => {
			if (form && button) {
				form.style.backgroundColor = "var(--hover-accent-color)";
				button.style.backgroundColor = "var(--hover-accent-color)";
			}
		};

		button?.addEventListener("mouseenter", handleMouseEnter);
		button?.addEventListener("mouseleave", handleMouseLeave);
		button?.addEventListener("mousedown", handleMouseDown);
		button?.addEventListener("mouseup", handleMouseUp);

		return () => {
			button?.removeEventListener("mouseenter", handleMouseEnter);
			button?.removeEventListener("mouseleave", handleMouseLeave);
			button?.removeEventListener("mousedown", handleMouseDown);
			button?.removeEventListener("mouseup", handleMouseUp);
		};
	}, [buttonRef, formRef]);
};

export default useHoverEffect;
