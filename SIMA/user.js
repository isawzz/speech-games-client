var UsernameBeforeTesting;
function saveUser() {
	console.log('saveUser:', USERNAME,G.key,G.level); //_getFunctionsNameThatCalledThisFunction()); 
	U.lastGame = G.key;
	U.lastLevel = G.level;
	if (USERNAME != 'test') localStorage.setItem('user',USERNAME);
	DB.users[USERNAME] = U;
	saveSIMA();
}
function loadUser(newUser) {

	//console.log('newUser',newUser)
	USERNAME = isdef(newUser) ? newUser : localStorage.getItem('user');

	if (nundef(USERNAME)) USERNAME = 'guest';
	//else console.log('found in localStorage',typeof USERNAME,USERNAME);

	//console.log('U anfang von loadUser', U, '\nDB', DB.users[USERNAME]);

	let uData = lookupSet(DB, ['users', USERNAME]);
	if (newUser == 'test') { uData = DB.users[USERNAME] = jsCopy(DB.users.test0); uData.id = USERNAME; }
	if (!uData) { uData = DB.users[USERNAME] = jsCopy(DB.users.guest0); uData.id = USERNAME; }


	//console.log(USERNAME, uData);

	U = DB.users[USERNAME];
	Settings = U.settings = deepmergeOverride(DB.settings, U.settings);
	GS = Settings.games;
	delete Settings.games;

	console.log('load user',USERNAME,U.lastGame,U.lastLevel);


	//how do I det menuItems? available games must go there!!!! U.seq
	//console.log('U',U,'\nSettings',Settings);

	let uiName = 'spUser';
	let dUser = mBy(uiName);
	if (nundef(dUser)) { dUser = editableUsernameUi(dLineTopLeft); dUser.id = uiName; }


	let game = U.lastGame;

	//console.log('game is',game)

	let level;
	if (isdef(game)) { level = U.lastLevel; }
	else {
		game = U.seq[0];
		gInfo = U.games[game];
		level = isdef(gInfo) && isdef(gInfo.startLevel) ? gInfo.startLevel : 0;
	}

	setGame(game, level);
}
function setNextGame() {
	let game = G.key;
	let i = U.seq.indexOf(game);
	let iNew = (i + 1) % U.seq.length;
	setGame(U.seq[iNew]);
}
function setGame(game, level) {
	//clear previous game (timeouts...)
	if (isdef(G) && isdef(G.instance)) { G.instance.clear(); }

	//set new game: friendly,logo,color,key,maxLevel,level 
	//console.log('set game to', game)
	G = jsCopy(GAME[game]);
	//console.log('_________setGame: color',G.color);

	let levels = lookup(GS, [game, 'levels']);
	G.maxLevel = isdef(levels) ? Object.keys(levels).length - 1 : 0;

	G.key = game;
	if (isdef(level)) G.level = level;
	else { G.level = getUserStartLevel(game); }

	updateComplexSettings(); //TODO: phase out!? or rename initSettings

	if (nundef(U.games[game])) {
		U.games[game] = { nTotal: 0, nCorrect: 0, nCorrect1: 0, startLevel: 0, byLevel: {} };
	}

	saveUser();
	//console.log('game',game,'level',level)

}
function getUserStartLevel(game) {
	gInfo = U.games[game];
	level = isdef(gInfo) && isdef(gInfo.startLevel) ? gInfo.startLevel : 0;
	return level;
}
function changeUserTo(name) {
	if (name == 'test' && USERNAME != 'test') 	{ 
		UsernameBeforeTesting = USERNAME; 
		saveUser(); 
	} else if (name != USERNAME) {
		//restartQ();
		if (USERNAME != 'test') saveUser(); 
		else if (nundef(name)) name = UsernameBeforeTesting;
	}
	mBy('spUser').innerHTML = name;
	loadUser(name);
	startUnit();
}

