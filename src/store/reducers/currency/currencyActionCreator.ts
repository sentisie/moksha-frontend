import axios from "axios";
import { BASE_URL } from "../../../utils/constants";

export const fetchCurrencyRates = async () => {
	try {
		const response = await axios.get(`${BASE_URL}/currency-rates`);
		const rates = response.data?.Valute;

		if (!rates || !rates.KZT) {
			console.error("Некорректный формат данных курсов валют");
			return {
				RUB: 1,
				USD: 1,
				EUR: 1,
				CNY: 1,
				KZT: 1,
				BYN: 1,
				KGS: 1,
				AMD: 1,
				UZS: 1,
			};
		}

		return {
			RUB: 1,
			USD: rates.USD?.Value || 1,
			EUR: rates.EUR?.Value || 1,
			CNY: rates.CNY?.Value || 1,
			KZT: rates.KZT.Value / rates.KZT.Nominal,
			BYN: rates.BYN.Value,
			KGS: rates.KGS.Value / rates.KGS.Nominal,
			AMD: rates.AMD.Value / rates.AMD.Nominal,
			UZS: rates.UZS.Value / rates.UZS.Nominal,
		};
	} catch (error) {
		console.error("Ошибка при получении курсов валют:", error);
		return {
			RUB: 1,
			USD: 1,
			EUR: 1,
			CNY: 1,
			KZT: 1,
			BYN: 1,
			KGS: 1,
			AMD: 1,
			UZS: 1,
		};
	}
};
