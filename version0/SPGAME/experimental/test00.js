function test12_vizOperationOhneParentDiv(){
	let elem =  visOperation('plus',5,2, null);
	console.log('elem',elem);
	mAppend(dTable,elem);
}
function test12_vizNumberOhneParentDiv(){
	let elem =  visNumber(5, null, 'black');
	console.log('elem',elem);
	mAppend(dTable,elem);
}
function test12_vizArithop(){
	for(let i=0;i<4;i++){
		let a=randomNumber(0,10);
		let op=chooseRandom(['plus','minus','mult']);
		let b=op=='minus'?randomNumber(0,a):op == 'mult'?randomNumber(1,3):randomNumber(0,10);
		visOperation(op,a,b,dTable,'?');
		mLinebreak(dTable,40);
		//break;
	}
}
function test12_vizAddition(){
	for(let i=0;i<4;i++){
		visualizeAddition(9,randomNumber(0,10));
		mLinebreak(dTable,40);
		break;
	}
}
function test11_zViewerCircleIcon() {
	ensureSymByType();
	let keys = symKeysByType.icon;
	keys = keys.filter(x => x.includes('circle'));
	zViewer(keys);
}
function test10_zViewerClockCrownFactory() {
	ensureSymByType();
	let keys = symKeysByType.icon;
	keys = keys.filter(x => x.includes('indus') || x.includes('clock') || x.includes('tim') || x.includes('watch') || x.includes('crown') || x.includes('factory'));
	zViewer(keys);
}
function test09_zViewer() {
	ensureSymByType();
	let keys = symKeysByType.icon;
	zViewer(keys);
}
function test08_towerAndOtherSymbols(dParent) {
	let sdict = {
		tower: { k: 'white-tower', bg: 'dimgray' }, clock: { k: 'watch', bg: 'navy' }, crown: { k: 'crown', bg: 'black' },
		tree: { k: 'tree', bg: GREEN },
		bulb: { k: 'lightbulb', bg: 'purple' }, factory: { k: 'factory', bg: 'red' }
	};

	for (const sym of ['tower', 'clock', 'crown', 'tree', 'bulb', 'factory']) {
		let key = sdict[sym].k;
		let pic = zPic(key, dParent, { sz: 40, bg: sdict[sym].bg, rounding: '10%', margin: 10 });
		//console.log(pic.outerDims, pic.innerDims, pic.info);
		console.log(pic);

	}
}

function test07_showDeck(dParent) {
	let keys = getRandomCards(5, { type: 'inno', color: 'purple' }); console.log(keys);
	showDeck(keys, dParent, 'left', 100)
	keys = getRandomCards(5, { type: 'inno', color: 'green' }); console.log(keys);
	showDeck(keys, dParent, 'left', 100)
	keys = getRandomCards(5, { type: 'inno', color: 'blue' }); console.log(keys);
	showDeck(keys, dParent, 'left', 100)
	keys = getRandomCards(5, { type: 'inno', color: 'yellow' }); console.log(keys);
	showDeck(keys, dParent, 'left', 100)
	keys = getRandomCards(5, { type: 'inno', color: 'purple' }); console.log(keys);
	showDeck(keys, dParent, 'left', 100)


}
function test06_showCards(dParent) {
	let keys = getRandomCards(5, { type: 'inno', color: 'purple' }); console.log(keys);
	showInnoCards(keys, dParent);

}
function test05_ElectricitySuburbia(dParent) {
	let keys1 = ['Electricity', 'Suburbia']
	for (const k of keys1) {
		let c = cardInno(k); console.log(c); mAppend(dParent, c.div);
		c = cardInnoSZ(k); console.log(c); mAppend(dParent, c.div);
		c = cardInnoz(k); console.log(c); mAppend(dParent, c.div);
	}

}
function test04_Electricity(dParent) {
	let c = cardInnoz('Electricity'); console.log(c); mAppend(dParent, c.div);
	//let res = zPic('lightbulb',dParent,{sz:40,bg:'green',rounding:'50%'}); 
	//console.log(res.outerDims,res.innerDims)
}

