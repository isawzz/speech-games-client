async function _start() {
	//onclick = _saveAll;
	console.assert(isdef(DB)); //user db is loaded

	Speech = new SpeechAPI('E');
	KeySets = getKeySets();
	TO = new TimeoutManager();
	
	initTable(); //table(=alles), dTable(=dLineTableMiddle), dTitle(=dLineTitleMiddle), dLine[Top,Title,Middle,Bottom][LMR]
	initSidebar(); //dLeiste
	listUsers();
	loadUser(); //changeUserTo('nil');  //test01_modifyU(); 
	initAux(); // TODO: dAux das ist eigentlich settings+menu

	console.log('last game was:', U.lastGame);
	//if (PROD_START) { PROD_START = false; onClickTemple(); } else startGame();
}

window.onload = _loader;
window.onbeforeunload = () => {
	if (IS_TESTING) return;
	_saveAll();
	return "onbeforeunload"; //for reasons unknown MUSS ich das return statement machen sonst macht er das _saveAll nicht!!!!
}
function _saveAll() {
	saveUser();
	//saveSettings();
	//saveGames();
	dbSave('boardGames');
}
async function _loader() {
	//#region deactivate when page left, serviceWorker commented, timit
	if (!IS_TESTING) {
		ifPageVisible.on('blur', function () {
			//enterInterruptState();
			// console.log('stopping game', G.key)
			_saveAll();
			return 'hallo'
		});

		ifPageVisible.on('focus', function () {
			// if (isdef(G.instance)) {
			// 	updateUserScore();//this saves user data + clears the score.nTotal,nCorrect,nCorrect1!!!!!
			// 	setGame(G.key);
			// }
			// closeAux();
			// startGame();
			// console.log('restarting game', G.key)
		});
	}
	// if ('serviceWorker' in navigator) {
	// 	console.log('CLIENT: service worker registration in progress.');
	// 	navigator.serviceWorker.register('/service-worker.js').then(function() {
	// 		console.log('CLIENT: service worker registration complete.');
	// 	}, function() {
	// 		console.log('CLIENT: service worker registration failure.');
	// 	});
	// } else {
	// 	console.log('CLIENT: service worker is not supported.');
	// }

	//timit = new TimeIt('start');
	//#endregion
	if (BROADCAST_SETTINGS) {
		console.log('...broadcasting ...')
		await dbInit('boardGames');
		_start();
	} else { dbLoad('boardGames', _start); }

}
