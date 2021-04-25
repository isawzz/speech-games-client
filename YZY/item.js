//#region syms item + div + dPic + dLabel
function addLabels(items, lang = 'E', luc = 'c') {
	for (const item of items) {
		let label = item.info[lang];
		item.label = luc == 'c' ? toNoun(label) : luc == 'l' ? label : label.toUpperCase();
	}
}
function addRepeatInfo(dPic, iRepeat, wpic) {
	//console.log(dPic,iRepeat,szPic)
	let szi = Math.max(Math.floor(wpic / 8), 8);
	//console.log(szi);
	dPic.style.position = 'relative';
	let d2 = mText('' + iRepeat, dPic, { fz: szi, weight: 'bold', fg: 'contrast', position: 'absolute', left: szi / 2, top: szi / 2 - 2 });
	// let d3 = mText('col:' + col, dPic, { fz: szi, color: 'black', position: 'absolute', left: szi, top: (szi / 2 + szi + 2) })
	return d2;
}
function applyColorkey(item) {
	//console.log('halllllllllllll')
	let l = item.live;
	let sShade = '0 0 0 ' + item.textShadowColor;
	item.shadeStyles = { 'text-shadow': sShade, fg: anyColorToStandardString('black', l.options.contrast) };
	let ui = l.options.showPic ? l.dPic : l.dLabel;
	mStyleX(ui, item.shadeStyles);
}
function _extendItemsAndOptions(items, options) {
	//relevant props are: luc, numRepeat, colorKeys, ifs + item.label
	//ifs:
	// => alle ifs props werden in items copiert vordem items mit numRepeat und colorKeys expanded werden!
	// => ifs kann bg, fg, ... auch als func(index,item,options,items) (index,items sind input param)
	options.longestLabel = findLongestWord(items.map(x => x.label));
	options.wLongest = extendWidth(options.longestLabel);

	//hier koennt ich die ifs machen!
	let ifs = options.ifs;
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		item.index = i;
		//item.ifs = jsCopy(options.ifs);
		let val;
		for (const propName in ifs) {
			let prop = ifs[propName];
			//console.log('___________',ifs[propName])
			//console.log('TYPE OF', propName, 'IS', typeof prop, prop, isLiteral(prop))
			if (isLiteral(prop)) val = prop;
			else if (isList(prop)) val = prop[i % prop.length];
			else if (typeof (prop) == 'function') val = prop(i, item, options, items);
			else val = null;
			if (isdef(val)) item[propName] = val;
			//console.log('ifs prop:',propName,item[propName]);
		}
	}
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',items.map(x=>x.label))

	if (options.numRepeat > 1) { items = zRepeatEachItem(items, options.numRepeat, options.shufflePositions); }
	if (isdef(options.colorKeys)) items = zRepeatInColorEachItem(items, options.colorKeys);

	options.N = items.length;
	//console.log(items)
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',items.map(x=>x.label))
	return items;
}
function evToItem(ev) { let id = evToClosestId(ev); return isdef(id) ? Items[id] : null; }
function evToItemC(ev) { ev.cancelBubble = true; return evToItem(ev); }
function findItemFromEvent(items, ev) { return evToItemC(ev); }
function findItemFromElem(items, elem) { let item = firstCond(items, x => iDiv(x) == elem); return item; }
function findItemFromKey(items, key) { return firstCond(items, x => x.key == key); }

function registeredItemCopy(orig) { let item = jsCopy(orig); item.id = iRegister(item); return item; }
function registerAsNewItem(item) { item.id = iRegister(item); return item; }

