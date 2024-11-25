import { IProduct } from "../types/types";

export const shuffle = (arr: IProduct[]) =>
	[...arr].sort(() => 0.5 - Math.random());