function getStartLevels(user){
	let udata = lookup(DB,['users',user]);
	if (!udata) return 'not available';
	let res = [];
	let res2 = {};
	for(const g in udata.games){
		res2[g]=udata.games[g].startLevel;
		res.push(g + ': ' + udata.games[g].startLevel);
	}
	return res2; // res.join(',');

}
function gameCycleCompleted(nextLevel){
	let over = nextLevel > G.maxLevel;
	let i=U.seq.indexOf(G.key)+1;
	// console.log('cycle: level over',over?'YES':'no','last game',G.key,'next i',i,'U.seq.length',U.seq.length)
	// console.log('cycle complete game',G.key,'nextLevel',nextLevel,'i',i,'over',over)
	return i == U.seq.length && over;
}
function calibrating(){return USERNAME == 'test';}
function calibrateUser(){
	//U.session hat results
	//console.log('calibration results... test session',jsCopy(U.session))
	let uname = UsernameBeforeTesting;
	let udata = DB.users[uname];
	//console.log('userdata before calibration',jsCopy(udata))

	let sBefore=getStartLevels(uname);

	for (const gname in GAME) {
		if (nundef(U.session[gname])){
			let baseLevel = lookupSet(udata,['games',gname,'startLevel'],0);
			if (udata.lastGame == gname) udata.lastLevel = baseLevel;
			//console.log('baseLevel for',gname,'is',baseLevel)
			continue;
		}
		//find highest level with 100%: this will be correct level
		let level = 0;
		for(const l in U.session[gname].byLevel){
			let sc = U.session[gname].byLevel[l];
			if (sc.nTotal > sc.nCorrect1) break;
			level+=1;
		}
		let newval = lookupSetOverride(udata,['games',gname,'startLevel'],level);
		//console.log('*** level set',gname,'level',newval)
		if (udata.lastGame == gname) udata.lastLevel = level;
		//console.log('game',gname,'calibrated to level',level);
	}
	let sAfter = getStartLevels(uname);
	//console.log('userdata After calibration',jsCopy(udata));
	return [sBefore,sAfter];
}
function editableUsernameUi(dParent) {
	//console.log('creating input elem for user', USERNAME)
	let inp = mEditableInput(dParent, 'user: ', USERNAME);
	inp.id = 'spUser';
	inp.addEventListener('focusout', () => { changeUserTo(inp.innerHTML.toLowerCase()); });
	// 	let newUser = inp.innerHTML.toLowerCase(); //user names are always case insensitive!
	// 	//console.log(newUser, USERNAME);
	// });
	return inp;
}
function saveUnit() { addSessionToUserGames(); saveUser(); }
function saveRealUser(){
	if (USERNAME != 'test') saveUser();
}

function addByKey(oNew, oOld, except) {
	for (const k in oNew) {
		let val = oNew[k];
		if (isdef(except) && except.includes(k) || !isNumber(val)) continue;
		oOld[k] = isdef(oOld[k]) ? oOld[k] + val : val;
	}
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


			//console.log('added session:', g, recNew)

			// recOld.nTotal = isdef(recOld.nTotal) ? recOld.nTotal + recNew.nTotal : recNew.nTotal;
			// recOld.nCorrect = isdef(recOld.nCorrect) ? recOld.nCorrect + recNew.nCorrect : recNew.nCorrect;
			// recOld.nCorrect1 = isdef(recOld.nCorrect1) ? recOld.nCorrect1 + recNew.nCorrect1 : recNew.nCorrect1;
			// recOld.percentage = Math.round(100 * recOld.nCorrect / recOld.nTotal);
			// for (const l in recNew) {
			// 	let d = U.session[g][l];
			// 	let old = lookup(recOld, ['scoreByLevel', l]);
			// 	if (old) { old.nTotal += d.nTotal; old.nCorrect += d.nCorrect; old.nCorrect1 += d.nCorrect1; }
			// 	else lookupSet(recOld, ['scoreByLevel', l], d);
			// }
		}
	}
	U.session = {};
}

function updateStartLevelForUser(game, level) {
	lookupSetOverride(U.games, [game, 'startLevel'], level);
}
