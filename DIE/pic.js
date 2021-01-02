//#region NEW
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
			}else if (arrLast(propsUsed) == 'label'){
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
		let op = (G.numRepeat > 2 && val > 1 && val < G.numRepeat) ? chooseRandom(['<=', '>=', '=']) : chooseRandom(['=', '!=']);
		//op = '!=';
		lstSpoken = lstSpoken.concat(['with', props[prop].friendly, OPS[op].sp, val]);
		lstWritten = ['with', props[prop].friendly, op, val];

		piclist = allPics.filter(x => OPS[op].f(x[prop], val));

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
			let op = (G.numRepeat > 2 && val > 1 && val < G.numRepeat) ? chooseRandom(['<=', '>=', '=']) : chooseRandom(['=', '!=']);
			//op = '!=';
			lstSpoken = lstSpoken.concat(['with', props[prop].friendly, OPS[op].sp, val]);
			lstWritten = ['eliminate', 'all', 'with', props[prop].friendly, op, val];

			piclist = allPics.filter(x => OPS[op].f(x[prop], val));

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
function colorPrepper(val) { return `<span style="color:${val}">${ColorDict[val][Settings.language].toUpperCase()}</span>`; }
function labelPrepper(val) { return `<b>${val.toUpperCase()}</b>`; }
function logicCheck(pic) {
	//should return true if pic is part of set to be clicked and remove that pic
	//return false if that pic does NOT belong to piclist
}
function logicReset() {
	//resets piclist;
}





function showPictures(onClickPictureHandler, { showRepeat = false, sz, bgs, colorKeys, contrast, repeat = 1,
	sameBackground = true, border, textColor, fz = 20 } = {}, keys, labels) {
	Pictures = [];
	if (nundef(keys)) keys = choose(G.keys, G.numPics);
	//keys=['toolbox','tiger']; //keys[0] = 'butterfly'; //keys[0]='man in manual wheelchair';	//keys=['sun with face'];

	Pictures = maShowPictures(keys, labels, dTable, onClickPictureHandler,
		{
			showRepeat: showRepeat, picSize: sz, bgs: bgs, repeat: repeat, sameBackground: sameBackground, border: border,
			lang: Settings.language, colorKeys: colorKeys, contrast: contrast
		});

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
		if (!pic.isLabelVisible) break;
	}
	div.style.transition = null;
	div.style.backgroundColor = pic.bg;
	pic.isFaceUp = true;
}
function toggleFace(pic) { if (pic.isFaceUp) turnFaceDown(pic); else turnFaceUp(pic); }

//#region selection of picture
function toggleSelectionOfPicture(pic, selectedPics) {
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























