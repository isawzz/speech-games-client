window.onload = loadServerDataAndAssets; 
//window.onunload = saveServerData;

async function _start() {

	initTable();
	initSidebar();
	initAux();

	if (nundef(CurrentSessionData)) CurrentSessionData = { user: USERNAME, games: [] };

	Speech = new SpeechAPI('E');
	KeySets = getKeySets();
	console.log(KeySets)
	startTime();

	if (BROADCAST_SETTINGS) broadcastSettings();

	// tests(); return;

	if (SHOW_FREEZER) show('freezer'); else startUnit();


}

function startUnit() {

	startProgramTimer();

	loadProgram();
	UnitScoreSummary = {};

	if (EXPERIMENTAL) { hide('freezer'); hide('divControls'); startGame(); openAux('dGameSettings'); }
	else if (immediateStart && IS_TESTING) { hide('freezer'); if (StepByStepMode) show('divControls'); startGame(); }
	else if (immediateStart) { hide('divControls'); startGame(); }
	else if (IS_TESTING) { hide('freezer'); hide('divControls'); openProgramSettings(); }
	else { hide('freezer'); hide('divControls'); openAux('dMenu'); }
}


function onClickFreezer() { hide('freezer'); startUnit(); }
function onClickFreezer2(ev) {
	if (Settings.flags.pressControlToUnfreeze && !ev.ctrlKey) { console.log('*** press control!!!!'); return; }
	clearTable(); mRemoveClass(mBy('freezer2'), 'aniSlowlyAppear'); hide('freezer2'); startUnit();
}

//divControls
function onClickStartButton() { startGame(); }
function onClickNextButton() { startRound(); }
function onClickRunStopButton(b) { if (StepByStepMode) { onClickRunButton(b); } else { onClickStopButton(b); } }
function onClickRunButton(b) { b.innerHTML = 'Stop'; mStyleX(bRunStop, { bg: 'red' }); StepByStepMode = false; startRound(); }
function onClickStopButton(b) { b.innerHTML = 'Run'; mStyleX(bRunStop, { bg: 'green' }); StepByStepMode = true; }

//testing
function tests() {

	test02_msToTime();return;
	test01_maPic();

}
function test01_maPic(){
	console.log(symbolDict['horse']);
	console.log('UserHistory', UserHistory);
	let d2 = maPic('horse', table, { bg: 'green', w: 200, h: 200 });

}
function test02_msToTime(){
	let ms=timeToMs(1,20,23);
	console.log(msToTime(ms));

	console.log(Date.now());
	let ts = new Date();
	console.log(ts)
	let diff = new Date().getTimezoneOffset() 
	console.log(msToTime(diff*60*1000));

	let t = new Date();
	t.setHours(2,0,0);
	ts=t.getTime() 

	let el = msElapsedSince(ts);
	console.log(msToTime(el))
}
function test03_saveServerData(){
		//change some server data
		UserHistory.email='hallo@hallo.com';
		Settings.program.minutesPerUnit = 100;
		saveServerData();
	
	
}



