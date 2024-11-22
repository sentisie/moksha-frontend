import { MutableRefObject, useEffect, useRef } from "react";

type ObserverCallback = (
	entries: IntersectionObserverEntry[],
	observer: IntersectionObserver
) => void;

export const useObserver = (
	ref: MutableRefObject<HTMLElement | null>,
	canLoad: boolean,
	isLoading: boolean,
	callback: () => void
) => {
	const observer = useRef<IntersectionObserver>();
	useEffect(() => {
		const observeElement = ref.current;
		if (!observeElement || isLoading) return;
		const cb: ObserverCallback = function (entries) {
			if (entries[0].isIntersecting && canLoad) {
				callback();
			}	
		};
		if (observer.current) observer.current.disconnect();
		observer.current = new IntersectionObserver(cb);

		if (observeElement instanceof HTMLElement) {
			observer.current.observe(observeElement);
		}

		return () => {
			if (observer.current) observer.current.disconnect();
		};
	}, [isLoading, ref, canLoad, callback]);
};
