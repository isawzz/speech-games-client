window.onload = _loader;
window.onunload = saveUser;

async function _loader() {

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
	if (BROADCAST_SETTINGS) {
		console.log('...broadcasting ...')
		await broadcastSIMA();
		_start();
	} else { loadSIMA(_start); }

}
async function _start() {
	//timit.show('DONE');
	console.assert(isdef(DB));

	initTable();
	initSidebar();
	initAux();
	initScore();

	Speech = new SpeechAPI('E');
	KeySets = getKeySets();
	//console.log(KeySets)

	if (IS_TESTING)	loadUser(USERNAME); else loadUser();
	console.assert(isdef(G))

	//test03_maShowPictures(); return;
	if (ALLOW_CALIBRATION) show('dCalibrate');
	if (SHOW_FREEZER) show('freezer'); else startUnit();

}
function startUnit() {

	restartTime();
	//if (nundef(U.session)) U.session = {};
	U.session = {};
	//console.log('---_startUnit: session', U.session);
	
	// console.log('ha'); return;
	//onClickTemple(); return;
	if (PROD_START) { PROD_START = false; onClickTemple(); } else startGame();
	//show('freezer2')
	//onClickCalibrate();
	//onClickTemple();

}


