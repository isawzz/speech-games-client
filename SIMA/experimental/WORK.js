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

function activateUi2({ onclickPic }={}) {
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













