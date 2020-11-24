function clearProgramTimer() { clearTimeout(ProgTimeout); ProgTimeIsUp = false; }
function restartProgramTimer() { ProgTimeout = setTimeout(() => ProgTimeIsUp = true, Settings.program.minutesPerUnit * 60 * 1000); }
async function loadProgram() {
	//sets gameSequence from _config.yaml is exists, Settings.program.currentGameIndex,Settings.program.currentLevel from localStorage if exists 

	// let url = 'file:///C:/Users/tawzz/Downloads/__games/testfile.yaml';
	// let data = await loadYamlDict(url);
	// console.log('DATA', data);

	//TODO: hier muss statt dessen Settings.program nehmen!
	//let data = Settings_ =  await loadYamlDict('/S/settings/settings.yaml'); //_config.yaml');
	// console.log('Settings',Settings);
	// localStorage.clear();
	// initSettings();

	// if (nundef(Settings)) {
	// 	console.log('call initSettings'); 
	// 	initSettings();
	// }
	let program = Settings.program;
	let gameSequence = program.gameSequence;
	let gameIndex = program.currentGameIndex;

	if (isdef(program)) gameSequence = program.gameSequence;

	//console.log(Settings);
	//Settings.program.currentGameIndex = localStorage.getItem('Settings.program.currentGameIndex');
	if (isString(Settings.program.currentGameIndex)) { Settings.program.currentGameIndex = Number(Settings.program.currentGameIndex); }
	if (nundef(Settings.program.currentGameIndex)) { Settings.program.currentGameIndex = 0; }

	//Settings.program.currentLevel = localStorage.getItem('Settings.program.currentLevel');
	if (isString(Settings.program.currentLevel)) { Settings.program.currentLevel = Number(Settings.program.currentLevel); }
	if (nundef(Settings.program.currentLevel)) { Settings.program.currentLevel = gameSequence[Settings.program.currentGameIndex].startLevel; }

	//friendly output
	let i = 0;
	gameSequence.map(x => {
		if (i == Settings.program.currentGameIndex) console.log('=>', x); else console.log('', x);
		i += 1;
	});
	console.log('LOADED: gameIndex', Settings.program.currentGameIndex, 'level', Settings.program.currentLevel);
	// console.log('Settings.program.currentGameIndex loaded', Settings.program.currentGameIndex);
	// console.log('Settings.program.currentLevel loaded', Settings.program.currentLevel);
}

function saveProgram() {
	//console.log('HAAAAAAAAAAAAAAAAAAAAAAALO')
	updateGameSequence(currentLevel);
	localStorage.setItem('settings', JSON.stringify(Settings));
	// saveSettingsUi();
	// localStorage.setItem('Settings.program.currentGameIndex', Settings.program.currentGameIndex.toString());
	// localStorage.setItem('Settings.program.currentLevel', Settings.program.currentLevel.toString());
	console.log('SAVED: gameIndex', Settings.program.currentGameIndex, 'level', Settings.program.currentLevel);
}

function updateGameSequence(nextLevel) {
	//console.log('updateGameSequence nextLevel',nextLevel, 'MAXLEVEL',MAXLEVEL)
	if (nextLevel > MAXLEVEL) {
		let gameSequence = Settings.program.gameSequence;
		Settings.program.currentGameIndex = (Settings.program.currentGameIndex + 1) % gameSequence.length;
		Settings.program.currentLevel = gameSequence[Settings.program.currentGameIndex].startLevel;
	} else Settings.program.currentLevel = nextLevel;
}







