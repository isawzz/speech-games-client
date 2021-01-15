class Game {
	constructor(name) { this.name = name; }
	clear() { clearTimeout(this.TO); clearFleetingMessage(); }
	startGame() { }
	startLevel() { }
	startRound() { }
	prompt() {
		showPicturesSpeechTherapyGames(evaluate);
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

class GInno extends Game {
	constructor(name) { super(name); }
	startLevel() {
		//console.log(G)
	}
	prompt() {
		maShowCards([], [], dTable);//_showPictures();
	}
	trialPrompt() {
		sayTryAgain();
		return 10;
	}
	eval(w, word) {
		Selected = { answer: w, reqAnswer: word, feedbackUI: Goal.div }; //this.inputs.map(x => x.div) };
		//console.log(Selected);
		return w == word;
	}
}

class GAbacus extends Game {
	constructor(name) { super(name); }
	startGame() {
		G.successFunc = successThumbsUp;
		G.failFunc = failThumbsDown;
		G.correctionFunc = this.showCorrectSequence.bind(this);
	}
	showCorrectSequence() { return numberSequenceCorrectionAnimation(); }
	startLevel() {
		if (!isList(G.steps)) G.steps = [G.steps];
		G.numPics = 2;
	}
	prompt() {
		mLinebreak(dTable, 2);

		showHiddenThumbsUpDown({ sz: 50 });
		mLinebreak(dTable);

		G.seq = makeExpSequence();

		//console.log('G.seq', G.seq);

		let panel = mDiv(dTable, { bg: '#00000080', padding: 40, rounding: 12 });
		//replace op in seq by wr
		//arrReplace(G.seq,G.op,OPS[G.op].wr);
		[G.words, G.letters] = showEquation(G.seq, panel);
		setNumberSequenceGoal();
		//console.log(G)

		mLinebreak(dTable,30);

		let instr1 = (Settings.language == 'E' ? 'calculate' : "rechne");
		//let s=G.seq;
		let instr2 = G.operand+' '+G.oop.sp+' '+G.step+' ?';
		//console.log(G);
		//instr1 = arrTake(G.seq,3).join(' ');
		showInstruction('', instr1, dTitle, true, instr2);


		if (G.level <= 1 && Settings.showHint) hintEngineStart(getOperationHintString,[0,1],5000 + G.level * 1000);

		activateUi();
	}
	trialPrompt() {
		//let hintlist = G.trialNumber >= 4 ? [G.trialNumber] : range(G.trialNumber, 4);
		//let initialDelay = 3000 + G.level * 1000;
		//if (Settings.showHint && !calibrating()) recShowHints(hintlist, QuestionCounter, initialDelay, d => initialDelay + 2000); //showNumSeqHint(G.trialNumber);
		setTimeout(() => getWrongChars().map(x => unfillChar(x)), 500);
		return 10;
	}
	activate() { onkeypress = this.interact; }
	interact(ev) {
		//console.log('key!');
		clearFleetingMessage();
		if (!canAct()) return;

		let sel = Selected = onKeyWordInput(ev);
		if (nundef(sel)) return;
		//console.log('===>', sel);

		//target,isMatch,isLastOfGroup,isVeryLast,ch
		let lastInputCharFilled = sel.target;
		console.assert(sel.isMatch == (lastInputCharFilled.letter == sel.ch), lastInputCharFilled, sel.ch);

		//all cases aufschreiben und ueberlegen was passieren soll!
		//TODO: multiple groups does NOT work!!!
		if (sel.isMatch && sel.isVeryLast) {
			deactivateFocusGroup();
			evaluate(true);
		} else if (sel.isMatch && sel.isLastOfGroup) {
			//it has been filled
			//remove this group from Goal.blankWords
			sel.target.isBlank = false;
			sel.target.group.hasBlanks = false;
			removeInPlace(Goal.blankWords, sel.target.group);
			removeInPlace(Goal.blankChars, sel.target);
			deactivateFocusGroup();
			console.log('haaaaaaaaaaaalo', Goal.isFocus)
			//console.log('=>', Goal)
		} else if (sel.isMatch) {
			//a partial match
			removeInPlace(Goal.blankChars, sel.target);
			sel.target.isBlank = false;
		} else if (sel.isVeryLast) {
			Selected.words = getInputWords();
			Selected.answer = getInputWordString();
			Selected.req = getCorrectWordString();
			deactivateFocusGroup();
			//console.log('LAST ONE WRONG!!!')
			evaluate(false);
			//user entered last missing letter but it is wrong!
			//can there be multiple errors in string?
		} else if (sel.isLastOfGroup) {
			//unfill last group

			Selected.words = getInputWords();
			Selected.answer = getInputWordString();
			Selected.req = getCorrectWordString();
			deactivateFocusGroup();
			evaluate(false);
			//user entered last missing letter but it is wrong!
			//can there be multiple errors in string?
		} else {
			if (!Settings.silentMode) { writeSound(); playSound('incorrect1'); }
			deactivateFocusGroup();
			//unfillCharInput(Selected.target);
			showFleetingMessage('does NOT fit: ' + Selected.ch, 0, { fz: 24 });
			setTimeout(() => unfillCharInput(Selected.target), 500);
		}
		//
	}

	eval(isCorrect) { return isCorrect; }

}

