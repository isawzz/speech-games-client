//prepare items for container
var GroupCounter = 0;
function zItems(infos, ifs, options) {
	let items = [];
	let iGroup = GroupCounter; GroupCounter += 1;
	//console.log('GroupCounter is at', GroupCounter);
	for (let i = 0; i < infos.length; i++) {
		let info = infos[i];
		let k = info.key;
		let item = { key: k, info: info, index: i };
		//console.log(item)
		item.iGroup = iGroup;
		let val;
		for (const propName in ifs) {
			let prop = ifs[propName];
			//console.log('TYPE OF', propName, 'IS', typeof prop, prop, isLiteral(prop))
			if (isLiteral(prop)) val = prop;
			else if (isList(prop)) val = prop[i % prop.length];
			else if (typeof (prop) == 'function') val = prop(i, info, item, options, infos);
			else val = null;
			if (isdef(val)) item[propName] = val;

			//console.log('item.'+propName,val)
		}
		items.push(item);
	}
	return items;
}
function zRepeatEachItem(items, repeat, shufflePositions = false) {
	//repeat items: repeat & shufflePositions
	let itRepeat = [];
	for (let i = 0; i < repeat; i++) { itRepeat = itRepeat.concat(jsCopy(items)); }
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
	for (let line = 0; line < colorKeys.length; line++) {
		let newItems = jsCopy(items);
		let colorKey = colorKeys[line];
		let textShadowColor = ColorDict[colorKey].c;
		newItems.map(x => { x.textShadowColor = textShadowColor; x.color = ColorDict[colorKey]; x.colorKey = colorKey; });
		itColors = itColors.concat(newItems);
	}
	for (let i = 0; i < itColors.length; i++) itColors[i].index = i;
	return itColors;
}














