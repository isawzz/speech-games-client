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
		sayTryAgain();
		if (!calibrating() && Settings.showHint) shortHintPic();
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
}

class GAnagram extends Game {
	constructor(name) { super(name); }
	startLevel() {
		G.keys = setKeys({
			lang: Settings.language, keysets: KeySets, key: 'all',
			filterFunc: (k, w) => w.length <= G.maxWordLength
		});
	}
	prompt() {
		showPictures(() => fleetingMessage('just enter the missing letter!'));
		setGoal();
		showInstruction(Goal.label, Settings.language == 'E' ? 'drag letters to form' : "forme", dTitle, true);
		mLinebreak(dTable);

		this.inputs = createDropInputs();
		let x = mLinebreak(dTable, 50);//x.style.background='red'
		this.letters = createDragLetters();

		activateUi();

	}
	trialPrompt() {
		sayTryAgain();
		setTimeout(() => {
			this.inputs.map(x => x.div.innerHTML = '_')
			// mClass(d, 'blink');
		}, 1500);

		return 10;
	}
	eval(w, word) {
		Selected = { answer: w, reqAnswer: word, feedbackUI: Goal.div }; //this.inputs.map(x => x.div) };
		//console.log(Selected);
		return w == word;
	}

}
