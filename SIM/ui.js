//#region init UI
function initTable() {
	let table = mBy('table');
	clearElement(table);

	initLineTop();
	initLineTitle();
	initLineTable();
	initLineBottom();
}
function initSidebar() {
	let title = mText('badges:', mBy('sidebar'));
	dLeiste = mDiv(mBy('sidebar'));
	//dLeiste = mBy('sidebar')
	mStyleX(dLeiste, { 'max-height': '100vh', display: 'flex', 'flex-flow': 'column wrap' });
}
function initLineTop() {
	dLineTopOuter = mDiv(table); dLineTopOuter.id = 'lineTopOuter';
	dLineTop = mDiv(dLineTopOuter); dLineTop.id = 'lineTop';
	dLineTopLeft = mDiv(dLineTop); dLineTopLeft.id = 'lineTopLeft';
	dLineTopRight = mDiv(dLineTop); dLineTopRight.id = 'lineTopRight';
	dLineTopMiddle = mDiv(dLineTop); dLineTopMiddle.id = 'lineTopMiddle';

	dScore = mDiv(dLineTopMiddle);
	dScore.id = 'dScore';

	dLevel = mDiv(dLineTopLeft);
	dLevel.id = 'dLevel';

	dGameTitle = mDiv(dLineTopRight);
	dGameTitle.id = 'dGameTitle';
	let d = mDiv(dLineTopRight);
	d.id = 'time';

	mLinebreak(table);
}
function initLineTitle() {
	dLineTitleOuter = mDiv(table); dLineTitleOuter.id = 'lineTitleOuter';
	dLineTitle = mDiv(dLineTitleOuter); dLineTitle.id = 'lineTitle';
	dLineTitleLeft = mDiv(dLineTitle); dLineTitleLeft.id = 'lineTitleLeft';
	dLineTitleRight = mDiv(dLineTitle); dLineTitleRight.id = 'lineTitleRight';
	dLineTitleMiddle = mDiv(dLineTitle); dLineTitleMiddle.id = 'lineTitleMiddle';

	mLinebreak(table);
}
function initLineTable() {
	dLineTableOuter = mDiv(table); dLineTableOuter.id = 'lineTableOuter';
	dLineTable = mDiv(dLineTableOuter); dLineTable.id = 'lineTable';
	dLineTableLeft = mDiv(dLineTable); dLineTableLeft.id = 'lineTableLeft';
	dLineTableMiddle = mDiv(dLineTable); dLineTableMiddle.id = 'lineTableMiddle';
	mClass(dLineTableMiddle, 'flexWrap');
	dLineTableRight = mDiv(dLineTable); dLineTableRight.id = 'lineTableRight';

	mLinebreak(table);
}
function initLineBottom() {
	dLineBottomOuter = mDiv(table); dLineBottomOuter.id = 'lineBottomOuter';
	dLineBottom = mDiv(dLineBottomOuter); dLineBottom.id = 'lineBottom';
	dLineBottomLeft = mDiv(dLineBottom); dLineBottomLeft.id = 'lineBottomLeft';
	dLineBottomRight = mDiv(dLineBottom); dLineBottomRight.id = 'lineBottomRight';
	dLineBottomMiddle = mDiv(dLineBottom); dLineBottomMiddle.id = 'lineBottomMiddle';

	mLinebreak(table);
}
//#endregion

function aniFadeInOut(elem, secs) {
	mClass(elem, 'transopaOn');
	//dLineBottomMiddle.opacity=0;
	//mClass(dLineBottomMiddle,'aniFadeInOut');
	setTimeout(() => { mRemoveClass(elem, 'transopaOn'); mClass(elem, 'transopaOff'); }, secs * 1000);
}
function getSignalColor() { if (currentLevel != 4 && currentLevel != 7 && currentLevel != 10 && currentLevel != 3) return 'red'; else return 'yellow'; }

//#region fleetingMessage
function clearFleetingMessage() {
	if (isdef(fleetingMessageTimeout)) { clearTimeout(fleetingMessageTimeout); fleetingMessageTimeout = null; }
	clearElement(dLineBottomMiddle);
}
function showFleetingMessage(msg, msDelay, styles = { fz: 22, rounding: 10, padding: '2px 12px', matop: 50 }, fade = false) {
	let fg = colorIdealText(currentColor); // == 4 ? 'yellow' : 'red';
	if (nundef(styles.fg)) styles.fg = fg;
	if (msDelay) {
		fleetingMessageTimeout = setTimeout(() => fleetingMessage(msg, styles, fade), msDelay);
	} else {
		fleetingMessage(msg, styles, fade);
	}
}
function fleetingMessage(msg, styles, fade = false) {
	clearFleetingMessage();
	dLineBottomMiddle.innerHTML = msg;
	mStyleX(dLineBottomMiddle, styles)
	if (fade) aniFadeInOut(dLineBottomMiddle, 2);
}
//#endregion

//#region ui states
function beforeActivationUI() { uiPaused |= beforeActivationMask; uiPaused &= ~hasClickedMask; }
function activationUI() { uiPaused &= ~beforeActivationMask; }
function hasClickedUI() { uiPaused |= hasClickedMask; }
function pauseUI() { uiPausedStack.push(uiPaused); uiPaused |= uiHaltedMask; }
function resumeUI() { uiPaused = uiPausedStack.pop(); }
//#endregion

