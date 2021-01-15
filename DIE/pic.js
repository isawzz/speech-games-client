function showPicturesSpeechTherapyGames(onClickPictureHandler, ifs = {}, options = {}, keys, labels) {
	if (!EXPERIMENTAL) { return showPicturesSpeechTherapyGamesWORKING(...arguments); }
	Pictures = [];
	//#region prelim: default ifs and options, keys & infos
	//console.log('ifs', jsCopy(ifs)); console.log('options', jsCopy(options));

	if (nundef(keys)) keys = choose(G.keys, G.numPics);
	//keys=['eye'];//['toolbox','tiger']; //keys[0] = 'butterfly'; //keys[0]='man in manual wheelchair';	//keys=['sun with face'];
	// keys=['house','socks','hammer'];

	// let showLabels = Settings.labels == true;
	let infos = keys.map(k => (isdef(Settings.language) ? getRandomSetItem(Settings.language, k) : symbolDict[k]));
	//ifs and options: defaults
	let bg = isdef(options.colorKeys) ? 'white' : (i) => options.sameBackground ? computeColor('random') : 'random';
	let fg = (i, info, item) => colorIdealText(item.bg);
	let defIfs = { bg: bg, fg: fg, label: isdef(labels) ? labels : (i, info) => info.best, contrast: .32, fz: 20, padding:10 };
	let defOptions = { showLabels:Settings.labels==true, shufflePositions: true, sameBackground: true, showRepeat: false, repeat: 1, onclick: onClickPictureHandler, iStart: 0 };
	ifs = deepmergeOverride(defIfs, ifs);
	options = deepmergeOverride(defOptions, options);
	//console.log('keys', keys); console.log('ifs', ifs); 
	//console.log('options', options);
	//#endregion

	//#region phase1: make items: hier jetzt mix and match
	let items = zItems(infos, ifs, options);
	if (options.repeat > 1) items = zRepeatEachItem(items, options.repeat, options.shufflePositions);
	if (isdef(options.colorKeys)) items = zRepeatInColorEachItem(items, options.colorKeys);
	items.map(x => x.label = x.label.toUpperCase());
	Pictures = items;
	//items.map(x=>console.log(x));
	//#endregion phase1

	//#region phase2: prepare items for container
	let [sz, rows, cols] = calcRowsColsSize(items.length, isdef(options.colorKeys) ? options.colorKeys.length : undefined);
	if (nundef(options.sz)) options.sz=sz;
	if (nundef(options.rows)) options.rows=rows;
	if (nundef(options.cols)) options.cols=cols;
	items.map(x => x.sz = sz);
	prep1(items,ifs,options);
	//#endregion

	//#region phase3: prep container for items
	mClass(dTable, 'flexWrap');
	//#endregion

	//#region phase4: add items to container!
	let dGrid = mDiv(dTable);
	items.map(x => mAppend(dGrid, x.div));
	let gridStyles = { 'place-content': 'center', gap: 4, margin: 4, padding: 4 };
	let gridSize = layoutGrid(items, dGrid, gridStyles, { rows: rows, isInline: true });
	// console.log('size of grid',gridSize,'table',getBounds(dTable))

	//#endregion

	//console.log('*** THE END ***', Pictures[0]);
}
function showPicturesSpeechTherapyGamesWORKING(onClickPictureHandler, ifs = {}, options = {}, keys, labels) {

	Pictures = [];
	if (nundef(keys)) keys = choose(G.keys, G.numPics);
	//keys=['eye'];//['toolbox','tiger']; //keys[0] = 'butterfly'; //keys[0]='man in manual wheelchair';	//keys=['sun with face'];
	keys = ['house', 'socks', 'hammer'];


	let defIfs = { contrast: .32, fz: 20, label: isdef(labels) ? labels : (i, info) => info.best };
	let defOptions = { showRepeat: false, repeat: 1, sameBackground: true, onclick: onClickPictureHandler };
	ifs = deepmergeOverride(defIfs, ifs);
	options = deepmergeOverride(defOptions, options);
	console.log('.')

	Pictures = zShowPictures1(keys, ifs.label, dTable, onClickPictureHandler,
		{
			showRepeat: options.showRepeat, picSize: ifs.sz, bg: ifs.bg, repeat: options.repeat, sameBackground: options.sameBackground, border: ifs.border,
			lang: Settings.language, colorKeys: options.colorKeys, contrast: ifs.contrast
		});
	// Pictures = maShowPictures(keys, labels, dTable, onClickPictureHandler,
	// 	{
	// 		showRepeat: showRepeat, picSize: sz, bg: bg, repeat: repeat, sameBackground: sameBackground, border: border,
	// 		lang: Settings.language, colorKeys: colorKeys, contrast: contrast
	// 	});

	// label hiding
	let totalPics = Pictures.length;
	if (showLabels) {
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


//#region logic selectors (game: Elim!)
function logicMulti(n) {
	let allPics = Pictures;
	let maxPics = 4;
	let [s1, w1, pics1, prop1] = logicFilter(allPics, []);
	let [s, w, pics, prop] = [s1, w1, pics1, prop1];
	let maxloop = 3; cntloop = 0; let propsUsed = [prop1];
	//console.log('______', cntloop, ': prop', prop, '\n', s, '\n', w, '\n', jsCopy(pics));
	while (pics.length > maxPics && cntloop < maxloop) {
		cntloop += 1;
		let opp = arrMinus(allPics, pics);
		if (opp.length <= maxPics) {
			let lst = ['eliminate', 'all', 'EXCEPT'];
			if (Settings.language == 'D') lst = lst.map(x => DD[x]);
			let prefix = lst.join(' ');
			s = prefix + ' ' + s;
			w = prefix + ' ' + w;
			return [s, w, opp];
		}
		//apply another filter!
		[s1, w1, pics1, prop1] = logicFilter(pics, propsUsed);
		if (isEmpty(pics1)) return [s, w, pics];
		else {
			//need to concat!
			pics = pics1;
			prop = prop1;
			if (prop1 == 'label') {
				s = s1 + ' ' + s;
				w = w1 + ' ' + w;
			} else if (arrLast(propsUsed) == 'label') {
				let conn = Settings.language == 'E' ? ' with ' : ' mit ';
				s1 = s1.substring(s1.indexOf(' '));
				w1 = w1.substring(w1.indexOf(' '));
				s = s + conn + s1; w = w + conn + w1;
			} else {
				let conn = Settings.language == 'E' ? ' and ' : ' und ';
				s1 = s1.substring(s1.indexOf(' '));
				w1 = w1.substring(w1.indexOf(' '));
				s = s + conn + s1; w = w + conn + w1;
			}
			propsUsed.push(prop1);
			//console.log('______', cntloop, ': prop', prop, '\n', s, '\n', w, '\n', jsCopy(pics));
		}
		// console.log('______1: prop', prop, '\n', s, '\n', w, '\n', jsCopy(pics));
	}
	//console.log('fehler!')

	let lst1 = ['eliminate', 'all'];
	if (Settings.language == 'D') lst1 = lst1.map(x => DD[x]);
	let prefix = lst1.join(' ');
	s = prefix + ' ' + s;
	w = prefix + ' ' + w;
	return [s, w, pics];
}
function logicFilter(allPics, exceptProps) {
	//should return sSpoken,sWritten,piclist and set Goal
	let props = { label: { vals: getDistinctVals(allPics, 'label'), friendly: '' } };
	if (G.numColors > 1) props.colorKey = { vals: getDistinctVals(allPics, 'colorKey'), friendly: 'color' };
	if (G.numRepeat > 1) props.iRepeat = { vals: getDistinctVals(allPics, 'iRepeat'), friendly: 'number' };

	//console.log('props:::::', Object.keys(props), '\nexcept', exceptProps);
	if (sameList(Object.keys(props), exceptProps)) return ['no props left', 'no', [], 'unknown'];
	//console.log('props', props)

	//level 0: eliminate all backpacks | eliminate all with color=blue | elim all w/ number=2
	let lstSpoken, lstWritten, piclist = [];
	let prop = chooseRandom(arrWithout(Object.keys(props), exceptProps));
	//console.log('prop is', prop, 'vals', props[prop].vals)
	let val = chooseRandom(props[prop].vals);
	//console.log('val chosen', val)
	//val = chooseRandom(myProps[prop])
	//prop = 'iRepeat'; val = 2;

	lstSpoken = [];
	if (prop == 'label') {
		lstSpoken.push(val);// + (Settings.language == 'E' ? 's' : ''));
		lstWritten = [labelPrepper(val)];
		piclist = allPics.filter(x => x.label == val);
	} else if (prop == 'colorKey') {
		lstSpoken = lstSpoken.concat(['with', props[prop].friendly, ColorDict[val][Settings.language]]);
		lstWritten = ['with', props[prop].friendly, colorPrepper(val)];
		piclist = allPics.filter(x => x[prop] == val);
	} else if (prop == 'iRepeat') {
		let op = (G.numRepeat > 2 && val > 1 && val < G.numRepeat) ? chooseRandom(['leq', 'geq', 'eq']) : chooseRandom(['eq', 'neq']);
		//op = '!=';
		let oop = OPS[op];
		lstSpoken = lstSpoken.concat(['with', props[prop].friendly, oop.sp, val]);
		lstWritten = ['with', props[prop].friendly, oop.wr, val];

		piclist = allPics.filter(x => oop.f(x[prop], val));

	}
	//console.log(lstSpoken)

	if (nundef(lstWritten)) lstWritten = lstSpoken;
	let s = lstSpoken.join(' ');
	let w = lstWritten.join(' ');
	// console.log('w',w)
	if (Settings.language == 'D') {
		// let x=s.split(' ');
		// console.log(x)
		s = s.split(' ').map(x => translateToGerman(x)).join(' ');
		w = w.split(' ').map(x => translateToGerman(x)).join(' ');
		// lstSpoken = lstSpoken.map(x => DD[x]);
		// lstWritten = lstWritten.map(x => DD[x]);
	}
	//console.log('s', s, '\nw', w)
	return [s, w, piclist, prop];

}

function logicSetSelector(allPics) {
	//should return sSpoken,sWritten,piclist and set Goal
	let props = { label: { vals: getDistinctVals(allPics, 'label'), friendly: '' } };
	if (G.numColors > 1) props.colorKey = { vals: getDistinctVals(allPics, 'colorKey'), friendly: 'color' };
	if (G.numRepeat > 1) props.iRepeat = { vals: getDistinctVals(allPics, 'iRepeat'), friendly: 'number' };

	//console.log('props', props)

	//level 0: eliminate all backpacks | eliminate all with color=blue | elim all w/ number=2
	let lstSpoken, lstWritten, piclist = [];
	if (G.level >= 0) {
		let prop = chooseRandom(Object.keys(props));
		//console.log('prop is', prop, 'vals', props[prop].vals)
		let val = chooseRandom(props[prop].vals);
		//console.log('val chosen', val)
		//val = chooseRandom(myProps[prop])
		prop = 'iRepeat'; val = 2;

		lstSpoken = ['eliminate', 'all'];
		if (prop == 'label') {
			lstSpoken.push(val);// + (Settings.language == 'E' ? 's' : ''));
			lstWritten = ['eliminate', 'all', labelPrepper(val)];
			piclist = allPics.filter(x => x.label == val);
		} else if (prop == 'colorKey') {
			lstSpoken = lstSpoken.concat(['with', props[prop].friendly, val]);
			lstWritten = ['eliminate', 'all', 'with', props[prop].friendly, colorPrepper(val)];
			piclist = allPics.filter(x => x[prop] == val);
		} else if (prop == 'iRepeat') {
			let op = (G.numRepeat > 2 && val > 1 && val < G.numRepeat) ? chooseRandom(['leq', 'geq', 'eq']) : chooseRandom(['eq', 'neq']);
			//op = '!=';
			let oop = OPS[op];
			lstSpoken = lstSpoken.concat(['with', props[prop].friendly, oop.sp, val]);
			lstWritten = ['eliminate', 'all', 'with', props[prop].friendly, oop.wr, val];

			piclist = allPics.filter(x => oop.f(x[prop], val));

		}
		//console.log(lstSpoken)
	}

	if (G.level > 0 && piclist.length > allPics.length / 2) {
		//lstSpoken.insert('except',2)
		lstSpoken.splice(2, 0, 'except');
		lstWritten.splice(2, 0, 'EXCEPT');
		piclist = allPics.filter(x => !(piclist.includes(x)));
	}

	if (nundef(lstWritten)) lstWritten = lstSpoken;
	let s = lstSpoken.join(' ');
	let w = lstWritten.join(' ');
	// console.log('w',w)
	if (Settings.language == 'D') {
		// let x=s.split(' ');
		// console.log(x)
		s = s.split(' ').map(x => translateToGerman(x)).join(' ');
		w = w.split(' ').map(x => translateToGerman(x)).join(' ');
		// lstSpoken = lstSpoken.map(x => DD[x]);
		// lstWritten = lstWritten.map(x => DD[x]);
	}
	console.log('s', s, '\nw', w)
	return [s, w, piclist];

}
function colorPrepper(val) {

	return `<span style="color:${ColorDict[val].c}">${ColorDict[val][Settings.language].toUpperCase()}</span>`;
}
function labelPrepper(val) { return `<b>${val.toUpperCase()}</b>`; }
function logicCheck(pic) {
	//should return true if pic is part of set to be clicked and remove that pic
	//return false if that pic does NOT belong to piclist
}
function logicReset() {
	//resets piclist;
}
//#endregion

//#region card face up or down
function turnFaceDown(pic) {
	let ui = pic.div;
	for (const p1 of ui.children) p1.style.opacity = 0; //hide(p1);
	ui.style.backgroundColor = 'dimgray';
	pic.isFaceUp = false;

}
function turnFaceUp(pic) {
	let div = pic.div;
	for (const ch of div.children) {
		ch.style.transition = `opacity ${1}s ease-in-out`;
		ch.style.opacity = 1; //show(ch,true);
		//if (!pic.isLabelVisible) break;
	}
	div.style.transition = null;
	div.style.backgroundColor = pic.bg;
	pic.isFaceUp = true;
}
function toggleFace(pic) { if (pic.isFaceUp) turnFaceDown(pic); else turnFaceUp(pic); }

//#region selection of picture
function toggleSelectionOfPicture(pic, selectedPics) {

//	console.log(pic)

	let ui = pic.div;
	//if (pic.isSelected){pic.isSelected=false;mRemoveClass(ui,)}
	pic.isSelected = !pic.isSelected;
	if (pic.isSelected) mClass(ui, 'framedPicture'); else mRemoveClass(ui, 'framedPicture');

	//if piclist is given, add or remove pic according to selection state
	if (isdef(selectedPics)) {
		if (pic.isSelected) {
			console.assert(!selectedPics.includes(pic), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
			selectedPics.push(pic);
		} else {
			console.assert(selectedPics.includes(pic), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
			removeInPlace(selectedPics, pic);
		}
	}
}























