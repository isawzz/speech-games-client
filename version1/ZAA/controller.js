function canAct() { return uiActivated && !auxOpen; }

function setGame(game) {
	cleanupOldGame();
	if (isdef(G) && G.id != game) Score.gameChange = true;

	G = new (classByName(capitalize(game)))(game, DB.games[game]);
	Settings = new SettingsClass(G, dAux);

	if (nundef(U.games[game]) && G.controllerType == 'solitaire') { U.games[game] = { nTotal: 0, nCorrect: 0, nCorrect1: 0, startLevel: 0 }; }
	G.level = Math.min(getUserStartLevel(game), G.maxLevel);

	Settings.updateGameValues(U, G);//Username, G.id, G.level); copyKeys(x, G);	updateSettings(); // muss hier sein weil es gewisse additional settings setzt und consistence (eg., silentMode/spokenFeedback)
	saveUser();

	GC=G.controller=this;
}

function stopGame() { resetState(); }
function startGame() {
	resetState(); 
	G.successFunc = successPictureGoal;
	G.failFunc = failPictureGoal;
	G.correctionFunc = showCorrectWord;

	G.startGame();
	startLevel();
}
function startLevel() {
	Settings.updateGameValues(U, G);

	G.start_Level();

	startRound();
}
function startRound() {
	resetRound();
	uiActivated = false;
	G.startRound();
	TOMain = setTimeout(() => prompt(), 300);

	//if (isdef(G.keys)) console.log('words',G.maxWordLength,G.keys.map(x=>Syms[x][G.language])); else console.log('no keys!');

}
function prompt() {
	QContextCounter += 1;
	showStats();
	G.trialNumber = 0;
	G.prompt();
}
function promptNextTrial() {
	QContextCounter += 1;
	clearTimeout(TOTrial);
	uiActivated = false;
	let delay = G.trialPrompt(G.trialNumber);
	TOMain = setTimeout(activateUi, delay);
}
function activateUi() {
	Selected = null;
	uiActivated = true;
	G.activate();
}
function evaluate() {
	if (!canAct()) return;
	uiActivated = false; clearTimeouts();

	IsAnswerCorrect = G.eval(...arguments);
	if (IsAnswerCorrect === undefined) { promptNextTrial(); return; }

	G.trialNumber += 1;
	if (!IsAnswerCorrect && G.trialNumber < G.trials) { promptNextTrial(); return; }

	//feedback
	if (IsAnswerCorrect) { DELAY = isdef(Selected.delay) ? Selected.delay : G.spokenFeedback ? 1500 : 300; G.successFunc(); }
	else { DELAY = G.correctionFunc(); G.failFunc(); }

	let nextLevel = scoring(IsAnswerCorrect);

	if (DELAY > 2000) showActiveMessage('click to continue...', () => gotoNext(nextLevel));
	TOMain = setTimeout(() => gotoNext(nextLevel), DELAY);
}
function gotoNext(nextLevel) {

	onclick = null;
	removeMarkers();
	clearTimeouts();

	if (Score.gameChange) {
		setNextGame();
		if (GameTimer.unitTimeUp()) { gameOver('Great job! Time for a break!'); } else { startGame(); }
	} else if (Score.levelChange && nextLevel <= G.maxLevel) {
		G.level = nextLevel;
		setBadgeLevel(G.level);
		startLevel();
	} else { startRound(); }

}














