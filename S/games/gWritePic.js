const LevelsWP = {
	0: { NumPics: 1, NumLabels: 1, MinWordLength: 2, MaxWordLength: 3, MaxNumTrials: 3 },
	1: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 4, MaxNumTrials: 3 },
	2: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 5, MaxNumTrials: 3 },
	3: { NumPics: 1, NumLabels: 0, MinWordLength: 3, MaxWordLength: 6, MaxNumTrials: 3 },
	4: { NumPics: 1, NumLabels: 0, MinWordLength: 4, MaxWordLength: 7, MaxNumTrials: 3 },
	5: { NumPics: 1, NumLabels: 0, MinWordLength: 5, MaxWordLength: 8, MaxNumTrials: 3 },
	6: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 9, MaxNumTrials: 3 },
	7: { NumPics: 1, NumLabels: 0, MinWordLength: 7, MaxWordLength: 11, MaxNumTrials: 3 },
	8: { NumPics: 1, NumLabels: 0, MinWordLength: 8, MaxWordLength: 12, MaxNumTrials: 3 },
	9: { NumPics: 1, NumLabels: 0, MinWordLength: 7, MaxWordLength: 13, MaxNumTrials: 3 },
	10: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 14, MaxNumTrials: 3 },
}
function startGameWP() {
	onkeydown = ev => {
		if (uiPaused) return;
		if (isdef(inputBox)) { inputBox.focus(); }
	}
}
function startLevelWP() { levelWP(); }
function levelWP() {
	let levelInfo = LevelsWP[currentLevel];
	MaxNumTrials = levelInfo.MaxNumTrials;
	MaxWordLength = levelInfo.MaxWordLength;
	MinWordLength = levelInfo.MinWordLength;
	setKeys();
	NumPics = levelInfo.NumPics;
	NumLabels = levelInfo.NumLabels;
}
function startRoundWP() { }
function promptWP() {
	showPictures(true, () => mBy(defaultFocusElement).focus());
	setGoal();

	showInstruction(bestWord, currentLanguage == 'E' ? 'type' : "schreib'", dTitle, true);

	mLinebreak(dTable);
	inputBox = addNthInputElement(dTable, trialNumber);
	defaultFocusElement = inputBox.id;

	return 10;
}
function trialPromptWP() {
	Speech.say(currentLanguage == 'E' ? 'try again!' : 'nochmal', 1, 1, .8, true, 'zira');
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

	Selected = {reqAnswer:reqAnswer,answer:answer};
	//console.log('eval WritePic', answer, reqAnswer)
	if (answer == reqAnswer) return true;
	else { return false; }
}










