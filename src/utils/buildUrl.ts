export const buildUrl = (url: string, params: Record<string, string>) => {
	let urlWithParams = url;

	Object.entries(params).forEach(([key, value], index) => {
		const sign = !index ? "?" : "&";
		urlWithParams += `${sign}${key}=${value}`;
	});

	return urlWithParams;
};
