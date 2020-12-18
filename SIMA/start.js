window.onload = _loader;
window.onunload = saveRealUser;

async function _loader() {
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

	loadUser(); //sets G,U,GS,Settings
	console.assert(isdef(G))

	if (SHOW_FREEZER) show('freezer'); else startUnit();

}

function startUnit() {

	restartTime();
	if (nundef(U.session)) U.session = {};
	//console.log('---startUnit: session', U.session);

	//hier soll U.session laden 
	UnitScoreSummary = {};

	if (PROD_START) {PROD_START=false; onClickTemple();} else startGame();
	//show('freezer2')
	//onClickCalibrate();
	onClickTemple();

}













