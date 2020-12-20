function getHarmoniousStylesPlusPlusX(sCont, sPic = {}, sText = {}, picPercent, hasText = true) {
	const sDefault = {
		cont: { bg: 'random', padding: 0, align: 'center', 'box-sizing': 'border-box' },
		pic: { bg: 'transparent', fg: 'white' },
		text: { fg: 'contrast', family: 'arial'} //&& k != 'padding' , padding: 8 }
	}
	setDefaultKeys(sCont, sDefault.cont);
	setDefaultKeys(sPic, sDefault.pic);
	setDefaultKeys(sText, sDefault.text);


	let fact = 55 / picPercent;
	let [ptop, pbot] = [(80 - picPercent) * 3 / 5, (80 - picPercent) * 2 / 5];
	//let numbers = hasText ? [ptop, picPercent, 0, 20, pbot] : [15, 70, 0, 0, 15];
	let numbers = hasText ? [fact * 15, picPercent, 0, fact * 20, fact * 10] : [15, 70, 0, 0, 15];
	numbers = numbers.map(x => sCont.h * x / 100);
	let [patop, szPic, zwischen, szText, pabot] = numbers;

	let fz = (Math.floor(szText * 3 / 4)) ;// - sText.padding / 2;

	// patop = Math.max(patop, sCont.padding);
	// pabot = Math.max(pabot, sCont.padding);

	// // calc padding 
	// let padding = sCont.padding; delete sCont.padding; // replace padding by patop,pabot,paright,paleft
	// let fact = 55 / picPercent;
	// let numbers = hasText ? [fact * 15, picPercent, 0, fact * 20, fact * 10] : [15, 70, 0, 0, 15];
	// numbers = numbers.map(x => sCont.h * x / 100);
	// let [patop, szPic, zwischen, szText, pabot] = numbers;
	// sCont.patop = Math.max(patop, padding);
	// sCont.pabot = Math.max(pabot, padding);
	// // if (nundef(sCont.w)) { sCont.paleft = sCont.paright = Math.max(padding, 4); } 
	// sCont.paleft = sCont.paright = Math.max(padding, 0);


	let styles = { h: sCont.h, bg: sCont.bg, fg: isdef(sCont.fg) ? sCont.fg : 'contrast', patop: patop, pabottom: pabot, align: 'center', 'box-sizing': 'border-box' };
	let textStyles = { family: sText.family, fz: fz };
	let picStyles = { h: szPic, bg: sPic.bg, fg: isdef(sPic.fg) ? sPic.fg : 'contrast' };
	if (sCont.w > 0) styles.w = sCont.w; else styles.paleft = styles.paright = Math.max(sCont.padding, 4);
	for (const k in sCont) { if (k != 'w' && nundef(styles[k])) styles[k] = sCont[k]; }
	for (const k in sPic) { if (k != 'w' && nundef(picStyles[k])) picStyles[k] = sPic[k]; }
	for (const k in sText) { if (k != 'w' && nundef(textStyles[k])) textStyles[k] = sText[k]; }

	console.log('patop',styles.patop,'pabot',styles.pabot,'paleft',styles.paleft,'paright',styles.paright)

	return [styles, picStyles, textStyles];

	sPic.h = szPic;
	sText.fz = Math.floor(szText * 3 / 4);

	//console.log('end of getHarmonious:', sCont.patop, sCont.paright, sCont.pabot, sCont.paleft);
	return [sCont, sPic, sText];
	return [sCont, jsCopy(sPic), sText];
}









function prelim() {
	let dParent = dTable;
	clearElement(dParent);
	Pictures = Goal = Selected = null;
	auxOpen = uiActivated = false;
}
function aniInstruct(dTarget, spoken) {
	if (isdef(spoken)) Speech.say(spoken, .7, 1, .7, 'random'); //, () => { console.log('HA!') });
	mClass(dTarget, 'onPulse');
	setTimeout(() => mRemoveClass(dTarget, 'onPulse'), 500);

}
function wait() { console.log('waiting...'); }
function instruct(tEmphasis, htmlPrefix, dParent, isSpoken, tSpoken) {
	//use: symbolDict
	//console.assert(title.children.length == 0,'TITLE NON_EMPTY IN SHOWINSTRUCTION!!!!!!!!!!!!!!!!!')
	clearElement(dParent);
	let d = mDiv(dParent);
	mStyleX(d, { margin: 15 })
	mClass(d, 'flexWrap');

	if (isDict(tEmphasis)) tEmphasis = tEmphasis.label;

	let spoken;
	if (isdef(tSpoken)) { spoken = tSpoken; }
	else if (isSpoken) {
		if (htmlPrefix.includes('/>')) {
			let elem = createElementFromHTML(htmlPrefix);
			spoken = stringBefore(htmlPrefix, '<') + ' ' + stringAfter(htmlPrefix, '>');
			spoken = stringBefore(htmlPrefix, '<');
		} else spoken = htmlPrefix;
		spoken = spoken + " " + tEmphasis;
	}
	else spoken = null;

	//console.log('spoken', spoken);

	let msg = htmlPrefix + " " + `<b>${tEmphasis.toUpperCase()}</b>`;
	let d1 = mText(msg, d, { fz: 36, display: 'inline-block' });
	let sym = symbolDict.speaker;
	let d2 = mText(sym.text, d, {
		fz: 38, weight: 900, display: 'inline-block',
		family: sym.family, 'padding-left': 14
	});

	d.addEventListener('click', () => aniInstruct(dParent, spoken));

	if (!isSpoken) return;

	Speech.say(spoken, .7, 1, .7, 'random');
	return d;

}
function setPicsAndGoal(pics) {
	Pictures = pics;
	Goal = pics[0];
	//console.log(pics);
	return pics[0];
}

function activateUi2({ onclickPic } = {}) {
	//firstTimeActivate: add handlers!
	//interpose interact check!
	if (isdef(onclickPic) && nundef(Pictures[0].div.onclick))
		Pictures.map(x =>
			x.div.onclick = ev => { if (canAct()) onclickPic(ev) });
	uiActivated = true;
}

function interact(func) {
	return canAct() ? func : null;
}
function selectOnClick(ev) {

	console.log('clicked!')
	let id = evToClosestId(ev);
	ev.cancelBubble = true;

	let i = firstNumber(id);
	let item = Pictures[i];
	Selected = { pic: item, feedbackUI: item.div, sz: getBounds(item.div).height };

	Selected.reqAnswer = Goal.label;
	Selected.answer = item.label;
	return item;
}
function revealAndSelectOnClick(ev) {
	console.log('clicked!')
	let pic = selectOnClick(ev);
	turnFaceUp(pic);
	return pic;
}
function evalSelectGoal() {
	if (Goal == Selected.pic) {
		//console.log('????????WIN!!!');
		return true;
	} else {
		//console.log('FAIL!');
		return false;
	}
}

function scorePlus1IfWin(isCorrect) {
	if (isCorrect) Score += 1;
}













