function setGlobalSettings(settings) {

	Settings = settings;

	currentLanguage = Settings.program.currentLanguage;

	currentCategories = Settings.program.currentCategories;

	skipAnimations = Settings.flags.reducedAnimations;

	resetLabelSettings();
}

function resetLabelSettings() {
	if (Settings.program.showLabels == 'toggle') Settings.program.labels = true;
	else Settings.program.labels = (Settings.program.showLabels == 'always');
}
async function initSettingsX() {
	if (nundef(dDev)) dDev = mBy('dDev');

	loadSettingsX();

	if (isdef(Settings.hallo)) {
		await resetSettingsToDefaults();
	}
}
function loadSettingsX() {
	createDevSettingsUi();
	loadSettingsFromLocalStorage();
}
function loadSettingsFromLocalStorage() {
	let ta = mBy('dSettings_ta');
	let settings = localStorage.getItem(SETTINGS_KEY);

	if (nundef(settings)) settings = { hallo: 1, geh: 2 };
	else settings = JSON.parse(settings);


	if (settings.hallo) {
		//console.log('!!!!!!!!!!!!! settings NOT in localstorage! !!!!!!!!!!!!!!!')
		Settings = settings;
	} else {
		setGlobalSettings(settings);
	}

	let o1 = Settings;
	o2 = jsonToYaml(o1, { encoding: 'utf-8' });
	ta.value = o2;

	//let o3 = jsyaml.dump(o1);	let o4 = jsyaml.load(o3);	let o5 = jsyaml.load(o2);
	//console.log('o1', typeof (o1), o1, '\no2', typeof (o2), o2, '\no3', typeof (o3), o3, '\no4', typeof (o4), o4, '\no5', typeof (o5), o5);
}
function saveSettingsX() {

	let ta = mBy('dSettings_ta');
	let t1 = ta.value.toString();
	let t2 = jsyaml.load(t1);
	let t3 = JSON.stringify(t2);
	localStorage.setItem(SETTINGS_KEY, t3);
	//console.log('______________SAVED SETTINGS\n', 't1', typeof (t1), t1, '\nt2', typeof (t2), t2, '\nt3', typeof (t3), t3)

}

async function loadSettingsFromServer() {
	let filename = SETTINGS_KEY;
	let settings = await loadYamlDict('./settings/' + filename + '.yaml'); //_config.yaml');
	return settings;

}
async function resetSettingsToDefaults() {
	//console.log('-------------RESET SETTINGS TO DEFAULTS')
	let settings = await loadSettingsFromServer();
	//console.log(settings)

	//for the current game and current level need to adjust currentLevel if user start level for this game is higher!
	let game = settings.program.gameSequence[settings.program.currentGameIndex].game;

	//console.log('game',game,'level',settings.program.currentLevel)

	if (USE_USER_HISTORY_FOR_STARTLEVEL && isdef(UserHistory) && isdef(UserHistory[game]) && UserHistory[game].startLevel > settings.program.currentLevel) {
		settings.program.currentLevel = UserHistory[game].startLevel;
		//console.log('-------------- adjust currentLevel!!!')
	}


	setGlobalSettings(settings);
	//localStorage.clear(); //TODO: maybe only clear settings not entire localStorage???

	saveObject(Settings, SETTINGS_KEY);

	//createDevSettingsUi();
	loadSettingsFromLocalStorage();

	//setTimeout(loadSettingsFromLocalStorage,10);

}

