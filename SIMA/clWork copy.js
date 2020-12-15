class Game {
	constructor() {
	}
	clear() { clearTimeout(this.TO); clearFleetingMessage(); }//console.log(getFunctionCallerName()); }
	startGame() { }//console.log(getFunctionCallerName()); }
	startLevel() { }//console.log(getFunctionCallerName()); }
	startRound() { }//console.log(getFunctionCallerName()); }
	prompt() {
		//console.log(getFunctionCallerName());
		showPictures(evaluate);
		setGoal();
		showInstruction(Goal.label, 'click', dTitle, true);
		activateUi();
	}
	trialPrompt() {
		//console.log(getFunctionCallerName());
		Speech.say(Settings.language == 'D' ? 'nochmal!' : 'try again!');
		if (Settings.showHint) shortHintPic();
		return 10;
	}
	activate() { }//console.log(getFunctionCallerName()); }
	interact() { }//console.log(getFunctionCallerName()); }
	eval(ev) {
		//console.log(getFunctionCallerName());
		let id = evToClosestId(ev);
		ev.cancelBubble = true;

		let i = firstNumber(id);
		let item = Pictures[i];
		Selected = { pic: item, feedbackUI: item.div, sz: getBounds(item.div).height };

		Selected.reqAnswer = Goal.label;
		Selected.answer = item.label;

		if (item.label == Goal.label) { return true; } else { return false; }
	}
	recycle() { }//console.log(getFunctionCallerName()); }
}

