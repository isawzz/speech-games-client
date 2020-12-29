function showPictures(onClickPictureHandler, { showRepeat = false, sz, bgs, colorKeys, contrast, repeat = 1,
	sameBackground = true, border, textColor, fz = 20 } = {}, keys, labels) {
	Pictures = [];
	if (nundef(keys)) keys = choose(G.keys, G.numPics);

	//keys=['toolbox','tiger']; //keys[0] = 'butterfly'; //keys[0]='man in manual wheelchair';	//keys=['sun with face'];

	//#region experimental code not activated yet!!!
	let sCont = {}; if (isdef(sz)) sCont.w = sCont.h = sz; if (isdef(border)) sCont.border = border; //sCont.padding=8;
	let sPic = {}; if (isdef(contrast)) sPic.contrast = contrast;
	let sText = { fz: fz };
	Pictures = maShowPicturesX3(keys, labels, dTable, onClickPictureHandler,
		{ showRepeat: showRepeat, bgs: bgs, repeat: repeat, sameBackground: sameBackground, lang: Settings.language, 
	   colorKeys: colorKeys, textColor: textColor },
		//	{ sCont: sCont, sPic: sPic, sText: sText });
		{ sCont: { w: 200, h: 200, padding: 10, align: 'center' }, sPic: { contrast: .3 }, sText: { fz: 20 } });
	//use this in case of broken!!!!	
	//#endregion

	// Pictures = maShowPictures(keys, labels, dTable, onClickPictureHandler,
	// 	{
	// 		showRepeat: showRepeat, picSize: sz, bgs: bgs, repeat: repeat, sameBackground: sameBackground, border: border,
	// 		lang: Settings.language, colorKeys: colorKeys, contrast: contrast
	// 	});


	// label hiding
	let totalPics = Pictures.length;
	if (nundef(Settings.labels) || Settings.labels) {
		if (G.numLabels == totalPics) return;
		let remlabelPic = choose(Pictures, totalPics - G.numLabels);
		for (const p of remlabelPic) {
			//console.log('hi1');
			maHideLabel(p.id, p.info); p.isLabelVisible = false;
		}
	} else {
		for (const p of Pictures) {
			//console.log('hi1');
			maHideLabel(p.id, p.info); p.isLabelVisible = false;
		}

	}

}
function maShowPicturesX3(keys, labels, dParent, onClickPictureHandler,
	{ showRepeat, container, lang, bgs, colors, repeat = 1, sameBackground, shufflePositions = true, textColor } = {},
	{ sCont, sPic, sText } = {}) {
	let pics = [];
	let items = makeItemForEachKeyX3(keys, labels, { lang, bgs, colors, textColor, sameBackground, repeat, shufflePositions });	//make a label for each key
	let [isText, isOmoji] = calcTextStyle(lang);

	//layout
	let lines = isdef(colors) ? colors.length : 1;
	let [pictureSize, picsPerLine] = calcDimsAndSizeX3(items.length, { lines: lines, dParent: container });

	//console.log('items', items, 'picSize', pictureSize, 'lines', lines, 'cols', picsPerLine);
	let padding = 0;
	if (isdef(sCont.padding)) { padding = sCont.padding; delete sCont.padding; }
	[sCont, sPic, sText] = getDefaultStylesX3(sCont, sPic, sText, pictureSize);
	//console.log('3------------NACH GETDEFAULTSTYLES',jsCopy(sText))
	//console.log(sText)
	console.log('sCont', jsCopy(sCont), '\nsPic', sPic, '\nsText', sText);

	let ill = indexOfFuncMax(items, 'label', x=>x.length);
	console.log(ill)
	let label=items[ill.i].label;
	let size = getSizeWithStylesX(label, sText);//, sCont.w-2*sCont.padding);
	console.log('longest label is',label,'w='+size.w);

	for (let line = 0; line < lines; line++) {
		for (let i = 0; i < picsPerLine; i++) {

			let ipic = (line * picsPerLine + i);
			if (ipic % picsPerLine == 0 && ipic > 0) { mLinebreak(dParent); }
			let id = 'pic' + ipic;

			let item = items[ipic];

			sCont.bg = item.bg;
			sCont.padding = padding;
			sText.fg = item.fg;

			//console.log('32222222222222222------------',jsCopy(sText))


			if (isdef(item.textShadowColor)) {
				//console.log('YEAH!!!!!!!!!!!!!!',item.textShadowColor)
				let extStyle = convertTextShadowColorAndContrastX3(item.textShadowColor, sPic.contrast);
				overrideKeys(sPic, extStyle);
				//console.log('==>',sPic)
			}
			//console.log('2------------',jsCopy(sText))

			onClickPictureHandler = ev => maPicLabelShowHideHandlerX(item.info, ev);
			let d1 = maPicLabelButtonFitTextX3(item.info, item.label, dParent, onClickPictureHandler,
				{ sCont: sCont, sPic: sPic, sText: jsCopy(sText) }, 'frameOnHover', isText, isOmoji);
			d1.id = id;

			if (showRepeat) addRepeatInfo(d1, item.iRepeat, pictureSize, item.fg);

			pics.push({
				textShadowColor: item.textShadowColor, key: item.info.key, info: item.info, bg: item.bg, div: d1, id: id,
				index: ipic, row: line, col: i, iRepeat: item.iRepeat, label: item.label, isLabelVisible: true, isSelected: false
			});
		}
	}
	return pics;
}
//#region 3rd gen DONE
function maPicLabelButtonFitTextX3(info, label, dParent, handler,
	{ sCont, sPic, sText } = {}, classes = 'picButton', isText, isOmoji, focusElement) {

	//[sCont, sPic, sText] = getHarmoniousStylesPlusPlusX(sCont, sPic, sText, 65);
	//[sCont, sPic, sText] = getHarmoniousStylesPlusPlus(sCont, sPic, {}, sCont.w, sCont.h, 65, 0, 'arial', sCont.bg, 'transparent', null, null, true);	//console.log('sCont',sCont);

	//console.log(sCont)
	//console.log(sPic)

	//console.log('...', sText)
	let x = maPicLabelFitX3(info, label.toUpperCase(), sCont.w, dParent, sCont, sPic, sText, isText, isOmoji);
	// let x = maPicLabelFitX(info, label.toUpperCase(), { wmax: sCont.w }, dParent, sCont, sPic, sText, isText, isOmoji);

	x.id = 'd' + info.key;
	if (isdef(handler)) x.onclick = handler;
	x.style.cursor = 'pointer';
	x.lastChild.style.cursor = 'pointer';
	x.style.userSelect = 'none';
	mClass(x, classes);
	return x;
}


