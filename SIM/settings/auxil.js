var SelectedGameInAux;
function initAux() {
	dMenu = mBy('dMenu');
	dDev = mBy('dDev');
	dGameSettings = mBy('dGameSettings');
	setGlobalSettings();
}
function setGlobalSettings() {

	currentGame = Settings.program.gameSequence[Settings.program.currentGameIndex].game;

	currentLanguage = Settings.program.currentLanguage;

	currentCategories = Settings.program.currentCategories;

	skipAnimations = Settings.flags.reducedAnimations;

	resetLabelSettings();

	if (Settings.program.showTime) { show(mBy('time')); startTime(); }
	else hide(mBy('time'));

	
}

function resetLabelSettings() {
	if (Settings.program.showLabels == 'toggle') Settings.program.labels = true;
	else Settings.program.labels = (Settings.program.showLabels == 'always');
}

function openAux(divName) {

	if (divName == 'dDev' && !DEV_MODE) return;
	stopAus();
	hide('dMenuButton');
	hide('dGameSettingsButton');
	if (DEV_MODE) hide('dDevButton');

	if (isdef(dTable) && divName != 'dMenu') {
		clearElement(dTable);
		show('dResumeCurrentButton');
	} else {
		show('dPlayButton');
	}

	show(divName);

	if (divName == 'dMenu') { createMenuUi(); }
	else if (divName == 'dGameSettings') { createGameSettingsUi(); }
	else if (divName == 'dDev') { createDevSettingsUi(); }
}

function closeAux(done = false) {

	if (isVisible2('dMenu')) { }
	else if (isVisible2('dGameSettings')) {
		var x = document.activeElement;
		//console.log('focus is on:',x)
		if (isdef(x.keyList)) setSettingsKeys(x);
		else if (isdef(x.game)) setSettingsKeysSelect(x);

		saveServerData();

	}
	else if (isVisible2('dDev')) {
		console.log('DEV NOT IMPLEMENTED')
	}

	setGlobalSettings();

	show('dMenuButton');
	show('dGameSettingsButton');
	if (DEV_MODE) { show('dDevButton'); hide('dDev'); }
	hide('dMenu');
	hide('dGameSettings');

	continueResume();



	if (isVisible2(dPlayButton)) { hide('dPlayButton'); }
	else { hide('dResumeCurrentButton'); }


}

