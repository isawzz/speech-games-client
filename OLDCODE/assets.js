//#region globals
const SHOW_SERVER_ROUTE = false; // true | false
const SHOW_SERVER_RETURN = false; // true | false
const EMOFONTLIST = ['emoOpen', 'openmoBlack', 'segoe ui emoji', 'segoe ui symbol'];

var vidCache, allGames, playerConfig, c52, cinno, testCards; //session data
var defaultSpec, userSpec, userCode, serverData, prevServerData, tupleGroups, boats; //new game data

var symbolDict, symbolKeys, symbolList; //gibt es immer
var svgDict, svgKeys, svgList; //?

//the following are only produced lazily! (see ensure)
// byType hat keys: emo, icon, eduplo, iduplo!!!
var symByType, symBySet;//hier sind info dicts
var symKeysByType, symKeysBySet;//hier sind key lists (dict by key)
var symListByType, symListBySet;//hier sind info lists (dict by key)
var svgDict, svgKeys, svgList; //?

var BestKeysD, BestKeysE, BestKeySets;
//var CorrectKeysByLanguage,CorrectByKey;
//var CorrectWords, CorrectWordsExact, CorrectWordsCorrect, CorrectWordsFailed; //dep!

var symKeysByGroupSub;

//var cachedInfolists = {};

//#endregion

//#region color constants
const LIGHTGREEN = '#afff45'; //'#bfef45';
const LIGHTBLUE = '#42d4f4';
const YELLOW = '#ffe119';
const RED = '#e6194B';
const GREEN = '#3cb44b';
const BLUE = '#4363d8';
const PURPLE = '#911eb4';
const YELLOW2 = '#ffa0a0';
const TEAL = '#469990';
const ORANGE = '#f58231';
const FIREBRICK = '#800000';
const OLIVE = '#808000';

const ColorList = ['lightgreen', 'lightblue', 'yellow', 'red', 'green', 'blue', 'purple', 'violet', 'lightyellow',
	'teal', 'orange', 'brown', 'olive', 'deepskyblue', 'deeppink', 'gold', 'black', 'white', 'grey'];
const ColorDict = {
	lightgreen: { c: LIGHTGREEN, E: 'lightgreen', D: 'hellgrün' },
	lightblue: { c: LIGHTBLUE, E: 'lightblue', D: 'hellblau' },
	yellow: { c: 'yellow', E: 'yellow', D: 'gelb' },
	red: { c: 'red', E: 'red', D: 'rot' },
	green: { c: 'green', E: 'green', D: 'grün' },
	blue: { c: 'blue', E: 'blue', D: 'blau' },
	yellow1: { c: YELLOW, E: 'yellow', D: 'gelb' },
	red1: { c: RED, E: 'red', D: 'rot' },
	green1: { c: GREEN, E: 'green', D: 'grün' },
	blue1: { c: BLUE, E: 'blue', D: 'blau' },
	purple: { c: PURPLE, E: 'purple', D: 'lila' },
	violet: { c: 'indigo', E: 'violet', D: 'violett' },
	lightyellow: { c: YELLOW2, E: 'lightyellow', D: 'gelb' },
	teal: { c: TEAL, E: 'teal', D: 'blaugrün' },
	orange: { c: ORANGE, E: 'orange', D: 'orange' },
	brown: { c: FIREBRICK, E: 'brown', D: 'rotbraun' },
	olive: { c: OLIVE, E: 'olive', D: 'oliv' },
	skyblue: { c: 'deepskyblue', E: 'skyblue', D: 'himmelblau' },
	pink: { c: 'deeppink', E: 'pink', D: 'rosa' },
	gold: { c: 'gold', E: 'gold', D: 'golden' },
	black: { c: 'black', E: 'black', D: 'schwarz' },
	white: { c: 'white', E: 'white', D: 'weiss' },
	grey: { c: 'grey', E: 'grey', D: 'grau' },
};


//#endregion

//#region audio
var _audioSources = {
	incorrect1: '../assets/sounds/incorrect1.wav',
	incorrect3: '../assets/sounds/incorrect3.mp3',
	goodBye: "../assets/sounds/level1.wav",
	down: "../assets/sounds/down.mp3",
	levelComplete: "../assets/sounds/sound1.wav",
	rubberBand: "../assets/sounds/sound2.wav",
	hit: "../assets/sounds/hit.wav",
};
// var _SND = null;
var TOSound, _sndPlayer, _loaded = false, _qSound, _idleSound = true, _sndCounter = 0;
function playSound(key, wait = true) {
	//console.log(getFunctionsNameThatCalledThisFunction(),'=> playSound');
	//console.log('_______playSound', 'key', key, '_sndPlayer', _sndPlayer, '\nIdle', _idleSound, 'loaded', _loaded, 'count:' + _sndCounter);
	if (!wait) _qSound = [];
	_enqSound(key);
	if (_idleSound) { _idleSound = false; _deqSound(); }
}
function pauseSound() {
	_qSound = [];
	if (_loaded && isdef(_sndPlayer)) {
		clearTimeout(TOSound);
		_sndPlayer.onended = null;
		_sndPlayer.onpause = whenSoundPaused;
		_sndPlayer.pause();
	}
}
function whenSoundPaused() {
	_sndPlayer = null;
	_sndPlayerIdle = true;
	_loaded = false;
	//console.log('ENDED!!! Idle=true loaded=false');
	if (!isEmpty(_qSound)) { _deqSound(); } else { _idleSound = true; }
}
function _enqSound(key) { if (nundef(_qSound)) _qSound = []; _qSound.push(key); }
function _deqSound() {
	let key = _qSound.shift();
	let url = _audioSources[key];
	_sndPlayer = new Audio(url);
	_sndPlayer.onended = whenSoundPaused;
	_sndPlayer.onloadeddata = () => { _loaded = true; _sndPlayer.play(); };
	_sndPlayer.load();
}
//#endregion audio

