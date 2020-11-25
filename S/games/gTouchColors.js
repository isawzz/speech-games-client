var uiActivated;
const SIMPLE_COLORS = ['red', 'green', 'yellow', 'blue'];
const EXTENDED_COLORS = ['red', 'green', 'yellow', 'blue', 'pink', 'indigo', 'gray', 'sienna', 'olive'];

var NumColors;
function startGameTC() { }
function startLevelTC() { levelTC(); }
function levelTC(){
	MaxNumTrials = getGameOrLevelInfo('trials', 2);
	let vinfo = getGameOrLevelInfo('vocab', 100);

	currentKeys = isNumber(vinfo) ? KeySets['best' + getGameOrLevelInfo('vocab', 100)] : setKeys(vinfo);
	currentKeys = currentKeys.filter(x => containsColorWord(x));

	NumPics = getGameOrLevelInfo('numPics', 3);
	NumColors = getGameOrLevelInfo('numColors', NumColors); 
	NumLabels = getGameOrLevelInfo('numLabels', NumPics*NumColors); 

}
function startRoundTC() {
	uiActivated = false;
}
function promptTC() {

	let [colorlist, shade] = ensureColors();
	let colors = choose(colorlist, NumColors);
	showPictures(evaluate, { colors: colors, overlayShade: shade });

	setGoal(randomNumber(0, NumPics * colors.length - 1));
	Goal.correctionPhrase = Goal.shade + ' ' + Goal.label;

	let spoken = `click the ${Goal.shade} ${bestWord}`;
	showInstruction(bestWord, `click the <span style='color:${Goal.shade}'>${Goal.shade.toUpperCase()}</span>`,
		dTitle, true, spoken);
	return 10;
}
function trialPromptTC() {
	Speech.say(currentLanguage == 'D' ? 'nochmal!' : 'try again!');
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
	return [colorlist, shade];
}
