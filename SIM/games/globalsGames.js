var pictureSize;

function startGame() {

	if (currentGame == 'gSayPic') Speech.stopRecording();

	currentGame = Settings.program.gameSequence[Settings.program.currentGameIndex].game;
	
	GameInfo = Settings.games[currentGame];
	LevelInfo = GameInfo.levels;
	//MaxLevel = 0;
	//console.log(LevelInfo,typeof LevelInfo)
	MaxLevel = isdef(LevelInfo) ? Object.keys(LevelInfo).length - 1 : 0;

	currentColor = GFUNC[currentGame].color; //getCurrentColor(currentGame);

	currentLevel = getCurrentLevel(currentGame);
	//console.log('______ * game', currentGame, 'level', currentLevel, '*')

	CurrentGameData = { name: currentGame, levels: [] };
	CurrentSessionData.games.push(CurrentGameData);

	onkeydown = null;
	onkeypress = null;
	onkeyup = null;

	resetState();

	GFUNC[currentGame].startGame();

	startLevel();
}
function startLevel(level) {

	currentLanguage = Settings.program.currentLanguage;

	Speech.setLanguage(currentLanguage);

	CurrentLevelData = { level: currentLevel, items: [] };
	CurrentGameData.levels.push(CurrentLevelData);

	boundary = Settings.program.samplesPerLevel; // SAMPLES_PER_LEVEL[currentLevel];
	resetScore();
	GFUNC[currentGame].startLevel(); //settings level dependent params eg., MaxNumTrials...

	startRound();
}
function startRound() {
	setTimeout(() => startRoundReally(), ROUND_DELAY);
}
function startRoundReally() {
	clearFleetingMessage();
	showStats();
	LevelChange = false; //needs to be down here because showScore needs that info!

	if (ROUND_OUTPUT) {
		// writeComments('new round:');
		console.log('...' + currentGame.substring(1), 'round:' + ' level:' + currentLevel, 'pics:' + NumPics, 'labels:' + NumLabels,
			'\nkeys:' + currentKeys.length, 'minlen:' + MinWordLength, 'maxlen:' + MaxWordLength, 'trials#:' + MaxNumTrials);
	}
	trialNumber = 0;
	GFUNC[currentGame].startRound();
	promptStart();

}
function promptStart() {
	beforeActivationUI();

	dTable = dLineTableMiddle;
	dTitle = dLineTitleMiddle;
	if (nundef(dTable)) return;
	clearTable();

	let delay = GFUNC[currentGame].prompt();
	setTimeout(activateUi, delay);
}
function promptNextTrial() {
	beforeActivationUI();

	let delay = GFUNC[currentGame].trialPrompt(trialNumber);
	setTimeout(activateUi, delay);
}
function selectWord(info, bestWordIsShortest, except = []) {
	let candidates = info.words.filter(x => x.length >= MinWordLength && x.length <= MaxWordLength);

	let w = bestWordIsShortest ? getShortestWord(candidates, false) : arrLast(candidates);
	if (except.includes(w)) {
		let wNew = lastCond(info.words, x => !except.includes(w));
		if (wNew) w = wNew;
	}
	return w;
}
function showPictures(onClickPictureHandler, { colors, contrast, repeat=1, sameBackground=true, border } = {}, keys, labels) {
	Pictures = [];

	if (nundef(keys)) keys = choose(currentKeys, NumPics);
	//keys[0]='man in manual wheelchair';
	//keys=['sun with face'];
	//console.log(keys,repeat)
	Pictures = maShowPictures(keys,labels,dTable,onClickPictureHandler,
		{repeat:repeat,sameBackground:sameBackground, border:border, lang:currentLanguage, colors:colors, contrast:contrast });

	// if (nundef(keys)) keys = choose(currentKeys, NumPics);
	// Pictures = maShowPictures(keys,labels,dTable,onClickPictureHandler,{ colors, contrast });

	let totalPics = Pictures.length;
	if (Settings.program.labels) {
		if (NumLabels == totalPics) return;
		let remlabelPic = choose(Pictures, totalPics - NumLabels);
		for (const p of remlabelPic) { maHideLabel(p.id, p.info); p.isLabelVisible = false; }
	} else {
		for (const p of Pictures) { maHideLabel(p.id, p.info); p.isLabelVisible = false; }

	}

}
function setGoal(index) {
	if (nundef(index)) {
		let rnd = NumPics < 2 ? 0 : randomNumber(0, NumPics - 2);
		if (NumPics >= 2 && rnd == lastPosition && coin(70)) rnd = NumPics - 1;
		index = rnd;
	}
	
	lastPosition = index;
	Goal = Pictures[index];
	//Goal = firstCond(Pictures,x=>x.key == 'man in manual wheelchair');
	// console.log(Pictures,index)
	setCurrentInfo(Goal); //sets bestWord, ...

}
function showInstruction(text, cmd, title, isSpoken, spoken) {
	//console.assert(title.children.length == 0,'TITLE NON_EMPTY IN SHOWINSTRUCTION!!!!!!!!!!!!!!!!!')
	clearElement(title);
	let d = mDiv(title);
	mStyleX(d, { margin: 15 })
	mClass(d, 'flexWrap');

	let msg = cmd + " " + `<b>${text.toUpperCase()}</b>`;
	let d1 = mText(msg, d, { fz: 36, display: 'inline-block' });
	let sym = symbolDict.speaker;
	let d2 = mText(sym.text, d, {
		fz: 38, weight: 900, display: 'inline-block',
		family: sym.family, 'padding-left': 14
	});
	dFeedback = dInstruction = d;

	dInstruction.addEventListener('click', () => aniInstruction(cmd + " " + text));
	if (!isSpoken) return;

	Speech.say(isdef(spoken) ? spoken : (cmd + " " + text), .7, 1, .7, 'random');

}
function activateUi() {

	Selected = null;
	GFUNC[currentGame].activate();
	activationUI();
}
function evaluate() {
	if (uiPaused) return;
	hasClickedUI();
	IsAnswerCorrect = GFUNC[currentGame].eval(...arguments);

	trialNumber += 1;
	if (!IsAnswerCorrect && trialNumber < MaxNumTrials) { promptNextTrial(); return; }

	//feedback
	if (IsAnswerCorrect) {
		DELAY = skipAnimations ? 300 : 1500;
		successPictureGoal();
	} else {
		DELAY = skipAnimations ? 300 : 3000;
		showCorrectWord();
		failPictureGoal(false);
	}
	setTimeout(removeMarkers, 1500);

	[LevelChange, currentLevel] = scoring(IsAnswerCorrect); //get here only if this is correct or last trial!

	updateGameSequence(currentLevel);
	if (LevelChange != 0) saveProgram();

	if (LevelChange && ProgTimeIsUp()) { gameOver('Great job! Time for a break!'); }
	else if (LevelChange < 0) setTimeout(removeBadgeAndRevertLevel, DELAY);
	else if (LevelChange > 0) { setTimeout(showLevelComplete, DELAY); }
	else setTimeout(proceedIfNotStepByStep, DELAY);
}
function proceedIfNotStepByStep(nextLevel) {
	if (!StepByStepMode) { proceed(nextLevel); }
}
function proceed(nextLevel) {
	//console.log('proceedAfterLevelChange', currentLevel, MaxLevel)
	if (nundef(nextLevel)) nextLevel = currentLevel;

	if (ProgTimeIsUp() && LevelChange) {
		gameOver('Great job! Time for a break!');
		return;
	}
	if (nextLevel > MaxLevel) {
		if (Settings.program.currentGameIndex >= Settings.program.gameSequence.length) {
			gameOver('Congratulations! You are done!');
		} else {
			startGame();
		}
	} else if (LevelChange) startLevel(nextLevel);
	else startRound();
}