//#region emoSets_

//var selectedEmoSetNames = ['animal', 'body', 'drink', 'emotion', 'food', 'fruit', 'game', 'gesture', 'hand', 'kitchen', 'object', 'person', 'place', 'plant', 'sports', 'time', 'transport', 'vegetable'];
var selectedEmoSetNames = ['all', 'animal', 'body', 'drink', 'emotion', 'food', 'fruit', 'game', 'gesture', 'kitchen', 'object', 'person', 'place', 'plant', 'sports', 'time', 'transport', 'vegetable'];

var primitiveSetNames = ['all', 'activity', 'animal', 'body', 'drink',
	'emotion', 'family', 'fantasy', 'food', 'fruit', 'game', 'gesture',
	'kitchen', 'object', 'place', 'plant', 'person',
	'role', 'shapes', 'sport', 'sports',
	'time', 'transport', 'vegetable',

	'toolbar', 'math', 'punctuation', 'misc'];

var higherOrderEmoSetNames = {
	animals: ['animal'],
	animalplantfood: ['animal', 'plant', 'drink', 'food', 'fruit', 'vegetable'],
	life: ['animal', 'plant', 'drink', 'food', 'fruit', 'vegetable', 'kitchen', 'game', 'sport'],
	more: ['animal', 'plant', 'drink', 'food', 'fruit', 'kitchen', 'vegetable', 'game', 'sport', 'transport', 'object'],
	// nosymbols: ['animal', 'plant', 'drink', 'food', 'fruit', 'kitchen', 'vegetable', 'game', 'sport', 'transport', 'object',
	// 	'activity','body','emotion','fantasy'],
};
var higherOrderEmoSetNames1 = { all: ['all'], select: selectedEmoSetNames, abstract: ['time', 'symbols'], action: ['game', 'sports'], food: ['drink', 'food', 'fruit', 'kitchen', 'vegetable'], human: ['body', 'gesture', 'emotion', 'person', 'role'], life: ['animal', 'plant'], mood: ['emotion'], object: ['object'], places: ['place', 'transport'] };

var emoSets = {
	nosymbols: { name: 'nosymbols', f: o => o.group != 'symbols' && o.group != 'flags' && o.group != 'clock' },
	nosymemo: { name: 'nosymemo', f: o => o.group != 'smileys-emotion' && o.group != 'symbols' && o.group != 'flags' && o.group != 'clock' },

	all: { name: 'all', f: _ => true },
	activity: { name: 'activity', f: o => o.group == 'people-body' && (o.subgroups == 'person-activity' || o.subgroups == 'person-resting') },
	animal: { name: 'animal', f: o => startsWith(o.group, 'animal') && startsWith(o.subgroups, 'animal') },
	body: { name: 'body', f: o => o.group == 'people-body' && o.subgroups == 'body-parts' },
	clock: { name: 'clock', f: o => o.group == 'clock' },
	drink: { name: 'drink', f: o => o.group == 'food-drink' && o.subgroups == 'drink' },
	emotion: { name: 'emotion', f: o => o.group == 'smileys-emotion' },
	family: { name: 'family', f: o => o.group == 'people-body' && o.subgroups == 'family' },
	fantasy: { name: 'fantasy', f: o => o.group == 'people-body' && o.subgroups == 'person-fantasy' },
	food: { name: 'food', f: o => o.group == 'food-drink' && startsWith(o.subgroups, 'food') },
	fruit: { name: 'fruit', f: o => o.group == 'food-drink' && o.subgroups == 'food-fruit' },
	game: { name: 'game', f: o => (o.group == 'activities' && o.subgroups == 'game') },
	gesture: { name: 'gesture', f: o => o.group == 'people-body' && (o.subgroups == 'person-gesture' || o.subgroups.includes('hand')) },
	kitchen: { name: 'kitchen', f: o => o.group == 'food-drink' && o.subgroups == 'dishware' },
	math: { name: 'math', f: o => o.group == 'symbols' && o.subgroups == 'math' },
	misc: { name: 'misc', f: o => o.group == 'symbols' && o.subgroups == 'other-symbol' },
	// gesture: { name: 'gesture', f: o => o.group == 'people-body' && o.subgroups == 'person-gesture' },
	// hand: { name: 'hand', f: o => o.group == 'people-body' && o.subgroups.includes('hand') },
	//o=>o.group == 'people-body' && o.subgroups.includes('role'),
	//objects:
	object: {
		name: 'object', f: o =>
			(o.group == 'food-drink' && o.subgroups == 'dishware')
			|| (o.group == 'travel-places' && o.subgroups == 'time')
			|| (o.group == 'activities' && o.subgroups == 'event')
			|| (o.group == 'activities' && o.subgroups == 'award-medal')
			|| (o.group == 'activities' && o.subgroups == 'arts-crafts')
			|| (o.group == 'activities' && o.subgroups == 'sport')
			|| (o.group == 'activities' && o.subgroups == 'game')
			|| (o.group == 'objects')
			|| (o.group == 'activities' && o.subgroups == 'event')
			|| (o.group == 'travel-places' && o.subgroups == 'sky-weather')
	},

	person: { name: 'person', f: o => o.group == 'people-body' && o.subgroups == 'person' },
	place: { name: 'place', f: o => startsWith(o.subgroups, 'place') },
	plant: { name: 'plant', f: o => startsWith(o.group, 'animal') && startsWith(o.subgroups, 'plant') },
	punctuation: { name: 'punctuation', f: o => o.group == 'symbols' && o.subgroups == 'punctuation' },
	role: { name: 'role', f: o => o.group == 'people-body' && o.subgroups == 'person-role' },
	shapes: { name: 'shapes', f: o => o.group == 'symbols' && o.subgroups == 'geometric' },
	sport: { name: 'sport', f: o => o.group == 'people-body' && o.subgroups == 'person-sport' },
	sports: { name: 'sports', f: o => (o.group == 'activities' && o.subgroups == 'sport') },
	sternzeichen: { name: 'sternzeichen', f: o => o.group == 'symbols' && o.subgroups == 'zodiac' },
	symbols: { name: 'symbols', f: o => o.group == 'symbols' },
	time: { name: 'time', f: o => (o.group == 'travel-places' && o.subgroups == 'time') },
	//toolbar buttons:
	toolbar: {
		name: 'toolbar', f: o => (o.group == 'symbols' && o.subgroups == 'warning')
			|| (o.group == 'symbols' && o.subgroups == 'arrow')
			|| (o.group == 'symbols' && o.subgroups == 'av-symbol')
			|| (o.group == 'symbols' && o.subgroups == 'other-symbol')
			|| (o.group == 'symbols' && o.subgroups == 'keycap')
	},

	transport: { name: 'transport', f: o => startsWith(o.subgroups, 'transport') && o.subgroups != 'transport-sign' },
	vegetable: { name: 'vegetable', f: o => o.group == 'food-drink' && o.subgroups == 'food-vegetable' },



};
//var emoGroupKeys; //ACHTUNG!!!! SPEECH wird nicht mehr gehen!!!!!!!!!

