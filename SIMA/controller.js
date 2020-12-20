var pictureSize, TOMain;
var uiActivated, auxOpen;
function canAct() { return uiActivated && !auxOpen && document.activeElement.id != 'spUser' && !isVisible2('freezer2'); }

function stopGame() { resetState(); }
function startGame() {
	//console.log('___________startGame_', G);

	resetState();

	G.successFunc = successPictureGoal;
	G.failFunc = failPictureGoal;
	G.correctionFunc = showCorrectWord;

	G.instance = getInstance(G);
	G.instance.startGame();

	startLevel();

}
function startLevel() {

	Speech.setLanguage(Settings.language);

	let defvals = { numPics: 1, numRepeat: 1, numColors: 1, numSteps: 1, numLabels: -1 };
	for (const k in defvals) { G[k] = getGameOrLevelInfo(k, defvals[k]); }
	if (G.numLabels < 0) G.numLabels = G.numPics * G.numRepeat * G.numColors;

	G.instance.startLevel();

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
	showStats();
	G.trialNumber = 0;

	G.instance.prompt();
}
function promptNextTrial() {
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
	uiActivated = false;
	IsAnswerCorrect = G.instance.eval(...arguments);
	//console.log('answer is', IsAnswerCorrect ? 'correct' : 'WRONG!!!')

	G.trialNumber += 1;
	//console.log('have more trials?',G.trialNumber,Settings.trials)
	if (!IsAnswerCorrect && G.trialNumber < Settings.trials && !calibrating()) { promptNextTrial(); return; }

	//feedback
	if (calibrating()) { DELAY = 300; if (IsAnswerCorrect) G.successFunc(false); else G.failFunc(); }
	else if (IsAnswerCorrect) { DELAY = Settings.spokenFeedback ? 1500 : 300; G.successFunc(); }
	else { DELAY = G.correctionFunc(); G.failFunc(); }

	setTimeout(removeMarkers, 1500);

	let nextLevel;
	[Score.levelChange, nextLevel] = scoring(IsAnswerCorrect); //get here only if this is correct or last trial!

	if (calibrating()) {
		//console.log('cali:', Score.levelChange, nextLevel, G.level, isLastCalGame())
		addScoreToUserSession(G.key, G.level);
		if (!IsAnswerCorrect) {
			setBadgeLevel(nextLevel); Score.gameChange = true; setNextGame();
			//console.log('cali:', Score.levelChange, nextLevel, G.key, G.level, isLastCalGame());
			if (isLastCalGame()) { exitCalibrationMode(); } else { TOMain = setTimeout(startGame, DELAY); }
		} else if (IsAnswerCorrect && nextLevel > G.maxLevel) {
			setBadgeLevel(nextLevel); Score.gameChange = true; setNextGame();
			if (isLastCalGame()) { exitCalibrationMode(); } else { TOMain = setTimeout(startGame, DELAY); }
		} else if (IsAnswerCorrect && !Score.levelChange) {
			TOMain = setTimeout(startRound, DELAY);
		} else if (IsAnswerCorrect && nextLevel <= G.maxLevel && nextLevel != G.level) {
			setBadgeLevel(nextLevel); G.level = nextLevel; TOMain = setTimeout(startGame, DELAY);
		} else {
			console.log('!!!!!!!!!!!!!!!! UNKNOWN!!!!!!!!!!!!!!!!!!!')
		}
	} else if (!Score.levelChange) {
		TOMain = setTimeout(startRound, DELAY);
	} else {
		//ja weil wenn game change ist ist ja automatisch auch levelchange!!!
		addScoreToUserSession(G.key, G.level);

		// if (nextLevel > G.maxLevel) { 
		setBadgeLevel(nextLevel); //show the last level accomplished in opacity=1!!!
		Score.gameChange = true;
		setNextGame();
		// }else G.level = nextLevel;


		if (unitTimeUp()) {
			//end of unit!
			gameOver('Great job! Time for a break!');
		} else {
			TOMain = setTimeout(startGame, DELAY);
		}

	}

}















