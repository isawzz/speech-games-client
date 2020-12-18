var TOList;

function addNthInputElement(dParent, n) {
	mLinebreak(dParent, 10);
	let d = mDiv(dParent);
	let dInp = mCreate('input');
	dInp.type = "text"; dInp.autocomplete = "off";
	dInp.style.margin = '10px;'
	dInp.id = 'inputBox' + n;
	dInp.style.fontSize = '20pt';
	mAppend(d, dInp);
	return dInp;
}

//#region animations
function animateColor(elem, from, to, classes, ms) {
	elem.style.backgroundColor = from;
	setTimeout(() => animate(elem, classes, ms), 10);
}
function animate(elem, aniclass, timeoutms) {
	mClass(elem, aniclass);
	setTimeout(() => mRemoveClass(elem, aniclass), timeoutms);
}
// function animate(elem, aniclass, timeoutms) {
// 	if (!(isList(aniclass))) aniclass=[aniclass];
// 	mClasses(elem, aniclass);
// 	setTimeout(() => mRemoveClasses(elem, aniclass), timeoutms);
// }
function aniInstruction(spoken) {
	if (isdef(spoken)) Speech.say(spoken, .7, 1, .7, 'random'); //, () => { console.log('HA!') });
	mClass(dInstruction, 'onPulse');
	setTimeout(() => mRemoveClass(dInstruction, 'onPulse'), 500);

}
function aniFadeInOut(elem, secs) {
	mClass(elem, 'transopaOn');
	//dLineBottomMiddle.opacity=0;
	//mClass(dLineBottomMiddle,'aniFadeInOut');
	setTimeout(() => { mRemoveClass(elem, 'transopaOn'); mClass(elem, 'transopaOff'); }, secs * 1000);
}
function aniPulse(elem, ms) { animate(elem, 'onPulse', ms); }
//#endregion

//#region createLetterInputs
function buildWordFromLetters(dParent) {
	let letters = Array.from(dParent.children);
	let s = letters.map(x => x.innerHTML);
	s = s.join('');
	return s;
}
function isVariableColor(c) { return c == 'random' || c == 'randPastel' || c == 'randDark' || c == 'randLight' || isList(c); }
function createLetterInputs(s, dParent, style, idForContainerDiv, colorWhiteSpaceChars = true, preserveColorsBetweenWhiteSpace = true) {
	let d = mDiv(dParent);
	if (isdef(idForContainerDiv)) d.id = idForContainerDiv;
	inputs = [];
	let whiteStyle = jsCopy(style);
	if (!colorWhiteSpaceChars) {
		if (isdef(whiteStyle.fg)) delete whiteStyle.fg;
		if (isdef(whiteStyle.bg)) delete whiteStyle.bg;
		if (isdef(whiteStyle.border)) delete whiteStyle.border;
	}
	//console.log('style', style, '\nwhiteStyle', whiteStyle);
	let fg, fgOrig, bg, bgOrig;
	fgOrig = style.fg;
	bgOrig = style.bg;
	if (isVariableColor(fgOrig) && isdef(style.fg)) { fg = computeColorX(fgOrig); style.fg = fg; }
	if (isVariableColor(bgOrig) && isdef(style.bg)) { bg = computeColorX(bgOrig); style.bg = bg; }
	for (let i = 0; i < s.length; i++) {
		let d1 = mCreate('div');
		mAppend(d, d1);
		d1.innerHTML = s[i];
		let white = isWhiteSpace2(s[i]);
		if (white) {
			if (isVariableColor(fgOrig) && isdef(style.fg)) { fg = computeColorX(fgOrig); style.fg = fg; }
			if (isVariableColor(bgOrig) && isdef(style.bg)) { bg = computeColorX(bgOrig); style.bg = bg; }
		}
		//console.log('white(' + s[i] + ') =', white);
		mStyleX(d1, white ? whiteStyle : style);
	}
	return d;
}
//#endregion createLetterInputs

