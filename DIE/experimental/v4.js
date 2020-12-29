

function showPicturesX4(onClickPictureHandler, { showRepeat = false, sz, bgs, colorKeys, contrast, repeat = 1,
	sameBackground = true, border, textColor, fz = 20 } = {}, keys, labels) {
	Pictures = [];
	if (nundef(keys)) keys = choose(G.keys, G.numPics);
	//keys=['toolbox','tiger']; //keys[0] = 'butterfly'; //keys[0]='man in manual wheelchair';	//keys=['sun with face'];

	Pictures = maShowPicturesX4(dTable, onClickPictureHandler,
		{ keys:keys, labels:labels, lang: Settings.language, }, //content
		{ colorKeys: colorKeys, contrast: contrast, }, //text-shadow
		{ repeat: repeat, sameBackground: sameBackground, showRepeat: showRepeat }, //repeat info
		{ bgs: bgs, border: border, fgs: null, textColor: textColor, }, //appearance: color
		{ wPic: sz, hPic: sz, fz: fz, weight:null, family:null, padding:null, margin:null }, //appearance: sizing, font
		{ rows: (isdef(colorKeys) ? colorKeys.length : undefined), cols: null, shufflePositions: 'cols' }, //layout info
	);

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
function maShowPicturesX4(dParent, onClickPictureHandler,
	{ keys, labels, lang }={}, //content
	{ colorKeys, contrast }={}, //text-shadow info
	{ repeat, sameBackground, showRepeat }={}, //repeat info
	{ bgs, fgs, textColor, cycle }={}, //appearance: cyclic: each can be value or list, if list too short will be used cyclically over keys
	// eg. bgs:['black','white']
	{ wPic, hPic, fz, weight, family, border, padding, margin }={}, //appearance: same for all
	{ rows , cols, shufflePositions, layoutInfo }={}, //layout info
){
}


function maShowPicturesX4(keys, labels, dParent, onClickPictureHandler,
	{ showRepeat, container, lang, border, picSize, bgs, colorKeys, contrast, repeat = 1,
		sameBackground, shufflePositions = true } = {}, { sCont, sPic, sText } = {}) {
	let pics = [];

	//#region prelim
	//console.log('maShowPictures_', 'keys', keys, '\n', 'labels', labels, '\n', 'bgs', bgs)
	//console.log('sameBackground',sameBackground)

	let numPics = keys.length * repeat;

	//make a label for each key
	let items = [];
	for (let i = 0; i < keys.length; i++) {
		let k = keys[i];
		let info = isdef(lang) ? getRandomSetItem(lang, k) : symbolDict[k];
		let bg = isList(bgs) ? bgs[i] : isdef(colorKeys) ? 'white' : sameBackground ? computeColor('random') : 'random';
		let label = isList(labels) ? labels[i] : isdef(lang) ? info.best : k;
		items.push({ key: k, info: info, label: label, bg: bg, iRepeat: 1 });
	}


	//console.log('________________',items,repeat)
	let items1 = jsCopy(items);
	for (let i = 0; i < repeat - 1; i++) {
		// let newItems=jsCopy(items);
		// for(const it of newItems) it.iRepeat=i+1;
		items = items.concat(items1);
	}
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

	//console.log('numPics',numPics,'items',jsCopy(items))

	//dann erst shuffle!
	if (shufflePositions) { shuffle(items); }
	// if (shufflePositions) {console.log('shuffling!!!'); shuffle(items);}

	//console.log('after shuffling items',jsCopy(items))

	//#endregion prelim

	let lines = isdef(colorKeys) ? colorKeys.length : 1;
	let [pictureSize, picsPerLine] = calcDimsAndSize(numPics, lines, container);
	let stylesForLabelButton = { rounding: 10, margin: pictureSize / 8 };

	//if (isdef(myStyles)) stylesForLabelButton = deepmergeOverride(stylesForLabelButton, myStyles);

	if (isdef(border)) stylesForLabelButton.border = border;

	if (isdef(picSize)) pictureSize = picSize;

	//console.log('lines',lines,'picsPerLine',picsPerLine, 'items', items, 'numPics', numPics)

	let labelRepeat = {};

	for (let line = 0; line < lines; line++) {
		let textShadowColor, colorKey;

		if (isdef(colorKeys)) { colorKey = colorKeys[line]; textShadowColor = ColorDict[colorKey].c; labelRepeat = {}; }

		for (let i = 0; i < numPics; i++) {
			let item = items[i];
			let info = item.info; //infos[i];
			let label = item.label; //labels[i];
			let iRepeat = labelRepeat[label];
			if (nundef(iRepeat)) iRepeat = 1; else iRepeat += 1;
			labelRepeat[label] = iRepeat;
			let bg = item.bg; //bgs[i];
			let ipic = (line * picsPerLine + i);
			// if (ipic % picsPerLine == 0 && ipic > 0) {console.log('linebreak!',ipic,line,keys.length); mLinebreak(dParent);}
			if (ipic % picsPerLine == 0 && ipic > 0) { mLinebreak(dParent); }
			let id = 'pic' + ipic; // (line * keys.length + i);
			let d1 = maPicLabelButtonFitText(info, label,
				{ w: pictureSize, h: pictureSize, bgPic: bg, textShadowColor: textShadowColor, contrast: contrast, sPic: sPic },
				onClickPictureHandler, dParent, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
			d1.id = id;

			// console.log('---->',d1.children[0].children[0].style.fontSize)
			//addRowColInfo(d1,line,i,pictureSize);
			if (showRepeat) addRepeatInfo(d1, iRepeat, pictureSize);
			let fzPic = firstNumber(d1.children[0].children[0].style.fontSize);
			pics.push({
				textShadowColor: textShadowColor, color: ColorDict[colorKey], colorKey: colorKey, key: info.key, info: info,
				bg: bg, div: d1, id: id, sz: pictureSize, fzPic: fzPic,
				index: ipic, row: line, col: i, iRepeat: iRepeat, label: label, isLabelVisible: true, isSelected: false
			});
		}
	}
	return pics;
}



















