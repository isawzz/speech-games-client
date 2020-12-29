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

function scrambleInputs(d) {
	let children = Array.from(d.children);
	// for(const ch of children){
	// 	mRemove(ch);
	// 	break;
	// }
	shuffle(children);
	//console.log(children)
	for (const ch of children) {
		mAppend(d, ch);
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

		let fz = 120;
		let word = this.word = Goal.label.toUpperCase();
		let dpEmpty = createLetterInputsX(word, dTable, { pabottom: 5, bg: 'grey', display: 'inline-block', fz: fz, w: fz, h: fz * 1.1, margin: 4 }); //,w:40,h:80,margin:10});
		let wlen = word.length;
		this.inputs = blankInputs(dpEmpty, range(0, wlen - 1), false);
		this.inputs.map(x => makeDroppableX(x.div));
		this.inputs.map(x => x.div.onclick = () => x.div.innerHTML = '_');
		//console.log(this.inputs)

		fz = 60;
		let x = mLinebreak(dTable, 50);//x.style.background='red'
		let dp = createLetterInputsX(word, dTable, { bg: 'silver', display: 'inline-block', fz: fz, w: fz, h: fz * 1.1, margin: 4 }); //,w:40,h:80,margin:10});

		scrambleInputs(dp);
		this.letters = Array.from(dp.children);
		this.letters.map(x => makeDraggableX(x, (e, s, t) => {
			if (!canAct()) return;
			t.innerHTML = s.innerHTML;

			//check if word complete!
			let w = buildWordFromLetters(dpEmpty);
			if (!w.includes('_')) evaluate(w, word);
		}));

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
		Selected = { answer: w, reqAnswer: word, feedbackUI: this.inputs.map(x => x.div) };
		//console.log(Selected);
		return w == word;
	}

}
