function getWaiter(ms) { return { f: () => { }, parr: [], msecs: ms }; }
function getSetting(prop, defval) {
	//wahtscheinlich ein bug in lookup!!!! G.level undefined vielleicht
	//G.level = 0;
	let val = lookup(Settings, ['games', G.key, 'levels', G.level, prop]);
	return val ? val : defval;
}
function loadUserdata(game) {

	game.levels = lookup(Settings, ['games', game.key, 'levels']);
	if (nundef(game.levels)) {
		console.log('game info for', game.key, 'missing!!!');
	}
	game.level = lookupSet(U.games, [game.key, 'lastLevel'], 0);
	// console.log(G)
}

function playGame(key) {
	//console.log('playGame',key,G,isdef(G)?G.key:'{no G!}');

	let g = G;
	if (isdef(key)) { g = GAME[key]; }
	else if (nundef(G)) { key = lookupSet(U.games, ['lastGame'], 'gMem'); g = GAME[key]; }

	if (G != g) {
		//eintrage + save U.games
		//resetScore
		G = g;
	}

	//console.log('G',G,g)
	if (nundef(G.level)) loadUserdata(G);

	prelim();
	console.log('playing', G.friendly); //,G);
	G.f();
}


//#region create + show
function showPics(dParent, { lang = 'E', num = 1, repeat = 1, numLabels, sameBackground = true, keys, labels, clickHandler, colors, contrast, border } = {}) {
	let pics = [];

	if (nundef(keys)) keys = choose(symKeysBySet['nosymbols'], num);
	//keys[0]='man in manual wheelchair';
	//keys=['sun with face'];
	//console.log(keys,repeat)
	//console.log(labels)
	pics = maShowPictures(keys, labels, dParent, clickHandler,
		{ repeat: repeat, sameBackground: sameBackground, border: border, lang: lang, colors: colors, contrast: contrast });

	// if (nundef(keys)) keys = choose(G.keys, G.numPics);
	// Pictures = maShowPictures(keys,labels,dTable,onClickPictureHandler,{ colors, contrast });

	let totalPics = pics.length;
	//console.log(totalPics,G.numLabels)
	if (nundef(Settings.labels) || Settings.labels) {
		if (nundef(numLabels) || numLabels == totalPics) return pics;
		let remlabelPic = choose(pics, totalPics - numLabels);
		for (const p of remlabelPic) {
			//console.log('hi1');
			maHideLabel(p.id, p.info); p.isLabelVisible = false;
		}
	} else {
		for (const p of pics) {
			//console.log('hi1');
			maHideLabel(p.id, p.info); p.isLabelVisible = false;
		}

	}
	return pics;

}



function outputAkkuAndCallPlayGameWithoutParams(akku) {
	akku.push(Selected)
	akku.push(Score);
	console.log(akku);
	playGame();
}
function gMem() {
	let chain = [
		{ f: instruct, parr: ['', 'remember all pictures!', dTitle, false] },
		{ f: showPics, parr: [dTable, { num: getSetting('numPics', 2) }], msecs: 500 },
		{ f: turnPicsDown, parr: ['_last', 2000, true], msecs: 2000 },
		getWaiter(2000),

		{ f: setPicsAndGoal, parr: ['_first'] },
		{ f: instruct, parr: ['_last', 'click', dTitle, true] },
		{ f: activateUi, parr: [{ onclickPic: revealAndSelectOnClick }] },
		{ f: evalSelectGoal, parr: [], waitCond: () => Selected != null },
		{ f: scorePlus1IfWin, parr: ['_last'] },
		getWaiter(2000),

	];
	chainEx(chain, outputAkkuAndCallPlayGameWithoutParams);
}

