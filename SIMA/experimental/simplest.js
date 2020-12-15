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

