const LevelsSP = {
	0: { NumPics: 1, NumLabels: 1, MinWordLength: 2, MaxWordLength: 21, MaxNumTrials: 3 },
	1: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 21, MaxNumTrials: 3 },
	2: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 21, MaxNumTrials: 3 },
	3: { NumPics: 1, NumLabels: 0, MinWordLength: 4, MaxWordLength: 21, MaxNumTrials: 3 },
	4: { NumPics: 1, NumLabels: 0, MinWordLength: 4, MaxWordLength: 21, MaxNumTrials: 3 },
	5: { NumPics: 1, NumLabels: 0, MinWordLength: 5, MaxWordLength: 21, MaxNumTrials: 3 },
	6: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 21, MaxNumTrials: 3 },
	7: { NumPics: 1, NumLabels: 0, MinWordLength: 7, MaxWordLength: 21, MaxNumTrials: 3 },
	8: { NumPics: 1, NumLabels: 0, MinWordLength: 8, MaxWordLength: 21, MaxNumTrials: 3 },
	9: { NumPics: 1, NumLabels: 0, MinWordLength: 7, MaxWordLength: 21, MaxNumTrials: 3 },
	10: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 21, MaxNumTrials: 3 },
}
function startGameSP() { }
function startLevelSP() { levelSP(); }
function levelSP() {
	//console.log('level',currentLevel)
	let levelInfo = LevelsSP[currentLevel];
	MaxNumTrials = levelInfo.MaxNumTrials;
	MaxWordLength = levelInfo.MaxWordLength;
	MinWordLength = levelInfo.MinWordLength;

	//keys sollen die keys sein die auch in dem file 
	setKeys(currentCategories, true, x => lastOfLanguage(x, currentLanguage));
	// currentKeys = currentKeys.filter(x=>BEST80.includes(x));
	currentKeys = currentKeys.filter(x => {
		//console.log(symbolDict[x])
		let kLang = 'best' + currentLanguage;
		let info = symbolDict[x];
		let best = info[kLang];
		let conf = info[kLang + 'Conf'];
		if (isdef(best) && conf > (currentLanguage == 'D' ? 70 : 90)) return true; else return false;
	});
	//console.log('currentCategories', currentCategories)
	//console.log('cats', currentCategories, currentKeys);

	//currentKeys=currentKeys.filter(x=>isdef(CorrectWordsCorrect[x]))
	//console.log(currentKeys);
	NumPics = levelInfo.NumPics;
	NumLabels = levelInfo.NumLabels;
}
function startRoundSP() { }
function promptSP() {

	showPictures(false, () => mBy(defaultFocusElement).focus());
	setGoal();

	showInstruction(bestWord, currentLanguage == 'E' ? 'say:' : "sage: ", dTitle);
	animate(dInstruction, 'pulse800' + getSignalColor(), 900);

	mLinebreak(dTable);
	MicrophoneUi = mMicrophone(dTable);

	return 10; //1000;
}
function trialPromptSP() {
	//showFleetingMessage('Say again!',0,{fz:80,fg:'red'});
	Speech.say(currentLanguage == 'E' ? 'try again!' : 'nochmal', 1, 1, .3, true, 'zira');
	animate(dInstruction, 'pulse800' + getSignalColor(), 900);
	return 1500;
}
async function activateSP() {
	if (Speech.speaker.isSpeakerRunning) {
		setTimeout(activateSP, 1000);
	} else {
		setTimeout(() => Speech.recognize(bestWord, currentLanguage, evaluate, evaluate), 100);
	}
	//orig code:
	// setTimeout(() => {
	// 	record(currentLanguage, bestWord);
	// }, trialNumber == 0 ? 4000 : 1500);
}
function evalSP(speechResult, confidence) {

	if (isEmpty(speechResult)) {
		//console.log('.....empty speechResult');
		return false;
	}

	Selected = {}
	let answer = Goal.answer = Selected.answer = normalize(speechResult, currentLanguage);
	let reqAnswer = Goal.reqAnswer = normalize(bestWord, currentLanguage);


	Selected.reqAnswer = reqAnswer;
	Selected.answer = answer;


	//console.log('required:' + reqAnswer, 'got:' + answer, confidence)

	return isSimilar(answer, reqAnswer);

}


