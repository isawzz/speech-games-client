var dataST;

const LevelsST = {
	0: { Steps:2, NumPics: 2, NumLabels: 2, MinWordLength: 2, MaxWordLength: 4, MaxNumTrials: 1 },
	1: { Steps:2,NumPics: 3, NumLabels: 3, MinWordLength: 3, MaxWordLength: 5, MaxNumTrials: 1 },
	2: { Steps:2,NumPics: 2, NumLabels: 1, MinWordLength: 3, MaxWordLength: 6, MaxNumTrials: 1 },
	3: { Steps:2,NumPics: 3, NumLabels: 2, MinWordLength: 4, MaxWordLength: 7, MaxNumTrials: 1 },
	4: { Steps:2,NumPics: 2, NumLabels: 0, MinWordLength: 4, MaxWordLength: 8, MaxNumTrials: 1 },
	5: { Steps:2,NumPics: 4, NumLabels: 4, MinWordLength: 4, MaxWordLength: 9, MaxNumTrials: 1 },
	6: { Steps:2,NumPics: 3, NumLabels: 1, MinWordLength: 5, MaxWordLength: 10, MaxNumTrials: 2 },
	7: { Steps:2,NumPics: 4, NumLabels: 2, MinWordLength: 5, MaxWordLength: 11, MaxNumTrials: 1 },
	8: { Steps:2,NumPics: 5, NumLabels: 5, MinWordLength: 6, MaxWordLength: 12, MaxNumTrials: 1 },
	9: { Steps:2,NumPics: 3, NumLabels: 0, MinWordLength: 6, MaxWordLength: 13, MaxNumTrials: 2 },
	10: { Steps:2,NumPics: 4, NumLabels: 0, MinWordLength: 4, MaxWordLength: 14, MaxNumTrials: 2 },
}
function startGameST() { }
function startLevelST() { levelST(); }
function levelST() {
	let levelInfo = LevelsST[currentLevel];
	MaxNumTrials = levelInfo.MaxNumTrials;
	MaxWordLength = levelInfo.MaxWordLength;
	MinWordLength = levelInfo.MinWordLength;
	setKeys();
	NumPics = levelInfo.NumPics;
	NumLabels = levelInfo.NumLabels;
	Steps = levelInfo.Steps;
}
function startRoundST() {
	uiActivated = false;
}
function promptST() {
	showPictures(false, registerStepAndNext);
	setGoal();
	showInstruction(bestWord, 'click', dTitle, true);
	iStep = 0;
	dataST=[];
	return 10;
}

function registerStepAndNext(){
	iStep+=1;
	if (iStep>=Steps){evaluate(dataST)}
}

function trialPromptST() {
	Speech.say(currentLanguage == 'D' ? 'nochmal!' : 'try again!');
	shortHintPic();
	return 10;
}
function activateST() {
	uiActivated = true;
}
function evalST(ev) {
	let id = evToClosestId(ev);
	ev.cancelBubble = true;

	let i = firstNumber(id);
	let item = Pictures[i];
	Selected = { pic: item, feedbackUI: item.div, sz: getBounds(item.div).height };

	Selected.reqAnswer = bestWord;
	Selected.answer = item.label;


	if (item.label == bestWord) { return true; } else { return false; }
}