function isEmosetMember(name, info) { return emoSets[name].f(info); }
function makeEmoSetIndex() {
	if (isdef(symBySet)) return;

	symBySet = {}; symKeysBySet = {}; symListBySet = {};
	for (const k in emoSets) {
		let set = emoSets[k];
		let name = set.name;
		let f = set.f;
		symBySet[name] = [];
		for (const k1 in symbolDict) {
			let info = symbolDict[k1];
			if (info.type == 'icon') continue;
			let o = info;
			if (nundef(o.group) || nundef(o.subgroups)) continue;
			let passt = f(o);
			if (!passt) continue;
			if (passt) {
				//if (k=='role') console.log(k,k1);
				lookupSet(symBySet, [name, k1], info);
				lookupAddToList(symKeysBySet, [name], k1);
				lookupAddToList(symListBySet, [name], info);
			}
		}
	}
	makeGroupSub();
}
function makeGroupSub() {
	symKeysByGroupSub = {};
	for (const k of symKeysBySet['all']) {
		let info = symbolDict[k];
		if (isEmpty(info.E) || isEmpty(info.D)) lookupAddIfToList(symKeysByGroupSub, ['NA', info.group + '-' + info.subgroups], k);
		else lookupAddIfToList(symKeysByGroupSub, [info.group, info.subgroups], k);
	}
	//console.log(symKeysByGroupSub);
}


//#endregion

//#region ensure
function ensureAssets(set = true, type = true, hex = false, svg = false) {
	if (set) ensureSymBySet();
	if (type) ensureSymByType();
	if (hex) ensureSymByHex();
	if (svg) ensureSvgDict();
}
async function ensureAllAssets() { ensureAllAssets(true, true, true, true); }
function ensureSymBySet() { if (nundef(symBySet)) { makeEmoSetIndex(); } }
function ensureSymByType() {
	if (nundef(symByType)) {
		//console.log('doing it ONCE only!')
		symByType = { emo: {}, eduplo: {}, icon: {}, iduplo: {} };
		symKeysByType = { emo: [], eduplo: [], icon: [], iduplo: [] };
		symListByType = { emo: [], eduplo: [], icon: [], iduplo: [] };
		for (const k in symbolDict) {
			let info = symbolDict[k];
			if (info.type == 'emo' && info.isDuplicate) { symByType.eduplo[k] = info; symListByType.eduplo.push(info); symKeysByType.eduplo.push(k); }
			else if (info.type == 'icon' && info.isDuplicate) { symByType.iduplo[k] = info; symListByType.iduplo.push(info); symKeysByType.iduplo.push(k); }
			else if (info.type == 'emo') { symByType.emo[k] = info; symListByType.emo.push(info); symKeysByType.emo.push(k); }
			else if (info.type == 'icon') { symByType.icon[k] = info; symListByType.icon.push(info); symKeysByType.icon.push(k); }
		}
	}

}
function ensureSymByHex() {
	if (nundef(symByHex)) {
		//console.log('doing it ONCE only!')
		symByHex = {};
		symKeysByHex = [];
		for (const k in symbolDict) {
			let info = symbolDict[k];
			symByHex[info.hexcode] = info;
		}
		symKeysByHex = Object.keys(symByHex);
	}

}
async function ensureSvgDict() {
	if (nundef(svgDict)) {
		svgDictC = await vidCache.load('svgDict', route_svgDict, true, false);
		svgDict = vidCache.asDict('svgDict');
		svgKeys = Object.keys(svgDict);
		svgList = dict2list(svgDict);
	}
}
//#endregion

