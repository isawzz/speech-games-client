var uiActivated, keysetsTP;
const LevelsTP = {
	0: { Set: 'best25', NumPics: 2, NumLabels: 2, MinWordLength: 2, MaxWordLength: 4, MaxNumTrials: 2 },
	1: { Set: 'best25', NumPics: 3, NumLabels: 3, MinWordLength: 3, MaxWordLength: 5, MaxNumTrials: 2 },
	2: { Set: 'best25', NumPics: 4, NumLabels: 4, MinWordLength: 3, MaxWordLength: 6, MaxNumTrials: 2 },
	3: { Set: 'best50', NumPics: 6, NumLabels: 6, MinWordLength: 4, MaxWordLength: 7, MaxNumTrials: 2 },
	4: { Set: 'best50', NumPics: 8, NumLabels: 8, MinWordLength: 4, MaxWordLength: 8, MaxNumTrials: 2 },
	5: { Set: 'best50', NumPics: 9, NumLabels: 9, MinWordLength: 4, MaxWordLength: 9, MaxNumTrials: 2 },
	6: { Set: 'best75', NumPics: 16, NumLabels: 16, MinWordLength: 5, MaxWordLength: 10, MaxNumTrials: 2 },
	7: { Set: 'best75', NumPics: 20, NumLabels: 20, MinWordLength: 5, MaxWordLength: 11, MaxNumTrials: 2 },
	8: { Set: 'best100', NumPics: 25, NumLabels: 25, MinWordLength: 6, MaxWordLength: 12, MaxNumTrials: 2 },
	9: { Set: 'best100', NumPics: 36, NumLabels: 36, MinWordLength: 6, MaxWordLength: 13, MaxNumTrials: 2 },
	10: { Set: 'best100', NumPics: 49, NumLabels: 49, MinWordLength: 4, MaxWordLength: 14, MaxNumTrials: 2 },
}
function startGameTP() {
	let allKeys = symKeysBySet.nosymbols;
	let keys = allKeys.filter(x => isdef(symbolDict[x].best100));
	let keys1 = allKeys.filter(x => isdef(symbolDict[x].best100) && isdef(symbolDict[x].bestE));
	let keys2 = allKeys.filter(x => isdef(symbolDict[x].best50));
	let keys3 = allKeys.filter(x => isdef(symbolDict[x].best25));
	keysetsTP = { best25: keys3, best50: keys2, best75: keys1, best100: keys, all: allKeys };
}
function startLevelTP() { levelTP(); }
function levelTP() {
	let levelInfo = Settings.games.gTouchPic.levels[currentLevel];
	MaxNumTrials = levelInfo.trials;
	currentKeys = keysetsTP['best' + levelInfo.vocab];
	NumPics = levelInfo.numPics;
	NumLabels = isdef(levelInfo.numLabels) ? levelInfo.numLabels : NumPics;

}
function levelTP_dep() {
	let levelInfo = LevelsTP[currentLevel];
	MaxNumTrials = 1;// levelInfo.MaxNumTrials;
	//MaxWordLength = levelInfo.MaxWordLength;
	//MinWordLength = levelInfo.MinWordLength;
	//setKeys();
	currentKeys = keysetsTP[levelInfo.Set];
	NumPics = levelInfo.NumPics;
	NumLabels = levelInfo.NumLabels; // Settings.program.labels? levelInfo.NumPics:0;
}
function startRoundTP() {
	uiActivated = false;
}
function promptTP() {
	showPictures(false, evaluate);
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

