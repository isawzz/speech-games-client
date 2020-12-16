var pictureSize, TOMain;
var uiActivated, auxOpen;
var canAct = () => uiActivated && !auxOpen && document.activeElement.id != 'spUser';


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
	resetScore();
	showStats();

	let defvals = { numPics: 1, numRepeat: 1 };
	for (const k in defvals) { G[k] = getGameOrLevelInfo(k, defvals[k]); }
	G.numLabels = G.numPics * G.numRepeat;

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
	showScore();
	Score.levelChange = false; //needs to be down here because showScore needs that info!
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
	if (!canAct()) return;
	uiActivated = false;
	IsAnswerCorrect = G.instance.eval(...arguments);
	//console.log('answer is', IsAnswerCorrect ? 'correct' : 'WRONG!!!')

	G.trialNumber += 1;
	//console.log('have more trials?',G.trialNumber,Settings.trials)
	if (!IsAnswerCorrect && G.trialNumber < Settings.trials) { promptNextTrial(); return; }

	//feedback
	if (IsAnswerCorrect) {
		DELAY = Settings.spokenFeedback ? 1500 : 300;
		G.successFunc();
	} else {
		DELAY = Settings.spokenFeedback ? 3000 : 300;
		G.correctionFunc(); //showCorrectWord();
		G.failFunc(); //failPictureGoal(false);
	}
	setTimeout(removeMarkers, 1500);

	let nextLevel;
	[Score.levelChange, nextLevel] = scoring(IsAnswerCorrect); //get here only if this is correct or last trial!


	//console.log('===>now', G.level, 'next', nextLevel)
	// let gcCompleted = gameCycleCompleted(nextLevel);
	// let cal = calibrating();
	// console.log('=============>eval \ngame', G.key,
	// 	'\nnext level', nextLevel, G.maxLevel, '\ncycle completed', gcCompleted, '\ncalibrating', cal);

	if (calibrating() && gameCycleCompleted(nextLevel)) {
		addScoreToUserSession(G.key, G.level);
		gameOver('Great job! Time for a break!');
		return;
	}

	if (!Score.levelChange) {
		TOMain = setTimeout(startRound, DELAY);
	} else {
		//ja weil wenn game change ist ist ja automatisch auch levelchange!!!
		addScoreToUserSession(G.key, G.level);
		if (nextLevel < G.level) {
			//remove badges
			revertToBadgeLevel(nextLevel);
		} else if (nextLevel == G.level) {
			//same level restarts again
		} else if (nextLevel > G.maxLevel) {
			//new game!
			setNextGame();
		} else {
			G.level = nextLevel;
			addBadge(dLeiste, G.level, onClickBadge);
		}


		if (unitTimeUp()) {
			//end of unit!
			gameOver('Great job! Time for a break!');
		} else {
			TOMain = setTimeout(startGame, DELAY);
		}

	}
}