//symbolDict helpers
function saveSymbolDict() {
	//console.log(symbolDict_)
	let y = jsonToYaml(symbolDict);

	downloadTextFile(y, 'symbolDict', 'yaml');
}

//#region API: loadAssets, loadSpec_ (also merges), loadCode (also activates), loadInitialServerData
async function loadAssets() {

	vidCache = new LazyCache(!USE_LOCAL_STORAGE);
	testCardsC = await vidCache.load('testCards', async () => await route_rsg_asset('testCards', 'yaml'));
	testCards = vidCache.asDict('testCards');
	c52C = await vidCache.load('c52', route_c52);
	c52 = vidCache.asDict('c52');

	//einfach nur symbolDict laden als symbolDict
	symbolDictC = await vidCache.load('symbolDict', route_symbolDict);
	symbolDict = vidCache.asDict('symbolDict');
	symbolKeys = Object.keys(symbolDict);
	symbolList = dict2list(symbolDict);


}
async function loadGameInfo(useAllGamesStub = true) {
	if (useAllGamesStub) {
		allGames = {
			ttt: {
				name: 'TicTacToe',
				long_name: 'Tic-Tac-Toe',
				short_name: 'ttt',
				num_players: [2],
				player_names: ['Player1', 'Player2'],
			},
			s1: {
				name: 's1',
				long_name: 's1',
				short_name: 's1',
				num_players: [2, 3, 4, 5],
				player_names: ['Player1', 'Player2', 'Player3', 'Player4', 'Player5'],
			},
			starter: {
				name: 'Starter',
				long_name: 'Starter',
				short_name: 'starter',
				num_players: [2],
				player_names: ['Player1', 'Player2'],
			},
			catan: {
				name: 'Catan',
				long_name: 'The Settlers of Catan',
				short_name: 'catan',
				num_players: [3, 4],
				player_names: ['White', 'Red', 'Blue', 'Orange'],
			},
			aristocracy: {
				name: 'Aristocracy',
				long_name: 'Aristocracy',
				short_name: 'aristocracy',
				num_players: [2, 3, 4, 5],
				player_names: ['Player1', 'Player2', 'Player3', 'Player4', 'Player5'],
			}

		};

	} else {
		allGamesC = await vidCache.load('allGames', route_allGames);
		allGames = vidCache.asDict('allGames');
	}

	////console.log('allGames', GAME, allGames[GAME]);
	playerConfig = stubPlayerConfig(allGames); //stub to get player info
	// //console.log('playerConfig', playerConfig[GAME]);
	// //console.log('testCards', testCards['green2']);
	// //console.log('c52', c52['card_2C']);
	// //console.log('icons', iconChars.crow);
	// //console.log('allGames', allGames.catan);
	// //console.log(vidCache);
}
async function loadSpec(path) {
	if (TESTING) {

		let url = DSPEC_PATH + '.yaml';
		defaultSpecC = await vidCache.load('defaultSpec', async () => await route_path_yaml_dict(url), true, false);// last 2 params: reload, useLocal

		url = (isdef(path) ? path : SPEC_PATH) + '.yaml';
		if (USE_NON_TESTING_DATA) url = '/games/' + GAME + '/_rsg/' + GAME + VERSION + '.yaml';
		userSpecC = await vidCache.load('userSpec', async () => await route_test_userSpec(url), true, false);// last 2 params: reload, useLocal

	} else {

		url = DSPEC_PATH + '.yaml';
		//url = TEST_PATH + 'defaultSpec' + DSPEC_VERSION + '.yaml'; //always the same default spec!
		defaultSpecC = await vidCache.load('defaultSpec', async () => await route_path_yaml_dict(url), !CACHE_DEFAULTSPEC, CACHE_DEFAULTSPEC);// last 2 params: reload, useLocal

		userSpecC = await vidCache.load('userSpec', async () => await route_userSpec(GAME, GAME + VERSION), !CACHE_USERSPEC, CACHE_USERSPEC);// last 2 params: reload, useLocal

	}

	defaultSpec = vidCache.asDict('defaultSpec');
	userSpec = vidCache.asDict('userSpec');

	//merge default and userSpec
	SPEC = deepmerge(defaultSpec, userSpec);//, { arrayMerge: overwriteMerge });
	DEFS = SPEC.defaults;
	delete SPEC.defaults;

	//need to correct areas because it should NOT be merged!!!
	if (userSpec.layout_alias) { SPEC.areas = userSpec.layout_alias; }
	if (userSpec.areas) { SPEC.areas = userSpec.areas; }
	delete SPEC.layout_alias;
	delete SPEC.asText;

}
async function loadCode() {
	// let url = TEST_PATH + GAME + '/code' + CODE_VERSION + '.js';
	if (TESTING && !CODE_VERSION) return;

	let url = TESTING && !USE_NON_TESTING_DATA ? TEST_PATH + GAME + '/code' + CODE_VERSION + '.js'
		: '/games/' + GAME + '/_rsg/' + GAME + VERSION + '.js';

	let loader = new ScriptLoader();
	await loader.load(SERVER + url);

	if (TESTING) userCodeC = await vidCache.load('userCode', async () => await route_path_asText_dict(url), true, false);// last 2 params: reload, useLocal
	else userCodeC = await vidCache.load('userCode', async () => await route_userCode(GAME, GAME + VERSION), !CACHE_CODE, CACHE_CODE); // last 2 params: reload, useLocal

	userCode = vidCache.asDict('userCode');

	// document.getElementById('code').innerHTML = '<pre>"' + userCode.asText + '"</pre>'; //PERFECT!!!!!!!!!!
	let d = mBy('OLDCODE');
	if (d && SHOW_CODE) { d.innerHTML = '<pre>' + userCode.asText + '</pre>'; }
	//else //console.log('OLDCODE',userCode.asText);

	//testingHallo('hallo das geht wirklich!!!!!');
}
async function loadTestServerData(url) {
	let initial = 'testServerData';
	serverDataC = initialDataC[GAME] = await vidCache.load(initial, async () => await route_path_yaml_dict(url), true, false); // last 2 params: reload, useLocal
	serverData = vidCache.asDict(initial);
	return serverData;
}
async function loadInitialServerData(unameStarts) {
	let initialPath = GAME + (USE_MAX_PLAYER_NUM ? '_max' : '');

	_syncUsernameOfSender(unameStarts);

	if (TESTING) {
		let url = SERVERDATA_PATH + '.yaml'; //console.log('loading',url)
		serverDataC = initialDataC[GAME] = await vidCache.load('_initial_' + initialPath, async () => await route_path_yaml_dict(url), true, false); // last 2 params: reload, useLocal
	} else {
		serverDataC = initialDataC[GAME] = await vidCache.load('_initial_' + initialPath, async () => await route_initGame(GAME, playerConfig[GAME], Username), !CACHE_INITDATA, CACHE_INITDATA); // last 2 params: reload, useLocal 
	}

	serverData = vidCache.asDict('_initial_' + initialPath);
	return serverData;
}
async function sendStatus(username) {
	_syncUsernameOfSender(username);
	if (!TESTING) serverData = await route_status(Username);
}
async function sendRestart(username) {
	_syncUsernameOfSender(username);
	if (TESTING) serverData = await loadInitialServerData(Username);
	else serverData = await route_begin_status(Username);
}
async function sendAction(boat, username) {
	if (TESTING) {
		modifyServerDataRandom(username);
	} else {
		_syncUsernameOfSender(username);
		if (nundef(boat)) boat = chooseRandom(boats);
		let route = '/action/' + Username + '/' + serverData.key + '/' + boat.desc + '/';
		let t = boat.tuple;
		//console.log('tuple is:', t);
		route += t.map(x => _pickStringForAction(x)).join('+');// /action/felix/91b7584a2265b1f5/loc-settlement/96
		//console.log('sending action...', route);
		let result = await route_server_js(route);
		//console.log('server returned', result);
		prevServerData = serverData;
		serverData = result;
	}
}
async function loadBestKeys() {

	BestKeySets = await loadYamlDict('/assets/speech/keysets.yaml');
	BestKeysD = await loadYamlDict('/assets/speech/bestKeysD.yaml');
	BestKeysE = await loadYamlDict('/assets/speech/bestKeysE.yaml');

	for (const e of BestKeysD) {
		let info = symbolDict[e.k];
		info.bestD = e.r;
		info.bestDConf = e.c;
	}
	for (const e of BestKeysE) {
		let info = symbolDict[e.k];
		info.bestE = e.r;
		info.bestEConf = e.c;
	}
	// console.log(BestKeySets.best100);
	for (const setname in BestKeySets) {
		for (const k of BestKeySets[setname]) {
			let info = symbolDict[k];
			if (nundef(info.bestE)) info.bestE = lastOfLanguage(k, 'E');
			if (nundef(info.bestD)) info.bestD = lastOfLanguage(k, 'D');
			//console.log(info)
			info[setname] = { E: info.bestE, D: info.bestD };
		}
	}
	// for(const k of BestKeySets.best50){
	// 	let info = symbolDict[k];
	// 	console.log(info)
	// 	info.best50E=lastOfLanguage(k,'E');
	// }
}
async function loadCorrectWords() {
	CorrectKeysByLanguage = { E: [], EB: [], D: [] };
	CorrectByKey = {};
	//assume zira


	let speechZira = await loadYamlDict('/assets/speech/speechZira.yaml');
	for (const k in speechZira) {
		let e = lookup(speechZira, [k, 'E', 'zira']);
		if (e && e.correct) {
			let c = Math.round(e.conf * 100);
			lookupSet(CorrectByKey, [k, 'E'], { r: e.req, c: c });
			addIf(CorrectKeysByLanguage.E, k);
		}
	}
	let speechBritish = await loadYamlDict('/assets/speech/speechBritish.yaml');
	for (const k in speechBritish) {
		let e = lookup(speechBritish, [k, 'E', 'ukMale']);
		if (e && e.correct) {
			let c = Math.round(e.conf * 100);
			lookupSet(CorrectByKey, [k, 'EB'], { r: e.req, c: c });
			addIf(CorrectKeysByLanguage.EB, k);
		}
	}
	let speechDeutsch = await loadYamlDict('/assets/speech/speechDeutsch.yaml');
	for (const k in speechDeutsch) {
		let e = lookup(speechDeutsch, [k, 'D', 'deutsch']);
		if (e && e.correct) {
			let c = Math.round(e.conf * 100);
			lookupSet(CorrectByKey, [k, 'D'], { r: e.req, c: c });
			addIf(CorrectKeysByLanguage.D, k);
		}
	}

	//console.log(Object.keys(speechZira),Object.keys(speechDeutsch));
	//console.log(CorrectByKey, CorrectKeysByLanguage.E);
}
async function loadCorrectWords_dep() {
	CorrectWords = await loadYamlDict('/assets/correctWordsX.yaml');

	CorrectWordsCorrect = { E: {}, D: {} };
	CorrectWordsExact = { E: {}, D: {} };
	CorrectWordsFailed = { E: {}, D: {} };

	//remove duplicates from array
	if (isdef(CorrectWords) && isdef(CorrectWords.data)) {
		for (const cwentry of CorrectWords.data) {
			let key = cwentry.key;
			for (const lang of ['E', 'D']) {
				let cw = cwentry[lang];
				// console.log(cw);
				if (cw.isCorrect) {
					if (cw.answer == cw.req && !(cw.danger == true)) CorrectWordsExact[lang][key] = cw;
					else CorrectWordsCorrect[lang][key] = cw;
				} else CorrectWordsFailed[lang][key] = cw;
			}
		}
	}


	//console.log('CorrectWordsExact',CorrectWordsExact);
	//console.log('CorrectWordsCorrect',CorrectWordsCorrect);
	//console.log('CorrectWordsFailed',CorrectWordsFailed);

}
async function loadYamlDict(url) { return await route_path_yaml_dict(url); }
async function loadJsonDict(url) { return await route_path_json_dict(url); }
// serverData helpers
//ACHTUNG!!! die player obj_types sind variable!!!
function preProcessData(data) {
	//console.log('preprocess:',data.players, 'plidSentStatus',plidSentStatus);
	if (nundef(data)) data = serverData;
	for (const plid in data.players) {
		let pl = data.players[plid];
		if (isdef(pl.obj_type)) continue; //**** ACHTUNG!!!!!!!!! */
		pl.obj_type = plid == plidSentStatus ? 'GamePlayer' : 'opponent';
	}
	if (data.options) {
		tupleGroups = getTupleGroups();
		let iGroup = 0;
		let iTuple = 0;
		boats = [];
		for (const tg of tupleGroups) {
			for (const t of tg.tuples) {
				let boatInfo = { obj_type: 'boat', oids: [], desc: tg.desc, tuple: t, iGroup: iGroup, iTuple: iTuple, text: t.map(x => x.val), weg: false };
				boats[iTuple] = boatInfo;
				iTuple += 1;
			}
			iGroup += 1;
		}
	} else {
		tupleGroups = null;
		boats = [];
	}
}
function modifyServerDataRandom(username) {
	//this should ONLY modify serverData
	_syncUsernameOfSender(username);
	prevServerData = jsCopy(serverData);

	let ranks = ['2', '3', '4', 'Q', 'J', 'T', 'A', '9'];

	let dModify = serverData.table ? serverData.table : serverData;
	//console.log('dModify', dModify)
	let keys = Object.keys(dModify);
	//console.log('keys', keys);
	let nChange = randomNumber(1, keys.length);
	shuffle(keys);
	console.log('>>>change', nChange, 'items!')

	for (let i = 0; i < nChange; i++) {
		let id = keys[i];
		let val = dModify[id];
		if (isLiteral(val)) dModify[id] = { id: id, value: val };
		// console.log('change rank of id', id);
		dModify[id].rank = chooseRandom(ranks);
		// console.log(dModify[id])
	}

}
function showServerData(data, domid = 'SERVERDATA') {
	let d = mBy(domid);
	if (d && SHOW_SERVERDATA) { d.innerHTML = '<pre>' + jsonToYaml(data) + '</pre>'; }
	//else consOutput('serverData',data);
}
function showPackages(data, domid = 'OLDCODE') {
	let d = mBy(domid);
	if (d) { d.innerHTML = '<pre>' + jsonToYaml(data) + '</pre>'; }
	//else consOutput('serverData',data);
}

