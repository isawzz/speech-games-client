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

	Score.nTotal += 1;
	if (isCorrect) {
		Score.nCorrect += 1;
		if (G.trialNumber == 1) Score.nCorrect1 += 1;
	}

	//percentage:
	percentageCorrect = Math.round(100 * Score.nCorrect / Score.nTotal);

	//inc streaks
	if (isCorrect) { Score.nPos += 1; Score.nNeg = 0; } else { Score.nPos = 0; Score.nNeg += 1; }

	//see if it is time for level change check
	let levelChange = 0;
	let gameChange = false;
	let nextLevel = G.level;

	let toggle = Settings.showLabels == 'toggle';
	let hasLabels = Settings.labels && G.numLabels != 0;

	let boundary = calibrating() ? getCalBoundary() : Settings.samplesPerGame;

	//ignore this for now!
	// if (calibrating()) {
	// 	if (!isCorrect) {
	// 		//goto next game
	// 		updateStartLevelForUser(G.key, nextLevel);
	// 		levelChange = 1; nextLevel = G.maxLevel + 1; //make sure there will be game change!
	// 	} else if (Score.nTotal >= boundary) {
	// 		//goto next level and upgrade user starrtLevel
	// 		updateStartLevelForUser(G.key, nextLevel);
	// 		levelChange = 1; nextLevel += 1;
	// 	} else if (Score.nTotal >= boundary / 2 && toggle && hasLabels) {
	// 		Settings.labels = false;
	// 	}
	// 	return [levelChange, nextLevel];
	// }

	//der rest ist nur noch fuer NOT IN CALIBRATING MODE!!!

	// have to figure out levelChange,gameChange and nextLevel
	//gameChange will happen when boundary has been achieved

	//levelChange will happen when streak has been completed
	//nextLevel will go up or down on level change
	//nextLevel will be set in setGame on gameChange


	//check percentageCorrect
	if (Score.nTotal >= boundary) {
		gameChange = true; levelChange = false;
		// if (percentageCorrect > 75) { levelChange = 1; nextLevel += 1; }
		// else if (percentageCorrect < 25) { levelChange = -1; nextLevel = (nextLevel > 0 ? nextLevel - 1 : 0); }
		// else { levelChange = 0; }
	} else {
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

	}

	//console.log('gameChange', gameChange, 'levelChange', levelChange, 'nextLevel', nextLevel)
	// if (calibrating() && !levelChange && (Score.nTotal >= getCalBoundary() || !isCorrect)) {
	// 	levelChange = 1;
	// 	if (percentageCorrect >= 99) {updateStartLevelForUser(G.key, nextLevel); nextLevel += 1;}
	// }

	if (levelChange) {
		if (toggle) Settings.labels = true;
	} else if (toggle && hasLabels && Score.nTotal >= Settings.samplesPerGame / 2) {
		Settings.labels = false;
	}

	if (levelChange) {
		if (nextLevel > 0 && nextLevel <= G.maxLevel) updateStartLevelForUser(G.key, nextLevel);
		//upgrade startLevel for this user if reached 100%
		//console.log('==>scoring',percentageCorrect,nextLevel,G.maxLevel,levelChange);
		// if (percentageCorrect >= 99 && nextLevel > 0 && nextLevel <= G.maxLevel) updateStartLevelForUser(G.key, nextLevel);
		// else if (levelChange < 0) updateStartLevelForUser(G.key, nextLevel);
	}

	Score.gameChange = gameChange;
	Score.levelChange = nextLevel != G.level ? levelChange : false;
	return nextLevel;
	//return [gameChange, levelChange, nextLevel];
}



