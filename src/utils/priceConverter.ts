import { CurrencyRates } from "../types/types";

export const convertPrice = (
	priceInBaseCurrency: number,
	targetCurrency: string,
	rates: CurrencyRates | null
): number => {
	if (!rates) return Math.round(priceInBaseCurrency);

	if (targetCurrency === "RUB") return Math.round(priceInBaseCurrency);

	const rate = rates[targetCurrency];
	if (!rate) return Math.round(priceInBaseCurrency);

	return Math.round(priceInBaseCurrency / rate);
};