//#region _internal
// serverData / server helpers
function _syncUsernameOfSender(username) {
	if (nundef(username)) username = Username; else Username = username;
	plidSentStatus = getPlidForUsername(username);
	//console.log('------------------', username, Username, plidSentStatus);

}


// playerConfig (stub)
function setGamePlayer(username) {
	Username = username;
	GAMEPLID = firstCondDict(playerConfig[GAME].players, p => p.username == username);

}
function stubPlayerConfig(gameInfo) {
	//automatically set a player configuration when starting in game view
	gcs = {};
	for (const gName in gameInfo) {
		let info = gameInfo[gName]
		////console.log(gName, info);
		let nPlayers = info.num_players[0]; // min player number, info.num_players.length - 1]; // max player number
		if (USE_MAX_PLAYER_NUM) nPlayers = info.num_players[info.num_players.length - 1]; // max player number
		let pls = {};
		for (let i = 0; i < nPlayers; i++) {
			let id = info.player_names[i];
			pls[id] = { id: id, playerType: 'me', agentType: null, username: Username + (i > 0 ? i : ''), index: i };
			////console.log('player:', pl)
			// pls.push(pl);
		}
		gcs[gName] = { numPlayers: nPlayers, players: pls };

	}
	return gcs;
	////console.log('-------------------',gcs);
}
function updatePlayerConfig() {
	let keysPlayerColors = Object.keys(PLAYER_COLORS);
	//let players = playerConfig[GAME].players;

	//match colors to better colors!
	let iColor = 0;
	for (const id in serverData.players) {
		let pl = serverData.players[id];
		let colorName = isdef(pl.color) ? pl.color : keysPlayerColors[iColor];
		colorName = colorName.toLowerCase();
		let altName = capitalize(colorName);
		let color = isdef(PLAYER_COLORS[colorName]) ? PLAYER_COLORS[colorName] : colorName;


		playerConfig[GAME].players[id].color = color;
		//playerConfig[id].color = color;
		// playerConfig[id].altName = altName;
		// playerConfig[id].index = i;
		iColor += 1;
	}
}

