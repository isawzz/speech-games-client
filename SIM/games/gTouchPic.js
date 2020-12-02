function startGameTP() {}
function startLevelTP() { levelTP(); }
function levelTP() {
	MaxNumTrials = getGameOrLevelInfo('trials', 2);
	NumPics = getGameOrLevelInfo('numPics', 9);
	NumLabels = getGameOrLevelInfo('numLabels', NumPics); 

	let vinfo = getGameOrLevelInfo('vocab', 100);
	vinfo = ensureMinVocab(vinfo,NumPics);

	currentKeys = setKeys({lang:currentLanguage,nbestOrCats:vinfo}); //isNumber(vinfo) ? KeySets['best' + vinfo] : setKeys(vinfo);

	console.log('MaxNumTrials',MaxNumTrials,'NumPics',NumPics,'NumLabels',NumLabels,'vinfo',vinfo,'currentLanguage',currentLanguage)
	console.log('incrementLevelOnPositiveStreak',Settings.program.incrementLevelOnPositiveStreak,'decrementLevelOnNegativeStreak',Settings.program.decrementLevelOnNegativeStreak);
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

