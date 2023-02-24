import express from "express";
import Router from "../src/router";
import { ErrorMessage } from "../src/types";
import fs from "fs";
import cookieParser from "cookie-parser";
import log from "../src/log";

export let port = 443;
export let host = "https://pokemon.helbling.uk";

// Settings for when app is not deployed
if (process.env.NODE_ENV !== "production") {
	port = 3000;
	host = "http://127.0.0.1";
}

const app = express();

app.set("view engine", "pug");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const selfFileExtension = __filename.split(".")[__filename.split(".").length - 1];

if (selfFileExtension === "js" && process.env.NODE_ENV !== "production") {
	app.use("/static", express.static(`${__dirname}/../../public`));
	app.set("views", `${__dirname}/../../views`);
} else {
	app.use("/static", express.static(`${__dirname}/../public`));
	app.set("views", `${__dirname}/../views`);
}

const buildType =
	process.env.NODE_ENV === "production"
		? process.env.VERCEL_ENV === "production"
			? "Build"
			: "Development"
		: "Local";

const buildInfo =
	buildType === "Local"
		? fs.statSync(`./api/app.${selfFileExtension}`).ctime.toISOString().split("T")[0]
		: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 6);

if (buildType === "Build") {
	log.setDefaultLevel("INFO");
} else {
	log.setDefaultLevel("DEBUG");
}

export const appSettings = {
	primaryLanguageCode: "",
	secondaryLanguageCode: "",
	game: "all",
	maxSearchResults: 100,
	buildDetails: [buildType, buildInfo].join(" - "),
	buildDate: buildInfo,
	highestPokedexId: 1008,
	highestItemId: 2050,
	highestMoveId: 918,
	highestAbilityId: 298,
	extraAbilityRange: [10001, 10060],
	placeholderImage:
		"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png",
};

app.use((req, res, next) => {
	log.info(`${req.ip} requesting ${req.url} with cookies ${JSON.stringify(req.cookies)}`);
	next();
});

export const handleServerError = (req: any, details: ErrorMessage, res: any) => {
	log.error(details.error, details.info, req);
	res.status(500).render("./error", {
		error: details.error,
		info: "Details about your request have been logged.",
		...appSettings,
	});
};

const setCookies = (req: express.Request) => {
	appSettings.primaryLanguageCode = req.cookies.primaryLanguage
		? req.cookies.primaryLanguage
		: "en";
	appSettings.secondaryLanguageCode = req.cookies.secondaryLanguage
		? req.cookies.secondaryLanguage
		: "de";
	appSettings.game = req.cookies.game ? req.cookies.game : "all";
};

app.get("/", (req, res, next) => {
	setCookies(req);
	Router.getRoot(req, res);
});

app.options("/*", (req, res) => {
	const allowedURLs = [
		"https://pokemon.helbling.uk",
		"https://www.pokemon.helbling.uk",
		"https://dev.pokemon.helbling.uk",
		"https://www.dev.pokemon.helbling.uk",
	];

	if (allowedURLs.includes(req.headers.origin ? req.headers.origin : "no")) {
		res.set("Access-Control-Allow-Origin", req.headers.origin);
		res.set("Vary", "Origin");
		log.debug("Allowed CORS request from", req.headers.origin);
		res.sendStatus(200);
		return;
	}
	log.debug("Blocked CORS request from", req.headers.origin);
	res.sendStatus(401);
});

app.all("/", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/about", (req, res, next) => {
	setCookies(req);
	res.render("./about", {
		...appSettings,
	});
});

app.all("/about", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/search", (req, res, next) => {
	setCookies(req);
	try {
		const start = new Date();
		Router.getSearch(req, res);
		log.info(`Performance ${new Date().valueOf() - start.valueOf()}ms: Search`);
	} catch (err: any) {
		handleServerError(req, { error: "Internal Server Error", info: err }, res);
	}
});
app.all("/search", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/pokemon/*", (req, res, next) => {
	setCookies(req);
	try {
		const start = new Date();
		Router.getPokemon(req, res);
		log.info(`Performance ${new Date().valueOf() - start.valueOf()}ms: Pokemon`);
	} catch (err: any) {
		handleServerError(req, { error: "Internal Server Error", info: err }, res);
	}
});

app.all("/pokemon/*", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/item/*", (req, res, next) => {
	setCookies(req);
	try {
		const start = new Date();
		Router.getItem(req, res);
		log.info(`Performance ${new Date().valueOf() - start.valueOf()}ms: Item`);
	} catch (err: any) {
		handleServerError(req, { error: "Internal Server Error", info: err }, res);
	}
});
app.all("/item/*", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/move/*", (req, res, next) => {
	setCookies(req);
	try {
		const start = new Date();
		Router.getMove(req, res);
		log.info(`Performance ${new Date().valueOf() - start.valueOf()}ms: Move`);
	} catch (err: any) {
		handleServerError(req, { error: "Internal Server Error", info: err }, res);
	}
});
app.all("/move/*", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/ability/*", (req, res, next) => {
	setCookies(req);
	try {
		const start = new Date();
		Router.getAbility(req, res);
		log.info(`Performance ${new Date().valueOf() - start.valueOf()}ms: Ability`);
	} catch (err: any) {
		handleServerError(req, { error: "Internal Server Error", info: err }, res);
	}
});

app.all("/ability/*", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.all("/*", (req, res) => {
	setCookies(req);
	res.status(404).render("error", {
		error: "Page does not exist",
		info: "The page you are trying to access does not exist.",
	});
});

app.listen(port, "0.0.0.0", () => {
	log.info(`Listening on ${host}:${port}`);
});

export default app;
