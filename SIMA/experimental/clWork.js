class GSet extends Game {
	constructor(name) { super(name); }
	startGame() { G.correctionFunc = showCorrectWords; }
	startLevel() {
		G.keys = G.keys.filter(x => containsColorWord(x));
	}

	prompt() {
		this.piclist = [];
		let colorKeys = G.numColors > 1 ? choose(G.colors, G.numColors) : null;
		let showRepeat = G.numRepeat > 1;

		showPictures(this.interact.bind(this), { showRepeat: showRepeat, colorKeys: colorKeys, contrast: G.contrast, repeat: G.numRepeat });


		setMultiGoal(G.numSteps);
		// console.log(Goal)

		let cmd = 'click';
		let spoken = [], written = [];
		for (let i = 0; i < G.numSteps; i++) {
			let goal = Goal.pics[i];
			let sOrdinal = getOrdinal(goal.iRepeat);
			[written[i], spoken[i]] = getOrdinalColorLabelInstruction(cmd, sOrdinal, goal.color, goal.label);
			cmd = 'then';
		}
		// console.log('written', written, '\nspoken', spoken);
		showInstructionX(written.join('; '), dTitle, spoken.join('. '), {fz:20});

		activateUi();
	}
	trialPrompt() {
		for (const p of this.piclist) { toggleSelectionOfPicture(p); }
		this.piclist = [];
		sayTryAgain();
		return 10;
	}
	interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) return;

		let id = evToClosestId(ev);
		let i = firstNumber(id);
		let pic = Pictures[i];
		let div = pic.div;
		//if (!isEmpty(this.piclist) && this.piclist.length < G.numSteps - 1 && this.piclist[0].label != pic.label) return;
		toggleSelectionOfPicture(pic, this.piclist);
		console.log('clicked pic', pic.index, this.piclist);//,piclist, GPremem.PicList);
		if (isEmpty(this.piclist)) return;
		//return;
		let iGoal = this.piclist.length - 1;
		console.log('iGoal', iGoal, Goal.pics[iGoal], 'i', i, pic)
		if (pic != Goal.pics[iGoal]) { Selected = { pics: this.piclist, wrong: pic, correct: Goal[iGoal] }; evaluate(false); }
		else if (this.piclist.length == Goal.pics.length) { Selected = { piclist: this.piclist }; evaluate(true); }
	}
	eval(isCorrect) {
		console.log('eval', isCorrect);
		console.log('piclist', this.piclist)
		Selected = { piclist: this.piclist, feedbackUI: this.piclist.map(x => x.div), sz: getBounds(this.piclist[0].div).height };
		return isCorrect;
	}
}
class GSudo extends Game {
	constructor(name) { super(name); }
	startGame() { G.correctionFunc = showCorrectWords; }
	startLevel() {
		G.keys = G.keys.filter(x => containsColorWord(x));
	}

	prompt() {
		this.piclist = [];
		let colorKeys = G.numColors > 1 ? choose(G.colors, G.numColors) : null;
		let showRepeat = G.numRepeat > 1;

		showPictures(this.interact.bind(this), { showRepeat: showRepeat, colorKeys: colorKeys, contrast: G.contrast, repeat: G.numRepeat });


		setMultiGoal(G.numSteps);
		// console.log(Goal)

		let cmd = 'click';
		let spoken = [], written = [];
		for (let i = 0; i < G.numSteps; i++) {
			let goal = Goal.pics[i];
			let sOrdinal = getOrdinal(goal.iRepeat);
			[written[i], spoken[i]] = getOrdinalColorLabelInstruction(cmd, sOrdinal, goal.color, goal.label);
			cmd = 'then';
		}
		// console.log('written', written, '\nspoken', spoken);
		showInstructionX(written.join('; '), dTitle, spoken.join('. '), {fz:20});

		activateUi();
	}
	trialPrompt() {
		for (const p of this.piclist) { toggleSelectionOfPicture(p); }
		this.piclist = [];
		sayTryAgain();
		return 10;
	}
	interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) return;

		let id = evToClosestId(ev);
		let i = firstNumber(id);
		let pic = Pictures[i];
		let div = pic.div;
		//if (!isEmpty(this.piclist) && this.piclist.length < G.numSteps - 1 && this.piclist[0].label != pic.label) return;
		toggleSelectionOfPicture(pic, this.piclist);
		console.log('clicked pic', pic.index, this.piclist);//,piclist, GPremem.PicList);
		if (isEmpty(this.piclist)) return;
		//return;
		let iGoal = this.piclist.length - 1;
		console.log('iGoal', iGoal, Goal.pics[iGoal], 'i', i, pic)
		if (pic != Goal.pics[iGoal]) { Selected = { pics: this.piclist, wrong: pic, correct: Goal[iGoal] }; evaluate(false); }
		else if (this.piclist.length == Goal.pics.length) { Selected = { piclist: this.piclist }; evaluate(true); }
	}
	eval(isCorrect) {
		console.log('eval', isCorrect);
		console.log('piclist', this.piclist)
		Selected = { piclist: this.piclist, feedbackUI: this.piclist.map(x => x.div), sz: getBounds(this.piclist[0].div).height };
		return isCorrect;
	}
}









