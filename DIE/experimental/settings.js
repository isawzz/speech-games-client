var SelectedMenuKey, MenuItems;
var hiddenSettingSpecificationString, iHiddenSSS;

function createSettingsUi(dParent) {
	clearElement(dParent);
	mFlex(dParent);

	commonSettings(dParent);
	gameSpecificSettings(dParent);
}
function commonSettings(dParent) {
	let d = mDiv(dParent);
	hiddenSettingSpecificationString = '111111111111111111111111111111';
	iHiddenSSS = 0;
	addSettingsUi(d, `Common Settings for ${USERNAME}:`);
}
function gameSpecificSettings(dParent) {
	let d = mDiv(dParent);
	hiddenSettingSpecificationString = '10001111000011111';
	iHiddenSSS = 0;
	addSettingsUi(d, `Game specific:`, G.key);
}
function addSettingsUi(dParent, title, game) {
	mAppend(dParent, createElementFromHTML(`<h2>${title}</h2>`));

	let nGroupNumCommonAllGames = mInputGroup(dParent);
	setzeEineZahl(nGroupNumCommonAllGames, 'samples', 25, ['samplesPerGame'], game);
	setzeEineZahl(nGroupNumCommonAllGames, 'minutes', 1, ['minutesPerUnit']);
	setzeEineZahl(nGroupNumCommonAllGames, 'correct streak', 5, ['incrementLevelOnPositiveStreak']);
	setzeEineZahl(nGroupNumCommonAllGames, 'fail streak', 2, ['decrementLevelOnNegativeStreak']);
	setzeEineZahl(nGroupNumCommonAllGames, 'trials', 3, ['trials']);
	setzeEinOptions(nGroupNumCommonAllGames, 'show labels', ['toggle', 'always', 'never'], ['toggle', 'always', 'never'], 'toggle', ['showLabels']);
	setzeEinOptions(nGroupNumCommonAllGames, 'language', ['E', 'D'], ['English', 'German'], 'E', ['language']);
	setzeEinOptions(nGroupNumCommonAllGames, 'vocabulary', Object.keys(KeySets), Object.keys(KeySets), 'best25', ['vocab']);

	//let nGroupOther = mInputGroup(dParent);
	setzeEineCheckbox(nGroupNumCommonAllGames, 'show time', false, ['showTime']);
	setzeEineCheckbox(nGroupNumCommonAllGames, 'spoken feedback', true, ['spokenFeedback']);
	setzeEineCheckbox(nGroupNumCommonAllGames, 'silent', false, ['silentMode']);
	setzeEineCheckbox(nGroupNumCommonAllGames, 'switch game after max level', false, ['switchGame']);
	setzeEineCheckbox(nGroupNumCommonAllGames, 'show hint', true, ['showHint']);

}
function createMenuUi(dParent) {
	clearElement(dParent);

	mAppend(dParent, createElementFromHTML(`<h1>Choose Game:</h1>`));

	let d = mDiv(dParent);

	mClass(d, 'flexWrap');
	d.style.height = '100%';

	let games = U.seq;
	//console.log(games, games.map(g => GAME[g]));
	let labels = games.map(g => GAME[g].friendly);
	let keys = games.map(g => GAME[g].logo);
	let bgs = games.map(g => GAME[g].color);

	MenuItems = {};
	let pics = maShowPictures(keys, labels, d, onClickGo, { bgs: bgs, shufflePositions: false }, { fg: 'blue' });
	//let pics = maShowPicturesX(keys, labels, d, onClickGo, { bgs: bgs, shufflePositions: false }, { sPic: { fg: 'white' }}); //, sText:{family:'AlgerianRegular'} });
	for (let i = 0; i < pics.length; i++) {
		let p = pics[i];
		//console.log(p)
		p.div.id = 'menu_' + p.label.substring(0, 3);
		let key = p.div.key = games[i];
		MenuItems[key] = p;
	}

	if (nundef(G)) return;

	//select the current game
	SelectedMenuKey = G.key;
	toggleSelectionOfPicture(MenuItems[G.key]);
	//console.log(SelectedMenuKey)
}


