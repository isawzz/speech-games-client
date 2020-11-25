function startGameWP() {
	onkeydown = ev => {
		if (uiPaused) return;
		if (isdef(inputBox)) { inputBox.focus(); }
	}
}
function startLevelWP() { levelWP(); }
function levelWP() {
	MaxNumTrials = getGameOrLevelInfo('trials', 3);
	MaxWordLength = getGameOrLevelInfo('maxWordLength', 12);
	NumPics = 1;

	let vinfo = getGameOrLevelInfo('vocab', 100);
	currentKeys = setKeys({ lang: currentLanguage, nbestOrCats: vinfo, filterFunc:(k,w)=>w.length<=MaxWordLength });
}
function startRoundWP() { }
function promptWP() {
	showPictures(() => mBy(defaultFocusElement).focus());
	setGoal();

	showInstruction(bestWord, currentLanguage == 'E' ? 'type' : "schreib'", dTitle, true);

	mLinebreak(dTable);
	inputBox = addNthInputElement(dTable, trialNumber);
	defaultFocusElement = inputBox.id;

	return 10;
}
function trialPromptWP() {
	Speech.say(currentLanguage == 'E' ? 'try again!' : 'nochmal', 1, 1, .8, 'zira');
	mLinebreak(dTable);
	inputBox = addNthInputElement(dTable, trialNumber);
	defaultFocusElement = inputBox.id;

	return 10;
}
function activateWP() {
	inputBox.onkeyup = ev => {
		if (ev.ctrlKey || uiPaused) return;
		if (ev.key === "Enter") {
			ev.cancelBubble = true;
			evaluate(ev);
		}
	};
	inputBox.focus();
}
function evalWP(ev) {
	let answer = normalize(inputBox.value, currentLanguage);
	let reqAnswer = normalize(bestWord, currentLanguage);

	Selected = { reqAnswer: reqAnswer, answer: answer };
	if (answer == reqAnswer) return true;
	else { return false; }
}










