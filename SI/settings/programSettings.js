function createProgramSettingsUi() {
	let dParent = mBy('dProgram');
	clearElement(dParent);
	let ta = mCreate('textarea');
	ta.id = 'dSettings_ta';
	mAppend(dParent, ta);
	ta.rows = 25;
	ta.cols = 100;
	ta.value = 'hallo';
	let b = mCreate('button');
	mAppend(dParent, b);
	b.innerHTML = 'save';
	b.onclick = () => { saveSettingsX(); loadSettingsFromLocalStorage(); }
}
function openProgramSettings() { stopAus(); hide('dProgramButton'); show('dProgram'); loadSettingsX(); }
function closeProgramSettings() { show('dProgramButton'); saveSettingsX(); loadSettingsFromLocalStorage(); hide('dProgram'); continueResume(); }
function toggleProgramSettings() { if (isVisible2('dProgram')) closeProgramSettings(); else openProgramSettings(); }

//#region settings helpers
function createProgramSettingsUi() {
	let dParent = mBy('dProgram');
	let container = createCommonUi(dParent,resetSettingsToDefaults,() => { closeProgramSettings(); startGame(); });

	let maintag='textarea';
	let ta = mCreate(maintag);
	ta.id = 'dSettings_ta';
	mAppend(container, ta);
	mClass(ta, 'whMinus60');

}

