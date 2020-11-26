function clearProgramTimer() { clearTimeout(ProgTimeout); ProgTimeIsUp = false; }
function restartProgramTimer() { ProgTimeout = setTimeout(() => ProgTimeIsUp = true, Settings.program.minutesPerUnit * 60 * 1000); }
async function loadProgram() {
	let program = Settings.program;
	let gameSequence = program.gameSequence;
	let gameIndex = program.currentGameIndex;

	if (isdef(program)) gameSequence = program.gameSequence;

	if (isString(Settings.program.currentGameIndex)) { Settings.program.currentGameIndex = Number(Settings.program.currentGameIndex); }
	if (nundef(Settings.program.currentGameIndex)) { Settings.program.currentGameIndex = 0; }

	if (isString(Settings.program.currentLevel)) { Settings.program.currentLevel = Number(Settings.program.currentLevel); }
	if (nundef(Settings.program.currentLevel)) { Settings.program.currentLevel = 0; } //gameSequence[Settings.program.currentGameIndex].startLevel_; }



	if (RESTART_EACH_TIME) Settings.program.currentLevel = Settings.program.currentGameIndex = 0;

	//friendly output
	let i = 0;
	gameSequence.map(x => {
		if (i == Settings.program.currentGameIndex) console.log('=>', x); else console.log('', x);
		i += 1;
	});
	console.log('LOADED: gameIndex', Settings.program.currentGameIndex, 'level', Settings.program.currentLevel);
}

function saveProgram() {
	localStorage.setItem('settings', JSON.stringify(Settings));
}

function updateGameSequence(nextLevel) {
	if (nextLevel > MaxLevel) {
		let gameSequence = Settings.program.gameSequence;
		Settings.program.currentGameIndex = (Settings.program.currentGameIndex + 1) % gameSequence.length;
		Settings.program.currentLevel = 0; 
	} else Settings.program.currentLevel = nextLevel;
}