//#region fail or success
function failPictureGoal(withComment = true) {

	if (withComment && !skipAnimations) {
		const comments = (currentLanguage == 'E' ? ['too bad'] : ["aber geh'"]);
		Speech.say(chooseRandom(comments), 1, 1, .8, 'zira', () => { console.log('FERTIG FAIL!!!!'); });
	}
	if (isdef(Selected) && isdef(Selected.feedbackUI)) {

		// let sz = getBounds(Selected.feedbackUI).height;
		// mpOver(mBy('dX'), Selected.feedbackUI, sz * (1 / 2), 'red', 'openMojiTextBlack');

		let uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
		let sz = getBounds(uilist[0]).height;
		for (const ui of uilist) mpOver(markerFail(), ui, sz * (1 / 2), 'red', 'openMojiTextBlack');
	}

}
function successPictureGoal(withComment = true) {
	if (withComment && !skipAnimations) {
		const comments = (currentLanguage == 'E' ? ['YEAH!', 'Excellent!!!', 'CORRECT!', 'Great!!!'] : ['gut', 'Sehr Gut!!!', 'richtig!!', 'Bravo!!!']);
		Speech.say(chooseRandom(comments));//'Excellent!!!');
	}
	if (isdef(Selected) && isdef(Selected.feedbackUI)) {
		//mpOver(mBy('dX'), Selected.feedbackUI, sz * (1 / 2), 'red', 'openMojiTextBlack');

		// let sz = getBounds(Selected.feedbackUI).height;
		// mpOver(mBy('dCheckMark'), Selected.feedbackUI, sz * (4 / 5), 'limegreen', 'segoeBlack');
		let uilist;
		if (isdef(Selected.positiveFeedbackUI)) uilist = [Selected.positiveFeedbackUI];
		else uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
		let sz = getBounds(uilist[0]).height;
		for (const ui of uilist) mpOver(markerSuccess(), ui, sz * (4 / 5), 'limegreen', 'segoeBlack');
	}
	// mpOver(mBy('dCheckMark'), mBy(Goal.id), pictureSize * (4 / 5), 'limegreen', 'segoeBlack');

}
//#endregion