//#region create elements for settings 
function mInputGroup(dParent, styles) {
	let baseStyles = { display: 'inline-block', align: 'right', bg: '#00000080', rounding: 10, padding: 20, margin: 12 };
	if (isdef(styles)) styles = deepmergeOverride(baseStyles, styles); else styles = baseStyles;
	return mDiv(dParent, styles);
}
function setSettingsKeys(elem) {
	// console.log('lllllllllllllllll', a, a.value, a.keyList);
	let val = elem.type == 'number' ? Number(elem.value) : elem.type == 'checkbox' ? elem.checked : elem.value;
	lookupSetOverride(Settings, elem.keyList, val);

	let lst = ['games',G.key,'settings'].concat(elem.keyList);
	lookupSetOverride(U, lst, val);
	saveUser();
	console.log('lst',U);

	SettingsChanged = true;
	//console.log(elem.keyList, val)
	//console.log(Settings);
}
function setSettingsKeysSelect(elem) {

	let val;
	for (const opt of elem.children) {
		if (opt.selected) val = opt.value;
	}

	// console.log('lllllllllllllllll', a, a.value, a.keyList);
	//let val = elem.type == 'number' ? Number(elem.value) : elem.value;
	SettingsChanged = true;
	lookupSetOverride(Settings, elem.keyList, val);
	console.log('result', lookup(Settings, elem.keyList));
}

function checkIfEmptyLine(dParent) {
	let vis = hiddenSettingSpecificationString[iHiddenSSS] == '1'; iHiddenSSS += 1;
	if (!vis) {
		let d = mDiv(dParent, { h:27, bg: 'transparent' });
		//let d1 = mInput('hidden', 'hidden', d, { display: 'block', margin: 3 });
		return true;
	}
	return false; //style="display:block;margin:4px;"
}

function setzeEineZahl(dParent, label, init, skeys, game) {
	// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
	if (checkIfEmptyLine(dParent)) return;

	let d = mDiv(dParent);
	let val = lookup(Settings, skeys);
	if (nundef(val)) val = init;
	let inp = createElementFromHTML(
		// `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
		`<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`);
	let labelui = createElementFromHTML(`<label>${label}</label>`);
	mAppend(d, labelui);
	mAppend(labelui, inp);

	mStyleX(inp, { maleft: 12, mabottom: 4 });
	mClass(inp, 'input');

	inp.keyList = skeys;
}
function setzeEineCheckbox(dParent, label, init, skeys) {
	if (checkIfEmptyLine(dParent)) return;

	// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
	let d = mDiv(dParent);
	let val = lookup(Settings, skeys);
	if (nundef(val)) val = init;
	let inp = createElementFromHTML(
		`<input type="checkbox" class="checkbox" ` + (val === true ? 'checked=true' : '') + ` onfocusout="setSettingsKeys(this)" >`
		// `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
		// `<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`
	);
	let labelui = createElementFromHTML(`<label>${label}</label>`);
	mAppend(d, labelui);
	mAppend(labelui, inp);

	mStyleX(inp, { maleft: 12, mabottom: 4 });
	mClass(inp, 'input');

	inp.keyList = skeys;
}
function setzeEinOptions(dParent, label, optionList, friendlyList, init, skeys) {
	if (checkIfEmptyLine(dParent)) return;

	// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
	let d = mDiv(dParent);
	let val = lookup(Settings, skeys);
	if (nundef(val)) val = init;

	let inp = createElementFromHTML(`<select onfocusout="setSettingsKeysSelect(this)"></select>`);
	for (let i = 0; i < optionList.length; i++) {
		let opt = optionList[i];
		let friendly = friendlyList[i];
		let optElem = createElementFromHTML(`<option value="${opt}">${friendly}</option>`);
		mAppend(inp, optElem);
		if (opt == val) optElem.selected = true;
	}
	// // `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
	// `<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`);
	let labelui = createElementFromHTML(`<label>${label}</label>`);
	mAppend(d, labelui);
	mAppend(labelui, inp);

	mStyleX(inp, { maleft: 12, mabottom: 4 });

	inp.keyList = skeys;
}


//#region update Settings after ui change
function updateSettings() {

	updateLabelSettings();
	updateTimeSettings();
	updateKeySettings();

	//console.log('halo!')
	updateSpeakmodeSettings();


}
function updateSpeakmodeSettings() {
	if (Settings.silentMode && Settings.spokenFeedback) Settings.spokenFeedback = false;

}
function updateKeySettings(nMin) {
	//console.log(G,KeySets);
	if (nundef(G)) return;
	G.keys = setKeys({ nMin, lang: Settings.language, keysets: KeySets, key: Settings.vocab });
	//console.log('keyset:', G.keys);
}
function updateTimeSettings() {
	let timeElem = mBy('time');
	//console.log('updateTimeSettings',_getFunctionsNameThatCalledThisFunction())
	if (Settings.showTime) { show(timeElem); startTime(timeElem); }
	else hide(timeElem);
}
function updateLabelSettings() {
	if (Settings.showLabels == 'toggle') Settings.labels = true;
	else Settings.labels = (Settings.showLabels == 'always');
}




