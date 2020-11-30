var MemMM;
function startGameMM() { }
function startLevelMM() { levelMM(); }
function levelMM() {
	MaxNumTrials = 1;// getGameOrLevelInfo('trials', 2);
	let vinfo = getGameOrLevelInfo('vocab', 100);
	currentKeys = isNumber(vinfo) ? KeySets['best' + getGameOrLevelInfo('vocab', 100)] : setKeys(vinfo);
	NumPics = getGameOrLevelInfo('numPics', 4);
	NumLabels = getGameOrLevelInfo('numLabels', NumPics);
	NumRepeat = getGameOrLevelInfo('numRepeat', 2);
}
function startRoundMM() {
	uiActivated = false;
	MemMM = [];
}
function interactMM(ev) {
	ev.cancelBubble = true;
	if (uiPaused || ev.ctrlKey || ev.altKey) return;

	let id = evToClosestId(ev);
	let i = firstNumber(id);
	let pic = Pictures[i];
	let div = pic.div;
	console.log('clicked', pic.key);
	if (!isEmpty(MemMM) && MemMM.length < NumRepeat-1 && MemMM[0].label != pic.label) return;
	toggleSelectionOfPicture(pic,MemMM);
	if (isEmpty(MemMM)) {
		showInstruction('any picture', 'click', dTitle, true);
	}else if (MemMM.length < NumRepeat-1) {
		//set incomplete: more steps are needed!
		//frame the picture
		showInstruction(pic.label, 'click another', dTitle, true);
	}else if (MemMM.length == NumRepeat-1) {
		// look for last picture with x that is not in the set
		let picGoal = firstCond(Pictures,x=>x.label == pic.label && !x.isSelected);
		setGoal(picGoal.index);
		showInstruction(picGoal.label, 'click the '+(NumRepeat == 2?'other':'last'), dTitle, true);
	} else {
		//set is complete: eval
		evaluate(MemMM);
	}
	console.log(MemMM)

}
function promptMM() {
	showPicturesMM(interactMM, { repeat: NumRepeat, border: '3px solid #ffffff80', });
	//setGoal();
	showInstruction('', 'click any card', dTitle, true);
	return 10;
}
function trialPromptMM() {
	for (const p of MemMM) { toggleSelectionOfPicture(p); }
	MemMM = [];
	Speech.say(currentLanguage == 'D' ? 'nochmal!' : 'try again!');
	//shortHintPic();
	return 10;
}
function activateMM() {
	uiActivated = true;
}
function evalMM(piclist) {

	Selected = { piclist: piclist, feedbackUI: piclist.map(x => x.div), sz: getBounds(piclist[0].div).height };

	let req = Selected.reqAnswer = piclist[0].label;
	let eachAnswerSame = true;
	for (const p of piclist) { if (p.label != req) eachAnswerSame = false; }
	Selected.answer = piclist[piclist.length - 1].label;
	if (Selected.answer == req) { return true; } else { return false; }
}


function turnPicFaceDown(pic){
	let d=pic.div;
	console.log('pic has',d.children.length,'children')
}
function cardFace({ rank, suit, key } = {},w,h) {
	let cardKey, svgCode;
	//console.log('cardFace',rank,suit,key,w,h)
	if (isdef(key)) {
		cardKey = key;
		svgCode = testCards[cardKey];
		if (!svgCode) svgCode = vidCache.getRandom('c52');
	} else {
		if (nundef(rank)) { rank = '2'; suit = 'B'; } //face down card!
		if (rank == '10') rank = 'T';
		if (rank == '1') rank = 'A';
		if (nundef(suit)) suit = 'H';//joker:J1,J2, back:1B,2B
		cardKey = 'card_' + rank + suit;
		svgCode = c52[cardKey]; //c52 is cached asset loaded in _start
		//console.log(cardKey,c52[cardKey])
	}
	svgCode = '<div>' + svgCode + '</div>';
	let el = createElementFromHTML(svgCode);
	if (isdef(h)){mSize(el,w,h);}
	//console.log('__________ERGEBNIS:',w,h)
	return el;
}