//#region game over
function gameOver(msg) {
	setTimeout(aniGameOver(msg), DELAY);
	SessionScoreSummary = scoreSummary();
	//update UserHistory
	if (nundef(UserHistory)) {
		UserHistory = jsCopy(SessionScoreSummary);
	} else {
		for (const gname in SessionScoreSummary) {
			let hist = UserHistory[gname];
			let cur = SessionScoreSummary[gname];
			if (nundef(hist)) UserHistory[gname] = cur;
			else {
				hist.nTotal += cur.nTotal;
				hist.nCorrect += cur.nCorrect;
				hist.percentage = Math.round((hist.nCorrect / hist.nTotal) * 100);
			}
		}
	}
	//saveHistory();
	saveServerData();
}
function aniGameOver(msg) {
	soundGoodBye();
	show('freezer2');
	let d = mBy('dContentFreezer2');
	clearElement(d);
	mStyleX(d, { fz: 20, matop: 40, bg: 'silver', fg: 'indigo', rounding: 20, padding: 25 })
	let style = { matop: 4 };
	mText('Unit Score:', d, { fz: 22 });

	for (const gname in UnitScoreSummary) {
		let sc = UnitScoreSummary[gname];
		if (sc.nTotal == 0) continue;
		mText(`${GFUNC[gname].friendlyName}: ${sc.nCorrect}/${sc.nTotal} correct answers (${sc.percentage}%) `, d, style);

	}

	mClass(mBy('freezer2'), 'aniSlowlyAppear');

}
// #endregion

//#region interrupt
function stopAus() {
	if (currentGame == 'gSayPic') Speech.stopRecording();
	pauseProgramTimer();
	pauseUI();
}
function continueResume() {
	resumeProgramTimer(); 
	resumeUI();
}

// #endregion

//#region show Level Complete and Revert Level
function removeBadgeAndRevertLevel() {
	removeBadges(dLeiste, currentLevel);
	setBackgroundColor();
	proceedIfNotStepByStep();
}
function showLevelComplete() {
	if (!skipAnimations) {
		soundLevelComplete();
		mClass(mBy('dLevelComplete'), 'aniFadeInOut');
		show('dLevelComplete');
		setTimeout(levelStep10, 1500);
	} else {
		addBadge(dLeiste, currentLevel, revertToBadgeLevel);
		setBackgroundColor();
		proceedIfNotStepByStep();
	}

}
function downgradeCurrentLevelTo(newLevel, oldLevel) {
	Settings.program.currentLevel = newLevel;
	let startLevel = UserHistory[currentGame].startLevel;
	upgradeStartLevelForUser(currentGame, Math.min(newLevel, startLevel));
	return newLevel;
}
function revertToBadgeLevel(ev) {
	let id = evToClosestId(ev);
	let i = stringAfter(id, '_');
	i = Number(i);
	currentLevel = downgradeCurrentLevelTo(i, currentLevel);
	saveProgram();
	removeBadges(dLeiste, currentLevel);
	setBackgroundColor();
	startLevel(i);
}
function levelStep10() {
	mClass(document.body, 'aniFadeOutIn');
	hide('dLevelComplete');
	setTimeout(levelStep11, 500);
}
function levelStep11() {
	clearTable();
	setTimeout(levelStep12, 500);

}
function levelStep12() {
	addBadge(dLeiste, currentLevel, revertToBadgeLevel);
	hide('dLevelComplete');
	clearTable();

	setTimeout(playRubberBandSound, 500);

	setBackgroundColor();
	showLevel();

	setTimeout(levelStep13, 1000);
}
function levelStep13() {
	mRemoveClass(document.body, 'aniFadeOutIn');
	proceedIfNotStepByStep();
}
//#endregion

