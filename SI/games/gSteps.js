var MemSTP;
function startGameSTP() { }
function startLevelSTP() { levelSTP(); }
function levelSTP() {
	MaxNumTrials = 1;// getGameOrLevelInfo('trials', 2);
	let vinfo = getGameOrLevelInfo('vocab', 100);
	currentKeys = isNumber(vinfo) ? KeySets['best' + getGameOrLevelInfo('vocab', 100)] : setKeys(vinfo);
	NumPics = getGameOrLevelInfo('numPics', 4);
	NumLabels = getGameOrLevelInfo('numLabels', NumPics);
	NumRepeat = getGameOrLevelInfo('numRepeat', 2);
}
function startRoundSTP() {
	uiActivated = false;
	MemSTP = [];
}
function InteractSTP(ev) {
	ev.cancelBubble = true;
	if (uiPaused || ev.ctrlKey || ev.altKey) return;

	let id = evToClosestId(ev);
	let i = firstNumber(id);
	let pic = Pictures[i];
	console.log('clicked', pic.key);
	if (!isEmpty(MemSTP) && MemSTP.length < NumRepeat-1 && bestWord != pic.label) return;
	toggleSelectionOfPicture(pic,MemSTP);
	if (isEmpty(MemSTP)) {
		showInstruction(bestWord, 'click all', dTitle, true);
	}else if (MemSTP.length < NumRepeat-1) {
		//set incomplete: more steps are needed!
		//frame the picture
		showInstruction(pic.label, 'click another', dTitle, true);
	}else if (MemSTP.length == NumRepeat-1) {
		// look for last picture with x that is not in the set
		let picGoal = firstCond(Pictures,x=>x.label == pic.label && !x.isSelected);
		setGoal(picGoal.index);
		showInstruction(picGoal.label, 'click the '+(NumRepeat == 2?'other':'last'), dTitle, true);
	} else {
		//set is complete: eval
		evaluate(MemSTP);
	}
	console.log(MemSTP)

}

function promptSTP() {
	showPicturesSTP(InteractSTP, { repeat: NumRepeat, border: '3px solid #ffffff80', });
	setGoal();
	showInstruction(bestWord, 'click all', dTitle, true);
	return 10;
}
function trialPromptSTP() {
	for (const p of MemSTP) { toggleSelectionOfPicture(p); }
	MemSTP = [];
	Speech.say(currentLanguage == 'D' ? 'nochmal!' : 'try again!');
	//shortHintPic();
	return 10;
}
function activateSTP() {
	uiActivated = true;
}
function evalSTP(piclist) {

	Selected = { piclist: piclist, feedbackUI: piclist.map(x => x.div), sz: getBounds(piclist[0].div).height };

	let req = Selected.reqAnswer = piclist[0].label;
	let eachAnswerSame = true;
	for (const p of piclist) { if (p.label != req) eachAnswerSame = false; }
	Selected.answer = piclist[piclist.length - 1].label;
	if (Selected.answer == req) { return true; } else { return false; }
}

