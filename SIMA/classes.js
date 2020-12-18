
class GTouchPic extends Game {
	constructor(name) { super(name); }
}
class GTouchColors extends Game {
	static SIMPLE_COLORS = ['red', 'green', 'yellow', 'blue'];
	constructor(name) { super(name); }
	startLevel() {
		G.numColors = getGameOrLevelInfo('numColors', 2);
		G.numLabels = G.numColors * G.numPics;
		this.colorlist = lookupSet(GS, [this.name, 'colors'], GTouchColors.SIMPLE_COLORS);
		this.contrast = lookupSet(GS, [this.name, 'contrast'], .35);
		G.keys = G.keys.filter(x => containsColorWord(x));
		//console.log('GTouchColors keys', G.keys);
	}
	prompt() {
		this.colors = choose(this.colorlist, G.numColors);
		showPictures(evaluate, { colors: this.colors, contrast: this.contrast });

		setGoal(randomNumber(0, G.numPics * this.colors.length - 1));
		Goal.correctionPhrase = Goal.textShadowColor + ' ' + Goal.label;

		let spoken = `click the ${Goal.textShadowColor} ${Goal.label}`;
		showInstruction(Goal.label, `click the <span style='color:${Goal.textShadowColor}'>${Goal.textShadowColor.toUpperCase()}</span>`,
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
class GMem extends Game {
	constructor(name) { super(name); }
	clear() { clearTimeout(this.TO); showMouse(); }
	prompt() {
		showPictures(this.interact.bind(this), { repeat: G.numRepeat, sameBackground: true, border: '3px solid #ffffff80' });
		setGoal();

		if (G.level > 2) { showInstruction('', 'remember all', dTitle, true); }
		else { showInstruction(Goal.label, 'remember', dTitle, true); }

		let secs = calcMemorizingTime(G.numPics, G.level > 2);

		hideMouse();
		TOMain = setTimeout(() => turnCardsAfter(secs), 300, G.level >= 5); //needed fuer ui update! sonst verschluckt er last label

	}
	interact(ev) {
		//console.log('interact!', ev);
		ev.cancelBubble = true;
		if (!canAct()) return;

		let id = evToClosestId(ev);
		let i = firstNumber(id);
		let pic = Pictures[i];
		toggleFace(pic);

		if (G.trialNumber == Settings.trials - 1) {
			turnFaceUp(Goal);
			TOMain = setTimeout(() => evaluate(ev), 100);
		} else evaluate(ev);
	}
}
class GWritePic extends Game {
	constructor(name) { super(name); }
	startGame() {
		onkeydown = ev => {
			if (!canAct()) return;
			if (isdef(this.inputBox)) { this.inputBox.focus(); }
		}
	}
	prompt() {
		showPictures(() => mBy(this.defaultFocusElement).focus());
		setGoal();

		showInstruction(Goal.label, Settings.language == 'E' ? 'type' : "schreib'", dTitle, true);

		mLinebreak(dTable);
		this.inputBox = addNthInputElement(dTable, G.trialNumber);
		this.defaultFocusElement = this.inputBox.id;

		activateUi();
		//return 10;
	}
	trialPrompt() {
		Speech.say(Settings.language == 'E' ? 'try again!' : 'nochmal', 1, 1, .8, 'zira');
		mLinebreak(dTable);
		this.inputBox = addNthInputElement(dTable, G.trialNumber);
		this.defaultFocusElement = this.inputBox.id;

		return 10;
	}
	activate() {
		this.inputBox.onkeyup = ev => {
			if (ev.ctrlKey || uiPaused) return;
			if (ev.key === "Enter") {
				ev.cancelBubble = true;
				evaluate(ev);
			}
		};
		this.inputBox.focus();
	}
	eval(ev) {
		let answer = normalize(this.inputBox.value, Settings.language);
		let reqAnswer = normalize(Goal.label, Settings.language);

		Selected = { reqAnswer: reqAnswer, answer: answer, feedbackUI: Goal.div };
		if (answer == reqAnswer) return true; else { return false; }
	}

}
class GMissingLetter extends Game {
	constructor(name) { super(name); }
	startLevel() {
		G.numMissingLetters = getGameOrLevelInfo('numMissing', 1);
		let pos = getGameOrLevelInfo('posMissing', 'random');
		G.maxPosMissing = pos == 'start' ? G.numMissingLetters - 1 : 100;

	}
	prompt() {
		showPictures(() => fleetingMessage('just enter the missing letter!'));
		setGoal();

		showInstruction(Goal.label, Settings.language == 'E' ? 'complete' : "ergänze", dTitle, true);

		mLinebreak(dTable);

		// create sequence of letter ui
		let style = { margin: 6, fg: 'white', display: 'inline', bg: 'transparent', align: 'center', border: 'transparent', outline: 'none', family: 'Consolas', fz: 80 };
		let d = createLetterInputs(Goal.label.toUpperCase(), dTable, style); // acces children: d.children

		// randomly choose 1-G.numMissingLetters alphanumeric letters from Goal.label
		let indices = getIndicesCondi(Goal.label, (x, i) => isAlphaNum(x) && i <= G.maxPosMissing);
		this.nMissing = Math.min(indices.length, G.numMissingLetters);
		//console.log('nMissing is', this.nMissing, G.numPosMissing, G.maxPosMissing, indices, indices.length)
		let ilist = choose(indices, this.nMissing); sortNumbers(ilist);

		this.inputs = [];
		for (const idx of ilist) {
			let inp = d.children[idx];
			inp.innerHTML = '_';
			mClass(inp, 'blink');
			this.inputs.push({ letter: Goal.label[idx].toUpperCase(), div: inp, index: idx });
		}

		mLinebreak(dTable);

		let msg = this.composeFleetingMessage();
		//console.log('msg,msg', msg)
		showFleetingMessage(msg, 3000);
		activateUi();

	}
	trialPromptML() {
		let selinp = Selected.inp;
		Speech.say(Settings.language == 'D' ? 'nochmal!' : 'try again!');
		setTimeout(() => {
			let d = selinp.div;
			d.innerHTML = '_';
			mClass(d, 'blink');
		}, 1500);

		showFleetingMessage(this.composeFleetingMessage(), 3000);
		return 10;
	}
	activate() {
		onkeypress = ev => {
			clearFleetingMessage();
			if (!canAct()) return;
			let charEntered = ev.key.toString();
			if (!isAlphaNum(charEntered)) return;

			Selected = { lastLetterEntered: charEntered.toUpperCase() };
			//console.log(inputs[0].div.parentNode)

			if (this.nMissing == 1) {
				let d = Selected.feedbackUI = this.inputs[0].div;
				Selected.positiveFeedbackUI = Goal.div;
				Selected.lastIndexEntered = this.inputs[0].index;
				Selected.inp = this.inputs[0];
				d.innerHTML = Selected.lastLetterEntered;
				mRemoveClass(d, 'blink');
				let result = buildWordFromLetters(mParent(d));

				evaluate(result);
			} else {
				let ch = charEntered.toUpperCase();
				for (const inp of this.inputs) {
					if (inp.letter == ch) {
						Selected.lastIndexEntered = inp.index;
						Selected.inp = inp;
						let d = Selected.feedbackUI = inp.div;
						d.innerHTML = ch;
						mRemoveClass(d, 'blink');
						removeInPlace(this.inputs, inp);
						this.nMissing -= 1;
						break;
					}
				}
				if (nundef(Selected.lastIndexEntered)) {
					//the user entered a non existing letter!!!
					showFleetingMessage('you entered ' + Selected.lastLetterEntered)
					Speech.say(Settings.language == 'E' ? 'try a different letter!' : 'anderer Buchstabe!')
				}
				showFleetingMessage(this.composeFleetingMessage(), 3000);
				//if get to this place that input did not match!
				//ignore for now!
			}
		}

	}
	eval(word) {
		let answer = normalize(word, Settings.language);
		let reqAnswer = normalize(Goal.label, Settings.language);

		Selected.reqAnswer = reqAnswer;
		Selected.answer = answer;

		if (answer == reqAnswer) return true;
		else if (Settings.language == 'D' && isEnglishKeyboardGermanEquivalent(reqAnswer, answer)) {
			return true;
		} else {
			return false;
		}
	}
	composeFleetingMessage() {
		//console.log('this', this)
		let lst = this.inputs;
		//console.log(this.inputs)
		let msg = lst.map(x => x.letter).join(',');
		let edecl = lst.length > 1 ? 's ' : ' ';
		let ddecl = lst.length > 1 ? 'die' : 'den';
		let s = (Settings.language == 'E' ? 'Type the letter' + edecl : 'Tippe ' + ddecl + ' Buchstaben ');
		return s + msg;
	}

}
class GSayPic extends Game {
	constructor(name) { super(name); }
	prompt() {

		showPictures(() => mBy(defaultFocusElement).focus());
		setGoal();

		showInstruction(Goal.label, Settings.language == 'E' ? 'say:' : "sage: ", dTitle);
		animate(dInstruction, 'pulse800' + bestContrastingColor(G.color, ['yellow', 'red']), 900);

		mLinebreak(dTable);
		MicrophoneUi = mMicrophone(dTable, G.color);
		//console.log('MicrophoneUi',MicrophoneUi)
		MicrophoneHide();

		TOMain = setTimeout(activateUi, 200);

	}
	trialPrompt(nTrial) {
		let phrase = nTrial < 2 ? (Settings.language == 'E' ? 'speak UP!!!' : 'LAUTER!!!')
			: (Settings.language == 'E' ? 'Louder!!!' : 'LAUTER!!!');
		Speech.say(phrase, 1, 1, 1, 'zira');
		animate(dInstruction, 'pulse800' + bestContrastingColor(G.color, ['yellow', 'red']), 500);
		return 10;
	}
	activate() {
		//console.log('hallo')
		if (Speech.isSpeakerRunning()) {
			TOMain = setTimeout(this.activate.bind(this), 200);
		} else {
			TOMain = setTimeout(() => Speech.startRecording(Settings.language, evaluate), 100);
		}

	}
	eval(isfinal, speechResult, confidence) {

		let answer = Goal.answer = normalize(speechResult, Settings.language);
		let reqAnswer = Goal.reqAnswer = normalize(Goal.label, Settings.language);

		Selected = { reqAnswer: reqAnswer, answer: answer, feedbackUI: Goal.div };

		if (isEmpty(answer)) return false;
		else return isSimilar(answer, reqAnswer);

	}
}
class GPremem extends Game {
	constructor() { super(); this.picList = []; }
	prompt() {
		this.picList = [];
		//console.log(this.picList)
		showPictures(this.interact.bind(this), { repeat: G.numRepeat, sameBackground: true, border: '3px solid #ffffff80' });
		showInstruction('', 'click any picture', dTitle, true);
		activateUi();
	}
	trialPrompt() {
		for (const p of this.picList) { toggleSelectionOfPicture(p); }
		this.picList = [];
		showInstruction('', 'try again: click any picture', dTitle, true);
		return 10;
	}
	interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) return;

		let id = evToClosestId(ev);
		let i = firstNumber(id);
		let pic = Pictures[i];
		let div = pic.div;
		if (!isEmpty(this.picList) && this.picList.length < G.numRepeat - 1 && this.picList[0].label != pic.label) return;
		toggleSelectionOfPicture(pic, this.picList);
		console.log('clicked', pic.key, this.picList);//,picList, GPremem.PicList);
		if (isEmpty(this.picList)) {
			showInstruction('', 'click any picture', dTitle, true);
		} else if (this.picList.length < G.numRepeat - 1) {
			//set incomplete: more steps are needed!
			//frame the picture
			showInstruction(pic.label, 'click another', dTitle, true);
		} else if (this.picList.length == G.numRepeat - 1) {
			// look for last picture with x that is not in the set
			let picGoal = firstCond(Pictures, x => x.label == pic.label && !x.isSelected);
			setGoal(picGoal.index);
			showInstruction(picGoal.label, 'click the ' + (G.numRepeat == 2 ? 'other' : 'last'), dTitle, true);
		} else {
			//set is complete: eval
			evaluate(this.picList);
		}
	}
	eval(piclist) {
		Selected = { piclist: piclist, feedbackUI: piclist.map(x => x.div), sz: getBounds(piclist[0].div).height };
		let req = Selected.reqAnswer = piclist[0].label;
		Selected.answer = piclist[piclist.length - 1].label;
		if (Selected.answer == req) { return true; } else { return false; }
	}
}
class GMissingNumber extends Game {
	constructor(name) { super(name); }
	startGame() {
		G.successFunc = successThumbsUp;
		G.failFunc = failThumbsDown;
		G.correctionFunc = this.showCorrectSequence.bind(this);
	}
	showCorrectSequence() { return numberSequenceCorrectionAnimation(); }
	startLevel() {
		G.numMissingLetters = getGameOrLevelInfo('numMissing', 1);
		G.minNumber = getGameOrLevelInfo('min', 0);
		G.maxNumber = getGameOrLevelInfo('max', 20);
		G.posMissing = getGameOrLevelInfo('posMissing', 'consec');
		G.steps = getGameOrLevelInfo('steps', 1);
		if (!isList(G.steps)) G.steps = [G.steps];
		G.ops = getGameOrLevelInfo('ops', ['add']);
		G.lengthOfSequence = getGameOrLevelInfo('length', 5);
		G.numPics = 2;
		G.numLabels = 0;
	}
	prompt() {
		mLinebreak(dTable, 12);

		showHiddenThumbsUpDown({ sz: 140 });
		mLinebreak(dTable);

		G.step = chooseRandom(G.steps);
		G.op = chooseRandom(G.ops);
		[G.words, G.letters, G.seq] = createNumberSequence(G.lengthOfSequence, G.minNumber, G.maxNumber, G.step, G.op);
		setNumberSequenceGoal();
		//console.log(G)
		//G.seq = setGoalWordInputs(G.lengthOfSequence, G.minNumber, G.maxNumber, G.step, G.op);

		mLinebreak(dTable);

		let instr1 = (Settings.language == 'E' ? 'complete the sequence' : "ergänze die reihe");
		showInstruction('', instr1, dTitle, true);

		if (calibrating()) {activateUi(); return;}

		if (Settings.isTutoring){longNumSeqHint();}
		else if (G.level <= 1) { longNumSeqHint(); }
		else if (G.level <= 3){mediumNumSeqHint();}
		else if (G.level <= 5){shortNumSeqHint();}
		else if (G.level <= 7){shortNumSeqHint(true,false);}

		activateUi();
	}
	trialPrompt() {
		Speech.say(Settings.language == 'D' ? 'nochmal!' : 'try again!');
		setTimeout(() => getWrongChars().map(x => unfillChar(x)), 500);
		if (Settings.showHint) showFleetingMessage(getNumSeqHint(), 2200, {fz:22});
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
			playSound('incorrect1');
			deactivateFocusGroup();
			//unfillCharInput(Selected.target);
			showFleetingMessage('does NOT fit: ' + Selected.ch, 0, { fz: 24 });
			setTimeout(() => unfillCharInput(Selected.target), 500);
		}
		//
	}