//#region createWordInputs
function createWordInputs(words, dParent, idForContainerDiv, sep = null, styleContainer = {}, styleWord = {}, styleLetter = {}, styleSep = {}, colorWhiteSpaceChars = true, preserveColorsBetweenWhiteSpace = true) {

	if (isEmpty(styleWord)) {
		let sz = 80;
		styleWord = {
			margin: 10, padding: 4, rounding: '50%', w: sz, h: sz, display: 'flex', fg: 'lime', bg: 'yellow', 'align-items': 'center',
			border: 'transparent', outline: 'none', fz: sz - 25, 'justify-content': 'center',
		};

	}

	let dContainer = mDiv(dParent);
	if (!isEmpty(styleContainer)) mStyleX(dContainer, styleContainer); else mClass(dContainer, 'flexWrap');
	dContainer.id = idForContainerDiv;

	let inputGroups = [];
	let charInputs = [];

	//charInputs sollen info: {iGroup,iPhrase,iWord,char,word,phrase,div,dGroup,dContainer,ofg,obg,ostyle,oclass}
	//groups sollen haben: [{div,ofg,obg,ostyle,oclass,[charInputs]},...]
	let iWord = 0;
	let idx = 0;
	let numWords = words.length;

	//pure color wheel
	let wheel = getHueWheel(G.color, 40, numWords <= 4 ? 60 : numWords <= 10 ? 30 : 15, 0);
	wheel = wheel.map(x => colorHSLBuild(x, 100, 50));
	wheel = shuffle(wheel);

	//shaded color wheel
	let wheel1 = colorPalShadeX(anyColorToStandardString(wheel[0]), numWords);
	wheel = jsCopy(wheel1);
	//reverse the wheel if subtract
	if (G.op == 'add') wheel.reverse();


	//console.log('wheel',wheel1, wheel)
	for (const w of words) {
		let dGroup = mDiv(dContainer);
		// let dGroup = mCreate('div');
		// mAppend(dContainer, dGroup);
		mStyleX(dGroup, styleWord);

		let bg = wheel[iWord]; // dGroup.style.backgroundColor=randomColorX(G.color,40,60,0,50,50);//'yellow';//randomColorX(G.color,70,80);
		//console.log('bg', bg);
		dGroup.style.backgroundColor = bg;
		dGroup.style.color = colorIdealText(bg);// randomColorX(bg,20,30);

		dGroup.id = idForContainerDiv + '_' + iWord;
		//mClass(dGroup,'flex')
		let g = { dParent: dContainer, word: w, iWord: iWord, div: dGroup, oStyle: styleWord, ofg: dGroup.style.color, obg: dGroup.style.backgroundColor };
		inputGroups.push(g);

		//here have to add inputs into group for word w
		let inputs = [];
		let iLetter = 0;
		let wString = w.toString();
		for (const l of wString) {
			let dLetter = mDiv(dGroup);
			// let dLetter = mCreate('div');
			// mAppend(dGroup, dLetter);
			if (!isEmpty(styleLetter)) mStyleX(dLetter, styleLetter);
			dLetter.innerHTML = l;
			let inp = { group: g, div: dLetter, letter: l, iLetter: iLetter, index: idx, oStyle: styleLetter, ofg: dLetter.style.color, obg: dLetter.style.backgroundColor };
			charInputs.push(inp);
			inputs.push(inp);
			iLetter += 1; idx += 1;
		}
		g.charInputs = inputs;

		//here have to add separator! if this is not the last wor of group!
		if (iWord < words.length - 1 && isdef(sep)) {
			let dSep = mDiv(dContainer);
			dSep.innerHTML = sep;
			if (isdef(styleSep)) mStyleX(dSep, styleSep);
		}

		iWord += 1;
	}

	return { words: inputGroups, letters: charInputs };
}
function createNumberSequence(n, min, max, step, op = 'add') {

	let fBuild = x => { return op == 'add' ? (x + step) : op == 'subtract' ? (x - step) : x; };
	if (op == 'subtract') min += step * (n - 1);
	if (min >= (max - 10)) max = min + 10;
	let seq = getRandomNumberSequence(n, min, max, fBuild);
	let wi = createWordInputs(seq, dTable, 'dNums');
	return [wi.words, wi.letters, seq];
}
function setNumberSequenceGoal() {
	let blank = blankWordInputs(G.words, G.numMissingLetters, G.posMissing);

	Goal = { seq: G.seq, words: G.words, chars: G.letters, blankWords: blank.words, blankChars: blank.letters, iFocus: blank.iFocus };
	Goal.qCharIndices = Goal.blankChars.map(x => x.index);

	Goal.qWordIndices = Goal.blankWords.map(x => x.iWord);

	let yes = true;
	for (let i = 0; i < Goal.chars.length; i++) if (Goal.chars[i].index != i) yes = false;
	console.assert(yes == true);

}
function setGoalWordInputs(n, min, max, step, op = 'add') {

	let fBuild = x => { return op == 'add' ? (x + step) : op == 'subtract' ? (x - step) : x; };
	if (op == 'subtract') min += step * (n - 1);
	if (min >= (max - 10)) max = min + 10;
	let seq = getRandomNumberSequence(n, min, max, fBuild);
	let wi = createWordInputs(seq, dTable, 'dNums');
	let blank = blankWordInputs(wi.words, G.numMissingLetters, G.posMissing);

	Goal = { seq: seq, words: wi.words, chars: wi.letters, blankWords: blank.words, blankChars: blank.letters, iFocus: blank.iFocus };
	Goal.qCharIndices = Goal.blankChars.map(x => x.index);

	Goal.qWordIndices = Goal.blankWords.map(x => x.iWord);

	let yes = true;
	for (let i = 0; i < Goal.chars.length; i++) if (Goal.chars[i].index != i) yes = false;
	console.assert(yes == true);
	//console.log('Goal', Goal);

}
function blankWordInputs(wi, n, pos = 'random') {
	// console.log(getFunctionCallerName(), 'n', n)
	//ignore pos for now and use random only
	let indivInputs = [];
	console.log('pos', pos)
	let remels =
		pos == 'random' ? choose(wi, n)
			: pos == 'notStart' ? arrTake(wi.slice(1, wi.length - 1), n)
				: pos == 'start' ? arrTake(wi, n)
					: takeFromTo(wi, wi.length - n, wi.length);
	for (const el of remels) {
		for (const inp of el.charInputs) { unfillCharInput(inp); }
		indivInputs = indivInputs.concat(el.charInputs);
		el.hasBlanks = true;
		el.nMissing = el.charInputs.length;
		if (n > 1) el.div.onclick = onClickWordInput;
	}

	return { iFocus: null, words: remels, letters: indivInputs };
}
function onClickWordInput(ev) {
	// console.log('click group!')
	return;
	if (!canAct()) return;
	ev.cancelBubble = true;
	let id = evToClosestId(ev);
	let iWord = Number(stringAfter(id, '_'));
	let g = Goal.words[iWord];

	//console.log('clicked on group', g)
	if (nundef(g.hasBlanks) || !g.hasBlanks) return;
	deactivateFocusGroup();
	activateFocusGroup(g.iWord);
}
function activateFocusGroup(iFocus) {
	if (isdef(iFocus)) Goal.iFocus = iFocus;
	if (Goal.iFocus === null) {
		console.log('nothing to activate');
		return;
	}
	let g = Goal.words[Goal.iFocus];
	//console.log('activate', g)
	g.div.style.backgroundColor = 'black';

}
function deactivateFocusGroup() {
	//console.log('deactivate', Goal.iFocus)
	if (Goal.iFocus === null) {
		//console.log('nothing to deactivate');
		return;
	}
	let g = Goal.words[Goal.iFocus];
	//console.log('activate', g)
	g.div.style.backgroundColor = g.obg;
	Goal.iFocus = null;

}
function onKeyWordInput(ev) {
	let charEntered = ev.key.toString();
	if (!isAlphaNum(charEntered)) return;

	let ch = charEntered.toUpperCase();
	Selected = { lastLetterEntered: ch };
	let cands = Goal.blankChars;
	if (Goal.iFocus) {
		let word = Goal.words[Goal.iFocus];
		if (word.hasBlanks) cands = word.charInputs.filter(x => x.isBlank);
		else deactivateFocusGroup();
	}
	//console.log('cands', cands);
	console.assert(!isEmpty(cands));

	let isLastOfGroup = (Goal.iFocus != null) && cands.length == 1;
	let isVeryLast = Goal.blankChars.length == 1;
	//let isLast = isLastOfGroup || isVeryLast; // geht auf jeden fall zu eval!
	//console.log('iFocus', Goal.iFocus, 'isLastOfGroup', isLastOfGroup, '\nisVeryLast', isVeryLast, '\nGoal', Goal);

	let target = firstCond(cands, x => x.letter == ch);
	let isMatch = target != null;
	if (!isMatch) target = cands[0];
	fillCharInput(target, ch);
	return { target: target, isMatch: isMatch, isLastOfGroup: isLastOfGroup, isVeryLast: isVeryLast, ch: ch };
}
function unfillWord(winp) { winp.charInputs.map(x => unfillCharInput(x)); }
function unfillCharInput(inp) {
	let d = inp.div;
	d.innerHTML = '_';
	mClass(d, 'blink');
	inp.isBlank = true;
}
function unfillChar(inp) { unfillCharInput(inp); }
function fillCharInput(inp, ch) {
	let d = inp.div;
	d.innerHTML = ch;
	mRemoveClass(d, 'blink');
}
function correctWordInput(winp) { winp.charInputs.map(x => refillCharInput(x, x.letter)); }
function refillCharInput(inp, ch) { fillCharInput(inp, ch); }
function getInputStringOfWordi(iWord) { return getInputStringOfWord(Goal.words[iWord]); }
function getInputStringOfChari(index) { return getInputStringOfChar(Goal.chars[index]); }
function getInputStringOfWord(winp) { return winp.charInputs.map(x => x.div.innerHTML).join(''); }
function getInputStringOfChar(inp) { return inp.div.innerHTML; }
function getInputWords() { return Goal.words.map(x => getInputStringOfWord(x)); }

