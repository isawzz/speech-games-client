//#region badges
var badges = [];
function removeBadges(dParent, level) {
	while (badges.length > level) {
		let badge = badges.pop()
		removeElem(badge.div);
	}
}
function addBadge(dParent, level, clickHandler, animateRubberband = false) {
	let fg = '#00000080';
	let textColor = 'white';
	//let stylesForLabelButton = { rounding: 8, margin: 4 };
	//const picStyles = ['twitterText', 'twitterImage', 'openMojiText', 'openMojiImage', 'segoe', 'openMojiBlackText', 'segoeBlack'];
	let isText = true; let isOmoji = false;
	let i = level - 1;
	let key = levelKeys[i];
	let k = replaceAll(key, ' ', '-');

	let item = getItem(k);
	let label = item.label = "level " + i;
	let h = window.innerHeight;
	let sz = h / 14;
	let options = _simpleOptions({ w: sz, h: sz, fz: sz / 4, fzPic: sz / 2, bg: levelColors[i], fg: textColor });
	//console.log('options.....',options);
	options.handler = clickHandler;
	let d = makeItemDiv(item, options);
	//console.log(d)
	mAppend(dParent, d);

	item.index = i;
	badges.push(item);
	return arrLast(badges);
	// let d1 = mpBadge(info, label, { w: hBadge, h: hBadge, bg: levelColors[i], fgPic: fg, fgText: textColor }, null, dParent, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
	// d1.id = 'dBadge_' + i;

	// let info = Syms[k];
	// let label = "level " + i;
	// let h = window.innerHeight; let hBadge = h / 14;
	// let d1 = mpBadge(info, label, { w: hBadge, h: hBadge, bg: levelColors[i], fgPic: fg, fgText: textColor }, null, dParent, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
	// d1.id = 'dBadge_' + i;
	// if (animateRubberband) mClass(d1, 'aniRubberBand');
	// if (isdef(clickHandler)) d1.onclick = clickHandler;
	// badges.push({ key: info.key, info: info, div: d1, id: d1.id, index: i });
	// return arrLast(badges);
}
function showBadges(dParent, level, clickHandler) {
	clearElement(dParent); badges = [];
	for (let i = 1; i <= level; i++) {
		addBadge(dParent, i, clickHandler);
	}
	//console.log(badges)
}
function showBadgesX(dParent, level, clickHandler, maxLevel) {
	clearElement(dParent);
	badges = [];
	//console.log('maxlevel', maxLevel, 'level', level)
	for (let i = 1; i <= maxLevel + 1; i++) {
		if (i > level) {
			let b = addBadge(dParent, i, clickHandler, false);
			//console.log('badge', i, 'is', b)
			b.live.div.style.opacity = .25;
			b.achieved = false;
		} else {
			let b = addBadge(dParent, i, clickHandler, true);
			b.achieved = true;
		}
	}
	//console.log(badges)
}
function onClickBadgeX(ev) {
	//console.log('NEW! haaaaaaaaaaaaaaaalo', ev)
	interrupt(); //enterInterruptState();
	let item = evToItem(ev);
	setBadgeLevel(item.index);
	userUpdate(['games', G.id, 'startLevel'], item.index);
	auxOpen = false;
	TOMain = setTimeout(G.controller.startGame.bind(G.controller), 100);
}
function setBadgeLevel(i) {
	G.level = i;
	Score.levelChange = true;

	//setBadgeOpacity
	if (isEmpty(badges)) showBadgesX(dLeiste, G.level, onClickBadgeX, G.maxLevel);

	for (let iBadge = 0; iBadge < G.level; iBadge++) {
		let d1 = iDiv(badges[iBadge]);
		d1.style.opacity = .75;
		d1.style.border = 'transparent';
		// d1.children[1].innerHTML = '* ' + iBadge + ' *'; //style.color = 'white';
		d1.children[1].innerHTML = '* ' + (iBadge + 1) + ' *'; //style.color = 'white';
		d1.children[0].style.color = 'white';
	}
	let d = iDiv(badges[G.level]);
	d.style.border = '1px solid #00000080';
	d.style.opacity = 1;
	// d.children[1].innerHTML = 'Level ' + G.level; //style.color = 'white';
	d.children[1].innerHTML = 'Level ' + (G.level + 1); //style.color = 'white';
	d.children[0].style.color = 'white';
	for (let iBadge = G.level + 1; iBadge < badges.length; iBadge++) {
		let d1 = iDiv(badges[iBadge]);
		d1.style.border = 'transparent';
		d1.style.opacity = .25;
		// d1.children[1].innerHTML = 'Level ' + iBadge; //style.color = 'white';
		d1.children[1].innerHTML = 'Level ' + (iBadge + 1); //style.color = 'white';
		d1.children[0].style.color = 'black';
	}
}
