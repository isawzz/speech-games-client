var pictureSize, TOMain, TOTrial;
var uiActivated, auxOpen;
function canAct() { return uiActivated && !auxOpen && document.activeElement.id != 'spUser' && !isVisible2('freezer2'); }

function stopGame() {

	resetState();
}
function startGame() {
	//console.log('___________startGame_', G);

	resetState(); pauseSound();

	G.successFunc = successPictureGoal;
	G.failFunc = failPictureGoal;
	G.correctionFunc = showCorrectWord;

	G.instance = getInstance(G);
	G.instance.startGame();

	startLevel();

}
function startLevel() {

	Speech.setLanguage(Settings.language);

	getGameValues(Username, G.key, G.level);

	G.instance.startLevel();
	if (G.keys.length < G.numPics) { updateKeySettings(G.numPics + 5); }
	startRound();
}
function startRound() {
	resetRound();
	uiActivated = false;

	G.instance.startRound();

	TOMain = setTimeout(() => prompt(), 300);
}
function prompt() {
	QuestionCounter += 1;
	GroupCounter = 0;

	showStats();
	G.trialNumber = 0;

	G.instance.prompt();
}
function promptNextTrial() {
	QuestionCounter += 1;
	clearTimeout(TOTrial);
	uiActivated = false;
	let delay = G.instance.trialPrompt(G.trialNumber);
	TOMain = setTimeout(activateUi, delay);
}
function activateUi() {
	Selected = null;
	uiActivated = true;
	G.instance.activate();
}
function evaluate() {
	//console.log('evaluate!!!',arguments)
	if (!canAct()) return;
	uiActivated = false; clearTimeouts();

	IsAnswerCorrect = G.instance.eval(...arguments);
	if (IsAnswerCorrect === undefined) { promptNextTrial(); return; }
	//console.log('answer is', IsAnswerCorrect ? 'correct' : 'WRONG!!!')

	G.trialNumber += 1;
	if (!IsAnswerCorrect && G.trialNumber < G.trials && !calibrating()) { promptNextTrial(); return; }

	//feedback
	if (calibrating()) { DELAY = 300; if (IsAnswerCorrect) G.successFunc(false); else G.failFunc(); }
	else if (IsAnswerCorrect) { DELAY = Settings.spokenFeedback ? 1500 : 300; G.successFunc(); }
	else { DELAY = G.correctionFunc(); G.failFunc(); }
	setTimeout(removeMarkers, 1500);

	let nextLevel = scoring(IsAnswerCorrect);
	//console.log('cscoring result:', Score)
	if (Score.gameChange) {
		updateUserScore();//this saves user data + clears the score.nTotal,nCorrect,nCorrect1!!!!!
		setNextGame();
		if (unitTimeUp()) {
			setTimeout(() => gameOver('Great job! Time for a break!'), DELAY);
		} else {
			TOMain = setTimeout(startGame, DELAY);
		}
	} else if (Score.levelChange && nextLevel <= G.maxLevel) {
		G.level = nextLevel;
		setBadgeLevel(G.level); //show the last level accomplished in opacity=1!!!
		TOMain = setTimeout(startLevel, DELAY); //soll ich da startGame machen???
	} else {
		TOMain = setTimeout(startRound, DELAY);
	}

}















