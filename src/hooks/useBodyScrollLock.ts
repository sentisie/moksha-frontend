import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import classes from "../components/header/Header.module.scss";

export const useBodyScrollLock = (isLocked: boolean) => {
	const isDesktop = useMediaQuery({ minWidth: 1280 });

	useEffect(() => {
		const wrapperElement = document.querySelector(
			`.${classes.wrapper}`
		) as HTMLElement | null;
		const isFixed = document.querySelector(`.${classes.fixed}`);

		if (isLocked && isDesktop) {
			document.body.style.overflow = "hidden";
			document.body.style.marginRight = "8px";
			if (isFixed && wrapperElement) wrapperElement.style.paddingRight = "8px";
		}

		return () => {
			document.body.style.overflow = "auto";
			document.body.style.marginRight = "0";
			if (wrapperElement) wrapperElement.style.paddingRight = "0";
		};
	}, [isLocked, isDesktop]);
};
