
function zGrid(elems, dParent) {

	let dGrid = mDiv(dParent);
	elems.map(x => mAppend(dGrid, x.div));

	let gridStyles = { 'place-content': 'center', gap: 4, margin: 4, padding: 4, bg: 'silver', rounding: 5 };
	let size = layoutGrid(elems, dGrid, gridStyles, { rows: 10, isInline: true });
	return size;
}
function zPic(key, dParent, styles = {}, isText = true, isOmoji = false) {
	let w = styles.w, h = styles.h, padding = styles.padding, hpadding = styles.hpadding, wpadding = styles.wpadding;
	if (isdef(styles.sz)) {
		if (nundef(w)) w = styles.sz;
		if (nundef(h)) h = styles.sz;
	}
	let stylesNew = jsCopy(styles);
	if (isdef(w)) {
		if (isdef(padding)) { w -= 2 * padding; }//stylesNew.padding=0;}
		else if (isdef(wpadding)) { w -= 2 * wpadding; }//stylesNew.wpadding=0;}
		stylesNew.w = w;
	}
	if (isdef(h)) {
		if (isdef(padding)) { h -= 2 * padding; }//stylesNew.padding=0;}
		else if (isdef(hpadding)) { h -= 2 * hpadding; }//stylesNew.hpadding=0;}
		stylesNew.h = h;
	}
	// console.log('old',styles)
	// console.log('new:',stylesNew)
	return _zPicPaddingAddedToSize(key, dParent, stylesNew, isText, isOmoji);
}
function zText1Line(text, dParent, textStyles, hText, vCenter = false) {
	let dText = isdef(text) ? mText(text, dParent, textStyles) : mDiv(dParent);
	return { text: text, div: dText, extra: 0, lines: 1, h: hText, w: 0, fz: textStyles.fz };
}
function zText(text, dParent, textStyles, hText, vCenter = false) {
	let tSize = getSizeWithStyles(text, textStyles);


	let extra = 0, lines = 1;
	if (isdef(hText)) {
		extra = hText - tSize.h;
		if (textStyles.fz) lines = Math.floor(tSize.h / textStyles.fz);
	}
	// if (extra > 0 && vCenter) {
	// 	textStyles.paddingTop = extra / 2;
	// 	textStyles.h = hText;
	// 	// dText.style.paddingTop = (extra/2) +'px';
	// }
	//	console.log('', text, extra, 'lines:' + lines, textStyles);
	let dText = isdef(text) ? mText(text, dParent, textStyles) : mDiv(dParent);
	if (extra > 0 && vCenter) {
		dText.style.paddingTop = (extra / 2) + 'px';
		dText.style.paddingBottom = (extra / 2) + 'px';
		// dText.style.paddingTop = (extra/2) +'px';
	}
	//console.log(dText);
	return { text: text, div: dText, extra: extra, lines: lines, h: tSize.h, w: tSize.w, fz: textStyles.fz };
	//return mText(text, dParent, styles); 
}
function zViewer(keys) {
	onclick = zView100;
	IconSet = isdef(keys) ? keys : symKeysBySet['nosymbols'];
	lastIndex = 0;
	Pictures = [];

	zView100();
}

function zView(keys, dParent, { repeat = 1, labels }) {
	//
}

