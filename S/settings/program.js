//#region running program
function clearProgramTimer() { clearTimeout(ProgTimeout); ProgTimeIsUp = false; }
function restartProgramTimer() { ProgTimeout = setTimeout(() => ProgTimeIsUp = true, Settings.program.minutesPerUnit * 60 * 1000); }
async function loadProgram() {
	let program = Settings.program;
	let gameSequence = program.gameSequence;

	// which game?
	let gameIndex = 0;
	if (!RESTART_EACH_TIME) {
		gameIndex = program.currentGameIndex;
		if (isString(gameIndex)) { gameIndex = Number(gameIndex); }
		if (nundef(gameIndex) || gameIndex > gameSequence.length) { gameIndex = 0; }
	}
	Settings.program.currentGameIndex = gameIndex;

	let game = gameSequence[gameIndex];

	//use level saved in localstorage:
	let lastLevel = Settings.program.currentLevel;
	if (isString(lastLevel)) { lastLevel = Number(lastLevel); }
	if (nundef(lastLevel)) { lastLevel = 0; } //gameSequence[Settings.program.currentGameIndex].startLevel_; }

	let userStartLevel = getUserStartLevel(game);

	Settings.program.currentLevel = RESTART_EACH_TIME ? userStartLevel : Math.max(userStartLevel, lastLevel);

	//friendly output
	let i = 0;
	gameSequence.map(x => {
		if (i == Settings.program.currentGameIndex) console.log('=>', x); else console.log('', x);
		i += 1;
	});
	console.log('LOADED: gameIndex', Settings.program.currentGameIndex, 'level', Settings.program.currentLevel);
}
function getUserStartLevel(game) {
	if (isDict(game)) game = game.game;
	else if (isNumber(game)) {
		let i = game;
		let seq = Settings.program.gameSequence;
		console.assert(i < seq.length, "getUserStartLevel!!!!!!!!!!!!!! gameIndex to high", game)
		game = seq[i];

	}
	let hist = UserHistory;
	let userStartLevel = 0;
	if (isdef(hist) && isdef(hist[game])) userStartLevel = hist[game].startLevel;
	//console.log('_______________________',hist,game,UserHistory)
	console.log('________user start level', game, userStartLevel)
	return userStartLevel;
}
function upgradeStartLevelForUser(game, level) {
	console.log('===>upgrade hist', game, level,UPDATE_USER_HISTORY_STARTLEVEL)
	if (UPDATE_USER_HISTORY_STARTLEVEL) {
		lookupSetOverride(UserHistory,[game,'startLevel'],level);
		console.log('startlevel is now:',UserHistory[game].startLevel,'*********** should be',level);
		//UserHistory[game].startLevel = level;
		saveHistory();
	}
}
function saveProgram() {
	localStorage.setItem(SETTINGS_KEY_FILE, JSON.stringify(Settings));
}
function updateGameSequence(nextLevel) {
	if (nextLevel > MaxLevel) {
		let gameSequence = Settings.program.gameSequence;
		let iGame = Settings.program.currentGameIndex = (Settings.program.currentGameIndex + 1) % gameSequence.length;
		Settings.program.currentLevel = getUserStartLevel(iGame);
	} else Settings.program.currentLevel = nextLevel;

	//console.log('*****updated Game Sequence to index', Settings.program.currentGameIndex, 'level', Settings.program.currentLevel);
}
//# endregion