function getQWords() { return Goal.qWordIndices.map(x => Goal.words[x]); }
function getQChars() {
	return Goal.qCharIndices.map(x => Goal.chars[x]);
}

function getWrongChars() { return getQChars().filter(x => getInputStringOfChar(x) != x.letter); }
function getIndicesOfWrongChars() { return getWrongChars().map(x => x.index); }
function getWrongWords() { return getQWords().filter(x => getInputStringOfWord(x) != x.word); }
function getIndicesOfWrongWords() { return getWrongWords().map(x => x.iWord); }
function getCorrectlyAnsweredWords() { return getQWords().filter(x => getInputStringOfWord(x) == x.word); }
function getIndicesOfCorrectlyAnsweredWords() { return getCorrectlyAnsweredWords().map(x => x.iWord); }

function getCorrectWords() { return Goal.seq; }
function getCorrectWordString(sep = ' ') { return getCorrectWords().join(sep); }
function getInputWordString(sep = ' ') { return getInputWords().join(sep); }

//#endregion createWordInputs

//#region number sequence (is a wordInput!)
function getNumSeqHint() { let l = G.op == 'add' ? 'to' : 'from'; let msg = `${G.op} ${G.step} ${l} the previous number`; return msg; }
function getShortNumSeqHint() { let msg = `${G.op} ${G.step}`; return msg; }
function shortNumSeqHint(written = true, spoken = true, ms = 2400) {
	let msg = getShortNumSeqHint();
	if (spoken) setTimeout(() => Speech.say(msg), ms);
	if (written) showFleetingMessage(msg, 300, { fz: 40 });
}
function mediumNumSeqHint(written = true, spoken = true, ms = 2400) {
	if (spoken) setTimeout(() => Speech.say(getShortNumSeqHint()), ms);
	if (written) showFleetingMessage(getNumSeqHint(), 300, { fz: 32 });
}
function longNumSeqHint(written = true, spoken = true, ms = 2400) {
	let msg = getNumSeqHint();
	if (spoken) setTimeout(() => Speech.say(msg), ms);
	if (written) showFleetingMessage(msg, 300, { fz: 32 });
}
function numberSequenceCorrectionAnimation() {
	//da brauch ich eine chain!!!!!!
	let wrong = getWrongWords();
	if (nundef(TOList)) TOList = {};
	let msg = getNumSeqHint();
	showFleetingMessage(msg, 0, { fz: 32 }); //return;
	//Speech.say(msg)
	Selected.feedbackUI = wrong.map(x => x.div);
	failPictureGoal();

	let t1 = setTimeout(removeMarkers, 1000);
	let t2 = setTimeout(() => wrong.map(x => { correctWordInput(x); animate(x.div, 'komisch', 1300); }), 1000);
	//let t3 = setTimeout(() => wrong.map(x =>animate(x.div,'komisch', 1300)), DELAY / 2);
	//playSound('incorrect3');
	t4 = setTimeout(() => { if (Settings.spokenFeedback) Speech.say(msg, .7, 1, .7, 'random'); }, 500);
	TOList.numseq = [t1, t2, t4];//, t3, t4];//, t4];

	return 2800;
}
function missingNumbersMessage() {
	//console.log('this', this)
	let lst = Goal.blankWords.map(x => x.word);
	//console.log(this.inputs)
	let msg = lst.join(',');
	let edecl = lst.length > 1 ? 's are ' : ' is ';
	let ddecl = lst.length > 1 ? 'en ' : 't ';
	let s = (Settings.language == 'E' ? 'the missing number' + edecl : 'es fehl' + ddecl);
	return s + msg;
}