function zView100() {	//assumes a div id='table'

	let N = 100;
	if (lastIndex >= IconSet.length) {
		console.log('NO MORE KEYS!!!!!');
		return;
	}

	let table = mBy('table');
	clearElement(table);
	// mButton('download key set', downloadKeySet, table, { fz: 30 });

	console.log('pics', lastIndex, 'to', lastIndex + N)
	let keys = takeFromTo(IconSet, lastIndex, lastIndex + N);//chooseRandom() ['keycap: 0', 'keycap: 1', 'keycap: #', 'keycap: *'];
	//console.log(keys);
	Pictures = zItemsForViewer(keys, (k, info) => (k + ' ' + info.h[0]), { sz: 50 }, lastIndex);//, (k, info) => k + ' ' + info.h[0]);
	//Pictures = zItems00(keys,  (k, info) => (k + ' ' + info.h[0]), { sz: 50 });//, (k, info) => k + ' ' + info.h[0]);
	// Pictures = zItems01(keys,  { sz: 50 }, (k, info) => k + ' ' + info.h[0]);
	//console.log(Pictures);
	let szFinal = zGrid(Pictures, table);
	lastIndex += N;

	console.log('sizeOfGrid:', szFinal);
	console.log('pic0', Pictures[0]);

}
function zShowPictures1(keys, labels, dParent, onClickPictureHandler,
	{ showRepeat, container, lang, border, picSize, bg, colorKeys, contrast, repeat = 1,
		sameBackground, shufflePositions = true } = {}, { sCont, sPic, sText } = {}) {
	let pics = [];



	let items = zItemsFromPictures(keys, labels, {
		showRepeat: showRepeat, container: container, lang: lang, border: border,
		picSize: picSize, bgs: bg, colorKeys: colorKeys, contrast: contrast, repeat: repeat,
		sameBackground: sameBackground, shufflePositions: shufflePositions
	});

	let [pictureSize, rows, cols] = calcDimsAndSize1(items.length, isdef(colorKeys) ? colorKeys.length : undefined, undefined, container);

	//console.log('....pictureSize', pictureSize, 'dims', rows, cols)
	let stylesForLabelButton = { rounding: 10, margin: pictureSize / 8 };

	//if (isdef(myStyles)) stylesForLabelButton = deepmergeOverride(stylesForLabelButton, myStyles);
	let isText = true;
	let isOmoji = false;
	if (isdef(lang)) {
		let textStyle = getParamsForMaPicStyle('twitterText');
		isText = textStyle.isText;
		isOmoji = textStyle.isOmoji;
	}

	if (isdef(border)) stylesForLabelButton.border = border;

	if (isdef(picSize)) pictureSize = picSize;

	// console.log('dims', rows, cols, items.length)

	let i = 0;
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let item = items[i];
			let id = 'pic' + i;
			let d1 = maPicLabelButtonFitText(item.info, item.label,
				{
					w: pictureSize, h: pictureSize, bgPic: item.bg, textShadowColor: item.textShadowColor, contrast: contrast,
					sPic: sPic
				},
				onClickPictureHandler, dParent, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
			d1.id = id;
			if (showRepeat) addRepeatInfo(d1, item.iRepeat, pictureSize);
			let fzPic = firstNumber(d1.children[0].children[0].style.fontSize);
			//item hat bereits: fg,bg,iRepeat,info,key,label,textShadowColor
			pics.push({
				textShadowColor: item.textShadowColor, color: item.color, colorKey: item.colorKey, key: item.info.key, info: item.info,
				bg: item.bg, div: d1, id: id, sz: pictureSize, fzPic: fzPic,
				index: i, row: r, col: c, iRepeat: item.iRepeat, label: item.label, isLabelVisible: true, isSelected: false
			});
			i += 1;
		}
		mLinebreak(dParent);
	}

	return pics;
}


//#region helpers
function _zPicPaddingAddedToSize(infokey, dParent, styles = {}, isText = true, isOmoji = false) {

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
	if (info.type == 'icon' && hInfo == 133) hInfo = 110;

	// console.log('family', family, 'orig', info.family)
	let innerStyles = { family: family };
	let [padw, padh] = isdef(styles.padding) ? [styles.padding, styles.padding] : [0, 0];

	let dOuter = isdef(dParent) ? mDiv(dParent) : mDiv();
	let d = mDiv(dOuter);
	d.innerHTML = info.text;

	let wdes, hdes, fzdes, wreal, hreal, fzreal, f;

	//console.log(info);
	//console.log('________styles',styles)
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
	fzreal = Math.floor(f * info.fz);
	wreal = Math.round(f * wInfo);
	hreal = Math.round(f * hInfo);
	wdes = Math.round(wdes);
	hdes = Math.round(hdes);
	padw += isdef(styles.w) ? (wdes - wreal) / 2 : 0;
	padh += isdef(styles.h) ? (hdes - hreal) / 2 : 0;

	//console.log('padh',padh)
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
	outerStyles.w = wreal; //das ist groesse von inner!
	outerStyles.h = hreal;
	// let [bg,fg] = getExtendedColors(outerStyles.bg,outerStyles.fg);
	// outerStyles.bg = bg;
	// outerStyles.bg = fg;
	//console.log(outerStyles)
	mStyleX(dOuter, outerStyles);

	return {
		info: info, key: info.key, div: dOuter, outerDims: { w: wdes, h: hdes, hpadding: padh, wpadding: padw },
		innerDims: { w: wreal, h: hreal, fz: fzreal }, bg: dOuter.style.backgroundColor, fg: dOuter.style.color
	};

}
function parseDims(w, h, padding) {
	let allpads = allIntegers(padding);
	let len = allpads.length;
	let patop = allpads[0];
	let paright = len == 1 ? patop : allpads[1];
	let pabot = len <= 2 ? patop : allpads[2];
	let paleft = len == 1 ? patop : len < 4 ? paright : allpads[3];

	return { w: w, h: h, patop: patop, paright: paright, pabot: pabot, paleft: paleft };
}


//#endregion

function calcDimsAndSize1(n, lines, cols, dParent, wmax, hmax) {

	//berechne outer dims
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
		hpercent = .56;
		wpercent = .64;
	}

	console.log(ww,wh)
	let sz;//, picsPerLine;
	//if (lines <= 1) lines = undefined;
	let dims = calcRowsColsX(n, lines);
	let hpic = wh * hpercent / dims.rows;
	let wpic = ww * wpercent / dims.cols;
	sz = Math.min(hpic, wpic);
	//picsPerLine = dims.cols;
	sz = Math.max(50, Math.min(sz, 200));
	return [sz, dims.rows, dims.cols]; //pictureSize, picsPerLine];
}




