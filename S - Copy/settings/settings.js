function setGlobalSettings(settings) {

	Settings = settings;

	currentLanguage = Settings.common.currentLanguage;

	currentCategories = Settings.common.currentCategories;

	currentUser = Settings.common.currentUser;

	skipAnimations = Settings.flags.reducedAnimations;

	resetLabelSettings();
}

function resetLabelSettings(){
	if (Settings.program.showLabels == 'toggle') Settings.program.labels=true;
	else Settings.program.labels=Settings.program.showLabels;
}
async function initSettingsX() {
	loadSettingsX();

	if (isdef(Settings.hallo)) {
		await resetSettingsToDefaults();
	}
}
function createSettingsUi() {
	let dParent = mBy('dSettings');
	clearElement(dParent);
	let ta = mCreate('textarea');
	ta.id = 'dSettings_ta';
	mAppend(dParent, ta);
	ta.rows = 25;
	ta.cols = 100;
	ta.value = 'hallo';
	let b = mCreate('button');
	mAppend(dParent, b);
	b.innerHTML = 'save';
	b.onclick = () => { saveSettingsX(); loadSettingsFromLocalStorage(); }
}
function loadSettingsX() {
	createSettingsUi();
	loadSettingsFromLocalStorage();
}
function loadSettingsFromLocalStorage() {
	let ta = mBy('dSettings_ta');
	let settings = localStorage.getItem('settings'); 
	settings = JSON.parse(settings);

	if (nundef(settings)) settings = { hallo: 1, geh: 2 };

	if (settings.hallo) {
		console.log('!!!!!!!!!!!!! reload settings! !!!!!!!!!!!!!!!')
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
	localStorage.setItem('settings', t3);
	//console.log('______________SAVED SETTINGS\n', 't1', typeof (t1), t1, '\nt2', typeof (t2), t2, '\nt3', typeof (t3), t3)

}

async function loadSettingsFromServer() {
	let settings = await loadYamlDict('/S/settings/settings.yaml'); //_config.yaml');
	return settings;

}
async function resetSettingsToDefaults() {
	console.log('-------------RESET SETTINGS')
	let settings = await loadSettingsFromServer();
	setGlobalSettings(settings);
	localStorage.clear(); //TODO: maybe only clear settings not entire localStorage???

	saveObject(Settings, 'settings');

	loadSettingsFromLocalStorage();

}

function openSettings() { stopAus(); hide('dGear'); show(dSettings); loadSettingsX(); }
function closeSettings() { show('dGear'); saveSettingsX(); loadSettingsFromLocalStorage(); hide(dSettings); continueResume(); }
function toggleSettings() { if (isVisible2('dSettings')) closeSettings(); else openSettings(); }
function onClickRestartProgram() {

	Settings.program.currentGameIndex = 0;
	Settings.program.currentLevel = currentLevel = 0; //Settings.program.gameSequence[0].startLevel_;

	localStorage.setItem('settings', JSON.stringify(Settings));
	loadSettingsFromLocalStorage();

}

//#region settings helpers
function createSettingsUi() {
	let dParent = mBy('dOldSettings');

	clearElement(dParent);
	let d = mDiv(dParent); mClass(d, 'hMinus60');
	let ta = mCreate('textarea');
	ta.id = 'dSettings_ta';
	mAppend(d, ta);
	mClass(ta, 'whMinus60');
	ta.value = 'hallo';

	let bdiv = mDiv(dParent); mStyleX(bdiv, { height: 54 });
	let b;

	b = mCreate('button');
	mAppend(bdiv, b);
	b.innerHTML = 'reset to defaults';
	mClass(b, 'buttonClass', 'buttonPlus');
	b.onclick = () => { resetSettingsToDefaults(); }

	b = mCreate('button');
	mAppend(bdiv, b);
	b.innerHTML = 'restart program';
	mClass(b, 'buttonClass', 'buttonPlus');
	b.onclick = onClickRestartProgram;

	b = mCreate('button');
	mAppend(bdiv, b);
	b.innerHTML = 'continue playing';
	mClass(b, 'buttonClass', 'buttonPlus');
	b.onclick = () => { closeSettings(); startGame(); }

}