//#endregion number sequence (is a wordInput!)

//#region cards turn face up or down
function hideMouse() {
	//document.body.style.cursor = 'none';
	var x = document.getElementsByTagName("DIV");
	for (const el of x) { el.prevCursor = el.style.cursor; } //.style.cursor = 'none';
	for (const p of Pictures) {
		mRemoveClass(p.div, 'frameOnHover'); p.div.style.cursor = 'none';
		for (const ch of p.div.children) ch.style.cursor = 'none';
	} //p.divmClass.style.cursor = 'none';}
	for (const el of x) { mClass(el, 'noCursor'); } //.style.cursor = 'none';
	// let elems = document.getElementsByTagName('div');
	// for(const el in elems) el.style.cursor = 'none';
	// document.getElementById("demo").innerHTML = el.innerHTML;	
	// show(mBy('noMouseScreen')	);
}
function showMouse() {
	var x = document.getElementsByTagName("DIV");
	for (const el of x) { mRemoveClass(el, 'noCursor'); } //.style.cursor = 'none';
	for (const el of x) { el.style.cursor = el.prevCursor; }
	for (const p of Pictures) {
		mRemoveClass(p.div, 'noCursor');
		mClass(p.div, 'frameOnHover'); p.div.style.cursor = 'pointer';
		for (const ch of p.div.children) ch.style.cursor = 'pointer';
	} //p.divmClass.style.cursor = 'none';}
}