function genItems(n, options) { let keys = genKeys(n, options); let items = genItemsFromKeys(keys, options); return items; }
function genItemsFromKeys(keys, options) {
	//console.log('keys',keys)
	let items = [];
	for (const k of keys) {
		console.assert(isdef(Syms[k]), 'key not found: ' + k);
		let info = Syms[k];
		let item = infoToItem(info);
		items.push(item);
	}
	//let items = keys.map(x => infoToItem(Syms[x]));

	//console.log(options.language,options.luc)
	addLabels(items, options.language, options.luc);

	//console.log('items',items)
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',items.map(x=>x.label))

	items = _extendItemsAndOptions(items, options);
	return items;
}
function genItemsFromObjects(list, keyProp, labelProp, options) {
	//console.log('list',list)
	let keys = [];
	for (const l of list) keys.push(l[keyProp]);
	let items = list.map(x => infoToItem(Syms[x[keyProp]]));
	let i = 0, luc = options.luc;
	for (const item of items) {
		let label = list[i][labelProp];
		//console.log(label);
		item.o = list[i];
		//console.log('item.o',list[i])
		item.label = luc == 'c' ? toNoun(label) : luc == 'l' ? label : label.toUpperCase();
		i += 1;
	}
	//console.log(items)
	items = _extendItemsAndOptions(items, options);
	return items;
}
function genKeys(n, options) {
	let [maxlen, lang, keySet] = [options.maxlen, options.language, options.keySet];
	let cond = isdef(maxlen) ? ((x) => x[lang].length <= maxlen) : null;
	let keys = _getKeysCond(n, cond, keySet);
	return keys;
}
function _getKeysCond(n, cond, keySet = 'all') {
	//console.log('n', n, 'cond', cond, 'keySet', keySet)
	if (isString(keySet)) keySet = KeySets[keySet];
	let keys = isdef(cond) ? isString(cond) ?
		isdef(KeySets[cond]) ? KeySets[cond] : keySet.filter(x => x.includes(cond))
		: keySet.filter(x => cond(Syms[x])) : keySet;
	keys = n >= keys.length ? keys : choose(keys, n);
	return keys;
}
function getItem(k) { return infoToItem(Syms[k]); }
function getAllItems(cond, keySet = 'all') { return getItems(10000, cond, keySet); }
function getItems(n, cond, keySet = 'all') {
	//n ... number, key list, info list or item list
	//cond ... undefined, string(KeySet or search SymKeys) or function(filter SymKeys)
	if (isNumber(n)) { n = _getKeysCond(n, cond, keySet); }

	//n is now list of keys! here i can 
	if (isString(n[0])) n = n.map(x => Syms[x]);
	if (nundef(n[0].info)) n = n.map(x => infoToItem(x));
	return n;
}
function getItemsMaxLen(n, len, keySet = 'all', lang = 'E', luc = 'c') { return getItemsMaxWordLength(...arguments); }
function getItemsMaxWordLength(n, len, keySet = 'all', lang = 'E', luc = 'c') {
	//assumes adding the labels in that language!
	let items = getItems(n, x => x[lang].length <= len, keySet); // cond is on Syms object!!!
	addLabels(items, lang, luc);
	return items;
}