	eval(isCorrect) { return isCorrect; }

}



function getInstance(G) { return new (GAME[G.key].cl)(G.key); }





const GAME = {
	gTouchPic: { friendly: 'Pictures!', logo: 'computer mouse', color: 'deepskyblue', cl: GTouchPic, },
	gTouchColors: { friendly: 'Colors!', logo: 'artist palette', color: RED, cl: GTouchColors, }, //'orange', //LIGHTBLUE, //'#bfef45',
	gPremem: { friendly: 'Premem!', logo: 'hammer and wrench', color: LIGHTGREEN, cl: GPremem, }, //'deeppink',
	gMem: { friendly: 'Memory!', logo: 'memory', color: GREEN, cl: GMem, }, //'#3cb44b'
	gMissingLetter: { friendly: 'Letters!', logo: 'black nib', color: 'gold', cl: GMissingLetter, },
	gMissingNumber: { friendly: 'Sequence!', logo: 'fleur-de-lis', color: 'deeppink', cl: GMissingNumber, },
	gWritePic: { friendly: 'Type it!', logo: 'keyboard', color: 'orange', cl: GWritePic, }, //LIGHTGREEN, //'#bfef45',
	gSayPic: { friendly: 'Speak up!', logo: 'microphone', color: BLUE, cl: GSayPic, }, //'#4363d8',
	gSteps: { friendly: 'Steps!', logo: 'stairs', color: PURPLE, cl: GSteps, }, //'#911eb4',
};


