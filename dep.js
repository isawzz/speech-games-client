function levelTP_dep() {
	let levelInfo = LevelsTP[currentLevel];
	MaxNumTrials = 1;// levelInfo.MaxNumTrials;
	//MaxWordLength = levelInfo.MaxWordLength;
	//MinWordLength = levelInfo.MinWordLength;
	//setKeys();
	currentKeys = KeySets[levelInfo.Set];
	NumPics = levelInfo.NumPics;
	NumLabels = levelInfo.NumLabels; // Settings.program.labels? levelInfo.NumPics:0;
}
function levelML_dep() {

	let levelInfo = LevelsML[currentLevel];
	MaxNumTrials = levelInfo.MaxNumTrials;
	MaxWordLength = levelInfo.MaxWordLength;
	MinWordLength = levelInfo.MinWordLength;
	setKeys();
	NumPics = levelInfo.NumPics;
	NumLabels = levelInfo.NumLabels;

	NumMissingLetters = levelInfo.NumMissingLetters;
	MaxPosMissing = levelInfo.MaxPosMissing;
	//console.log('NumMissing:' + NumMissingLetters, 'max pos:' + MaxPosMissing);
}








