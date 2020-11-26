var uiActivated;
function startGameTP() {}
function startLevelTP() { levelTP(); }
function levelTP() {
	MaxNumTrials = getGameOrLevelInfo('trials', 2);
	let vinfo = getGameOrLevelInfo('vocab', 100);
	currentKeys = isNumber(vinfo) ? KeySets['best' + getGameOrLevelInfo('vocab', 100)] : setKeys(vinfo);
	NumPics = getGameOrLevelInfo('numPics', 9);
	NumLabels = getGameOrLevelInfo('numLabels', NumPics); 
}
function startRoundTP() {
	uiActivated = false;
}
function promptTP() {
	showPictures(evaluate);
	setGoal();
	showInstruction(bestWord, 'click', dTitle, true);
	return 10;
}
function trialPromptTP() {
	Speech.say(currentLanguage == 'D' ? 'nochmal!' : 'try again!');
	shortHintPic();
	return 10;
}
function activateTP() {
	uiActivated = true;
}
function evalTP(ev) {
	let id = evToClosestId(ev);
	ev.cancelBubble = true;

	let i = firstNumber(id);
	let item = Pictures[i];
	Selected = { pic: item, feedbackUI: item.div, sz: getBounds(item.div).height };

	Selected.reqAnswer = bestWord;
	Selected.answer = item.label;


	if (item.label == bestWord) { return true; } else { return false; }
}

