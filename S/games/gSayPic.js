function startGameSP() { }
function startLevelSP() { levelSP(); }
function levelSP() {
	
	MaxNumTrials = getGameOrLevelInfo('trials', 3);

	let vinfo = getGameOrLevelInfo('vocab', 100);
	currentKeys = setKeys({ lang: currentLanguage, nbestOrCats: vinfo, confidence: (currentLanguage == 'D' ? 70 : 90) });

	NumPics = NumLabels = 1;
}
function startRoundSP() { }
function promptSP() {

	showPictures(() => mBy(defaultFocusElement).focus());
	setGoal();

	showInstruction(bestWord, currentLanguage == 'E' ? 'say:' : "sage: ", dTitle);
	animate(dInstruction, 'pulse800' + getSignalColor(), 900);

	mLinebreak(dTable);
	MicrophoneUi = mMicrophone(dTable);
	MicrophoneHide();


	return 10; //1000;
}
function trialPromptSP(nTrial) {
	let phrase = nTrial<2?(currentLanguage == 'E' ? 'speak UP!!!' : 'LAUTER!!!')
	:(currentLanguage == 'E' ? 'Louder!!!' : 'LAUTER!!!');
	Speech.say(phrase, 1, 1, 1, 'zira');
	animate(dInstruction, 'pulse800' + getSignalColor(), 500);
	return 10;
}
async function activateSP() {
	if (Speech.isSpeakerRunning()) {
		setTimeout(activateSP, 200);
	} else {
		setTimeout(() => Speech.startRecording(currentLanguage, evaluate), 0);
	}
}
function evalSP(isfinal, speechResult, confidence) {

	Selected = {}
	let answer = Goal.answer = Selected.answer = normalize(speechResult, currentLanguage);
	let reqAnswer = Goal.reqAnswer = normalize(bestWord, currentLanguage);

	Selected.reqAnswer = reqAnswer;
	Selected.answer = answer;

	if (isEmpty(answer)) return false;
	else return isSimilar(answer, reqAnswer);

}


