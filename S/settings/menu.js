function initMainMenu() {
	dMenu = mBy('dMenu')
}
function loadMenuX() {
	createMenuUi();
	loadMenuFromLocalStorage();
}
function loadMenuFromLocalStorage() {
	//console.log('loading menu')
}
function saveMenuX() {
	//console.log('saving menu')


	// let ta = mBy('dMenu_ta');
	// let t1 = ta.value.toString();
	// let t2 = jsyaml.load(t1);
	// let t3 = JSON.stringify(t2);
	// localStorage.setItem(SETTINGS_KEY_FILE, t3);
	// //console.log('______________SAVED SETTINGS\n', 't1', typeof (t1), t1, '\nt2', typeof (t2), t2, '\nt3', typeof (t3), t3)

}

function openMenu() { stopAus(); hide('dMenuButton'); show('dMenu'); loadMenuX(); }
function closeMenu() { show('dMenuButton'); saveMenuX(); loadMenuFromLocalStorage(); hide(dMenu); continueResume(); }
function toggleMenu() { if (isVisible2('dMenu')) closeMenu(); else openMenu(); }


function createMenuUi() {
	let dParent = mBy('dMenu');
	let dOuter = createCommonUi(dParent, resetMenuToDefaults, () => { closeMenu(); startGame(); });

	let b = getBounds(dOuter);
	let d = mDiv(dOuter, { h: b.height - 60, margin: 20, bg: 'blue', border: '20px solid transparent', rounding: 20 });
	mClass(d, 'flexWrap');

	//hier kommt main menu
	//einfach nur games gallery
	//current game markiert


	//jedes game bekommt ein logo =>GFUNC
	let games = ['gTouchPic', 'gWritePic', 'gSayPic', 'gTouchColors', 'gMissingLetter', 'gPreMem']; //, 'gMem'];
	let labels = games.map(g => GFUNC[g].friendlyName);
	let keys = games.map(g => GFUNC[g].logo);
	let bgs = games.map(g => GFUNC[g].color);

	//console.log('-----------------bgs', bgs);

	//let b=getBounds(d);
	//console.log('____________ bounds',b)

	maShowPictures(keys, labels, d, null, { bgs: bgs }); //, shufflePositions: false });

	mLinebreak(d);
	mText('NOT IMPLEMENTED!!!!!!!!!!!!!',d,{fz:50});
	// gridLabeledX(keys, labels, d, { rows: 2, layout: 'flex' });
}

function resetMenuToDefaults() {
	//console.log('reset menu to defaults')
}