function turnCardsAfter(secs, removeBg = false) {
	for (const p of Pictures) { slowlyTurnFaceDown(p, secs - 1, removeBg); }
	TOMain = setTimeout(() => {
		showInstruction(Goal.label, 'click', dTitle, true);
		showMouse();
		activateUi();
	}, secs * 1000);

}
function slowlyTurnFaceDown(pic, secs = 5, removeBg = false) {
	let ui = pic.div;
	for (const p1 of ui.children) {
		p1.style.transition = `opacity ${secs}s ease-in-out`;
		//p1.style.transition = `opacity ${secs}s ease-in-out, background-color ${secs}s ease-in-out`;
		p1.style.opacity = 0;
		//p1.style.backgroundColor = 'dimgray';
		//mClass(p1, 'transopaOff'); //aniSlowlyDisappear');
	}
	if (removeBg) {
		ui.style.transition = `background-color ${secs}s ease-in-out`;
		ui.style.backgroundColor = 'dimgray';
	}
	//ui.style.backgroundColor = 'dimgray';
	pic.isFaceUp = false;

}
function turnFaceDown(pic) {
	let ui = pic.div;
	for (const p1 of ui.children) p1.style.opacity = 0; //hide(p1);
	ui.style.backgroundColor = 'dimgray';
	pic.isFaceUp = false;

}
function turnFaceUp(pic) {
	let div = pic.div;
	for (const ch of div.children) {
		ch.style.transition = `opacity ${1}s ease-in-out`;
		ch.style.opacity = 1; //show(ch,true);
		if (!pic.isLabelVisible) break;
	}
	div.style.transition = null;
	div.style.backgroundColor = pic.bg;
	pic.isFaceUp = true;
}
function toggleFace(pic) { if (pic.isFaceUp) turnFaceDown(pic); else turnFaceUp(pic); }
//#endregion cards: turn face up or down

function calcMemorizingTime(numItems, randomGoal = true) {
	//let ldep = Math.max(6, G.level > 2 ? G.numPics * 2 : G.numPics);
	let ldep = Math.max(6, randomGoal ? numItems * 2 : numItems);
	return ldep;
}

function clearTable() {
	clearElement(dLineTableMiddle); clearElement(dLineTitleMiddle); removeMarkers();
}
function containsColorWord(s) {
	let colors = ['old', 'blond', 'red', 'blue', 'green', 'purple', 'black', 'brown', 'white', 'grey', 'gray', 'yellow', 'orange'];
	for (const c of colors) {
		if (s.toLowerCase().includes(c)) return false;
	}
	return true;
}

//#region fail, hint, success
function successThumbsUp(withComment = true) {
	if (withComment && Settings.spokenFeedback) {
		const comments = (Settings.language == 'E' ? ['YEAH!', 'Excellent!!!', 'CORRECT!', 'Great!!!'] : ['gut', 'Sehr Gut!!!', 'richtig!!', 'Bravo!!!']);
		Speech.say(chooseRandom(comments));//'Excellent!!!');
	}
	//console.log(Pictures)
	let p1 = firstCond(Pictures, x => x.key == 'thumbs up');
	p1.div.style.opacity = 1;
	let p2 = firstCond(Pictures, x => x.key == 'thumbs down');
	p2.div.style.display = 'none';
}
function failThumbsDown(withComment = false) {
	if (withComment && Settings.spokenFeedback) {
		const comments = (Settings.language == 'E' ? ['too bad'] : ["aber geh'"]);
		Speech.say(chooseRandom(comments), 1, 1, .8, 'zira'); //, () => { console.log('FERTIG FAIL!!!!'); });
	}
	let p1 = firstCond(Pictures, x => x.key == 'thumbs down');
	p1.div.style.opacity = 1;
	let p2 = firstCond(Pictures, x => x.key == 'thumbs up');
	p2.div.style.display = 'none';
}

