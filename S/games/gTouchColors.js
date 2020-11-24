var uiActivated;
const SIMPLE_COLORS = ['red', 'green', 'yellow', 'blue'];
const EXTENDED_COLORS = ['red', 'green', 'yellow', 'blue', 'pink', 'indigo', 'gray', 'sienna', 'olive'];

var NumColors;
const LevelsTC = {
	0: { NumColors: 2, NumPics: 2, NumLabels: 4, MinWordLength: 2, MaxWordLength: 5, MaxNumTrials: 1 },
	1: { NumColors: 2, NumPics: 3, NumLabels: 6, MinWordLength: 3, MaxWordLength: 6, MaxNumTrials: 1 },
	2: { NumColors: 3, NumPics: 2, NumLabels: 6, MinWordLength: 3, MaxWordLength: 7, MaxNumTrials: 1 },
	3: { NumColors: 3, NumPics: 3, NumLabels: 9, MinWordLength: 4, MaxWordLength: 7, MaxNumTrials: 1 },
	4: { NumColors: 3, NumPics: 3, NumLabels: 7, MinWordLength: 4, MaxWordLength: 14, MaxNumTrials: 2 },
	5: { NumColors: 2, NumPics: 2, NumLabels: 2, MinWordLength: 4, MaxWordLength: 8, MaxNumTrials: 1 },
	6: { NumColors: 2, NumPics: 2, NumLabels: 0, MinWordLength: 4, MaxWordLength: 9, MaxNumTrials: 1 },
	7: { NumColors: 3, NumPics: 3, NumLabels: 5, MinWordLength: 5, MaxWordLength: 10, MaxNumTrials: 2 },
	8: { NumColors: 3, NumPics: 3, NumLabels: 3, MinWordLength: 5, MaxWordLength: 11, MaxNumTrials: 2 },
	9: { NumColors: 3, NumPics: 3, NumLabels: 0, MinWordLength: 6, MaxWordLength: 12, MaxNumTrials: 2 },
	10: { NumColors: 4, NumPics: 4, NumLabels: 0, MinWordLength: 6, MaxWordLength: 13, MaxNumTrials: 3 },
}
function startGameTC() { }
function startLevelTC() { levelTC(); }
function levelTC() {
	let levelInfo = LevelsTC[currentLevel];
	MaxNumTrials = levelInfo.MaxNumTrials;
	MaxWordLength = levelInfo.MaxWordLength;
	MinWordLength = levelInfo.MinWordLength;
	setKeys(currentCategories, true);

	//remove all words that have a color in key
	currentKeys = currentKeys.filter(x => containsColorWord(x));

	NumPics = levelInfo.NumPics;
	NumLabels = levelInfo.NumLabels;
	NumColors = levelInfo.NumColors;
}
function startRoundTC() {
	uiActivated = false;
}
function promptTC() {
	// let colors = choose(currentLevel<3?SIMPLE_COLORS:EXTENDED_COLORS,NumColors);

	let [colorlist, shade] = ensureColors();
	let colors = choose(colorlist, NumColors);
	showPictures(false, evaluate, { colors: colors, overlayShade: shade });

	setGoal(randomNumber(0, NumPics * colors.length - 1));
	Goal.correctionPhrase = Goal.shade + ' ' + Goal.label;

	let spoken = `click the ${Goal.shade} ${bestWord}`;
	showInstruction(bestWord, `click the <span style='color:${Goal.shade}'>${Goal.shade.toUpperCase()}</span>`,
		dTitle, true, spoken);
	return 10;
}
function trialPromptTC() {
	Speech.say(currentLanguage == 'D' ? 'nochmal!' : 'try again!');
	// Speech.say('try again');
	shortHintPic();
	return 10;

}
function activateTC() {
	uiActivated = true;
}
function evalTC(ev) {
	let id = evToClosestId(ev);
	ev.cancelBubble = true;

	let i = firstNumber(id);
	let item = Pictures[i];
	Selected = { pic: item, feedbackUI: item.div };
	Selected.reqAnswer = bestWord;
	Selected.answer = item.label;

	if (item == Goal) { return true; } else { return false; }
}

// game specific helpers
function containsColorWord(s) {
	let colors = ['old', 'blond', 'red', 'blue', 'green', 'purple', 'black', 'brown', 'white', 'grey', 'gray', 'yellow', 'orange'];
	for (const c of colors) {
		if (s.toLowerCase().includes(c)) return false;
	}
	return true;
}
function ensureColors() {
	let colorlist = lookupSet(Settings, ['games', 'gTouchColors', 'colors'], SIMPLE_COLORS);
	let shadeColor = lookupSet(Settings, ['games', 'gTouchColors', 'shadeColor'], 'red');
	let contrast = lookupSet(Settings, ['games', 'gTouchColors', 'contrast'], .35);
	let shade = anyColorToStandardString(shadeColor, contrast);
	//console.log('shade',shade)
	//Settings.games.gTouchColors.colors = colorlist;
	return [colorlist, shade];
}