function test03_lighbulb(dParent) {
	let res = zPic('lightbulb', dParent, { sz: 40, bg: 'green', rounding: '50%' });
	console.log(res.outerDims, res.innerDims)
}
function test02_zPic(dParent) {
	let sz = 200; gap = 50;
	let res = zPic('lightbulb', dParent, { bg: 'green', padding: gap, rounding: '50%', w: sz, h: sz });
	console.log(res.outerDims, res.innerDims, 'sz', sz)

	gap = 5;
	res = zPic('lightbulb', dParent, { bg: 'green', padding: gap, rounding: '50%', w: sz, h: sz });

	console.log(res.outerDims, res.innerDims, 'sz', sz)
	console.log(res);

}
function test01_oldMaPicAusgleichVonPadding(dParent) {
	let sz = 200; gap = 50;
	let res = _zPicPaddingAddedToSize('lightbulb', dParent, { bg: 'green', padding: gap, rounding: '50%', w: sz, h: sz });
	console.log(res.outerDims, res.innerDims, 'sz', sz)

	gap = 5;
	res = _zPicPaddingAddedToSize('lightbulb', dParent, { bg: 'green', padding: gap, rounding: '50%', w: sz, h: sz });

	console.log(res.outerDims, res.innerDims, 'sz', sz)
	console.log(res);

}
function test00_oldMaPic(dParent) {
	let sz = 100; gap = 50;
	let res = _zPicPaddingAddedToSize('lightbulb', dParent, { bg: 'green', padding: gap, rounding: '50%', w: sz, h: sz });
	console.log(res.outerDims, res.innerDims, 'sz', sz)

	sz = 190; gap = 5;
	res = _zPicPaddingAddedToSize('lightbulb', dParent, { bg: 'green', padding: gap, rounding: '50%', w: sz, h: sz });

	console.log(res.outerDims, res.innerDims, 'sz', sz)
	console.log(res);

}

function zItemsForViewer(keys, labelFunc, { sz, padding = 4 }, iStart = 0) {
	//an item is a div with a pic and possibly a label underneath
	sz = isdef(sz) ? sz : 100;
	szNet = sz - 2 * padding;
	let labeled = isdef(labelFunc);

	//als erstes items machen
	let items = [];
	let longestLabel = '';
	let maxlen = 0;
	let label;
	for (let i = 0; i < keys.length; i++) {
		let k = keys[i];
		let item = { key: k, info: symbolDict[k], index: i, iGroup: iStart };
		if (isList(labelFunc)) label = labelFunc[i % labelFunc.length];
		else if (typeof (labelFunc) == 'function') label = labelFunc(k, item.info);
		else label = null;

		if (isdef(label)) {
			let tlen = label.length;
			if (tlen > maxlen) { maxlen = tlen; longestLabel = label; }
			item.label = label;
		}
		items.push(item);
	}

	//jedes item hat jetzt ein label,info,index,key

	//als erstes das label produzieren und checken wieviel platz es braucht
	//console.log(longestLabel)
	let textStyles = idealFontsize(longestLabel, szNet, szNet / 2, 20, 4);

	let hText = textStyles.h;
	let hPic = szNet - hText; //Math.max(sz - hText,sz/4);
	let pictureSize = hPic;
	let picStyles = { w: pictureSize, h: pictureSize, bg: 'white', fg: 'random' };

	textStyles.fg = 'gray';
	delete textStyles.h;

	let outerStyles = { w: sz, h: sz, padding: padding, bg: 'white', align: 'center', 'box-sizing': 'border-box' };
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		let k = item.key;

		let text = zText(item.label, null, textStyles, hText);

		let pic = zPic(k, null, picStyles, true, false);
		delete pic.info;

		let d = mDiv();
		mAppend(d, pic.div);
		mAppend(d, text.div);
		mStyleX(d, outerStyles);

		// set padding according to text size, truncate text if not enough space
		if (text.extra < -padding && text.lines >= 3) {
			mClass(text.div, 'maxLines2');
		} else {
			d.style.padding = text.extra == 0 ? padding + 'px' : ('' + (padding + text.extra / 2) + 'px ' + padding + 'px ');
		}

		d.id = 'pic' + (i + iStart);

		//complete item info
		item.div = d;
		item.pic = pic;
		if (labeled) item.text = text;
		item.isSelected = false;
		item.dims = parseDims(sz, sz, d.style.padding);
		item.bg = d.style.backgroundColor;
		item.fg = text.div.style.color;

	}
	return items;
}
function zItemsFromPictures(keys, labels, { lang, bgs, colorKeys, textColor, sameBackground, repeat = 1, shufflePositions = true }) {
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
		let bg = isList(bgs) ? bgs[i] : isdef(colorKeys) ? 'white' : sameBackground ? computeColor('random') : 'random';
		let fg = isList(fgText) ? fgText[i] : colorIdealText(bg);
		let label = isList(labels) ? labels[i] : isdef(lang) ? info.best : k;
		itKeys.push({ key: k, info: info, label: label, bg: bg, fg: fg }); //, iRepeat: 1 }); // not necessary! done in next step!
	}
	//repeat items
	let itRepeat = [];
	for (let i = 0; i < repeat; i++) {
		let items = jsCopy(itKeys);
		itRepeat = itRepeat.concat(items);
	}
	if (shufflePositions) { shuffle(itRepeat); }

	//weil die items schon geshuffled wurden muss ich iRepeat neu setzen in den reihenfolge in der sie in itRepeat vorkommen!
	let labelRepeat = {};
	for (const item of itRepeat) {
		let iRepeat = labelRepeat[item.label];
		if (nundef(iRepeat)) iRepeat = 1; else iRepeat += 1;
		item.iRepeat = iRepeat;
		labelRepeat[item.label] = iRepeat;
	}
	//copy colors.length times into different colors

	let itColors = [];
	if (isdef(colorKeys)) {
		for (let line = 0; line < colorKeys.length; line++) {
			let newItems = jsCopy(itRepeat);
			let colorKey = colorKeys[line];
			let textShadowColor = ColorDict[colorKey].c;
			newItems.map(x => { x.textShadowColor = textShadowColor; x.color = ColorDict[colorKey]; x.colorKey = colorKey; });
			itColors = itColors.concat(newItems);
		}
	} else {
		itColors = itRepeat;
	}

	return itColors;
}