// routes
async function route_allGames() {
	let gameNames = await route_server_js('/game/available');
	//console.log('gamenames returned:', gameNames)
	let res = {};
	for (const name of gameNames) {
		//console.log(name);
		if (USE_ALL_GAMES_ROUTE) {
			res[name] = await route_server_js('/game/info/' + name);
		} else {
			let url = '/games/' + name + '/info.yaml';
			res[name] = await route_path_yaml_dict(url);// last 2 params: reload, useLocal
			//console.log('game info', name, res[name]);
		}
	}
	return res;
}
async function route_c52() {
	return await route_rsg_asset('c52_blackBorder', 'yaml');
}
async function route_symbolDict(filename = 'symbolDict') {
	//console.log('fetch symbolDict!!!')
	let url = '/assets/' + filename + '.yaml';
	let response = await route_path_yaml_dict(url); //TODO: depending on ext, treat other assts as well!
	return response;

}
async function route_svgDict(filename = 'svgDict') {
	let url = '/assets/' + filename + '.yaml';
	let response = await route_path_yaml_dict(url); //TODO: depending on ext, treat other assts as well!
	return response;

}
async function route_userSpec(game, fname) {
	try {
		let url = '/spec/' + game + (isdef(fname) ? '/' + fname : '');
		//let url = '/spec/' + GAME + (isdef(fname) ? '/' + fname : '');
		let text = await route_server_text(url);
		let spec = jsyaml.load(text);
		spec.asText = text;
		return spec;
	} catch (error) {
		return { asText: '' }; //empty spec!
	}
}
async function route_test_userSpec(url) {
	try {
		let text = await route_path_text(url);
		let spec = jsyaml.load(text);
		spec.asText = text;
		return spec;
	} catch (error) {
		return { asText: '' }; //empty spec!
	}
}
async function route_userCode(game, fname) {
	try {
		//let codePath = '/games/' + game + '/_rsg/' + fname + '.js';
		let url = '/RSG/' + game + (isdef(fname) ? '/' + fname : '');
		let text = await route_server_text(url);

		return { asText: text };
	} catch (error) { return {}; }

}
async function route_initGame(game, gc, username, seed = SEED) {
	await fetch_wrapper(SERVER + '/restart');
	await fetch_wrapper(SERVER + '/game/select/' + game);
	let nPlayers = gc.numPlayers;
	////console.log(gc)
	// for (let i = 0; i < nPlayers; i++) {
	for (plid in gc.players) {
		let plInfo = gc.players[plid];
		let isAI = plInfo.agentType !== null;
		if (isAI) {
			await postData(SERVER + '/add/client/agent/' + plInfo.username, { agent_type: plInfo.agentType, timeout: null });
		}
		await fetch_wrapper(SERVER + '/add/player/' + plInfo.username + '/' + plInfo);
	}
	return await route_begin_status(username, seed);
}
async function route_begin_status(username, seed = SEED) {
	await fetch_wrapper(SERVER + '/begin/' + seed);
	let data = await route_status(username);
	////console.log(data)
	return data;
}
async function route_status(username) { return await route_server_js('/status/' + username); }
async function route_rsg_asset(filename, ext = 'yml') {
	let url = '/assets/' + filename + '.' + ext;
	let response = await route_path_yaml_dict(url); //TODO: depending on ext, treat other assts as well!
	return response;
}
async function route_rsg_raw_asset(filename, ext = 'yml') {
	let url = '/assets/raw/' + filename + '.' + ext;
	let response = await route_path_yaml_dict(url); //TODO: depending on ext, treat other assts as well!
	return response;
}
async function route_server_js(url) {
	let data = await fetch_wrapper(SERVER + url);
	return await data.json();
}
async function route_server_text(url) {
	////console.log(url, SERVER + url)
	let data = await fetch_wrapper(SERVER + url);
	let text = await data.text();
	return text;
}
async function route_path_yaml_dict(url) {
	let data = await fetch_wrapper(url);
	let text = await data.text();
	let dict = jsyaml.load(text);
	return dict;
}
async function route_path_json_dict(url) {
	let data = await fetch_wrapper(url);
	let json = await data.json();
	//let dict = jsyaml.load(text);
	return json;
}
async function route_path_text(url) {
	let data = await fetch_wrapper(url);
	return await data.text();
}
async function route_path_asText_dict(url) {
	let data = await fetch_wrapper(url);
	let res = {};
	res.asText = await data.text();
	////console.log(res.asText)
	//res.asDict = JSON.parse(res.asText);//
	return res; // await data.text();
}
async function postData(url = '', data = {}) {
	//usage: postData('https://example.com/answer', { answer: 42 })

	// Default options are marked with *
	const response = await fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json'
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *client
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
	return await response.json(); // parses JSON response into native JavaScript objects
}
async function route_server(url) { await fetch_wrapper(SERVER + url); }