function addRepeatInfoX3(dPic, iRepeat, szPic, fg = 'contrast') {
	console.log(dPic, iRepeat, szPic)
	let szi = Math.max(Math.floor(szPic / 8), 8);
	console.log(szi);
	dPic.style.position = 'relative';
	let d2 = mText('' + iRepeat, dPic, { fz: szi, weight: 'bold', fg: contrast, position: 'absolute', left: szi / 2, top: szi / 2 - 2 });
	// let d3 = mText('col:' + col, dPic, { fz: szi, color: 'black', position: 'absolute', left: szi, top: (szi / 2 + szi + 2) })
	return d2;
}
function makeItemForEachKeyX3(keys, labels, { lang, bgs, colors, textColor, sameBackground, repeat = 1, shufflePositions = true }) {
	//console.log('HALLO!!!!')
	//transform textColor param into list of fg, one for each key
	let fgText;
	if (isList(textColor)) {
		//auf all die items wird textColors cyclically aufgeteilt
		fgText = [];
		let iColor = 0;
		for (const k of keys) { fgText.push(textColor[iColor]); iColor = (iColor + 1) % textColor.length; }
	} else if (isdef(textColor)) {
		fgText = new Array(keys.length).fill(textColor);
	}
	//create one item per key
	let itKeys = [];
	for (let i = 0; i < keys.length; i++) {
		let k = keys[i];
		let info = isdef(lang) ? getRandomSetItem(lang, k) : symbolDict[k];
		let bg = isList(bgs) ? bgs[i] : isdef(colors) ? 'white' : sameBackground ? computeColor('random') : 'random';
		let fg = isList(fgText) ? fgText[i] : colorIdealText(bg);
		let label = isList(labels) ? labels[i] : isdef(lang) ? info.best : k;
		itKeys.push({ key: k, info: info, label: label, bg: bg, fg: fg, iRepeat: 1 });
	}
	//repeat items
	let itRepeat = [];
	for (let i = 0; i < repeat; i++) {
		let items = jsCopy(itKeys);
		itRepeat = itRepeat.concat(items);
	}
	if (shufflePositions) { shuffle(itRepeat); }
	let labelRepeat = {};
	for (const item of itRepeat) {
		let iRepeat = labelRepeat[item.label];
		if (nundef(iRepeat)) iRepeat = 1; else iRepeat += 1;
		item.iRepeat = iRepeat;
		labelRepeat[item.label] = iRepeat;
	}
	//copy colors.length times into different colors

	let itColors = [];
	if (isdef(colors)) {
		for (let line = 0; line < colors.length; line++) {
			let newItems = jsCopy(itRepeat);
			newItems.map(x => x.textShadowColor = colors[line]);
			itColors = itColors.concat(newItems);
		}
	} else {
		itColors = itRepeat;
	}

	return itColors;
}
function calcDimsAndSizeX3(numPics, { lines, dParent, wmax, hmax } = {}) {

	console.log('_____________', numPics, lines)
	let ww, wh, hpercent, wpercent;
	if (isdef(dParent)) {
		let b = getBounds(dParent);
		ww = b.width;
		wh = b.height;
		hpercent = .9;
		wpercent = .9;
	} else if (isdef(wmax) && isdef(hmax)) {
		ww = wmax;
		wh = hmax;
		hpercent = .6;
		wpercent = .6;
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
		picsPerLine = numPics / lines; //keys.length;
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
function getDefaultStylesX3(sCont, sPic = {}, sText = {}, pictureSize) {

	if (isdef(sCont)) sCont = deepmergeOverride({ rounding: 10, margin: pictureSize / 8 }, sCont);
	else sCont = { rounding: 10, margin: pictureSize / 8 };

	//if (isdef(picSize)) pictureSize = picSize;
	if (nundef(sCont.w)) sCont.w = pictureSize;
	if (nundef(sCont.h)) sCont.h = pictureSize;

	if (nundef(sPic)) sPic = {};
	if (nundef(sText)) sText = {};
	//if (isdef(contrast)) sPic.contrast = contrast;

	const sDefault = {
		cont: { bg: 'random', padding: 0, align: 'center', 'box-sizing': 'border-box' },
		pic: { bg: 'transparent', fg: 'white' },
		text: { fg: 'contrast', family: 'arial' } //&& k != 'padding' , padding: 8 }
	}
	setDefaultKeys(sCont, sDefault.cont);
	setDefaultKeys(sPic, sDefault.pic);
	setDefaultKeys(sText, sDefault.text);

	return [sCont, sPic, sText];
}
//#endregion

//#region 3rd gen TODO
function convertTextShadowColorAndContrastX3(textShadowColor, contrast) {
	let sShade = '0 0 0 ' + textShadowColor;
	let style = { 'text-shadow': sShade, fg: anyColorToStandardString('black', contrast) };
	return style;
}

function overrideKeys(o, onew) {
	for (const k in onew) o[k] = onew[k];
}
function maPicLabelFitX3(info, label, wmax, dParent, sCont, sPic, sText, isText = true, isOmoji = false) {
	//NOTE: sCont.padding will be MUTATED!

	let d = mDiv(dParent);

	let picPercent = 65;
	let hasText = true;
	let fact = 55 / picPercent;
	let numbers = hasText ? [fact * 15, picPercent, 0, fact * 20, fact * 10] : [15, 70, 0, 0, 15];
	numbers = numbers.map(x => sCont.h * x / 100);
	let [patop, szPic, zwischen, szText, pabot] = numbers;
	let [paright, paleft] = [0, 0];

	let padding = sCont.padding;
	if (isdef(padding)) {
		let diff = 2 * padding - (patop + pabot);
		szPic -= diff / 2;
		szText -= diff / 2;
		patop = Math.max(padding, patop);
		pabot = Math.max(padding, pabot);
		paright = Math.max(padding, paright);
		paleft = Math.max(padding, paleft);
	}
	sCont.padding = '' + patop + 'px ' + paright + 'px ' + pabot + 'px ' + paleft + 'px';

	sPic.h = szPic;
	let fz = sText.fz = Math.max(8, (Math.floor(szText * 3 / 4)));// - sText.padding / 2;


	console.log('szPic', szPic, 'szText', szText, 'fz', fz)

	let dPic = maPic(info, d, sPic, isText, isOmoji);

	mStyleX(d, sCont);

	//measurements
	let wAvail, hAvail;
	hAvail = sCont.h - (sCont.patop + sPic.h);
	wAvail = sCont.w - paleft - paright;
	if (isdef(wmax) && wmax != 'auto') { wAvail = Math.min(wAvail, wmax); }
	let styles1 = jsCopy(sText);
	let size = getSizeWithStylesX(label, styles1, wAvail);
	let size1 = getSizeWithStylesX(label, styles1);
	let f1 = wAvail / size1.w;
	let isTextOverflow = f1 < 1;
	if (f1 < 1) { fz = sText.fz *= f1; sText.fz = Math.floor(sText.fz); }

	console.log('isTextOverflow', isTextOverflow, 'fz', fz);
	let [wBound, hBound] = [size.w, undefined];

	sText.fz = 20;
	let dText = mTextFitX3(label, { wmax: wBound, hmax: hBound }, d, jsCopy(sText));//, isTextOverflow ? ['truncate'] : null);

	console.log('fontSize', dText.style.fontSize);
	dText.style.margin = 'auto';
	return d;
}
function mTextFitX3(text, { wmax, hmax }, dParent, styles, classes) {
	//mTextFit(label,maxchars,maxlines, d, textStyles, ['truncate']);
	let d = mDiv(dParent);
	if (!isEmpty(text)) d.innerHTML = text;

	//console.log('_______',wmax,hmax)
	if (nundef(styles) && (isdef(wmax)) || isdef(hmax)) {
		styles = {};
	}
	//if (isdef(wmax)) styles.width = wmax;
	if (isdef(hmax)) styles.height = hmax;

	//console.log('_',text,styles)

	if (isdef(styles)) mStyleX(d, styles);

	if (isdef(classes)) mClass(d, classes);
	return d;
}

//#region NOW
function maShowPicturesX(keys, labels, dParent, onClickPictureHandler,
	{ showRepeat, container, lang, bgs, colors, repeat = 1, sameBackground, shufflePositions = true, textColor } = {},
	{ sCont, sPic, sText } = {}) {
	let pics = [];
	let items = makeItemForEachKey(keys, labels, { lang, bgs, colors, textColor, sameBackground, repeat, shufflePositions });	//make a label for each key
	let [isText, isOmoji] = calcTextStyle(lang);
	let numPics = items.length;

	//layout
	let lines = isdef(colors) ? colors.length : 1;
	let [pictureSize, picsPerLine] = calcDimsAndSize(numPics, lines, container);

	if (isdef(sCont)) sCont = deepmergeOverride({ rounding: 10, margin: pictureSize / 8 }, sCont);
	else sCont = { rounding: 10, margin: pictureSize / 8 };

	//if (isdef(picSize)) pictureSize = picSize;
	if (nundef(sCont.w)) sCont.w = pictureSize;
	if (nundef(sCont.h)) sCont.h = pictureSize;

	if (nundef(sPic)) sPic = {};
	if (nundef(sText)) sText = {};
	//if (isdef(contrast)) sPic.contrast = contrast;

	//console.log('lines',lines,'picsPerLine',picsPerLine, 'items', items, 'numPics', numPics)

	let labelRepeat = {};

	[sCont, sPic, sText] = getDefaultStyles(sCont, sPic, sText);
	// [sCont, sPic, sText] = getHarmoniousStylesPlusPlus(sCont, sPic, {}, sCont.w, sCont.h, 65, 0, 'arial', sPic.bg, 'transparent', null, null, true);	//console.log('sCont',sCont);

	for (let line = 0; line < lines; line++) {
		let textShadowColor;
		if (isdef(colors)) { sPic.textShadowColor = textShadowColor = colors[line]; labelRepeat = {}; }

		for (let i = 0; i < numPics; i++) {

			let item = items[i];

			//let bg = item.bg; 
			sCont.bg = item.bg;
			sText.fg = item.fg;

			let ipic = (line * picsPerLine + i);
			if (ipic % picsPerLine == 0 && ipic > 0) { mLinebreak(dParent); }
			let id = 'pic' + ipic;

			//onClickPictureHandler = ev=>maPicLabelShowHideHandlerX(item.info,ev);
			let d1 = maPicLabelButtonFitTextX(item.info, item.label, dParent, onClickPictureHandler,
				// { w: pictureSize, h: pictureSize, bgPic: bg, textShadowColor: textShadowColor, contrast: contrast },
				//{}, //{ textShadowColor: textShadowColor, contrast: contrast },
				{ sCont: sCont, sPic: jsCopy(sPic), sText: sText }, 'frameOnHover', isText, isOmoji);
			d1.id = id;

			//addRowColInfo(d1,line,i,pictureSize);
			let iRepeat = labelRepeat[item.label];
			if (nundef(iRepeat)) iRepeat = 1; else iRepeat += 1;
			labelRepeat[item.label] = iRepeat;
			if (showRepeat) addRepeatInfo(d1, iRepeat, pictureSize);
			pics.push({
				textShadowColor: textShadowColor, key: item.info.key, info: item.info, bg: item.bg, div: d1, id: id,
				index: ipic, row: line, col: i, iRepeat: iRepeat, label: item.label, isLabelVisible: true, isSelected: false
			});
		}
	}
	return pics;
}
function maPicLabelButtonFitTextX(info, label, dParent, handler,
	{ sCont, sPic, sText } = {}, classes = 'picButton', isText, isOmoji, focusElement) {

	//[sCont, sPic, sText] = getHarmoniousStylesPlusPlusX(sCont, sPic, sText, 65);
	//[sCont, sPic, sText] = getHarmoniousStylesPlusPlus(sCont, sPic, {}, sCont.w, sCont.h, 65, 0, 'arial', sCont.bg, 'transparent', null, null, true);	//console.log('sCont',sCont);

	//console.log(sCont)
	//console.log(sPic)

	let x = maPicLabelFitXX(info, label.toUpperCase(), sCont.w, dParent, sCont, sPic, sText, isText, isOmoji);
	// let x = maPicLabelFitX(info, label.toUpperCase(), { wmax: sCont.w }, dParent, sCont, sPic, sText, isText, isOmoji);

	x.id = 'd' + info.key;
	if (isdef(handler)) x.onclick = handler;
	x.style.cursor = 'pointer';
	x.lastChild.style.cursor = 'pointer';
	x.style.userSelect = 'none';
	mClass(x, classes);
	return x;
}
function setDefaultKeys(o, defs) { for (const k in defs) { if (nundef(o[k])) o[k] = defs[k]; } }
function convertTextShadowColorAndContrast(picStyles) {
	if (isdef(picStyles.textShadowColor)) {
		let sShade = '0 0 0 ' + picStyles.textShadowColor;
		picStyles['text-shadow'] = sShade;
		picStyles.fg = anyColorToStandardString('black', picStyles.contrast);
		delete picStyles.textShadowColor;
		delete picStyles.contrast;
	}
}
function maPicLabelFitXX(info, label, wmax, dParent, sCont, sPic, sText, isText = true, isOmoji = false) {
	let d = mDiv(dParent);
	convertTextShadowColorAndContrast(sPic);

	//console.log(sPic)
	//console.log('start of maPicLabelFitXX:', sCont.patop, sCont.paright, sCont.pabot, sCont.paleft, sCont.h, sPic.h);

	let dPic = maPic(info, d, sPic, isText, isOmoji);
	//measurements
	let wAvail, hAvail;
	hAvail = sCont.h - (sCont.patop + sPic.h);
	wAvail = sCont.w;
	if (isdef(wmax) && wmax != 'auto') { wAvail = Math.min(wAvail, wmax); }
	let styles1 = sText;
	let size = getSizeWithStylesX(label, styles1, wAvail);
	let size1 = getSizeWithStylesX(label, styles1);
	let f1 = wAvail / size1.w;
	let isTextOverflow = f1 < 1;
	if (f1 < 1) { sText.fz *= f1; sText.fz = Math.floor(sText.fz); }
	let [wBound, hBound] = [size.w, undefined];
	let dText = mTextFit(label, { wmax: wBound, hmax: hBound }, d, sText, isTextOverflow ? ['truncate'] : null);
	mStyleX(d, sCont);
	dText.style.margin = 'auto';
	return d;
}
function makeItemForEachKey(keys, labels, { lang, bgs, colors, textColor, sameBackground, repeat, shufflePositions }) {

	//transform textColor param into list of fg, one for each key
	let fgText;
	if (isList(textColor)) {
		//auf all die items wird textColors cyclically aufgeteilt
		fgText = [];
		let iColor = 0;
		for (const k of keys) { fgText.push(textColor[iColor]); iColor = (iColor + 1) % textColor.length; }
	} else if (isdef(textColor)) {
		fgText = new Array(keys.length).fill(textColor);
	}

	let items = [];
	for (let i = 0; i < keys.length; i++) {
		let k = keys[i];
		let info = isdef(lang) ? getRandomSetItem(lang, k) : symbolDict[k];
		let bg = isList(bgs) ? bgs[i] : isdef(colors) ? 'white' : sameBackground ? computeColor('random') : 'random';
		let fg = isList(fgText) ? fgText[i] : colorIdealText(bg);
		let label = isList(labels) ? labels[i] : isdef(lang) ? info.best : k;
		items.push({ key: k, info: info, label: label, bg: bg, fg: fg, iRepeat: 1 });
	}
	//console.log('________________',items,repeat)
	let items1 = jsCopy(items);
	for (let i = 0; i < repeat - 1; i++) {
		// let newItems=jsCopy(items);
		// for(const it of newItems) it.iRepeat=i+1;
		items = items.concat(items1);
	}
	//console.log('________________',items,repeat)
	if (shufflePositions) { shuffle(items); }
	return items;
}
function calcTextStyle(lang) {
	let isText = true;
	let isOmoji = false;
	if (isdef(lang)) {
		let textStyle = getParamsForMaPicStyle('twitterText');
		isText = textStyle.isText;
		isOmoji = textStyle.isOmoji;
	}
	return [isText, isOmoji];
}
function maPicLabelShowHideHandlerX(info, ev) {
	let id = evToClosestId(ev);
	//let info = symbolDict[id.substring(1)];
	if (isLabelVisible(id)) maHideLabel(id, info); else maShowLabel(id, info);
	if (isdef(mBy('dummy'))) mBy('dummy').focus();

}




























