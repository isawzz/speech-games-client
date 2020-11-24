function showScore() {
	//dScore.innerHTML = 'score: ' + numCorrectAnswers + '/' + numTotalAnswers + ' (' + percentageCorrect + '%)';
	//let scoreString = 'score: ' + levelPoints + ' (' + percentageCorrect + '%)';
	// let scoreString = 'question: ' + (numTotalAnswers + 1) + ' (' + percentageCorrect + '%)';
	let scoreString = scoringMode == 'n' ? 'question: ' + (numTotalAnswers + 1) + '/' + SAMPLES_PER_LEVEL[currentLevel] :
		scoringMode == 'percent' ? 'score: ' + numCorrectAnswers + '/' + numTotalAnswers + ' (' + percentageCorrect + '%)'
			: scoringMode == 'inc' ? 'score: ' + levelPoints + ' (' + percentageCorrect + '%)'
				: 'question: ' + numTotalAnswers + '/' + boundary;

	if (LevelChange)
		dScore.innerHTML = scoreString;
	else
		setTimeout(() => { dScore.innerHTML = scoreString; }, 300);
}
function resetScore() {
	numCorrectAnswers = 0, numTotalAnswers = 0, percentageCorrect = 100;
	levelPoints = 0, levelIncrement = minIncrement;
	PosInARow = NegInARow = 0;
}
function scoreSummary() {

	//wie bekomm ich UnitScoreSummary???
	//wo startet eine neue unit????
	//ich habe jetzt den UnitScoreSummary

	//calc SessionScoreSummary
	let scoreByGame = {};
	for (const gdata of CurrentSessionData.games) {
		let gname = gdata.name;
		let nTotal = 0;
		let nCorrect = 0;
		for (const ldata of gdata.levels) {
			if (nundef(ldata.numTotalAnswers)) continue;
			nTotal += ldata.numTotalAnswers;
			nCorrect += ldata.numCorrectAnswers;
		}
		if (nTotal == 0) continue;
		if (isdef(scoreByGame[gname])) {
			scoreByGame[gname].nTotal += nTotal;
			scoreByGame[gname].nCorrect += nCorrect;
		} else {
			scoreByGame[gname] = { name: gname, nTotal: nTotal, nCorrect: nCorrect };
		}
	}
	//console.log('game',game);
	for (const gname in scoreByGame) {
		let tot = scoreByGame[gname].nTotal;
		if (nundef(tot) || tot == 0) continue;
		let corr = scoreByGame[gname].nCorrect;
		//console.log(gname,tot,corr)
		scoreByGame[gname].percentage = Math.round((corr / tot) * 100);
	}

	// mText('Writing: 10/15 correct answers (70%)', d, style);
	return scoreByGame;

}
function lastStreakFalse(items) {
	let n = Settings.program.decrementLevelOnNegativeStreak;
	let iFrom = items.length - 1;
	let iTo = iFrom - n;
	for (let i = iFrom; i > iTo; i--) {
		if (i < 0) return false;
		else if (items[i].isCorrect) return false;
	}
	return true;

}
function lastStreakCorrect(items) {
	let n = Settings.program.incrementLevelOnPositiveStreak;
	let iFrom = items.length - 1;
	let iTo = iFrom - n;
	for (let i = iFrom; i > iTo; i--) {
		if (i < 0) return false;
		else if (!items[i].isCorrect) return false;
	}
	return true;

}
function scoring(isCorrect) {

	CurrentGoalData = {
		key: Goal.key, isCorrect: IsAnswerCorrect, reqAnswer: Selected.reqAnswer, answer: Selected.answer,
		//selected: Selected, goal: Goal,
	};
	CurrentLevelData.items.push(CurrentGoalData);

	numTotalAnswers += 1;
	if (isCorrect) numCorrectAnswers += 1;

	//percent scoringMode:
	percentageCorrect = Math.round(100 * numCorrectAnswers / numTotalAnswers);

	//inc scoringMode:
	if (isCorrect) {
		levelPoints += levelIncrement; if (levelIncrement < maxIncrement) levelIncrement += 1;
		PosInARow += 1; NegInARow = 0;
	} else {
		levelIncrement = minIncrement; levelPoints += minIncrement;
		PosInARow = 0; NegInARow += 1;
	}

	//see if it is time for level change check
	let levelChange = 0;
	let nextLevel = currentLevel;

	if (numTotalAnswers >= boundary) {
		if (scoringMode == 'inc') {
			if (levelPoints >= levelDonePoints && percentageCorrect >= 50) {
				levelChange = 1; nextLevel += 1;
			}


		} else if (scoringMode == 'percent') {
			if (percentageCorrect >= 80) { levelChange = 1; nextLevel += 1; }
			else if (percentageCorrect < 50) { levelChange = -1; if (nextLevel > 0) nextLevel -= 1; }

		} else if (scoringMode == 'autograde') {
			//console.log('... autograding');
			//saveAnswerStatistic();
			saveStats();
			levelChange = 1;
			nextLevel += 1;

		} else if (scoringMode == 'n' || scoringMode == 'adapt') {
			//console.log('correct:', numCorrectAnswers, 'total:', numTotalAnswers)
			if (numCorrectAnswers > numTotalAnswers / 2) { levelChange = 1; nextLevel += 1; }
			else if (numCorrectAnswers < numTotalAnswers / 2) {
				console.log('DOWNGRADING!!!!!!!')
				levelChange = -1; nextLevel = (nextLevel > 0 ? nextLevel - 1 : 0);
			}

		}
	}


	if (scoringMode == 'adapt' && levelChange == 0) {

		console.assert(levelChange == 0 && nextLevel == currentLevel, "adapt scoringMode but altered levelChange or nextLevel!!!")

		// look at this level history:
		let items = CurrentLevelData.items;
		let pos = Settings.program.incrementLevelOnPositiveStreak;
		let posSeq = pos > 0 && PosInARow >= pos;
		let neg = Settings.program.decrementLevelOnNegativeStreak;
		let negSeq = neg > 0 && NegInARow >= neg;
		let hasLabels = Settings.program.labels;

		console.log('streaks:', '+', posSeq, '-', negSeq)

		if (posSeq && hasLabels && Settings.program.showLabels == 'toggle') { PosInARow = 0; Settings.program.labels = false; }
		else if (posSeq) { levelChange = 1; nextLevel += 1; PosInARow = 0; }
		if (negSeq && !hasLabels && Settings.program.showLabels == 'toggle') { NegInARow = 0; Settings.program.labels = true; }
		else if (negSeq) { levelChange = -1; if (nextLevel > 0) nextLevel -= 1; NegInARow = 0; }

	}


	console.log('levelChange', levelChange, 'nextLevel', nextLevel)
	//by here, levelChange and nextLevel MUST HAVE BEEN DETERMINED CORRECTLY!

	let toggle = Settings.program.showLabels == 'toggle';
	let hasLabels = Settings.program.labels;


	if (levelChange) {
		CurrentLevelData.numTotalAnswers = numTotalAnswers;
		CurrentLevelData.numCorrectAnswers = numCorrectAnswers;
		CurrentLevelData.percentageCorrect = percentageCorrect;

		let gdata = isdef(UnitScoreSummary[currentGame]) ? UnitScoreSummary[currentGame] : { name: currentGame, nTotal: 0, nCorrect: 0 };
		gdata.nTotal += numTotalAnswers;
		gdata.nCorrect += numCorrectAnswers;
		gdata.percentage = Math.round(100 * gdata.nCorrect / gdata.nTotal);
		UnitScoreSummary[currentGame] = gdata;

		if (toggle) Settings.program.labels = true;

	} else if (toggle && hasLabels && numTotalAnswers >= boundary / 2) {
		Settings.program.labels = false;
	}
	return [levelChange, nextLevel];
}