//#region key selection: setKeys_
function setKeys({ lang, nbestOrCats, filterFunc, confidence, sortByFunc } = {}) {

	let nbest, cats;
	if (isNumber(nbestOrCats)) { nbest = nbestOrCats; }
	else cats = nbestOrCats;

	let keys = [];
	if (isdef(nbest)) {
		let setname = 'best' + nbest;
		keys = jsCopy(KeySets[setname]);
	} else {
		if (nundef(cats)) cats = 'nosymbols';
		if (isString(cats)) cats = [cats];
		keys = setCategories(cats);
	}

	let result = [];
	for (const k of keys) {
		let info = symbolDict[k];
		let klang = 'best' + lang;
		//console.log(k,lang,klang)
		if (nundef(info[klang])) info.klang = lastOfLanguage(k, lang);
		info.best = info[klang];
		let isMatch = true;
		if (isdef(filterFunc)) isMatch = isMatch && filterFunc(k, info.best);
		if (isdef(confidence)) isMatch = info[klang + 'Conf'] >= confidence;
		if (isMatch) { result.push(k); }
	}
	if (isdef(sortByFunc)) { sortBy(result, sortByFunc); }
	return result;
}
function getKeySets() {
	let allKeys = symKeysBySet.nosymbols;
	let keys = allKeys.filter(x => isdef(symbolDict[x].best100));
	let keys1 = allKeys.filter(x => isdef(symbolDict[x].best100) && isdef(symbolDict[x].bestE));
	let keys2 = allKeys.filter(x => isdef(symbolDict[x].best50));
	let keys3 = allKeys.filter(x => isdef(symbolDict[x].best25));
	return { best25: keys3, best50: keys2, best75: keys1, best100: keys, all: allKeys };

}
function getKeySetSimple(cats, lang,
	{ minlen, maxlen, wShort = false, wLast = false, wExact = false, sorter = null }) {
	let keys = setCategories(cats);
	if (isdef(minlen && isdef(maxlen))) {
		keys = keys.filter(k => {
			let exact = CorrectWordsExact[lang][k];
			if (wExact && nundef(exact)) return false;
			let ws = wExact ? [exact.req] : wLast ? [lastOfLanguage(k, lang)] : wordsOfLanguage(k, lang);
			if (wShort) ws = [getShortestWord(ws, false)];
			for (const w of ws) { if (w.length >= minlen && w.length <= maxlen) return true; }
			return false;
		});
	}

	if (isdef(sorter)) sortByFunc(keys, sorter); //keys.sort((a,b)=>fGetter(a)<fGetter(b));
	return keys;
}
function setKeysNew({ cats, lang, wShortest = false, wLast = false, wBest = false, wExact = false, sorter } = {}) {
	opt = arguments[0];
	if (nundef(opt)) opt = {};
	opt.minlen = MinWordLength;
	opt.maxlen = MaxWordLength;
	if (nundef(cats)) cats = currentCategories;
	if (nundef(lang)) lang = currentLanguage;
	currentKeys = getKeySetSimple(cats, lang, opt);
}
function setKeys_dep(cats, bestOnly, sortAccessor, correctOnly, reqOnly) {
	if (currentLanguage == 'E' && cats == 'SIMPLE') {
		currentKeys = BestKeysSets[best100];
		return;
	}
	if (isdef(cats) && !isList(cats)) cats = [cats];
	currentKeys = getKeySetX(isdef(cats) ? cats : currentCategories, currentLanguage, MinWordLength, MaxWordLength,
		bestOnly, sortAccessor, correctOnly, reqOnly);
	if (isdef(sortByFunc)) { sortBy(currentKeys, sortAccessor); }
}

//#endregion

