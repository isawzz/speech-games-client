// *** uses assets! =>load after assets! ***

//#region NOW!
function maShowPictures(keys, labels, dParent, onClickPictureHandler,
	{ container, lang, border, bgs, colors, contrast, repeat = 1, sameBackground, shufflePositions = true } = {}) {
	let pics = [];

	//console.log('maShowPictures', 'keys', keys, '\n', 'labels', labels, '\n', 'bgs', bgs)
	//console.log('sameBackground',sameBackground)

	let numPics = keys.length * repeat;

	//make a label for each key
	let items = [];
	for (let i = 0; i < keys.length; i++) {
		let k = keys[i];
		let info = isdef(lang) ? getRandomSetItem(lang, k) : symbolDict[k];
		let bg = isList(bgs) ? bgs[i] : isdef(colors) ? 'white' : sameBackground ? computeColor('random') : 'random';
		let label = isList(labels) ? labels[i] : isdef(lang) ? info.best : k;
		items.push({ key: k, info: info, label: label, bg: bg });
	}


	//console.log('________________',items,repeat)
	let items1 = jsCopy(items);
	for (let i = 0; i < repeat - 1; i++) { items = items.concat(items1); }
	//console.log('________________',items,repeat)

	//console.log(items)

	let isText = true;
	let isOmoji = false;
	if (isdef(lang)) {
		let textStyle = getParamsForMaPicStyle('twitterText');
		isText = textStyle.isText;
		isOmoji = textStyle.isOmoji;
	}

	//console.log(items);
	numPics = items.length;

	//dann erst shuffle!
	if (shufflePositions) shuffle(items);

	let lines = isdef(colors) ? colors.length : 1;
	let [pictureSize, picsPerLine] = calcDimsAndSize(numPics, lines, container);
	let stylesForLabelButton = { rounding: 10, margin: pictureSize / 8 };
	if (isdef(border)) stylesForLabelButton.border = border;

	for (let line = 0; line < lines; line++) {
		let textShadowColor = isdef(colors) ? colors[line] : undefined;
		for (let i = 0; i < numPics; i++) {
			let item = items[i];
			let info = item.info; //infos[i];
			let label = item.label; //labels[i];
			let bg = item.bg; //bgs[i];
			let ipic = (line * keys.length + i);
			if (ipic % picsPerLine == 0 && ipic > 0) mLinebreak(dParent);
			let id = 'pic' + ipic; // (line * keys.length + i);
			let d1 = maPicLabelButtonFitText(info, label,
				{ w: pictureSize, h: pictureSize, bgPic: bg, textShadowColor: textShadowColor, contrast: contrast },
				onClickPictureHandler, dParent, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
			d1.id = id;
			pics.push({
				textShadowColor: textShadowColor, key: info.key, info: info, bg: bg, div: d1, id: id,
				index: i, label: label, isLabelVisible: true, isSelected: false
			});
		}
	}

	return pics;


}
function calcDimsAndSize(numPics, lines, container) {

	let ww, wh, hpercent, wpercent;
	if (isdef(container)) {
		let b = getBounds(container);
		ww = b.width;
		wh = b.height;
		hpercent = .9;
		wpercent = .9;
	} else {
		ww = window.innerWidth;
		wh = window.innerHeight;
		hpercent = .6;
		wpercent = .6;
	}
	let sz, picsPerLine;
	if (lines > 1) {
		let hpic = wh * hpercent / lines;
		let wpic = ww * wpercent / numPics;
		sz = Math.min(hpic, wpic);
		picsPerLine = numPics; //keys.length;
	} else {
		let dims = calcRowsColsX(numPics);
		let hpic = wh * hpercent / dims.rows;
		let wpic = ww * wpercent / dims.cols;
		sz = Math.min(hpic, wpic);
		picsPerLine = dims.cols;
	}

	pictureSize = Math.max(50, Math.min(sz, 200));
	return [pictureSize, picsPerLine];
}
function maPic(infokey, dParent, styles, isText = true, isOmoji = false) {

	let info = isString(infokey) ? picInfo(infokey) : infokey;
	//console.log(infokey)
	//console.log('isText', isText, 'isOmoji', isOmoji);

	// as img
	if (!isText && info.type == 'emo') {

		//ensureSvgDict(); geht NICHT weil ja awaited werden muss!!!!!!!

		let dir = isOmoji ? 'openmoji' : 'twemoji';
		let hex = info.hexcode;
		if (isOmoji && hex.indexOf('-') == 2) hex = '00' + hex;
		let ui = mImg('/assets/svg/' + dir + '/' + hex + '.svg', dParent);
		if (isdef(styles)) mStyleX(ui, styles);
		return ui;
	}

	// as text
	let outerStyles = isdef(styles) ? jsCopy(styles) : {};
	outerStyles.display = 'inline-block';
	let family = info.type == 'emo' && isString(isOmoji) ? isOmoji : isOmoji == true ? 'emoOpen' : info.family;

	// let i = (family == info.family) ? 0 : EMOFONTLIST.indexOf(family)+1;
	// console.log('i is', i,'\n',info.w,'\n',info.family,'\n',family,'\n',EMOFONTLIST)

	// let iwInfo = (family == info.family) ? 0 : info.w.indexOf(family);
	let i = (family == info.family) ? 0 : EMOFONTLIST.indexOf(family) + 1;
	if (i < 0) {
		i = 1; console.log('iiiiiii', i, family, info.family);
	}
	let wInfo = info.w[i];
	// let ihInfo = (family == info.family) ? 0 : info.h.indexOf(family);
	let hInfo = info.h[i];

	// console.log('family', family, 'orig', info.family)
	let innerStyles = { family: family };
	let [padw, padh] = isdef(styles.padding) ? [styles.padding, styles.padding] : [0, 0];

	let dOuter = mDiv(dParent);
	let d = mDiv(dOuter);
	d.innerHTML = info.text;

	let wdes, hdes, fzdes, wreal, hreal, fzreal, f;


	if (isdef(styles.w) && isdef(styles.h) && isdef(styles.fz)) {
		[wdes, hdes, fzdes] = [styles.w, styles.h, styles.fz];
		let fw = wdes / wInfo;
		let fh = hdes / hInfo;
		let ffz = fzdes / info.fz;
		f = Math.min(fw, fh, ffz);
	} else if (isdef(styles.w) && isdef(styles.h)) {
		[wdes, hdes] = [styles.w, styles.h];
		let fw = wdes / wInfo;
		let fh = hdes / hInfo;
		f = Math.min(fw, fh);
	} else if (isdef(styles.w) && isdef(styles.fz)) {
		[wdes, fzdes] = [styles.w, styles.fz];
		let fw = wdes / wInfo;
		let ffz = fzdes / info.fz;
		f = Math.min(fw, ffz);
	} else if (isdef(styles.h) && isdef(styles.fz)) {
		[hdes, fzdes] = [styles.h, styles.fz];
		let fh = hdes / hInfo;
		let ffz = fzdes / info.fz;
		f = Math.min(fh, ffz);
	} else if (isdef(styles.h)) {
		hdes = styles.h;
		f = hdes / hInfo;
	} else if (isdef(styles.w)) {
		wdes = styles.w;
		f = wdes / wInfo;
		// } else if (isdef(styles.fz)) {
		// 	fzdes = styles.fz;
		// 	f = fzdes / info.fz;
	} else {
		mStyleX(d, innerStyles);
		mStyleX(dOuter, outerStyles);
		return dOuter;
	}
	fzreal = f * info.fz;
	wreal = Math.round(f * wInfo);
	hreal = Math.round(f * hInfo);
	wdes = Math.round(wdes);
	hdes = Math.round(hdes);
	padw += isdef(styles.w) ? (wdes - wreal) / 2 : 0;
	padh += isdef(styles.h) ? (hdes - hreal) / 2 : 0;
	//console.log('====>>>>', family, '\nw.info', wInfo, '\nh.info', hInfo, '\nfactor', f, '\nw', wreal, '\nh', hreal);

	if (!(padw >= 0 && padh >= 0)) {
		console.log(info)
		console.log('\nstyles.w', styles.w, '\nstyles.h', styles.h, '\nstyles.fz', styles.fz, '\nstyles.padding', styles.padding, '\nwInfo', wInfo, '\nhInfo', hInfo, '\nfzreal', fzreal, '\nwreal', wreal, '\nhreal', hreal, '\npadw', padw, '\npadh', padh);
	}
	//console.assert(padw >= 0 && padh >= 0, 'BERECHNUNG FALSCH!!!!', padw, padh, info, '\ninfokey', infokey);

	innerStyles.fz = fzreal;
	innerStyles.weight = 900;
	innerStyles.w = wreal;
	innerStyles.h = hreal;
	mStyleX(d, innerStyles);

	outerStyles.padding = '' + padh + 'px ' + padw + 'px';
	outerStyles.w = wreal;
	outerStyles.h = hreal;
	//console.log(outerStyles)
	mStyleX(dOuter, outerStyles);

	return dOuter;

}
function maPicLabelShowHideHandler(ev){
	let id = evToClosestId(ev);
	let info = symbolDict[id.substring(1)];
	if (isLabelVisible(id)) maHideLabel(id, info); else maShowLabel(id, info);
	if (isdef(mBy('dummy'))) mBy('dummy').focus();

}
function maPicLabelButtonFitText(info, label, { w, h, bgPic, textShadowColor, contrast }, handler, dParent, styles, classes = 'picButton', isText, isOmoji, focusElement) {
	let picLabelStyles = getHarmoniousStylesPlusPlus(styles, {}, {}, w, h, 65, 0, 'arial', bgPic, 'transparent', null, null, true);

	let x = maPicLabelFitX(info, label.toUpperCase(), { wmax: w, textShadowColor: textShadowColor, contrast: contrast }, dParent, picLabelStyles[0], picLabelStyles[1], picLabelStyles[2], isText, isOmoji);

	x.id = 'd' + info.key;
	if (isdef(handler)) x.onclick = handler;
	x.style.cursor = 'pointer';
	x.lastChild.style.cursor = 'pointer';
	x.style.userSelect = 'none';
	mClass(x, classes);
	return x;
}
function maPicLabelFitX(info, label, { wmax, hmax, textShadowColor, contrast = .35 }, dParent, containerStyles, picStyles, textStyles, isText = true, isOmoji = false) {
	let d = mDiv(dParent);
	//console.log('picStyles',picStyles);

	if (isdef(textShadowColor)) {

		//console.log('contrast',contrast,'textShadowColor',textShadowColor)
		//console.log('===>textShadowColor',textShadowColor,'contrast',contrast);
		//console.log(picStyles);
		let sShade = '0 0 0 ' + textShadowColor; //green';
		picStyles['text-shadow'] = sShade;// +', '+sShade+', '+sShade;
		picStyles.fg =  anyColorToStandardString('black',contrast); //'#00000080' '#00000030' 
	}

	let dPic = maPic(info, d, picStyles, isText, isOmoji);
	// mText(info.annotation, d, textStyles, ['truncate']);
	let maxchars = 15; let maxlines = 1;
	//console.log(containerStyles, picStyles, textStyles);

	//if (isdef(hmax))
	//console.log('maPicLabelFitX_', 'wmax', wmax, 'hmax', hmax)
	let wAvail, hAvail;
	hAvail = containerStyles.h - (containerStyles.patop + picStyles.h);// + containerStyles.pabottom);
	wAvail = containerStyles.w;
	//console.log('=>', 'wAvail', wAvail, 'hAvail', hAvail);
	if (isdef(hmax)) {
		hAvail = containerStyles.h - (containerStyles.patop + picStyles.h);// + containerStyles.pabottom);
		if (hmax != 'auto') {
			hAvail = Math.min(hAvail, hmax);
		}
	}
	if (isdef(wmax)) {
		wAvail = containerStyles.w;
		if (wmax != 'auto') {
			wAvail = Math.min(wAvail, wmax);
		}
	}
	let fz = textStyles.fz;
	//measure text height and width with this font!
	//console.log('_ avail:', wAvail, hAvail)
	let styles1 = textStyles;
	let size = getSizeWithStylesX(label, styles1, isdef(wmax) ? wAvail : undefined, isdef(hmax) ? hAvail : undefined);
	//console.log('__', 'size', size);
	let size1 = getSizeWithStylesX(label, styles1);//, isdef(wmax) ? wAvail : undefined, isdef(hmax) ? hAvail : undefined);
	//console.log('__', 'size1', size1);

	let f1 = wAvail / size1.w;
	let isTextOverflow = f1 < 1;
	if (f1 < 1) {
		textStyles.fz *= f1;
		textStyles.fz = Math.floor(textStyles.fz);
		//console.log('text overflow! textStyles', textStyles);
	}

	let [wBound, hBound] = [isdef(wmax) ? size.w : undefined, isdef(hmax) ? size.h : undefined];

	let isOverflow = isdef(wBound) && size.w > wAvail || isdef(hBound) && size.h > hAvail;
	//console.log('___ isOverflow',isOverflow);


	let dText = mTextFit(label, { wmax: wBound, hmax: hBound }, d, textStyles, isTextOverflow ? ['truncate'] : null);
	// d.style.textAlign = 'center';
	// dText.style.textAlign = 'center';
	// containerStyles.align = 'center';

	mStyleX(d, containerStyles);

	dText.style.margin = 'auto';
	// console.log('____', d.id, d.style.textAlign, d, containerStyles)

	////console.log(dParent,'\nd',d,'\ndPic',dPic,'\ndText',dText);

	return d;
}
function getHarmoniousStylesPlusPlus(sContainer, sPic, sText, w, h, picPercent, padding, family, bg = 'blue', bgPic = 'random', fgPic = 'white', fgText = 'white', hasText = true) {
	//15,55,0,20,10=80

	//console.log(fgPic,fgText)

	let fact = 55 / picPercent;
	let [ptop, pbot] = [(80 - picPercent) * 3 / 5, (80 - picPercent) * 2 / 5];
	//let numbers = hasText ? [ptop, picPercent, 0, 20, pbot] : [15, 70, 0, 0, 15];
	let numbers = hasText ? [fact * 15, picPercent, 0, fact * 20, fact * 10] : [15, 70, 0, 0, 15];
	numbers = numbers.map(x => h * x / 100);
	[patop, szPic, zwischen, szText, pabot] = numbers;
	patop = Math.max(patop, padding);
	pabot = Math.max(pabot, padding);

	// console.log(patop, szPic, zwischen, szText, pabot);
	let styles = { h: h, bg: bg, fg: isdef(fgText) ? fgText : 'contrast', patop: patop, pabottom: pabot, align: 'center', 'box-sizing': 'border-box' };
	let textStyles = { family: family, fz: Math.floor(szText * 3 / 4) };
	let picStyles = { h: szPic, bg: bgPic, fg: isdef(fgPic) ? fgPic : 'contrast' };
	if (w > 0) styles.w = w; else styles.paleft = styles.paright = Math.max(padding, 4);
	for (const k in sContainer) { if (k != 'w' && nundef(styles[k])) styles[k] = sContainer[k]; }
	for (const k in sPic) { if (k != 'w' && nundef(picStyles[k])) picStyles[k] = sPic[k]; }
	for (const k in sText) { if (k != 'w' && nundef(textStyles[k])) textStyles[k] = sText[k]; }
	return [styles, picStyles, textStyles];
}
function getSizeWithStylesX(text, styles, wmax, hmax) {
	var d = document.createElement("div");
	document.body.appendChild(d);
	//console.log(styles);
	let cStyles = jsCopy(styles);
	cStyles.position = 'fixed';
	cStyles.opacity = 0;
	cStyles.top = '-9999px';
	if (isdef(wmax)) cStyles.width = wmax;
	if (isdef(hmax)) cStyles.height = wmax;
	//if (isdef(wMax)) d.maxWidth=wMax;
	mStyleX(d, cStyles);
	d.innerHTML = text;
	height = d.clientHeight;
	width = d.clientWidth;
	let x = getBounds(d)
	//console.log('==>',x.width,x.height);
	d.parentNode.removeChild(d);
	let res = { w: x.width, h: x.height };
	//console.log(res)
	return res;
}
function mpGridLabeled(dParent, list, picLabelStyles) {
	//cont,pic,text
	let dGrid = mDiv(dParent);
	let elems = [];
	let isText = true;
	let isOmoji = false;
	for (const k of list) {
		let info = symbolDict[k];
		let el = maPicLabel(info, dGrid, picLabelStyles[0], picLabelStyles[1], picLabelStyles[2], isText, isOmoji)
		elems.push(el);
	}
	let gridStyles = { 'place-content': 'center', gap: 4, margin: 4, padding: 4, rounding: 5 };
	let size = layoutGrid(elems, dGrid, gridStyles, { rows: 10, isInline: true });
	//console.log(size);
}

//#region badges
var badges=[];
function removeBadges(dParent, level) {
	while (badges.length > level) {
		let badge = badges.pop()
		removeElem(badge.div);
	}
}
function addBadge(dParent, level, clickHandler) {
	let fg = '#00000080';
	let textColor = 'white';
	let stylesForLabelButton = { rounding: 10, margin: 4 };
	const picStyles = ['twitterText', 'twitterImage', 'openMojiText', 'openMojiImage', 'segoe', 'openMojiBlackText', 'segoeBlack'];
	let isText = true; let isOmoji = false;
	let i = level - 1;
	let key = levelKeys[i];
	let k = replaceAll(key, ' ', '-');
	let info = symbolDict[k];
	let label = "level " + i; 
	let h = window.innerHeight; let hBadge = h / 14;
	let d1 = mpBadge(info, label, { w: hBadge, h: hBadge, bg: levelColors[i], fgPic: fg, fgText: textColor }, null, dParent, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
	d1.id = 'dBadge_'+i;
	mClass(d1, 'aniRubberBand');
	if (isdef(clickHandler)) d1.onclick = clickHandler;
	badges.push({ key: info.key, info: info, div: d1, id: d1.id, index: i });
}
function showBadges(dParent, level, clickHandler) {
	clearElement(dParent);badges =[];
	for (let i = 1; i <= level; i++) {
		addBadge(dParent, i, clickHandler);
	}
	//console.log(badges)
}
//#endregion

//deprecated
function mpLineup(dParent, keys, bgs, fg, textColor, texts) {
	let g2Pics = [];

	//let styles = { w: 200, h: 200, margin: 20, bg: 'random', cursor: 'pointer', rounding: 16, padding: 10 };
	let stylesForLabelButton = { rounding: 10, margin: 4 };
	const picStyles = ['twitterText', 'twitterImage', 'openMojiText', 'openMojiImage', 'segoe', 'openMojiBlackText', 'segoeBlack'];
	let isText = true; let isOmoji = false;

	for (let i = 0; i < keys.length; i++) {
		//console.log(keys[i]);
		let k = replaceAll(keys[i], ' ', '-');
		let info = symbolDict[k];

		let label = "level " + i; //info.key;

		let h = window.innerHeight; let hBadge = Math.floor((h) / 14);
		//console.log('hBadge',hBadge)
		let d1 = mpBadge(info, label, { w: hBadge, h: hBadge, bg: bgs[i], fgPic: fg, fgText: textColor }, null, dParent, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
		// let d1 = mpBadge(info, label, { w: 72, h: 72, bg: bgs[i], fgPic: fg, fgText: textColor }, null, dParent, stylesForLabelButton, 'frameOnHover', isText, isOmoji);

		g2Pics.push({ key: info.key, info: info, div: d1, id: d1.id, index: i });
	}
	return g2Pics;

}
function mpOver(d, dParent, fz, color, picStyle) {
	//maPicOver
	//d is pos fixed!!!
	//console.log('dParent',dParent)
	let b = getBounds(dParent);

	let cx = b.width / 2 + b.x;
	let cy = b.height / 2 + b.y;
	//console.log('picStyle')
	d.style.top = picStyle == 'segoeBlack' ? ((cy - fz * 2 / 3) + 'px') : ((cy - fz / 2) + 'px');
	d.style.left = picStyle == 'segoeBlack' ? ((cx - fz / 3) + 'px') : ((cx - fz * 1.2 / 2) + 'px');

	//console.log(b);
	// d.style.top = picStyle == 'segoeBlack' ? (b.y + 60 - fz / 2 + 'px') : (b.y + 100 - fz / 2 + 'px');
	// d.style.left = picStyle == 'segoeBlack' ? (b.x + 120 - fz / 2 + 'px') : (b.x + 100 - fz / 2 + 'px');
	d.style.color = color;
	d.style.fontSize = fz + 'px';
	d.style.display = 'block';
	let { isText, isOmoji } = getParamsForMaPicStyle(picStyle);
	d.style.fontFamily = isString(isOmoji) ? isOmoji : isOmoji ? 'emoOpen' : 'emoNoto';
	return d;
}
function labelToggler(ev) {
	let id = evToClosestId(ev);
	let info = symbolDict[id.substring(1)];
	if (isLabelVisible(id)) maHideLabel(id, info); else maShowLabel(id, info);
	mBy('dummy').focus();
}
function mpSimpleButton(key, dParent, handler) {
	let info = symbolDict[key];
	let label = stringAfterLast(info.E, '|');
	let st = { w: 200, h: 200, bg: 'random', fgPic: 'random', fgText: 'contrast' };
	//let handler = null;
	let stylesForLabelButton = { rounding: 10, margin: 24 };
	let { isText, isOmoji } = getParamsForMaPicStyle('twitterText');
	let d1 = maPicLabelButtonFitText(info, label, st, handler, dParent, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
	return d1;
}
function mpButton(info, label, { w, h, bg, fgPic, fgText }, handler, dParent, styles, classes = 'picButton', isText, isOmoji) {
	//maPicLabelButtonFitText_
	if (nundef(handler)) handler = labelToggler; // (ev) => { let id = evToClosestId(ev); let info = symbolDict[id.substring(1)]; if (isLabelVisible(id)) maHideLabel(id, info); else maShowLabel(id, info); mBy('dummy').focus(); }
	let picLabelStyles = getHarmoniousStylesPlusPlus(styles, {}, {}, w, h, 65, 0, 'arial', bg, 'transparent', fgPic, fgText, true);
	let x = maPicLabelFitX(info, label.toUpperCase(), { wmax: w }, dParent, picLabelStyles[0], picLabelStyles[1], picLabelStyles[2], true, false);
	x.id = 'd' + info.key;
	x.onclick = handler;
	x.style.cursor = 'pointer';
	x.lastChild.style.cursor = 'pointer';
	x.style.userSelect = 'none';
	mClass(x, classes);
	return x;
}
function mpBadge(info, label, { w, h, bg, fgPic, fgText }, handler, dParent, styles, classes = 'picButton', isText, isOmoji) {
	//maPicLabelButtonFitText_
	if (nundef(handler)) handler = (ev) => { let id = evToClosestId(ev); let info = symbolDict[id.substring(1)]; if (isLabelVisible(id)) maHideLabel(id, info); else maShowLabel(id, info); mBy('dummy').focus(); }
	let picLabelStyles = getBadgeStyles(styles, {}, {}, w, h, 64, 4, 2, 'arial', bg, 'transparent', fgPic, fgText, true);
	let x = maPicLabelFitX(info, label.toUpperCase(), { wmax: w }, dParent, picLabelStyles[0], picLabelStyles[1], picLabelStyles[2], true, false);
	x.id = 'd' + info.key;
	//x.onclick = handler;
	//x.style.cursor = 'pointer';
	x.lastChild.style.cursor = 'default';
	x.style.userSelect = 'none';
	return x;
}
function getBadgeStyles(sContainer, sPic, sText, w, h, picPercent, paddingTop, paddingBot, family, bg = 'blue', bgPic = 'random', fgPic = 'white', fgText = 'white', hasText = true) {
	//15,55,0,20,10=80

	//console.log(fgPic,fgText)

	let fact = 55 / picPercent;
	let [ptop, pbot] = [(isdef(paddingTop) ? paddingTop : (80 - picPercent) * 3 / 5),
	(isdef(paddingBot) ? paddingBot : (80 - picPercent) * 2 / 5)];
	let pText = 100 - picPercent - ptop - pbot;
	// let [ptop, pbot] = [(80 - picPercent) * 3 / 5, (80 - picPercent) * 2 / 5];
	//let numbers = hasText ? [ptop, picPercent, 0, 20, pbot] : [15, 70, 0, 0, 15];
	// let numbers = hasText ? [fact * 15, picPercent, 0, fact * 20, fact * 10] : [15, 70, 0, 0, 15];
	let numbers = hasText ? [fact * ptop, picPercent, 0, fact * pText, fact * pbot] : [15, 70, 0, 0, 15];
	numbers = numbers.map(x => h * x / 100);
	let [patop, szPic, zwischen, szText, pabot] = numbers;
	patop = Math.max(patop, paddingTop);
	pabot = Math.max(pabot, paddingBot);

	// console.log(patop, szPic, zwischen, szText, pabot);
	let styles = { h: h, bg: bg, fg: isdef(fgText) ? fgText : 'contrast', patop: patop, pabottom: pabot, align: 'center', 'box-sizing': 'border-box' };
	let textStyles = { family: family, fz: Math.floor(szText * 3 / 4) };
	let picStyles = { h: szPic, bg: bgPic, fg: isdef(fgPic) ? fgPic : 'contrast' };
	if (w > 0) styles.w = w; else styles.paleft = styles.paright = Math.max(padding, 4);
	for (const k in sContainer) { if (k != 'w' && nundef(styles[k])) styles[k] = sContainer[k]; }
	for (const k in sPic) { if (k != 'w' && nundef(picStyles[k])) picStyles[k] = sPic[k]; }
	for (const k in sText) { if (k != 'w' && nundef(textStyles[k])) textStyles[k] = sText[k]; }
	return [styles, picStyles, textStyles];
}

//#region words, dictionaries
function getInfos(cats, lang,
	{ minlen, maxlen, wShort = false, wLast = false, wExact = false, sorter = null }) {
	let keys = setCategories(cats);
	//console.log(keys);
	//return keys.map(x=>symbolDict[x]);
	let infos = [];
	if (isdef(minlen && isdef(maxlen))) {
		keys = keys.filter(k => {
			let info = jsCopy(symbolDict[k]);
			let exact = CorrectWordsExact[lang][k];
			if (wExact && nundef(exact)) return false;
			let ws = wExact ? [exact.req] : wLast ? [lastOfLanguage(k, lang)] : wordsOfLanguage(k, lang);
			if (wShort) ws = [getShortestWord(ws, false)];
			//console.log('ws',ws);
			//console.log('__________', k, ws);
			//console.log('INFO.WORDS', k, symbolDict[k].words);
			info.words = [];
			for (const w of ws) {
				if (w.length >= minlen && w.length <= maxlen) {
					//console.log('YES! w',w,minlen,maxlen);
					info.words.push(w);
					info.best = w;
				}
			}
			//console.log('best',symbolDict[k].best,info.words)
			//console.log(info.words)
			if (!isEmpty(info.words)) { infos.push(info); return true; } else return false;
		});
	}
	if (isdef(sorter)) sortByFunc(infos, sorter);

	return infos;
}

function isEnglish(lang) { return startsWith(lang.toLowerCase(), 'e'); }
function wordsOfLanguage(key, language) {
	//console.log(language)
	let y = symbolDict[key];
	//console.log(y)
	let w = y[language];
	let wlist = w.split('|');
	return wlist.map(x => x.trim());
}
function lastOfLanguage(key, language) {
	//console.log(language)
	let y = symbolDict[key];
	//console.log(y)
	let w = y[language];
	//console.log(key,w)
	let last = stringAfterLast(w, '|');
	//console.log(last)
	return last.trim();
}
function makeHigherOrderGroups() {
	for (const honame in higherOrderEmoSetNames) {
		for (const name of (higherOrderEmoSetNames[honame])) {
			for (const k in symBySet[name]) {
				let info = symbolDict[k];
				lookupSet(symBySet, [honame, k], info);
				lookupAddToList(symKeysBySet, [honame], k);
				lookupAddToList(symListBySet, [honame], info);
			}
		}
	}
	let s = '';
	for (const k in symKeysBySet) {
		s += k + ':' + symKeysBySet[k].length + ', ';
	}
	//console.log(s);
	//console.log('group names:',Object.keys(symKeysBySet).sort());
	ensureSymByType();
}
function setCategories(groupNameList) {

	ensureSymBySet();
	//console.log(groupNameList)
	let keys = [];
	for (const cat of groupNameList) {
		let name = cat.toLowerCase();
		//console.log(name)
		//console.log(name,symKeysBySet,symKeysBySet[name])
		for (const k of symKeysBySet[name]) {
			//console.log(k)
			keys.push(k);
		}
	}
	return keys;
}
function groupSizes(){
	ensureSymBySet();
	for(const gname in symKeysBySet){
		console.log('group',gname+': '+symKeysBySet[gname].length);
	}
}

function getKeySetX(categories, language, minlength, maxlength, bestOnly = false, sortAccessor=null, correctOnly=false, reqOnly=false) {
	let keys = setCategories(categories);
	//console.log(keys);//ok
	//console.log(CorrectWordsCorrect)
	if (isdef(minlength && isdef(maxlength))) {
		keys = keys.filter(k => {

			let ws = bestOnly ? [lastOfLanguage(k,language)] : wordsOfLanguage(k, language);
			//console.log(ws)
			for (const w of ws) {
				if (w.length >= minlength && w.length <= maxlength 
					&& (!correctOnly || isdef(CorrectWordsExact[k]))
					&& (!reqOnly || w.toLowerCase() == CorrectWordsExact[k].req)) 
					return true;
			}
			return false;
		});
	}
	//console.log('________________',keys);//ok

	if (isdef(sortAccessor)) sortByFunc(keys,sortAccessor); //keys.sort((a,b)=>fGetter(a)<fGetter(b));
	return keys;
}
function getKeySet(groupName, language, maxlength) {
	let keys = setGroup(groupName);
	keys = isdef(maxlength) && maxlength > 0 ?
		keys.filter(x => lastOfLanguage(x, language).length <= maxlength)
		: keys;
	return keys;

}
function setGroup(groupName) { //deprecated! use setCategories!
	ensureSymBySet();
	return jsCopy(symKeysBySet[groupName]);
}
function getRandomSetItem(lang = 'E', key, keylist) {
	//console.log(keylist)
	if (nundef(keylist)) keylist = setCategories(['animal']);

	if (nundef(key)) key = chooseRandom(keylist);

	//#region individual keys for test
	//key = 'fever'; //fever
	//key= 'onion'; //onion
	//key = 'mouse'; // mouse '1FA79'; //bandage '1F48E'; // gem '1F4E3';//megaphone '26BE'; //baseball '1F508'; //speaker low volume
	// key='baseball'; // baseball '26BD'; //soccer '1F988'; //shark '1F41C'; //ant '1F1E6-1F1FC';
	//key = 'adhesive bandage';
	//key = 'hippopotamus';
	// key = 'llama';
	//key = "chess pawn";
	//key='briefcase';
	//key = 'four-thirty';
	//key='chopsticks';
	//key='orangutan';
	//key = 'person with veil';
	//key='medal';
	//key='leopard';
	//key='telephone';
	//#endregion

	let info = jsCopy(picInfo(key));
	let valid, words;
	let oValid = info[lang + '_valid_sound'];
	if (isEmpty(oValid)) valid = []; else valid = sepWordListFromString(oValid, ['|']);
	let oWords = info[lang];
	if (isEmpty(oWords)) words = []; else words = sepWordListFromString(oWords, ['|']);

	let dWords = info.D;
	if (isEmpty(dWords)) dWords = []; else dWords = sepWordListFromString(dWords, ['|']);
	let eWords = info.E;
	if (isEmpty(eWords)) eWords = []; else eWords = sepWordListFromString(eWords, ['|']);

	words = isEnglish(lang) ? eWords : dWords;
	info.eWords = eWords;
	info.dWords = dWords;
	info.words = words;
	info.best = arrLast(words);
	info.valid = valid;

	currentLanguage = lang;

	return info;
}
function getBestWord(info, lang) {
	let w = info[lang];
	let best = stringAfterLast(w, '|');
	//console.log('best',best);
	if (isEmpty(best)) best = info.annotation;
	return best;
}
function isLabelVisible(id) { return isVisible(mBy(id).children[1]); }
function maHideLabel(id, info) {
	let d = mBy(id);
	let dPic = d.children[0];
	let dText = d.children[1];
	dText.style.display = 'none';

	let dPicText = dPic.children[0];
	let family = dPicText.style.fontFamily;
	let i = (family == info.family) ? 0 : EMOFONTLIST.indexOf(family) + 1;
	let wInfo = info.w[i];
	let hInfo = info.h[i];
	let b = getBounds(d);
	let styles = { w: b.width, h: b.height };
	let [ptop, pbottom] = [firstNumber(d.style.paddingTop), firstNumber(d.style.paddingBottom)];
	let p = (isdef(ptop) && isdef(pbottom)) ? Math.min(ptop, pbottom) : 0;
	let [padw, padh] = [p, p];
	let [wtotal, htotal] = [styles.w, styles.h];
	let [wpic, hpic] = [wtotal - 2 * padw, htotal - 2 * padh];
	let fw = wpic / wInfo;
	let fh = hpic / hInfo;
	f = Math.min(fw, fh);
	fzreal = f * info.fz;
	wreal = f * wInfo;
	hreal = f * hInfo;
	padw += isdef(styles.w) ? (wpic - wreal) / 2 : 0;
	padh += isdef(styles.h) ? (hpic - hreal) / 2 : 0;
	if (!(padw >= 0 && padh >= 0)) { console.log(info); }
	let innerStyles = {};
	innerStyles.fz = fzreal;

	innerStyles.weight = 900;

	info.fzOrig = dPicText.style.fontSize; //firstNumber(dPicText.style.fontSize);
	info.textColorOrig = dPicText.style.color;
	dPicText.style.fontSize = fzreal + 'px';

	info.wOrig = dPic.style.width;
	info.hOrig = dPic.style.height;
	innerStyles.w = wreal;
	innerStyles.h = hreal;
	mStyleX(dPic, innerStyles);

	let outerStyles = {};

	info.paddingOrig = d.style.padding;
	info.paddingTopOrig = d.style.paddingTop;
	info.paddingBottomOrig = d.style.paddingBottom;
	outerStyles.padding = '' + padh + 'px ' + padw + 'px';
	mStyleX(d, outerStyles);

}
function maShowLabel(id, info) {
	let d = mBy(id);
	let dPic = d.children[0];
	let dText = d.children[1];
	let dPicText = dPic.children[0];
	dPicText.style.fontSize = info.fzOrig;
	dPicText.style.color = info.textColorOrig;
	dPic.style.width = info.wOrig;
	dPic.style.height = info.hOrig;
	d.style.paddingTop = info.paddingTopOrig;
	d.style.paddingBottom = info.paddingBottomOrig;
	dText.style.display = 'block';
	dText.style.width = 'auto'

}

//#endregion

//#region layouts
function layoutGrid(elist, dGrid, containerStyles, { rows, cols, isInline = false } = {}) {
	//console.log(elist, elist.length)
	let dims = calcRowsCols(elist.length, rows, cols);
	//console.log('dims', dims);

	let parentStyle = jsCopy(containerStyles);
	parentStyle.display = isInline ? 'inline-grid' : 'grid';
	parentStyle['grid-template-columns'] = `repeat(${dims.cols}, auto)`;
	parentStyle['box-sizing'] = 'border-box'; // TODO: koennte ev problematisch sein, leave for now!

	//console.log('parentStyle', parentStyle)

	mStyleX(dGrid, parentStyle);
	let b = getBounds(dGrid);
	return { w: b.width, h: b.height };

}
function layoutFlex(elist, dGrid, containerStyles, { rows, cols, isInline = false } = {}) {
	console.log(elist, elist.length)
	let dims = calcRowsCols(elist.length, rows, cols);
	console.log('dims', dims);

	let parentStyle = jsCopy(containerStyles);
	if (containerStyles.orientation == 'v') {
		// console.log('vertical!');
		// parentStyle['flex-flow']='row wrap';
		parentStyle['writing-mode'] = 'vertical-lr';
	}
	parentStyle.display = 'flex';
	parentStyle.flex = '0 0 auto';
	parentStyle['flex-wrap'] = 'wrap';
	// parentStyle['box-sizing'] = 'border-box'; // TODO: koennte ev problematisch sein, leave for now!

	mStyleX(dGrid, parentStyle);
	let b = getBounds(dGrid);
	return { w: b.width, h: b.height };

}

//#endregion

//#region maPic
function maPicOver(d, dParent, fz, color, picStyle) { // styles, isText = true, isOmoji = false) {

	let b = getBounds(dParent);
	//console.log(b);
	//let fz = 40;
	d.style.top = picStyle == 'segoeBlack' ? (b.y + 60 - fz / 2 + 'px') : (b.y + 100 - fz / 2 + 'px');
	d.style.left = picStyle == 'segoeBlack' ? (b.x + 120 - fz / 2 + 'px') : (b.x + 100 - fz / 2 + 'px');
	d.style.color = color;
	d.style.fontSize = fz + 'px';
	d.style.display = 'block';
	let { isText, isOmoji } = getParamsForMaPicStyle(picStyle);
	d.style.fontFamily = isString(isOmoji) ? isOmoji : isOmoji ? 'emoOpen' : 'emoNoto';
	return d;
}
function maPicOver(d, dParent, fz, color, picStyle) { // styles, isText = true, isOmoji = false) {

	let b = getBounds(dParent);
	//console.log(b);
	//let fz = 40;
	d.style.top = picStyle == 'segoeBlack' ? (b.y + 60 - fz / 2 + 'px') : (b.y + 100 - fz / 2 + 'px');
	d.style.left = picStyle == 'segoeBlack' ? (b.x + 120 - fz / 2 + 'px') : (b.x + 100 - fz / 2 + 'px');
	d.style.color = color;
	d.style.fontSize = fz + 'px';
	d.style.display = 'block';
	let { isText, isOmoji } = getParamsForMaPicStyle(picStyle);
	d.style.fontFamily = isString(isOmoji) ? isOmoji : isOmoji ? 'emoOpen' : 'emoNoto';
	return d;
}
function maPicSimple(key) {
	let info = picInfo(key);
	let d = mText(info.text);
	d.style.setProperty('font-family', info.family);
	return d;
}
function maPicButton(key, handler, dParent, styles, classes = 'picButton', isText, isOmoji) {
	let x = maPic(key, dParent, styles, isText, isOmoji);
	if (isdef(handler)) x.onclick = handler;
	mClass(x, classes);
	return x;
}
function maPicLabelButtonXX(info, label, handler, dParent, styles, classes = 'picButton', isText, isOmoji) {
	let handler1 = (ev) => {
		let id = evToClosestId(ev);
		let info = infoDictionary[id.substring(1)];
		if (isLabelVisible(id)) maHideLabel(id, info); else maShowLabel(id, info);
		mBy('dummy').focus();
	}
	let picLabelStyles = getHarmoniousStylesPlusPlus(styles, {}, {}, 200, 200, 65, 0, 'arial', 'random', 'transparent', null, null, true);
	let x = maPicLabelFit(info, label.toUpperCase(), dParent, picLabelStyles[0], picLabelStyles[1], picLabelStyles[2], true, false);
	x.id = 'd' + label;
	x.onclick = handler;
	x.style.cursor = 'pointer';
	x.lastChild.style.cursor = 'pointer';
	x.style.userSelect = 'none';
	return x;
}
function maPicLabelButtonX(info, label, handler, dParent, styles, classes = 'picButton', isText, isOmoji) {
	let handler1 = (ev) => {
		let id = evToClosestId(ev);
		let info = symbolDict[id.substring(1)];
		if (isLabelVisible(id)) maHideLabel(id, info); else maShowLabel(id, info);
		mBy('dummy').focus();
	}
	let picLabelStyles = getHarmoniousStylesPlus(styles, {}, {}, 200, 200, 0, 'arial', 'random', 'transparent', true);
	let x = maPicLabelX(info, label.toUpperCase(), dParent, picLabelStyles[0], picLabelStyles[1], picLabelStyles[2], true, false);
	x.id = 'd' + label;
	x.onclick = handler;
	x.style.cursor = 'pointer';
	x.lastChild.style.cursor = 'pointer';
	x.style.userSelect = 'none';
	return x;
}
function maPicLabelButton(info, label, handler, dParent, styles, classes = 'picButton', isText, isOmoji) {
	let sz = isdef(styles) && isdef(styles.w) ? styles.w : 200;
	//let [g, p, t] = getHarmoniousStylesX(styles.w, 'arial', 'random', 'random');
	let [g, p, t] = getHarmoniousStyles1(styles.w, styles.h, 10, 'arial', 'random', 'random', true);
	g.display = 'inline-block';
	for (const k in styles) {
		g[k] = styles[k];
		if (k == 'rounding') p.rounding = styles.rounding;
	}
	console.log('g', g, '\np', p, '\nt', t)
	let x = maPicLabelX(info, label, dParent, g, p, t, isText, isOmoji);
	//let x = maPicLabel(info, dParent, styles,{},{}, isText, isOmoji);
	if (isdef(handler)) x.onclick = handler;
	mClass(x, classes);
	return x;
}
function maPicSimpleEmoHexText(hex, parent, fontSize) {
	if (isString(parent)) parent = mBy(parent);
	let d = mDiv(parent);
	let s1 = '&#' + hex + ';'; //'\u{1F436}';
	d.innerHTML = s1;
	d.style.fontSize = fontSize + 'pt';
	return d;
}

function maPicLabelFit(info, label, dParent, containerStyles, picStyles, textStyles, isText = true, isOmoji = false) {
	let d = mDiv(dParent);
	//console.log('picStyles',picStyles);
	let dPic = maPic(info, d, picStyles, isText, isOmoji);
	// mText(info.annotation, d, textStyles, ['truncate']);
	let maxchars = 15; let maxlines = 1;
	console.log(containerStyles, picStyles, textStyles);

	let hAvail = containerStyles.h -
		(containerStyles.patop + picStyles.h + containerStyles.pabottom);
	let wAvail = containerStyles.w;
	let fz = textStyles.fz;
	//measure text height and width with this font!
	console.log('_ avail:', wAvail, hAvail)
	let styles1 = textStyles;
	let size = getSizeWithStylesX(label, styles1, wAvail);
	console.log('__', size);

	let dText = mTextFit(label, maxchars, maxlines, d, textStyles, ['truncate']);
	mStyleX(d, containerStyles);

	//console.log(dParent,'\nd',d,'\ndPic',dPic,'\ndText',dText);

	return d;
}

function maPicLabelX(info, label, dParent, containerStyles, picStyles, textStyles, isText = true, isOmoji = false) {
	let d = mDiv(dParent);
	//console.log('picStyles',picStyles);
	let dPic = maPic(info, d, picStyles, isText, isOmoji);
	// mText(info.annotation, d, textStyles, ['truncate']);
	let dText = mText(label, d, textStyles, ['might-overflow']);
	mStyleX(d, containerStyles);

	//console.log(dParent,'\nd',d,'\ndPic',dPic,'\ndText',dText);

	return d;
}

function maPicLabel(info, dParent, containerStyles, picStyles, textStyles, isText = true, isOmoji = false) {
	let d = mDiv(dParent);
	let dPic = maPic(info, d, picStyles, isText, isOmoji);
	// mText(info.annotation, d, textStyles, ['truncate']);
	let dText = mText(info.annotation, d, textStyles, ['might-overflow']);
	mStyleX(d, containerStyles);

	//console.log(dParent, '\nd', d, '\ndPic', dPic, '\ndText', dText);

	return d;
}
function maPicFrame(info, dParent, containerStyles, picStyles, isText = true, isOmoji = false) {
	let d = mDiv(dParent);
	maPic(info, d, picStyles, isText, isOmoji);
	mStyleX(d, containerStyles);
	return d;
}
function maPic4(info, dParent, styles) {
	//uses svgDict! and symBySet
	mStyleX(dParent, { display: 'flex', 'flex-flow': 'row wrap' });
	//let info = picInfo(key);
	maPic(info, table, styles, true);
	maPic(info, table, styles, true, 'segoe ui emoji');
	maPic(info, table, styles, false);
	maPic(info, table, styles, false, true);
	mLinebreak(table);


}
function maPicLabel_dep(info, dParent, styles, isText = true, isOmoji = false) {
	//info, dParent, styles, isText = true, isOmoji = false) {
	let d = mDiv(dParent, { bg: 'random', fg: 'contrast', padding: 4, margin: 2 });//mStyleX(d,{align:'center'})
	maPic(info, d, styles, isText, isOmoji);
	mText(info.annotation, d);
	d.style.textAlign = 'center';
	return d;
}

//#endregion

//#region style factories
function getHarmoniousStyles1(w, h, padding, family, bg = 'blue', fg = 'random', hasText = true) {
	let numbers = hasText ? [15, 55, 0, 20, 10] : [15, 70, 0, 0, 15];
	numbers = numbers.map(x => h * x / 100);
	[patop, szPic, zwischen, szText, pabot] = numbers;
	patop = Math.max(patop, padding);
	pabot = Math.max(pabot, padding);

	// console.log(patop, szPic, zwischen, szText, pabot);
	let styles = { h: h, bg: bg, fg: 'contrast', patop: patop, pabottom: pabot, align: 'center', 'box-sizing': 'border-box' };
	let textStyles = { family: family, fz: Math.floor(szText * 3 / 4) };
	let picStyles = { h: szPic, bg: fg };
	if (w > 0) styles.w = w; else styles.paleft = styles.paright = Math.max(padding, 4);
	return [styles, picStyles, textStyles];
}
function getHarmoniousStylesPlus(sContainer, sPic, sText, w, h, padding, family, bg = 'blue', fg = 'random', hasText = true) {
	let numbers = hasText ? [15, 55, 0, 20, 10] : [15, 70, 0, 0, 15];
	numbers = numbers.map(x => h * x / 100);
	[patop, szPic, zwischen, szText, pabot] = numbers;
	patop = Math.max(patop, padding);
	pabot = Math.max(pabot, padding);

	// console.log(patop, szPic, zwischen, szText, pabot);
	let styles = { h: h, bg: bg, fg: 'contrast', patop: patop, pabottom: pabot, align: 'center', 'box-sizing': 'border-box' };
	let textStyles = { family: family, fz: Math.floor(szText * 3 / 4) };
	let picStyles = { h: szPic, bg: fg };
	if (w > 0) styles.w = w; else styles.paleft = styles.paright = Math.max(padding, 4);
	for (const k in sContainer) { if (k != 'w' && nundef(styles[k])) styles[k] = sContainer[k]; }
	for (const k in sPic) { if (k != 'w' && nundef(picStyles[k])) picStyles[k] = sPic[k]; }
	for (const k in sText) { if (k != 'w' && nundef(textStyles[k])) textStyles[k] = sText[k]; }
	return [styles, picStyles, textStyles];
}

function getHarmoniousStylesXX(w, h, padding, family, bg = 'blue', fg = 'random', hasText = true) {
	let numbers = hasText ? [15, 55, 0, 20, 10] : [15, 70, 0, 0, 15];
	numbers = numbers.map(x => h * x / 100);
	[patop, szPic, zwischen, szText, pabot] = numbers;
	patop = Math.max(patop, padding);
	pabot = Math.max(pabot, padding);

	// console.log(patop, szPic, zwischen, szText, pabot);
	let styles = { h: h, bg: bg, fg: 'contrast', patop: patop, pabottom: pabot, align: 'center', 'box-sizing': 'border-box' };
	let textStyles = { family: family, fz: Math.floor(szText * 3 / 4) };
	let picStyles = { h: szPic, bg: fg };
	if (w > 0) styles.w = w; else styles.paleft = styles.paright = Math.max(padding, 4);
	return [styles, picStyles, textStyles];
}
function getHarmoniousStylesX(sz, family, bg = 'blue', fg = 'random', hasText = true, setWidth = false) {
	let numbers = hasText ? [15, 55, 0, 20, 10] : [15, 70, 0, 0, 15];
	numbers = numbers.map(x => sz * x / 100);
	[patop, szPic, zwischen, szText, pabot] = numbers;

	console.log(patop, szPic, zwischen, szText, pabot);
	let styles = { h: sz, bg: bg, fg: 'contrast', patop: patop, pabottom: pabot, align: 'center', 'box-sizing': 'border-box' };
	let textStyles = { family: family, fz: Math.floor(szText * 3 / 4) };
	let picStyles = { h: szPic, bg: fg };
	if (setWidth) styles.w = sz; else styles.paleft = styles.paright = 4;
	return [styles, picStyles, textStyles];
}
function getHarmoniousStyles(sz, family, bg = 'blue', fg = 'random', hasText = true) {
	let fpic = 2 / 3; let ffont = 1 / 8; let ftop = 1 / 9; let fbot = 1 / 12;
	let styles = { w: sz, h: sz, bg: bg, fg: 'contrast', patop: sz * ftop, pabottom: sz * fbot, align: 'center', 'box-sizing': 'border-box' };
	let textStyles = { family: family, fz: Math.floor(sz * ffont) };
	let picStyles = { h: sz * fpic, bg: fg };
	return [styles, picStyles, textStyles];
}
function getSimpleStyles(sz, family, bg, fg) {
	let styles = { bg: bg, fg: 'contrast', align: 'center', 'box-sizing': 'border-box', padding: 4, margin: 2 };
	let textStyles = { family: family };
	let picStyles = { w: sz, h: sz, bg: fg };
	return [styles, picStyles, textStyles];
}
function getParamsForMaPicStyle(desc = 'segoeBlack') {
	desc = desc.toLowerCase();
	switch (desc) {
		case 'twittertext': return { isText: true, isOmoji: false };
		case 'twitterimage': return { isText: false, isOmoji: false };
		case 'openmojitext': return { isText: true, isOmoji: true };
		case 'openmojiimage': return { isText: false, isOmoji: true };
		case 'openmojiblacktext': return { isText: true, isOmoji: 'openmoBlack' };
		case 'segoe': return { isText: true, isOmoji: 'segoe ui emoji' };
		case 'segoeblack': return { isText: true, isOmoji: 'segoe ui symbol' };
		default: return { isText: true, isOmoji: false };
	}

}
//#endregion

//#region pic helpers
function picInfo(key) {
	//#region doc 
	/*	
usage: info = picInfo('red heart');

key ... string or hex key or keywords (=>in latter case will perform picSearch and return random info from result)

returns info
	*/
	//#endregion 
	if (isdef(symbolDict[key])) return symbolDict[key];
	else {
		ensureSymByHex();
		let info = symByHex[key];
		if (isdef(info)) { return info; }
		else {
			let infolist = picSearch({ keywords: key });
			//console.log('result from picSearch(' + key + ')', infolist);
			if (infolist.length == 0) return null;
			else return chooseRandom(infolist);
		}
	}
}
function picRandom(type, keywords, n = 1) {
	let infolist = picSearch({ type: type, keywords: keywords });
	//console.log(infolist)
	return n == 1 ? chooseRandom(infolist) : choose(infolist, n);
}
function picSearch({ keywords, type, func, set, group, subgroup, props, isAnd, justCompleteWords }) {
	//#region doc 
	/*	
usage: ilist = picSearch({ type: 'all', func: (d, kw) => allCondX(d, x => /^a\w*r$/.test(x.key)) });

keywords ... list of strings or just 1 string  =>TODO: allow * wildcards!
type ... E [all,eduplo,iduplo,emo,icon] =>dict will be made from that!
func ... (dict,keywords) => infolist

>the following params are used to select one of standard filter functions (see helpers region filter functions)
props ... list of properties to match with filter function
isAnd ... all keywords must match in filter function
justCompleteWords ... matches have to be complete words

returns list of info
	*/
	//#endregion 

	if (isdef(set)) ensureSymBySet();

	if (isdef(type) && type != 'all') ensureSymByType();

	//if (type == 'icon') console.log(symByType,'\n=>list',symListByType)

	let [dict, list] = isdef(set) ? [symBySet[set], symListBySet[set]]
		: nundef(type) || type == 'all' ? [symbolDict, symbolList] : [symByType[type], symListByType[type]];

	//console.log(dict);

	//console.log('_____________',keywords,type,dict,func)
	//if (nundef(keywords)) return isdef(func) ? func(dict) : dict2list(dict);
	if (set == 'role' && firstCond(dict2list(dict), x => x.id == 'rotate')) console.log('===>', symBySet[set], dict, dict2list(dict));

	if (nundef(keywords)) return isdef(func) ? func(dict) : list;
	if (!isList(keywords)) keywords = [keywords];
	if (isString(props)) props = [props];

	let infolist = [];
	if (isList(props)) {
		if (isAnd) {
			if (justCompleteWords) {
				infolist = allWordsContainedInPropsAsWord(dict, keywords, props);
			} else {
				infolist = allWordsContainedInProps(dict, keywords, props);
			}
		} else {
			if (justCompleteWords) {
				infolist = anyWordContainedInPropsAsWord(dict, keywords, props);
			} else {
				infolist = anyWordContainedInProps(dict, keywords, props);
			}
		}
	} else if (nundef(props) && nundef(func)) {
		if (isAnd) {
			if (justCompleteWords) {
				infolist = allWordsContainedInKeysAsWord(dict, keywords);
			} else {
				infolist = allWordsContainedInKeys(dict, keywords);
			}
		} else {
			if (justCompleteWords) {
				infolist = anyWordContainedInKeysAsWord(dict, keywords);
			} else {
				infolist = anyWordContainedInKeys(dict, keywords);
			}
		}
	} else if (isdef(func)) {
		//propList is a function!
		//console.log('calling func',dict,keywords)
		infolist = func(dict, keywords);
	}
	return infolist;
}
function picSet(setname) {
	//if no key is give, just get a random pic from this set
	ensureSymBySet();
	return chooseRandom(symListBySet[setname]);
	// if (isdef(key)) {
	// 	if (isdef(symBySet[setname][key])) return symbolDict[key];
	// 	else return picSearch({ set: setname, keywords: [key] });
	// } else return chooseRandom(symListBySet[name]);
}
//#endregion

//#region helpers (empty)
//#endregion









