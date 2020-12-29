var pictureSize, TOMain, TOTrial;
var uiActivated, auxOpen;
function canAct() { return uiActivated && !auxOpen && document.activeElement.id != 'spUser' && !isVisible2('freezer2'); }

function stopGame() { resetState(); }
function startGame() {
	//console.log('___________startGame_', G);

	resetState();pauseSound();

	G.successFunc = successPictureGoal;
	G.failFunc = failPictureGoal;
	G.correctionFunc = showCorrectWord;

	G.instance = getInstance(G);
	G.instance.startGame();

	startLevel();

}
function startLevel() {

	Speech.setLanguage(Settings.language);

	getGameValues(USERNAME, G.key, G.level);
	// let defvals = { numPics: 1, numRepeat: 1, numColors: 1, numSteps: 1, numLabels: -1, trials: Settings.trials };
	// for (const k in defvals) { G[k] = getGameOrLevelInfo(k, defvals[k]); }
	// if (G.numLabels < 0) G.numLabels = G.numPics * G.numRepeat * G.numColors;

	G.instance.startLevel();
	//keys are supposedly set in each game!
	if (G.keys.length < G.numPics) {
		//console.log('extending key set!!!!');
		updateKeySettings(G.numPics + 5);
	}
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
	uiActivated = false;clearTimeouts();

	IsAnswerCorrect = G.instance.eval(...arguments);
	//console.log('answer is', IsAnswerCorrect ? 'correct' : 'WRONG!!!')

	G.trialNumber += 1;
	if (!IsAnswerCorrect && G.trialNumber < G.trials && !calibrating()) { promptNextTrial(); return; }

	//feedback
	if (calibrating()) { DELAY = 300; if (IsAnswerCorrect) G.successFunc(false); else G.failFunc(); }
	else if (IsAnswerCorrect) { DELAY = Settings.spokenFeedback ? 1500 : 300; G.successFunc(); }
	else { DELAY = G.correctionFunc(); G.failFunc(); }

	setTimeout(removeMarkers, 1500);

	let nextLevel;
	[Score.levelChange, nextLevel] = scoring(IsAnswerCorrect); //get here only if this is correct or last trial!

	if (calibrating()) {
		console.log('nextLevel', nextLevel)
		if (Score.levelChange) {
			addScoreToUserSession(G.key, G.level);
			if (nextLevel <= G.maxLevel) setBadgeLevel(nextLevel);
			if (nextLevel > G.maxLevel) {
				Score.gameChange = true; setNextGame();
				if (isLastCalGame()) { exitCalibrationMode(); } else { TOMain = setTimeout(startGame, DELAY); }
			} else {
				G.level = nextLevel; TOMain = setTimeout(startGame, DELAY);
			}
		} else {
			TOMain = setTimeout(startRound, DELAY);
		}
	} else if (!Score.levelChange) {
		TOMain = setTimeout(startRound, DELAY);
	} else {
		addScoreToUserSession(G.key, G.level);
		setBadgeLevel(nextLevel); //show the last level accomplished in opacity=1!!!
		Score.gameChange = true;
		setNextGame();

		if (unitTimeUp()) {
			//end of unit!
			setTimeout(()=>gameOver('Great job! Time for a break!'), DELAY);
		} else {
			TOMain = setTimeout(startGame, DELAY);
		}

	}

}















