import { useMemo } from "react";

const getColorTranslation = (title: string, description: string) => {
	const titleWords = title.toLowerCase().split(" ");
	const descriptionWords = description.toLowerCase().split(" ");
	const allWords = [...titleWords, ...descriptionWords];

	for (const word of allWords) {
		switch (word) {
			case "красный":
			case "красная":
			case "красное":
			case "красные":
				return "Красный";
			case "оранжевый":
			case "оранжевая":
			case "оранжевое":
			case "оранжево":
			case "оранжевые":
				return "Оранжевый";
			case "синий":
			case "синяя":
			case "синее":
			case "синие":
				return "Синий";
			case "белый":
			case "белая":
			case "белое":
			case "белые":
				return "Белый";
			case "серый":
			case "серое":
			case "серая":
			case "серые":
				return "Серый";
			case "черный":
			case "черная":
			case "черное":
			case "черные":
				return "Черный";
			case "золотой":
			case "золотая":
			case "золотое":
			case "золото":
				return "Золотой";
			case "розовый":
			case "розовая":
			case "розовое":
			case "розовые":
				return "Розовый";
			case "серебряное":
			case "серебряный":
			case "серебряная":
			case "серебро":
				return "Серебро";
		}
	}

	return null;
};

const useColorTranslation = (title: string, description: string) => {
	const colorTranslation = useMemo(
		() => getColorTranslation(title, description),
		[title, description]
	);
	return colorTranslation;
};

export default useColorTranslation;