class GMissingNumber extends Game {
	constructor() {
		super();
	}
	startGame() {
		G.successFunc = successThumbsUp;
		G.failFunc = failThumbsDown;
		G.correctionFunc = this.showCorrectSequence.bind(this);
	}
	showCorrectSequence() {
		console.log('the correct sequence is', Goal.seq)
	}
	startLevel() {
		this.numMissing = G.numMissingLetters = getGameOrLevelInfo('numMissing', 1);
		this.max = G.maxNumber = getGameOrLevelInfo('max', 20);
		this.pos = G.posMissing = getGameOrLevelInfo('posMissing', 'consec');
		this.step = G.step = getGameOrLevelInfo('step', 1);
		this.seqlen = G.lengthOfSequence = getGameOrLevelInfo('length', 5);
		G.numPics = 2; G.numLabels = 0;
	}
	prompt() {
		showInstruction('', Settings.language == 'E' ? 'complete the sequence' : "ergänze die reihe", dTitle, true);
		mLinebreak(dTable, 12);

		showHiddenThumbsUpDown({ sz: 140 });
		mLinebreak(dTable);

		let seq = this.seq = getRandomNumberSequence(this.seqlen, 0, this.max, this.step);



		let label = this.label = seq.join(', ');

		//zuerst bestimme die missing numbers
		let pos = this.pos;
		let iMissing = []; // indices in seq
		if (pos == 'end') { for (let x = 1; x <= this.numMissing; x++) { iMissing.push(this.seqlen - x); } }
		else if (pos == 'start') { for (let x = 0; x < this.numMissing; x++) { iMissing.push(x); } }
		else iMissing = choose(range(0, this.seqlen - 1, 1), this.numMissing);

		//console.log('iMissing', iMissing);
		let missingNumbers = iMissing.map(x => seq[x]);
		//console.log('the missing numbers are:',missingNumbers);

		let info = [];
		for (const i of iMissing) { let n = seq[i]; info.push({ i: i, n: n }); }

		//console.log('info', info);

		// erstmal stelle fest wieviele letters sich aus der summe der missing numbers ergeben
		let sum = 0;
		for (let i = 0; i < iMissing.length; i++) {
			//let idx=iMissing[i];
			//console.log(i, info[i])
			sum += info[i].n.toString().length;
		}

		//console.log('MN:', seq, label, '\niMissing', iMissing, '\nsum', sum);
		this.nMissing = sum;

		let ilist = []; // indices in label
		//console.log('pos', pos);
		let SAFE = 100;
		//console.log('pos', pos, 'sum', sum);

		let wlen = label.length;
		if (pos == 'end') {
			//from label remove sum alphanumeric letters and remember their indices
			let i = label.length - 1;
			let nrem = 0;
			let x = i;

			//console.log('i', i, 'nrem', nrem, 'x', x);
			while (nrem < sum && x >= 0) {
				if (SAFE <= 0) break; SAFE -= 1;
				while (x >= 0 && !isAlphaNum(label[x])) x -= 1;
				while (x >= 0 && isAlphaNum(label[x]) && nrem < sum) { ilist.push(x); nrem += 1; x -= 1; }
			}
		}
		else if (pos == 'start') {
			//from label remove sum alphanumeric letters and remember their indices
			let i = 0;
			let nrem = 0;
			let x = i;

			console.log('i', i, 'nrem', nrem, 'x', x);
			while (nrem < sum && x < wlen) {
				if (SAFE <= 0) break; SAFE -= 1;
				while (x < wlen && !isAlphaNum(label[x])) x += 1;
				while (x < wlen && isAlphaNum(label[x]) && nrem < sum) { ilist.push(x); nrem += 1; x += 1; }
			}
		}
		else if (pos == 'consec') {
			//from label remove sum alphanumeric letters and remember their indices
			let i = 0;
			let nrem = 0;
			let x = i;


			console.log('i', i, 'nrem', nrem, 'x', x);
			let numrem = this.numMissing; let inumrem = 0;
			while (nrem < sum && x < wlen && inumrem < numrem) {
				let snum = info[inumrem].n.toString();
				let x = label.indexOf(snum);
				inumrem += 1;
				console.log('x should be index of ', snum, ' in label:', x);
				if (SAFE <= 0) break; SAFE -= 1;

				while (x < wlen && !isAlphaNum(label[x])) x += 1;
				while (x < wlen && isAlphaNum(label[x]) && nrem < sum) { ilist.push(x); nrem += 1; x += 1; }

			}
		}
		else if (pos == 'random') {

			// randomly choose 1-NumMissingLetters alphanumeric letters from Goal.label
			let indices = getIndicesCondi(label, (x, i) => isAlphaNum(x));
			ilist = choose(indices, sum);

		}
		sortNumbers(ilist);
		//console.log('ilist', ilist);

		Goal = { label: label, seq: seq, missingNumbers: missingNumbers };

		// create sequence of letter ui
		//let fg = ['yellow', 'skyblue', 'salmon', 'lime', 'gold', 'springgreen'];
		//let fg = ['blue', 'green', 'navy', 'indigo'].map(x => colorBright(x, 50)).concat(['orange','deepskyblue', 'lime', 'springgreen', 'skyblue', 'yellow', 'gold', 'greenyellow']);
		//fg = fg.map(x=>colorBright(x,50));
		let fg = ['orange', 'deepskyblue', 'lime', 'springgreen', 'skyblue', 'yellow', 'gold', 'greenyellow']
		let style = {
			fg: fg, display: 'inline', bg: 'transparent', align: 'center',
			border: 'transparent', outline: 'none', fz: 68
		};
		let d = createLetterInputs(Goal.label.toUpperCase(), dTable, style, undefined, false); // access children: d.children
		//d.style.padding = '50px';

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
		if (Settings.showHint) showFleetingMessage(msg, 3000);
		activateUi();

	}
	trialPrompt() {
		Speech.say(Settings.language == 'D' ? 'nochmal!' : 'try again!');

		let selinp = Selected.inp;
		setTimeout(() => {
			let d = selinp.div;
			d.innerHTML = '_';
			mClass(d, 'blink');
		}, 1500);

		if (Settings.showHint) showFleetingMessage(this.composeFleetingMessage(), 3000);
		return 10;
	}
	activate() {
		onkeypress = ev => {
			clearFleetingMessage();
			if (!canAct()) return;
			let charEntered = ev.key.toString();
			if (!isAlphaNum(charEntered)) return;

			Selected = { lastLetterEntered: charEntered.toUpperCase() };
			//console.log('activate', this.nMissing, charEntered)

			if (this.nMissing == 1) {
				let d = Selected.feedbackUI = this.inputs[0].div;
				//Selected.positiveFeedbackUI = Goal.div;
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
					Speech.say(Settings.language == 'E' ? 'think again!' : 'ueberlege!')
				}
				showFleetingMessage(this.composeFleetingMessage(), 3000);
				//if get to this place that input did not match!
				//ignore for now!
			}
		}

	}
	eval(word) {
		let answer = word; //normalize(word, Settings.language);
		let reqAnswer = Goal.label; // normalize(Goal.label, Settings.language);

		//console.log('eval', reqAnswer, answer)

		Selected.reqAnswer = reqAnswer;
		Selected.answer = answer;

		if (answer == reqAnswer) {
			return true;

		} else {
			return false;
		}
	}
	composeFleetingMessage() {
		//console.log('this', this)
		let lst = Goal.missingNumbers;
		//console.log(this.inputs)
		let msg = lst.join(',');
		let edecl = lst.length > 1 ? 's are ' : ' is ';
		let ddecl = lst.length > 1 ? 'en ' : 't ';
		let s = (Settings.language == 'E' ? 'the missing number' + edecl : 'es fehl' + ddecl);
		return s + msg;
	}

}

function colorBright(c, percent) {
	let hex = colorHex(c);
	// strip the leading # if it's there
	hex = hex.replace(/^\s*#|\s*$/g, '');

	// convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
	if (hex.length == 3) {
		hex = hex.replace(/(.)/g, '$1$1');
	}

	var r = parseInt(hex.substr(0, 2), 16),
		g = parseInt(hex.substr(2, 2), 16),
		b = parseInt(hex.substr(4, 2), 16);

	return '#' +
		((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
		((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
		((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}
function colorBright1(c, percent = 50) {
	let hsl = colorHSL(c, true);
	let hNew = { h: hsl.h, s: hsl.s, l: hsl.l + hsl.l * (percent / 100) }
	return hNew;
}
function getRandomNumberSequence(n, minStart, maxStart, fBuild) {
	let nStart = randomNumber(minStart, maxStart - n + 1);
	if (isNumber(fBuild)) return range(nStart, nStart + (n - 1) * fBuild, fBuild);
	else {
		let res = [], x = nStart;
		for (let i = 0; i < n; i++) {
			res.push(x);
			x = fBuild(x);
		}
		return res;
	}


}