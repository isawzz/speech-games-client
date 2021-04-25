function initScore() { resetScore(); }//Score = { gameChange: true, levelChange: true, nTotal: 0, nCorrect: 0, nCorrect1: 0, nPos: 0, nNeg: 0 }; }
function lastStreakFalse(items) {
	let n = G.decrementLevelOnNegativeStreak;
	let iFrom = items.length - 1;
	let iTo = iFrom - n;
	for (let i = iFrom; i > iTo; i--) {
		if (i < 0) return false;
		else if (items[i].isCorrect) return false;
	}
	return true;

}
function lastStreakCorrect(items) {
	let n = G.incrementLevelOnPositiveStreak;
	let iFrom = items.length - 1;
	let iTo = iFrom - n;
	for (let i = iFrom; i > iTo; i--) {
		if (i < 0) return false;
		else if (!items[i].isCorrect) return false;
	}
	return true;

}
function scoring(isCorrect) {

	//console.log(Score)
	// update Score incl. streaks
	Score.nTotal += 1;
	if (isCorrect) { Score.nCorrect += 1; if (G.trialNumber == 1) Score.nCorrect1 += 1; }
	percentageCorrect = Math.round(100 * Score.nCorrect / Score.nTotal);
	if (isCorrect) { Score.nPos += 1; Score.nNeg = 0; } else { Score.nPos = 0; Score.nNeg += 1; }

	let levelChange = 0;
	let gameChange = false;
	let nextLevel = G.level;
	let toggle = G.pictureLabels == 'toggle';
	let hasLabels = G.showLabels == true; //currently has labels
	let boundary = G.samplesPerGame;


	//level change will occur iff streak (- or +). on streak: update StartLevel For User!
	//check streaks
	let pos = G.incrementLevelOnPositiveStreak;
	let posSeq = pos > 0 && Score.nPos >= pos;
	let halfposSeq = pos > 0 && Score.nPos >= pos / 2;
	let neg = G.decrementLevelOnNegativeStreak;
	let negSeq = neg > 0 && Score.nNeg >= neg;
	let halfnegSeq = neg > 0 && Score.nNeg >= neg / 2;
	// console.log('_________pos',pos,'posSeq',posSeq,'neg',neg,'negSeq',negSeq);
	//console.log('_________posSeq', posSeq, 'negSeq', negSeq);
	let labelsNextRound = G.showLabels;
	if (halfposSeq && hasLabels && toggle) { labelsNextRound = false; }
	else if (posSeq) { levelChange = 1; nextLevel += 1; Score.nPos = 0; }
	if (halfnegSeq && !hasLabels && toggle) { labelsNextRound = true; }
	else if (negSeq) { levelChange = -1; if (nextLevel > 0) nextLevel -= 1; Score.nNeg = 0; }
	if (nextLevel != G.Level && nextLevel > 0 && nextLevel <= G.maxLevel) {
		userUpdate(['games', G.id, 'startLevel'], nextLevel);
		// updateStartLevelForUser(G.id, nextLevel);
	}

	// if boundary reached: change game, 
	if (Score.nTotal >= boundary) {
		gameChange = true; levelChange = false;
	}

	if (levelChange || gameChange) {
		if (toggle) labelsNextRound = true;
	} else if (!halfnegSeq && toggle && hasLabels && Score.nTotal >= G.samplesPerGame / 2) {
		labelsNextRound = false;
	}

	//console.log('toggle', toggle, 'showLabels', hasLabels, 'labelsNextRound', labelsNextRound);
	G.showLabels = labelsNextRound;
	Score.gameChange = gameChange;
	Score.levelChange = levelChange;
	return nextLevel;
}