var route_counter = 0;
async function fetch_wrapper_NO(url) {
	route_counter += 1;
	if (SHOW_SERVER_ROUTE) consOutput(route_counter + ': route:' + url);
	let res = await fetch(url).then((response) => {
		if (response.status === 200) {
			if (SHOW_SERVER_RETURN) consOutput(route_counter + ': return:', response);
			//return response;
			// return response.json();
		} else {
			throw new Error('Something went wrong');
			//return "ERROR";
		}
	}).catch((error) => {
		console.log(error)
	});
	return res;
	// .then((responseJson) => {
	// 	// Do something with the response
	// })
	// .catch((error) => {
	// 	console.log(error)
	// });
}
async function fetch_wrapper(url) {
	route_counter += 1;
	if (SHOW_SERVER_ROUTE) consOutput(route_counter + ': route:' + url);
	let res = await fetch(url);
	if (SHOW_SERVER_RETURN) consOutput(route_counter + ': return:', res);
	return res;
	// try {
	// 	let res = await fetch(url);
	// 	if (SHOW_SERVER_RETURN) consOutput(route_counter + ': return:', res);
	// 	return res;

	// } catch (err) {
	// 	console.log('FETCH ERROR:', err)
	// 	return {};
	// }
}

// caches & consts: playerColors, THEMES, iTHEME
var allGamesC = null;
var playerConfigC = null;
var iconCharsC = null;
var symbolDictC = null;
var svgDictC = null;
var emoCharsC = null;
var c52C = null;
var testCardsC = null
var defaultSpecC = null;
var userSpecC = null;
var userCodeC = null;
var initialDataC = {}; //mostly for testing
var serverDataC = null;