function successPictureGoal(withComment = true) {
	if (withComment && Settings.spokenFeedback) {
		const comments = (Settings.language == 'E' ? ['YEAH!', 'Excellent!!!', 'CORRECT!', 'Great!!!'] : ['gut', 'Sehr Gut!!!', 'richtig!!', 'Bravo!!!']);
		Speech.say(chooseRandom(comments));//'Excellent!!!');
	}
	if (isdef(Selected) && isdef(Selected.feedbackUI)) {
		let uilist;
		if (isdef(Selected.positiveFeedbackUI)) uilist = [Selected.positiveFeedbackUI];
		else uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
		let sz = getBounds(uilist[0]).height;
		for (const ui of uilist) mpOver(markerSuccess(), ui, sz * (4 / 5), 'limegreen', 'segoeBlack');
	}
}
function failPictureGoal(withComment = false) {
	if (withComment && Settings.spokenFeedback) {
		const comments = (Settings.language == 'E' ? ['too bad'] : ["aber geh'"]);
		Speech.say(chooseRandom(comments), 1, 1, .8, 'zira', () => { console.log('FERTIG FAIL!!!!'); });
	}
	if (isdef(Selected) && isdef(Selected.feedbackUI)) {
		let uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
		let sz = getBounds(uilist[0]).height;
		for (const ui of uilist) mpOver(markerFail(), ui, sz * (1 / 2), 'red', 'openMojiTextBlack');
	}
}
function showCorrectWord(sayit = true) {
	let anim = Settings.spokenFeedback ? 'onPulse' : 'onPulse1';
	let div = mBy(Goal.id);
	mClass(div, anim);

	if (!sayit || !Settings.spokenFeedback) return;

	let correctionPhrase = isdef(Goal.correctionPhrase) ? Goal.correctionPhrase : Goal.label;
	Speech.say(correctionPhrase, .4, 1.2, 1, 'david');
	return Settings.spokenFeedback? 3000:300;
}
function showCorrectWords(sayit = true) {
	if (nundef(TOList)) TOList = {};
	TOList.correctWords = [];
	let anim = 'onPulse2';
	let to = 0;
	let speaking = sayit && Settings.spokenFeedback;
	let ms =speaking?2000:1000; 
	for (const goal of Goal.pics) {
		TOList.correctWords.push(setTimeout(() => {
			let div = mBy(goal.id);
			mClass(div, anim);
			if (speaking) Speech.say('the ' +goal.correctionPhrase, .4, 1.2, 1, 'david');
		}, to));
		to += ms;
	}

	if (!sayit || !Settings.spokenFeedback) return to;

	// let correctionPhrase = isdef(Goal.correctionPhrase) ? Goal.correctionPhrase : Goal.map(x => x.label).join(', ');
	// Speech.say(correctionPhrase, .4, 1.2, 1, 'david');

	return to+ms;
}
function shortHintPicRemove() {
	mRemoveClass(mBy(Goal.id), 'onPulse1');
}
function shortHintPic() {
	mClass(mBy(Goal.id), 'onPulse1');
	TOMain = setTimeout(() => shortHintPicRemove(), 800);
}
//#endregion

//#region fleetingMessage
var TOFleetingMessage;
function clearFleetingMessage() {
	//console.log('HIER!');//, getFunctionsNameThatCalledThisFunction());
	clearTimeout(TOFleetingMessage);
	clearElement(dLineBottomMiddle);
}
function showFleetingMessage(msg, msDelay, styles, fade = false) {

	let defStyles = { fz: 22, rounding: 10, padding: '2px 12px', matop: 50 };
	if (nundef(styles)) { styles = defStyles; }
	else styles = deepmergeOverride(defStyles, styles);

	//console.log('bg is', G.color, '\n', styles, arguments)
	if (nundef(styles.fg)) styles.fg = colorIdealText(G.color);

	if (msDelay) {
		clearTimeout(TOFleetingMessage);
		TOFleetingMessage = setTimeout(() => fleetingMessage(msg, styles, fade), msDelay);
	} else {
		fleetingMessage(msg, styles, fade);
	}
}
function fleetingMessage(msg, styles, fade = false) {
	dLineBottomMiddle.innerHTML = msg;
	mStyleX(dLineBottomMiddle, styles)
	if (fade) TOMain = aniFadeInOut(dLineBottomMiddle, 1);
}
//#endregion fleetingMessage

