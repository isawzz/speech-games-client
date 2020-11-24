var NumMissingLetters, nMissing, MaxPosMissing;
var inputs = [];
const LevelsML = {
	0: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 3, NumMissingLetters: 1, MaxPosMissing: 0, MaxNumTrials: 3 },
	1: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 4, NumMissingLetters: 1, MaxPosMissing: 0, MaxNumTrials: 3 },
	2: { NumPics: 1, NumLabels: 1, MinWordLength: 4, MaxWordLength: 5, NumMissingLetters: 2, MaxPosMissing: 1, MaxNumTrials: 3 },
	3: { NumPics: 1, NumLabels: 0, MinWordLength: 4, MaxWordLength: 6, NumMissingLetters: 1, MaxPosMissing: 0, MaxNumTrials: 3 },
	4: { NumPics: 1, NumLabels: 0, MinWordLength: 4, MaxWordLength: 7, NumMissingLetters: 2, MaxPosMissing: 1, MaxNumTrials: 3 },
	5: { NumPics: 1, NumLabels: 0, MinWordLength: 5, MaxWordLength: 8, NumMissingLetters: 1, MaxPosMissing: 1, MaxNumTrials: 3 },
	6: { NumPics: 1, NumLabels: 0, MinWordLength: 5, MaxWordLength: 9, NumMissingLetters: 1, MaxPosMissing: 12, MaxNumTrials: 3 },
	7: { NumPics: 1, NumLabels: 0, MinWordLength: 5, MaxWordLength: 10, NumMissingLetters: 2, MaxPosMissing: 12, MaxNumTrials: 3 },
	8: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 11, NumMissingLetters: 4, MaxPosMissing: 12, MaxNumTrials: 3 },
	9: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 12, NumMissingLetters: 5, MaxPosMissing: 12, MaxNumTrials: 3 },
	10: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 12, NumMissingLetters: 6, MaxPosMissing: 12, MaxNumTrials: 3 },
}
function startGameML() { }
function startLevelML() { levelML(); }
function levelML() {
	let levelInfo = LevelsML[currentLevel];
	MaxNumTrials = levelInfo.MaxNumTrials;
	MaxWordLength = levelInfo.MaxWordLength;
	MinWordLength = levelInfo.MinWordLength;
	setKeys();
	NumPics = levelInfo.NumPics;
	NumLabels = levelInfo.NumLabels;

	NumMissingLetters = levelInfo.NumMissingLetters;
	MaxPosMissing = levelInfo.MaxPosMissing;
	//console.log('NumMissing:' + NumMissingLetters, 'max pos:' + MaxPosMissing);
}
function startRoundML() { }

function promptML() {
	showPictures(false, () => fleetingMessage('just enter the missing letter!'));
	setGoal();

	showInstruction(bestWord, currentLanguage == 'E' ? 'complete' : "ergänze", dTitle, true);

	mLinebreak(dTable);

	// create sequence of letter ui
	let style = { margin: 6, fg: 'white', display: 'inline', bg: 'transparent', align: 'center', border: 'transparent', outline: 'none', family: 'Consolas', fz: 80 };
	let d = createLetterInputs(bestWord.toUpperCase(), dTable, style); // acces children: d.children

	// randomly choose 1-NumMissingLetters alphanumeric letters from bestWord
	let indices = getIndicesCondi(bestWord, (x, i) => isAlphaNum(x) && i <= MaxPosMissing);
	//console.log('indices (should be sorted!)',indices);
	nMissing = Math.min(indices.length, NumMissingLetters);
	let ilist = choose(indices, nMissing); sortNumbers(ilist);

	//console.log(typeof ilist[0],ilist);

	for (const idx of ilist) {
		let inp = d.children[idx];
		inp.innerHTML = '_';
		mClass(inp, 'blink');
		inputs.push({ letter: bestWord[idx].toUpperCase(), div: inp, index: idx });
	}

	mLinebreak(dTable);

	showFleetingMessage(composeFleetingMessage(), 3000);

	return 10;
}
function trialPromptML() {
	let selinp = Selected.inp;
	Speech.say(currentLanguage == 'D' ? 'nochmal!' : 'try again!');
	setTimeout(() => {
		//console.log('selected last:', selinp);
		let d = selinp.div;
		d.innerHTML = '_';
		mClass(d, 'blink');
		//inputs.push(selinp);
	}, skipAnimations ? 300 : 2000);

	showFleetingMessage(composeFleetingMessage(), 3000);
	return 10;
}
function buildWordFromLetters(d) {
	let letters = Array.from(d.children);
	let s = letters.map(x => x.innerHTML);
	s = s.join('')
	return s;
}
function activateML() {
	onkeypress = ev => {
		clearFleetingMessage();
		if (uiPaused || ev.ctrlKey || ev.altKey) return;
		let charEntered = ev.key.toString();
		if (!isAlphaNum(charEntered)) return;

		Selected = { lastLetterEntered: charEntered.toUpperCase() };
		//console.log(inputs[0].div.parentNode)

		if (nMissing == 1) {
			let d = Selected.feedbackUI = inputs[0].div;
			Selected.lastIndexEntered = inputs[0].index;
			Selected.inp = inputs[0];
			d.innerHTML = Selected.lastLetterEntered;
			mRemoveClass(d, 'blink');
			let result = buildWordFromLetters(mParent(d));
			//console.log('selected last:', Selected)

			evaluate(result);
		} else {
			let ch = charEntered.toUpperCase();
			for (const inp of inputs) {
				if (inp.letter == ch) {
					//found a matching letter
					Selected.lastIndexEntered = inp.index;
					Selected.inp = inp;
					let d = Selected.feedbackUI = inp.div;
					d.innerHTML = ch;
					mRemoveClass(d, 'blink');
					removeInPlace(inputs, inp);
					nMissing -= 1;
					break;
				}
			}
			if (nundef(Selected.lastIndexEntered)) {
				//the user entered a non existing letter!!!
				showFleetingMessage('you entered ' + Selected.lastLetterEntered)
				Speech.say('this letter does NOT belong to the word!')
			}
			showFleetingMessage(composeFleetingMessage(), 3000);
			//if get to this place that input did not match!
			//ignore for now!
		}
	}
}
function evalML(word) {
	let answer = normalize(word, currentLanguage);
	let reqAnswer = normalize(bestWord, currentLanguage);

	Selected.reqAnswer = reqAnswer;
	Selected.answer = answer;

	if (answer == reqAnswer) return true;
	else if (currentLanguage == 'D' && isEnglishKeyboardGermanEquivalent(reqAnswer, answer)) {
		return true;
	} else {
		return false;
	}
}

// game specific helpers
function composeFleetingMessage() {
	let lst = inputs;
	let msg = lst.map(x => x.letter).join(',');
	let edecl = lst.length > 1 ? 's ' : ' ';
	let ddecl = lst.length > 1 ? 'die' : 'den';
	let s = (currentLanguage == 'E' ? 'Type the letter' + edecl : 'Tippe ' + ddecl + ' Buchstaben ');
	return s + msg;
}
function createLetterInputs(s, dTable, style, idForContainerDiv) {
	let d = mDiv(dTable);
	if (isdef(idForContainerDiv)) d.id = idForContainerDiv;
	inputs = [];
	for (let i = 0; i < s.length; i++) {
		let d1 = mCreate('div');
		mAppend(d, d1);
		d1.innerHTML = s[i];
		mStyleX(d1, style);
	}
	return d;
}









