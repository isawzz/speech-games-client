function onClickFreezer2(ev) {
	clearTable(); mRemoveClass(mBy('freezer2'), 'aniSlowlyAppear'); hide('freezer2'); auxOpen = false;
	startUnit();
}
function onClickGear() {
	openAux();
	hide('dGear');
	hide('dCalibrate');
	Settings.createSettingsUi(dAux);
}
function onClickTemple() {
	openAux();
	hide('dTemple');
	createMenuUi(dAux);
}
function onClickMenuItem(ev) { onClickGo(ev); }

function onClickGo(ev) {
	if (isVisible('dTemple')) {
		closeAux();
		if (G.controllerType == 'solitaire') GC.startGame(); else GC.activateUi();
	} else {
		let item = isdef(ev) ? evToItemC(ev) : null;
		let gKey = nundef(ev) ? SelectedMenuKey : isString(ev) ? ev : item.id; // divKeyFromEv(ev);
		if (gKey != SelectedMenuKey) {
			if (isdef(SelectedMenuKey)) toggleItemSelection(Items[SelectedMenuKey]);
			SelectedMenuKey = gKey;
			let item = Items[SelectedMenuKey];
			toggleItemSelection(item);
		} else {
			closeAux();
			setGame(gKey);
			GC.startGame();
		}
	}
}

//#region helpers
function clearTimeouts() {
	onclick = null;
	clearTimeout(TOMain); //console.log('TOMain cleared')
	//clearTimeout(TOLong); console.log('TOLong cleared')
	clearTimeout(TOFleetingMessage);
	clearTimeout(TOTrial);
	if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } }
}
function closeAux() {
	hide(dAux);
	hide('dGo');
	show('dGear');
	show('dTemple');
	if (Settings.hasChanged) { Settings.updateSettings(); dbSave('boardGames'); }
	Settings.hasChanged = false;
	auxOpen = false;
}
function interrupt() {
	//console.log('iiiiiiiiiiiiiiiiiiiiiiii')
	STOPAUS = true;
	uiActivated = aiActivated = false;
	clearTimeouts(); //legacy
	if (isdef(G.clear)) G.clear();
	TOMan.clear();
}
function openAux() { interrupt(); show(dAux); show('dGo'); }