function prelim() {
	let dParent = dTable;
	clearElement(dParent);
	Pictures = Goal = Selected = null;
	auxOpen = uiActivated = false;
}
function aniTurnFaceDown(pic, msecs = 5000, fadeBackground = false) {
	let ui = pic.div;
	for (const p1 of ui.children) {
		p1.style.transition = `opacity ${msecs}ms ease-in-out`;
		//p1.style.transition = `opacity ${msecs}s ease-in-out, background-color ${msecs}s ease-in-out`;
		p1.style.opacity = 0;
		//p1.style.backgroundColor = 'dimgray';
		//mClass(p1, 'transopaOff'); //aniSlowlyDisappear');
	}
	if (fadeBackground) {
		ui.style.transition = `background-color ${msecs}ms ease-in-out`;
		ui.style.backgroundColor = 'dimgray';
	}
	//ui.style.backgroundColor = 'dimgray';
	pic.isFaceUp = false;

}
function turnPicsDown(pics, msecs, fadeBackground) {
	//console.log(arguments)
	for (const p of pics) { aniTurnFaceDown(p, msecs, fadeBackground); }
}

function aniInstruct(dTarget, spoken) {
	if (isdef(spoken)) Speech.say(spoken, .7, 1, .7, 'random'); //, () => { console.log('HA!') });
	mClass(dTarget, 'onPulse');
	setTimeout(() => mRemoveClass(dTarget, 'onPulse'), 500);

}
function wait() { console.log('waiting...'); }
function instruct(tEmphasis, htmlPrefix, dParent, isSpoken, tSpoken) {
	//use: symbolDict
	//console.assert(title.children.length == 0,'TITLE NON_EMPTY IN SHOWINSTRUCTION!!!!!!!!!!!!!!!!!')
	clearElement(dParent);
	let d = mDiv(dParent);
	mStyleX(d, { margin: 15 })
	mClass(d, 'flexWrap');

	if (isDict(tEmphasis)) tEmphasis = tEmphasis.label;

	let spoken;
	if (isdef(tSpoken)) { spoken = tSpoken; }
	else if (isSpoken) {
		if (htmlPrefix.includes('/>')) {
			let elem = createElementFromHTML(htmlPrefix);
			spoken = stringBefore(htmlPrefix, '<') + ' ' + stringAfter(htmlPrefix, '>');
			spoken = stringBefore(htmlPrefix, '<');
		} else spoken = htmlPrefix;
		spoken = spoken + " " + tEmphasis;
	}
	else spoken = null;

	//console.log('spoken', spoken);

	let msg = htmlPrefix + " " + `<b>${tEmphasis.toUpperCase()}</b>`;
	let d1 = mText(msg, d, { fz: 36, display: 'inline-block' });
	let sym = symbolDict.speaker;
	let d2 = mText(sym.text, d, {
		fz: 38, weight: 900, display: 'inline-block',
		family: sym.family, 'padding-left': 14
	});

	d.addEventListener('click', () => aniInstruct(dParent, spoken));

	if (!isSpoken) return;

	Speech.say(spoken, .7, 1, .7, 'random');
	return d;

}
function setPicsAndGoal(pics) {
	Pictures = pics;
	Goal = pics[0];
	//console.log(pics);
	return pics[0];
}

function activateUi2({ onclickPic } = {}) {
	//firstTimeActivate: add handlers!
	//interpose interact check!
	if (isdef(onclickPic) && nundef(Pictures[0].div.onclick))
		Pictures.map(x =>
			x.div.onclick = ev => { if (canAct()) onclickPic(ev) });
	uiActivated = true;
}

function interact(func) {
	return canAct() ? func : null;
}
function selectOnClick(ev) {

	console.log('clicked!')
	let id = evToClosestId(ev);
	ev.cancelBubble = true;

	let i = firstNumber(id);
	let item = Pictures[i];
	Selected = { pic: item, feedbackUI: item.div, sz: getBounds(item.div).height };

	Selected.reqAnswer = Goal.label;
	Selected.answer = item.label;
	return item;
}
function revealAndSelectOnClick(ev) {
	console.log('clicked!')
	let pic = selectOnClick(ev);
	turnFaceUp(pic);
	return pic;
}
function evalSelectGoal() {
	if (Goal == Selected.pic) {
		//console.log('????????WIN!!!');
		return true;
	} else {
		//console.log('FAIL!');
		return false;
	}
}

function scorePlus1IfWin(isCorrect) {
	if (isCorrect) Score += 1;
}

