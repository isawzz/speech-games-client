//#region running program
function ProgTimeIsUp() {

	let msElapsed = ProgMsElapsed + msElapsedSince(ProgMsStart);
	let msUnit = Settings.program.minutesPerUnit * 60 * 1000;
	//console.log('elapsed:', msElapsed, 'unit', msUnit);
	return msElapsed > msUnit;
}
function pauseProgramTimer() { ProgMsElapsed += msElapsedSince(ProgMsStart);}
function resumeProgramTimer() {	ProgMsStart = Date.now();}
function startProgramTimer() {	ProgMsElapsed = 0;	ProgMsStart = Date.now();}
function getTimeElapsed(){return ProgMsElapsed + msElapsedSince(ProgMsStart);}

function loadProgram() {
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

	return;
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
	//console.log('________user start level', game, userStartLevel)
	return userStartLevel;
}
function upgradeStartLevelForUser(game, level) {
	//console.log('===>upgrade hist', game, level, UPDATE_USER_HISTORY_STARTLEVEL)
	if (UPDATE_USER_HISTORY_STARTLEVEL) {
		lookupSetOverride(UserHistory, [game, 'startLevel'], level);
		//console.log('startlevel is now:', UserHistory[game].startLevel, '*********** should be', level);
		//UserHistory[game].startLevel = level;
		//saveHistory();
		saveServerData();
	}
}
function saveProgram() {
	localStorage.setItem(SETTINGS_KEY, JSON.stringify(Settings));
}
function updateGameSequence(nextLevel) {
	if (nextLevel > MaxLevel) {
		let gameSequence = Settings.program.gameSequence;
		let iGame = Settings.program.currentGameIndex = (Settings.program.currentGameIndex + 1) % gameSequence.length;
		Settings.program.currentLevel = getUserStartLevel(iGame);
	} else Settings.program.currentLevel = nextLevel;

	//console.log('*****updated Game Sequence to index', Settings.program.currentGameIndex, 'level', Settings.program.currentLevel);
}


function startTime() {
	if (nundef(Settings.program.showTime) || !Settings.program.showTime) return;
	var timeLeft =Settings.program.minutesPerUnit*60000 - getTimeElapsed();
	let t = msToTime(timeLeft);
	let s=format2Digits(t.h)+":"+format2Digits(t.m)+":"+format2Digits(t.s);
	document.getElementById('time').innerHTML = s;//h + ":" + m + ":" + s;
	setTimeout(startTime,500);
	//function () {		startTime()	}, 500);
}

function format2Digits(i) {	return (i < 10) ? "0" + i : i;}
function startTimeClock() {
	if (nundef(Settings.program.showTime) || !Settings.program.showTime) return;
	var today = new Date(),
		h = format2Digits(today.getHours()),
		m = format2Digits(today.getMinutes()),
		s = format2Digits(today.getSeconds());
	document.getElementById('time').innerHTML = h + ":" + m + ":" + s;
	t = setTimeout(function () {
		startTimeClock()
	}, 500);
}



//# endregion