//#region Markers
function markerSuccess() { return createMarker(MarkerId.SUCCESS); }
function markerFail() { return createMarker(MarkerId.FAIL); }
function createMarker(markerId) {
	//<div class='feedbackMarker'>✔️</div>
	let d = mCreate('div');
	d.innerHTML = MarkerText[markerId]; //>0? '✔️':'❌';
	mClass(d, 'feedbackMarker');
	document.body.appendChild(d);
	Markers.push(d);
	return d;
}
function mRemoveGracefully(elem) {
	mClass(elem, 'aniFastDisappear');
	setTimeout(() => mRemove(elem), 500);
}
function removeMarkers() {
	for (const m of Markers) {
		mRemoveGracefully(m);
	}
	Markers = [];
}
//#endregion

//#region ui helpers

//#endregion

function mInputGroup(dParent, styles) {
	let baseStyles = { display: 'inline-block', align: 'right', bg:'#00000080', rounding:10, padding: 20 };
	if (isdef(styles)) styles = deepmergeOverride(baseStyles, styles); else styles = baseStyles;
	return mDiv(dParent, styles);
}
function mTitleGroup(dParent, title) {
	let d = mDiv(dParent, { display: 'inline-block', align: 'center', bg: 'random', padding: 20 });
	let tag = 'h3';
	mAppend(d, createElementFromHTML(`<${tag} style='margin:0;padding:0'>${title}</${tag}>`));
	return d;
}
function setSettingsKeys(elem) {
	// console.log('lllllllllllllllll', a, a.value, a.keyList);
	let val = elem.type == 'number' ? Number(elem.value) : elem.value;
	lookupSetOverride(Settings, elem.keyList, val);
	console.log(Settings.program);
}
function setzeEineZahl(dParent, label, init, skeys) {
	// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
	let d = mDiv(dParent);
	let val = lookup(Settings, skeys);
	if (nundef(val)) val = init;
	let inp = createElementFromHTML(
		// `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
		`<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`);
	let labelui = createElementFromHTML(`<label>${label}</label>`);
	mAppend(d, labelui);
	mAppend(labelui, inp);

	mStyleX(inp, { maleft: 12, mabottom: 4 });
	mClass(inp, 'input');

	inp.keyList = skeys;
}
function setSettingsLevelProgression(elem) {
	let game = elem.game;
	let prop = elem.prop;
	let info = Settings.games[game];
	let val = elem.type == 'number' ? Number(elem.value) : elem.value;
	let progInfo = GameProps[prop].progression;
	console.log(progInfo, val, Object.keys(info.levels));
	for (const k in info.levels) {
		console.log(Object.keys(info.levels[k]))
		//need to set this prop for each level!
	}

}
function setzeEineLevelZahl(dParent, label, init, game, prop) {
	// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
	let d = mDiv(dParent);
	let val = lookup(Settings, ['games', game, 'levels', 0, prop]);
	if (nundef(val)) val = init;
	let inp = createElementFromHTML(
		// `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
		`<input type="number" class="input" value="${val}" onfocusout="setSettingsLevelProgression(this)" />`);
	let labelui = createElementFromHTML(`<label>${label}</label>`);
	mAppend(d, labelui);
	mAppend(labelui, inp);

	mStyleX(inp, { maleft: 12, mabottom: 4 });
	//mClass(inp, 'input');

	inp.game = game;
	inp.prop = prop;
}

function setSettingsKeysSelect(elem) {
	let val;
	for (const opt of elem.children) {
		if (opt.selected) val = opt.value;
	}

	// console.log('lllllllllllllllll', a, a.value, a.keyList);
	//let val = elem.type == 'number' ? Number(elem.value) : elem.value;
	lookupSetOverride(Settings, elem.keyList, val);
	console.log('result', lookup(Settings, elem.keyList));
}
function setzeEinOptions(dParent, label, optionList, init, skeys) {
	// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
	let d = mDiv(dParent);
	let val = lookup(Settings, skeys);
	if (nundef(val)) val = init;

	let inp = createElementFromHTML(`<select onfocusout="setSettingsKeysSelect(this)"></select>`);
	for (const opt of optionList) {
		let optElem = createElementFromHTML(`<option value="${opt}">${opt}</option>`);
		mAppend(inp, optElem);
		if (opt == val) optElem.selected = true;
	}
	// // `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
	// `<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`);
	let labelui = createElementFromHTML(`<label>${label}</label>`);
	mAppend(d, labelui);
	mAppend(labelui, inp);

	mStyleX(inp, { maleft: 12, mabottom: 4 });

	inp.keyList = skeys;
}





function mProgressionGroup_dep(dParent, title, headers, addHandler = null) {
	let d = mDiv(dParent, { display: 'inline-block', bg: choose(levelColors), padding: 20 });
	mAppend(d, createElementFromHTML(`<h3 style='margin:0;padding:0'>${title}</h3>`));

	let s = '';
	for (const h of headers) {
		s += '<td>' + h + '</td>';
	}

	let t = createElementFromHTML(`<table><tbody><tr>${s}</tr></tbody></table>`);
	// let row = t.querySelector('tr');
	// console.log(t,row)
	// for(const h of headers){
	// 	mAppend(row,createElementFromHTML(`<td>${h}</td>`))
	// }
	mAppend(d, t);
	// mText('level progression:',d);
	//mButton('add',addHandler,d); spaeter erst!!!
	return t;
}

