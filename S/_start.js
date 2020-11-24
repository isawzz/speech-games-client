window.onload = loadHistory;
// window.onunload = saveHistory;

async function SessionStart() {
	//zTesting();
	if (CLEAR_LOCAL_STORAGE) localStorage.clear();

	await loadAssets(); ensureSymBySet(); makeHigherOrderGroups(); await loadBestKeys();

	// iconViewerTestKeysets();
	//setTimeout(_startSpeechTraining, 2000);	return;
	//_startSpeechTraining(); return;
	await _startPlaying();

}
function _startSpeechTraining() {

	initTable();
	Speech = new SpeechFeature(1, 'E');

	//testConf2(); return;
	//testConfidence();return;
	//trainBritishGuy('ring'); return;

	//#region prev tests
	//trainDeutsch('wind face'); //trainZira(); //testp7(); //testp6(); //testp5(); //testp4(); 
	// testp2(); return;
	//testp0(); return;
	//speechTraining(); return;

	testSimilar01('hand'); return;
	testLanguageChange(); return;
	testWait(); return;
	testRecognizeAdvanced(); return;
	testRecognize2(); return;
	testPromise(); return; //GEHT NICHT!!!
	testRecognize(); return;
	testStartAgainAfterStartingRecorder(); return;
	testChangingLangAfterStartingRecorder(); return;

	testBasicRecord(); return;
	//#endregion
}

async function _startPlaying() {

	//ich wollte testen ob download geht:nein geht nicht!
	// let o={hallo:1,das:2};
	//downloadAsYaml(o,'testfile');

	initTable();
	initSidebar();

	await initSettingsX();

	if (nundef(CurrentSessionData)) CurrentSessionData = { user: currentUser, games: [] };
	//CurrentSessionData = { user: currentUser, games: [] };

	//old speech regoc init
	// speech00(currentLanguage);
	Speech = new SpeechFeature(1, 'E'); //MASTER_VOLUME);

	if (SHOW_FREEZER) show('freezer'); else startUnit();
}

async function startUnit() {

	clearProgramTimer();
	restartProgramTimer();

	await loadProgram();
	UnitScoreSummary = {};

	if (EXPERIMENTAL) { hide('freezer'); hide('divControls'); openSettings(); }
	else if (immediateStart && IS_TESTING) { hide('freezer'); if (StepByStepMode) show('divControls'); startGame(); }
	else if (immediateStart) { hide('divControls'); startGame(); }
	else { hide('freezer'); hide('divControls'); openSettings(); }
}

async function loadHistory() {
	let url = 'https://speech-games.herokuapp.com/users/Gunter';
	//url = 'http://localhost:3000/users/Gunter';
	fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	}).then(async data => {
		UserHistory = await data.json();
		console.log('==>USER HISTORY',UserHistory);
		SessionStart();
	});
}
async function saveHistory() {
	//console.log('posting...');
	let url = 'https://speech-games.herokuapp.com/users/Gunter';
	//url = 'http://localhost:3000/users/Gunter';
	let sessionData = UserHistory;
	fetch(url, {
		method: 'PUT',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(sessionData)
	}); // .then(data => { console.log(data);});

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
function zTesting() {
	//initTable();
	onclick = ev => {
		console.log('CLICK!')
		if (ev.ctrlKey) {
			console.log('CLICK!!!')
			saveHistory();
		}
	}

	// //testAccessor(); return;
	// //let infos = getInfolist({cats:['animal']}); return;

	//console.log(alphaToHex(.5),alphaToHex(.25),alphaToHex(.75));
	//let x=differInAtMost('dope', 'doe', 1); console.log(x); return;
}












