
class ControllerSolitaire {

	constructor(g, user) { this.g = g; this.player = user; }
	stopGame() { resetState(); }
	startGame() {

		resetState();
		this.g.successFunc = successPictureGoal;
		this.g.failFunc = failPictureGoal;
		this.g.correctionFunc = showCorrectWord;

		this.g.startGame();
		this.startLevel();
	}
	startLevel() {
		Settings.updateGameValues(this.player, this.g);

		this.g.start_Level();

		this.startRound();
	}
	startRound() {
		resetRound();
		uiActivated = false;
		this.g.startRound();
		TOMain = setTimeout(() => this.prompt(), 300);
	}
	prompt() {
		QContextCounter += 1;
		showStats();
		this.g.trialNumber = 0;
		this.g.prompt();
	}
	promptNextTrial() {
		QContextCounter += 1;
		clearTimeout(TOTrial);
		uiActivated = false;
		let delay = this.g.trialPrompt(this.g.trialNumber);
		TOMain = setTimeout(() => this.activateUi(), delay);
	}
	activateUi() {
		Selected = null;
		uiActivated = true;
		this.g.activate();
	}
	evaluate() {
		if (!canAct()) return;
		uiActivated = false; clearTimeouts();

		IsAnswerCorrect = this.g.eval(...arguments);
		if (IsAnswerCorrect === undefined) { this.promptNextTrial(); return; }

		this.g.trialNumber += 1;
		if (!IsAnswerCorrect && this.g.trialNumber < this.g.trials) { this.promptNextTrial(); return; }

		//feedback
		if (IsAnswerCorrect) { DELAY = isdef(Selected.delay) ? Selected.delay : this.g.spokenFeedback ? 1500 : 300; this.g.successFunc(); }
		else { DELAY = this.g.correctionFunc(); this.g.failFunc(); }

		let nextLevel = scoring(IsAnswerCorrect);

		if (DELAY > 2000) showActiveMessage('click to continue...', () => this.gotoNext(nextLevel));
		TOMain = setTimeout(() => this.gotoNext(nextLevel), DELAY);
	}
	gotoNext(nextLevel) {
		onclick = null;
		removeMarkers();
		clearTimeouts();

		if (Score.gameChange) {
			setNextGame();
			if (GameTimer.unitTimeUp()) { gameOver('Great job! Time for a break!'); } else { GC.startGame(); }
		} else if (Score.levelChange && nextLevel <= this.g.maxLevel) {
			this.g.level = nextLevel;
			setBadgeLevel(this.g.level);
			this.startLevel();
		} else { this.startRound(); }

	}
}














