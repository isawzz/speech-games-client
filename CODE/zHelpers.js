// code that should be or is already deprecated: backward compatibility only & to be replaced!
function mFlex(d, or = 'h') {
	d.style.display = 'flex';
	d.style.flexFlow = (or == 'v' ? 'column' : 'row') + ' ' + (or == 'w' ? 'wrap' : 'nowrap');
	// d.style.alignItems = 'stretch';
	// d.style.alignContent = 'stretch';
	// d.style.justiifyItems = 'stretch';
	// d.style.justifyContent = 'stretch';
}
function mFlexCenterContent(d) { mStyle(d, { 'justify-content': 'center', 'align-items': 'center' }); }
function mFlexChild(d, grow = 1, shrink = 0, base = 'auto') {
	// d.style.flexGrow=1;
	// d.style.flexBase='50%';
	d.style.flex = '' + grow + ' ' + shrink + ' ' + base;
}
function mFlexChildSplit(d, split) {
	if (split != 1) { split *= 10; if (split % 2 == 0) split /= 2; }
	d.style.flex = '' + split + ' 0 auto'; //NO
	//trace(split)
	// d.style.flex = '1 0 auto'; //NO
	// d.style.flex = '1 0 ' + (split * 100) + '%';
}
function mFlexLinebreak(d) { if (isString(d)) d = mBy(d); let lb = mDiv(d); mClass(lb, 'linebreak'); return lb; }
function mFlexWrap(d) { d.style.display = 'flex'; d.style.flexWrap = 'wrap'; }
function mFlexWrapGrow(d) { d.style.display = 'flex'; d.style.flexWrap = 'wrap'; d.style.flex = 1; }

function mPicButton(key, handler, dParent, styles, classes) {
	let x = createPicto({
		key: key, w: 20, h: 20, unit: 'px', fg: 'yellow', bg: 'violet',
		padding: 2, margin: 0, cat: 'd', parent: dParent, rounding: 4
	});
	//return x;
	// let x = mCreate('button');
	// x.innerHTML = caption;
	if (isdef(handler)) x.onclick = handler;
	// if (isdef(dParent)) dParent.appendChild(x);
	if (isdef(styles)) {
		//console.log('style of picButton', styles)
		mStyle(x, styles);
		//mClass(dParent,'vCentered')
	}
	if (isdef(classes)) { mClass(x, ...classes); }
	else mClass(x, 'picButton');
	return x;
}
function mPicButtonSimple(key, handler, dParent, styles, classes) {
	
	let x = createPictoSimple({ key: key, cat: 'd', parent: dParent });
	if (isdef(handler)) x.onclick = handler;
	if (isdef(styles)) { mStyle(x, styles); }
	if (isdef(classes)) { mClass(x, ...classes); }
	//else mClass(x, 'picButton');
	return x;
}

function mSizePic(d, w, h = 0, unit = 'px') {
	return mStyle(d, { 'font-size': h / 2, 'font-weight': 900, 'padding-top': h / 4, 'text-align': 'center', 'box-sizing': 'border-box', width: w, height: h ? h : w }, unit);
}

