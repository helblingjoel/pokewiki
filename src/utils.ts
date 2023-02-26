import { appSettings } from "../api/app";
import { Sprites, Games, SpriteForm, GenericSprites } from "./types";

export default class Utils {
	static findNameFromLanguageCode = (
		iterable: { language: { name: string }; name: string }[],
		langCode: string,
		fallback?: string
	): string => {
		const entry = iterable.find(a => a.language.name === langCode);
		return entry ? entry.name : fallback ? fallback : "";
	};

	static getNamesFromGeneric = (
		iterable: { language: { name: string }; name: string }[]
	) => {
		let primaryName = this.findNameFromLanguageCode(
			iterable,
			appSettings.primaryLanguageCode
		);
		const secondaryName = this.findNameFromLanguageCode(
			iterable,
			appSettings.secondaryLanguageCode
		);

		if (
			!primaryName &&
			!secondaryName &&
			![appSettings.primaryLanguageCode, appSettings.secondaryLanguageCode].includes("en")
		) {
			primaryName = this.findNameFromLanguageCode(iterable, "en");
			if (!primaryName) primaryName = "No data";
		}

		return [primaryName, secondaryName];
	};

	static isEnglishSelected = (): boolean => {
		return [appSettings.primaryLanguageCode, appSettings.secondaryLanguageCode].includes(
			"en"
		);
	};

	static getPokemonSprite = (
		sprites: Sprites | SpriteForm,
		spriteType: "full" | "form",
		variation: "default" | "alternative",
		game: string = ""
	): GenericSprites => {
		if (spriteType === "full") sprites = sprites as Sprites;
		else {
			sprites = sprites as SpriteForm;
			if (variation === "default")
				return {
					primary: sprites.front_default
						? sprites.front_default
						: appSettings.placeholderImage,
					secondary: appSettings.placeholderImage,
					shiny: sprites.front_shiny ? sprites.front_shiny : appSettings.placeholderImage,
				};
			return {
				primary: sprites.front_female,
				secondary: appSettings.placeholderImage,
				shiny: sprites.front_shiny_female,
			};
		}

		const gameDetails = Games.findEntry(game);

		let primary = "";
		let secondary = "";
		let shiny = "";

		if (gameDetails.generation === "i" && (game === "red-blue" || game === "yellow")) {
			primary = sprites.versions[`generation-i`][`${game}`].front_gray;
			secondary = sprites.versions[`generation-i`][`${game}`].front_default;
		} else if (gameDetails.generation === "ii") {
			if (game === "crystal") {
				primary = sprites.versions["generation-ii"].crystal.front_transparent;
				secondary = sprites.versions["generation-ii"].crystal.front_shiny_transparent;
				shiny = sprites.versions["generation-ii"].crystal.front_shiny;
			} else {
				primary = sprites.versions["generation-ii"].gold.front_transparent;
				secondary = sprites.versions["generation-ii"].gold.front_transparent;
				shiny = sprites.versions["generation-ii"].gold.front_shiny;
			}
		} else if (
			gameDetails.generation === "iii" &&
			(game === "emerald" || game === "firered-leafgreen" || game === "ruby-sapphire")
		) {
			primary = sprites.versions[`generation-iii`][`${game}`].front_default;
			secondary = sprites.versions[`generation-iii`][`${game}`].front_shiny;
		} else if (
			gameDetails.generation === "iv" &&
			(game === "diamond-pearl" || game === "heartgold-soulsilver" || game === "platinum")
		) {
			primary = sprites.versions[`generation-iv`][`${game}`].front_default;
			secondary = sprites.versions[`generation-iv`][`${game}`].front_female;
			shiny = sprites.versions[`generation-iv`][`${game}`].front_shiny;
			if (!secondary) secondary = shiny;
		} else if (gameDetails.generation === "v") {
			primary = sprites.versions[`generation-v`][`black-white`].animated.front_default;
			secondary = sprites.versions[`generation-v`][`black-white`].animated.front_female;
			shiny = sprites.versions[`generation-v`][`black-white`].animated.front_shiny;
			if (!secondary) secondary = shiny;
		} else if (
			gameDetails.generation === "vi" &&
			(game === "omegaruby-alphasapphire" || game === "x-y")
		) {
			primary = sprites.versions[`generation-vi`][`${game}`].front_default;
			secondary = sprites.versions[`generation-vi`][`${game}`].front_female;
			shiny = sprites.versions[`generation-vi`][`${game}`].front_shiny;
			if (!secondary) secondary = shiny;
		} else if (gameDetails.generation === "vii") {
			primary = sprites.versions[`generation-vii`][`ultra-sun-ultra-moon`].front_default;
			secondary = sprites.versions[`generation-vii`][`ultra-sun-ultra-moon`].front_female;
			shiny = sprites.versions[`generation-vii`][`ultra-sun-ultra-moon`].front_shiny;
			if (!secondary) secondary = shiny;
		} else {
			/*
        Okay, Gen 7 sprites might look awful, and I'm keeping that for consistency, but Icons is where I draw the line
        Better off to wait until actual sprites have come out (if that'll ever happen)

        
        else if (gameDetails.generation === "viii") {
			primary = sprites.versions[`generation-viii`][`icons`].front_default;
			secondary = sprites.versions[`generation-viii`][`icons`].front_female;
			shiny = sprites.versions[`generation-viii`][`icons`].front_default;
			if (!secondary) secondary = shiny;
		} 
        */
			primary = sprites.front_default;
			secondary = sprites.back_default ? sprites.back_default : sprites.front_shiny;
			shiny = sprites.front_shiny;
		}

		if (!primary) primary = sprites.front_default;
		if (!secondary)
			secondary = sprites.back_default ? sprites.back_default : sprites.front_shiny;
		if (!shiny) shiny = sprites.front_shiny;

		return {
			primary: primary ? primary : appSettings.placeholderImage,
			secondary: secondary ? secondary : appSettings.placeholderImage,
			shiny: shiny ? shiny : appSettings.placeholderImage,
		};
	};

	static daysPassedInYear = (): number => {
		const date = new Date();
		const days =
			new Date(
				date.getTime() - new Date(`${date.getFullYear()}-01-01`).getTime()
			).valueOf() /
			(1000 * 3600 * 24);
		return Math.floor(days);
	};

	static randomDailyNumber = (maxNumber: number): number[] => {
		const arr: number[] = [];
		for (let i = 1; i <= maxNumber; i++) arr.push(i);

		const randomNumbers: number[] = [];
		for (let i = 0; i < maxNumber; i++) {
			if (i % 2 === 0) randomNumbers.push(i);
			else randomNumbers.unshift(i);
		}

		const shuffle = (arr: number[]): number[] => {
			let currentIndex = arr.length,
				randomIndex;

			while (currentIndex != 0) {
				randomIndex = Math.floor(randomNumbers[currentIndex]);
				currentIndex--;

				[arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
			}

			return arr;
		};

		return shuffle(arr);
	};
}