function visualizeNumber(n,dParent, color) {

	//moecht ein kleines grid mit inside n dots in random colors

	//#region prelim: keys,labels,ifs,options
	let keys=new Array(n).fill('plain-circle');
	let options = {repeat:n, showLabels:false};
	let infos = keys.map(x => symbolDict[x]);
	let ifs = {fg:color}

	//#endregion

	//#region phase1: make items: hier jetzt mix and match
	let items = zItems(infos, ifs, options);
	//items.map(x=>console.log(x));
	//#endregion phase1

	//#region phase2: prepare items for container
	// let [options.sz,options.rows,options.cols] = calcRowsColsSize(n,null,null,null,200,200);//(n, lines, cols, dParent, wmax, hmax)
	// console.log(options)
	let [sz, rows, cols] = calcRowsColsSize(items.length);
	sz=25;
	if (nundef(options.sz)) options.sz = sz;
	if (nundef(options.rows)) options.rows = rows;
	if (nundef(options.cols)) options.cols = cols;
	items.map(x => x.sz = options.sz);
	prep1(items, ifs, options);


	//#endregion

	//#region phase3: prep container for items

	//#endregion

	//#region phase4: add items to container!
	let dGrid = mDiv(dParent);
	items.map(x => mAppend(dGrid, x.div));
	let gridStyles = { 'place-content': 'center', gap: 4, margin: 4, padding: 4, bg:'white', rounding:10 };
	let gridSize = layoutGrid(items, dGrid, gridStyles, { rows: options.rows, isInline: true });
	//console.log('size of grid', gridSize, 'table', getBounds(dTable))
	//#endregion

	//console.log('*** THE END ***');
	return dGrid;
}
function visualizeAritOp(op,a,b){
	//opKey is one of the keys in OPS (plus, minus,mult,) or the object OPS[key]
	op = isString(op)? OPS[op]:op;
	let dx=mDiv(dTable);
	mFlex(dx);
	mStyleX(dx,{'align-items':'center',gap:16});
	let d1=a==0?zText(op.wr,dx,{fg:'white',fz:64}):visualizeNumber(a,dx,'blue');
	// d1=visualizeNumber(a,dx,'blue');
	dop=zText(op.wr,dx,{fg:'white',fz:64});
	let d2=b==0?zText(op.wr,dx,{fg:'white',fz:64}):visualizeNumber(b,dx,'green');
	deq=zText('=',dx,{fg:'white',fz:64});
	let result = op.f(a,b);
	//d3=visualizeNumber(result,dx,'red');
	let d3=b==0?zText(result,dx,{fg:'white',fz:64}):visualizeNumber(result,dx,'red');

	// console.log('_________',getBounds(d3));
	//dop und deq muessen size adjusted werden!!!
	//brauch das extra!!!!
	//d3=joinDivs(d1,d2);
	//console.log('res',d3)
}
function visualizeAddition(a,b){
	let dx=mDiv(dTable);
	mFlex(dx);
	mStyleX(dx,{'align-items':'center',gap:16});
	d1=visualizeNumber(a,dx,'blue');
	dop=zText('+',dx,{fg:'white',fz:64});
	d1=visualizeNumber(b,dx,'green');
	deq=zText('=',dx,{fg:'white',fz:64});
	d2=visualizeNumber(a+b,dx,'red');

	console.log('_________',getBounds(d2));
	//dop und deq muessen size adjusted werden!!!
	//brauch das extra!!!!
	//d3=joinDivs(d1,d2);
	//console.log('res',d3)
}
function joinDivs(d1,d2){
	let d=mDiv(dTable);
	mStyleX(d,{bg:'white',rounding:10,padding:20});
	mAppend(d,d1);
	mAppend(d,d2);
	return d;

	console.log(d1)
	let parent = d1.parentNode;
	let dSum=mDiv(parent);
	let d1New = d1.cloneNode();
	let d2New = d2.cloneNode();
	mAppend(dSum,d1New);
	mAppend(dSum,d2New);
	dSum.style.backgroundColor = d1.style.backgroundColor;
}
