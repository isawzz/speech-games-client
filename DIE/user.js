function updateUserScore() {
	let sc = { nTotal: Score.nTotal, nCorrect: Score.nCorrect, nCorrect1: Score.nCorrect1 };
	let g = G.key;

	let recOld = lookupSet(U, ['games', g],{startLevel:0,nTotal:0,nCorrect:0,nCorrect1:0});
	let recSession = lookupSet(U, ['session', g],{startLevel:0,nTotal:0,nCorrect:0,nCorrect1:0});
	//let recNew = U.session[g];

	addByKey(sc, recSession);
	recSession.percentage = Math.round(100 * recSession.nCorrect / recSession.nTotal);

	addByKey(sc, recOld);
	recOld.percentage = Math.round(100 * recOld.nCorrect / recOld.nTotal);

	console.log('updated user score for', g, sc, recOld);
	console.log('updated user score session', recSession);
	Score.nTotal = Score.nCorrect = Score.nCorrect1 = 0;
}
function addScoreToUserSession() {
	//at end of level
	//adds Score to session
	//console.log('Score', Score)
	//console.assert(isdef(Score.nTotal) && Score.nTotal > 0)
	let sc = { nTotal: Score.nTotal, nCorrect: Score.nCorrect, nCorrect1: Score.nCorrect1 };
	let game = G.key;
	let level = G.level;
	let session = U.session;
	if (nundef(session)) {
		console.log('THERE WAS NO USER SESSION IN _addScoreToUserSession!!!!!!!!!!!!!!!!!!!!!')
		U.session = {};
	}

	let sGame = session[game];
	if (nundef(sGame)) {
		sGame = session[game] = jsCopy(sc);
		sGame.byLevel = {};
		sGame.byLevel[level] = jsCopy(sc);
	} else {
		addByKey(sc, sGame);
		let byLevel = lookupSet(sGame, ['byLevel', level], {});
		addByKey(sc, byLevel);
	}
	sGame.percentage = Math.round(100 * sGame.nCorrect / sGame.nTotal);

	//console.log('updated session:', U.session)

	saveUser();

	//console.log('+ _addScoreToUserSession +++++++++++++++++++saved user:', U.lastGame, U.lastLevel)
	//console.log(jsCopy(Score), jsCopy(U.session))
}
function addSessionToUserGames() {
	// adds session to U.games and deletes session

	if (!isEmpty(U.session)) {
		for (const g in U.session) {
			let recOld = lookup(U, ['games', g]);
			let recNew = U.session[g];

			//console.assert(isdef(recOld));

			addByKey(recNew, recOld);
			recOld.percentage = Math.round(100 * recOld.nCorrect / recOld.nTotal);
			if (nundef(recOld.byLevel)) recOld.byLevel = {};
			for (const l in recNew.byLevel) {
				if (nundef(recOld.byLevel[l])) recOld.byLevel[l] = jsCopy(recNew.byLevel[l]);
				else addByKey(recNew.byLevel[l], recOld.byLevel[l]);
			}
		}
	}
	U.session = {};
}
function changeUserTo(name) {
	if (name != USERNAME) { saveUser(); }
	mBy('spUser').innerHTML = name;
	loadUser(name);
	startUnit();
}
function editableUsernameUi(dParent) {
	//console.log('creating input elem for user', USERNAME)
	let inp = mEditableInput(dParent, 'user: ', USERNAME);
	inp.id = 'spUser';
	inp.addEventListener('focusout', () => { changeUserTo(inp.innerHTML.toLowerCase()); });
	return inp;
}
function getStartLevels(user) {
	let udata = lookup(DB, ['users', user]);
	if (!udata) return 'not available';
	let res = [];
	let res2 = {};
	for (const g in udata.games) {
		res2[g] = udata.games[g].startLevel;
		res.push(g + ': ' + udata.games[g].startLevel);
	}
	return res2; // res.join(',');

}
function getUserStartLevel(game) {
	gInfo = U.games[game];
	level = isdef(gInfo) && isdef(gInfo.startLevel) ? gInfo.startLevel : 0;
	return level;
}
function loadUser(newUser) {

	//console.log('newUser',newUser)
	USERNAME = isdef(newUser) ? newUser : localStorage.getItem('user');

	if (nundef(USERNAME)) USERNAME = DEFAULTUSERNAME;

	//console.log('U anfang von loadUser', U, '\nDB', DB.users[USERNAME]);

	let uData = lookupSet(DB, ['users', USERNAME]);
	if (newUser == 'test') { uData = DB.users[USERNAME] = jsCopy(DB.users.test0); uData.id = USERNAME; }
	if (!uData) { uData = DB.users[USERNAME] = jsCopy(DB.users.guest0); uData.id = USERNAME; }

	U = DB.users[USERNAME];
	// Settings = U.settings = deepmergeOverride(DB.settings, U.settings);
	// GS = Settings.games;
	// delete Settings.games;

	let uiName = 'spUser';
	let dUser = mBy(uiName);
	if (nundef(dUser)) { dUser = editableUsernameUi(dLineTopLeft); dUser.id = uiName; }

	let game = U.lastGame;
	let level;
	if (isdef(game)) { level = U.lastLevel; }
	else {
		game = U.seq[0];
		gInfo = U.games[game];
		level = isdef(gInfo) && isdef(gInfo.startLevel) ? gInfo.startLevel : 0;
	}

	setGame(game, level);
}
function saveUnit() { addSessionToUserGames(); saveUser(); }
function saveUser() {
	//console.log('saveUser:', USERNAME,G.key,G.level); //_getFunctionsNameThatCalledThisFunction()); 
	U.lastGame = G.key;
	U.lastLevel = G.level;
	if (USERNAME != 'test') localStorage.setItem('user', USERNAME);
	DB.users[USERNAME] = U;
	saveSIMA();
}
function setGame(game, level) {
	//clear previous game (timeouts...)
	if (isdef(G) && isdef(G.instance)) { G.instance.clear(); }

	//set new game: friendly,logo,color,key,maxLevel,level 
	//console.log('set game to', game)
	if (isdef(G) && G.key != game) Score.gameChange = true;

	G = jsCopy(GAME[game]);
	//console.log('_________setGame: color',G.color);

	initSettings(game);

	let levels = lookup(GS, [game, 'levels']);
	G.maxLevel = isdef(levels) ? Object.keys(levels).length - 1 : 0;

	G.key = game;

	if (isCal) updateStartLevelForUser(game, 0);

	if (isdef(level)) G.level = level;
	else { G.level = getUserStartLevel(game); }

	if (G.level > G.maxLevel) G.level = G.maxLevel;

	if (nundef(U.games[game])) {
		U.games[game] = { nTotal: 0, nCorrect: 0, nCorrect1: 0, startLevel: 0, byLevel: {} };
	}

	saveUser();
	//console.log('game',game,'level',level)

}
function setNextGame() {
	let game = G.key;
	let i = U.seq.indexOf(game);
	let iNew = (i + 1) % U.seq.length;
	setGame(U.seq[iNew]);
}
function updateStartLevelForUser(game, level) {
	lookupSetOverride(U.games, [game, 'startLevel'], level);
	saveUser();
}