const playerColors = {
	red: '#D01013',
	blue: '#003399',
	green: '#58A813',
	orange: '#FF6600',
	yellow: '#FAD302',
	violet: '#55038C',
	pink: '#ED527A',
	beige: '#D99559',
	sky: '#049DD9',
	brown: '#A65F46',
	white: '#FFFFFF',
};
const THEMES = ['#c9af98', '#2F4F4F', '#6B7A8F', '#00303F', 'rgb(3, 74, 166)', '#458766', '#7A9D96'];
var iTHEME = 0;

// tupleGroups
function getTupleGroups() {
	let act = serverData.options;

	//console.log('options', act)
	// json_str = JSON.stringify(act);
	// saveFile("yourfilename.json", "data:application/json", new Blob([json_str], { type: "" }));

	let tupleGroups = [];
	for (const desc in act) {
		let tg = { desc: desc, tuples: [] };
		//let tuples = expand99(act[desc].actions);
		let tuples = expand1_99(act[desc].actions);
		////console.log('*** ', desc, '........tuples:', tuples);

		if (tuples.length == 1 && !isList(tuples[0])) tuples = [tuples];
		////console.log(tuples)
		tg.tuples = tuples;
		tupleGroups.push({ desc: desc, tuples: tuples });
	}
	////console.log('tupleGroups', tupleGroups);
	return tupleGroups;
}
function expand1_99(x) {
	////console.log('expand1_99 input', tsRec(x))
	////console.log('expand1_99');
	if (isList(x)) {
		//console.log('expand1_99: x should be dict BUT is a list', x);
	}
	if (isDict(x)) { // TODO:  || isList(x)) {
		// if (isList(x)) {
		// 	//console.log('process: list',x)
		// }
		if ('_set' in x) {
			////console.log('handleSet wird aufgerufen')
			return handleSet(x._set);
		} else if ('_tuple' in x) {
			////console.log('handleTuple wird aufgerufen')
			return handleTuple(x._tuple);
		} else if ('type' in x) {
			return handleAction(x);
		} else { error('IMPOSSIBLE OBJECT', x); return null; }
	} else { error('IMPOSSIBLE TYPE', x); return null; }
}
function handleSet(x) {
	let irgend = x.map(expand1_99);
	let res = stripSet(irgend);
	return res;
}
function handleTuple(x) {
	let irgend = x.map(expand1_99);
	return multiCartesi(...irgend);
}
function handleAction(x) {
	return [[x]];
}
function isActionElement(x) {
	return typeof x == 'object' && 'type' in x;
}
function isListOfListOfActions(x) {
	return isList(x) && x.length > 0 && isList(x[0]) && x[0].length > 0 && isActionElement(x[0][0]);
}
function cartesi(l1, l2) {
	//l1,l2 are lists of list
	let res = [];
	for (var el1 of l1) {
		for (var el2 of l2) {
			res.push(el1.concat(el2));
		}
	}
	return res;
}
function multiCartesi() {
	//each arg is a list of list
	let arr = Array.from(arguments);
	if (arr.length > 2) {
		return cartesi(arr[0], stripSet(multiCartesi(...arr.slice(1))));
	} else if (arr.length == 2) return cartesi(arr[0], arr[1]);
	else if (arr.length == 1) return arr[0];
	else return [];
}
function stripSet(x) {
	if (isListOfListOfActions(x)) return x;
	else if (isActionElement(x)) return [[x]];
	else if (isList(x) && isActionElement(x[0])) return [x];
	else return [].concat(...x.map(stripSet));
	//return isList(x)&&x.length>0?stripSet(x[0]):x;
}

//preProcessServerData


// helpers
function getUsernameForPlid(id) { return playerConfig[GAME].players[id].username; }
function getPlidForUsername(username) {
	let pl = firstCondDict(playerConfig[GAME].players, x => x.username == username);
	// //console.log(getFunctionCallerName(),pl)
	return pl;
}
function _getTestPathForPlayerNum() { return GAME + (USE_MAX_PLAYER_NUM ? '_max' : ''); }
function _pickStringForAction(x) {
	//x is a tuple element, eg., {type:'fixed', val:'pass'} or {ID: "0", val: "hex[0]", type: "obj"}
	//console.log('pickStringForAction',x)
	if (x.type == 'fixed') return x.val;
	if (x.type == 'obj') return x.ID;
	if (x.type == 'player') return x.val;
}


//#endregion




