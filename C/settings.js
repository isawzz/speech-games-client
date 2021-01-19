function saveSettings(){

}
function initSettings(game) {
	Settings = deepmergeOverride(DB.settings, U.settings);
	delete Settings.games;
	let gsSettings = lookup(U, ['games', game, 'settings']);
	if (isdef(gsSettings)) Settings = deepmergeOverride(Settings, gsSettings);
	updateSettings();

}