//#region helpers
function addNthInputElement(dParent, n) {
	mLinebreak(dParent, 10);
	let d = mDiv(dParent);
	let dInp = mCreate('input');
	dInp.type = "text"; dInp.autocomplete = "off";
	dInp.style.margin = '10px;'
	dInp.id = 'inputBox' + n;
	dInp.style.fontSize = '20pt';
	mAppend(d, dInp);
	return dInp;
}
function aniInstruction(text) {
	Speech.say(text, .7, 1, .7, 'random'); //, () => { console.log('HA!') });
	mClass(dInstruction, 'onPulse');
	setTimeout(() => mRemoveClass(dInstruction, 'onPulse'), 500);

}
function animate(elem, aniclass, timeoutms) {
	mClass(elem, aniclass);
	setTimeout(() => mRemoveClass(elem, aniclass), timeoutms);
}

function clearTable() {
	clearElement(dLineTableMiddle); clearElement(dLineTitleMiddle); removeMarkers();
} // hide(mBy('dCheckMark')); hide(mBy('dX'));

function isGameWithSpeechRecognition() { return ['gSayPic', 'gSayPicAuto'].includes(currentGame); }
function resetState() {
	uiPaused = 0;
	lastPosition = 0;
	DELAY = 1000;

	badges = [];

	SAMPLES_PER_LEVEL = new Array(20).fill(Settings.program.samplesPerLevel);// [1, 1, 2, 2, 80, 100];

	resetScore();

	resetLabelSettings();
	boundary = SAMPLES_PER_LEVEL[currentLevel];
	setBackgroundColor();
	showBadges(dLeiste, currentLevel, revertToBadgeLevel);
	showLevel();

}
function setBackgroundColor() {
	let color = currentColor;
	document.body.style.backgroundColor = color;

}
function setCurrentInfo(item) {
	currentInfo = item.info;
	matchingWords = currentInfo.words;
	validSounds = currentInfo.valid;
	bestWord = Goal.label;
	hintWord = '_'.repeat(bestWord.length);

}
function shortHintPicRemove() {
	mRemoveClass(mBy(Goal.id), 'onPulse1');
}
function shortHintPic() {
	mClass(mBy(Goal.id), 'onPulse1');
	setTimeout(() => shortHintPicRemove(), 800);
}
function showCorrectWord(sayit = true) {
	let anim = skipAnimations ? 'onPulse1' : 'onPulse';
	let div = mBy(Goal.id);
	mClass(div, anim);


	if (!sayit || skipAnimations) return;

	let correctionPhrase = isdef(Goal.correctionPhrase) ? Goal.correctionPhrase : bestWord;
	Speech.say(correctionPhrase, .4, 1.2, 1, 'david');
}
function showLevel() { dLevel.innerHTML = 'level: ' + currentLevel; }
function showGameTitle() { dGameTitle.innerHTML = GFUNC[currentGame].friendlyName; }
function showStats() { showLevel(); showScore(); showGameTitle(); }
function writeComments(pre) {
	if (ROUND_OUTPUT) {
		console.log('...' + currentGame.substring(1), pre + ' currentLevel:' + currentLevel, 'pics:' + NumPics,
			'labels:' + NumLabels,
			'\nkeys:' + currentKeys.length, 'minlen:' + MinWordLength, 'maxlen:' + MaxWordLength, 'trials#:' + MaxNumTrials);
	}

}

function getGameOrLevelInfo(k, defval) {
	return isdef(LevelInfo) && isdef(LevelInfo[currentLevel][k]) ? LevelInfo[currentLevel][k] 
	: isdef(GameInfo[k]) ? GameInfo[k] 
	: isdef(Settings.program[k])? Settings.program[k] : defval;
}

//#endregion

function getCurrentColor(game) {

	let color = 'orange';
	let colorName = Settings.games[game].color;
	if (nundef(colorName)) {
		//console.log('color is undefined!!!!!!!!!!!!!!!!')

	} else if (isdef(window[colorName])) { color = window[colorName]; }
	else color = colorName;

	//console.log('===>currentColor',currentColor)
	return color;
}
function getCurrentLevel(game) {
	//console.log('getCurrentLevel', Settings.program.currentLevel, 'MAX', MaxLevel);

	let level = Settings.program.currentLevel > MaxLevel ? MaxLevel : Settings.program.currentLevel;

	if (USE_USER_HISTORY_FOR_STARTLEVEL && isdef(UserHistory[game]) && UserHistory[game].startLevel != level) level = UserHistory[game].startLevel;

	return level;
}




