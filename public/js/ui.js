document.addEventListener("DOMContentLoaded", () => {
	const selectedMode = getCookie("theme");
	if (selectedMode === "dark-mode") setDarkMode();
	else setLightMode();

	populateSearchFilters();

	if (isMobile) {
		document.querySelectorAll(".collapsable").forEach(item => {
			toggleCardContentVisibility(item);
		});
	}

	document.addEventListener("keydown", event => {
		const e = event || window.event;

		if (e.key === "Escape") {
			closeFilter();
		}
	});

	document.getElementById("themeToggle").addEventListener("click", () => {
		document.body.classList.toggle("dark-mode");
		document.body.classList.toggle("light-mode");
		const newMode = document.body.classList[0];
		setCookie("theme", newMode);
	});

	checkAllImages();
});

const setDarkMode = () => {
	document.body.classList.add("dark-mode");
	document.body.classList.remove("light-mode");
	document.body.setAttribute("style", "display: flex;");
};

const setLightMode = () => {
	document.body.classList.add("light-mode");
	document.body.classList.remove("dark-mode");
	document.body.setAttribute("style", "display: flex;");
};

const hideNotice = () => {
	document.getElementById("notice").setAttribute("hidden", "");
};

const submitSearch = () => {
	const urlNoParams = document.URL.split("?")[0];
	const queryParams = document.URL.split("?")[1];
	const targetRoute = urlNoParams.split("/")[urlNoParams.split("/").length - 2];
	const currentlySelectedId = urlNoParams.split("/")[urlNoParams.split("/").length - 1];

	if (queryParams) {
		const params = queryParams.split("&");
		const changedParams = [];

		let currentGame;
		let selectedGame;
		params.forEach(entry => {
			let currentSelection;
			let newSelection;

			if (entry.includes("term")) {
				currentSelection = entry.split("=")[1];
				newSelection = document.getElementById("searchBar").value;
			} else if (entry.includes("game")) {
				currentGame = entry.split("=")[1];
				selectedGame = document.getElementById("gameSelector").value;
			} else if (entry.includes("pokemon")) {
				currentSelection = entry.split("=")[1] == "true" ? true : false;
				newSelection = document.getElementById("showPokemon").checked;
			} else if (entry.includes("items")) {
				currentSelection = entry.split("=")[1] == "true" ? true : false;
				newSelection = document.getElementById("showItems").checked;
			} else if (entry.includes("moves")) {
				currentSelection = entry.split("=")[1] == "true" ? true : false;
				newSelection = document.getElementById("showMoves").checked;
			} else if (entry.includes("abilities")) {
				currentSelection = entry.split("=")[1] == "true" ? true : false;
				newSelection = document.getElementById("showAbilities").checked;
			}
			changedParams.push(currentSelection == newSelection);
		});
		if (!changedParams.includes(false)) {
			const search = document.getElementById("search");
			// If all you changed is the Game, then stay on the current page
			search.action = `/${targetRoute}/${currentlySelectedId}`;
		}
	}

	search.submit();
};

const isMobile = new RegExp("Android|Mobile|iPhone|iOS").test(navigator.userAgent);

const openFilter = () => {
	const modal = document.getElementById("filterModal");
	modal.classList.toggle("is-active");
};

const closeFilter = () => {
	const modal = document.getElementById("filterModal");
	modal.classList.remove("is-active");
	modal.classList.add("hidden");
};

const removeVarieties = () => {
	return window.location.search.replace(/\?variety=[0-9]*/g, "");
};

const populateSearchFilters = () => {
	const params = new URL(document.location).searchParams;

	document.getElementById("searchBar").value = params.get("term");

	const typeSelections = [];
	typeSelections.push(params.get("pokemon"));
	typeSelections.push(params.get("items"));
	typeSelections.push(params.get("moves"));
	typeSelections.push(params.get("abilities"));

	// Only de-select entries if they're not ALL (un)selected
	if (!typeSelections.every(item => item === typeSelections[0])) {
		if (!params.get("pokemon")) {
			document.getElementById("showPokemon").removeAttribute("checked");
		}
		if (!params.get("items")) {
			document.getElementById("showItems").removeAttribute("checked");
		}
		if (!params.get("moves")) {
			document.getElementById("showMoves").removeAttribute("checked");
		}
		if (!params.get("abilities")) {
			document.getElementById("showAbilities").removeAttribute("checked");
		}
	}

	if (params.get("game")) {
		const select = document.getElementById("gameSelector");
		// Select the option from the dropdown with the corresponding value
		for (let i = 0; i < select.options.length; i++) {
			if (select.options[i].value === params.get("game")) {
				select.options[i].selected = true;
			}
		}
	}

	if (params.get("pokemon") == "false") {
		document.getElementById("showPokemon").attributes.removeNamedItem("checked");
	}

	if (params.get("items") == "false") {
		document.getElementById("showItems").attributes.removeNamedItem("checked");
	}

	if (params.get("moves") == "false") {
		document.getElementById("showMoves").attributes.removeNamedItem("checked");
	}

	if (params.get("abilities") == "false") {
		document.getElementById("showAbilities").attributes.removeNamedItem("checked");
	}
};

const toggleCardContentVisibility = sender => {
	sender.parentElement.childNodes.forEach(child => {
		if (child.classList.contains("card-content")) {
			if (child.getAttribute("hidden") === null) child.setAttribute("hidden", "");
			else child.removeAttribute("hidden");
		}
	});
};

const checkAllImages = () => {
	const placeholder = document.getElementById("placeholder").innerHTML;
	const imgs = document.getElementsByTagName("img");
	for (let i = 0; i < imgs.length; i++) {
		imgs[i].onerror = () => (imgs[i].src = placeholder);
	}
};
