class Game {
	constructor(name) { this.name = name; }
	clear() { clearTimeout(this.TO); clearFleetingMessage(); }
	startGame() { }
	startLevel() { }
	startRound() { }
	prompt() {
		showPictures(evaluate);
		setGoal();
		showInstruction(Goal.label, 'click', dTitle, true);
		activateUi();
	}
	trialPrompt() {
		Speech.say(Settings.language == 'D' ? 'nochmal!' : 'try again!');
		if (Settings.showHint) shortHintPic();
		return 10;
	}
	activate() { }
	interact() { }
	eval(ev) {
		let id = evToClosestId(ev);
		ev.cancelBubble = true;

		let i = firstNumber(id);
		let item = Pictures[i];
		Selected = { pic: item, feedbackUI: item.div, sz: getBounds(item.div).height };

		Selected.reqAnswer = Goal.label;
		Selected.answer = item.label;

		if (item.label == Goal.label) { return true; } else { return false; }
	}
	recycle() { }
}

class GSteps extends Game {
	constructor(name) { super(name); }
	startLevel() {
		const clist = [{ name: 'orange', color: 'orangered' }, { name: 'green', color: 'green' }, { name: 'pink', color: 'hotpink' }, { name: 'blue', color: 'blue' }];
		this.numColors = getGameOrLevelInfo('numColors', 2);
		//G.numRepeat = 2; //this.numColors * G.numPics;
		G.numLabels = this.numColors * G.numPics * G.numRepeat;
		this.colorList = lookupSet(GS, [this.name, 'colors'], clist);
		console.log(this.colorList)
		this.contrast = lookupSet(GS, [this.name, 'contrast'], .35);
		G.keys = G.keys.filter(x => containsColorWord(x));
	}
	prompt() {
		this.colors = choose(this.colorList, this.numColors);
		showPictures(evaluate, { colors: this.colors.map(x => x.color), repeat: G.numRepeat, contrast: this.contrast });

		setGoal(randomNumber(0, G.numPics * this.colors.length - 1));
		Goal.correctionPhrase = Goal.textShadowColor + ' ' + Goal.label;
		let oColor = firstCond(this.colorList, x => x.color == Goal.textShadowColor);
		Goal.colorName = oColor.name;

		let spoken = `click the ${Goal.colorName} ${Goal.label}`;
		showInstruction(Goal.label, `click the <span style='color:${Goal.textShadowColor}'>${Goal.colorName.toUpperCase()}</span>`,
			dTitle, true, spoken);
		activateUi();
	}
	eval(ev) {
		let id = evToClosestId(ev);
		ev.cancelBubble = true;

		let i = firstNumber(id);
		let item = Pictures[i];
		Selected = { pic: item, feedbackUI: item.div };
		Selected.reqAnswer = Goal.label;
		Selected.answer = item.label;

		if (item == Goal) { return true; } else { return false; }
	}
}

