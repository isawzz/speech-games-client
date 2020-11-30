function openGameSettings() { stopAus(); openAux('dGameSettings'); loadGameSettingsX(); }
function closeGameSettings() { closeAux(); saveGameSettingsX(); loadGameSettingsFromLocalStorage(); continueResume(); }
function toggleGameSettings() { if (isVisible2('dGameSettings')) closeGameSettings(); else openGameSettings(); }

function loadGameSettingsX() {
	createGameSettingsUi();
	loadGameSettingsFromLocalStorage();

}

function saveGameSettingsX() { }

function loadGameSettingsFromLocalStorage() { }
function resetGameSettingsToDefaults() { }

function createGameSettingsUi() {
	let dParent = mBy('dGameSettings');
	let d = createCommonUi(dParent, resetGameSettingsToDefaults, () => { closeGameSettings(); startGame(); });

	mText('NOT IMPLEMENTED!!!!!!!!!!!!!', d, { fz: 50 });

}