//#region game over
function gameOver(msg) { TOMain = setTimeout(aniGameOver(msg), DELAY); }
function aniGameOver(msg) {
	playSound('goodBye');
	show('freezer2');

	let dMessage = mBy('dMessageFreezer2');
	let d = mBy('dContentFreezer2');
	clearElement(d);
	mStyleX(d, { fz: 20, matop: 40, bg: 'silver', fg: 'indigo', rounding: 20, padding: 25 })
	let style = { matop: 4 };

	if (USERNAME == 'test') {
		dMessage.innerHTML = 'Processing your test result...';
		let [before, after] = calibrateUser();
		d.style.textAlign = 'left';
		for (const g in after) {
			if (nundef(before[g])) before[g] = 0;
			let b = before[g]; let a = after[g];
			let exp = b < a ? (' been upgraded to ' + a) : b > a ? (' been downgraded to ' + a) : ' remained at ' + a;
			mText(`game ${g}: startlevel has ${exp}`, d, { fz: 22 });
		}

	} else {
		dMessage.innerHTML = 'Time for a Break...';
		d.style.textAlign = 'center';
		mText('Unit Score:', d, { fz: 22 });

		for (const gname in U.session) {
			let sc = U.session[gname];
			if (sc.nTotal == 0) continue;
			mText(`${GAME[gname].friendly}: ${sc.nCorrect}/${sc.nTotal} correct answers (${sc.percentage}%) `, d, style);

		}
	}


	mClass(mBy('freezer2'), 'aniSlowlyAppear');
	saveUnit();

}
//#endregion game over
function getGameOrLevelInfo(k, defval) {
	let val = lookup(GS, [G.key, 'levels', G.level, k]);
	if (!val) val = lookupSet(GS, [G.key, k], defval);
	return val;
}
function resetRound() {
	clearTimeout(TOMain);
	if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } }
	clearFleetingMessage();
	clearTable();
}
function resetState() {
	clearTimeout(TOMain); onkeydown = null; onkeypress = null; onkeyup = null;
	uiPaused = 0;
	lastPosition = 0;
	DELAY = 1000;

	//console.log(badges);
	// if (badges.length != G.level) {
	//badges = [];
	//showBadges(dLeiste, G.level, onClickBadge);

	//_showBadgesX(dLeiste,G.level,onClickBadgeX,G.maxLevel);
	// }

	updateLabelSettings();
	setBackgroundColor();

}
function revertToBadgeLevel(ev) {
	let i = 0;
	if (isNumber(ev)) { i = ev; }
	else {
		let id = evToClosestId(ev);
		i = stringAfter(id, '_');
		i = Number(i);
	}

	let userStartLevel = getUserStartLevel(G.key);
	if (userStartLevel > i) updateStartLevelForUser(G.key, i);
	G.level = i;

	removeBadges(dLeiste, G.level);
}
function setBadgeLevel(ev) {
	let i = 0;
	if (isNumber(ev)) { i = ev; }
	else {
		let id = evToClosestId(ev);
		i = stringAfter(id, '_');
		i = Number(i);
	}
	//i is now correct level
	let userStartLevel = getUserStartLevel(G.key);
	if (userStartLevel > i) updateStartLevelForUser(G.key, i);
	G.level = i;

	//setBadgeOpacity
	for (let iBadge = 0; iBadge < G.level; iBadge++) {
		badges[iBadge].div.style.opacity = 1;
	}
	for (let iBadge = G.level; iBadge < badges.length; iBadge++) {
		badges[iBadge].div.style.opacity = .25;
	}
}
function setBackgroundColor() { document.body.style.backgroundColor = G.color; }
function setGoal(index) {
	if (nundef(index)) {
		let rnd = G.numPics < 2 ? 0 : randomNumber(0, G.numPics - 2);
		if (G.numPics >= 2 && rnd == lastPosition && coin(70)) rnd = G.numPics - 1;
		index = rnd;
	}
	lastPosition = index;
	Goal = Pictures[index];
}
function setMultiGoal(n, indices) {
	Goal = {pics:[]};
	if (nundef(indices)) {
		Goal.pics = choose(Pictures, n);
	} else {
		for (const i of indices) Goal.pics.push(Pictures[i]);
	}
}
function showInstruction(text, cmd, title, isSpoken, spoken, fz) {
	//console.assert(title.children.length == 0,'TITLE NON_EMPTY IN SHOWINSTRUCTION!!!!!!!!!!!!!!!!!')
	//console.log('G.key is', G.key)
	clearElement(title);
	let d = mDiv(title);
	mStyleX(d, { margin: 15 })
	mClass(d, 'flexWrap');

	let msg = cmd + " " + `<b>${text.toUpperCase()}</b>`;
	if (nundef(fz)) fz = 36;
	let d1 = mText(msg, d, { fz: fz, display: 'inline-block' });
	let sym = symbolDict.speaker;
	let d2 = mText(sym.text, d, {
		fz: fz + 2, weight: 900, display: 'inline-block',
		family: sym.family, 'padding-left': 14
	});
	dFeedback = dInstruction = d;

	spoken = isSpoken ? isdef(spoken) ? spoken : cmd + " " + text : null;
	dInstruction.addEventListener('click', () => aniInstruction(spoken));

	if (!isSpoken) return;

	Speech.say(isdef(spoken) ? spoken : (cmd + " " + text), .7, 1, .7, 'random');

}
function showPictures(onClickPictureHandler, { showRepeat = false, sz, bgs, colors, contrast, repeat = 1, sameBackground = true, border } = {}, keys, labels) {
	Pictures = [];

	if (nundef(keys)) keys = choose(G.keys, G.numPics);
	//keys[0]='man in manual wheelchair';
	//keys=['sun with face'];

	Pictures = maShowPictures(keys, labels, dTable, onClickPictureHandler,
		{
			showRepeat: showRepeat, picSize: sz, bgs: bgs, repeat: repeat, sameBackground: sameBackground, border: border, lang: Settings.language, colors: colors,
			contrast: contrast
		});


	//TESTING FOR NO DUPLICATES - remove in production!
	if (G.key == 'gTouchPic') {
		let numDuplicates = 0;
		let checklist = [];
		let labels = Pictures.map(x => x.label);
		for (const l of labels) {
			if (checklist.includes(l)) numDuplicates += 1; else checklist.push(l);
		}
		console.assert(numDuplicates == 0)
	}

	// label hiding
	let totalPics = Pictures.length;
	if (nundef(Settings.labels) || Settings.labels) {
		if (G.numLabels == totalPics) return;
		let remlabelPic = choose(Pictures, totalPics - G.numLabels);
		for (const p of remlabelPic) {
			//console.log('hi1');
			maHideLabel(p.id, p.info); p.isLabelVisible = false;
		}
	} else {
		for (const p of Pictures) {
			//console.log('hi1');
			maHideLabel(p.id, p.info); p.isLabelVisible = false;
		}

	}

}
function showHiddenThumbsUpDown(styles) {
	styles.bgs = ['transparent', 'transparent'];
	showPictures(null, styles, ['thumbs up', 'thumbs down'], ['bravo!', 'nope']);
	for (const p of Pictures) { p.div.style.padding = p.div.style.margin = '10px 0px 0px 0px'; p.div.style.opacity = 0; }

}
function showLevel() {
	dLevel.innerHTML = 'level: ' + G.level + '/' + G.maxLevel;
}
function showGameTitle() { dGameTitle.innerHTML = GAME[G.key].friendly; }
function showScore() {

	console.log('===>showScore!!!', Score);
	if (Score.gameChange) showBadgesX(dLeiste, G.level, onClickBadgeX, G.maxLevel);

	let scoreString = 'question: ' + (Score.nTotal + 1) + '/' + Settings.samplesPerLevel;

	if (Score.levelChange) {
		dScore.innerHTML = scoreString;
		setBadgeLevel(G.level);
	}
	else {
		setTimeout(() => {
			dScore.innerHTML = scoreString;
			setBadgeLevel(G.level);
		}, 300);
	}
	// let scoreString = scoringMode == 'n' ? 'question: ' + (Score.nTotal + 1) + '/' + Settings.samplesPerLevel :
	// 	scoringMode == 'percent' ? 'score: ' + Score.nCorrect + '/' + Score.nTotal + ' (' + percentageCorrect + '%)'
	// 		: scoringMode == 'inc' ? 'score: ' + levelPoints + ' (' + percentageCorrect + '%)'
	// 			: 'question: ' + Score.nTotal + '/' + Settings.samplesPerLevel;

	// if (Score.levelChange)
	// 	dScore.innerHTML = scoreString;
	// else
	// 	setTimeout(() => { dScore.innerHTML = scoreString; }, 300);
}
//function resetScore() { if (nundef(Score)) Score = { gameChange: true, levelChange: true, nTotal: 0, nCorrect: 0, nCorrect1: 0, nPos: 0, nNeg: 0 }; }
function showStats() {

	if (Score.levelChange) {
		Score.nTotal = 0;
		Score.nCorrect = 0;
		Score.nCorrect1 = 0;
		Score.nTotal = 0;
		Score.nPos = 0;
		Score.nNeg = 0;
	}
	showGameTitle();
	showLevel();
	showScore();

	Score.levelChange = false;
	Score.gameChange = false;
	// resetScore();
	// showStats();
	// if (nundef(Score) || isdef(Score.gameChange) && Score.gameChange == true){
	// 	showBadgesX(dLeiste, G.level, onClickBadgeX, G.maxLevel);
	// 	Score.gameChange = false;
	// }	
	// Score.levelChange = false; //needs to be down here because showScore needs that info!


}