function mStyle(elem, styles, unit = 'px') {
	//console.log(':::::::::styles',styles)
	for (const k in styles) {
		//if (k=='font-family') continue;
		//console.log('setting',k,'to',styles[k]);
		elem.style.setProperty(k, makeUnitString(styles[k], unit));
	}

}
function mStyleX(elem, styles, unit = 'px') {
	const paramDict = {
		bg: 'background-color',
		fg: 'color',
		align: 'text-align',
		matop: 'margin-top',
		maleft: 'margin-left',
		mabottom: 'margin-bottom',
		maright: 'margin-right',
		patop: 'padding-top',
		paleft: 'padding-left',
		pabottom: 'padding-bottom',
		paright: 'padding-right',
		rounding: 'border-radius',
		w: 'width',
		h: 'height',
		fontSize: 'font-size',
		fz: 'font-size',
		family: 'font-family',
		weight: 'font-weight',
	};
	//console.log(':::::::::styles',styles)
	let bg, fg;
	if (isdef(styles.bg) || isdef(styles.fg)) {
		[bg, fg] = getExtendedColors(styles.bg, styles.fg);
	}
	if (isdef(styles.vmargin) && isdef(styles.hmargin)) {
		styles.margin = vmargin + unit + ' ' + hmargin + unit;
	}
	if (isdef(styles.vpadding) && isdef(styles.hpadding)) {
		styles.padding = vpadding + unit + ' ' + hpadding + unit;
	}

	//console.log(styles.bg,styles.fg);

	for (const k in styles) {
		let val = styles[k];
		let key = k;
		if (isdef(paramDict[k])) key = paramDict[k];
		else if (k == 'font' && !isString(val)) {
			//font would be specified as an object w/ size,family,variant,bold,italic
			// NOTE: size and family MUST be present!!!!!!! in order to use font param!!!!
			let fz = f.size; if (isNumber(fz)) fz = '' + fz + 'px';
			let ff = f.family;
			let fv = f.variant;
			let fw = isdef(f.bold) ? 'bold' : isdef(f.light) ? 'light' : f.weight;
			let fs = isdef(f.italic) ? 'italic' : f.style;
			if (nundef(fz) || nundef(ff)) return null;
			let s = fz + ' ' + ff;
			if (isdef(fw)) s = fw + ' ' + s;
			if (isdef(fv)) s = fv + ' ' + s;
			if (isdef(fs)) s = fs + ' ' + s;
			elem.style.setProperty(k, s);
			continue;
		} else if (k == 'border') {
			if (val.indexOf(' ') < 0) val = 'solid 1px ' + val;
		}

		//console.log(key,val,isNaN(val));if (isNaN(val) && key!='font-size') continue;

		if (key == 'font-weight') { elem.style.setProperty(key, val); continue; }
		else if (key == 'background-color') elem.style.background = bg;
		else if (key == 'color') elem.style.color = fg;
		else {
			//console.log('set property',key,makeUnitString(val,unit),val,isNaN(val));
			//if ()
			elem.style.setProperty(key, makeUnitString(val, unit));
		}
	}
}
function createEmoji({ key, w, h, unit = 'px', fg, bg, padding, cat, parent, border, rounding }) {
	let emoji = emojiChars[emojiKeys[key]];
	console.log('emoji', emoji);
	if (nundef(key)) key = getRandomKey(emojiChars);
	let ch = emoji.hexcode;
	console.log('ch', ch)
	let family = 'emoOpen';// (ch[0] == 'f' || ch[0] == 'F') ? 'pictoFa' : 'pictoGame';
	let text = emoji.emoji;// String.fromCharCode('0x' + ch);
	if (isdef(parent) && isString(parent)) parent = mBy(parent);
	console.log(parent);
	console.log(typeof text, text)
	cat = isdef(cat) ? cat : isdef(parent) ? getTypeOf(parent) == 'div' ? 'd' : 'g' : isdef(cat) ? cat : 'd';
	let domel;
	//console.log(parent, cat)
	if (cat == 'd') {
		let d = document.createElement('div');
		d.style.textAlign = 'center';
		//d.style.fontFamily = family;
		//d.style.fontWeight = 900;
		//d.style.fontSize = h + unit;
		if (isdef(bg)) {
			console.log('bg', bg);
			d.style.backgroundColor = bg;
		}
		//if (isdef(fg)) d.style.color = fg;
		d.innerHTML = text;
		domel = d;
		if (isdef(padding)) d.style.padding = padding + unit;
		d.style.display = 'inline-block';
		d.style.height = h + 2 * padding + unit;
		d.style.width = d.style.height;
		//d.style.textAlign = 'center';
		//console.log('padding', padding, 'unit', unit, 'w', d.style.width, 'h', d.style.height);
		if (isdef(border)) d.style.border = border;
		if (isdef(rounding)) d.style.borderRadius = rounding + unit;
	} else {
		//create a g element
		//add a rectangle element w/ or wo/ stroke and rounding
		//add a text element

	}
	domel.key = key;
	if (parent) parent.appendChild(domel);
	return domel;
}
function createPictoX(parent, style, classes, titleOptions, pictoOptions, captionOptions) {
	// { key, w = 60, h = 60, unit = 'px', fg = 'blue', bg,
	// 	padding = 6, cat, parent, border = '1px solid red', rounding = 4, title, caption }) {
	let d = mDiv(parent);
	if (isdef(style)) mStyle(d, style);
	if (isdef(classes)) mClass(d, ...classes);
	//d.style.textAlign = 'center';
	if (isdef(titleOptions)) { titleOptions.parent = d; createText(titleOptions); }
	if (isdef(pictoOptions)) { pictoOptions.parent = d; createPicto(pictoOptions); }
	if (isdef(captionOptions)) { captionOptions.parent = d; createText(captionOptions); }
	return d;
}
function createPicto({ key, w = 60, h = 60, unit = 'px', fg = 'blue', bg, padding, cat, parent, border, rounding = 4 }) {
	if (nundef(key)) key = getRandomKey(iconChars);
	let ch = iconChars[key];
	let family = (ch[0] == 'f' || ch[0] == 'F') ? 'pictoFa' : 'pictoGame';
	let text = String.fromCharCode('0x' + ch);
	cat = isdef(cat) ? cat : isdef(parent) ? getTypeOf(parent) == 'div' ? 'd' : 'g' : isdef(cat) ? cat : 'd';
	let domel;
	//console.log(parent, cat)
	if (cat == 'd') {
		let d = document.createElement('div');
		d.style.textAlign = 'center';
		d.style.fontFamily = family;
		d.style.fontWeight = 900;
		d.style.fontSize = h + unit;
		if (isdef(bg)) d.style.backgroundColor = bg;
		if (isdef(fg)) d.style.color = fg;
		d.innerHTML = text;
		domel = d;
		if (isdef(padding)) d.style.padding = padding + unit;
		d.style.display = 'inline-block';
		d.style.height = h + 2 * padding + unit;
		d.style.width = d.style.height;
		//d.style.textAlign = 'center';
		//console.log('padding', padding, 'unit', unit, 'w', d.style.width, 'h', d.style.height);
		if (isdef(border)) d.style.border = border;
		if (isdef(rounding)) d.style.borderRadius = rounding + unit;
	} else {
		//create a g element
		//add a rectangle element w/ or wo/ stroke and rounding
		//add a text element

	}
	domel.key = key;
	if (parent) parent.appendChild(domel);
	return domel;
}
function createText({ s, parent, style, classes }) {
	let d = mText(s, parent);
	if (isdef(style)) mStyle(d, style);
	if (isdef(classes)) mClass(d, ...classes);
}
function createPictoSimple({ key, w, h, unit = 'px', fg, bg, padding, cat, parent, border, rounding }) {
	if (nundef(key)) key = getRandomKey(iconChars);
	let ch = iconChars[key];
	let family = (ch[0] == 'f' || ch[0] == 'F') ? 'pictoFa' : 'pictoGame';
	let text = String.fromCharCode('0x' + ch);
	cat = isdef(cat) ? cat : isdef(parent) ? getTypeOf(parent) == 'div' ? 'd' : 'g' : isdef(cat) ? cat : 'd';
	if (nundef(w)) w = 25;
	if (nundef(h)) h = w;

	let domel;
	//console.log(parent, cat)
	if (cat == 'd') {
		let d = document.createElement('div');
		d.style.textAlign = 'center';
		d.style.fontFamily = family;
		d.style.fontWeight = 900;
		d.style.fontSize = h + unit;
		if (isdef(bg)) d.style.backgroundColor = bg;
		//d.style.backgroundColor='red';
		if (isdef(fg)) d.style.color = fg;
		d.innerHTML = text;
		domel = d;
		if (isdef(padding)) d.style.padding = padding + unit;
		d.style.display = 'inline-block';
		d.style.height = h + 2 * padding + unit;
		d.style.width = d.style.height;
		//d.style.textAlign = 'center';
		//console.log('padding', padding, 'unit', unit, 'w', d.style.width, 'h', d.style.height);
		if (isdef(border)) d.style.border = border;
		if (isdef(rounding)) d.style.borderRadius = rounding + unit;
	} else {
		//create a g element
		//add a rectangle element w/ or wo/ stroke and rounding
		//add a text element

	}
	domel.key = key;
	if (parent) parent.appendChild(domel);
	return domel;
}
function mPicSimple(info, dParent, { w, h, unit = 'px', fg, bg, padding, border, rounding, shape }) {
	if (nundef(w)) w = 25;
	if (nundef(h)) h = w;

	let d = document.createElement('div');
	if (dParent) dParent.appendChild(d);
	d.style.textAlign = 'center';
	d.style.fontFamily = info.family;
	d.style.fontWeight = 900;
	d.style.fontSize = h + unit;
	//d.style.paddintTop = Math.max(padding,h/4)+unit;
	[bg, fg] = getExtendedColors(bg, fg);
	if (isdef(bg)) d.style.backgroundColor = bg;
	if (isdef(fg)) d.style.color = fg;
	d.innerHTML = info.text;
	if (isdef(padding)) d.style.padding = padding + unit;
	d.style.display = 'inline-block';
	d.style.minHeight = h + padding + unit;
	d.style.minWidth = w + 2 * padding + unit;
	//d.style.textAlign = 'center';
	//console.log('padding', padding, 'unit', unit, 'w', d.style.width, 'h', d.style.height);
	if (isdef(border)) d.style.border = border;
	if (isdef(rounding)) d.style.borderRadius = rounding + unit;
	else if (isdef(shape) && shape == 'ellipse') {
		let b = getBounds(d);
		let vertRadius = b.height / 2;
		let horRadius = b.width / 2;
		let r = Math.min(vertRadius, horRadius);
		console.log(b, r)
		// d.style.borderRadius = `${horRadius}${unit} ${vertRadius}${unit} ${horRadius}${unit} ${vertRadius}${unit}`;
		d.style.borderRadius = `${r}${unit}`;
	}
	d.key = info.key;
	return d;
}



















