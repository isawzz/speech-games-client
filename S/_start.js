window.onload = loadHistory;
// window.onunload = saveHistory;

async function loadHistory() {
	let url = OFFLINE ? 'http://localhost:3000/users/'+USERNAME : 'https://speech-games.herokuapp.com/users/'+USERNAME;
	// let url = OFFLINE ? 'http://localhost:3000/users/Gunter' : 'https://speech-games.herokuapp.com/users/Gunter';
	fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	}).then(async data => {
		UserHistory = await data.json();
		//console.log('==>USER HISTORY touch pic level', UserHistory.id, UserHistory.gTouchPic.startLevel);
		SessionStart();
	});
}
async function SessionStart() {
	//zTesting();
	if (CLEAR_LOCAL_STORAGE) localStorage.clear();
	//timit = new TimeIt('hallo ' + USE_LOCAL_STORAGE);

	await loadAssets(); ensureSymBySet(); makeHigherOrderGroups(); await loadBestKeys();

	// iconViewerTestKeysets();
	//setTimeout(_startSpeechTraining, 2000);	return;
	//_startSpeechTraining(); return;
	await _startPlaying();

}
async function _startPlaying() {

	initTable();
	initSidebar();

	await initSettingsX();
	initMainMenu();
	//	return;

	if (nundef(CurrentSessionData)) CurrentSessionData = { user: currentUser, games: [] };

	Speech = new SpeechAPI('E'); 
	KeySets = getKeySets();

	if (SHOW_FREEZER) show('freezer'); else startUnit();
}

async function startUnit() {

	clearProgramTimer();
	restartProgramTimer();

	await loadProgram();
	UnitScoreSummary = {};

	if (EXPERIMENTAL) { hide('freezer'); hide('divControls'); openMenu(); } else 
	if (immediateStart && IS_TESTING) { hide('freezer'); if (StepByStepMode) show('divControls'); startGame(); }
	else if (immediateStart) { hide('divControls'); startGame(); }
	else if (IS_TESTING) { hide('freezer'); hide('divControls'); openProgramSettings(); }
	else { hide('freezer'); hide('divControls'); openMenu(); }
}

async function saveHistory() {
	//console.log('posting...');
	if (BlockServerSend) {
		console.log('...wait for unblocked...');
		setTimeout(saveHistory, 1000);
	} else {
		let url = OFFLINE ? 'http://localhost:3000/users/'+USERNAME : 'https://speech-games.herokuapp.com/users/'+USERNAME;
		let sessionData = UserHistory;
		BlockServerSend = true;
		console.log('blocked...');
		fetch(url, {
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(sessionData)
		}).then(() => { BlockServerSend = false; console.log('unblocked...'); });
	}

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

}
function _startSpeechTraining() {

	initTable();
	Speech = new SpeechAPI('E'); 

	//#region prev tests
	//testConf2(); return;
	//testConfidence();return;
	//trainBritishGuy('ring'); return;

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