function getNItemsPerKeylist(n, keylists, options = {}) {
	let items = [];
	// let nRandom = nTotal - (keylists.length*n);
	// let indices = range(0,keylists.length-1);
	// shuffle(indices);
	// console.log('indices',indices);
	// for(const i of indices){
	// 	let list = keylists[i];
	// 	options.keySet = list.keys;
	// 	let cat = list.cat;
	// 	//console.log('list',list)
	// 	let newItems = genItems(n, options);
	// 	newItems.map(x => {x.cat=cat;items.push(x)});
	// }
	// return items;
	for (const list of keylists) {
		options.keySet = list.keys;
		let cat = list.cat;
		//console.log('list',list)
		let newItems = genItems(n, options);
		newItems.map(x => { x.cat = cat; items.push(x) });

	}
	return items;
}
function modifyColorkey(item) {
	let colorkey = chooseRandom(Object.keys(ColorDict));
	let textShadowColor = ColorDict[colorkey].c;
	item.textShadowColor = textShadowColor;
	item.color = ColorDict[colorkey];
	item.colorKey = colorkey;
	//console.log('colorkey', colorkey)
	applyColorkey(item);
}
function makeItemDivs(items, options) { for (let i = 0; i < items.length; i++) { makeItemDiv(items[i], options) } }
function makeItemDiv(item, options) {

	//console.log('item',item,'options',options)


	if (isdef(options.outerStyles) && isdef(options.ifs)) copyKeys(item, options.outerStyles, {}, Object.keys(options.ifs)); //options.ifs contains per item dynamic styles!!!!!
	//console.log('item.id',item.id,item)
	let dOuter = mCreate('div', options.outerStyles, item.id);

	if (isdef(item.textShadowColor)) {
		let sShade = '0 0 0 ' + item.textShadowColor;
		if (options.showPic) {
			options.picStyles['text-shadow'] = sShade;
			options.picStyles.fg = anyColorToStandardString('black', options.contrast); //'#00000080' '#00000030' 
		} else {
			options.labelStyles['text-shadow'] = sShade;
			options.labelStyles.fg = anyColorToStandardString('black', options.contrast); //'#00000080' '#00000030' 
		}
	}

	let dLabel;
	if (options.showLabels && options.labelTop == true) { dLabel = mText(item.label, dOuter, options.labelStyles); }

	let dPic;
	if (options.showPic) {
		dPic = mDiv(dOuter, { family: item.info.family });
		dPic.innerHTML = item.info.text;
		if (isdef(options.picStyles)) mStyleX(dPic, options.picStyles);
	}

	if (options.showLabels && options.labelBottom == true) { dLabel = mText(item.label, dOuter, options.labelStyles); }

	if (isdef(options.handler)) dOuter.onclick = options.handler;

	iAdd(item, { options: options, div: dOuter, dLabel: dLabel, dPic: dPic });

	if (isdef(item.textShadowColor)) { applyColorkey(item, options); }
	return dOuter;

}
function newItemSelection(item, items, onSelectSelected = null) {

	console.log('===>', item, items)
	let selectedItem = firstCond(items, x => x.isSelected);
	if (selectedItem && selectedItem != item) toggleItemSelection(selectedItem);
	else if (onSelectSelected && selectedItem) { onSelectSelected(item); }
	toggleItemSelection(item);
}
function modLabel(item,newLabel,styles){
	//assumes that this item already has a label!
	let dLabel = iLabel(item);
	//console.log(dLabel,newLabel,styles)
	dLabel.innerHTML=newLabel;
	mStyleX(dLabel,styles);
	item.label = newLabel;
	return dLabel;
}
function addLabel(item, label, styles) {
	item.label = label;
	let div = iDiv(item);
	//console.log(item,label,div)
	if (isdef(item.live.dLabel)) mRemove(item.live.dLabel);
	let dLabel = item.live.dLabel = mDiv(div, styles, null, label);
	mCenterFlex(div, true, true);
	mStyleX(div, { 'vertical-align': 'top' });
	return dLabel;
}
function addLabel1(item, label, replaceOld = true) {
	let div = iDiv(item);
	mStyleX(div, { 'vertical-align': 'top' });
	//console.log('div', div);
	if (isdef(item.live.dLabel)) mRemove(item.live.dLabel);
	let dLabel = item.live.dLabel = mDiv(div, { fz: 20 }, null, label);

	return div;
}
function removeLabel(item) {
	//console.log('old item',item);
	if (isdef(item.live.dLabel)) {
		item.live.dLabel.remove();
		delete item.live.dLabel;
		// let div = iDiv(item);
		// let rect = getRect(div);
		// //wie wird
		// let fzPic = getStandardFzPic(rect.w, rect.h, false);
		// mStyleX(item.live.dPic, { fz, fPic });
	}
	return item;
}
function toggleItemSelection(item, selectedItems) {
	//console.log('===>',item)
	let ui = iDiv(item);
	item.isSelected = nundef(item.isSelected) ? true : !item.isSelected;
	if (item.isSelected) mClass(ui, 'framedPicture'); else mRemoveClass(ui, 'framedPicture');

	//if piclist is given, add or remove pic according to selection state
	if (isdef(selectedItems)) {
		if (item.isSelected) {
			console.assert(!selectedItems.includes(item), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
			selectedItems.push(item);
		} else {
			console.assert(selectedItems.includes(item), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
			removeInPlace(selectedItems, item);
		}
	}
}
function zRepeatEachItem(items, repeat, shufflePositions = false) {
	//repeat items: repeat & shufflePositions
	let orig = items;
	let itRepeat = items;
	for (let i = 1; i < repeat; i++) { itRepeat = itRepeat.concat(orig.map(x => registeredItemCopy(x))); }
	if (shufflePositions) { shuffle(itRepeat); }
	//weil die items schon geshuffled wurden muss ich iRepeat neu setzen in den reihenfolge in der sie in itRepeat vorkommen!
	let labelRepeat = {};
	let idx = 0;
	for (const item of itRepeat) {
		let iRepeat = labelRepeat[item.label];
		if (nundef(iRepeat)) iRepeat = 1; else iRepeat += 1;
		item.iRepeat = iRepeat;
		item.index = idx; idx += 1;
		labelRepeat[item.label] = iRepeat;
	}
	return itRepeat;
}
function zRepeatInColorEachItem(items, colorKeys) {
	//colorKeys: copy colorKeys.length times into different colors
	let itColors = [];
	for (let i = 0; i < colorKeys.length; i++) {
		let newItems;
		if (i > 0) { newItems = jsCopy(items); newItems.map(x => registerAsNewItem(x)); }
		else newItems = items;
		itColors = itColors.concat(newItems);
	}

	for (let i = 0; i < colorKeys.length; i++) {
		let colorKey = colorKeys[i];
		let textShadowColor = ColorDict[colorKey].c;
		for (let j = 0; j < items.length; j++) {
			let index = i * items.length + j;
			//console.log('schau', index, colorKey);
			let x = itColors[index];
			x.index = index;
			x.textShadowColor = textShadowColor;
			x.color = ColorDict[colorKey];
			x.colorKey = colorKey;
		}
		//newItems.map(x => { x.textShadowColor = textShadowColor; x.color = ColorDict[colorKey]; x.colorKey = colorKey; });
	}
	//for (let i = 0; i < itColors.length; i++) itColors[i].index = i;
	//console.log(itColors[0])
	return itColors;
}