//#region aux uis individually:
function createDevSettingsUi() {
	console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLL')
	let dParent = mBy('dDev');

	clearElement(dParent);
	mClass(dParent, 'hMinus60');
	let dUpper = mDiv(dParent);
	mClass(dUpper, 'hPercentMinus60');
	let bdiv = mDiv(dParent); mStyleX(bdiv, { height: 54, align: 'right' });
	let b;

	if (DEV_MODE) {
		b = mCreate('button');
		mAppend(bdiv, b);
		b.innerHTML = 'transfer to server';
		mClass(b, 'buttonClass', 'buttonPlus');
		b.onclick = transferServerDataToServer;

		b = mCreate('button');
		mAppend(bdiv, b);
		b.innerHTML = 'download';
		mClass(b, 'buttonClass', 'buttonPlus');
		b.onclick = transferServerDataToClient;

		b = mCreate('button');
		mAppend(bdiv, b);
		b.innerHTML = 'reset to defaults';
		mClass(b, 'buttonClass', 'buttonPlus');
		b.onclick = resetSettingsToDefaults;


	}
	// b = mCreate('button');
	// mAppend(bdiv, b);
	// b.innerHTML = 'continue';
	// mClass(b, 'buttonClass', 'buttonPlus');
	// b.onclick = () => { closeProgramSettings(); } //startGame(); }


	let maintag = 'textarea';
	let ta = mCreate(maintag);
	ta.id = 'dSettings_ta';
	mAppend(dUpper, ta);
	mClass(ta, 'whMinus60');

}
function createGameSettingsUi() {
	//console.log('current game is', currentGame)
	let dParent = mBy('dGameSettings');
	clearElement(dParent);
	mAppend(dParent, createElementFromHTML(`<h1>Settings common to all games:</h1>`));

	let nGroupNumCommonAllGames = mInputGroup(dParent);
	setzeEineZahl(nGroupNumCommonAllGames, 'samples', 25, ['program', 'samplesPerLevel']);
	setzeEineZahl(nGroupNumCommonAllGames, 'minutes', 1, ['program', 'minutesPerUnit']);
	setzeEineZahl(nGroupNumCommonAllGames, 'correct streak', 5, ['program', 'incrementLevelOnPositiveStreak']);
	setzeEineZahl(nGroupNumCommonAllGames, 'fail streak', 2, ['program', 'decrementLevelOnNegativeStreak']);
	setzeEineZahl(nGroupNumCommonAllGames, 'trials', 3, ['program', 'trials']);
	setzeEinOptions(nGroupNumCommonAllGames, 'show labels', ['toggle', 'always', 'never'], 'toggle', ['program', 'showLabels']);
	setzeEinOptions(nGroupNumCommonAllGames, 'language', ['E', 'D'], 'E', ['program', 'currentLanguage']);
	setzeEinOptions(nGroupNumCommonAllGames, 'vocabulary', [25, 50, 75, 100], 25, ['program', 'vocab']);

	//let nGroupOther = mInputGroup(dParent);
	setzeEineCheckbox(nGroupNumCommonAllGames, 'show time', false, ['program', 'showTime']);
	setzeEineCheckbox(nGroupNumCommonAllGames, 'switch game after max level', false, ['program', 'switchGame']);

}
function createMenuUi() {
	let dParent = mBy('dMenu');

	if (isEmpty(dParent.children)) {

		mAppend(dParent, createElementFromHTML(`<h1>Choose Game:</h1>`));

		let d = mDiv(dParent);
		mClass(d, 'flexWrap');
		d.style.height = '100%';

		let games = Settings.program.gameSequence.map(x => x.game);
		let labels = games.map(g => GFUNC[g].friendlyName);
		let keys = games.map(g => GFUNC[g].logo);
		let bgs = games.map(g => GFUNC[g].color);

		// console.log(games)
		//console.log('-----------------bgs', bgs);

		let pics = maShowPictures(keys, labels, d, onClickGame, { bgs: bgs, shufflePositions: false });
		for (let i = 0; i < pics.length; i++) {
			let p = pics[i];
			//console.log(p)
			p.div.id = 'menu_' + p.label.substring(0, 3);
			p.game = games[i];
			p.div.game = p.game;
		}
		//pics.map(x => x.div.id = 'menu_' + x.label.substring(0, 3));
	}else{
		for(const div of dParent.children[1].children){
			mRemoveClass(div,'framedPicture')
		}
	}

	console.assert(isdef(currentGame), 'MENU: currentGame NOT SET!!!!!!!!!!!!!!!');
	let picDivs = dParent.children[1].children;
	//console.log(dParent, picDivs)
	let div = firstCond(picDivs, x => x.game == currentGame)
	mClass(div, 'framedPicture');
	SelectedGameInAux = currentGame;
}

//#region click handlers
function onClickResumeCurrent() { closeAux(); startLevel(); }
function onClickPlay() { closeAux(); startGame(); }
function onClickGame(ev) {

	let id = evToClosestId(ev);
	let prefix = stringAfter(id, '_');

	//which game is this?
	let vals = dict2list(GFUNC);
	//.log(vals);

	let item = firstCond(vals, x => x.friendlyName.startsWith(prefix));
	let seq = Settings.program.gameSequence.map(x => x.game);

	//console.log(item, item.id, seq, seq.indexOf(item.id))

	let idx = Settings.program.currentGameIndex = seq.indexOf(item.id);
	//let game = seq[Settings.program.currentGameIndex];

	console.assert(isdef(currentGame), 'MENU: currentGame NOT SET!!!!!!!!!!!!!!!')
	let dParent = mBy('dMenu');
	let picDivs = dParent.children[1].children;
	//console.log(dParent, picDivs)
	let divSelected = firstCond(picDivs, x => x.game == SelectedGameInAux);
	let divClicked = firstCond(picDivs, x => x.game == seq[idx]);
	SelectedGameInAux = divClicked.game;
	//console.log('click on', divClicked.game, divClicked);
	//console.log('selected was', divSelected.game, divSelected);
	if (divClicked == divSelected) {
		closeAux(true);
		startGame();

	}else{
		mClass(divClicked,'framedPicture');
		mRemoveClass(divSelected,'framedPicture');

	}//
	// mClass(div, 'framedPicture');
	// let picDivs = 
	// if (ev.target.game == currentGame) {

	// }else{

	// 	mClass(ev.target,'framedPicture');
	// }
}





