function initScore() { Score = { gameChange: true, levelChange: true, nTotal: 0, nCorrect: 0, nCorrect1: 0, nPos: 0, nNeg: 0 }; }
function lastStreakFalse(items) {
	let n = Settings.decrementLevelOnNegativeStreak;
	let iFrom = items.length - 1;
	let iTo = iFrom - n;
	for (let i = iFrom; i > iTo; i--) {
		if (i < 0) return false;
		else if (items[i].isCorrect) return false;
	}
	return true;

}
function lastStreakCorrect(items) {
	let n = Settings.incrementLevelOnPositiveStreak;
	let iFrom = items.length - 1;
	let iTo = iFrom - n;
	for (let i = iFrom; i > iTo; i--) {
		if (i < 0) return false;
		else if (!items[i].isCorrect) return false;
	}
	return true;

}
function scoring(isCorrect) {

	// update Score incl. streaks
	Score.nTotal += 1;
	if (isCorrect) { Score.nCorrect += 1; if (G.trialNumber == 1) Score.nCorrect1 += 1; }
	percentageCorrect = Math.round(100 * Score.nCorrect / Score.nTotal);
	if (isCorrect) { Score.nPos += 1; Score.nNeg = 0; } else { Score.nPos = 0; Score.nNeg += 1; }

	let levelChange = 0;
	let gameChange = false;
	let nextLevel = G.level;
	let toggle = Settings.showLabels == 'toggle';
	let hasLabels = Settings.labels && G.numLabels != 0;
	let boundary = Settings.samplesPerGame;

	//level change will occur iff streak (- or +). on streak: updateStartLevelForUser!
	//check streaks
	let pos = Settings.incrementLevelOnPositiveStreak;
	let posSeq = pos > 0 && Score.nPos >= pos;
	let neg = Settings.decrementLevelOnNegativeStreak;
	let negSeq = neg > 0 && Score.nNeg >= neg;
	// console.log('_________pos',pos,'posSeq',posSeq,'neg',neg,'negSeq',negSeq);
	//console.log('_________posSeq', posSeq, 'negSeq', negSeq);
	if (posSeq && hasLabels && toggle) { Score.nPos = 0; Settings.labels = false; }
	else if (posSeq) { levelChange = 1; nextLevel += 1; Score.nPos = 0; }
	if (negSeq && !hasLabels && toggle) { Score.nNeg = 0; Settings.labels = true; }
	else if (negSeq) { levelChange = -1; if (nextLevel > 0) nextLevel -= 1; Score.nNeg = 0; }
	if (nextLevel != G.Level && nextLevel > 0 && nextLevel <= G.maxLevel) {
		updateStartLevelForUser(G.key, nextLevel, 'cscoring');
	}

	// if boundary reached: change game, 
	if (Score.nTotal >= boundary) {
		gameChange = true; levelChange = false;
	}

	if (levelChange || gameChange) {
		if (toggle) Settings.labels = true;
	} else if (toggle && hasLabels && Score.nTotal >= Settings.samplesPerGame / 2) {
		Settings.labels = false;
	}

	Score.gameChange = gameChange;
	Score.levelChange = levelChange;
	return nextLevel;
}



