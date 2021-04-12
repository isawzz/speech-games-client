class SettingsClass {

	constructor(settingsObject, userObject, dParent) {
		this.o=settingsObject;
		this.u = userObject;
		//console.log('settings:',this.o,this.u);
		this.dParent = dParent;
	}
	//#region settings ui

	createSettingsUi(dParent) {
		dParent = valf(dParent,this.dParent);
		clearElement(dParent);
		this.list = [];
		let ttag = 'h2';
		mAppend(dParent, createElementFromHTML(`<${ttag}>Settings for ${this.u.id}:</${ttag}>`));

		let nGroupNumCommonAllGames = this.mInputGroup(dParent);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'samples', 25, ['samplesPerGame']);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'minutes', 1, ['minutesPerUnit']);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'correct streak', 5, ['incrementLevelOnPositiveStreak']);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'fail streak', 2, ['decrementLevelOnNegativeStreak']);
		this.setzeEinOptions(nGroupNumCommonAllGames, 'show labels', ['toggle', 'always', 'never'], ['toggle', 'always', 'never'], 'toggle', ['pictureLabels']);
		this.setzeEinOptions(nGroupNumCommonAllGames, 'language', ['E', 'D', 'S', 'F', 'C'], ['English', 'German', 'Spanish', 'French', 'Chinese'], 'E', ['language']);
		this.setzeEinOptions(nGroupNumCommonAllGames, 'vocabulary', Object.keys(KeySets), Object.keys(KeySets), 'best25', ['vocab']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'show time', false, ['showTime']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'spoken feedback', true, ['spokenFeedback']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'silent', false, ['silentMode']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'switch game after level', false, ['switchGame']);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'trials', 3, ['trials']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'show hint', true, ['showHint']);

		//console.log('Settings', this.list)
	}
	setSettingsKeys(elem) {
		let val = elem.type == 'number' ? Number(elem.value) : elem.type == 'checkbox' ? elem.checked : elem.value;
		lookupSetOverride(this.o, elem.keyList, val);
		this.hasChanged = true;
		//console.log(elem.keyList, val)
		//console.log(this.o);
	}
	setSettingsKeysSelect(elem) {

		let val;
		for (const opt of elem.children) {
			if (opt.selected) val = opt.value;
		}

		// console.log('lllllllllllllllll', a, a.value, a.keyList);
		//let val = elem.type == 'number' ? Number(elem.value) : elem.value;
		this.hasChanged = true;
		lookupSetOverride(this.o, elem.keyList, val);
		//console.log('result', lookup(this.o, elem.keyList));
	}
	setzeEineZahl(dParent, label, init, skeys) {
		// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
		let d = mDiv(dParent);
		let val = lookup(this.o, skeys);
		if (nundef(val)) val = init;
		let inp = createElementFromHTML(
			// `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
			`<input type="number" class="input" value="${val}" onfocusout="Settings.setSettingsKeys(this)" />`);
		let labelui = createElementFromHTML(`<label>${label}</label>`);
		mAppend(d, labelui);
		mAppend(labelui, inp);

		mStyleX(inp, { maleft: 12, mabottom: 4 });
		mClass(inp, 'input');

		inp.keyList = skeys;
		this.addSetting(skeys[0]);
	}
	setzeEineCheckbox(dParent, label, init, skeys) {
		// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
		let d = mDiv(dParent);
		let val = lookup(this.o, skeys);
		if (nundef(val)) val = init;
		let inp = createElementFromHTML(
			`<input type="checkbox" class="checkbox" ` + (val === true ? 'checked=true' : '') + ` onfocusout="Settings.setSettingsKeys(this)" >`
			// `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
			// `<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`
		);
		let labelui = createElementFromHTML(`<label>${label}</label>`);
		mAppend(d, labelui);
		mAppend(labelui, inp);

		mStyleX(inp, { maleft: 12, mabottom: 4 });
		mClass(inp, 'input');

		inp.keyList = skeys;
		this.addSetting(skeys[0]);
	}
	setzeEinOptions(dParent, label, optionList, friendlyList, init, skeys) {

		// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
		let d = mDiv(dParent);
		let val = lookup(this.o, skeys);
		if (nundef(val)) val = init;

		let inp = createElementFromHTML(`<select class="options" onfocusout="Settings.setSettingsKeysSelect(this)"></select>`);
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
		this.addSetting(skeys[0]);
	}
	//#endregion

	//#region helpers 
	mInputGroup(dParent, styles) {
		let baseStyles = { display: 'inline-block', align: 'right', bg: '#00000080', rounding: 10, padding: 20, margin: 12 };
		if (isdef(styles)) styles = mergeOverride(baseStyles, styles); else styles = baseStyles;
		return mDiv(dParent, styles);
	}
	addSetting(keylist) { if (nundef(this.list)) this.list = []; this.list.push(keylist); }
	updateSettings() {

		this.updateLabelSettings();
		this.updateTimeSettings();
		//updateKeySettings();
		this.updateSpeakmodeSettings();

		//welche settings kommen wohin?
		let scope = 'user';//'game' 'level','temp','all'
		//console.log(Settings)
		if (scope == 'temp' || nundef(this.list)) return;
		for (const k of this.list) {
			if (scope == 'user') lookupSetOverride(U, ['settings', k], this.o[k]);
			else if (scope == 'game') lookupSetOverride(U, ['games', this.o.id, k], this.o[k]);
			else if (scope == 'level') lookupSetOverride(U, ['games', this.o.id, 'levels', this.o.level, k], this.o[k]);
			else if (scope == 'all') lookupSetOverride(DB, ['settings', k], this.o[k]);
		}

	}
	updateSpeakmodeSettings() { if (this.o.silentMode && this.o.spokenFeedback) this.o.spokenFeedback = false; }
	updateTimeSettings() { checkTimer(this.o);}//let timeElem = mBy('time'); if (this.o.showTime) { show(timeElem); startTime(timeElem); } else hide(timeElem); }
	updateLabelSettings() { 
		if (this.o.pictureLabels == 'toggle') this.o.showLabels = true; 
		else this.o.showLabels = (this.o.pictureLabels == 'always'); 
		//console.log('labels set to',this.o.showLabels)
	}
	updateGameValues(U) {
		//extracts values for current user and current game from DB
		let game = this.o.id;
		let level = this.o.level;

		let settings = { numColors: 1, numRepeat: 1, numPics: 1, numSteps: 1, colors: ColorList }; // general defaults
		settings = mergeOverride(settings, DB.settings);
		if (isdef(U.settings)) settings = mergeOverride(settings, U.settings);
		if (isdef(DB.games[game])) settings = mergeOverride(settings, DB.games[game]);
		let next = lookup(DB.games, [game, 'levels', level]); if (next) settings = mergeOverride(settings, next);
		next = lookup(U, ['games', game]); if (next) settings = mergeOverride(settings, next);
		next = lookup(U, ['games', game, 'levels', level]); if (next) settings = mergeOverride(settings, next);

		//console.log(settings);
		delete settings.levels;
		delete settings.colors;
		Speech.setLanguage(settings.language);

		copyKeys(settings, this.o);
		this.updateSettings();
		//return settings;

	}

}

