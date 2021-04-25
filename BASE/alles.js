//#region NEW + DEPRECATED


//#endregion

//#region _globals
var Username,Gamename,Tablename;

var I; //running instance
var Live, DB, G, T, P, U, User, Settings, SettingsChanged; //, G...Game, T...Table, U...Userdata

var Speech;

var Pictures, Goal, Selected, Score;

var TO; //timeout dictionary

var uiActivated, auxOpen;

var AD, ADS; //addons: current instance and dict of all existing addons (form DB)

var UIS = {}; 

var App; //not sure!
var DA = {}; //some kind of global object for testing ...

//#endregion

//#region helpers
//#region _DOM constants, shape functions, ZMax and iZMax to control max zIndex
const MSCATS = { rect: 'g', g: 'g', circle: 'g', text: 'g', polygon: 'g', line: 'g', body: 'd', svg: 'd', div: 'd', p: 'd', table: 'd', button: 'd', a: 'd', span: 'd', image: 'd', paragraph: 'd', anchor: 'd' };
const SHAPEFUNCS = {
	'circle': agCircle,
	'hex': agHex,
	'rect': agRect,
}
var ZMax = 0;
function iZMax(n) { if (isdef(n)) ZMax = n; ZMax += 1; return ZMax; }

function agColoredShape(g, shape, w, h, color) {
	//console.log(shape)
	SHAPEFUNCS[shape](g, w, h);
	gBg(g, color);
}
function agShape(g, shape, w, h, color, rounding) {
	let sh = gShape(shape, w, h, color, rounding);
	g.appendChild(sh);
	return sh;
}
function gShape(shape, w = 20, h = 20, color = 'green', rounding) {
	//console.log(shape)
	let el = gG();
	if (nundef(shape)) shape = 'rect';
	if (shape != 'line') agColoredShape(el, shape, w, h, color);
	else gStroke(el, color, w); //agColoredLine(el, w, color);

	if (isdef(rounding) && shape == 'rect') {
		let r = el.children[0];
		gRounding(r, rounding);
		//console.log(rounding,r);
		// r.setAttribute('rx', rounding); // rounding kann ruhig in % sein!
		// r.setAttribute('ry', rounding);
	}

	return el;
}
function applyCssStyles(ui, params) {
	let domType = getTypeOf(ui);
	if (domType == 'g') {
		//must apply styles differently or not at all!!!!!
		mStyle(ui, params); //geht ja eh!!!!!!!!!!

	} else {
		//console.log('apply NOW',ui,params)
		mStyle(ui, params); //NEEDS TO STAY THAT WAY!!!!!!!!!!!!! TODO: replace by _mStyleX, but needs work
	}
}
function asElem(x) { return isString(x) ? mBy(x) : x; }
function asList(x) { return isList(x) ? x : [x]; }

//#endregion

//#region **** _DOM 1 liners A list divs + item ****
function iAppend(dParent, i) { mAppend(iDiv(dParent), iDiv(i)); }
function iBounds(i, irel) {
	if (isdef(i.div)) i = i.div;
	if (isdef(irel) && isdef(irel.div)) irel = irel.div;
	isParent = (i.parentNode == irel);
	let b = getBounds(i, isParent, irel);
	let [x, y, w, h] = [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)];

	//console.log('bounds', b);
	return { x: x, y: y, w: w, h: h };
}
function iCenter(item, offsetX, offsetY) { let d = iDiv(item); mCenterAbs(d, offsetX, offsetY); }
function iMoveFromTo(item, d1, d2, callback, offset) {
	let bi = iBounds(item);
	let b1 = iBounds(d1);
	let b2 = iBounds(d2);
	//console.log('item', bi);
	//console.log('d1', b1);
	//console.log('d2', b2);

	//animate item to go translateY by d2.y-d1.y
	if (nundef(offset)) offset = { x: 0, y: 0 };
	let dist = { x: b2.x - b1.x + offset.x, y: b2.y - b1.y + offset.y };

	item.div.style.zIndex = 100;
	let a = aTranslateBy(item.div, dist.x, dist.y, 500);
	a.onfinish = () => { mAppend(d2, item.div); item.div.style.zIndex = item.z = iZMax(); if (isdef(callback)) callback(); };
}
function iParentBounds(i) {
	if (isdef(i.div)) i = i.div;
	let b = getBounds(i);
	let [x, y, w, h] = [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)];

	//console.log('bounds', b);
	return { x: x, y: y, w: w, h: h };
}
function iResize(i, w, h) { return isList(i) ? i.map(x => iSize(x, w, h)) : iSize(i, w, h); }
function iSize(i, w, h) { i.w = w; i.h = h; mSize(i.div, w, h); }
function isItem(i) { return isdef(i.div); }
function iDiv(i) { return isItem(i) ? i.div : i; }
function iDivs(ilist) { return isEmpty(ilist) ? [] : isItem(ilist[0]) ? ilist.map(x => iDiv(x)) : ilist; }
function iSplay(items, iContainer, containerStyles, splay = 'right', ov = 20, ovUnit = '%', createHand = true, rememberFunc = true) {

	if (!isList(items)) items = [items];
	if (isEmpty(items)) return { w: 0, h: 0 };

	let [w, h] = [items[0].w, items[0].h];

	let isHorizontal = splay == 'right' || splay == 'left';
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		item.col = isHorizontal ? i : 0;
		item.row = isHorizontal ? 0 : i;
		item.index = item.z = i;
	}

	//phase 3: prep container for items
	if (nundef(containerStyles)) containerStyles = {};
	let dContainer = iDiv(iContainer);
	let dParent, iParent;

	if (createHand) {
		dParent = mDiv(dContainer);
		iParent = { div: dParent };
	} else if (isItem(iContainer)) {
		dParent = iContainer.div;
		iParent = iContainer;

	} else dParent = iContainer;
	mStyleX(dParent, containerStyles);

	//phase 4: add items to container
	let gap = isdef(containerStyles.padding) ? containerStyles.padding : 0;
	let overlap = ov;
	if (ovUnit == '%') overlap = ov == 0 ? .5 : (isHorizontal ? w : h) * ov / 100;
	let x = y = gap;

	// call splayout primitive!!!
	let sz = splayout(items.map(x => x.div), dParent, w, h, x, y, overlap, splay);

	dParent.style.width = '' + sz.w + 'px';
	dParent.style.height = '' + sz.h + 'px';
	if (isdef(iParent)) { iParent.w = sz.w; iParent.h = sz.h; iParent.items = items; }
	return isdef(iParent) ? iParent : dParent;

}
function iStyle(i, styles) { mStyleX(iDiv(i), styles); }
//animations
function aTranslateBy(d, x, y, ms) { return d.animate({ transform: `translate(${x}px,${y}px)` }, ms); }
function aRotate(d, ms) { return d.animate({ transform: `rotate(360deg)` }, ms); }
function aRotateAccel(d, ms) { return d.animate({ transform: `rotate(1200deg)` }, { easing: 'cubic-bezier(.72, 0, 1, 1)', duration: ms }); }
//m
function mAppend(d, child) { d.appendChild(child); }
function mBg(d, color) { d.style.backgroundColor = color; }
function mBy(id) { return document.getElementById(id); }
function mCenterAbs(d, offsetX = 0, offsetY = 0) {
	let dParent = d.parentNode;
	if (nundef(dParent)) return;
	let b = getBounds(dParent);
	let b1 = getBounds(d);
	let h = b.height;
	let h1 = b1.height;
	let hdiff = h - h1;
	d.style.top = (offsetY + hdiff / 2) + 'px';
	let w = b.width;
	let w1 = b1.width;
	let wdiff = w - w1;
	d.style.left = (offsetX + wdiff / 2) + 'px';
	d.style.position = 'absolute';
	if (isEmpty(dParent.style.position)) dParent.style.position = 'relative';
}
function mRemoveStyle(d, styles) { for (const k of styles) d.style[k] = null; }
function mStyleX(elem, styles, unit = 'px') {
	const paramDict = {
		align: 'text-align',
		bg: 'background-color',
		fg: 'color',
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
		wmin: 'min-width',
		hmin: 'min-height',
		wmax: 'max-width',
		hmax: 'max-height',
		fontSize: 'font-size',
		fz: 'font-size',
		family: 'font-family',
		weight: 'font-weight',
		z: 'z-index'
	};
	//console.log(':::::::::styles',styles)
	let bg, fg;
	if (isdef(styles.bg) || isdef(styles.fg)) {
		[bg, fg] = getExtendedColors(styles.bg, styles.fg);
	}
	if (isdef(styles.vmargin) && isdef(styles.hmargin)) {
		styles.margin = styles.vmargin + unit + ' ' + styles.hmargin + unit;
		console.log('::::::::::::::', styles.margin)
	}
	if (isdef(styles.vpadding) && isdef(styles.hpadding)) {

		styles.padding = styles.vpadding + unit + ' ' + styles.hpadding + unit;
		console.log('::::::::::::::', styles.vpadding, styles.hpadding)
	}
	if (isdef(styles.box)) styles['box-sizing'] = 'border-box';
	//console.log(styles.bg,styles.fg);

	for (const k in styles) {
		//if (k=='textShadowColor' || k=='contrast') continue; //meaningless styles => TBD
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
			//console.log('________________________YES!')
			if (isNumber(val)) val=`solid ${val}px ${isdef(styles.fg)?styles.fg:'#ffffff80'}`;
			if (val.indexOf(' ') < 0) val = 'solid 1px ' + val;
		} else if (k == 'layout') {
			elem.style.setProperty('display', 'flex');
			elem.style.setProperty('flex-wrap', 'wrap');
			let hor, vert;
			if (val.length == 1) hor = vert = 'center';
			else {
				let di = { c: 'center', s: 'start', e: 'end' };
				hor = di[val[1]];
				vert = di[val[2]];

			}
			let justStyle = val[0] == 'v' ? vert : hor;
			let alignStyle = val[0] == 'v' ? hor : vert;
			elem.style.setProperty('justify-content', justStyle);
			elem.style.setProperty('align-items', alignStyle);
			switch (val[0]) {
				case 'v': elem.style.setProperty('flex-direction', 'column'); break;
				case 'h': elem.style.setProperty('flex-direction', 'row'); break;
			}
		}

		//console.log(key,val,isNaN(val));if (isNaN(val) && key!='font-size') continue;

		if (key == 'font-weight') { elem.style.setProperty(key, val); continue; }
		else if (key == 'background-color') elem.style.background = bg;
		else if (key == 'color') elem.style.color = fg;
		else if (key == 'opacity') elem.style.opacity = val;
		else {
			//console.log('set property',key,makeUnitString(val,unit),val,isNaN(val));
			//if ()
			elem.style.setProperty(key, makeUnitString(val, unit));
		}
	}
}
function mEditableOnEdited(id, dParent, label, initialVal, onEdited, onOpening) {
	let inp = mEditableInput(dParent, label, initialVal);
	inp.id = id;
	if (isdef(onOpening)) { inp.addEventListener('focus', ev => onOpening(ev)); }
	inp.addEventListener('focusout', ev => {
		//unselect text in span
		window.getSelection().removeAllRanges();
		if (isdef(onEdited)) onEdited(inp.innerHTML, ev);
	}); //(ev) => { onChange(ev,isCaseSensitive?inp.innerHTML:inp.innerHTML.toLowerCase()); });
	return inp;
}
function mEditableInput(dParent, label, val) {
	let labelElem = createElementFromHTML(`<span>${label}</span>	`)
	let elem = createElementFromHTML(`<span contenteditable="true" spellcheck="false">${val}</span>	`)
	elem.addEventListener('keydown', (ev) => {
		if (ev.key === 'Enter') {
			ev.preventDefault();
			mBy('dummy').focus();
		}
	});
	mAppend(dParent, labelElem);
	mAppend(dParent, elem);
	return elem;
}
function mInputX(dParent, styles, { textPadding, label, value, submitOnEnter, autoComplete, autoFocus, autoSelect, handler, createContainer } = {}) {
	//console.log('mInputX', 'label', label, 'submitOnEnter', submitOnEnter, 'autoComplete', autoComplete, 'autoFocus', autoFocus, 'handler', handler, 'createContainer', createContainer);

	let d;
	if (createContainer) {
		d = mDiv(dParent, { align: 'center' });
		mAppend(dParent, d);
	} else if (isdef(label)) {
		d = createElementFromHTML(`<label>${isdef(label) ? label : ''}</label>`);
		mAppend(dParent, d);
	} else d = dParent;

	let inp = createElementFromHTML(`<input type="text" class="input" value="${isdef(value) ? value : ''}" />`);
	mAppend(d, inp);


	if (isdef(autoComplete)) inp.autoComplete = autoComplete ? 'on' : 'off';

	if (isdef(submitOnEnter))
		inp.onkeydown = (ev) => {
			if (ev.key === 'Enter') {
				ev.preventDefault();
				mBy('dummy').focus();
				if (isdef(handler)) handler(inp.value);
			}
		};

	if (isdef(styles)) { mStyleX(d, styles); }
	let inpStyles = isdef(styles) ? jsCopy(styles) : {};
	delete inpStyles.padding;
	if (isdef(textPadding)) inpStyles.padding = textPadding;
	if (isdef(inpStyles.w)) inpStyles.w='100%';
	mStyleX(inp,inpStyles);

	if (isdef(autoFocus)) inp.focus();
	if (autoSelect == true) inp.select();
	return inp;
}
function mInput(label, value, dParent, styles) {
	let inp = createElementFromHTML(`<input type="text" class="input" value="${value}" />`);
	let labelui = createElementFromHTML(`<label>${label}</label>`);
	mAppend(dParent, labelui);
	mAppend(labelui, inp);
	if (isdef(styles)) mStyleX(labelui, styles)
	return inp;
}
function mFlexWrap(d) { mFlex(d, 'w'); }
function mFlex(d, or = 'h') {
	d.style.display = 'flex';
	d.style.flexFlow = (or == 'v' ? 'column' : 'row') + ' ' + (or == 'w' ? 'wrap' : 'nowrap');
	// d.style.alignItems = 'stretch';
	// d.style.alignContent = 'stretch';
	// d.style.justiifyItems = 'stretch';
	// d.style.justifyContent = 'stretch';
}
function mParent(elem) { return elem.parentNode; }
function mButton(caption, handler, dParent, styles, classes) {
	let x = mCreate('button');
	x.innerHTML = caption;
	if (isdef(handler)) x.onclick = handler;
	if (isdef(dParent)) dParent.appendChild(x);
	if (isdef(styles)) mStyleX(x, styles);
	if (isdef(classes)) {
		//console.log('setting classes',classes,...classes)
		mClass(x, ...classes);
	}
	return x;
}
function mLink(content, href, dParent, styles, classes) {
	let x = mCreate('a');
	x.innerHTML = content;
	if (isdef(href)) x.href = href;
	if (isdef(dParent)) dParent.appendChild(x);
	if (isdef(styles)) mStyle(x, styles);
	if (isdef(classes)) {
		console.log('setting classes', classes, ...classes)
		mClass(x, ...classes);
	}
	return x;
}
function mNull(d, attr) { d.removeAttribute(attr); }
function mHasClass(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function mClasses(d, lst) { for (let i = 1; i < lst.length; i++) d.classList.add(lst[i]); }
function mRemoveClasses(d, lst) { for (let i = 1; i < lst.length; i++) d.classList.remove(lst[i]); }
function mClass(d) { for (let i = 1; i < arguments.length; i++) d.classList.add(arguments[i]); }
function mRemoveClass(d) { for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }
function mClassRemove(d) { for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }
function mCreate(tag) { return document.createElement(tag); }
function mDestroy(elem) { if (isString(elem)) elem = mById(elem); purge(elem); } // elem.parentNode.removeChild(elem); }
function mZone(dParent, styles, pos) {
	let d = mDiv(dParent);
	if (isdef(styles)) mStyleX(d, styles);
	if (isdef(pos)) {
		mIfNotRelative(dParent);
		mPos(d, pos.x, pos.y);
	}
	return d;
}
function mCanvas(dParent) { let d = mDiv(dParent); d.style.position = 'relative'; return d; }
function mCanvas100(dParent) { let d = mDiv(dParent); mStyleX(d, { position: 'absolute', w: '100%', h: '100%' }); return d; }
function mDover(dParent) { let d = mDiv(dParent); mIfNotRelative(dParent); mStyleX(d, { position: 'absolute', w: '100%', h: '100%' }); return d; }
function mDiv(dParent = null, styles) { let d = mCreate('div'); if (dParent) mAppend(dParent, d); if (isdef(styles)) mStyleX(d, styles); return d; }
function mDiv100(dParent, styles) { let d = mDiv(dParent, styles); mSize(d, 100, 100, '%'); return d; }
function mScreen(dParent, styles) { let d = mDover(dParent); if (isdef(styles)) mStyleX(d, styles); return d; }
function mFg(d, color) { d.style.color = color; }
function mInstruction(msg, dParent, hasExclamation = true) {
	let p = mCreate('h2');
	p.innerHTML = msg + (hasExclamation ? '!' : '');
	mAppend(dParent, p);
	return p;
}
function mHeading(msg, dParent, level, id) {
	let p = mCreate('h' + level);
	if (!isEmpty(msg)) p.innerHTML = msg;
	if (isdef(id)) p.id = id;
	mAppend(dParent, p);
	return p;
}
function mHigh(ui) { mClass(ui, 'high'); }
function mUnhigh(ui) { mClassRemove(ui, 'high'); }
function mInsert(dParent, el) { dParent.insertBefore(el, dParent.childNodes[0]); }
function mLabel(label) { return mText(label); }

function mGap(d, gap) { mText('_', d, { fg: 'transparent', h: gap }); }
function mLinebreak(dParent, gap) {
	if (isString(dParent)) dParent = mBy(dParent);
	let d = mDiv(dParent);
	//console.log('parent style',dParent.style.display)

	//console.log(dParent.classList, Array.from(dParent.classList))

	if (dParent.style.display == 'flex' || mHasClass(dParent, 'flexWrap')) mClass(d, 'linebreak');
	else d.innerHTML = '<br>';

	if (isdef(gap)) { d.style.minHeight = gap + 'px'; d.innerHTML = ' &nbsp; '; d.style.opacity = .2; }//return mLinebreak(dParent);}

	return d;
}
function mMarginAuto(d) { d.style.setProperty('margin', 'auto'); }
function mPos(d, x, y, unit = 'px') { mStyleX(d, { left: x, top: y, position: 'absolute' }, unit); }
function mPosAbs(d) { d.style.position = 'absolute'; }
function mPosRel(d, x, y, unit) { d.style.position = 'relative'; if (isdef(x)) mStyle(d, { left: x, top: y }, unit); }
function mRot(d, angle) { d.style.transform = 'rotate(' + angle + 'deg)'; }
function mSize(d, w, h, unit = 'px') { mStyleX(d, { width: w, height: h }, unit); }
function mMinSize(d, w, h, unit = 'px') { mStyleX(d, { 'min-width': w, 'min-height': h }, unit); }
function mMinBounds(d) {
	let b = getBounds(d);
	mStyle(d, { 'min-width': b.width, 'min-height': b.height }, 'px');
}
function mImage(path, dParent, w, h, styles, classes) {
	let d = mCreate('img');
	d.src = path;
	if (isdef(w)) d.width = w;
	if (isdef(h)) d.width = h;
	mAppend(dParent, d);
	if (isdef(styles)) mStyleX(d, styles);
	if (isdef(classes)) mClass(d, classes);
	return d;
	//<img src="kiwi.svg" alt="Kiwi standing on oval"></img>
}
function mImg(path, dParent, styles, classes) {
	let d = mCreate('img');
	d.src = path;
	mAppend(dParent, d);
	if (isdef(styles)) mStyleX(d, styles);
	if (isdef(classes)) mClass(d, classes);
	return d;
	//<img src="kiwi.svg" alt="Kiwi standing on oval"></img>
}
function mTextFit(text, { wmax, hmax }, dParent, styles, classes) {
	//mTextFit(label,maxchars,maxlines, d, textStyles, ['truncate']);
	let d = mDiv(dParent);
	if (!isEmpty(text)) d.innerHTML = text;

	//console.log('_______',wmax,hmax)
	if (nundef(styles) && (isdef(wmax)) || isdef(hmax)) {
		styles = {};
	}
	if (isdef(wmax)) styles.width = wmax;
	if (isdef(hmax)) styles.height = hmax;

	//console.log('_',text,styles)

	if (isdef(styles)) mStyleX(d, styles);

	if (isdef(classes)) mClass(d, classes);
	return d;
}

function mText(text, dParent, styles, classes) {
	let d = mDiv(dParent);
	if (!isEmpty(text)) d.innerHTML = text;
	//if (isdef(id)) d.id = id;
	//mAppend(dParent, d);
	if (isdef(styles)) mStyleX(d, styles);

	if (isdef(classes)) mClass(d, classes);
	return d;
}
function mPara(text, dParent, styles, classes) {
	let d = mCreate('p');
	mAppend(dParent, d);
	if (!isEmpty(text)) d.innerHTML = text;
	//if (isdef(id)) d.id = id;
	//mAppend(dParent, d);
	if (isdef(styles)) mStyleX(d, styles);

	if (isdef(classes)) mClass(d, classes);
	return d;
}
function recFlattenLists(o) {
	for (const k in o) {
		let cand = o[k];
		if (isList(cand)) o[k] = cand.join(' ');
		else if (isDict(cand)) recFlattenLists(cand);
	}
}
function mDictionary(o, { dParent, title, flattenLists = true, className = 'node', omitEmpty = false } = {}) {

	let oCopy = jsCopy(o);
	//if (flattenLists) { recFlattenLists(oCopy); }
	// 	for (const k in oCopy) {
	// 		let cand = oCopy[k];
	// 		if (isList(cand)) oCopy[k] = cand.join(' ');
	// 	}
	// }

	let d = mCreate('div');
	if (isdef(className)) mClass(d, className);
	mYaml(d, oCopy);
	let pre = d.getElementsByTagName('pre')[0];
	pre.style.fontFamily = 'inherit';
	if (isdef(title)) mInsert(d, mText(title));
	if (isdef(dParent)) mAppend(dParent, d);
	return d;
}
function mDictionary_dep(o, { dParent, title, flattenLists = true, className = 'node', omitEmpty = false } = {}) {

	let oCopy = jsCopy(o);
	if (flattenLists) { recFlattenLists(oCopy); }
	// 	for (const k in oCopy) {
	// 		let cand = oCopy[k];
	// 		if (isList(cand)) oCopy[k] = cand.join(' ');
	// 	}
	// }

	let d = mCreate('div');
	if (isdef(className)) mClass(d, className);
	mYaml(d, oCopy);
	let pre = d.getElementsByTagName('pre')[0];
	pre.style.fontFamily = 'inherit';
	if (isdef(title)) mInsert(d, mText(title));
	if (isdef(dParent)) mAppend(dParent, d);
	return d;
}
function mNodeFilter(o, { sort, dParent, title, lstFlatten, lstOmit, lstShow, className = 'node', omitEmpty = false } = {}) {
	let oCopy = isList(lstShow) ? filterByKey(o, lstShow) : jsCopySafe(o);
	// if (lstShow.includes('class') && isdef(o.ui)) {
	// 	let carr = Array.from(o.ui.classList);
	// 	console.log(carr)
	// 	oCopy.class = isEmpty(carr) ? carr : carr.join(',');
	// }
	if (isList(lstFlatten)) recConvertToSimpleList(oCopy, lstFlatten);
	if (nundef(lstOmit)) lstOmit = [];
	//oCopy = jsCopyMinus()
	if (omitEmpty || !isEmpty(lstOmit)) oCopy = recDeleteKeys(oCopy, omitEmpty, lstOmit);
	let d = mCreate('div');
	if (isdef(className)) mClass(d, className);
	switch (sort) {
		case 'keys': oCopy = sortKeys(oCopy); break;
		case 'all': oCopy = JSON.sort(oCopy); break;
	}
	mYaml(d, oCopy);
	let pre = d.getElementsByTagName('pre')[0];
	pre.style.fontFamily = 'inherit';
	if (isdef(title)) mInsert(d, mText(title));
	if (isdef(dParent)) mAppend(dParent, d);
	return d;
}
function mNode(o, dParent, title, isSized = false) {
	let d = mCreate('div');
	mYaml(d, o);
	let pre = d.getElementsByTagName('pre')[0];
	pre.style.fontFamily = 'inherit';
	if (isdef(title)) mInsert(d, mText(title));
	if (isdef(dParent)) mAppend(dParent, d);
	if (isDict(o)) d.style.textAlign = 'left';
	if (isSized) addClass(d, 'centered');

	return d;
}
function mNodeChangeContent(ui, content) {
	let domel = ui.getElementsByTagName('pre')[0];
	domel.innerHTML = jsonToYaml(content);

}
function mYaml(d, js) {
	d.innerHTML = '<pre>' + jsonToYaml(js) + '</pre>';
	// d.innerHTML = '<pre class="info">' + jsonToYaml(js) + '</pre>'; 
}
//#endregion

//#region _DOM standard functions
function stdInput(dParent,styles){
	let defStyles = { fz: 20, padding: 12 };
	if (nundef(styles)) styles = {};
	let newStyles = deepmergeOverride(defStyles, styles);
	//console.log('newStyles',newStyles)
	return mInputX(dParent, newStyles,
		{ textPadding:4, autoComplete: 'off', autoFocus: true, autoSelect:false })
}
function stdInputSubmit(dParent, styles, handler) {
	let defStyles = { fz: 20, padding: 12 };
	if (nundef(styles)) styles = {};
	let newStyles = deepmergeOverride(defStyles, styles);
	//console.log('newStyles',newStyles)
	return mInputX(dParent, newStyles,
		{ textPadding:4, autoComplete: 'off', submitOnEnter: true, autoFocus: true, autoSelect:false, handler: handler })
}
function stdInputVal(dParent, styles, val, autoSelect=true) {
	let defStyles = { fz: 20, padding: 12 };
	if (nundef(styles)) styles = {};
	let newStyles = deepmergeOverride(defStyles, styles);
	//console.log('newStyles',newStyles)
	return mInputX(dParent, newStyles,
		{ value:val, textPadding:4, autoComplete: 'off', submitOnEnter: true, autoFocus: true, autoSelect:autoSelect})
}
function stdInstruction(written, dParent, spoken, { fz, voice, lang } = {}) {
	//spoken = 'hallo ich bin der pumukl';
	if (isdef(lang) && lang == 'D' && nundef(voice)) voice = 'deutsch';
	else if (isdef(lang) && lang == 'E' && nundef(voice)) voice = 'random';
	//else if (isdef(voice) && voice == 'deutsch') 
	if (nundef(voice)) voice = 'random';

	//console.log('Settings language',Settings.language,'lang',lang,'voice',voice)

	let d;
	if (isdef(dParent)) clearElement(dParent);
	dInstruction = d = mDiv(dParent);
	mStyleX(d, { margin: 15 })
	mClass(d, 'flexWrap');

	// let msg = cmd + " " + `<b>${text.toUpperCase()}</b>`;
	if (nundef(fz)) fz = 36;
	let d1 = mText(written, d, { fz: fz, display: 'inline-block' });

	if (isdef(spoken)) {
		let sym = symbolDict.speaker;
		let d2 = mText(sym.text, d, {
			fz: fz + 2, weight: 900, display: 'inline-block',
			family: sym.family, 'padding-left': 14
		});
		sayRandomVoice(spoken, spoken, voice);
	}

	dInstruction.onclick = () => aniInstruction(spoken);

	return d;
}

//#endregion

//#region _SVG/g 1 liners A list shapes
function gCreate(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }
function gPos(g, x, y) { g.style.transform = `translate(${x}px, ${y}px)`; }
function gSize(g, w, h, shape = null, iChild = 0) {
	//console.log(getTypeOf(g))
	let el = (getTypeOf(g) != 'g') ? g : g.children[iChild];
	let t = getTypeOf(el);
	//console.log('g', g, '\ntype of g child', el, 'is', t);
	switch (t) {
		case 'rect': el.setAttribute('width', w); el.setAttribute('height', h); el.setAttribute('x', -w / 2); el.setAttribute('y', -h / 2); break;
		case 'ellipse': el.setAttribute('rx', w / 2); el.setAttribute('ry', h / 2); break;
		default:
			if (shape) {
				switch (shape) {
					case 'hex': let pts = size2hex(w, h); el.setAttribute('points', pts); break;
				}
			}
	}
	return el;
}
function gBg(g, color) { g.setAttribute('fill', color); }
function gFg(g, color, thickness) { g.setAttribute('stroke', color); if (thickness) g.setAttribute('stroke-width', thickness); }
function gRounding(r, rounding) {
	//let r = el.children[0];
	//console.log(rounding,r);
	r.setAttribute('rx', rounding); // rounding kann ruhig in % sein!
	r.setAttribute('ry', rounding);

}
function gStroke(g, color, thickness) { g.setAttribute('stroke', color); if (thickness) g.setAttribute('stroke-width', thickness); }
function gSvg() { return gCreate('svg'); } //document.createElementNS('http://www.w3.org/2000/svg', 'svg'); }
function gG() { return gCreate('g'); }// document.createElementNS('http://www.w3.org/2000/svg', 'g'); }
function gHex(w, h) { let pts = size2hex(w, h); return gPoly(pts); }
function gPoly(pts) { let r = gCreate('polygon'); if (pts) r.setAttribute('points', pts); return r; }
function gRect(w, h) { let r = gCreate('rect'); r.setAttribute('width', w); r.setAttribute('height', h); r.setAttribute('x', -w / 2); r.setAttribute('y', -h / 2); return r; }
function gEllipse(w, h) { let r = gCreate('ellipse'); r.setAttribute('rx', w / 2); r.setAttribute('ry', h / 2); return r; }
function gLine(x1, y1, x2, y2) { let r = gCreate('line'); r.setAttribute('x1', x1); r.setAttribute('y1', y1); r.setAttribute('x2', x2); r.setAttribute('y2', y2); return r; }

function gCanvas(area, w, h, color, originInCenter = true) {
	let dParent = mBy(area);
	let div = stage3_prepContainer(dParent);
	div.style.width = w + 'px';
	div.style.height = h + 'px';

	let svg = gSvg();
	let style = `margin:0;padding:0;position:absolute;top:0px;left:0px;width:100%;height:100%;`
	svg.setAttribute('style', style);
	mColor(svg, color);
	div.appendChild(svg);

	let g = gG();
	if (originInCenter) g.style.transform = "translate(50%, 50%)";
	svg.appendChild(g);

	return g;

}

function agCircle(g, sz) { let r = gEllipse(sz, sz); g.appendChild(r); return r; }
function agEllipse(g, w, h) { let r = gEllipse(w, h); g.appendChild(r); return r; }
function agHex(g, w, h) { let pts = size2hex(w, h); return agPoly(g, pts); }
function agPoly(g, pts) { let r = gPoly(pts); g.appendChild(r); return r; }
function agRect(g, w, h) { let r = gRect(w, h); g.appendChild(r); return r; }
function agLine(g, x1, y1, x2, y2) { let r = gLine(x1, y1, x2, y2); g.appendChild(r); return r; }
function agG(g) { let g1 = gG(); g.appendChild(g1); return g1; }
//function agSvgg(d) { let svg = gSvg(); agG(svg); d.appendChild(svg); return g; }
function aSvg(dParent) {
	if (!dParent.style.position) dParent.style.position = 'relative';

	let svg1 = gSvg();
	//console.log(svg1)
	svg1.setAttribute('width', '100%');
	svg1.setAttribute('height', '100%');
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);

	return svg1;
}
function aSvgg(dParent, originInCenter = true) {
	if (!dParent.style.position) dParent.style.position = 'relative';

	let svg1 = gSvg();
	//console.log(svg1)
	svg1.setAttribute('width', '100%');
	svg1.setAttribute('height', '100%');
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);

	let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svg1.appendChild(g1);
	if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; } //works!

	return g1;

}
//endregion

//#region 1 liners B list
function mCenterV(d) {
	let dParent = d.parentNode;
	let b = getBounds(dParent);
	let h = b.height;
	let b1 = getBounds(d);
	let h1 = b1.height;
	let diff = h - h1;
	d.style.marginTop = (diff / 2) + 'px';

}
function mCenterH(d) {
	let dParent = d.parentNode;
	let b = getBounds(dParent);
	let h = b.width;
	let b1 = getBounds(d);
	let h1 = b1.width;
	let diff = h - h1;
	d.style.marginleft = (diff / 2) + 'px';

}
function mCenter(d) {
	let dParent = d.parentNode;
	let b = getBounds(dParent);
	let b1 = getBounds(d);
	let h = b.height;
	let h1 = b1.height;
	let hdiff = h - h1;
	d.style.marginTop = (hdiff / 2) + 'px';
	let w = b.width;
	let w1 = b1.width;
	let wdiff = w - w1;
	d.style.marginLeft = (wdiff / 2) + 'px';

}
function mCenterText(d) { d.style.textAlign = 'center'; }

function mDivPosAbs(x = 0, y = 0, dParent = null) { let d = mCreate('div'); if (dParent) mAppend(dParent, d); mPos(d, x, y); return d; }
function mDivPosRel(x = 0, y = 0, dParent = null) { let d = mCreate('div'); if (dParent) mAppend(dParent, d); mPosRel(d, x, y); return d; }

function mEnsure(d) { return isString(d) ? mById(d) : d; }
function mAppendS(d, child) { d = mEnsure(d); if (d) d.appendChild(child); return child; }
function mAppendText(d, text) { let dText = mCreate('div'); dText.innerHTML = text; d.appendChild(dText); return dText; }
function mAppendTextS(d, text) { let dText = mCreate('div'); dText.innerHTML = text; mAppendS(d, dText); return dText; }
function mAppPos(d, child) { d.style.position = 'relative'; return mAppend(d, child); }
function mAppPosS(d, child) { d = ensure(d); d.style.position = 'relative'; return mAppend(d, child); }
function mBox(w, h, color, dParent = null) { let d = mDiv(dParent); return mStyle(d, { 'background-color': color, position: 'absolute', display: 'inline', width: w, height: h }); }

function mById(id) { return document.getElementById(id); }
function computeColor(c) { return (c == 'random') ? randomColor() : c; }
function computeColorX(c) {

	let res = c;
	if (isList(c)) return chooseRandom(c);
	else if (isString(c) && startsWith(c, 'rand')) {
		res = randomColor();
		let spec = c.substring(4);
		//console.log('______________________', spec);
		if (isdef(window['color' + spec])) {
			console.log('YES!');
			res = window['color' + spec](res);
		}

	}
	return res;
}
function getExtendedColors(bg, fg) {
	//#region doc 
	/* handles values random, inherit, contrast	*/
	//#endregion 
	bg = computeColor(bg);
	fg = computeColor(fg);
	if (bg == 'inherit' && (nundef(fg) || fg == 'contrast')) {
		fg = 'inherit'; //contrast to parent bg!

	} else if (fg == 'contrast' && isdef(bg) && bg != 'inherit') fg = colorIdealText(bg);
	else if (bg == 'contrast' && isdef(fg) && fg != 'inherit') { bg = colorIdealText(fg); }
	return [bg, fg];
}
function mColorX(d, bg, fg) {
	[bg, fg] = getExtendedColors(bg, fg);
	return mColor(d, bg, fg);
}
function mColor(d, bg, fg) { return mStyleX(d, { 'background-color': bg, 'color': fg }); }
function mRemove(elem) { mDestroy(elem); }
//function onMouseEnter(d, handler = null) { d3.on('mouse') }
function mFont(d, fz) { d.style.setProperty('font-size', makeUnitString(fz, 'px')); }
//function mGap(d, gap) { d.style.setProperty('margin', gap + 'px'); }
//function mPosAbs(d) { return mStyle(d, { position: 'absolute' }); }
function mSzPic(d, sz, unit = 'px') { return mSizePic(d, sz, sz, unit); }
function mStyleS(elem, styles, unit = 'px') { elem = mEnsure(elem); for (const k in styles) { elem.style.setProperty(k, makeUnitString(styles[k], unit)); } return elem; }
//#endregion

//#region 1 liners positioning_...
function posTL(d) { mPos(d, 0, 0) }
function posTC(d) { mStyleX(d, { right: '50%', top: 0, position: 'absolute' }); }
function posBC(d) {
	let dParent = d.parentNode;
	//console.log(dParent);
	//console.log('height',d.style.height);
	let dNew = mDiv(dParent, { w: '100%', h: 50, position: 'absolute', bottom: 0, left: 0, bg: 'null', align: 'center' });
	mAppend(dNew, d);
	//mStyleX(d, { bottom: 0, position: 'absolute' }); 
}
function posTR(d) { mStyleX(d, { right: 0, top: 0, position: 'absolute' }); }
function posBL(d) { mStyleX(d, { left: 0, bottom: 0, position: 'absolute' }); }
function posBLR(d) { mStyleX(d, { left: 0, bottom: 0, position: 'absolute' }); mRot(d, 180); }
function posBR(d) { mStyleX(d, { right: 0, bottom: 0, position: 'absolute' }); }
function posBRR(d) { mStyleX(d, { right: 0, bottom: 0, position: 'absolute' }); mRot(d, 180); }
function posCIC(d) { d = mEnsure(d); d.classList.add('centerCentered'); }
function posCICT(d) { d = mEnsure(d); d.classList.add('centerCenteredTopHalf'); }
function posCICB(d) { d = mEnsure(d); d.classList.add('centerCenteredBottomHalf'); }
//#endregion

//#region helpersX
//#region doc
/*
	helpersX.js contains super special helper library! (version iii)
*/
//#endregion
function allCondX(ad, func) {
	//#region doc 
	/*	
ad ... array or dictionary
func ... takes array elem or dict key and returns true or false
=>list of elements (with key:key in case of dictionary, unless this prop already exists?)
	*/
	//#endregion 
	//console.log('ad',ad,'func',func)
	let res = [];
	if (nundef(ad)) return res;
	else if (isDict(ad)) {
		for (const k in ad) {
			let v = ad[k];
			if (func(v)) { if (nundef(v.key)) v.key = k; res.push(v); }
		}
	} else {
		for (const a of ad) { if (func(a)) res.push(a) }
	}

	return res;

}
function firstCondX(ad, func, keysSorted) {
	//#region doc 
	/*	
ad ... array or dictionary
func ... takes array elem or dict key and returns true or false
keysSorted ... in case of a dictionary, if want keys sorted in some order, provide param keysSorted
=>first value that fullfills func or null (key added to value in case of dict!)
	*/
	//#endregion 
	if (nundef(ad)) return null;
	else if (isDict(ad)) {
		if (isdef(keysSorted)) {
			for (const k of keysSorted) {
				let v = ad[k];
				if (func(v)) { if (nundef(v.key)) v.key = k; return v; }
			}
		} else {
			for (const k in ad) {
				let v = ad[k];
				if (func(v)) { if (nundef(v.key)) v.key = k; return v; }
			}
		}
	} else {
		for (const a of ad) { if (func(a)) return a; }
	}

	return null;

}
function lastCondX(ad, func, keysSorted) {
	//#region doc 
	/*	
ad ... array or dictionary
func ... takes array elem or dict key and returns true or false
keysSorted ... in case of a dictionary, if want keys sorted in some order, provide param keysSorted
=>last value that fullfills func or null (key added to value in case of dict!)
	*/
	//#endregion 
	if (nundef(ad)) return null;
	else if (isDict(ad)) {
		if (isdef(keysSorted)) {
			for (let i = keysSorted.length - 1; i >= 0; i--) {
				let k = keysSorted[i];
				let v = ad[k];
				if (func(v)) { if (nundef(v.key)) v.key = k; return v; }
			}
		} else {
			for (const k in ad) { //no difference to firstCondDict really because keys are not sorted!
				let v = ad[k];
				if (func(v)) { if (nundef(v.key)) v.key = k; return v; }
			}
		}
	} else {
		for (let i = ad.length - 1; i >= 0; i--) { if (func(ad[i])) return ad[i]; }
	}

	return null;

}

//#endregion

//#region arithmetic
function divInt(a, b) { return Math.trunc(a / b); }
//#endregion

//#region cache
class LazyCache {
	constructor(resetStorage = false) {
		this.caches = {};
		if (resetStorage) localStorage.clear(); //*** */
	}
	get(key) { return this.caches[key]; }

	asDict(key) { return this.caches[key].live; }

	getRandom(key) { let d = this.asDict(key); return chooseRandom(Object.values(d)); }
	getRandomKey(key) { return getRandomKey(this.asDict(key)); }
	getFirstKey(key, cond) { return firstCondDictKeys(this.asDict(key), cond); }

	invalidate(...keys) { for (const k of keys) if (this.caches[k]) this.caches[k].invalidate(); }

	async load(primKey, loaderFunc, reload = false, useLocal = true) {
		let cd = new CacheDict(primKey, { func: loaderFunc }, useLocal);
		this.caches[primKey] = cd;
		if (reload) await cd.reload(); else await cd.load();

		let handler = {
			get: function (target, name) { return target.live[name]; },
			set: function (target, name, val) { target.live[name] = val; return true; },
			has: function (target, name) { return name in target.live; },
			delete: function (target, name) { return delete target.live[name]; },
		};
		let proxy = new Proxy(cd, handler);
		return proxy;
	}
}
class CacheDict {
	constructor(primKey, { func = null } = {}, useLocal = true) {
		this.primKey = primKey; //this is key under which object is stored in localStorage/indexedDB
		this.func = func;
		this.live = null;
		this.useLocal = useLocal;
	}
	async load() {
		if (this.live) return this;
		return this._local() || await this._server();
	}
	invalidate() {
		//delete local copy and live
		localStorage.removeItem(this.primKey); //*** */
		this.live = null;
	}
	async reload() { this.invalidate(); return await this.load(); }

	_local() {
		if (!this.useLocal) return null;
		//console.log('....from local', this.primKey);
		let res = localStorage.getItem(this.primKey); //**** */
		if (res) this.live = JSON.parse(res);
		return res;
	}

	async _server() {
		//console.log('....from server', this.primKey);
		if (this.func) {
			this.live = await this.func();
			//console.log('after call: live',this.live)
			if (this.useLocal) localStorage.setItem(this.primKey, JSON.stringify(this.live)); //*** */
		}
		return this.func;
	}

}
class ScriptLoader {
	constructor(options) {
		this.protocol = document.location.protocol;
		this.global = 'Segment';
		this.isLoaded = false;
	}

	loadScript() {
		return new Promise((resolve, reject) => {
			// Create script element and set attributes
			const script = document.createElement('script');
			script.type = 'text/javascript';
			script.async = true;
			script.src = `${this.protocol}//${this.src}`;

			// Append the script to the DOM
			const el = document.getElementsByTagName('script')[0];
			el.parentNode.insertBefore(script, el);

			// Resolve the promise once the script is loaded
			script.addEventListener('load', () => {
				this.isLoaded = true;
				resolve(script);
			})

			// Catch any errors while loading the script
			script.addEventListener('error', () => {
				reject(new Error(`${this.src} failed to load.`));
			})
		})
	}
	load(src) {
		//console.log(src)
		if (startsWith(src, 'http')) src = stringAfter(src, '://');
		this.src = src;
		return new Promise(async (resolve, reject) => {
			if (!this.isLoaded) {
				try {
					await this.loadScript();
					resolve(window[this.global]);
				} catch (e) {
					reject(e);
				}
			} else {
				resolve(window[this.global]);
			}
		})
	}
}
//#endregion

//#region Q
var Q, TOQ, AkQ;
var QCounter = 0;
var QCancelAutoreset, TOQRunner, QRunnerRunning = false, QRunning = false;
function QStop() {
	//just stop the runner task
	console.log('...', getFunctionCallerName());
	QCancelAutoreset = true;
}
function QReset() {
	console.log('...', getFunctionCallerName());
	clearTimeout(TOQ);
	clearTimeout(TOQRunner);
	Q = [];
	AkQ = [];
}
function restartQ() {
	QReset();
	console.log('===>RESET', QCounter, Q, AkQ);
}
function enQ(f, parr = null, msBefore = null, msAfter = null, callback = null) {
	if (nundef(Q)) restartQ();
	Q.push({ f: f, parr: parr, msBefore: msBefore, msAfter: msAfter, callback: callback });
}
function startQRunner() {
	if (QRunnerRunning) return;
	QRunnerRunning = true;
	QRunner();
}
function QRunner() {
	if (QCancelAutoreset) { QRunnerRunning = false; QCancelAutoreset = false; restartQ(); }
	else if (isEmpty(Q)) TOQRunner = setTimeout(QRunner, 1000);
	else _runQ(QRunner);
}

function _runQ() {
	QCounter += 1; console.log('===>run', QCounter, Q);
	if (isEmpty(Q)) { console.log('Q empty!', AkQ); return; }

	let task = Q.shift();
	//just simple task without timeout or callback
	let f = task.f;
	let parr = _paramsQ(task.parr);
	//let msBefore = task.msBefore, msAfter = task.msAfter, callback = task.callback; //waitCond = task.waitCond, tWait = task.tWait;
	console.log('task:', f.name, 'params', parr)
	let result = f(...parr);
	if (isdef(result)) AkQ.push(result);

	if (!isEmpty(Q)) runQ();

}

function _paramsQ(parr) {
	parr = isdef(parr) ? parr : [];
	for (let i = 0; i < parr.length; i++) {
		let para = parr[i];
		if (para == '_last') parr[i] = arrLast(AkQ);
		else if (para == '_all' || para == '_list') parr[i] = AkQ;
		else if (para == '_first') parr[i] = AkQ[0];

	}
	return parr;
}
//#endregion

//#region chain,  task chain 



function chainEx(taskChain, onComplete, ifBlocked = 'wait', singleThreaded = true) {
	if (BlockChain) {
		console.log('chain blocked!')
		switch (ifBlocked) {
			case 'interrupt': CancelChain = true; setTimeout(() => chainEx(taskChain, onComplete, 'wait'), 300); break;
			case 'wait': setTimeout(() => chainEx(taskChain, onComplete, 'wait'), 300); break;
			case 'return': default://just drop it
		}
	} else {
		BlockChain = true;
		CancelChain = false;
		let akku = [];
		if (singleThreaded) {
			TaskChain = taskChain;
			_singleThreadedChainExRec(akku, onComplete);
		} else {
			_chainExRec(akku, taskChain, onComplete);
		}
	}
}
function addTask(task) {
	if (!CancelChain) TaskChain.push(task);
}
function chainCancel() {
	CancelChain = true;
	clearTimeout(ChainTimeout);
	TaskChain = [];
	setTimeout(() => BlockChain = false, 100);
	//console.log('chain ccanceled properly!');
}
function _singleThreadedChainExRec(akku, onComplete) {
	if (CancelChain) {
		clearTimeout(ChainTimeout);
		BlockChain = false;
		console.log('chain canceled!', akku);
		//return akku;
	} else if (isEmpty(TaskChain)) {
		BlockChain = false;
		onComplete(akku);
	} else {
		let task = TaskChain[0], f = task.f, parr = isdef(task.parr) ? task.parr : [], t = task.msecs, waitCond = task.waitCond, tWait = task.tWait;
		console.log('task:', f.name, 't', t)

		if (isdef(waitCond) && !waitCond()) {
			if (nundef(tWait)) tWait = 300;
			ChainTimeout = setTimeout(() => _singleThreadedChainExRec(akku, onComplete), tWait);
		} else {
			for (let i = 0; i < parr.length; i++) {
				let para = parr[i];
				if (para == '_last') parr[i] = arrLast(akku);
				else if (para == '_all' || para == '_list') parr[i] = akku;
				else if (para == '_first') parr[i] = akku[0];

			}

			let result = f(...parr);
			if (isdef(result)) akku.push(result);

			TaskChain = TaskChain.slice(1);
			if (isdef(t)) {
				ChainTimeout = setTimeout(() => _singleThreadedChainExRec(akku, onComplete), t);
			} else {
				_chainExRec(akku, onComplete);
			}
		}
	}
}
function _chainExRec(akku, taskChain, onComplete) {
	if (CancelChain) {
		clearTimeout(ChainTimeout);
		BlockChain = false;
		console.log('chain canceled!');
		return akku;
	} else if (isEmpty(taskChain)) {
		BlockChain = false;
		if (onComplete) onComplete(akku);
		else console.log('akku', akku, '\nBlockChain', BlockChain, '\nCancelChain', CancelChain)
	} else {
		let task = taskChain[0], f = task.f, parr = isdef(task.parr) ? task.parr : [], t = task.msecs, waitCond = task.waitCond, tWait = task.tWait;

		if (isdef(waitCond) && !waitCond()) {
			if (nundef(tWait)) tWait = 300;
			ChainTimeout = setTimeout(() => _chainExRec(akku, taskChain, onComplete), tWait);
		} else {
			for (let i = 0; i < parr.length; i++) {
				let para = parr[i];
				if (para == '_last') parr[i] = arrLast(akku);
				else if (para == '_all' || para == '_list') parr[i] = akku;
				else if (para == '_first') parr[i] = akku[0];

			}

			let result = f(...parr);
			if (isdef(result)) akku.push(result);

			if (isdef(t)) {
				ChainTimeout = setTimeout(() => _chainExRec(akku, taskChain.slice(1), onComplete), t);
			} else {
				_chainExRec(akku, taskChain.slice(1), onComplete);
			}
		}
	}
}
//#endregion

//#region control flow sleep___

const sleep = m => new Promise(r => setTimeout(r, m))
function sleepX(msecs) {
	//#region doc 
	/*	
example: 
	flag = false;
	functionWithSetTimeouts (after last timeout flag should be set)
	while (!flag) { await sleepX(3000); }
	... continuing code after last timeout!

	*/
	//#endregion 
	return new Promise(r => setTimeout(r, msecs));
}


//#endregion

//#region colors
var colorDict = null; //for color names, initialized when calling anyColorToStandardStyle first time
function colorPalShadeX(color, n) {
	//assumes pSBC compatible color format (hex,rgb strings)
	let res = [];
	let step = 1.6 / (n - 1);
	for (let frac = -0.8; frac <= 0.8; frac += step) { //0.2) {
		//darkest -0.8 -0.6 -0.4 -0.2 0=color 0.2 0.4 0.6 0.8 lightest
		let c = pSBC(frac, color, undefined, true); //colorShade(frac,color);
		res.push(c);
	}
	return res;
}
function getContrastingHue(contrastColor, minDiff = 25, mod = 30) {
	let hc = colorHue(contrastColor);

	let rnd1 = randomNumber(0, 360);
	let d = Math.floor(rnd1 / mod);
	let rnd = d * mod;
	//console.log('==>hue1',rnd1,'mod',mod,'d',d,'hue',rnd)

	let diff = Math.abs(rnd - hc);
	//console.log('hue of', contrastColor, 'is', hc, 'rnd:'+rnd,'diff:'+diff);
	if (diff < minDiff) rnd = (rnd + 180) % 360;
	return rnd;
}
function randomColorLight(contrastTo) { return randomColorX(contrastTo); }
function randomColorDark(contrastTo) { return randomColorX(contrastTo, 10, 30); }
function helleFarbe(contrastTo, minDiff = 25, mod = 30, start = 0) {
	let wheel = getHueWheel(contrastTo, minDiff, mod, start);
	//console.log('wheel',wheel)
	let hue = chooseRandom(wheel);
	let hsl = colorHSLBuild(hue, 100, 50);
	return hsl;
}
function getHueWheel(contrastTo, minDiff = 25, mod = 30, start = 0) {
	let hc = colorHue(contrastTo);
	let wheel = [];
	while (start < 360) {
		let d1 = Math.abs((start + 360) - hc);
		let d2 = Math.abs((start) - hc);
		let d3 = Math.abs((start - 360) - hc);
		let min = Math.min(d1, d2, d3);
		if (min > minDiff) wheel.push(start);
		start += mod;
	}
	return wheel;
}
function colorHSLBuild(hue, sat, lum) { let result = "hsl(" + hue + ',' + sat + '%,' + lum + '%)'; return result; }
function getContrastingHueX(contrastColor, minDiff = 25, mod = 30, startWheel = 0) {
	let wheel = getHueWheel(contrastColor, minDiff, mod, startWheel);
	return chooseRandom(wheel);
}
function randomColorX(contrastColor, minContrast = 25, mod = 60, startWheel = 0, minLum = 70, maxLum = 90, minSat = 100, maxSat = 100) {
	let hue = getContrastingHueX(contrastColor, minContrast, mod, startWheel);
	let sat = minSat + (maxSat - minSat) * Math.random();
	let lum = minLum + (maxLum - minLum) * Math.random();
	let result = "hsl(" + hue + ',' + sat + '%,' + lum + '%)';
	//console.log('result:',result)
	return result; //"hsl(" + hue + ',' + sat + '%,' + lum + '%)';
	//return "hsl(" + 360 * Math.random() + ',' + (25 + 70 * Math.random()) + '%,' + (85 + 10 * Math.random()) + '%)';
}
function anyColorToStandardString(cAny, a, allowHsl = false) {
	//if allowHsl is false: only return rgb,rgba,or hex7,hex9 string! >pBSC algo!!!
	//if a is undefined, leaves a as it is in cAny, otherwise modifies to a
	if (Array.isArray(cAny)) {
		// cAny is rgb array
		if (cAny.length < 3) {
			return randomHexColor();
		} else if (cAny.length == 3) {
			//assume this is a rgb
			let r = cAny[0];
			let g = cAny[1];
			let b = cAny[2];
			return a == undefined || a == 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
		}
	} else if (isString(cAny)) {
		if (cAny[0] == '#') {
			if (a == undefined) return cAny;
			cAny = cAny.substring(0, 7);
			return cAny + (a == 1 ? '' : alphaToHex(a));
		} else if (cAny[0] == 'r' && cAny[1] == 'g') {
			if (a == undefined) return cAny;
			//this is rbg or rgba string
			if (cAny[3] == 'a') {
				//rgba string!
				//console.log('its an rgba string!!!!!');
				if (a < 1) {
					return stringBeforeLast(cAny, ',') + ',' + a + ')';
				} else {
					let parts = cAny.split(',');
					let r = firstNumber(parts[0]);
					return 'rgb(' + r + ',' + parts[1] + ',' + parts[2] + ')';
				}
			} else {
				// simple rgb string
				if (a < 1) {
					//console.log(cAny.length)
					return 'rgba' + cAny.substring(3, cAny.length - 1) + ',' + a + ')';
				} else {
					return cAny;
				}
			}
		} else if (cAny[0] == 'h' && cAny[1] == 's') {
			//hsl or hsla string
			//if hsla and hsla allowed do same as for rgba
			if (allowHsl) {
				if (a == undefined) return cAny;
				if (cAny[3] == 'a') {
					if (a < 1) {
						return stringBeforeLast(cAny, ',') + ',' + a + ')';
					} else {
						let parts = cAny.split(',');
						let r = firstNumber(parts[0]);
						return 'hsl(' + r + ',' + parts[1] + ',' + parts[2] + ')';
					}
				} else {
					//simple hsl string
					return a == 1 ? cAny : 'hsla' + cAny.substring(3, cAny.length - 1) + ',' + a + ')'; //cAny.substring(0,cAny.length-1) + ',' + a + ')';
				}
			} else {
				//convert hsl(a) into rgb(a)
				if (cAny[3] == 'a') {
					cAny = HSLAToRGBA(cAny);
				} else {
					cAny = HSLToRGB(cAny);
				}
				return anyColorToStandardString(cAny, a, allowHsl);
			}
		} else {
			//cAny is color name
			let newcAny = colorNameToHex(cAny);
			//console.log(cAny,newcAny);
			return anyColorToStandardString(newcAny, a, allowHsl);
		}
	} else if (typeof cAny == 'object') {
		//console.log('anyColorToStandardString: cAny is object!!!', cAny);
		//koennte {h: ,s: , l:} oder {r: ,g: ,b:} sein
		if ('h' in cAny) {
			//hsl object
			let hslString = '';
			if (a == undefined || a == 1) {
				hslString = `hsl(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%)`;
			} else {
				hslString = `hsla(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%,${a})`;
			}
			if (allowHsl) {
				return hslString;
			} else {
				return anyColorToStandardString(hslString, a, allowHsl);
			}
		} else if ('r' in cAny) {
			//rgb object
			if (a !== undefined && a < 1) {
				return `rgba(${cAny.r},${cAny.g},${cAny.b},${a})`;
			} else {
				return `rgb(${cAny.r},${cAny.g},${cAny.b})`;
			}
		}
	}
} //ok
const colorShadeX = (c, amt) => {
	let col = colorHex(c);
	col = col.replace(/^#/, '')
	if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2]

	let [r, g, b] = col.match(/.{2}/g);
	([r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt])

	r = Math.max(Math.min(255, r), 0).toString(16)
	g = Math.max(Math.min(255, g), 0).toString(16)
	b = Math.max(Math.min(255, b), 0).toString(16)

	const rr = (r.length < 2 ? '0' : '') + r
	const gg = (g.length < 2 ? '0' : '') + g
	const bb = (b.length < 2 ? '0' : '') + b

	return `#${rr}${gg}${bb}`
}
function colorBright(c, percent) {
	let hex = colorHex(c);
	// strip the leading # if it's there
	hex = hex.replace(/^\s*#|\s*$/g, '');

	// convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
	if (hex.length == 3) {
		hex = hex.replace(/(.)/g, '$1$1');
	}

	var r = parseInt(hex.substr(0, 2), 16),
		g = parseInt(hex.substr(2, 2), 16),
		b = parseInt(hex.substr(4, 2), 16);

	return '#' +
		((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
		((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
		((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}
function alphaToHex(zero1) {
	zero1 = Math.round(zero1 * 100) / 100;
	var alpha = Math.round(zero1 * 255);
	var hex = (alpha + 0x10000)
		.toString(16)
		.substr(-2)
		.toUpperCase();
	var perc = Math.round(zero1 * 100);
	//console.log('alpha from', zero1, 'to', hex);
	return hex;
} //ok
function colorBlend(zero1, c0, c1, log = true) {
	c0 = anyColorToStandardString(c0);
	c1 = anyColorToStandardString(c1);
	return pSBC(zero1, c0, c1, log);
} //ok
function colorShade(plusMinus1, color, log = true) {
	let c = anyColorToStandardString(color);
	return pSBC(plusMinus1, c, undefined, !log);
} //ok
function colorTrans(cAny, alpha = 0.5) {
	return anyColorToStandardString(cAny, alpha);
}
function colorIdealText(bg, grayPreferred = false) {
	let rgb = colorRGB(bg, true);
	//jetzt ist bg rgb object
	const nThreshold = 105; //40; //105;
	let r = rgb.r;
	let g = rgb.g;
	let b = rgb.b;
	var bgDelta = r * 0.299 + g * 0.587 + b * 0.114;
	var foreColor = 255 - bgDelta < nThreshold ? 'black' : 'white';
	if (grayPreferred) foreColor = 255 - bgDelta < nThreshold ? 'dimgray' : 'snow';
	return foreColor;
	// return 'white';
}
function colorFromHue(h, s = 100, l = 50, asObject = false) {
	if (asObject) return { h: h, s: s, l: l }; else return `hsl(${h},${s},${l})`;
}
function colorLighter(c, zero1 = .2, log = true) {
	c = anyColorToStandardString(c);
	return pSBC(zero1, c, undefined, !log);
} //ok
function colorDarker(c, zero1 = .8, log = true) {
	//1 is darkest,0 is orig color
	c = anyColorToStandardString(c);
	return pSBC(-zero1, c, undefined, !log);
} //ok
function colorHex(cAny) {
	//returns hex string w/ alpha channel or without
	let c = anyColorToStandardString(cAny);
	if (c[0] == '#') {
		return c;
	} else {
		//it is now an rgba string and has alpha
		let res = pSBC(0, c, 'c');
		//console.log('in colorHex!!!!', c, res);
		return res;
	}
} //ok
function colorHSL(cAny, asObject = false) {
	//returns { h:[0,360], s:[0,1], l:[0,1]}
	let res = anyColorToStandardString(cAny, undefined, true);
	//console.log(res)
	let shsl = res;
	if (res[0] == '#') {
		//res is a hex string
		if (res.length == 9) {
			shsl = hexAToHSLA(res);
		} else if (res.length == 7) {
			shsl = hexToHSL(res);
		}
	} else if (res[0] == 'r') {
		if (res[3] == 'a') {
			shsl = RGBAToHSLA(res);
		} else {
			shsl = RGBToHSL(res);
		}
	}
	//console.log(shsl);
	let n = allNumbers(shsl);
	//console.log(n);
	if (asObject) {
		return { h: n[0], s: n[1] / 100, l: n[2] / 100, a: n.length > 3 ? n[3] : 1 };
	} else {
		return shsl;
	}
} //ok
function colorHue(cAny) {
	let hsl = colorHSL(cAny, true);
	return hsl.h;
} //ok
function colorLum(cAny) {
	let hsl = colorHSL(cAny, true);
	return hsl.l;
} //ok
function colorSat(cAny) {
	let hsl = colorHSL(cAny, true);
	return hsl.s;
} //ok
function colorA(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.a;
} //ok
function colorR(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.r;
} //ok
function colorG(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.g;
} //ok
function colorB(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.b;
} //ok
function colorRGB(cAny, asObject = false) {
	//returns { r:[0,255], g:[0,255], b:[0,255]}
	let res = anyColorToStandardString(cAny);
	let srgb = res;
	if (res[0] == '#') {
		srgb = pSBC(0, res, 'c');
	}
	//console.log(shsl);
	let n = allNumbers(srgb);
	//console.log(n);
	if (asObject) {
		return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
	} else {
		return srgb;
	}
} //ok
function colorNameToHex(cName) {
	let key = cName.toLowerCase();
	if (!colorDict) {
		colorDict = {};
		let names = getColorNames();
		let hexes = getColorHexes();
		for (let i = 0; i < names.length; i++) {
			colorDict[names[i].toLowerCase()] = '#' + hexes[i];
		}
	}
	return key in colorDict ? colorDict[key] : randomHexColor();
} //ok
function colorPalShade(color) {
	//assumes pSBC compatible color format (hex,rgb strings)
	let res = [];
	for (let frac = -0.8; frac <= 0.8; frac += 0.2) {
		//darkest -0.8 -0.6 -0.4 -0.2 0=color 0.2 0.4 0.6 0.8 lightest
		let c = pSBC(frac, color, undefined, true); //colorShade(frac,color);
		res.push(c);
	}
	return res;
}
function getColorNames() {
	return [
		'AliceBlue',
		'AntiqueWhite',
		'Aqua',
		'Aquamarine',
		'Azure',
		'Beige',
		'Bisque',
		'Black',
		'BlanchedAlmond',
		'Blue',
		'BlueViolet',
		'Brown',
		'BurlyWood',
		'CadetBlue',
		'Chartreuse',
		'Chocolate',
		'Coral',
		'CornflowerBlue',
		'Cornsilk',
		'Crimson',
		'Cyan',
		'DarkBlue',
		'DarkCyan',
		'DarkGoldenRod',
		'DarkGray',
		'DarkGrey',
		'DarkGreen',
		'DarkKhaki',
		'DarkMagenta',
		'DarkOliveGreen',
		'DarkOrange',
		'DarkOrchid',
		'DarkRed',
		'DarkSalmon',
		'DarkSeaGreen',
		'DarkSlateBlue',
		'DarkSlateGray',
		'DarkSlateGrey',
		'DarkTurquoise',
		'DarkViolet',
		'DeepPink',
		'DeepSkyBlue',
		'DimGray',
		'DimGrey',
		'DodgerBlue',
		'FireBrick',
		'FloralWhite',
		'ForestGreen',
		'Fuchsia',
		'Gainsboro',
		'GhostWhite',
		'Gold',
		'GoldenRod',
		'Gray',
		'Grey',
		'Green',
		'GreenYellow',
		'HoneyDew',
		'HotPink',
		'IndianRed',
		'Indigo',
		'Ivory',
		'Khaki',
		'Lavender',
		'LavenderBlush',
		'LawnGreen',
		'LemonChiffon',
		'LightBlue',
		'LightCoral',
		'LightCyan',
		'LightGoldenRodYellow',
		'LightGray',
		'LightGrey',
		'LightGreen',
		'LightPink',
		'LightSalmon',
		'LightSeaGreen',
		'LightSkyBlue',
		'LightSlateGray',
		'LightSlateGrey',
		'LightSteelBlue',
		'LightYellow',
		'Lime',
		'LimeGreen',
		'Linen',
		'Magenta',
		'Maroon',
		'MediumAquaMarine',
		'MediumBlue',
		'MediumOrchid',
		'MediumPurple',
		'MediumSeaGreen',
		'MediumSlateBlue',
		'MediumSpringGreen',
		'MediumTurquoise',
		'MediumVioletRed',
		'MidnightBlue',
		'MintCream',
		'MistyRose',
		'Moccasin',
		'NavajoWhite',
		'Navy',
		'OldLace',
		'Olive',
		'OliveDrab',
		'Orange',
		'OrangeRed',
		'Orchid',
		'PaleGoldenRod',
		'PaleGreen',
		'PaleTurquoise',
		'PaleVioletRed',
		'PapayaWhip',
		'PeachPuff',
		'Peru',
		'Pink',
		'Plum',
		'PowderBlue',
		'Purple',
		'RebeccaPurple',
		'Red',
		'RosyBrown',
		'RoyalBlue',
		'SaddleBrown',
		'Salmon',
		'SandyBrown',
		'SeaGreen',
		'SeaShell',
		'Sienna',
		'Silver',
		'SkyBlue',
		'SlateBlue',
		'SlateGray',
		'SlateGrey',
		'Snow',
		'SpringGreen',
		'SteelBlue',
		'Tan',
		'Teal',
		'Thistle',
		'Tomato',
		'Turquoise',
		'Violet',
		'Wheat',
		'White',
		'WhiteSmoke',
		'Yellow',
		'YellowGreen'
	];
} //ok
function getColorHexes(x) {
	return [
		'f0f8ff',
		'faebd7',
		'00ffff',
		'7fffd4',
		'f0ffff',
		'f5f5dc',
		'ffe4c4',
		'000000',
		'ffebcd',
		'0000ff',
		'8a2be2',
		'a52a2a',
		'deb887',
		'5f9ea0',
		'7fff00',
		'd2691e',
		'ff7f50',
		'6495ed',
		'fff8dc',
		'dc143c',
		'00ffff',
		'00008b',
		'008b8b',
		'b8860b',
		'a9a9a9',
		'a9a9a9',
		'006400',
		'bdb76b',
		'8b008b',
		'556b2f',
		'ff8c00',
		'9932cc',
		'8b0000',
		'e9967a',
		'8fbc8f',
		'483d8b',
		'2f4f4f',
		'2f4f4f',
		'00ced1',
		'9400d3',
		'ff1493',
		'00bfff',
		'696969',
		'696969',
		'1e90ff',
		'b22222',
		'fffaf0',
		'228b22',
		'ff00ff',
		'dcdcdc',
		'f8f8ff',
		'ffd700',
		'daa520',
		'808080',
		'808080',
		'008000',
		'adff2f',
		'f0fff0',
		'ff69b4',
		'cd5c5c',
		'4b0082',
		'fffff0',
		'f0e68c',
		'e6e6fa',
		'fff0f5',
		'7cfc00',
		'fffacd',
		'add8e6',
		'f08080',
		'e0ffff',
		'fafad2',
		'd3d3d3',
		'd3d3d3',
		'90ee90',
		'ffb6c1',
		'ffa07a',
		'20b2aa',
		'87cefa',
		'778899',
		'778899',
		'b0c4de',
		'ffffe0',
		'00ff00',
		'32cd32',
		'faf0e6',
		'ff00ff',
		'800000',
		'66cdaa',
		'0000cd',
		'ba55d3',
		'9370db',
		'3cb371',
		'7b68ee',
		'00fa9a',
		'48d1cc',
		'c71585',
		'191970',
		'f5fffa',
		'ffe4e1',
		'ffe4b5',
		'ffdead',
		'000080',
		'fdf5e6',
		'808000',
		'6b8e23',
		'ffa500',
		'ff4500',
		'da70d6',
		'eee8aa',
		'98fb98',
		'afeeee',
		'db7093',
		'ffefd5',
		'ffdab9',
		'cd853f',
		'ffc0cb',
		'dda0dd',
		'b0e0e6',
		'800080',
		'663399',
		'ff0000',
		'bc8f8f',
		'4169e1',
		'8b4513',
		'fa8072',
		'f4a460',
		'2e8b57',
		'fff5ee',
		'a0522d',
		'c0c0c0',
		'87ceeb',
		'6a5acd',
		'708090',
		'708090',
		'fffafa',
		'00ff7f',
		'4682b4',
		'd2b48c',
		'008080',
		'd8bfd8',
		'ff6347',
		'40e0d0',
		'ee82ee',
		'f5deb3',
		'ffffff',
		'f5f5f5',
		'ffff00',
		'9acd32'
	];
} //ok
function getPalette(color, type = 'shade') {
	color = anyColorToStandardString(color);
	return colorPalShade(color);
}
function getTransPalette(color = '#000000') {
	let res = [];
	for (const alpha of [.0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1]) res.push(colorTrans(color, alpha));
	return res;
}
function getTransPalette9(color = '#000000') {
	let res = [];
	for (const alpha of [.1, .2, .3, .4, .5, .6, .7, .8, .9]) res.push(colorTrans(color, alpha));
	return res;
}
//color converters good!
function hexToHSL(H) {
	let ex = /^#([\da-f]{3}){1,2}$/i;
	if (ex.test(H)) {
		// convert hex to RGB first
		let r = 0,
			g = 0,
			b = 0;
		if (H.length == 4) {
			r = '0x' + H[1] + H[1];
			g = '0x' + H[2] + H[2];
			b = '0x' + H[3] + H[3];
		} else if (H.length == 7) {
			r = '0x' + H[1] + H[2];
			g = '0x' + H[3] + H[4];
			b = '0x' + H[5] + H[6];
		}
		// then to HSL
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		if (h < 0) h += 360;

		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	} else {
		return 'Invalid input color';
	}
} //ok
function hexAToHSLA(H) {
	let ex = /^#([\da-f]{4}){1,2}$/i;
	if (ex.test(H)) {
		let r = 0,
			g = 0,
			b = 0,
			a = 1;
		// 4 digits
		if (H.length == 5) {
			r = '0x' + H[1] + H[1];
			g = '0x' + H[2] + H[2];
			b = '0x' + H[3] + H[3];
			a = '0x' + H[4] + H[4];
			// 8 digits
		} else if (H.length == 9) {
			r = '0x' + H[1] + H[2];
			g = '0x' + H[3] + H[4];
			b = '0x' + H[5] + H[6];
			a = '0x' + H[7] + H[8];
		}

		// normal conversion to HSLA
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		if (h < 0) h += 360;

		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		a = (a / 255).toFixed(3);

		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function HSLToRGB(hsl, isPct) {
	//if isPct == true, will output 'rgb(xx%,xx%,xx%)' umgerechnet in % von 255
	let ex = /^hsl\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}|(\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2})\)$/i;
	if (ex.test(hsl)) {
		let sep = hsl.indexOf(',') > -1 ? ',' : ' ';
		hsl = hsl
			.substr(4)
			.split(')')[0]
			.split(sep);
		isPct = isPct === true;

		let h = hsl[0],
			s = hsl[1].substr(0, hsl[1].length - 1) / 100,
			l = hsl[2].substr(0, hsl[2].length - 1) / 100;

		// strip label and convert to degrees (if necessary)
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		// keep hue fraction of 360 if ending up over
		if (h >= 360) h %= 360;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
		}

		return 'rgb(' + (isPct ? r + '%,' + g + '%,' + b + '%' : +r + ',' + +g + ',' + +b) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function HSLAToRGBA(hsla, isPct) {
	//if isPct == true, will output 'rgb(xx%,xx%,xx%)' umgerechnet in % von 255
	let ex = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(hsla)) {
		let sep = hsla.indexOf(',') > -1 ? ',' : ' ';
		hsla = hsla
			.substr(5)
			.split(')')[0]
			.split(sep);

		// strip the slash if using space-separated syntax
		if (hsla.indexOf('/') > -1) hsla.splice(3, 1);

		isPct = isPct === true;

		// must be fractions of 1
		let h = hsla[0],
			s = hsla[1].substr(0, hsla[1].length - 1) / 100,
			l = hsla[2].substr(0, hsla[2].length - 1) / 100,
			a = hsla[3];

		// strip label and convert to degrees (if necessary)
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		let pctFound = a.indexOf('%') > -1;

		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
			if (!pctFound) {
				a *= 100;
			} else {
				a = a.substr(0, a.length - 1);
			}
		} else if (pctFound) {
			a = a.substr(0, a.length - 1) / 100;
		}

		return 'rgba(' + (isPct ? r + '%,' + g + '%,' + b + '%,' + a + '%' : +r + ',' + +g + ',' + +b + ',' + +a) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function RGBToHex7(c) {
	let n = allNumbers(c);
	if (c.includes('%')) {
		n[0] = Math.round((n[0] * 255) / 100);
		n[1] = Math.round((n[1] * 255) / 100);
		n[2] = Math.round((n[2] * 255) / 100);
	}
	return '#' + ((1 << 24) + (n[0] << 16) + (n[1] << 8) + n[2]).toString(16).slice(1);
} //ok
function RGBAToHex9(rgba) {
	let n = allNumbers(rgba); //allNumbers does not catch .5 as float!
	//console.log('all numbers:', n);
	if (n.length < 3) {
		//console.log('RGBAToHex ERROR!', rgba);
		return randomHexColor();
	}
	let a = n.length > 3 ? n[3] : 1;
	let sa = alphaToHex(a);
	//console.log('sa:', sa);
	if (rgba.includes('%')) {
		n[0] = Math.round((n[0] * 255) / 100);
		n[1] = Math.round((n[1] * 255) / 100);
		n[2] = Math.round((n[2] * 255) / 100);
	}
	return '#' + ((1 << 24) + (n[0] << 16) + (n[1] << 8) + n[2]).toString(16).slice(1) + sa;
} //ok
function RGBToHSL(rgb) {
	let ex = /^rgb\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){2}|((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s)){2})((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]))|((((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){2}|((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){2})(([1-9]?\d(\.\d+)?)|100|(\.\d+))%))\)$/i;
	if (ex.test(rgb)) {
		let sep = rgb.indexOf(',') > -1 ? ',' : ' ';
		rgb = rgb
			.substr(4)
			.split(')')[0]
			.split(sep);

		// convert %s to 0–255
		for (let R in rgb) {
			let r = rgb[R];
			if (r.indexOf('%') > -1) rgb[R] = Math.round((r.substr(0, r.length - 1) / 100) * 255);
		}

		// make r, g, and b fractions of 1
		let r = rgb[0] / 255,
			g = rgb[1] / 255,
			b = rgb[2] / 255,
			// find greatest and smallest channel values
			cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		// calculate hue
		// no difference
		if (delta == 0) h = 0;
		// red is max
		else if (cmax == r) h = ((g - b) / delta) % 6;
		// green is max
		else if (cmax == g) h = (b - r) / delta + 2;
		// blue is max
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		// make negative hues positive behind 360°
		if (h < 0) h += 360;

		// calculate lightness
		l = (cmax + cmin) / 2;

		// calculate saturation
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

		// multiply l and s by 100
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	} else {
		return 'Invalid input color';
	}
} //ok
function RGBAToHSLA(rgba) {
	let ex = /^rgba\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){3}))|(((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){3}))\/\s)((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(rgba)) {
		let sep = rgba.indexOf(',') > -1 ? ',' : ' ';
		rgba = rgba
			.substr(5)
			.split(')')[0]
			.split(sep);

		// strip the slash if using space-separated syntax
		if (rgba.indexOf('/') > -1) rgba.splice(3, 1);

		for (let R in rgba) {
			let r = rgba[R];
			if (r.indexOf('%') > -1) {
				let p = r.substr(0, r.length - 1) / 100;

				if (R < 3) {
					rgba[R] = Math.round(p * 255);
				}
			}
		}

		// make r, g, and b fractions of 1
		let r = rgba[0] / 255,
			g = rgba[1] / 255,
			b = rgba[2] / 255,
			a = rgba[3],
			// find greatest and smallest channel values
			cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		// calculate hue
		// no difference
		if (delta == 0) h = 0;
		// red is max
		else if (cmax == r) h = ((g - b) / delta) % 6;
		// green is max
		else if (cmax == g) h = (b - r) / delta + 2;
		// blue is max
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		// make negative hues positive behind 360°
		if (h < 0) h += 360;

		// calculate lightness
		l = (cmax + cmin) / 2;

		// calculate saturation
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

		// multiply l and s by 100
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function HSLAToRGBA(hsla, isPct) {
	//if isPct == true, will output 'rgb(xx%,xx%,xx%)' umgerechnet in % von 255
	let ex = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(hsla)) {
		let sep = hsla.indexOf(',') > -1 ? ',' : ' ';
		hsla = hsla
			.substr(5)
			.split(')')[0]
			.split(sep);

		// strip the slash if using space-separated syntax
		if (hsla.indexOf('/') > -1) hsla.splice(3, 1);

		isPct = isPct === true;

		// must be fractions of 1
		let h = hsla[0],
			s = hsla[1].substr(0, hsla[1].length - 1) / 100,
			l = hsla[2].substr(0, hsla[2].length - 1) / 100,
			a = hsla[3];

		// strip label and convert to degrees (if necessary)
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		let pctFound = a.indexOf('%') > -1;

		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
			if (!pctFound) {
				a *= 100;
			} else {
				a = a.substr(0, a.length - 1);
			}
		} else if (pctFound) {
			a = a.substr(0, a.length - 1) / 100;
		}

		return 'rgba(' + (isPct ? r + '%,' + g + '%,' + b + '%,' + a + '%' : +r + ',' + +g + ',' + +b + ',' + +a) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function hslToHslaString(h, s, l, a = 1) {
	// hsl is object
	return 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
}
function pSBC(p, c0, c1, l) {
	//usage:
	// (blacken) -1.0 <= p <= 1.0 (whiten), or (c0) 0 <= p <= 1.0 (c1) when blending (ie., c1 given)
	// c0: #F3D or #F3DC or #FF33DD or #FF33DDCC or rgb(23,4,55) or rgba(23,4,55,0.52) ... from color
	// c1: #F3D or #F3DC or #FF33DD or #FF33DDCC or rgb(23,4,55) or rgba(23,4,55,0.52) ... to color (blending)
	// 		or 'c' for conversion between hex string and rgb string
	// l true:log blending, [false:linear blending]=default!
	let r,
		g,
		b,
		P,
		f,
		t,
		h,
		i = parseInt,
		m = Math.round,
		a = typeof c1 == 'string';
	if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
	if (!this.pSBCr)
		this.pSBCr = d => {
			let n = d.length,
				x = {};
			if (n > 9) {
				([r, g, b, a] = d = d.split(',')), (n = d.length);
				if (n < 3 || n > 4) return null;
				(x.r = i(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = i(g)), (x.b = i(b)), (x.a = a ? parseFloat(a) : -1);
			} else {
				if (n == 8 || n == 6 || n < 4) return null;
				if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
				d = i(d.slice(1), 16);
				if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
				else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
			}
			return x;
		};
	(h = c0.length > 9),
		(h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h),
		(f = pSBCr(c0)),
		(P = p < 0),
		(t = c1 && c1 != 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }),
		(p = P ? p * -1 : p),
		(P = 1 - p);
	if (!f || !t) return null;
	if (l) (r = m(P * f.r + p * t.r)), (g = m(P * f.g + p * t.g)), (b = m(P * f.b + p * t.b));
	else (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)), (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)), (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
	(a = f.a), (t = t.a), (f = a >= 0 || t >= 0), (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
	if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
	else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
} //ok SUPER COOL!!!!
function bestContrastingColor(color, colorlist) {
	//console.log('dddddddddddddddd')
	let contrast = 0;
	let result = null;
	let rgb = colorRGB(color, true);
	rgb = [rgb.r, rgb.g, rgb.b];
	for (c1 of colorlist) {
		let x = colorRGB(c1, true)
		x = [x.r, x.g, x.b];
		let c = getContrast(rgb, x);
		//console.log(rgb,x,c);
		if (c > contrast) { contrast = c; result = c1; }
	}
	//console.log(contrast,result)
	return result;
}
function luminance(r, g, b) {
	var a = [r, g, b].map(function (v) {
		v /= 255;
		return v <= 0.03928
			? v / 12.92
			: Math.pow((v + 0.055) / 1.055, 2.4);
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function getContrast(rgb1, rgb2) {
	// usage:
	// contrast([255, 255, 255], [255, 255, 0]); // 1.074 for yellow
	// contrast([255, 255, 255], [0, 0, 255]); // 8.592 for blue
	// minimal recommended contrast ratio is 4.5, or 3 for larger font-sizes
	var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
	var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
	var brightest = Math.max(lum1, lum2);
	var darkest = Math.min(lum1, lum2);
	return (brightest + 0.05)
		/ (darkest + 0.05);
}
//#endregion

//#region CSS helpers
function addClass(el, clName) { if (!el) return; el.classList.add(clName); }
function getClass(el) { return el.classList.value; }//getAttribute('class'); }
function removeClass(el, clName) { if (!el) return; el.classList.remove(clName); }
function setCSSVariable(varName, val) {
	let root = document.documentElement;
	root.style.setProperty(varName, val);
}
//#endregion

//#region DOM: creating divs: 2020
function addDivU({ id, dParent, w, h, unit, fg, bg, position, x, y, html, className, styleStr, border, rounding, gap, margin, padding, float, textAlign, fz }) {
	let d1 = document.createElement('div');
	if (isdef(dParent)) dParent.appendChild(d1); else dParent = null;
	if (isdef(id)) d1.id = id;
	if (isdef(fg)) d1.style.setProperty('color', fg);
	if (isdef(bg)) d1.style.setProperty('background-color', bg);
	if (isdef(html)) d1.innerHTML = html;

	//size and position
	//positioning_ with gap: x,y,w,h MUST be numbers for this to work!
	if (gap > 0 && (unit == '%' || dParent && isdef(dParent.offsetWidth) && isdef(dParent.offsetHeight))) {
		//check if this div touches right border of parent
		let wCont = unit == '%' ? 100 : dParent.offsetWidth;
		let isRight = x + w >= wCont;
		let hCont = unit == '%' ? 100 : dParent.offsetHeight;
		let isBottom = y + h >= hCont;
		//console.log(wCont, 'isRight', isRight);
		//console.log(hCont, 'isBottom', isBottom);
		x += gap;
		y += gap;
		w -= (isRight ? 2 : 1) * gap;
		h -= (isBottom ? 2 : 1) * gap;
	}

	if (nundef(unit)) unit = '%';
	if (isdef(w)) d1.style.setProperty('width', makeUnitString(w, unit));
	if (isdef(h)) d1.style.setProperty('height', makeUnitString(h, unit));
	if (isdef(x) || isdef(y)) { posXY(d1, dParent, x, y, unit, position); }
	if (isdef(className)) d1.classList.add(className);
	if (isdef(styleStr)) d1.style.cssText += styleStr;
	if (isdef(border)) {
		d1.style.border = border;
		if (isdef(rounding)) d1.style.borderRadius = rounding;
	}
	if (isdef(margin)) d1.style.setProperty('margin', makeUnitString(margin, 'px'));
	if (isdef(padding)) d1.style.setProperty('padding', makeUnitString(padding, 'px'));
	if (float) d1.style.setProperty('float', float);
	if (textAlign) d1.style.textAlign = textAlign;
	if (isdef(fz)) d1.style.setProperty('fontSize', makeUnitString(fz, 'px'));

	return d1;
}
//code 2020
function addDivToBody(w = 100, h = 100, unit = '%', bg = 'blue') { return addDivU({ dParent: document.body, w: w, h: h, unit: unit, bg: bg }); }
function addDivTo(dParent, w = 100, h = 100, unit = '%', bg = 'blue') { return addDivU({ dParent: dParent, w: w, h: h, unit: unit, bg: bg }); }
function addDivPosTo(dParent, x = 0, y = 0, w = 100, h = 100, unit = '%', bg = 'blue', position = 'absolute') {
	return addDivU({ dParent: dParent, x: x, y: y, w: w, h: h, unit: unit, position: position, bg: bg });
}
function createElementFromHTML(htmlString) {
	//console.log('---------------',htmlString)
	var div = document.createElement('div');
	div.innerHTML = htmlString.trim();// '<div>halloooooooooooooo</div>';// htmlString.trim();

	// Change this to div.childNodes to support multiple top-level nodes
	//console.log(div.firstChild)
	return div.firstChild;
}
function makeUnitString(nOrString, unit = 'px', defaultVal = '100%') {
	if (nundef(nOrString)) return defaultVal;
	if (isNumber(nOrString)) nOrString = '' + nOrString + unit;
	return nOrString;
}
//code 2019
function addDiv(dParent, { html, w = '100%', h = '100%', bg, fg, border, rounding, margin, padding, float, position, x, y, textAlign, fontSize }) {
	return addDivU({ dParent: dParent, html: html, w: w, h: h, bg: bg, fg: fg, border: border, rounding: rounding, margin: margin, padding: padding, float: float, position: position, x: x, y: y, textAlign: textAlign, fz: fontSize });
}
function addDivPosGap(dParent, x, y, w, h, { gap, bg, fg, border, rounding, textAlign, fontSize, position = 'absolute' } = {}) {
	return addDivU({ dParent: dParent, x: x, y: y, w: w, h: h, gap: gap, bg: bg, fg: fg, border: border, textAlign: textAlign, fz: fontSize, position: position });
}
function addStyledDiv(dParent, id, html, styleString) { return addDivU({ dParent: dParent, id: id, html: html, styleStr: styleString }); }
function addDivClass(dParent, id, className) { return addDivU({ dParent: dParent, id: id, className: className }); }
function addDivFill(id, dParent) { return addDivU({ dParent: dParent, id: id, w: '100%', h: '100%' }); }
function addDivFullClass(dParent, id, className) { return addDivU({ dParent: dParent, id: id, w: '100%', h: '100%', className: className }); }
//flex-grid class must exist!
function addFlexGridDiv(dParent) { return addDivU({ dParent: dParent, className: 'flex-grid' }); }

//#endregion

//#region DOM: creating g elements
function addSvgg(dParent, gid, { w = '100%', h = '100%', bg, fg, originInCenter = false } = {}) {
	//div dParent gets an svg and inside a g, returns g
	//dParent must have its bounds width and height set
	let svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

	if (!dParent.style.width || !dParent.style.height) {
		let pBounds = getBounds(dParent);
		w = pBounds.width + 'px';
		h = pBounds.height + 'px';
		if (pBounds.width == 0) {
			w = '100%';
			h = '100%';
		}
		//console.log('--- addSvgg: CORRECTING MISSING WIDTH AND HEIGHT ON PARENT ---', dParent.id,w,h);

		// svg1.setAttribute('width', pBounds.width + 'px');
		// svg1.setAttribute('height', pBounds.height + 'px');
		// dParent.style.setProperty('width', pBounds.width + 'px');
		// dParent.style.setProperty('height', pBounds.height + 'px');
	}
	if (!dParent.style.position) dParent.style.position = 'relative';

	svg1.setAttribute('width', w);
	svg1.setAttribute('height', h);
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	if (bg) style += 'background-color:' + bg;
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);

	let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	if (gid) g1.id = gid;
	svg1.appendChild(g1);
	// if (originInCenter) { g1.style='transform:translate(50%, 50%)'; } //works!
	// if (originInCenter) { g1.setAttribute('class', 'gCentered'); } //works! but: relies on class gCentered
	// console.log('____________________________')
	// console.log(getBounds(svg1))
	// console.log(getBounds(dParent))
	if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; } //works!

	return g1;
}
function addSvggViewbox(dParent, gid, { w = '100%', h = '100%', bg, fg, originInCenter = false } = {}) {
	//div dParent gets an svg and inside a g, returns g
	//dParent must have its bounds width and height set
	let svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

	if (!dParent.style.width || !dParent.style.height) {
		let pBounds = getBounds(dParent);
		w = pBounds.width + 'px';
		h = pBounds.height + 'px';
	}
	if (!dParent.style.position) dParent.style.position = 'relative';

	svg1.setAttribute('width', w);
	svg1.setAttribute('height', h);
	svg1.setAttribute('viewBox', "0 0 433 375");
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	if (bg) style += 'background-color:' + bg;
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);

	let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	if (gid) g1.id = gid;
	svg1.appendChild(g1);
	// if (originInCenter) { g1.style='transform:translate(50%, 50%)'; } //works!
	// if (originInCenter) { g1.setAttribute('class', 'gCentered'); } //works! but: relies on class gCentered
	// console.log('____________________________')
	// console.log(getBounds(svg1))
	// console.log(getBounds(dParent))
	if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; } //works!

	return g1;
}

//#endregion

//#region DOM: coordinate and bounds helpers, text measuring!
var resizeObserver = new ResizeObserver(entries => {
	for (let entry of entries) {
		let cs = window.getComputedStyle(entry.target);
		console.log('watching element:', entry.target);
		console.log(entry.contentRect.top, ' is ', cs.paddingTop);
		console.log(entry.contentRect.left, ' is ', cs.paddingLeft);
		console.log(entry.borderBoxSize[0].inlineSize, ' is ', cs.width);
		console.log(entry.borderBoxSize[0].blockSize, ' is ', cs.height);
		if (entry.target.handleResize)
			entry.target.handleResize(entry);
	}
});
class MaxWidthPreserver {
	constructor() {
		this.entries = {};
		this.resizeObserver = new ResizeObserver(this.handler.bind(this));
	}
	handler(entries) {
		//console.log('........entries:', entries, 'this.entries', this.entries)
		for (let entry of entries) {
			let domel = entry.target;
			let cs = window.getComputedStyle(entry.target);
			let w = firstNumber(cs.width);

			let id = domel.id;
			let x = this.entries[id];
			//console.log('domel', domel, '\nid', id, '\nw', w, '\nx', x)
			if (isdef(x)) {
				if (w < x.minWidth && Math.abs(w - x.minWidth) > 1) {
					//console.log('!!!!!!!!!!!!!!');
					w = x.minWidth;
					domel.style.minWidth = w + 'px';
				}
				x.minWidth = w;
				//console.log('width is', w);
			}
		}
	}
	add(id) {
		//console.log(id)
		let entry = this.entries[id] = { elem: mBy(id) };
		let cs = window.getComputedStyle(entry.elem);
		this.resizeObserver.observe(mBy(id));
		entry.minWidth = firstNumber(cs.width);
	}
	reset(id) { this.entries[id].elem.styles.minWidth = this.entries[id].minWidth = 0; }
}

var maxWidthPreserver = new MaxWidthPreserver();
var xxxxxxxxxx = new ResizeObserver(entries => {
	for (let entry of entries) {
		let cs = window.getComputedStyle(entry.target);
		console.log('watching element:', entry.target);
		console.log(entry.contentRect.top, ' is ', cs.paddingTop);
		console.log(entry.contentRect.left, ' is ', cs.paddingLeft);
		console.log(entry.borderBoxSize[0].inlineSize, ' is ', cs.width);
		console.log(entry.borderBoxSize[0].blockSize, ' is ', cs.height);
		if (entry.target.handleResize)
			entry.target.handleResize(entry);
	}
});

function myFunction() {
	console.log('onresize!!!');
	//for(const id of [])
}
function actualWidth(elem) { return Math.round(getBounds(elem).width); }
function actualHeight(elem) { return Math.round(getBounds(elem).height); }
function actualLeft(elem, relToParent = false, elRelTo) { return Math.round(getBounds(elem, relToParent, elRelTo).left); }
function actualTop(elem, relToParent = false, elRelTo) { return Math.round(getBounds(elem, relToParent, elRelTo).top); }
function actualCenter(elem, relToParent = false, elRelTo) {
	let b = getBounds(elem, relToParent, elRelTo);
	return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) };
}
function calcNumRowsFitting(dParent, maxHeight, html) {
	let sz = getTextSize(html, dParent);
	//console.log('line height as per calcNumRowsFitting',sz.h);
	return maxHeight / (sz.h + 2);
}
function getRelBounds(elem, elRel) {
	let b1 = elem.getBoundingClientRect();
	if (!elRel) return b1;
	let b2 = elRel.getBoundingClientRect();
	return {
		x: b1.x - b2.x,
		y: b1.y - b2.y,
		left: b1.left - b2.left,
		top: b1.top - b2.top,
		right: b1.right - b2.right,
		bottom: b1.bottom - b2.bottom,
		width: b1.width,
		height: b1.height
	};
}
function getBounds(elem, relToParent = false, relativeToElem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (relToParent) return getRelBounds(elem, getParent(elem));
	else if (isdef(relativeToElem)) return getRelBounds(elem, relativeToElem);
	else return elem.getBoundingClientRect();
}
function getRelCoords(ev, elem) {
	let x = ev.pageX - elem.offset().left;
	let y = ev.pageY - elem.offset().top;
	//console.log('coords rel to',elm,':',x,y);
	return { x: x, y: y };
}
function getRelCoordsX(ev, elem) {
	let x = ev.pageX - elem.getBoundingClientRect().left; //.offset().left;
	let y = ev.pageY - elem.getBoundingClientRect().top;
	//console.log('coords rel to',elm,':',x,y);
	return { x: x, y: y };
}
function getElemSize(elem) {
	var d = document.createElement("div");
	document.body.appendChild(d);
	//console.log(styles);
	let cStyles = { position: 'fixed', opacity: 0, top: '-9999px' };
	mStyleX(d, cStyles);
	mAppend(d, elem);
	//d.innerHTML = text;
	height = d.clientHeight;
	width = d.clientWidth;
	//console.log(d)
	d.parentNode.removeChild(d);
	//elem.remove();
	return { w: width, h: height };
}
function getSizeWithStyles(text, styles) {
	var d = document.createElement("div");
	document.body.appendChild(d);
	//console.log(styles);
	let cStyles = jsCopy(styles);
	cStyles.position = 'fixed';
	cStyles.opacity = 0;
	cStyles.top = '-9999px';
	mStyleX(d, cStyles);
	d.innerHTML = text;
	height = d.clientHeight;
	width = d.clientWidth;
	let b = getBounds(d);
	//console.log('b',b.width,b.height,'=?',width,height,'\ntextStyles',styles)
	//console.log(d)
	d.parentNode.removeChild(d);
	return { w: width, h: height };
}
function getWordSize(text, fz, family, weight = 900) {
	let st = {
		fz: fz,
		display: 'inline-block',
		bg: 'green',
		family: family,
		weight: weight, //900, //'bold', //weight, //'bold',
	};
	return getSizeWithStyles(text, st);
}
function getWordSize2(text, fz, family, weight = 900) {
	var d = document.createElement("div");
	document.body.appendChild(d);
	d.style.fontSize = fz + 'px';
	d.style.opacity = 0;
	d.style.position = 'fixed';
	d.style.top = '-9999px';
	d.style.display = 'inline-block';
	d.style.backgroundColor = 'green';
	d.style.fontFamily = family;
	d.style.fontWeight = weight; //'bold';
	d.innerHTML = text;
	height = d.clientHeight;
	width = d.clientWidth;
	//console.log(d)
	d.parentNode.removeChild(d)
	return { w: width, h: height };
}
function getWordSize_dep(text, fz, family, weight = 900) {
	console.log('hier!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
	var d = document.createElement("div");
	document.body.appendChild(d);
	//console.log(styles);

	d.innerHTML = text;
	d.style.fontSize = fz + 'px';
	//d.styles.opacity = 0;
	d.style.position = 'fixed';
	//d.style.top = '-9999px';
	d.style.fontFamily = family;
	d.style.fontWeight = 900;

	// let cStyles = {
	// 	font: generateFontString(fz, family, weight),
	// 	position: 'fixed',
	// 	opacity: 0,
	// 	top: '-9999px'

	// };

	// mStyleX(d, cStyles);
	let b = getBounds(d);
	height = d.clientHeight;
	width = d.clientWidth;
	//console.log(b.width, b.height, 'vs', width, height)
	//d.parentNode.removeChild(d)
	return { w: width, h: height };
}
function getTextSizeX(text, fz, family, weight = 900, parentDivOrId = null, styles = {}) {
	var d = document.createElement("div");
	styles.fz = fz;
	styles.family = family;
	styles['font-weight'] = weight;
	styles.position = 'fixed';
	styles.opacity = 0;
	styles.top = '-9999px';
	styles.w = 200;
	mStyleX(d, styles);
	d.innerHTML = text;
	//newDiv.style.cssText = "position:fixed; top:-9999px; opacity:0;"
	if (isdef(parentDivOrId)) {
		if (isString(parentDivOrId)) parentDivOrId = document.getElementById(parentDivOrId);
		parentDivOrId.appendChild(d);
	} else {
		document.body.appendChild(d);
	}
	height = d.clientHeight;
	width = d.clientWidth;
	d.parentNode.removeChild(d)
	return { w: width, h: height };
}
function getTextSizeX1(text, fz, family, weight = 900, parentDivOrId = null, styles = {}) {
	var d = document.createElement("div");
	styles.fz = fz;
	styles.family = family;
	styles['font-weight'] = weight;
	styles.position = 'fixed';
	styles.opacity = 0;
	styles.top = '-9999px';
	mStyleX(d, styles);
	d.innerHTML = text;
	//newDiv.style.cssText = "position:fixed; top:-9999px; opacity:0;"
	if (isdef(parentDivOrId)) {
		if (isString(parentDivOrId)) parentDivOrId = document.getElementById(parentDivOrId);
		parentDivOrId.appendChild(d);
	} else {
		document.body.appendChild(d);
	}
	height = d.clientHeight;
	width = d.clientWidth;
	//d.parentNode.removeChild(d)
	return { w: width, h: height, d: d };
}

function getTextSize(s = 'hallo', parentDivOrId) {
	var newDiv = document.createElement("div");
	newDiv.innerHTML = s;
	newDiv.style.cssText = "position:fixed; top:-9999px; opacity:0;"
	if (isdef(parentDivOrId)) {
		if (isString(parentDivOrId)) parentDivOrId = document.getElementById(parentDivOrId);
		parentDivOrId.appendChild(newDiv);
	} else {
		document.body.appendChild(newDiv);
	}
	height = newDiv.clientHeight;
	width = newDiv.clientWidth;
	newDiv.parentNode.removeChild(newDiv)
	return { w: width, h: height };
}
function getTextWidth(text, font) {
	// re-use canvas object for better performance
	var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
	var context = canvas.getContext('2d');
	context.font = font;
	var metrics = context.measureText(text);
	return metrics.width;
}
function generateFontString(fz, family, weight = 900) {
	let s = '' + weight + ' ' + fz + 'px ' + family;
	return s.trim();
}
function measureText1(text, fz, family, weight = 900) {
	console.log(text, fz, family)
	let sFont = '' + weight + ' ' + fz + 'px ' + family; //"bold 12pt arial"
	sFont = sFont.trim();
	var canvas = document.createElement('canvas'); //measureText.canvas || (measureText.canvas = document.createElement('canvas'));
	var context = canvas.getContext('2d');
	context.font = sFont;
	var metrics = context.measureText(text);
	//let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
	let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
	//console.log('metrics', metrics, '\nfz', fz);
	//console.log(metrics.width,actualHeight,fz)
	return { w: metrics.width, h: actualHeight };
}
function measureTextX(text, fz, family, weight = 900) {
	let sFont = '' + weight + ' ' + fz + 'px ' + family; //"bold 12pt arial"
	sFont = sFont.trim();
	var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
	var context = canvas.getContext('2d');
	context.font = sFont;
	var metrics = context.measureText(text);
	//let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
	let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
	//console.log('metrics', metrics, '\nfz', fz);
	console.log(metrics.width, actualHeight, fz)
	return { w: metrics.width, h: actualHeight, fz: fz };//actualHeight };
}

//#endregion

//#region DOM: drag drop

//dd helpers
function findDragTarget(ev) {
	let targetElem = ev.target;
	while (!targetElem.ondragover) targetElem = targetElem.parentNode;
	return targetElem;
}
function setDropPosition(ev, elem, targetElem, dropPos) {
	if (dropPos == 'mouse') {
		var elm = $(targetElem);
		x = ev.pageX - elm.offset().left - dragStartOffset.x;
		y = ev.pageY - elm.offset().top - dragStartOffset.y;
		posXY(elem, targetElem, x, y);
	} else if (dropPos == 'none') {
		//position same as in previous container
		return;
	} else if (dropPos == 'center') {
		// need to remove all pos info from element??? YES!!!
		elem.style.position = elem.style.left = elem.style.top = '';
		elem.classList.add('centeredTL');
	} else if (dropPos == 'centerCentered') {
		elem.style.position = elem.style.left = elem.style.top = '';
		elem.classList.add('centerCentered');
	} else {
		dropPos(ev, elem, targetElem); // dropPos can be a function!!!
	}

}

//dd core
var dragStartOffset;
var draggedElement;

//can be overruled by draggedElem.dropPosition
var dropPosition = 'none'; // none | mouse | center | centerCentered | function(ev,elem,target)

//simple drag drop (makeDraggable, makeDroppable)
function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) {
	let elem = ev.target;
	dragStartOffset = getRelCoords(ev, $(elem));
	draggedElement = elem;
}
function drop(ev) {
	ev.preventDefault();
	let targetElem = findDragTarget(ev); //drop on target, not a child of it!!!
	targetElem.appendChild(draggedElement);
	setDropPosition(ev, draggedElement, targetElem, isdef(draggedElement.dropPosition) ? draggedElement.dropPosition : dropPosition);
}
function makeDraggable(elem, dropPos) {
	elem.draggable = true;
	elem.ondragstart = drag;
	if (isdef(dropPos)) elem.dropPosition = dropPos;
}
function makeDroppable(target) {
	target.ondragover = allowDrop;
	target.ondrop = drop;
}
// X 
//function allowDrop(ev) { ev.preventDefault(); }
function dragX(ev) {
	let elem = ev.target;
	dragStartOffset = getRelCoordsX(ev, elem);
	draggedElement = elem;
}
function dropX(ev) {
	ev.preventDefault();
	let targetElem = findDragTarget(ev); //drop on target, not a child of it!!!
	//console.log(draggedElement.dropPosition);
	if (nundef(draggedElement.dropPosition) || typeof (draggedElement.dropPosition) != 'function') targetElem.appendChild(draggedElement);
	setDropPosition(ev, draggedElement, targetElem, isdef(draggedElement.dropPosition) ? draggedElement.dropPosition : dropPosition);
}
function makeDraggableX(elem, dropPos) {
	//dropPos can be func(ev, dragElem, dropElem)
	elem.draggable = true;
	elem.ondragstart = dragX;
	if (isdef(dropPos)) elem.dropPosition = dropPos;
}
function makeDroppableX(target) {
	target.ondragover = allowDrop;
	target.ondrop = dropX;
}
//#endregion

//#region dragX2
// var onDragStart = function (event) {
//   event.preventDefault();
//   var clone = event.target.cloneNode(true);
//   clone.classList.add("dragging");
//   event.target.parentNode.appendChild(clone);
//   var style = getComputedStyle(clone);
//   clone.drag = {
//     x: (event.pageX||(event.clientX+document.body.scrollLeft)) - clone.offsetLeft + parseInt(style.marginLeft),
//     y: (event.pageY||(event.clientY+document.body.scrollTop)) - clone.offsetTop + parseInt(style.marginTop),
//     source: event.target
//   };
// };

// var onDragMove = function (event) {
//   if (!event.target.drag) {return;}
//   event.target.style.left = ((event.pageX||(event.clientX+document.body.scrollLeft)) - event.target.drag.x) + "px";
//   event.target.style.top = ((event.pageY||(event.clientY+document.body.scrollTop)) - event.target.drag.y) + "px";
// };

// var onDragEnd = function (event) {
//   if (!event.target.drag) {return;}
//   // Define persist true to let the source persist and drop the target, otherwise persist the target.
//   var persist = true;
//   if (persist || event.out) {
//     event.target.parentNode.removeChild(event.target);
//   } else {
//     event.target.parentNode.removeChild(event.target.drag.source);
//   }
//   event.target.classList.remove("dragging");
//   event.target.drag = null;
// };

// var onDragOver = function (event) {
//   event.preventDefault();
// };

function dragX2(ev) {
	//ev.preventDefault();
	let elem = ev.target;
	dragStartOffset = getRelCoordsX(ev, elem);
	draggedElement = elem;
}
function dropX2(ev) {
	ev.preventDefault();
	let targetElem = findDragTarget(ev); //drop on target, not a child of it!!!
	//console.log(draggedElement.dropPosition);
	if (nundef(draggedElement.dropPosition) || typeof (draggedElement.dropPosition) != 'function') targetElem.appendChild(draggedElement);
	setDropPosition(ev, draggedElement, targetElem, isdef(draggedElement.dropPosition) ? draggedElement.dropPosition : dropPosition);
}
function makeDraggableX2(elem, dropPos) {
	//dropPos can be func(ev, dragElem, dropElem)
	elem.draggable = true;
	elem.ondragstart = dragX2;
	if (isdef(dropPos)) elem.dropPosition = dropPos;

	// let el = elem;
	// el.onpointerdown = ev => {
	// 	el.onpointermove = pointerMove
	// 	el.style.cursor='grabbing';
	// 	el.setPointerCapture(ev.pointerId)
	// }

	// pointerMove = ev => {
	// 	console.log('Dragged!')
	// }

	// el.onpointerup = ev => {
	// 	el.onpointermove = null
	// 	el.releasePointerCapture(ev.pointerId)
	// }
}
function makeDroppableX2(target) {
	target.ondragover = allowDrop;
	target.ondrop = dropX2;
}

//#endregion x2

//#region rest DD
function makeDragDrop(objElems, dropzoneElems) {

	// console.log(objElems[0], dropzoneElems[0]);
	// objElems.map(x => mClass(x, 'draggable'));
	// dropzoneElems.map(x => mClass(x, 'dropzone'));
	let dropzones = document.querySelectorAll('.dropzone');
	let droppable = new Draggable.Droppable(
		dropzones, //dropzoneElems,
		{
			draggable: '.draggable',
			dropzone: '.dropzone',
			mirror: { constrainDimensions: true }
		}
	);
	return;
	let droppableOrigin;

	// --- Draggable events --- //
	droppable.on('drag:start', (ev) => {
		//droppableOrigin = ev.originalSource.parentNode.dataset.dropzone;
		console.log('drag', droppableOrigin, ev)
	});

	droppable.on('droppable:dropped', (ev) => {
		console.log('drop!', droppableOrigin, ev);
		// if (droppableOrigin !== ev.dropzone.dataset.dropzone) { ev.cancel(); }
	});
	return droppable;
}
//#endregion

//#region DOM: hierarchy, parent, children...
function removeAttributes(elem) {
	//removes class, id, style,...
	while (elem.attributes.length > 0) {
		//console.log(elem.attributes[0].name);
		elem.removeAttribute(elem.attributes[0].name);
	}
}
function removeDOM(elem) { purge(elem); }
function removeElem(elem) {
	removeAllEvents(elem);
	elem.remove();
}
function removeEvents(elem) {
	for (const evname of arguments) {
		elem['on' + evname] = null;
	}
}
function removeAllEvents(elem) {
	// elem.onmouseenter = null;
	// elem.onmouseleave = null;
	// elem.onclick = null;
	var a = elem.attributes, i, l, n;
	if (a) {
		for (i = a.length - 1; i >= 0; i -= 1) {
			n = a[i].name;
			//console.log(n, typeof (elem[n]))
			if (typeof elem[n] === 'function') {
				console.log('.......removing', n, 'from', elem.id)
				elem[n] = null;
			}
		}
	}
}
function purge(elem) {
	var a = elem.attributes, i, l, n;
	if (a) {
		for (i = a.length - 1; i >= 0; i -= 1) {
			n = a[i].name;
			if (typeof elem[n] === 'function') {
				elem[n] = null;
			}
		}
	}
	a = elem.childNodes;
	if (a) {
		l = a.length;
		// for (i = 0; i < l; i += 1) {
		for (i = a.length - 1; i >= 0; i -= 1) {
			//console.log(elem.id, a, elem.childNodes[i]);
			purge(elem.childNodes[i]);
		}
	}
	elem.remove(); //elem.parentNode.removeChild(elem);
}
//function clearOuter(elem){elem.outerHTML = '';} ACHTUNG GEHT NICHT SO WIE ICH GLAUBTE!
function clearElement(elem) {
	//console.log(elem);
	if (isString(elem)) elem = document.getElementById(elem);
	if (window.jQuery == undefined) { elem.innerHTML = ''; return elem; }
	while (elem.firstChild) {
		$(elem.firstChild).remove();
	}
	return elem;
}
function clearIncludingAttr(elem) {
	//console.log(elem);
	if (isString(elem)) elem = document.getElementById(elem);
	elem.innerHTML = '';
	removeAttributes(elem);
	return elem;
}
function clearInit(elem, startProps = {}) {
	clearElement(elem);
	for (const k in startProps) { elem[k] = startProps[k]; }
}

function clearElementFromChildIndex(elem, idx = 0) {
	let charr = arrChildren(elem).slice(idx);
	for (const ch of charr) {
		elem.removeChild(ch);
	}
}
function getParent(elem) { return elem.parentElement; }
function getChildren(elem) { return [...elem.children]; }
function closestParent(elem, selector) {
	for (; elem && elem !== document; elem = elem.parentNode) {
		if (elem.matches(selector)) return elem;
	}
	return null;
}
function findDOMAncestorOfType(elem, t = 'div') {
	let anc = elem.parentNode;
	while (MSCATS[getTypeOf(anc)] != t) { anc = anc.parentNode; }
	return anc;
}
function findAncestorElemWithParentOfType(el, type) {
	while (el && el.parentNode) {
		let t = getTypeOf(el);
		let tParent = getTypeOf(el.parentNode);
		//console.log('el', t, tParent, 'el.id', el.id, 'parentNode.id', el.parentNode.id);
		if (tParent == type) break;
		el = el.parentNode;
	}
	return el;

}
function findAncestorElemOfType(el, type) {
	while (el) {
		let t = getTypeOf(el);
		if (t == type) break;
		el = el.parentNode;
	}
	return el;

}
function findDescendantWithId(id, parent) {
	if (parent.id == id) return parent;
	let children = arrChildren(parent);
	if (isEmpty(children)) return null;
	for (const ch of children) {
		let res = findDescendantWithId(id, ch);
		if (res) return res;
	}
	return null;
}
function findChildWithId(id, parentElem) {
	testHelpers(parentElem);
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (ch.id == id) return ch;
	}
	return null;
}
function findChildWithClass(className, parentElem) {
	testHelpers(parentElem);
	let children = arrChildren(parentElem);
	for (const ch of children) {
		//console.log('....findChildWithClass', ch, ch.classList, className)
		if (ch.classList.includes(className)) return ch;
	}
	return null;
}
function findChildOfType(type, parentElem) {
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (getTypeOf(ch) == type) return ch;
	}
	return null;
}
function findChildrenOfType(type, parentElem) {
	let children = arrChildren(parentElem);
	let res = [];
	for (const ch of children) {
		if (getTypeOf(ch) == type) res.push(ch);
	}
	return res;
}
function findParentWithId(elem) {
	//testHelpers(elem);
	while (elem && !elem.id) {
		elem = elem.parentNode;
	}
	//testHelpers("parent with id: ", elem);
	return elem;
}
//#endregion

//#region DOM: positioning_ divs w/  inline-block
function posCenterInCenter(d) { d.classList.add('centerCentered'); }
function posTopLeftInCenter(d) { d.classList.add('centered'); }
function posXY(d1, dParent, x, y, unit = 'px', position = 'absolute') {
	if (nundef(position)) position = 'absolute';
	if (dParent && !dParent.style.position) dParent.style.setProperty('position', 'relative');
	d1.style.setProperty('position', position);
	if (isdef(x)) d1.style.setProperty('left', makeUnitString(x, unit));
	if (isdef(y)) d1.style.setProperty('top', makeUnitString(y, unit));
}
function posCenterInCenter(d) { d.classList.add('centerCentered'); }
function posCenterInCenter(d) { d.classList.add('centerCentered'); }
function posOverlap(d1, dParent, dx, dy, propName) {
	//depending on how many children ch with ch[propName]==d1[propName] dParent has, 
	// set position of d1 to next position shifted by dx,dy
	let chType = d1[propName];
	//console.log(dParent.children, typeof dParent.children)
	let numChildrenOfTarget = [...dParent.children].filter(x => x.type == chType).length - 1;
	//console.log(dParent, 'has', numChildrenOfTarget, 'children of type', chType);
	posXY(d1, dParent, numChildrenOfTarget * dx, numChildrenOfTarget * dy, unit = 'px', position = 'absolute');

}

function allElementsFromPoint(x, y) {
	var element, elements = [];
	var old_visibility = [];
	while (true) {
		element = document.elementFromPoint(x, y);
		if (!element || element === document.documentElement) {
			break;
		}
		elements.push(element);
		old_visibility.push(element.style.visibility);
		element.style.visibility = 'hidden'; // Temporarily hide the element (without changing the layout)
	}
	for (var k = 0; k < elements.length; k++) {
		elements[k].style.visibility = old_visibility[k];
	}
	elements.reverse();
	return elements;
}

//#endregion

//#region DOM: styles, visibility
function disableStyle(id) {
	if (isString(id)) id = document.getElementById(id);
	id.style.pointerEvents = 'none';
	id.style.opacity = .5;
	id.style.cursor = 'none';
}
function enableStyle(id) {
	if (isString(id)) id = document.getElementById(id);
	id.style.pointerEvents = null;
	id.style.opacity = 1;
	id.style.cursor = 'pointer';
}
function hide(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:hidden;display:none');
	} else {
		elem.style.display = 'none';
	}
}
function isVisible(elem) { // Where el is the DOM element you'd like to test for visibility
	//console.log(elem)
	if (isString(elem)) elem = document.getElementById(elem);

	return (elem.offsetParent !== null);
}
function isVisible2(elem) { // Where el is the DOM element you'd like to test for visibility
	//console.log(elem)
	if (isString(elem)) elem = document.getElementById(elem);

	return (elem.style.display != 'none' || elem.offsetParent !== null);
}
function show(elem, isInline = false) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:visible');
	} else {
		elem.style.display = isInline ? 'inline-block' : null;
	}
}

//#endregion

//#region DOM: load code, fire event
function loadCode_dep(text) {
	if (isdef(text)) text = text.trim();
	if (isEmpty(text)) {
		//console.log('text is empty!!! no script loaded!');
		return;
	}
	//console.log('text', text);

	var scriptTag = document.createElement("script");
	scriptTag.onload = () => console.log('code loaded.....');
	scriptTag.setAttribute("type", "text/javascript");
	scriptTag.innerHTML = text;
	document.getElementsByTagName("body")[0].appendChild(scriptTag);
}
function loadCode0(text, codeToRunWhenScriptLoaded = null, callback = null) {
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaalo')
	if (isdef(text)) text = text.trim();
	if (isEmpty(text)) {
		console.log('code is empty!!! no script loaded!');
		if (callback) callback();
		return;
	}
	//console.log('text', text);

	var scriptTag = document.createElement("script");
	//scriptTag.onload = () => {console.log('123 code loaded.....'); if (callback) callback();}; //DOESNT WORK!!!
	scriptTag.setAttribute("type", "text/javascript");
	// const userProg = document.createElement('script')
	scriptTag.text = callback ? [text, codeToRunWhenScriptLoaded].join('\n') : text;
	//document.head.appendChild(userProg)	text
	//scriptTag.innerHTML = text;
	document.getElementsByTagName("body")[0].appendChild(scriptTag);
}
//#endregion

//#region DOM: layout functions
function splayout(elems, dParent, w, h, x, y, overlap = 20, splay = 'right') {
	function splayRight(elems, d, x, y, overlap) {
		//console.log('splayRight', elems, d)
		for (const c of elems) {
			mAppend(d, c);
			mStyleX(c, { position: 'absolute', left: x, top: y });
			x += overlap;
		}
		return [x, y];
	}
	function splayLeft(elems, d, x, y, overlap) {
		x += (elems.length - 2) * overlap;
		let xLast = x;
		for (const c of elems) {
			mAppend(d, c);
			mStyleX(c, { position: 'absolute', left: x, top: y });
			x -= overlap;
		}
		return [xLast, y];
	}
	function splayDown(elems, d, x, y, overlap) {
		for (const c of elems) {
			mAppend(d, c);
			mStyleX(c, { position: 'absolute', left: x, top: y });
			y += overlap;
		}
		return [x, y];
	}
	function splayUp(elems, d, x, y, overlap) {
		y += (elems.length - 1) * overlap;
		let yLast = y;
		for (const c of elems) {
			mAppend(d, c);
			mStyleX(c, { position: 'absolute', left: x, top: y });
			y -= overlap;
		}
		return [x, yLast];
	}

	if (isEmpty(elems)) return { w: 0, h: 0 };

	mStyleX(dParent, { display: 'block', position: 'relative' });

	//phase 4: add items to container
	[x, y] = (eval('splay' + capitalize(splay)))(elems, dParent, x, y, overlap);

	let isHorizontal = splay == 'right' || splay == 'left';
	let sz = { w: (isHorizontal ? (x - overlap + w) : w), h: (isHorizontal ? (y - overlap + h) : h) };

	return sz;

}

//#endregion

//#region fire
function fireClick(node) {
	if (document.createEvent) {
		var evt = document.createEvent('MouseEvents');
		evt.initEvent('click', true, false);
		//console.log('fireClick: createEvent and node.dispatchEvent exist!!!', node)
		//console.log('****************fireClick: node.onclick exists!!!', node)
		//node.click();
		node.dispatchEvent(evt);
	} else if (document.createEventObject) {
		//console.log('fireClick: createEventObject and node.fireEvent exist!!!', node)
		node.fireEvent('onclick');
	} else if (typeof node.onclick == 'function') {
		//console.log('****************fireClick: node.onclick exists!!!', node)
		node.onclick();
	}
}
function fireWheel(node) {
	if (document.createEvent) {
		var evt = document.createEvent('MouseEvents');
		evt.initEvent('wheel', true, false);
		console.log('fireClick: createEvent and node.dispatchEvent exist!!!', node)
		node.dispatchEvent(evt);
	} else if (document.createEventObject) {
		console.log('fireClick: createEventObject and node.fireEvent exist!!!', node)
		node.fireEvent('onclick');
	} else if (typeof node.onclick == 'function') {
		console.log('fireClick: node.onclick exists!!!', node)
		node.onclick();
	}
}
function fireKey(k, { control, alt, shift } = {}) {
	console.log('fireKey called!' + document.createEvent)
	if (document.createEvent) {
		// var evt = document.createEvent('KeyEvents');
		// evt.initEvent('keyup', true, false);
		console.log('fireKey: createEvent and node.dispatchEvent exist!!!', k, control, alt, shift);
		//el.dispatchEvent(new Event('focus'));
		//el.dispatchEvent(new KeyboardEvent('keypress',{'key':'a'}));
		window.dispatchEvent(new KeyboardEvent('keypress', { key: '+', ctrlKey: true }));
	} else if (document.createEventObject) {
		console.log('fireClick: createEventObject and node.fireEvent exist!!!', node)
		node.fireEvent('onclick');
	} else if (typeof node.onclick == 'function') {
		console.log('fireClick: node.onclick exists!!!', node)
		node.onclick();
	}
}
//#endregion

//#region file IO
function processCsvData(allText) {
	var numHeadings = 5;  // or however many elements there are in each row
	var allTextLines = allText.split(/\r\n|\n/);
	//console.log('found',allTextLines.length,'text lines!!!')
	var headings = allTextLines[0].split(',');
	numHeadings = headings.length;
	//console.log('headings',numHeadings,headings);
	let entries = allTextLines.splice(1);
	//entries = entries.slice(0,10);
	//entries.map(x=>console.log(x)); 
	var records = { headings: headings };
	// var recordsByName = {};
	for (const e of entries) {
		let o = {};
		let values = e.split(',');
		for (let i = 0; i < numHeadings; i++) {
			let k = headings[i];
			o[k] = values[i];
		}
		o.order = Number(arrLast(values));

		records[o.hexcode] = o;
		//recordsByName[o.annotation] = o.hexcode;
	}
	//console.log('recordsByName',recordsByName)
	return records; //{ records: records, recordsByName: recordsByName };
}

//localStorage save and load:
function saveObject(o, name) { localStorage.setItem(name, JSON.stringify(o)); }
function loadObject(name) { return JSON.parse(localStorage.getItem(name)); }
//async function loadObjectAsync(name) { return JSON.parse(await localStorage.getItem(name)); }
async function loadAsText(url) {
	let f = await fetch(url);
	let txt = await f.text();
	return txt;
}
async function fetchFileAsText(url) {
	let f = await fetch(url);
	let txt = await f.text();
	return txt;
}
function downloadFile(jsonObject, filenameNoExt) {
	json_str = JSON.stringify(jsonObject);
	saveFileAtClient(
		filenameNoExt + ".json",
		"data:application/json",
		new Blob([json_str], { type: "" }));

}
function downloadTextFile(s, filenameNoExt, ext = 'txt') {
	//json_str = JSON.stringify(jsonObject);
	saveFileAtClient(
		filenameNoExt + "." + ext,
		"data:application/text",
		new Blob([s], { type: "" }));

}
function downloadAsText(s, filename, ext = 'txt') {
	downloadTextFile(s, filename, ext);
}
function downloadAsYaml(o, filename) {
	//console.log(symbolDict_)
	let y = jsonToYaml(o);

	downloadTextFile(y, filename, 'yaml');
}

function downloadHtmlFile(html, filenameNoExt) {
	//json_str = JSON.stringify(jsonObject);
	saveFileAtClient(
		filenameNoExt + ".html",
		"data:application/html",
		new Blob([html], { type: "" }));

}
function saveFileAtClient(name, type, data) {
	// Function to download data to a file
	//usage:
	// json_str = JSON.stringify(someObject);
	// saveFileAtClient("yourfilename.json", "data:application/json", new Blob([json_str], {type: ""}));

	//console.log(navigator.msSaveBlob);
	if (data != null && navigator.msSaveBlob) return navigator.msSaveBlob(new Blob([data], { type: type }), name);
	//console.log('still here!')
	let a = document.createElement('a');
	a.style.display = 'none';
	let url = window.URL.createObjectURL(new Blob([data], { type: type }));
	a.href = url;
	a.download = name;
	document.body.appendChild(a);
	fireClick(a);
	setTimeout(function () {
		// fixes firefox html removal bug
		window.URL.revokeObjectURL(url);
		a.remove();
	}, 500);
}
function jsonToYaml(o) {
	// this is your json object
	//JSONObject jsonobject = new JSONObject(map);
	// get json string
	let y = jsyaml.dump(o);
	return y;
	//  let text= JSON.stringify(o); //o.toString(4);
	//  let di = jsyaml.load(text);
	//  let y = jsyaml.dump(di);
}
//#endregion

//#region functions
function getFunctionCallerName() {
	// gets the text between whitespace for second part of stacktrace
	return new Error().stack.match(/at (\S+)/g)[1].slice(3);
}
function getFunctionsNameThatCalledThisFunction() {
	let c1 = getFunctionsNameThatCalledThisFunction.caller;
	if (nundef(c1)) return 'no caller!';
	let c2 = c1.caller;
	if (nundef(c2)) return 'no caller!';
	return c2.name;
}
//#endregion

//#region geo helpers
function toRadian(deg) { return deg * 2 * Math.PI / 360; }
function correctPolys(polys, approx = 10) {
	//console.log('citySize', citySize, 'approx', approx);
	let clusters = [];
	for (const p of polys) {
		//console.log(p.map(pt => '(' + pt.x + ',' + pt.y + ') ').toString());
		for (const pt of p) {
			let found = false;
			for (const cl of clusters) {
				for (const v of cl) {
					let dx = Math.abs(v.x - pt.x);
					let dy = Math.abs(v.y - pt.y);
					//console.log('diff', dx, dy);
					if (dx < approx && dy < approx) {
						//console.log('FOUND X!!!', dx,dy);
						cl.push(pt);
						found = true;
						break;
					}
				}
				if (found) break;
			}
			if (!found) {
				//make new cluster with this point
				clusters.push([pt]);
			}
		}
	}

	//now all points of all polys are in clusters
	//go through clusters, computer mean for all points in a clusters
	let vertices = [];
	for (const cl of clusters) {
		let sumx = 0;
		let sumy = 0;
		let len = cl.length;
		for (const pt of cl) {
			sumx += pt.x;
			sumy += pt.y;
		}
		vertices.push({ x: Math.round(sumx / len), y: Math.round(sumy / len) });
	}

	for (const p of polys) {
		for (const pt of p) {
			let found = false;
			for (const v of vertices) {
				let dx = Math.abs(v.x - pt.x);
				let dy = Math.abs(v.y - pt.y);
				if (dx < approx && dy < approx) {
					if (dx != 0 || dy != 0) {
						pt.x = v.x;
						pt.y = v.y;
					}
					found = true;
				}
				if (found) break;
			}
			if (!found) {
				//make new cluster with this point
				error('point not found in vertices!!! ' + pt.x + ' ' + pt.y);
			}
		}
	}
	return vertices;
}
function dSquare(pos1, pos2) {
	let dx = pos1.x - pos2.x;
	dx *= dx;
	let dy = pos1.y - pos2.y;
	dy *= dy;
	return dx + dy;
}
function distance(x1, y1, x2, y2) { return Math.sqrt(dSquare({ x: x1, y: y1 }, { x: x2, y: y2 })); }
function size2hex(w = 100, h = 0, x = 0, y = 0) {
	//returns sPoints for polygon svg
	//from center of poly and w (possibly h), calculate hex poly points and return as string!
	//TODO: add options to return as point list!
	//if h is omitted, a regular hex of width w is produced
	//starting from N:
	let hexPoints = [{ X: 0.5, Y: 0 }, { X: 1, Y: 0.25 }, { X: 1, Y: 0.75 }, { X: 0.5, Y: 1 }, { X: 0, Y: 0.75 }, { X: 0, Y: 0.25 }];

	if (h == 0) {
		h = (2 * w) / 1.73;
	}
	return polyPointsFrom(w, h, x, y, hexPoints);
}
function size2triup(w = 100, h = 0, x = 0, y = 0) {
	//returns sPoints for polygon svg starting from N:
	let triPoints = [{ X: 0.5, Y: 0 }, { X: 1, Y: 1 }, { X: 0, Y: 1 }];
	if (h == 0) { h = w; }
	return polyPointsFrom(w, h, x, y, triPoints);

}
function size2tridown(w = 100, h = 0, x = 0, y = 0) {
	//returns sPoints for polygon svg starting from N:
	let triPoints = [{ X: 1, Y: 0 }, { X: 0.5, Y: 1 }, { X: 0, Y: 0 }];
	if (h == 0) { h = w; }
	return polyPointsFrom(w, h, x, y, triPoints);

}
function getCirclePoints(rad, n, disp = 0) {
	let pts = [];
	let i = 0;
	let da = 360 / n;
	let angle = disp;
	while (i < n) {
		let px = rad * Math.cos(toRadian(angle));
		let py = rad * Math.sin(toRadian(angle));
		pts.push({ X: px, Y: py });
		angle += da;
		i++;
	}
	return pts;
}

function polyPointsFrom(w, h, x, y, pointArr) {

	x -= w / 2;
	y -= h / 2;

	let pts = pointArr.map(p => [p.X * w + x, p.Y * h + y]);
	let newpts = [];
	for (const p of pts) {
		newp = { X: p[0], Y: Math.round(p[1]) };
		newpts.push(newp);
	}
	pts = newpts;
	let sPoints = pts.map(p => '' + p.X + ',' + p.Y).join(' '); //'0,0 100,0 50,80',
	//testHexgrid(x, y, pts, sPoints);
	return sPoints;
}
function getPoly(offsets, x, y, w, h) {
	//, modulo) {
	let poly = [];
	for (let p of offsets) {
		let px = Math.round(x + p[0] * w); //  %modulo;
		//px -= px%modulo;
		//if (px % modulo != 0) px =px % modulo; //-= 1;
		let py = Math.round(y + p[1] * h); //%modulo;
		//py -= py%modulo;
		//if (py % modulo != 0) py -= 1;
		poly.push({ x: px, y: py });
	}
	return poly;
}
function getHexPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	let hex = [[0, -0.5], [0.5, -0.25], [0.5, 0.25], [0, 0.5], [-0.5, 0.25], [-0.5, -0.25]];
	return getPoly(hex, x, y, w, h);
}
function getQuadPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	q = [[0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5]];
	return getPoly(q, x, y, w, h);
}
function getTriangleUpPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	let triup = [[0, -0.5], [0.5, 0.5], [-0.5, 0.5]];
	return getPoly(triup, x, y, w, h);
}
function getTriangleDownPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	let tridown = [[-0.5, 0.5], [0.5, 0.5], [-0.5, 0.5]];
	return getPoly(tridown, x, y, w, h);
}

//#endregion

//#region id helpers
var UIDCounter = 0;
function getUID(pref = '') {
	UIDCounter += 1;
	return pref + '_' + UIDCounter;
}
function resetUIDs() { UIDCounter = 0; }
//#endregion

//#region io
var isTraceOn = true; // true | false
function trace() { if (isTraceOn) console.log('___ ', getFunctionsNameThatCalledThisFunction(), '\n', ...arguments); }
function consout() {
	//console.log('halllllllllllllllooooooooooooooooooooo',isTraceOn)
	if (isTraceOn) console.log(...arguments);
}
function consoutt() {
	//console.log('halllllllllllllllooooooooooooooooooooo',isTraceOn)
	if (isTraceOn) console.log(...arguments, getFunctionsNameThatCalledThisFunction());
}

function consOutput() { console.log(...arguments); }
function error(msg) {
	let fname = getFunctionsNameThatCalledThisFunction();
	console.log(fname, 'ERROR!!!!! ', msg);
}
function extendedObjectString(o, indent, simple, lstShow, lstOmit) {
	let s = ' '.repeat(indent) + (o.id ? o.id + ': ' : ' _ : ');
	for (const k in o) {
		if (k == 'id') continue;
		if (lstShow && lstShow.includes(k)
			|| lstOmit && !lstOmit.includes(k)
			|| simple && isSimple(o[k]) && !isComplexColor(o[k])) {
			if (isDict(o[k])) {
				s += '(' + extendedObjectString(o[k], indent, simple, lstShow, lstOmit) + ') ';
			} else s += k + ':' + o[k] + ' ';
		}
	}
	return s;
}
function showString(x, proplist, include = true) {
	console.log(anyString3(x, 0, proplist, include));
}
function showNodeInfo(n, title, lst, lstOmit) {
	if (nundef(title)) title = 'node';
	let args = [];
	if (isList(lst)) {
		for (const prop of lst) {
			if (isdef(n[prop])) args.push(prop + ': ' + anyString3(n[prop]));
		}
	} else {
		for (const prop in n) {
			if (lstOmit.includes(prop)) continue;
			args.push(prop + ': ' + anyString3(n[prop]));
		}
	}
	let s = title + '\n' + args.join('\n');
	console.log(s);
	//console.log(title, ...args);

}
function wlog() {
	let s = '';
	for (const a of arguments) {
		s += a + ' ';
	}
	console.log(s);
}





//#endregion

//#region layout helpers
function calcRowsColsX(num, rows, cols) {
	const table = {
		2: { rows: 1, cols: 2 },
		5: { rows: 2, cols: 3 },
		7: { rows: 2, cols: 4 },
		11: { rows: 3, cols: 4 },
	};
	if (isdef(rows) || isdef(cols)) return calcRowsCols(num, rows, cols);
	else if (isdef(table[num])) return table[num];
	else return calcRowsCols(num, rows, cols);
}
function calcRowsCols(num, rows, cols) {
	//=> code from RSG testFactory arrangeChildrenAsQuad(n, R);
	//console.log(num, rows, cols);
	let shape = 'rect';
	if (isdef(rows) && isdef(cols)) {
		//do nothing!
	} else if (isdef(rows)) {
		cols = Math.ceil(num / rows);
	} else if (isdef(cols)) {
		rows = Math.ceil(num / cols);
	} else if (num == 2) {
		rows = 1; cols = 2;
	} else if ([4, 6, 9, 12, 16, 20, 25, 30, 36, 42, 49, 56, 64].includes(num)) {
		rows = Math.floor(Math.sqrt(num));
		cols = Math.ceil(Math.sqrt(num));
	} else if ([3, 8, 15, 24, 35, 48, 63].includes(num)) {
		let lower = Math.floor(Math.sqrt(num));
		console.assert(num == lower * (lower + 2), 'RECHNUNG FALSCH IN calcRowsCols');
		rows = lower;
		cols = lower + 2;
	} else if (num > 1 && num < 10) {
		shape = 'circle';
	} else if (num > 16 && 0 == num % 4) {
		rows = 4; cols = num / 4;
	} else if (num > 9 && 0 == num % 3) {
		rows = 3; cols = num / 3;
	} else if (0 == num % 2) {
		rows = 2; cols = num / 2;
	} else {
		rows = 1; cols = num;
	}
	//console.log(rows, cols, shape);
	return { rows: rows, cols: cols, recommendedShape: shape };
}

//#endregion

//#region lines helpers
function copyLinesFromTo(lines, iStart, iEnd, trimStart, trimEnd) {
	let block = isdef(trimStart) ? stringAfter(lines[iStart], '/*') : lines[iStart];
	iStart += 1;
	while (iStart < iEnd) {
		block += '\n' + lines[iStart];
		iStart += 1;
	}
	if (isdef(trimEnd)) block = stringBefore(block, '*/');
	return block.trim();

}
function skipToLine(lines, i, options) {
	//console.log('skipTo', i)
	options = convertToList(options);
	//console.log('options', options)
	while (i < lines.length) {
		for (const s of options) {
			if (lines[i].includes(s)) {
				//console.log('YES!!!!!', i, s)
				return { index: i, option: s };
			}
		}
		i += 1;
	}
	return { index: i, option: null };
}

//#endregion

//#region deepmerge
function isMergeableObject(val) {
	var nonNullObject = val && typeof val === 'object'

	return nonNullObject
		&& Object.prototype.toString.call(val) !== '[object RegExp]'
		&& Object.prototype.toString.call(val) !== '[object Date]'
}
function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}
function cloneIfNecessary(value, optionsArgument) {
	var clone = optionsArgument && optionsArgument.clone === true
	return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
}
function defaultArrayMerge(target, source, optionsArgument) {
	var destination = target.slice()
	source.forEach(function (e, i) {
		if (typeof destination[i] === 'undefined') { //el[i] nur in source
			destination[i] = cloneIfNecessary(e, optionsArgument)
		} else if (isMergeableObject(e)) { //el[i] in beidem
			destination[i] = deepmerge(target[i], e, optionsArgument)
		} else if (target.indexOf(e) === -1) { //el[i] nur in target
			destination.push(cloneIfNecessary(e, optionsArgument))
		}
	})
	return destination
}
function mergeObject(target, source, optionsArgument) {
	var destination = {}
	if (isMergeableObject(target)) {
		Object.keys(target).forEach(function (key) {
			destination[key] = cloneIfNecessary(target[key], optionsArgument)
		})
	}
	Object.keys(source).forEach(function (key) {
		if (!isMergeableObject(source[key]) || !target[key]) {
			//console.log('das sollte bei data triggern!',key,source[key])
			destination[key] = cloneIfNecessary(source[key], optionsArgument)
		} else {
			destination[key] = deepmerge(target[key], source[key], optionsArgument)
		}
	})
	return destination;
}
// deepmerge.all = function deepmergeAll(array, optionsArgument) {
// 	if (!Array.isArray(array) || array.length < 2) {
// 		throw new Error('first argument should be an array with at least two elements')
// 	}

// 	// we are sure there are at least 2 values, so it is safe to have no initial value
// 	return array.reduce(function (prev, next) {
// 		return deepmerge(prev, next, optionsArgument)
// 	})
// }
function deepmerge(target, source, optionsArgument) {
	var array = Array.isArray(source);
	var options = optionsArgument || { arrayMerge: defaultArrayMerge }
	var arrayMerge = options.arrayMerge || defaultArrayMerge

	if (array) {
		return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
	} else {
		return mergeObject(target, source, optionsArgument)
	}
}
//____________ USAGE API _____________________
const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray
function mergeOverrideArrays(base, drueber) {
	return deepmerge(base, drueber, { arrayMerge: overwriteMerge });
}
function mergeCombine(base, drueber) {
	return deepmerge(base, drueber);
}
function deepmergeOverride(base, drueber) { return mergeOverrideArrays(base, drueber); }
// function merge(base, drueber) {
// 	return deepmerge(base, drueber);
// }
//#endregion

//#region filter functions
function getShortestWord(list, preferFirst = true) {
	let res = list[0];
	if (preferFirst) {
		for (let i = 1; i < list.length; i++) {
			if (list[i].length < res.length) res = list[i];
		}
	} else {
		for (let i = 1; i < list.length; i++) {
			if (list[i].length <= res.length) res = list[i];
		}
	}
	return res;

}

function allWordsContainedInKeys(dict, keywords) {
	let res = [];
	for (const k in dict) {
		let isMatch = true;
		for (const w of keywords) {
			if (!k.includes(w)) { isMatch = false; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	return res;
}
function allWordsContainedInProps(dict, keywords, props) {
	// if all words in keywords are included by any of the properties, this info is valid!
	//console.log(dict)
	let res = [];
	for (const k in dict) {
		let isMatch = true;
		let propString = '';
		for (const p of props) {
			propString += dict[k][p] + ' ';
		}
		for (const w of keywords) {
			if (!propString.includes(w)) { isMatch = false; break; }
		}
		if (isMatch) {
			//console.log(k,dict[k],props, propString);
			res.push(dict[k]);
		}
	}
	return res;
}
function anyWordContainedInProps(dict, keywords, props) {
	// if all words in keywords are included by any of the properties, this info is valid!
	let res = [];
	for (const k in dict) {
		let isMatch = false;
		let propString = '';
		for (const p of props) { propString += dict[k][p]; }
		for (const w of keywords) {
			if (propString.includes(w)) { isMatch = true; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	return res;
}
function allWordsContainedInPropsAsWord(dict, keywords, props) {
	//console.log(keywords)
	let res = [];
	for (const k in dict) {
		let isMatch = true;
		// k.split(/[- ,]+/); //k.split();
		let keywordList = [];
		for (const p of props) {
			//console.log(dict[k][p])
			if (nundef(dict[k][p])) continue;
			let wordsInKey = splitAtWhiteSpace(dict[k][p]);
			keywordList = keywordList.concat(wordsInKey);
		}
		//console.log('wordsInKey',wordsInKey);
		for (const w of keywords) {
			if (!keywordList.includes(w)) { isMatch = false; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	//console.log(res)
	return res;
}
function anyWordContainedInPropsAsWord(dict, keywords, props) {
	//console.log(keywords)
	let res = [];
	for (const k in dict) {
		let isMatch = false;
		// k.split(/[- ,]+/); //k.split();
		let keywordList = [];
		for (const p of props) {
			//console.log(dict[k][p])
			if (nundef(dict[k][p])) continue;
			let wordsInKey = splitAtWhiteSpace(dict[k][p]);
			keywordList = keywordList.concat(wordsInKey);
		}
		//console.log('wordsInKey',wordsInKey);
		for (const w of keywords) {
			if (keywordList.includes(w)) { isMatch = true; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	//console.log(res)
	return res;
}
function anyWordContainedInKeys(dict, keywords) {
	let res = [];
	for (const k in dict) {
		let isMatch = false;
		for (const w of keywords) {
			if (k.includes(w)) { isMatch = true; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	return res;
}
function anyWordContainedInKeysAsWord(dict, keywords) {
	//console.log(keywords)
	let res = [];
	for (const k in dict) {
		let isMatch = false;
		let wordsInKey = splitAtWhiteSpace(k);// k.split(/[- ,]+/); //k.split();
		//console.log('wordsInKey',wordsInKey);
		for (const w of keywords) {
			if (wordsInKey.includes(w)) { isMatch = true; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	//console.log(res)
	return res;
}
function allWordsContainedInKeysAsWord(dict, keywords) {
	//console.log(keywords)
	let res = [];
	for (const k in dict) {
		let isMatch = true;
		let wordsInKey = splitAtWhiteSpace(k);// k.split(/[- ,]+/); //k.split();
		//console.log('wordsInKey',wordsInKey);
		for (const w of keywords) {
			if (!wordsInKey.includes(w)) { isMatch = false; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	//console.log(res)
	return res;
}
//#endregion

//#region ARRAY objects, dictionaries, lists, arrays
function copyKeys(ofrom, oto, except = {}, only) {
	let keys=isdef(only)?only:Object.keys(ofrom);
	for (const k of keys) {
		if (isdef(except[k])) continue;
		oto[k] = ofrom[k];
	}
}
function addByKey(oNew, oOld, except) {
	for (const k in oNew) {
		let val = oNew[k];
		if (isdef(except) && except.includes(k) || !isNumber(val)) continue;
		oOld[k] = isdef(oOld[k]) ? oOld[k] + val : val;
	}
}
function range(f, t, st = 1) {
	if (nundef(t)) {
		//if only 1 arg, will return numbers 0..f-1 
		t = f - 1;
		f = 0;
	}
	let arr = [];
	//console.log(f,t)
	for (let i = f; i <= t; i += st) {
		//console.log('dsdsdshallo')
		arr.push(i);
	}
	return arr;
}
function loop(n) { return range(1, n); }
function arrTake(arr, n) { return takeFromStart(arr, n); }
function takeFromStart(ad, n) {
	if (isDict(ad)) {
		let keys = Object.keys(ad);
		return keys.slice(0, n).map(x => (ad[x]));
	} else return ad.slice(0, n);
}
function takeFromTo(ad, from, to) {

	if (isDict(ad)) {
		let keys = Object.keys(ad);
		return keys.slice(from, to).map(x => (ad[x]));
	} else return ad.slice(from, to);
}
function addIf(arr, el) {
	if (!arr.includes(el)) arr.push(el);
}
function addIfDict(key, val, dict) {
	if (!(key in dict)) {
		dict[key] = [val];
	} else {
		addIf_dep(val, dict[key]);
	}
}
function any(arr, cond) {
	return !isEmpty(arr.filter(cond));
}
function anyStartsWith(arr, prefix) {
	return any(arr, el => startsWith(el, prefix));
}
function arrRotate(arr, count) {
	// usage:
	// let arr = [1,2,3,4,5];let arr1=jsCopy(arr); arr2=arrRotate(arr1,2);
	var unshift = Array.prototype.unshift,
		splice = Array.prototype.splice;
	var len = arr.length >>> 0, count = count >> 0;

	let arr1 = jsCopy(arr);
	unshift.apply(arr1, splice.call(arr1, count % len, len));
	return arr1;
}
function arrChildren(elem) { return [...elem.children]; }
function arrCreate(n, func) { let res = []; for (let i = 0; i < n; i++) { res.push(func(i)); } return res; }
function arrFirst(arr) { return arr.length > 0 ? arr[0] : null; }
function arrLast(arr) { return arr.length > 0 ? arr[arr.length - 1] : null; }
function arrTail(arr) { return arr.slice(1); }
function arrFromIndex(arr, i) { return arr.slice(i); }
function arrMinus(a, b) { let res = a.filter(x => !b.includes(x)); return res; }
function arrWithout(a, b) { return arrMinus(a, b); }
function arrRange(from = 1, to = 10, step = 1) { let res = []; for (let i = from; i <= to; i += step)res.push(i); return res; }
function arrReplace(arr, oldval, newval) { let i = arr.indexOf(oldval); if (i >= 0) arr[i] = newval; return oldval; }

function arrMax(arr) { return arr.reduce((m, n) => Math.max(m, n)); }
function arrMin(arr) { return arr.reduce((m, n) => Math.min(m, n)); }
//much faster:
function arrMinMax(arr) {
	let min = arr[0].y, max = arr[0].y;

	for (let i = 1, len = arr.length; i < len; i++) {
		let v = arr[i].y;
		min = (v < min) ? v : min;
		max = (v > max) ? v : max;
	}

	return [min, max];
}
function contains(arr, el) {
	return arr.includes(el);
}
function containsAny(arr, lst) {
	//console.log('containsAny',arr,lst)
	for (const x of lst) {
		if (arr.includes(x)) {
			//console.log('containsAny YES!',x,arr);
			return true;
		}
	}
	return false;
}
function containsAll(arr, lst) {
	for (const el of lst) {
		if (!arr.includes(el)) return false;
	}
	return true;
}
function dict2list(d, keyName = 'id') { return dict2olist(d, keyName); }
function dict2olist(d, keyName = 'id') {
	//renamed from dict2list
	//d assumed to be dictionary with values are objects!!!!
	let res = [];
	for (const key in d) {
		let val = d[key];
		let o;
		//console.log(val);
		if (isDict(val)) { o = jsCopy(val); }
		else {
			//console.log('HAAAAAAAAAAAAAALLLLLLLLO', key, val)
			o = { value: val };
		}
		o[keyName] = key;
		res.push(o);
	}
	return res;
}
function odict2olist(d, keyName = 'id') {
	//d assumed to be dictionary with values are objects!!!!
	let res = [];
	for (const key in d) {
		let o = jsCopy(d[key]);
		o[keyName] = key;
		res.push(o);
	}
	return res;
}
function dropLast(s) { return s.substring(0, s.length - 1); }
function stripObject(o, keysToDelete) {
	for (const k of keysToDelete) {
		if (isdef(o[k])) delete o[k];
	}
}
function filterByNoKey(o, undesiredKeys) {
	//create shallow copy of o without undesiredKeys
	let o1 = {};
	for (const k in o) {
		if (undesiredKeys.includes(k)) continue;
		o1[k] = o[k];
	}
	return o1;
}
function filterByKey(o, desiredKeys) {
	//create shallow copy of o with only desiredKeys
	//o = recRenameKey(o,'y','top');
	let o1 = {};
	for (const k of desiredKeys) {
		if (isdef(o[k])) {
			o1[k] = o[k];
		}
	}
	return o1;
}
function fisherYates(array) {
	var rnd, temp;

	for (var i = array.length - 1; i; i--) {
		rnd = Math.random() * i | 0;
		temp = array[i];
		array[i] = array[rnd];
		array[rnd] = temp;
	}
	return array;
}
function allCondDict(d, func) {
	let res = [];
	for (const k in d) { if (func(d[k])) res.push(k); }
	return res;
}
function getIndicesCondi(arr, func) {
	let res = [];
	for (let i = 0; i < arr.length; i++) {
		if (func(arr[i], i)) res.push(i);
	}
	return res;
}


function findKey(dict, val) { for (const k in dict) { if (dict[k] == val) return k; } }
function firstCond(arr, func) {
	//return first elem that fulfills condition
	if (nundef(arr)) return null;
	for (const a of arr) {
		if (func(a)) return a;

	}
	return null;
}
function firstNCond(n, arr, func) {
	//return first elem that fulfills condition
	if (nundef(arr)) return [];
	let result = [];
	let cnt = 0;
	for (const a of arr) {
		cnt += 1; if (cnt > n) break;
		if (func(a)) result.push(a);

	}
	return result;
}
function allCondDictKV(d, func) {
	let res = [];
	for (const k in d) { if (func(k, d[k])) res.push(k); }
	return res;
}
function firstCondDictKV(dict, func) {
	//return first elem that fulfills condition
	for (const k in dict) { if (func(k, dict[k])) return k; }
	return null;
}
function firstCondDict(dict, func) {
	//return first elem that fulfills condition
	for (const k in dict) { if (func(dict[k])) return k; }
	return null;
}
function firstCondDictReturnVal(dict, func) {
	//return first elem that fulfills condition
	for (const k in dict) { if (func(dict[k])) return dict[k]; }
	return null;
}
function firstCondDictKeys(dict, func) {
	//return first elem that fulfills condition
	for (const k in dict) { if (func(k)) return k; }
	return null;
}
function getItemWithMaxValue(d) {
	let k = Object.keys(d).reduce((a, b) => (d[a] >= d[b] ? a : b));
	return [k, d[k]];
}
function getItemWithMax(d, propName) {
	testHelpers('getItemWithMax dict:', d, 'propName:', propName);
	let max = 0;
	let kmax = null;
	for (const key in d) {
		let val = d[key][propName];
		if (val > max) {
			max = val;
			kmax = key;
		}
	}
	return [kmax, d[kmax], max];
}
function getFirstKey(o) { return Object.keys(o)[0]; }

function getKeys(dict) { return Object.keys(dict); }
function intersection(arr1, arr2) {
	//each el in result will be unique
	let res = [];
	for (const a of arr1) {
		if (arr2.includes(a)) {
			addIf(res, a);
		}
	}
	return res;
}
function isEmpty(arr) {
	return arr === undefined || !arr
		|| (isString(arr) && (arr == 'undefined' || arr == ''))
		|| (Array.isArray(arr) && arr.length == 0)
		|| Object.entries(arr).length === 0;
}
function jsCopy(o) {
	//console.log(o)
	return JSON.parse(JSON.stringify(o));
}
function jsCopyMinus(o) {
	//console.log(o)
	//console.log(JSON.parse(JSON.stringify(o)))
	let lstOmit = [...arguments].slice(1);
	//addIf(lstOmit, 'children'); //.push('children'); TODO!!!! remove!!!
	//console.log('omit properties:',lstOmit);
	let oNew = {};
	for (const k in o) {
		if (lstOmit.includes(k)) continue;
		oNew[k] = o[k];
	}
	return oNew;
}
function jsCopySafe(o) {
	//der safeStringify schmeisst html elems weg!!!
	//console.log('jsCopySafe',o);
	if (nundef(o)) return;
	//console.log(o)
	return JSON.parse(JSON.safeStringify(o)); //macht deep copy
}
function indexOfFuncMax(arr, prop, f) {
	let max = null;
	let imax = null;
	for (const [i, v] of arr.entries()) {
		let val = isdef(prop) && isdef(v[prop]) ? v[prop] : v;
		if (isdef(f)) val = f(val);
		if (max == null || val > max) { max = val; imax = i }
	}
	return { i: imax, val: max };
}
function indexOfFuncMin(arr, prop, f) {
	let min = null;
	let imax = null;
	for (const [i, v] of arr.entries()) {
		let val = isdef(prop) && isdef(v[prop]) ? v[prop] : v;
		if (isdef(f)) val = f(val);
		if (min == null || val < min) { min = val; imax = i }
	}
	return { i: imax, val: min };
}

function indexOfMax(arr, prop) {
	let max = null;
	let imax = null;
	for (const [i, v] of arr.entries()) {
		if (prop) {
			//console.log(i,v[prop])
			if (max == null || v[prop] > max) {
				//console.log(max,lookup(v, [prop]))
				max = v[prop];
				imax = i;
			}
		} else {
			if (max == null || v > max) {
				max = v;
				imax = i;
			}
		}

	}
	return { i: imax, val: max };
}
function indexOfMin(arr, prop) {
	let min = null;
	let imin = null;
	for (const [i, v] of arr.entries()) {
		if (prop) {
			if (min == null || lookup(v, [prop]) < min) {
				//console.log(min,lookup(v, [prop]))
				min = v[prop];
				imin = i;
			}
		} else {
			if (min == null || v < min) {
				min = v;
				imin = i;
			}
		}
	}
	return { i: imin, val: min };
}
function lastCond(arr, func) {
	//return first elem that fulfills condition
	for (let i = arr.length - 1; i >= 0; i--) {
		if (func(arr[i])) return arr[i];
	}

	return null;
}
function lastCondDictPlusKey(dict, func) {
	//return first elem that fulfills condition
	let keys = Object.keys(dict);
	for (let i = keys.length - 1; i >= 0; i--) {
		let key = keys[i];
		if (func(dict[key])) return [key, dict[key]];
	}

	return null;
}
function listKey(d, key, val, uniqueValues = true) {
	//adds val to array d[key], if d[key] does not exist, it is created
	if (nundef(d[key])) { d[key] = []; }
	if (uniqueValues) { addIf(d[key], val); } else { d[key].push(val); }
	return d[key];
}
function lookup(dict, keys) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (k === undefined) break;
		let e = d[k];
		if (e === undefined || e === null) return null;
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupSet(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (nundef(k)) continue; //skip undef or null values
		if (d[k] === undefined) d[k] = (i == ilast ? val : {});
		if (nundef(d[k])) d[k] = (i == ilast ? val : {});
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupSetOverride(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {

		//console.log(k,d)
		if (i == ilast) {
			if (nundef(k)) {
				//letzter key den ich eigentlich setzen will ist undef!
				alert('lookupAddToList: last key indefined!' + keys.join(' '));
				return null;
			} else {
				d[k] = val;
			}
			return d[k];
		}

		if (nundef(k)) continue; //skip undef or null values

		if (nundef(d[k])) d[k] = {};

		d = d[k];
		i += 1;
	}
	return d;
}
function lookupAddToList(dict, keys, val) {
	//usage: lookupAddToList({a:{b:[2]}}, [a,b], 3) => {a:{b:[2,3]}}
	//usage: lookupAddToList({a:{b:[2]}}, [a,c], 3) => {a:{b:[2],c:[3]}}
	//usage: lookupAddToList({a:[0, [2], {b:[]}]}, [a,1], 3) => { a:[ 0, [2,3], {b:[]} ] }
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {

		if (i == ilast) {
			if (nundef(k)) {
				//letzter key den ich eigentlich setzen will ist undef!
				alert('lookupAddToList: last key indefined!' + keys.join(' '));
				return null;
			} else if (isList(d[k])) {
				d[k].push(val);
			} else {
				d[k] = [val];
			}
			return d[k];
		}

		if (nundef(k)) continue; //skip undef or null values

		// if (i ==ilast && d[k]) d[k]=val;

		if (d[k] === undefined) d[k] = {};

		d = d[k];
		i += 1;
	}
	return d;
}
function lookupAddIfToList(dict, keys, val) {
	//usage see lookupAddToList 
	//only adds it to list if not contained!
	let lst = lookup(dict, keys);
	if (isList(lst) && lst.includes(val)) return;
	lookupAddToList(dict, keys, val);
}
function lookupRemoveFromList(dict, keys, val, deleteIfEmpty = false) {
	//usage: lookupRemoveFromList({a:{b:[2]}}, [a,b], 2) => {a:{b:[]}} OR {a:{}} (wenn deleteIfEmpty==true)
	//usage: lookupRemoveFromList({a:{b:[2,3]}}, [a,b], 3) => {a:{b:[2]}}
	//usage: lookupRemoveFromList({a:[ 0, [2], {b:[]} ] }, [a,1], 2) => { a:[ 0, [], {b:[]} ] }
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {

		if (i == ilast) {
			if (nundef(k)) {
				//letzter key den ich eigentlich setzen will ist undef!
				alert('lookupRemoveFromList: last key indefined!' + keys.join(' '));
				return null;
			} else if (isList(d[k])) {
				removeInPlace(d[k], val);
				if (deleteIfEmpty && isEmpty(d[k])) delete d[k];
			} else {
				if (d[k] === undefined) {
					error('lookupRemoveFromList not a list ' + d[k]);
					return null;
				}
			}
			return d[k];
		}

		if (nundef(k)) continue; //skip undef or null values

		// if (i ==ilast && d[k]) d[k]=val;

		if (d[k] === undefined) {
			error('lookupRemoveFromList key not found ' + k);
			return null;
		}

		d = d[k];
		i += 1;
	}
	return d;
}

function parseDictionaryName(s) {
	if (nundef(s)) return null;
	let o_keys = s.split('.');
	if (isEmpty(o_keys)) return null;
	odict = window[o_keys[0]];
	if (!odict || typeof odict != 'object') return null;
	if (o_keys.length > 1) odict = lookup(odict, o_keys.slice(1));
	return odict;
}
function parsePropertyPath(odict, s) {
	if (isEmpty(s)) return odict;
	let o_keys = s.split('.');
	return lookup(odict, o_keys);
}
function propDiffSimple(o_old, o_new, props = null) {
	//berechne diff in props
	//if props omitted will compare all properties! builds union so slightly less efficient that way!
	//if o_new or o_old are null, also returns correct result!
	let onlyOld = [];
	let onlyNew = [];
	let propChange = [];
	let summary = [];
	let hasChanged = false;

	if (!o_old) {
		return { onlyOld: [], onlyNew: Object.keys(o_new), propChange: [], summary: Object.keys(o_new), hasChanged: true };
	} else if (!o_new) {
		return { onlyOld: Object.keys(o_old), onlyNew: [], propChange: [], summary: Object.keys(o_old), hasChanged: true };
	}

	if (nundef(props)) props = union(Object.keys(o_old), Object.keys(o_new));
	for (const prop of props) {
		let nval = o_new[prop];
		let oval = o_old[prop];
		if (isdef(nval) && isdef(oval)) {
			if (nval == oval) continue;
			else if (typeof nval == 'object' && sameStringify(nval, oval)) {
				continue;
			} else if (isList(nval) && sameList(nval, oval)) {
				continue;
			}
			addIf(propChange, { prop: prop, old: oval, new: nval });
			addIf(summary, prop);
			hasChanged = true;
		} else if (nundef(oval)) {
			addIf(onlyNew, prop);
			addIf(summary, prop);
			hasChanged = true;
		} else if (nundef(nval)) {
			addIf(onlyOld, prop);
			addIf(summary, prop);
			hasChanged = true;
		}
	}
	return { onlyOld: onlyOld, onlyNew: onlyNew, propChange: propChange, summary: summary, hasChanged: hasChanged };
}
function removeIf(arr, el) { removeInPlace(arr, el); }
function removeInPlace(arr, el) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] === el) {
			arr.splice(i, 1);
			i--;
			return;
		}
	}
}
function removeInPlaceKeys(dict, keys) {
	for (const k of keys) {
		delete dict[k];
	}
}
function sameList(l1, l2) {
	// compares 2 lists of strings if have same strings in it
	if (l1.length != l2.length) return false;
	for (const s of l1) {
		if (!l2.includes(s)) return false;
	}
	return true;
}
function sameStringify(o1, o2) {
	return JSON.stringify(o1) == JSON.stringify(o2);
}
function simpleRep(val) {
	if (nundef(val) || val === '') {
		return '_';
	} else if (isSimple(val)) return val;
	else if (isList(val)) {
		return '[' + val.map(x => simpleRep(x)).join(', ') + ']';
	} else if (typeof val == 'object') {
		let s = [];
		for (const k in val) {
			if (isEmpty(val[k])) continue;
			let s1 = simpleRep(val[k]);
			if (k == '_set') s1 = '{' + s1.substring(1, s1.length - 1) + '}';
			s.push(s1);
		}
		return s.join(', ');
	}
}
function subdictOf(dict1, keylist) {
	let res = {};
	//if (!isList(keylist)) keylist=[keylist];
	//console.log(keylist)
	for (const k of keylist) {
		res[k] = dict1[k];
	}
	return res;
}
function union(lst1, lst2) {
	return [...new Set([...lst1, ...lst2])];
}



//#endregion

//#region sort
function sortNumbers(ilist) {
	ilist.sort(function (a, b) { return a - b });
	return ilist;
}
const fieldSorter = fields => (a, b) =>
	//usage of field sorter:
	// const homes = [{"h_id":"3", "city":"Dallas", "state":"TX","zip":"75201","price":162500}, {"h_id":"4","city":"Bevery Hills", "state":"CA", "zip":"90210", "price":319250},{"h_id":"6", "city":"Dallas", "state":"TX", "zip":"75000", "price":556699},{"h_id":"5", "city":"New York", "state":"NY", "zip":"00010", "price":962500}];
	// const sortedHomes = homes.sort(fieldSorter(['state', '-price']));
	// document.write('<pre>' + JSON.stringify(sortedHomes, null, '\t') + '</pre>')
	fields
		.map(o => {
			let dir = 1;
			if (o[0] === '-') {
				dir = -1;
				o = o.substring(1);
			}
			return a[o] > b[o] ? dir : a[o] < b[o] ? -dir : 0;
		})
		.reduce((p, n) => (p ? p : n), 0);


function isObject(v) {
	return '[object Object]' === Object.prototype.toString.call(v);
};
// sort by keys only topmost objects!
function sortKeysNonRecursive(o) {
	if (Array.isArray(o)) {
		return o.map(sortKeysNonRecursive); //o.sort().map(JSON.sort);
	} else if (isObject(o)) {
		return Object
			.keys(o)
			.sort()
			.reduce(function (a, k) {
				a[k] = o[k];

				return a;
			}, {});
	}
	return o;
}
// sort by keys only topmost objects!
function sortKeysNonRecursiveDescending(o) {
	if (Array.isArray(o)) {
		return o.map(sortKeysNonRecursiveDescending); //o.sort().map(JSON.sort);
	} else if (isObject(o)) {
		return Object
			.keys(o)
			.reverse()
			.reduce(function (a, k) {
				a[k] = o[k];

				return a;
			}, {});
	}
	return o;
}
// sortKeys does NOT sort lists!!!!
function sortKeys(o) {
	if (Array.isArray(o)) {
		return o.map(sortKeys); //o.sort().map(JSON.sort);
	} else if (isObject(o)) {
		return Object
			.keys(o)
			.sort()
			.reduce(function (a, k) {
				a[k] = sortKeys(o[k]);

				return a;
			}, {});
	}
	return o;
}
//JSON.sort sorts both objects and lists!
JSON.sort = function (o) {
	if (Array.isArray(o)) {
		return o.sort().map(JSON.sort);
	} else if (isObject(o)) {
		return Object
			.keys(o)
			.sort()
			.reduce(function (a, k) {
				a[k] = JSON.sort(o[k]);

				return a;
			}, {});
	}
	return o;
}
function shuffle(arr) { return fisherYates(arr); }
function sortBy(arr, key) {
	//console.log(jsCopy(arr))
	arr.sort((a, b) => (a[key] < b[key] ? -1 : 1));
}
function sortByDescending(arr, key) {
	//console.log(jsCopy(arr))
	arr.sort((a, b) => (a[key] > b[key] ? -1 : 1));
}
function sortByFunc(arr, func) {
	arr.sort((a, b) => (func(a) < func(b) ? -1 : 1));
}
function sortByFuncDescending(arr, func) {
	arr.sort((a, b) => (func(a) > func(b) ? -1 : 1));
}
//#endregion

//#region recursion
// safely handles circular references
function recListToString(lst) {

	if (!isList(lst)) return lst;
	if (isListOfLiterals(lst)) return lst.join(',');// '['+ lst.join(',') +']';
	else {
		let res = [];
		for (const el of lst) {
			let elString = recListToString(el);
			res.push(elString); // += elString + ',';
		}
		//res= res.substring(0,res.length-1);
		return res;
	}
}

JSON.safeStringify = (obj, indent = 2) => {
	// usage:
	//console.log('options', JSON.safeStringify(options))
	let cache = [];
	const retVal = JSON.stringify(
		obj,
		(key, value) =>
			typeof value === "object" && value !== null
				? cache.includes(value)
					? undefined // Duplicate reference found, discard key
					: cache.push(value) && value // Store value in our collection
				: value,
		indent
	);
	cache = null;
	return retVal;
};

var ___enteredRecursion = 0;
const MAX_RECURSIONS = 200;
function safeRecurse(o, func, params, tailrec) {
	___enteredRecursion = 0;
	let arr = Array.from(arguments);
	arr = arr.slice(1);
	//console.log('arr',arr)
	//console.log('arguments',arguments,typeof arguments)
	recAllNodes(o, func, params, tailrec, true);
	return ___enteredRecursion;
}
function recCollect(n, cond, akku, safe = false) {
	//console.log(n,isList(n),isDict(n));
	//console.log(cond)
	if (safe) { ___enteredRecursion += 1; if (___enteredRecursion > MAX_RECURSIONS) { error('MAX_RECURSIONS reached!!!' + f.name); return; } }
	if (cond(n)) akku.push(n);
	if (nundef(n.children)) return;
	for (const ch of n.children) {
		recCollect(ch, cond, akku, safe);
	}
}
function recAllNodes(n, f, p, tailrec, safe = false) {
	//console.log(n,isList(n),isDict(n));
	if (safe) { ___enteredRecursion += 1; if (___enteredRecursion > MAX_RECURSIONS) { error('MAX_RECURSIONS reached!!!' + f.name); return; } }
	if (isList(n)) {
		if (tailrec) f(n, p);
		n.map(x => recAllNodes(x, f, p, tailrec));
		if (!tailrec) f(n, p);
	} else if (isDict(n)) {
		if (tailrec) f(n, p);
		for (const k in n) { recAllNodes(n[k], f, p, tailrec); }
		if (!tailrec) f(n, p);
	}
}
function recPresentFilter(n, level, dLevel, { lf, ls, lo } = {}) {
	mNodeFilter(n, { dParent: dLevel[level], lstFlatten: lf, lstShow: ls, lstOmit: lo });
	if (nundef(n.children)) return level;
	let max = 0;
	for (const x of n.children) {
		let newMax = recPresentFilter(x, level + 1, dLevel, { lf: lf, ls: ls, lo: lo });
		if (newMax > max) max = newMax;
	}
	return max;
}
function recConvertToList(n, listOfProps) {
	//console.log(n)
	if (isList(n)) { n.map(x => recConvertToList(x, listOfProps)); }
	else if (isDict(n) && isList(listOfProps)) {
		for (const prop of listOfProps) {
			let lst = n[prop];
			if (isList(lst) && !isEmpty(lst)) { n[prop] = lst.join(' '); }
		}
		for (const k in n) { recConvertToList(n[k], listOfProps); }
	}
}
function recPresent(n, level, dLevel, nDict, treeProp, { lstFlatten, lstShow, lstOmit } = {}) {
	// let x=JSON.safeStringify(n);
	// let y=JSON.parse(x);
	// if (isdef(y.act)) delete y.act;
	// if (isdef(y.ui)) delete y.ui;
	// //console.log(y)
	//console.log('n',n)
	mNodeFilter(n, { dParent: dLevel[level], lstFlatten: lstFlatten, lstShow: lstShow, lstOmit: lstOmit });
	if (nundef(n.children)) return level;
	let max = 0;
	//console.log('n',n,'n.children',n.children);
	for (const x of n.children) {
		//console.log('x',x,'nDict',nDict,'nDict[x]',nDict[x])
		let nx = nDict[x];
		//console.log('nx',nx)
		let newMax = recPresent(nx, level + 1, dLevel, nDict, treeProp, { lstFlatten: lstFlatten, lstShow: lstShow, lstOmit: lstOmit });
		if (newMax > max) max = newMax;
	}
	return max;
}



function anyString3(x, indent = 0, proplist = null, include = true, guard = ['specKey', 'label', 'pool', 'el', 'sub', 'elm', 'cond', 'info', 'o', 'ui', 'source', 'bi']) {
	if (isLiteral(x)) return x;// ' '.repeat(indent)+x;
	else if (isListOfLiterals(x)) return x.join(' '); // ' '.repeat(indent)+x.join(' ');
	else if (isEmpty(x)) return x;
	else if (isList(x)) {
		return x.map(el => anyString3(el, indent + 1, proplist, include)).join(' ');
	}
	else if (isDict(x)) {
		let s = '';
		for (const k in x) {
			if (guard.includes(k)) continue;
			if (isdef(proplist) && !include && proplist.includes(k)) continue;
			else if (isdef(proplist) && include && !proplist.includes(k)) continue;
			s += '\n' + ' '.repeat(indent) + k + ': ' + anyString3(x[k], indent + 1, proplist, include);
			// s+='\n' + ' '.repeat(indent)+' '.repeat(indent)+k+':'+anyString3(x[k], indent + 1, proplist, include);
		}
		return s;
	}
}
function listToString(lst) { return isEmpty(lst) ? lst : lst.join(' '); }
function dictToKeyList(x) { return Object.keys(lst).join(' '); }
function dictToValueList(x) { return Object.values(lst).join(' '); }
function dictToKVList(x) { return Object.entries(lst).join(' '); }
function dictOrListToString(x, ifDict = 'keys') {
	let lst = x;
	if (isList(lst) && !isEmpty(lst)) { return lst.join(' '); }
	else if (isDict(lst)) {
		return ifDict == 'keys' ? Object.keys(lst).join(' ')
			: ifDict == 'values' ? Object.keys(lst).join(' ')
				: Object.entries(lst).join(' ');
	}
	else return null;
}
function recConvertToSimpleList(n, listOfProps) {
	//console.log(n)
	if (isList(n)) { n.map(x => recConvertToList(x, listOfProps)); }
	else if (isDict(n) && isList(listOfProps)) {
		for (const prop of listOfProps) {
			let conv = dictOrListToString(n[prop]);
			if (conv) n[prop] = conv;
			// let lst = n[prop];
			// if (isList(lst) && !isEmpty(lst)) { n[prop] = lst.join(' '); }
			// else if (isDict(lst)) { n[prop] = Object.keys(lst).join(' '); }
		}
		for (const k in n) { recConvertToList(n[k], listOfProps); }
	}
}
function isEmptyDict(x) { return isDict(x) && isEmpty(Object.keys(x)); }
function recDeleteEmptyObjects(o) {
	if (isLiteral(o)) return o;
	else if (isList(o)) return o.map(x => recDeleteEmptyObjects(x));
	let onew = {};
	for (const k in o) {
		if (!isEmpty(o[k])) {
			onew[k] = recDeleteEmptyObjects(jsCopy(o[k]));
		}
	}
	return onew;
}
function recDeleteKeys(o, deleteEmpty = true, omitProps) {
	//console.log('hallllllllllllllllllll')
	if (isLiteral(o)) return o;
	else if (isList(o)) return o.map(x => recDeleteKeys(x, deleteEmpty, omitProps));
	let onew = {};
	for (const k in o) {
		if (omitProps.includes(k)) continue;
		//console.log(k)
		if (isLiteral(o[k]) || !isEmpty(o[k])) {
			onew[k] = recDeleteKeys(jsCopy(o[k]), deleteEmpty, omitProps);
		} else {
			//console.log('EMPTY!!!!!!!!!!!!!',k,o[k])
		}
	}
	return onew;
}
function recFindExecute(o, prop, func) {
	//usage: recFindProp(node, '_id', 'self', akku);
	//find all incidences of key==prop in object or list o, and collects their path & value
	//console.log(o);
	if (!isDict(o) && !Array.isArray(o)) { return; }
	if (isDict(o)) {
		// if (o[prop]) { akku[path] = o; }
		if (o[prop]) { func(o); }
		for (const k in o) { recFindExecute(o[k], prop, func); }
	} else if (isList(o)) {
		for (let i = 0; i < o.length; i++) {
			this.recFindExecute(o[i], prop, func);
		}
	}
}

function recFindProp(o, prop, path, akku) {
	//usage: recFindProp(node, '_id', 'self', akku);
	//find all incidences of key==prop in object or list o, and collects their path & value
	//console.log(o);
	if (!isDict(o) && !Array.isArray(o)) { return; }
	if (isDict(o)) {
		// if (o[prop]) { akku[path] = o; }
		if (o[prop]) { akku[path] = { name: o[prop], node: o }; }
		for (const k in o) { recFindProp(o[k], prop, path + '.' + k, akku); }
	} else if (isList(o)) {
		for (let i = 0; i < o.length; i++) {
			this.recFindProp(o[i], prop, path + '.' + i, akku);
		}
	}
}

function recFindProp_dep(o, prop, path, akku) {
	//usage: recFindProp(node, '_id', 'self', akku);
	//find all incidences of key==prop in object or list o, and collects their path & value
	//console.log(o);
	if (!isDict(o) && !Array.isArray(o)) { return; }
	if (isDict(o)) {
		// if (o[prop]) { akku[path] = o; }
		if (o[prop]) { akku[path] = o[prop]; }
		for (const k in o) { recFindProp(o[k], prop, path + '.' + k, akku); }
	} else if (isList(o)) {
		for (let i = 0; i < o.length; i++) {
			this.recFindProp(o[i], prop, path + '.' + i, akku);
		}
	}
}
//#endregion

//#region random
function chooseRandom(arr, condFunc = null) {
	let len = arr.length;
	if (condFunc) {
		let best = arr.filter(condFunc);
		if (!isEmpty(best)) return chooseRandom(best);
	}
	let idx = Math.floor(Math.random() * len);
	return arr[idx];
}
function chooseRandomKey(dict) { return chooseRandom(Object.keys(dict)); }
function chooseRandomDictKey(dict, condFunc = null) {
	if (isEmpty(dict)) return null;
	let arr = Object.keys(dict);
	let len = arr.length;
	if (condFunc) {
		let best = arr.filter(condFunc);
		if (!isEmpty(best)) return chooseRandom(best);
	}
	let idx = Math.floor(Math.random() * len);
	return arr[idx];
}
function getRandomNumberSequence(n, minStart, maxStart, fBuild, exceptStart) { //{op,step,fBuild}) {
	let nStart = randomNumber(minStart, maxStart - n + 1);
	if (exceptStart) {
		let att = 10;
		while (att >= 0 && nStart == exceptStart) { att -= 1; nStart = randomNumber(minStart, maxStart - n + 1); }
	}
	if (isNumber(fBuild)) return range(nStart, nStart + (n - 1) * fBuild, fBuild);
	else {
		let res = [], x = nStart;
		for (let i = 0; i < n; i++) {
			res.push(x);
			x = fBuild(x);
		}
		return res;
	}


}
function nRandomNumbers(n, from, to, step) {
	let arr = range(from, to, step);
	return choose(arr, n);
}
function chooseKeys(dict, n, except) { let keys = Object.keys(dict); let ind = except.map(x => keys.indexOf(x)); return choose(keys, n, ind); }
function choose(arr, n, exceptIndices) {
	//console.log(arr, n);
	var result = [];//new Array(n);
	var len = arr.length;
	var taken = new Array(len);
	if (isdef(exceptIndices) && exceptIndices.length < len - n) {
		for (const i of exceptIndices) if (i >= 0 && i <= len) taken[i] = true;
	}
	//console.log('taken',jsCopy(taken));
	//console.log('len', len);
	if (n > len) n = len - 1; // throw new RangeError('getRandom: more elements taken than available');
	while (result.length < n) {
		var iRandom = Math.floor(Math.random() * len);
		//console.log('iRandom',iRandom)
		while (taken[iRandom]) { iRandom += 1; if (iRandom >= len) iRandom = 0; }

		result.push(arr[iRandom]);
		taken[iRandom] = true;
	}
	return result;
}
function choose_dep(arr, n) {
	//console.log(arr, n);
	var result = new Array(n);
	var len = arr.length;
	var taken = new Array(len);
	//console.log('len', len);
	if (n > len) n = len - 1; // throw new RangeError('getRandom: more elements taken than available');
	while (n--) {
		var iRandom = Math.floor(Math.random() * len);
		result[n] = arr[iRandom in taken ? taken[iRandom] : iRandom];
		taken[iRandom] = --len in taken ? taken[len] : len;
	}
	return result;
}
function getNColors(n) {
	return choose(getColorNames(), n);
} //ok
function getRandomKey(dict) {
	let keys = Object.keys(dict);
	return chooseRandom(keys);
}
function randomColor(s, l, a) { return isdef(s) ? randomHslaColor(s, l, a) : randomHexColor(); }
function randomHslaColor(s = 100, l = 70, a = 1) {
	//s,l in percent, a in [0,1], returns hsla string
	var hue = Math.round(Math.random() * 360);
	return hslToHslaString(hue, s, l, a);
}
function randomHexColor() {
	let s = '#';
	for (let i = 0; i < 6; i++) {
		s += chooseRandom(['f', 'c', '9', '6', '3', '0']);
	}
	return s;
}
function randomNumber(min = 0, max = 100) {
	return Math.floor(Math.random() * (max - min + 1)) + min; //min and max inclusive!
}
function tossCoin(percent) {

	let r = Math.random();
	//r ist jetzt zahl zwischen 0 und 1
	r *= 100;
	//console.log('random:',r)
	//r ist jetzt zahl zwischen 0 und 100
	return r < percent;
}
function coin(p=50) { return tossCoin(p); }
function yesNo() { return tossCoin(50); }
//#endregion

//#region string functions
function substringOfMinLength(s, minStartIndex, minLength) {
	let res = s.substring(minStartIndex).trim();
	let i = 0;
	let res1 = '';
	while (res1.trim().length < minLength && i < res.length) { res1 += res[i]; i += 1; }
	return res1.trim();
}
function removeNonAlphanum(s) {
	let res = '';
	let nonalphas = '';
	for (const l of s) {
		if (isAlphaNumeric(l)) res += l; else nonalphas += l;
	}
	return { alphas: res, whites: nonalphas };
}
function findCommonPrefix(s1, s2) {
	let i = 0;
	let res = '';
	while (i < s1.length && i < s2.length) {
		if (s1[i] != s2[i]) break; else res += s1[i];
		i += 1;
	}
	return res;
}
function getCorrectPrefix(label, text) {

	// let txt = this.input.value;
	// console.log('input value',txt);

	let req = label.toLowerCase();
	let answer = text.toLowerCase();

	let res1 = removeNonAlphanum(req);
	let res2 = removeNonAlphanum(answer);
	let req1 = res1.alphas;// removeNonAlphanum(req);
	let answer1 = res2.alphas; //removeNonAlphanum(answer);
	let whites = res1.whites;

	let common = findCommonPrefix(req1, answer1);
	//now find common prefix
	//console.log(req1, answer1, 'common prefix is',common);

	//the real address is label
	//let aReal = label;
	//whites
	let nletters = common.length;
	let ireal = 0;
	let icompact = 0;
	let iwhites = 0;
	let correctPrefix = '';
	while (icompact < nletters) {
		if (req[ireal] == common[icompact]) { correctPrefix += label[ireal]; icompact += 1; }
		else if (whites[iwhites] == req[ireal]) { correctPrefix += label[ireal]; iwhites += 1; }
		else break;
		ireal += 1;
	}
	//console.log('__________result:',correctPrefix);

	return correctPrefix;
}
function ordinal_suffix_of(i) {
	var j = i % 10,
		k = i % 100;
	if (j == 1 && k != 11) {
		return i + "st";
	}
	if (j == 2 && k != 12) {
		return i + "nd";
	}
	if (j == 3 && k != 13) {
		return i + "rd";
	}
	return i + "th";
}
function allLettersContained(sFull, sPart) {
	for (const ch of sPart) {
		if (!(sFull.includes(ch))) return false;
	}
	return true;
}
function normalize(text, language) {
	if (isEmpty(text)) return '';
	text = text.toLowerCase().trim();
	if (language == 'D') {
		text = convertUmlaute(text);
	}
	return text;
}
function isEnglishKeyboardGermanEquivalent(wreq, w) {
	wreq = fromUmlaut(wreq)
	w = fromUmlaut(w);
	return allLettersContained(wreq, w);
}
function convertUmlaute(w) {
	//ue ü, ae ä, oe ö

	w = replaceAll(w, 'ue', 'ü');
	w = replaceAll(w, 'ae', 'ä');
	w = replaceAll(w, 'oe', 'ö');
	w = replaceAll(w, 'UE', 'Ü');
	w = replaceAll(w, 'AE', 'Ä');
	w = replaceAll(w, 'OE', 'Ö');
	w = replaceAll(w, 'ß', 'ss');
	return w;
}
function toUmlaut(w) {
	//ue ü, ae ä, oe ö
	if (isList(w)) {
		let res = [];
		for (const w1 of w) res.push(toUmlaut(w1));
		return res;
	} else {
		w = replaceAll(w, 'ue', 'ü');
		w = replaceAll(w, 'ae', 'ä');
		w = replaceAll(w, 'oe', 'ö');
		w = replaceAll(w, 'UE', 'Ü');
		w = replaceAll(w, 'AE', 'Ä');
		w = replaceAll(w, 'OE', 'Ö');
		return w;
	}
}
function fromUmlaut(w) {
	if (isList(w)) {
		let res = [];
		for (const w1 of w) res.push(fromUmlaut(w1));
		return res;
	} else {
		//ue ü, ae ä, oe ö
		w = replaceAll(w, 'ü', 'ue');
		w = replaceAll(w, 'ä', 'ae');
		w = replaceAll(w, 'ö', 'oe');
		w = replaceAll(w, 'Ü', 'UE');
		w = replaceAll(w, 'Ä', 'AE');
		w = replaceAll(w, 'Ö', 'OE');
		return w;
	}
}
function countLetters(s, letter) {
	let n = 0;
	for (const ch of s) {
		if (ch == letter) n++;
	}
	return n;
}

function allIntegers(s) {
	//returns array of all numbers within string s
	return s.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(v => {
		return +v;
	});
}
function allNumbers(s) {
	//returns array of all numbers within string s
	let m= s.match(/\-.\d+|\-\d+|\.\d+|\d+\.\d+|\d+\b|\d+(?=\w)/g);
	if (m) return m.map(v => Number(v)); else return null;
	// {console.log(v,typeof v,v[0],v[0]=='-',v[0]=='-'?-(+v):+v,Number(v));return Number(v);});
}
function capitalize(s) {
	if (typeof s !== 'string') return '';
	return s.charAt(0).toUpperCase() + s.slice(1);
}
function countIndent(s, ntab = 2) {

	let i = 0;
	let inc;
	while (!isEmpty(s)) {
		if (startsWith(s, '\t')) { i += ntab; inc = ntab; }
		else if (s[0] == ' ') { i += 1; inc = 1; }
		else break;
		s = s.slice(1);
		//console.log(s);
	}
	return i;
}
function eraseSpaces(s) {
	let i = 0;
	while (s.includes('  ')) {
		//testHelpers(i++ + ": ", s);
		s = s.replace('  ', ' ');
		s = s.replace(' {', '{');
		s = s.replace(' (', '(');
		s = s.replace('\n ', ' ');
		s = s.replace('\n{', '{');
		s = s.replace('\n}', '}');
	}
	return s;
}
function endsWith(s, sSub) {
	let i = s.indexOf(sSub);
	return i == s.length - sSub.length;
}
function getLines(s) {
	// returns array of lines in s
	var str = s;
	var res = str.split('\n');
	return res;
}
function firstNumber(s) {
	// returns first number in string s
	if (s) {
		let m = s.match(/-?\d+/);
		if (m) {
			let sh = m.shift();
			if (sh) { return Number(sh); }
		}
	}
	return null;
}
function firstFloat(s) {
	// returns first number in string s
	if (s) {
		let m = s.match(/-?.?\d+/);
		if (m) {
			let sh = m.shift();
			if (sh) { return Number(sh); }
		}
	}
	return null;
}
function firstPositiveNumber(s) {
	// returns first number in string s
	return s ? Number(s.match(/\d+/).shift()) : -1;
}
function firstWord(s) {
	let i = 0;
	let res = '';
	while (i < s.length && !isWhiteSpace(s[i])) { res += s[i]; i += 1; }
	return res;
}
function lastWord(s) { return stringAfterLast(s, ' '); }
function hasWhiteSpace(s) { return /\s/g.test(s); }
function isLetter(s) { return /^[a-zA-Z]$/i.test(s); }
function isCapitalLetter(s) { return /^[A-Z]$/i.test(s); }
function isCapitalLetterOrDigit(s) { return /^[A-Z0-9ÖÄÜ]$/i.test(s); }
function isSingleDigit(s) { return /^[0-9]$/i.test(s); }
function isAlphaNum(s) {
	//regex version: Here 
	// ^ means beginning of string and 
	// $ means end of string, and [0-9a-z]+ means one or more of character from 0 to 9 OR from a to z.
	// i means case insensitive

	return /^[a-z0-9_]+$/i.test(s); // only lower case: /^[0-9a-z_]+$/);

	//alternativ: /[a-zA-Z0-9-_ ]/.test(charEntered)
}
function isAlphaNumeric(str) {
	var code, i, len;

	for (i = 0, len = str.length; i < len; i++) {
		code = str.charCodeAt(i);
		if (!(code > 47 && code < 58) && // numeric (0-9)
			!(code > 64 && code < 91) && // upper alpha (A-Z)
			!(code > 96 && code < 123) && str[i] != '_') { // lower alpha (a-z)
			return false;
		}
	}
	return true;
}
function isWhiteSpace(ch) { return /\s/.test(ch) }
function isWhiteSpace1(s) { let white = new RegExp(/^\s$/); return white.test(s.charAt(0)); }
function isWhiteSpace2(ch) {
	const alphanum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
	return !alphanum.includes(ch);
}
function makeString(obj, prop, maxlen = 50, isStart = true) {
	let s = prop + ':';
	if (prop in obj) {
		let s1 = JSON.stringify(obj[prop]);
		if (maxlen > 0) {
			s += isStart ? s1.substring(0, maxlen) : s1.substring(s.length - maxlen);
		} else {
			s += s1;
		}
	} else {
		s += ' not present';
	}
	return s;
}
function makeStrings(obj, props, maxlen = 50, isStart = true) {
	strs = props.map(x => makeString(obj, x)).join('\n');
	return strs;
}
function multiSplit(s, seplist) {
	let res = [s];
	for (const sep of seplist) {
		let resNew = [];
		//console.log(res)
		for (const s1 of res) {
			//console.log(s1)
			let parts = s1.split(sep);
			resNew = resNew.concat(parts);
		}
		res = resNew;
	}
	return res.filter(x => !isEmpty(x));
}
function splitAtWhiteSpace(s) { return s.split(/[-/ ,]+/); }
function padSep(sep, n, args) {
	//sep..separator string, n..length of result, args are arbitrary numbers
	//each number in args is padded with 0's to length n, numbers are then separated by sep
	// eg. padSep(':',2,12,1,0) => '12:01:00'
	s = '';
	for (var i = 2; i < arguments.length; i++) {
		s += arguments[i].toString().padStart(n, '0') + sep;
	}
	return s.substring(0, s.length - 1);
}
function replaceAll(str, sSub, sBy) {
	let regex = new RegExp(sSub, 'g');
	return str.replace(regex, sBy);
}
function reverseString(s) {
	return toLetterList(s).reverse().join('');
}
function sameCaseInsensitive(s1, s2) {
	return s1.toLowerCase() == s2.toLowerCase();
}
function sepWordListFromString(s, seplist) {
	let words = multiSplit(s, seplist);
	return words.map(x => x.replace('"', '').trim());
}
function simpleWordListFromString(s, sep = [' ']) {
	let lst = listFromString(s);
	let res = [];
	for (const w of lst) {
		let parts = w.split(sep);
		parts.map(x => addIf(res, x));
	}
	return res;
}
function listFromString(s) {
	//let tags=s.replace('"','').trim();
	let words = s.split(',');
	return words.map(x => x.replace('"', '').trim());
}

function startsWith(s, sSub) {
	//testHelpers('startWith: s='+s+', sSub='+sSub,typeof(s),typeof(sSub));
	return s.substring(0, sSub.length) == sSub;
}
function startsWithCaseInsensitive(s, ssub) {
	return startsWith(s.toLowerCase(), ssub.toLowerCase());
}
function stringAfter(sFull, sSub) {
	//testHelpers('s='+sFull,'sub='+sSub)
	let idx = sFull.indexOf(sSub);
	//testHelpers('idx='+idx)
	if (idx < 0) return '';
	return sFull.substring(idx + sSub.length);
}
function stringAfterLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return arrLast(parts);
}
function stringBefore(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return sFull;
	return sFull.substring(0, idx);
}
function stringBeforeLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return sFull.substring(0, sFull.length - arrLast(parts).length - 1);
}
function stringBetween(sFull, sStart, sEnd) {
	return stringBefore(stringAfter(sFull, sStart), isdef(sEnd) ? sEnd : sStart);
}
function stringBetweenLast(sFull, sStart, sEnd) {
	let s1 = stringBeforeLast(sFull, isdef(sEnd) ? sEnd : sStart);
	return stringAfterLast(s1, sStart);
	//return stringBefore(stringAfter(sFull,sStart),isdef(sEnd)?sEnd:sStart);
}
function toLetterList(s) {
	return [...s];
}
function trim(str) {
	return str.replace(/^\s+|\s+$/gm, '');
}
//#endregion

//#region Timit
class TimeIt {
	constructor(msg, showOutput = true) {
		this.showOutput = showOutput;
		this.init(msg);
	}
	getTotalTimeElapsed() {
		let tNew = new Date();
		let tDiffStart = tNew.getTime() - this.namedTimestamps.start.getTime();
		return tDiffStart;
	}
	tacit() { this.showOutput = false; }
	timeStamp(name) {
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - this.namedTimestamps.start.getTime();// this.t.getTime();
		if (this.showOutput) console.log('___', tDiff, 'msecs * to', name);
		this.t = tNew;
		this.namedTimestamps[name] = tNew;
	}
	reset() { this.init('timing start') }
	init(msg) {
		this.t = new Date();
		if (this.showOutput) console.log('___', msg);
		this.namedTimestamps = { start: this.t };
	}
	showSince(name, msg = 'now') {
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tNamed = this.namedTimestamps[name];
		if (this.showOutput) if (!tNamed) { console.log(name, 'is not a timestamp!'); return; } //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - tNamed.getTime();
		if (this.showOutput) console.log('___', tDiff, 'msecs', name, 'to', msg);
		this.t = tNew;
	}
	format(t) { return '___' + t.getSeconds() + ':' + t.getMilliseconds(); }
	show(msg) { this.showTime(msg); }
	showTime(msg) {
		//shows ticks diff to last call of show
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - this.t.getTime();
		let tDiffStart = tNew.getTime() - this.namedTimestamps.start.getTime();
		//if (this.showOutput) console.log(this.format(tNew), ':', tDiff, 'msecs to', msg, '(' + tDiffStart, 'total)');
		if (this.showOutput) console.log('___ ', tDiff, 'msecs to', msg, '(' + tDiffStart, 'total)');
		this.t = tNew;
	}
	start_of_cycle(msg) {
		this.init(msg);
	}
	end_of_cycle(msg) {
		//shows ticks diff to last call of show
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - this.t.getTime();
		let tDiffStart = tNew.getTime() - this.namedTimestamps.start.getTime();
		if (this.showOutput) console.log('___ ' + tDiff + ' msecs', msg, 'to EOC (total: ' + tDiffStart + ')');
	}
}
//#endregion

//#region types, conversions
function convertToList(x) {
	if (isList(x)) return x;
	if (isString(x) && x != '') return [x];
	return [];
}
function evToClosestId(ev) {
	//returns first ancestor that has an id
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function getTypeOf(param) {
	//console.log('>>>>>getTypeOf',param)
	let type = typeof param;
	if (type == 'string') {
		return 'string';
	}
	if (type == 'object') {
		type = param.constructor.name;
		if (startsWith(type, 'SVG')) type = stringBefore(stringAfter(type, 'SVG'), 'Element').toLowerCase();
		else if (startsWith(type, 'HTML')) type = stringBefore(stringAfter(type, 'HTML'), 'Element').toLowerCase();
	}
	let lType = type.toLowerCase();
	if (lType.includes('event')) type = 'event';
	return type;
}
function hexDigitToDecimal(hex) {
	let n = firstNumber(hex);
	if (nundef(n)) {
		hex = hex.toLowerCase();
		return hex == 'f' ? 15 : hex == 'e' ? 14 : hex == 'd' ? 13 : hex == 'c' ? 12 : hex == 'b' ? 11 : 10;
	} else return n;
}
function hexStringToDecimal(hex) {
	let len = hex.length;
	let fact = 1;
	let num = 0;
	for (let i = len - 1; i >= 0; i--) {
		num += hexDigitToDecimal(hex[i]) * fact;
		fact *= 16;
	}
	return num;
}
function isdef(x) { return x !== null && x !== undefined; }
function isDictOrList(d) { return typeof (d) == 'object'; }
function isDict(d) { let res = (d !== null) && (typeof (d) == 'object') && !isList(d); return res; }
function isEvent(param) { return getTypeOf(param) == 'event'; }
function isLiteral(x) { return isString(x) || isNumber(x); }
function isList(arr) { return Array.isArray(arr); }
function isListOfLiterals(lst) {
	if (!isList(lst)) return false;
	for (const el of lst) {
		if (!isLiteral(el)) return false;
		// if (isList(el)) return false;
	}
	return true;
}
function isListOfLists(lst) {
	return isList(lst) && !isEmpty(lst) && isList(lst[0]);
}
function isNumber(param) { return !isNaN(Number(param)); }
function isNumeric(x) { return !isNaN(+x); }
function isSet(x) { return (isDict(x) && (x.set || x._set)); }
function isComplexColor(x) { return isString(x) && x.includes('('); }
function isSimple(x) { return isString(x) || isNumeric(x); }
function isString(param) { return typeof param == 'string'; }
function isSvg(elem) { return startsWith(elem.constructor.name, 'SVG'); }
function nundef(x) { return x === null || x === undefined; }

function toList(x) { return isList(x) ? x : [x]; }

//faster version of getValueArray
function getElements(o, elKey = '_obj', arrKey = '_set') {
	// {_set:[{_obj:1},{_obj:2},...]} ==> [1,2,..]
	if (!o) return [];
	let res = o[arrKey] ? o[arrKey] : o;
	//console.log('[[[[[[[[[[[[',res)
	if (isList(res) && res.length > 0) return res[0][elKey] ? res.map(x => x[elKey]) : res;
	else return [];
}
function getElementLists(o, elKey = '_obj', arrKey = '_set') {
	// for each prop of o with a val like {_set:[{_obj:1},{_obj:2},...]} ==> {prop:[1,2,..]} is added to res 
	let res = {};
	if (!o) return [];
	for (const k in o) {
		let o1 = o[k];
		if (isLiteral(o1)) continue;
		let els = getElements(o1, elKey, arrKey);
		if (!isEmpty(els)) res[k] = els;
	}
	return res;
}
function getValueArray(o, elKey = 'obj', arrKey = '_set') {
	//for {_set:[{_obj:111},{_obj:222}]} returns [111,222]
	let raw = jsCopy(o);
	if (isdef(o[arrKey])) {
		raw = raw[arrKey];
	}
	if (isDict(raw)) {
		raw = odict2olist(raw);
	}
	if (!isList(raw)) return [];
	if (raw.length > 0 && raw[0][elKey]) {
		raw = raw.map(x => x[elKey]);
	}
	return raw;
}
function _setToList(oval) { if (typeof oval == 'object' && '_set' in oval) return oval._set; else return oval; }

//#endregion

//#region zooming
function deltaTransformPoint(matrix, point) {
	var dx = point.x * matrix.a + point.y * matrix.c + 0;
	var dy = point.x * matrix.b + point.y * matrix.d + 0;
	return { x: dx, y: dy };
}
function decomposeMatrix(matrix) {
	// @see https://gist.github.com/2052247

	// calculate delta transform point
	var px = deltaTransformPoint(matrix, { x: 0, y: 1 });
	var py = deltaTransformPoint(matrix, { x: 1, y: 0 });

	// calculate skew
	var skewX = (180 / Math.PI) * Math.atan2(px.y, px.x) - 90;
	var skewY = (180 / Math.PI) * Math.atan2(py.y, py.x);

	return {
		translateX: matrix.e,
		translateY: matrix.f,
		scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
		scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
		scale: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
		skewX: skewX,
		skewY: skewY,
		rotation: skewX // rotation is the same as skew x
	};
}
function getTransformInfo(gElement) {
	//testHelpers(gElement);
	var matrix = gElement.getCTM();
	let info = decomposeMatrix(matrix);
	return info;
}
function getZoomFactor(gElement) {
	//var m = gElement.getAttribute("transform");
	var matrix = gElement.getCTM();
	let info = decomposeMatrix(matrix);
	return info.scale;
	// testHelpers(x.scale);
}
//#endregion zooming








//#endregion

//#region assets
//#region globals
const SHOW_SERVER_ROUTE = false; // true | false
const SHOW_SERVER_RETURN = false; // true | false
const EMOFONTLIST = ['emoOpen', 'openmoBlack', 'segoe ui emoji', 'segoe ui symbol'];

var vidCache, allGames, playerConfig, c52, cinno, testCards; //session data
var defaultSpec, userSpec, userCode, serverData, prevServerData, tupleGroups, boats; //new game data

var symbolDict, symbolKeys, symbolList; //gibt es immer
var svgDict, svgKeys, svgList; //?
var Syms,SymKeys; //new API!

//the following are only produced lazily! (see ensure)
// byType hat keys: emo, icon, eduplo, iduplo!!!
var symByType, symBySet;//hier sind info dicts
var symKeysByType, symKeysBySet;//hier sind key lists (dict by key)
var symListByType, symListBySet;//hier sind info lists (dict by key)
var svgDict, svgKeys, svgList; //?

var BestKeysD, BestKeysE, BestKeySets;
var DeDict,EdDict; //deutsch=>engl, engl=>deutsch
//var CorrectKeysByLanguage,CorrectByKey;
//var CorrectWords, CorrectWordsExact, CorrectWordsCorrect, CorrectWordsFailed; //dep!

var symKeysByGroupSub;

//var cachedInfolists = {};

//#endregion

//#region color constants
const LIGHTGREEN = '#afff45'; //'#bfef45';
const LIGHTBLUE = '#42d4f4';
const YELLOW = '#ffe119';
const RED = '#e6194B';
const GREEN = '#3cb44b';
const BLUE = '#4363d8';
const PURPLE = '#911eb4';
const YELLOW2 = '#ffa0a0';
const TEAL = '#469990';
const ORANGE = '#f58231';
const FIREBRICK = '#800000';
const OLIVE = '#808000';
const CRIMSON = colorDarker('crimson',.25);

const ColorList = ['lightgreen', 'lightblue', 'yellow', 'red', 'green', 'blue', 'purple', 'violet', 'lightyellow',
	'teal', 'orange', 'brown', 'olive', 'deepskyblue', 'deeppink', 'gold', 'black', 'white', 'grey'];
const ColorDict = {
	black: { c: 'black', E: 'black', D: 'schwarz' },
	blue: { c: 'blue', E: 'blue', D: 'blau' },
	blue1: { c: BLUE, E: 'blue', D: 'blau' },
	brown: { c: FIREBRICK, E: 'brown', D: 'rotbraun' },
	crimson: { c: CRIMSON, E: 'red', D: 'rot' },
	gold: { c: 'gold', E: 'gold', D: 'golden' },
	green: { c: 'green', E: 'green', D: 'grün' },
	green1: { c: GREEN, E: 'green', D: 'grün' },
	grey: { c: 'grey', E: 'grey', D: 'grau' },
	lightblue: { c: LIGHTBLUE, E: 'lightblue', D: 'hellblau' },
	lightgreen: { c: LIGHTGREEN, E: 'lightgreen', D: 'hellgrün' },
	lightyellow: { c: YELLOW2, E: 'lightyellow', D: 'gelb' },
	olive: { c: OLIVE, E: 'olive', D: 'oliv' },
	orange: { c: ORANGE, E: 'orange', D: 'orange' },
	pink: { c: 'deeppink', E: 'pink', D: 'rosa' },
	purple: { c: PURPLE, E: 'purple', D: 'lila' },
	red: { c: 'red', E: 'red', D: 'rot' },
	red1: { c: RED, E: 'red', D: 'rot' },
	skyblue: { c: 'deepskyblue', E: 'skyblue', D: 'himmelblau' },
	teal: { c: TEAL, E: 'teal', D: 'blaugrün' },
	violet: { c: 'indigo', E: 'violet', D: 'violett' },
	white: { c: 'white', E: 'white', D: 'weiss' },
	yellow: { c: 'yellow', E: 'yellow', D: 'gelb' },
	CRIMSON: { c: colorDarker('crimson',.25), E: 'crimson', D: 'rot' },
	OLIVE: { c: '#808000', E: 'olive', D: 'oliv' },
	FIREBRICK: { c: '#800000', E: 'darkred', D: 'rotbraun' },
	ORANGE: { c: '#f58231', E: 'orange', D: 'orange' },
	TEAL: { c: '#469990', E: 'teal', D: 'blaugrün' },
	YELLOW2: { c: '#ffff33', E: 'yellow', D: 'gelb' },
	PURPLE: { c: '#911eb4', E: 'purple', D: 'lila' },
	BLUE: { c: '#4363d8', E: 'blue', D: 'blau' },
	GREEN: { c: '#3cb44b', E: 'green', D: 'grün' },
	RED: { c: '#e6194B', E: 'red', D: 'rot' },
	YELLOW: { c: '#ffe119', E: 'yellow', D: 'gelb' },
	LIGHTBLUE: { c: '#42d4f4', E: 'lightblue', D: 'hellblau' },
	LIGHTGREEN: { c: '#afff45', E: 'lightgreen', D: 'hellgrün' },
};


//#endregion

//#region audio
var _audioSources = {
	incorrect1: '../assets/sounds/incorrect1.wav',
	incorrect3: '../assets/sounds/incorrect3.mp3',
	goodBye: "../assets/sounds/level1.wav",
	down: "../assets/sounds/down.mp3",
	levelComplete: "../assets/sounds/sound1.wav",
	rubberBand: "../assets/sounds/sound2.wav",
	hit: "../assets/sounds/hit.wav",
};
// var _SND = null;
var TOSound, _sndPlayer, _loaded = false, _qSound, _idleSound = true, _sndCounter = 0;
var _AUDIOCONTEXT;// browsers limit the number of concurrent audio contexts, so you better re-use'em

function beep(vol, freq, duration) {
	console.log('sollte beepen!!!'); //return;
	if (nundef(_AUDIOCONTEXT)) _AUDIOCONTEXT = new AudioContext();
	let a = _AUDIOCONTEXT;
	v = a.createOscillator()
	u = a.createGain()
	v.connect(u)
	v.frequency.value = freq
	v.type = "square";
	u.connect(a.destination)
	u.gain.value = vol * 0.01
	v.start(a.currentTime)
	v.stop(a.currentTime + duration * 0.001);
}
function playSound(key, wait = true) {
	//console.log(getFunctionsNameThatCalledThisFunction(),'=> playSound');
	//console.log('_______playSound', 'key', key, '_sndPlayer', _sndPlayer, '\nIdle', _idleSound, 'loaded', _loaded, 'count:' + _sndCounter);
	if (!wait) _qSound = [];
	_enqSound(key);
	if (_idleSound) { _idleSound = false; _deqSound(); }
}
function pauseSound() {
	_qSound = [];
	if (_loaded && isdef(_sndPlayer)) {
		clearTimeout(TOSound);
		_sndPlayer.onended = null;
		_sndPlayer.onpause = whenSoundPaused;
		_sndPlayer.pause();
	}
}
function whenSoundPaused() {
	_sndPlayer = null;
	_sndPlayerIdle = true;
	_loaded = false;
	//console.log('ENDED!!! Idle=true loaded=false');
	if (!isEmpty(_qSound)) { _deqSound(); } else { _idleSound = true; }
}
function _enqSound(key) { if (nundef(_qSound)) _qSound = []; _qSound.push(key); }
function _deqSound() {
	let key = _qSound.shift();
	let url = _audioSources[key];
	_sndPlayer = new Audio(url);
	_sndPlayer.onended = whenSoundPaused;
	_sndPlayer.onloadeddata = () => { _loaded = true; _sndPlayer.play(); };
	_sndPlayer.load();
}
//#endregion audio

//#region emoSets_

//var selectedEmoSetNames = ['animal', 'body', 'drink', 'emotion', 'food', 'fruit', 'game', 'gesture', 'hand', 'kitchen', 'object', 'person', 'place', 'plant', 'sports', 'time', 'transport', 'vegetable'];
var selectedEmoSetNames = ['all', 'animal', 'body', 'drink', 'emotion', 'food', 'fruit', 'game', 'gesture', 'kitchen', 'object', 'person', 'place', 'plant', 'sports', 'time', 'transport', 'vegetable'];

var primitiveSetNames = ['all', 'activity', 'animal', 'body', 'drink',
	'emotion', 'family', 'fantasy', 'food', 'fruit', 'game', 'gesture',
	'kitchen', 'object', 'place', 'plant', 'person',
	'role', 'shapes', 'sport', 'sports',
	'time', 'transport', 'vegetable',

	'toolbar', 'math', 'punctuation', 'misc'];

var higherOrderEmoSetNames = {
	animals: ['animal'],
	animalplantfood: ['animal', 'plant', 'drink', 'food', 'fruit', 'vegetable'],
	life: ['animal', 'plant', 'drink', 'food', 'fruit', 'vegetable', 'kitchen', 'game', 'sport'],
	more: ['animal', 'plant', 'drink', 'food', 'fruit', 'kitchen', 'vegetable', 'game', 'sport', 'transport', 'object'],
	// nosymbols: ['animal', 'plant', 'drink', 'food', 'fruit', 'kitchen', 'vegetable', 'game', 'sport', 'transport', 'object',
	// 	'activity','body','emotion','fantasy'],
};
var higherOrderEmoSetNames1 = { all: ['all'], select: selectedEmoSetNames, abstract: ['time', 'symbols'], action: ['game', 'sports'], food: ['drink', 'food', 'fruit', 'kitchen', 'vegetable'], human: ['body', 'gesture', 'emotion', 'person', 'role'], life: ['animal', 'plant'], mood: ['emotion'], object: ['object'], places: ['place', 'transport'] };

var emoSets = {
	nosymbols: { name: 'nosymbols', f: o => o.group != 'symbols' && o.group != 'flags' && o.group != 'clock' },
	nosymemo: { name: 'nosymemo', f: o => o.group != 'smileys-emotion' && o.group != 'symbols' && o.group != 'flags' && o.group != 'clock' },

	all: { name: 'all', f: _ => true },
	activity: { name: 'activity', f: o => o.group == 'people-body' && (o.subgroups == 'person-activity' || o.subgroups == 'person-resting') },
	animal: { name: 'animal', f: o => startsWith(o.group, 'animal') && startsWith(o.subgroups, 'animal') },
	body: { name: 'body', f: o => o.group == 'people-body' && o.subgroups == 'body-parts' },
	clock: { name: 'clock', f: o => o.group == 'clock' },
	drink: { name: 'drink', f: o => o.group == 'food-drink' && o.subgroups == 'drink' },
	emotion: { name: 'emotion', f: o => o.group == 'smileys-emotion' },
	family: { name: 'family', f: o => o.group == 'people-body' && o.subgroups == 'family' },
	fantasy: { name: 'fantasy', f: o => o.group == 'people-body' && o.subgroups == 'person-fantasy' },
	food: { name: 'food', f: o => o.group == 'food-drink' && startsWith(o.subgroups, 'food') },
	fruit: { name: 'fruit', f: o => o.group == 'food-drink' && o.subgroups == 'food-fruit' },
	game: { name: 'game', f: o => (o.group == 'activities' && o.subgroups == 'game') },
	gesture: { name: 'gesture', f: o => o.group == 'people-body' && (o.subgroups == 'person-gesture' || o.subgroups.includes('hand')) },
	kitchen: { name: 'kitchen', f: o => o.group == 'food-drink' && o.subgroups == 'dishware' },
	math: { name: 'math', f: o => o.group == 'symbols' && o.subgroups == 'math' },
	misc: { name: 'misc', f: o => o.group == 'symbols' && o.subgroups == 'other-symbol' },
	// gesture: { name: 'gesture', f: o => o.group == 'people-body' && o.subgroups == 'person-gesture' },
	// hand: { name: 'hand', f: o => o.group == 'people-body' && o.subgroups.includes('hand') },
	//o=>o.group == 'people-body' && o.subgroups.includes('role'),
	//objects:
	object: {
		name: 'object', f: o =>
			(o.group == 'food-drink' && o.subgroups == 'dishware')
			|| (o.group == 'travel-places' && o.subgroups == 'time')
			|| (o.group == 'activities' && o.subgroups == 'event')
			|| (o.group == 'activities' && o.subgroups == 'award-medal')
			|| (o.group == 'activities' && o.subgroups == 'arts-crafts')
			|| (o.group == 'activities' && o.subgroups == 'sport')
			|| (o.group == 'activities' && o.subgroups == 'game')
			|| (o.group == 'objects')
			|| (o.group == 'activities' && o.subgroups == 'event')
			|| (o.group == 'travel-places' && o.subgroups == 'sky-weather')
	},

	person: { name: 'person', f: o => o.group == 'people-body' && o.subgroups == 'person' },
	place: { name: 'place', f: o => startsWith(o.subgroups, 'place') },
	plant: { name: 'plant', f: o => startsWith(o.group, 'animal') && startsWith(o.subgroups, 'plant') },
	punctuation: { name: 'punctuation', f: o => o.group == 'symbols' && o.subgroups == 'punctuation' },
	role: { name: 'role', f: o => o.group == 'people-body' && o.subgroups == 'person-role' },
	shapes: { name: 'shapes', f: o => o.group == 'symbols' && o.subgroups == 'geometric' },
	sport: { name: 'sport', f: o => o.group == 'people-body' && o.subgroups == 'person-sport' },
	sports: { name: 'sports', f: o => (o.group == 'activities' && o.subgroups == 'sport') },
	sternzeichen: { name: 'sternzeichen', f: o => o.group == 'symbols' && o.subgroups == 'zodiac' },
	symbols: { name: 'symbols', f: o => o.group == 'symbols' },
	time: { name: 'time', f: o => (o.group == 'travel-places' && o.subgroups == 'time') },
	//toolbar buttons:
	toolbar: {
		name: 'toolbar', f: o => (o.group == 'symbols' && o.subgroups == 'warning')
			|| (o.group == 'symbols' && o.subgroups == 'arrow')
			|| (o.group == 'symbols' && o.subgroups == 'av-symbol')
			|| (o.group == 'symbols' && o.subgroups == 'other-symbol')
			|| (o.group == 'symbols' && o.subgroups == 'keycap')
	},

	transport: { name: 'transport', f: o => startsWith(o.subgroups, 'transport') && o.subgroups != 'transport-sign' },
	vegetable: { name: 'vegetable', f: o => o.group == 'food-drink' && o.subgroups == 'food-vegetable' },



};
//var emoGroupKeys; //ACHTUNG!!!! SPEECH wird nicht mehr gehen!!!!!!!!!

function isEmosetMember(name, info) { return emoSets[name].f(info); }
function makeEmoSetIndex() {
	if (isdef(symBySet)) return;

	symBySet = {}; symKeysBySet = {}; symListBySet = {};
	for (const k in emoSets) {
		let set = emoSets[k];
		let name = set.name;
		let f = set.f;
		symBySet[name] = [];
		for (const k1 in symbolDict) {
			let info = symbolDict[k1];
			if (info.type == 'icon') continue;
			let o = info;
			if (nundef(o.group) || nundef(o.subgroups)) continue;
			let passt = f(o);
			if (!passt) continue;
			if (passt) {
				//if (k=='role') console.log(k,k1);
				lookupSet(symBySet, [name, k1], info);
				lookupAddToList(symKeysBySet, [name], k1);
				lookupAddToList(symListBySet, [name], info);
			}
		}
	}
	makeGroupSub();
}
function makeGroupSub() {
	symKeysByGroupSub = {};
	for (const k of symKeysBySet['all']) {
		let info = symbolDict[k];
		if (isEmpty(info.E) || isEmpty(info.D)) lookupAddIfToList(symKeysByGroupSub, ['NA', info.group + '-' + info.subgroups], k);
		else lookupAddIfToList(symKeysByGroupSub, [info.group, info.subgroups], k);
	}
	//console.log(symKeysByGroupSub);
}


//#endregion

//#region ensure
function ensureAssets(set = true, type = true, hex = false, svg = false) {
	if (set) ensureSymBySet();
	if (type) ensureSymByType();
	if (hex) ensureSymByHex();
	if (svg) ensureSvgDict();
}
async function ensureAllAssets() { ensureAllAssets(true, true, true, true); }
function ensureSymBySet() { if (nundef(symBySet)) { makeEmoSetIndex(); } }
function ensureSymByType() {
	if (nundef(symByType)) {
		//console.log('doing it ONCE only!')
		symByType = { emo: {}, eduplo: {}, icon: {}, iduplo: {} };
		symKeysByType = { emo: [], eduplo: [], icon: [], iduplo: [] };
		symListByType = { emo: [], eduplo: [], icon: [], iduplo: [] };
		for (const k in symbolDict) {
			let info = symbolDict[k];
			if (info.type == 'emo' && info.isDuplicate) { symByType.eduplo[k] = info; symListByType.eduplo.push(info); symKeysByType.eduplo.push(k); }
			else if (info.type == 'icon' && info.isDuplicate) { symByType.iduplo[k] = info; symListByType.iduplo.push(info); symKeysByType.iduplo.push(k); }
			else if (info.type == 'emo') { symByType.emo[k] = info; symListByType.emo.push(info); symKeysByType.emo.push(k); }
			else if (info.type == 'icon') { symByType.icon[k] = info; symListByType.icon.push(info); symKeysByType.icon.push(k); }
		}
	}

}
function ensureSymByHex() {
	if (nundef(symByHex)) {
		//console.log('doing it ONCE only!')
		symByHex = {};
		symKeysByHex = [];
		for (const k in symbolDict) {
			let info = symbolDict[k];
			symByHex[info.hexcode] = info;
		}
		symKeysByHex = Object.keys(symByHex);
	}

}
async function ensureSvgDict() {
	if (nundef(svgDict)) {
		svgDictC = await vidCache.load('svgDict', route_svgDict, true, false);
		svgDict = vidCache.asDict('svgDict');
		svgKeys = Object.keys(svgDict);
		svgList = dict2list(svgDict);
	}
}
//#endregion

//symbolDict helpers
function saveSymbolDict() {
	//console.log(symbolDict_)
	let y = jsonToYaml(symbolDict);

	downloadTextFile(y, 'symbolDict', 'yaml');
}

//#region API: loadAssets, loadSpec_ (also merges), loadCode (also activates), loadInitialServerData
async function loadAssets() {

	vidCache = new LazyCache(!USE_LOCAL_STORAGE);
	testCardsC = await vidCache.load('testCards', async () => await route_rsg_asset('testCards', 'yaml'));
	testCards = vidCache.asDict('testCards');
	c52C = await vidCache.load('c52', route_c52);
	c52 = vidCache.asDict('c52');

	//einfach nur symbolDict laden als symbolDict
	symbolDictC = await vidCache.load('symbolDict', route_symbolDict);
	symbolDict = vidCache.asDict('symbolDict');
	symbolKeys = Object.keys(symbolDict);
	symbolList = dict2list(symbolDict);


}
async function loadGameInfo(useAllGamesStub = true) {
	if (useAllGamesStub) {
		allGames = {
			ttt: {
				name: 'TicTacToe',
				long_name: 'Tic-Tac-Toe',
				short_name: 'ttt',
				num_players: [2],
				player_names: ['Player1', 'Player2'],
			},
			s1: {
				name: 's1',
				long_name: 's1',
				short_name: 's1',
				num_players: [2, 3, 4, 5],
				player_names: ['Player1', 'Player2', 'Player3', 'Player4', 'Player5'],
			},
			starter: {
				name: 'Starter',
				long_name: 'Starter',
				short_name: 'starter',
				num_players: [2],
				player_names: ['Player1', 'Player2'],
			},
			catan: {
				name: 'Catan',
				long_name: 'The Settlers of Catan',
				short_name: 'catan',
				num_players: [3, 4],
				player_names: ['White', 'Red', 'Blue', 'Orange'],
			},
			aristocracy: {
				name: 'Aristocracy',
				long_name: 'Aristocracy',
				short_name: 'aristocracy',
				num_players: [2, 3, 4, 5],
				player_names: ['Player1', 'Player2', 'Player3', 'Player4', 'Player5'],
			}

		};

	} else {
		allGamesC = await vidCache.load('allGames', route_allGames);
		allGames = vidCache.asDict('allGames');
	}

	////console.log('allGames', GAME, allGames[GAME]);
	playerConfig = stubPlayerConfig(allGames); //stub to get player info
	// //console.log('playerConfig', playerConfig[GAME]);
	// //console.log('testCards', testCards['green2']);
	// //console.log('c52', c52['card_2C']);
	// //console.log('icons', iconChars.crow);
	// //console.log('allGames', allGames.catan);
	// //console.log(vidCache);
}
async function loadSpec(path) {
	if (TESTING) {

		let url = DSPEC_PATH + '.yaml';
		defaultSpecC = await vidCache.load('defaultSpec', async () => await route_path_yaml_dict(url), true, false);// last 2 params: reload, useLocal

		url = (isdef(path) ? path : SPEC_PATH) + '.yaml';
		if (USE_NON_TESTING_DATA) url = '/games/' + GAME + '/_rsg/' + GAME + VERSION + '.yaml';
		userSpecC = await vidCache.load('userSpec', async () => await route_test_userSpec(url), true, false);// last 2 params: reload, useLocal

	} else {

		url = DSPEC_PATH + '.yaml';
		//url = TEST_PATH + 'defaultSpec' + DSPEC_VERSION + '.yaml'; //always the same default spec!
		defaultSpecC = await vidCache.load('defaultSpec', async () => await route_path_yaml_dict(url), !CACHE_DEFAULTSPEC, CACHE_DEFAULTSPEC);// last 2 params: reload, useLocal

		userSpecC = await vidCache.load('userSpec', async () => await route_userSpec(GAME, GAME + VERSION), !CACHE_USERSPEC, CACHE_USERSPEC);// last 2 params: reload, useLocal

	}

	defaultSpec = vidCache.asDict('defaultSpec');
	userSpec = vidCache.asDict('userSpec');

	//merge default and userSpec
	SPEC = deepmerge(defaultSpec, userSpec);//, { arrayMerge: overwriteMerge });
	DEFS = SPEC.defaults;
	delete SPEC.defaults;

	//need to correct areas because it should NOT be merged!!!
	if (userSpec.layout_alias) { SPEC.areas = userSpec.layout_alias; }
	if (userSpec.areas) { SPEC.areas = userSpec.areas; }
	delete SPEC.layout_alias;
	delete SPEC.asText;

}
async function loadCode() {
	// let url = TEST_PATH + GAME + '/code' + CODE_VERSION + '.js';
	if (TESTING && !CODE_VERSION) return;

	let url = TESTING && !USE_NON_TESTING_DATA ? TEST_PATH + GAME + '/code' + CODE_VERSION + '.js'
		: '/games/' + GAME + '/_rsg/' + GAME + VERSION + '.js';

	let loader = new ScriptLoader();
	await loader.load(SERVER + url);

	if (TESTING) userCodeC = await vidCache.load('userCode', async () => await route_path_asText_dict(url), true, false);// last 2 params: reload, useLocal
	else userCodeC = await vidCache.load('userCode', async () => await route_userCode(GAME, GAME + VERSION), !CACHE_CODE, CACHE_CODE); // last 2 params: reload, useLocal

	userCode = vidCache.asDict('userCode');

	// document.getElementById('code').innerHTML = '<pre>"' + userCode.asText + '"</pre>'; //PERFECT!!!!!!!!!!
	let d = mBy('OLDCODE');
	if (d && SHOW_CODE) { d.innerHTML = '<pre>' + userCode.asText + '</pre>'; }
	//else //console.log('OLDCODE',userCode.asText);

	//testingHallo('hallo das geht wirklich!!!!!');
}
async function loadTestServerData(url) {
	let initial = 'testServerData';
	serverDataC = initialDataC[GAME] = await vidCache.load(initial, async () => await route_path_yaml_dict(url), true, false); // last 2 params: reload, useLocal
	serverData = vidCache.asDict(initial);
	return serverData;
}
async function loadInitialServerData(unameStarts) {
	let initialPath = GAME + (USE_MAX_PLAYER_NUM ? '_max' : '');

	_syncUsernameOfSender(unameStarts);

	if (TESTING) {
		let url = SERVERDATA_PATH + '.yaml'; //console.log('loading',url)
		serverDataC = initialDataC[GAME] = await vidCache.load('_initial_' + initialPath, async () => await route_path_yaml_dict(url), true, false); // last 2 params: reload, useLocal
	} else {
		serverDataC = initialDataC[GAME] = await vidCache.load('_initial_' + initialPath, async () => await route_initGame(GAME, playerConfig[GAME], Username), !CACHE_INITDATA, CACHE_INITDATA); // last 2 params: reload, useLocal 
	}

	serverData = vidCache.asDict('_initial_' + initialPath);
	return serverData;
}
async function sendStatus(username) {
	_syncUsernameOfSender(username);
	if (!TESTING) serverData = await route_status(Username);
}
async function sendRestart(username) {
	_syncUsernameOfSender(username);
	if (TESTING) serverData = await loadInitialServerData(Username);
	else serverData = await route_begin_status(Username);
}
async function sendAction(boat, username) {
	if (TESTING) {
		modifyServerDataRandom(username);
	} else {
		_syncUsernameOfSender(username);
		if (nundef(boat)) boat = chooseRandom(boats);
		let route = '/action/' + Username + '/' + serverData.key + '/' + boat.desc + '/';
		let t = boat.tuple;
		//console.log('tuple is:', t);
		route += t.map(x => _pickStringForAction(x)).join('+');// /action/felix/91b7584a2265b1f5/loc-settlement/96
		//console.log('sending action...', route);
		let result = await route_server_js(route);
		//console.log('server returned', result);
		prevServerData = serverData;
		serverData = result;
	}
}
async function loadBestKeys() {

	BestKeySets = await loadYamlDict('/assets/speech/keysets.yaml');
	BestKeysD = await loadYamlDict('/assets/speech/bestKeysD.yaml');
	BestKeysE = await loadYamlDict('/assets/speech/bestKeysE.yaml');

	for (const e of BestKeysD) {
		let info = symbolDict[e.k];
		info.bestD = e.r;
		info.bestDConf = e.c;
	}
	for (const e of BestKeysE) {
		let info = symbolDict[e.k];
		info.bestE = e.r;
		info.bestEConf = e.c;
	}
	// console.log(BestKeySets.best100);
	for (const setname in BestKeySets) {
		for (const k of BestKeySets[setname]) {
			let info = symbolDict[k];
			if (nundef(info.bestE)) info.bestE = lastOfLanguage(k, 'E');
			if (nundef(info.bestD)) info.bestD = lastOfLanguage(k, 'D');
			//console.log(info)
			info[setname] = { E: info.bestE, D: info.bestD };
		}
	}
	// for(const k of BestKeySets.best50){
	// 	let info = symbolDict[k];
	// 	console.log(info)
	// 	info.best50E=lastOfLanguage(k,'E');
	// }
}
async function loadCorrectWords() {
	CorrectKeysByLanguage = { E: [], EB: [], D: [] };
	CorrectByKey = {};
	//assume zira


	let speechZira = await loadYamlDict('/assets/speech/speechZira.yaml');
	for (const k in speechZira) {
		let e = lookup(speechZira, [k, 'E', 'zira']);
		if (e && e.correct) {
			let c = Math.round(e.conf * 100);
			lookupSet(CorrectByKey, [k, 'E'], { r: e.req, c: c });
			addIf(CorrectKeysByLanguage.E, k);
		}
	}
	let speechBritish = await loadYamlDict('/assets/speech/speechBritish.yaml');
	for (const k in speechBritish) {
		let e = lookup(speechBritish, [k, 'E', 'ukMale']);
		if (e && e.correct) {
			let c = Math.round(e.conf * 100);
			lookupSet(CorrectByKey, [k, 'EB'], { r: e.req, c: c });
			addIf(CorrectKeysByLanguage.EB, k);
		}
	}
	let speechDeutsch = await loadYamlDict('/assets/speech/speechDeutsch.yaml');
	for (const k in speechDeutsch) {
		let e = lookup(speechDeutsch, [k, 'D', 'deutsch']);
		if (e && e.correct) {
			let c = Math.round(e.conf * 100);
			lookupSet(CorrectByKey, [k, 'D'], { r: e.req, c: c });
			addIf(CorrectKeysByLanguage.D, k);
		}
	}

	//console.log(Object.keys(speechZira),Object.keys(speechDeutsch));
	//console.log(CorrectByKey, CorrectKeysByLanguage.E);
}
async function loadCorrectWords_dep() {
	CorrectWords = await loadYamlDict('/assets/correctWordsX.yaml');

	CorrectWordsCorrect = { E: {}, D: {} };
	CorrectWordsExact = { E: {}, D: {} };
	CorrectWordsFailed = { E: {}, D: {} };

	//remove duplicates from array
	if (isdef(CorrectWords) && isdef(CorrectWords.data)) {
		for (const cwentry of CorrectWords.data) {
			let key = cwentry.key;
			for (const lang of ['E', 'D']) {
				let cw = cwentry[lang];
				// console.log(cw);
				if (cw.isCorrect) {
					if (cw.answer == cw.req && !(cw.danger == true)) CorrectWordsExact[lang][key] = cw;
					else CorrectWordsCorrect[lang][key] = cw;
				} else CorrectWordsFailed[lang][key] = cw;
			}
		}
	}


	//console.log('CorrectWordsExact',CorrectWordsExact);
	//console.log('CorrectWordsCorrect',CorrectWordsCorrect);
	//console.log('CorrectWordsFailed',CorrectWordsFailed);

}
async function loadYamlDict(url) { return await route_path_yaml_dict(url); }
async function loadJsonDict(url) { return await route_path_json_dict(url); }
// serverData helpers
//ACHTUNG!!! die player obj_types sind variable!!!
function preProcessData(data) {
	//console.log('preprocess:',data.players, 'plidSentStatus',plidSentStatus);
	if (nundef(data)) data = serverData;
	for (const plid in data.players) {
		let pl = data.players[plid];
		if (isdef(pl.obj_type)) continue; //**** ACHTUNG!!!!!!!!! */
		pl.obj_type = plid == plidSentStatus ? 'GamePlayer' : 'opponent';
	}
	if (data.options) {
		tupleGroups = getTupleGroups();
		let iGroup = 0;
		let iTuple = 0;
		boats = [];
		for (const tg of tupleGroups) {
			for (const t of tg.tuples) {
				let boatInfo = { obj_type: 'boat', oids: [], desc: tg.desc, tuple: t, iGroup: iGroup, iTuple: iTuple, text: t.map(x => x.val), weg: false };
				boats[iTuple] = boatInfo;
				iTuple += 1;
			}
			iGroup += 1;
		}
	} else {
		tupleGroups = null;
		boats = [];
	}
}
function modifyServerDataRandom(username) {
	//this should ONLY modify serverData
	_syncUsernameOfSender(username);
	prevServerData = jsCopy(serverData);

	let ranks = ['2', '3', '4', 'Q', 'J', 'T', 'A', '9'];

	let dModify = serverData.table ? serverData.table : serverData;
	//console.log('dModify', dModify)
	let keys = Object.keys(dModify);
	//console.log('keys', keys);
	let nChange = randomNumber(1, keys.length);
	shuffle(keys);
	console.log('>>>change', nChange, 'items!')

	for (let i = 0; i < nChange; i++) {
		let id = keys[i];
		let val = dModify[id];
		if (isLiteral(val)) dModify[id] = { id: id, value: val };
		// console.log('change rank of id', id);
		dModify[id].rank = chooseRandom(ranks);
		// console.log(dModify[id])
	}

}
function showServerData(data, domid = 'SERVERDATA') {
	let d = mBy(domid);
	if (d && SHOW_SERVERDATA) { d.innerHTML = '<pre>' + jsonToYaml(data) + '</pre>'; }
	//else consOutput('serverData',data);
}
function showPackages(data, domid = 'OLDCODE') {
	let d = mBy(domid);
	if (d) { d.innerHTML = '<pre>' + jsonToYaml(data) + '</pre>'; }
	//else consOutput('serverData',data);
}

//#region _internal
// serverData / server helpers
function _syncUsernameOfSender(username) {
	if (nundef(username)) username = Username; else Username = username;
	plidSentStatus = getPlidForUsername(username);
	//console.log('------------------', username, Username, plidSentStatus);

}


// playerConfig (stub)
function setGamePlayer(username) {
	Username = username;
	GAMEPLID = firstCondDict(playerConfig[GAME].players, p => p.username == username);

}
function stubPlayerConfig(gameInfo) {
	//automatically set a player configuration when starting in game view
	gcs = {};
	for (const gName in gameInfo) {
		let info = gameInfo[gName]
		////console.log(gName, info);
		let nPlayers = info.num_players[0]; // min player number, info.num_players.length - 1]; // max player number
		if (USE_MAX_PLAYER_NUM) nPlayers = info.num_players[info.num_players.length - 1]; // max player number
		let pls = {};
		for (let i = 0; i < nPlayers; i++) {
			let id = info.player_names[i];
			pls[id] = { id: id, playerType: 'me', agentType: null, username: Username + (i > 0 ? i : ''), index: i };
			////console.log('player:', pl)
			// pls.push(pl);
		}
		gcs[gName] = { numPlayers: nPlayers, players: pls };

	}
	return gcs;
	////console.log('-------------------',gcs);
}
function updatePlayerConfig() {
	let keysPlayerColors = Object.keys(PLAYER_COLORS);
	//let players = playerConfig[GAME].players;

	//match colors to better colors!
	let iColor = 0;
	for (const id in serverData.players) {
		let pl = serverData.players[id];
		let colorName = isdef(pl.color) ? pl.color : keysPlayerColors[iColor];
		colorName = colorName.toLowerCase();
		let altName = capitalize(colorName);
		let color = isdef(PLAYER_COLORS[colorName]) ? PLAYER_COLORS[colorName] : colorName;


		playerConfig[GAME].players[id].color = color;
		//playerConfig[id].color = color;
		// playerConfig[id].altName = altName;
		// playerConfig[id].index = i;
		iColor += 1;
	}
}

// routes
async function route_allGames() {
	let gameNames = await route_server_js('/game/available');
	//console.log('gamenames returned:', gameNames)
	let res = {};
	for (const name of gameNames) {
		//console.log(name);
		if (USE_ALL_GAMES_ROUTE) {
			res[name] = await route_server_js('/game/info/' + name);
		} else {
			let url = '/games/' + name + '/info.yaml';
			res[name] = await route_path_yaml_dict(url);// last 2 params: reload, useLocal
			//console.log('game info', name, res[name]);
		}
	}
	return res;
}
async function route_c52() {
	return await route_rsg_asset('c52_blackBorder', 'yaml');
}
async function route_symbolDict(filename = 'symbolDict') {
	//console.log('fetch symbolDict!!!')
	let url = '/assets/' + filename + '.yaml';
	let response = await route_path_yaml_dict(url); //TODO: depending on ext, treat other assts as well!
	return response;

}
async function route_svgDict(filename = 'svgDict') {
	let url = '/assets/' + filename + '.yaml';
	let response = await route_path_yaml_dict(url); //TODO: depending on ext, treat other assts as well!
	return response;

}
async function route_userSpec(game, fname) {
	try {
		let url = '/spec/' + game + (isdef(fname) ? '/' + fname : '');
		//let url = '/spec/' + GAME + (isdef(fname) ? '/' + fname : '');
		let text = await route_server_text(url);
		let spec = jsyaml.load(text);
		spec.asText = text;
		return spec;
	} catch (error) {
		return { asText: '' }; //empty spec!
	}
}
async function route_test_userSpec(url) {
	try {
		let text = await route_path_text(url);
		let spec = jsyaml.load(text);
		spec.asText = text;
		return spec;
	} catch (error) {
		return { asText: '' }; //empty spec!
	}
}
async function route_userCode(game, fname) {
	try {
		//let codePath = '/games/' + game + '/_rsg/' + fname + '.js';
		let url = '/RSG/' + game + (isdef(fname) ? '/' + fname : '');
		let text = await route_server_text(url);

		return { asText: text };
	} catch (error) { return {}; }

}
async function route_initGame(game, gc, username, seed = SEED) {
	await fetch_wrapper(SERVER + '/restart');
	await fetch_wrapper(SERVER + '/game/select/' + game);
	let nPlayers = gc.numPlayers;
	////console.log(gc)
	// for (let i = 0; i < nPlayers; i++) {
	for (plid in gc.players) {
		let plInfo = gc.players[plid];
		let isAI = plInfo.agentType !== null;
		if (isAI) {
			await postData(SERVER + '/add/client/agent/' + plInfo.username, { agent_type: plInfo.agentType, timeout: null });
		}
		await fetch_wrapper(SERVER + '/add/player/' + plInfo.username + '/' + plInfo);
	}
	return await route_begin_status(username, seed);
}
async function route_begin_status(username, seed = SEED) {
	await fetch_wrapper(SERVER + '/begin/' + seed);
	let data = await route_status(username);
	////console.log(data)
	return data;
}
async function route_status(username) { return await route_server_js('/status/' + username); }
async function route_rsg_asset(filename, ext = 'yml') {
	let url = '/assets/' + filename + '.' + ext;
	let response = await route_path_yaml_dict(url); //TODO: depending on ext, treat other assts as well!
	return response;
}
async function route_rsg_raw_asset(filename, ext = 'yml') {
	let url = '/assets/raw/' + filename + '.' + ext;
	let response = await route_path_yaml_dict(url); //TODO: depending on ext, treat other assts as well!
	return response;
}
async function route_server_js(url) {
	let data = await fetch_wrapper(SERVER + url);
	return await data.json();
}
async function route_server_text(url) {
	////console.log(url, SERVER + url)
	let data = await fetch_wrapper(SERVER + url);
	let text = await data.text();
	return text;
}
async function route_path_yaml_dict(url) {
	let data = await fetch_wrapper(url);
	let text = await data.text();
	let dict = jsyaml.load(text);
	return dict;
}
async function route_path_json_dict(url) {
	let data = await fetch_wrapper(url);
	let json = await data.json();
	//let dict = jsyaml.load(text);
	return json;
}
async function route_path_text(url) {
	let data = await fetch_wrapper(url);
	return await data.text();
}
async function route_path_asText_dict(url) {
	let data = await fetch_wrapper(url);
	let res = {};
	res.asText = await data.text();
	////console.log(res.asText)
	//res.asDict = JSON.parse(res.asText);//
	return res; // await data.text();
}
async function postData(url = '', data = {}) {
	//usage: postData('https://example.com/answer', { answer: 42 })

	// Default options are marked with *
	const response = await fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json'
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *client
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
	return await response.json(); // parses JSON response into native JavaScript objects
}
async function route_server(url) { await fetch_wrapper(SERVER + url); }

var route_counter = 0;
async function fetch_wrapper_NO(url) {
	route_counter += 1;
	if (SHOW_SERVER_ROUTE) consOutput(route_counter + ': route:' + url);
	let res = await fetch(url).then((response) => {
		if (response.status === 200) {
			if (SHOW_SERVER_RETURN) consOutput(route_counter + ': return:', response);
			//return response;
			// return response.json();
		} else {
			throw new Error('Something went wrong');
			//return "ERROR";
		}
	}).catch((error) => {
		console.log(error)
	});
	return res;
	// .then((responseJson) => {
	// 	// Do something with the response
	// })
	// .catch((error) => {
	// 	console.log(error)
	// });
}
async function fetch_wrapper(url) {
	route_counter += 1;
	if (SHOW_SERVER_ROUTE) consOutput(route_counter + ': route:' + url);
	let res = await fetch(url);
	if (SHOW_SERVER_RETURN) consOutput(route_counter + ': return:', res);
	return res;
	// try {
	// 	let res = await fetch(url);
	// 	if (SHOW_SERVER_RETURN) consOutput(route_counter + ': return:', res);
	// 	return res;

	// } catch (err) {
	// 	console.log('FETCH ERROR:', err)
	// 	return {};
	// }
}

// caches & consts: playerColors, THEMES, iTHEME
var allGamesC = null;
var playerConfigC = null;
var iconCharsC = null;
var symbolDictC = null;
var svgDictC = null;
var emoCharsC = null;
var c52C = null;
var testCardsC = null
var defaultSpecC = null;
var userSpecC = null;
var userCodeC = null;
var initialDataC = {}; //mostly for testing
var serverDataC = null;

const playerColors = {
	red: '#D01013',
	blue: '#003399',
	green: '#58A813',
	orange: '#FF6600',
	yellow: '#FAD302',
	violet: '#55038C',
	pink: '#ED527A',
	beige: '#D99559',
	sky: '#049DD9',
	brown: '#A65F46',
	white: '#FFFFFF',
};
const THEMES = ['#c9af98', '#2F4F4F', '#6B7A8F', '#00303F', 'rgb(3, 74, 166)', '#458766', '#7A9D96'];
var iTHEME = 0;

// tupleGroups
function getTupleGroups() {
	let act = serverData.options;

	//console.log('options', act)
	// json_str = JSON.stringify(act);
	// saveFile("yourfilename.json", "data:application/json", new Blob([json_str], { type: "" }));

	let tupleGroups = [];
	for (const desc in act) {
		let tg = { desc: desc, tuples: [] };
		//let tuples = expand99(act[desc].actions);
		let tuples = expand1_99(act[desc].actions);
		////console.log('*** ', desc, '........tuples:', tuples);

		if (tuples.length == 1 && !isList(tuples[0])) tuples = [tuples];
		////console.log(tuples)
		tg.tuples = tuples;
		tupleGroups.push({ desc: desc, tuples: tuples });
	}
	////console.log('tupleGroups', tupleGroups);
	return tupleGroups;
}
function expand1_99(x) {
	////console.log('expand1_99 input', tsRec(x))
	////console.log('expand1_99');
	if (isList(x)) {
		//console.log('expand1_99: x should be dict BUT is a list', x);
	}
	if (isDict(x)) { // TODO:  || isList(x)) {
		// if (isList(x)) {
		// 	//console.log('process: list',x)
		// }
		if ('_set' in x) {
			////console.log('handleSet wird aufgerufen')
			return handleSet(x._set);
		} else if ('_tuple' in x) {
			////console.log('handleTuple wird aufgerufen')
			return handleTuple(x._tuple);
		} else if ('type' in x) {
			return handleAction(x);
		} else { error('IMPOSSIBLE OBJECT', x); return null; }
	} else { error('IMPOSSIBLE TYPE', x); return null; }
}
function handleSet(x) {
	let irgend = x.map(expand1_99);
	let res = stripSet(irgend);
	return res;
}
function handleTuple(x) {
	let irgend = x.map(expand1_99);
	return multiCartesi(...irgend);
}
function handleAction(x) {
	return [[x]];
}
function isActionElement(x) {
	return typeof x == 'object' && 'type' in x;
}
function isListOfListOfActions(x) {
	return isList(x) && x.length > 0 && isList(x[0]) && x[0].length > 0 && isActionElement(x[0][0]);
}
function cartesi(l1, l2) {
	//l1,l2 are lists of list
	let res = [];
	for (var el1 of l1) {
		for (var el2 of l2) {
			res.push(el1.concat(el2));
		}
	}
	return res;
}
function multiCartesi() {
	//each arg is a list of list
	let arr = Array.from(arguments);
	if (arr.length > 2) {
		return cartesi(arr[0], stripSet(multiCartesi(...arr.slice(1))));
	} else if (arr.length == 2) return cartesi(arr[0], arr[1]);
	else if (arr.length == 1) return arr[0];
	else return [];
}
function stripSet(x) {
	if (isListOfListOfActions(x)) return x;
	else if (isActionElement(x)) return [[x]];
	else if (isList(x) && isActionElement(x[0])) return [x];
	else return [].concat(...x.map(stripSet));
	//return isList(x)&&x.length>0?stripSet(x[0]):x;
}

//preProcessServerData


// helpers
function getUsernameForPlid(id) { return playerConfig[GAME].players[id].username; }
function getPlidForUsername(username) {
	let pl = firstCondDict(playerConfig[GAME].players, x => x.username == username);
	// //console.log(getFunctionCallerName(),pl)
	return pl;
}
function _getTestPathForPlayerNum() { return GAME + (USE_MAX_PLAYER_NUM ? '_max' : ''); }
function _pickStringForAction(x) {
	//x is a tuple element, eg., {type:'fixed', val:'pass'} or {ID: "0", val: "hex[0]", type: "obj"}
	//console.log('pickStringForAction',x)
	if (x.type == 'fixed') return x.val;
	if (x.type == 'obj') return x.ID;
	if (x.type == 'player') return x.val;
}


//#endregion





//#endregion


//#region assetHelpers
//#region january 2021
function getColorDictColor(c) { return isdef(ColorDict[c]) ? ColorDict[c].c : c; }
function idealFontsizeX(elem, wmax, hmax, fz, fzmin) {
	let tStyles = { w: wmax, fz: fz, family: 'arial' };
	let i=0;
	while (i<100) {
		i+=1;
		//console.log('trying fz', tStyles);
		mStyleX(elem,tStyles);
		let tSize = getElemSize(elem);
		if (tSize.h <= hmax || tStyles.fz <= fzmin) { 
			//console.log(elem)
			return { w: tSize.w, h: tSize.h, fz: tStyles.fz };
		}	else tStyles.fz -= 1;
	}

}
function idealFontsize(txt, wmax, hmax, fz, fzmin, weight) {
	let tStyles = { fz: fz, family: 'arial' };
	if (isdef(weight)) tStyles.weight=weight;
	while (true) {
		//console.log('trying fz', tStyles, txt);
		let tSize = getSizeWithStyles(txt, tStyles);

		//console.log('text size of',txt, 'mit font', tStyles.fz, tSize)

		//if (tStyles.fz <= fzmin && tSize.h > hmax) return { w: tSize.w, h: tSize.h, fz: tStyles.fz };
		if (tSize.h <= hmax && tSize.w <= wmax || tStyles.fz <= fzmin) return { w: tSize.w, h: tSize.h, fz: tStyles.fz, family: 'arial' };
		else tStyles.fz -= 1;
	}

}

//#region november 2020: deprecated
function maLayout(pics, dParent) {
	mClass(dParent, 'flexWrap');
	let numPics = pics.length;
	let rows = Math.sqrt(numPics);
	rows = Math.floor(rows);
	let cols = Math.ceil(numPics / rows);
	let [pictureSize, picsPerLine] = calcDimsAndSize(cols, rows);
	clearElement(dParent);

	let i = 0;
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			maResizePic(pics[i], dParent, pictureSize)
			i += 1;
			if (i >= pics.length) return;
		}
		mLinebreak(dParent);
	}
}
function maResizePic(p, dParent, pictureSize) {

	let d = p.div;

	mAppend(dParent, d);
	let oldSize = p.sz;
	if (oldSize >= 200) return;

	let x = pictureSize / oldSize;
	if (Math.abs(x - 1) <= .1) return;

	// console.log('old size',oldSize,'new size',pictureSize,'x',x);

	let dpic = d.children[0];
	let bpic = getBounds(dpic);
	let wPicOld = bpic.width;
	let wPicNew = bpic.width * x;
	let hPicOld = bpic.height;
	let hPicNew = bpic.height * x;

	console.log('pic will be resized from', wPicOld, hPicOld, 'to', wPicNew, hPicNew)
	console.log('info.hOrig', p.info.hOrig)
	console.log('info', p.info)

	mSize(d, pictureSize, pictureSize);

	let dsym = dpic.children[0];
	//let bsym = getBounds(dsym);
	let fzPicOld = firstNumber(dsym.style.fontSize);
	let fzPicNew = fzPicOld * x;

	let hNew = fzPicNew * p.info.h[0] / 100;

	console.log('new h should be', hNew, 'but is', hPicNew)

	//old font = fzPicOld ... hOrig
	// new font = fzPicNew
	// new h should be info.h[0]


	mStyleX(dpic, { w: wPicNew, h: hNew });


	// console.log('resizing font of symbol from',fzPicOld,'to',fzPicNew);

	mStyleX(dsym, { fz: fzPicNew });

	let dtext = d.children[1];
	//let bsym = getBounds(dsym);
	let fzTextOld = firstNumber(dtext.style.fontSize);
	let fzTextNew = Math.round(fzTextOld * x);
	mStyleX(dtext, { fz: fzTextNew, w: 'auto', h: 'auto' });

	//console.log('resizing font of text from',fzTextOld,'to',fzTextNew);

	d.style.padding = '0px';

	p.sz = pictureSize;

	let htext = p.isLabelVisible ? getBounds(dtext).height : 0;
	let hpic = getBounds(dpic).height;
	//console.log(htext,hpic,getBounds(dsym).height)
	d.style.paddingTop = '' + ((pictureSize - (htext + hpic)) / 2) + 'px';

	//adjust font for ordinal, row, col info!
	for (let i = 2; i < d.children.length; i++) {
		let dOrdinal = d.children[i];
		//console.log(dOrdinal)
		let fzOld = firstNumber(dOrdinal.style.fontSize);
		let fzNew = fzOld * x;
		let leftOld = firstNumber(dOrdinal.style.left);
		let leftNew = Math.floor(leftOld * x);
		let topOld = firstNumber(dOrdinal.style.top);
		let topNew = Math.floor(topOld * x);
		mStyleX(dOrdinal, { fz: fzNew, left: leftNew, top: topNew });
	}

}
function maShowPictures(keys, labels, dParent, onClickPictureHandler,
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
function maPicLabelButtonFitText(info, label, { w, h, bgPic, textShadowColor, contrast, sPic = {} }, handler, dParent, styles, classes = 'picButton', isText, isOmoji, focusElement) {
	//console.log('sPic', sPic)
	let picLabelStyles = getHarmoniousStylesPlusPlus(styles, sPic, {}, w, h, 65, 0, 'arial', bgPic, 'transparent', null, null, true);

	let x = maPicLabelFitX(info, label.toUpperCase(), { wmax: w, textShadowColor: textShadowColor, contrast: contrast }, dParent, picLabelStyles[0], picLabelStyles[1], picLabelStyles[2], isText, isOmoji);
	x.id = 'd' + info.key;
	if (isdef(handler)) x.onclick = handler;
	x.style.cursor = 'pointer';
	x.lastChild.style.cursor = 'pointer';
	x.style.userSelect = 'none';
	mClass(x, classes);
	return x;
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
function maPicLabelFitX(info, label, { wmax, hmax, textShadowColor, contrast = .35 }, dParent, containerStyles, picStyles, textStyles, isText = true, isOmoji = false) {
	let d = mDiv(dParent);
	//console.log('picStyles',picStyles);

	if (isdef(textShadowColor)) {

		//console.log('contrast',contrast,'textShadowColor',textShadowColor)
		//console.log('===>textShadowColor',textShadowColor,'contrast',contrast);
		//console.log(picStyles);
		let sShade = '0 0 0 ' + textShadowColor; //green';
		picStyles['text-shadow'] = sShade;// +', '+sShade+', '+sShade;
		picStyles.fg = anyColorToStandardString('black', contrast); //'#00000080' '#00000030' 
	}

	//console.log(picStyles)
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

//#=========endregion 

function addRowColInfo(dPic, row, col, szPic) {
	let szi = Math.max(Math.floor(szPic / 12), 8);
	console.log(szi);
	dPic.style.position = 'relative';
	let d2 = mText('row:' + row, dPic, { fz: szi, color: 'black', position: 'absolute', left: szi, top: szi / 2 })
	let d3 = mText('col:' + col, dPic, { fz: szi, color: 'black', position: 'absolute', left: szi, top: (szi / 2 + szi + 2) })
}
function addRepeatInfo(dPic, iRepeat, szPic) {
	//console.log(dPic,iRepeat,szPic)
	let szi = Math.max(Math.floor(szPic / 8), 8);
	//console.log(szi);
	dPic.style.position = 'relative';
	let d2 = mText('' + iRepeat, dPic, { fz: szi, weight: 'bold', fg: 'contrast', position: 'absolute', left: szi / 2, top: szi / 2 - 2 });
	// let d3 = mText('col:' + col, dPic, { fz: szi, color: 'black', position: 'absolute', left: szi, top: (szi / 2 + szi + 2) })
	return d2;
}
function calcDimsAndSize(cols, lines, dParent, wmax, hmax) {

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
	let sz, picsPerLine;
	if (lines > 1) {
		let hpic = wh * hpercent / lines;
		let wpic = ww * wpercent / cols;
		sz = Math.min(hpic, wpic);
		//console.log('sz', sz)
		picsPerLine = cols; //keys.length;
	} else {
		let dims = calcRowsColsX(cols);
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

	let dOuter = isdef(dParent) ? mDiv(dParent) : mDiv();
	let d = mDiv(dOuter);
	d.innerHTML = info.text;

	let wdes, hdes, fzdes, wreal, hreal, fzreal, f;

	//console.log(info);
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
	outerStyles.w = wreal;
	outerStyles.h = hreal;
	//console.log(outerStyles)
	mStyleX(dOuter, outerStyles);

	return dOuter;

}
function maPicLabelShowHideHandler(ev) {
	let id = evToClosestId(ev);
	let info = symbolDict[id.substring(1)];
	if (isLabelVisible(id)) maHideLabel(id, info); else maShowLabel(id, info);
	if (isdef(mBy('dummy'))) mBy('dummy').focus();

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
var badges = [];
function removeBadges(dParent, level) {
	while (badges.length > level) {
		let badge = badges.pop()
		removeElem(badge.div);
	}
}
function addBadge(dParent, level, clickHandler, animateRubberband = false) {
	let fg = '#00000080';
	let textColor = 'white';
	let stylesForLabelButton = { rounding: 8, margin: 4 };
	//const picStyles = ['twitterText', 'twitterImage', 'openMojiText', 'openMojiImage', 'segoe', 'openMojiBlackText', 'segoeBlack'];
	let isText = true; let isOmoji = false;
	let i = level - 1;
	let key = levelKeys[i];
	let k = replaceAll(key, ' ', '-');
	let info = symbolDict[k];
	let label = "level " + i;
	let h = window.innerHeight; let hBadge = h / 14;
	let d1 = mpBadge(info, label, { w: hBadge, h: hBadge, bg: levelColors[i], fgPic: fg, fgText: textColor }, null, dParent, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
	d1.id = 'dBadge_' + i;
	if (animateRubberband) mClass(d1, 'aniRubberBand');
	if (isdef(clickHandler)) d1.onclick = clickHandler;
	badges.push({ key: info.key, info: info, div: d1, id: d1.id, index: i });
	return arrLast(badges);
}
function showBadges(dParent, level, clickHandler) {
	clearElement(dParent); badges = [];
	for (let i = 1; i <= level; i++) {
		addBadge(dParent, i, clickHandler);
	}
	//console.log(badges)
}
function showBadgesX(dParent, level, clickHandler, maxLevel) {
	clearElement(dParent);
	badges = [];
	for (let i = 1; i <= maxLevel + 1; i++) {
		if (i > level) {
			let b = addBadge(dParent, i, clickHandler, false);
			b.div.style.opacity = .25;
			b.achieved = false;
		} else {
			let b = addBadge(dParent, i, clickHandler, true);
			b.achieved = true;
		}
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
	let picLabelStyles = getBadgeStyles(styles, {}, {}, w, h, 60, 2, 4, 'arial', bg, 'transparent', fgPic, fgText, true);
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
	fzText=fact*(100-picPercent-pabot-patop)*h*3/400;

	// console.log(patop, szPic, zwischen, szText, pabot);
	let styles = { h: h, bg: bg, fg: isdef(fgText) ? fgText : 'contrast', patop: patop, pabottom: pabot, align: 'center', 'box-sizing': 'border-box' };
	let textStyles = { family: family, fz: fzText }; //Math.floor(szText * 3 / 4) };
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
function groupSizes() {
	ensureSymBySet();
	for (const gname in symKeysBySet) {
		console.log('group', gname + ': ' + symKeysBySet[gname].length);
	}
}

function getKeySetX(categories, language, minlength, maxlength, bestOnly = false, sortAccessor = null, correctOnly = false, reqOnly = false) {
	let keys = setCategories(categories);
	//console.log(keys);//ok
	//console.log(CorrectWordsCorrect)
	if (isdef(minlength && isdef(maxlength))) {
		keys = keys.filter(k => {

			let ws = bestOnly ? [lastOfLanguage(k, language)] : wordsOfLanguage(k, language);
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

	if (isdef(sortAccessor)) sortByFunc(keys, sortAccessor); //keys.sort((a,b)=>fGetter(a)<fGetter(b));
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
	//console.log('___________', ptop, pbottom)
	let p = (isdef(ptop) && isdef(pbottom)) ? Math.min(ptop, pbottom) :
		isdef(ptop) ? ptop : isdef(pbottom) ? pbottom / 2 : 0;
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
	innerStyles.h = hreal + 2 * padh;
	mStyleX(dPic, innerStyles);

	let outerStyles = {};

	info.paddingOrig = d.style.padding;
	info.paddingTopOrig = d.style.paddingTop;
	info.paddingBottomOrig = d.style.paddingBottom;
	// outerStyles.padding = '' + padh + 'px ' + padw + 'px';
	outerStyles.padding = '' + 2 * padh + 'px ' + padw + 'px' + '0' + 'px ' + padw + 'px';
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










//#endregion


function initTable() {
	let table = mBy('table');
	clearElement(table);

	//initLineNavi();
	initLineTop();
	initLineTitle();
	initLineTable();
	initLineBottom();

	dTable = dLineTableMiddle;
	dTitle = dLineTitleMiddle;
	//console.log(dTable,dTitle)
}
function initSidebar() {
	let dParent = mBy('dSidebar');
	clearElement(dParent);
	dLeiste = mDiv(dParent);
	mStyleX(dLeiste, { 'min-width':70, 'max-height': '100vh', display: 'flex', 'flex-flow': 'column wrap' });
}
function initAux() {
	dAux = mBy('dAux');
	//show('dTemple');
	//show('dGear');

}
function initLineNavi() {
	dNavi = mBy('freezer');
	mStyleX(dNavi,{bg:'navy',margin:0,padding:0,pabottom:4,paleft:4})
	dLineNaviOuter = mDiv(dNavi); dLineNaviOuter.id = 'lineNaviOuter';

	dLineNavi = mDiv(dLineNaviOuter); dLineNavi.id = 'lineNavi';
	dLineNaviLeft = mDiv(dLineNavi); dLineNaviLeft.id = 'lineNaviLeft';
	dLineNaviRight = mDiv(dLineNavi); dLineNaviRight.id = 'lineNaviRight';
	dLineNaviMiddle = mDiv(dLineNavi); dLineNaviMiddle.id = 'lineNaviMiddle';

	mLinebreak(table);
}
function initLineTop() {
	dLineTopOuter = mDiv(table); dLineTopOuter.id = 'lineTopOuter';
	dLineTop = mDiv(dLineTopOuter); dLineTop.id = 'lineTop';
	dLineTopLeft = mDiv(dLineTop); dLineTopLeft.id = 'lineTopLeft';
	dLineTopRight = mDiv(dLineTop); dLineTopRight.id = 'lineTopRight';
	dLineTopMiddle = mDiv(dLineTop); dLineTopMiddle.id = 'lineTopMiddle';

	dScore = mDiv(dLineTopMiddle);
	dScore.id = 'dScore';

	dLevel = mDiv(dLineTopLeft);
	dLevel.id = 'dLevel';

	dGameTitle = mDiv(dLineTopRight);
	dGameTitle.id = 'dGameTitle';
	let d = mDiv(dLineTopRight);
	d.id = 'time';

	mLinebreak(table);
}
function initLineTitle() {
	dLineTitleOuter = mDiv(table); dLineTitleOuter.id = 'lineTitleOuter';
	dLineTitle = mDiv(dLineTitleOuter); dLineTitle.id = 'lineTitle';
	dLineTitleLeft = mDiv(dLineTitle); dLineTitleLeft.id = 'lineTitleLeft';
	dLineTitleRight = mDiv(dLineTitle); dLineTitleRight.id = 'lineTitleRight';
	dLineTitleMiddle = mDiv(dLineTitle); dLineTitleMiddle.id = 'lineTitleMiddle';

	mLinebreak(table);
}
function initLineTable() {
	dLineTableOuter = mDiv(table); dLineTableOuter.id = 'lineTableOuter';
	dLineTable = mDiv(dLineTableOuter); dLineTable.id = 'lineTable';
	dLineTableLeft = mDiv(dLineTable); dLineTableLeft.id = 'lineTableLeft';
	dLineTableMiddle = mDiv(dLineTable); dLineTableMiddle.id = 'lineTableMiddle';
	mClass(dLineTableMiddle, 'flexWrap');
	dLineTableRight = mDiv(dLineTable); dLineTableRight.id = 'lineTableRight';

	mLinebreak(table);
}
function initLineBottom() {
	dLineBottomOuter = mDiv(table); dLineBottomOuter.id = 'lineBottomOuter';
	dLineBottom = mDiv(dLineBottomOuter); dLineBottom.id = 'lineBottom';
	dLineBottomLeft = mDiv(dLineBottom); dLineBottomLeft.id = 'lineBottomLeft';
	dLineBottomRight = mDiv(dLineBottom); dLineBottomRight.id = 'lineBottomRight';
	dLineBottomMiddle = mDiv(dLineBottom); dLineBottomMiddle.id = 'lineBottomMiddle';

	mLinebreak(table);
}


//#region pic new API
function _createDivs(items, ifs, options) {
	//options needs to have showPics,showLabels
	if (nundef(options.textPos)) options.textPos = 'none';

	let w = isdef(options.w) ? options.w : options.sz;
	let h = isdef(options.h) ? options.h : options.sz;

	let padding = (isdef(ifs.padding) ? ifs.padding : 1);

	let bo = ifs.border;
	bo = isdef(bo) ? isString(bo) ? firstNumber(bo) : bo : 0;

	let wNet = w - 2 * padding - 2 * bo;
	let hNet = h - 2 * padding - 2 * bo;

	let pictureSize = wNet;
	options.center = true;
	//options.showLabels=false;
	let picStyles = { w: wNet, h: isdef(options.center) ? hNet : hNet + padding }; //if no labels!

	let textStyles, hText;
	if (options.showLabels) {
		let longestLabel = findLongestLabel(items);
		let oneWord = longestLabel.label.replace(' ', '_');

		let maxTextHeight = options.showPics ? hNet / 2 : hNet;
		textStyles = idealFontsize(oneWord, hNet, maxTextHeight, 22, 8);
		hText = textStyles.h;

		pictureSize = hNet - hText;
		picStyles = { w: pictureSize, h: pictureSize };

		delete textStyles.h;
		delete textStyles.w;
	}

	let outerStyles = { rounding: 10, margin: w / 12, display: 'inline-block', w: w, h: h, padding: padding, bg: 'white', align: 'center', 'box-sizing': 'border-box' };
	if (options.showLabels == true && options.textPos == 'none' && nundef(options.h)) delete outerStyles.h;
	outerStyles = deepmergeOverride(outerStyles, ifs);
	let pic, text;
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		let k = item.key;
		let d = mDiv();
		if (isdef(item.textShadowColor)) {
			let sShade = '0 0 0 ' + item.textShadowColor;
			if (options.showPics) {
				picStyles['text-shadow'] = sShade;
				picStyles.fg = anyColorToStandardString('black', item.contrast); //'#00000080' '#00000030' 
			} else {
				textStyles['text-shadow'] = sShade;
				textStyles.fg = anyColorToStandardString('black', item.contrast); //'#00000080' '#00000030' 
			}
		}
		//add pic if needed
		if (options.showPics) {
			pic = zPic(k, null, picStyles, true, false);
			delete pic.info;
			mAppend(d, pic.div);
		}
		//add text if needed
		if (options.showLabels) {
			textStyles.fg = item.fg;
			text = zText1Line(item.label, null, textStyles, hText);
			mAppend(d, text.div);
		}
		//style container div
		outerStyles.bg = item.bg;
		outerStyles.fg = item.fg;
		mStyleX(d, outerStyles);
		//console.log('===>iGroup',item.iGroup,i)
		d.id = getUID(); // 'pic' + (i + item.iGroup); //$$$$$
		d.onclick = options.onclick;
		//complete item info
		item.id = d.id;
		item.row = Math.floor(item.index / options.cols);
		item.col = item.index % options.cols;
		item.div = d;
		if (isdef(pic)) { item.pic = pic; item.fzPic = pic.innerDims.fz; }
		if (isdef(text)) item.text = text;
		item.isSelected = false;
		item.isLabelVisible = options.showLabels;
		item.dims = parseDims(w, w, d.style.padding);
		if (options.showRepeat) addRepeatInfo(d, item.iRepeat, w);
	}

}
function createStandardItems(onClickPictureHandler, ifs = {}, options = {}, keys, labels) {
	//#region prelim: default ifs and options, keys & infos
	//console.log('ifs', jsCopy(ifs)); console.log('options', jsCopy(options));

	// let showLabels = Settings.labels == true;
	if (nundef(Settings)) Settings = {};// language: 'E' };
	let infos = keys.map(k => (isdef(Settings.language) ? getRandomSetItem(Settings.language, k) : symbolDict[k]));
	//ifs and options: defaults
	let bg = isdef(options.colorKeys) ? 'white' : (i) => options.sameBackground ? computeColor('random') : 'random';
	let fg = (i, info, item) => colorIdealText(item.bg);
	let defIfs = { bg: bg, fg: fg, label: isdef(labels) ? labels : (i, info) => info.best, contrast: .32, fz: 20, padding: 10 };
	let defOptions = { showLabels: Settings.labels == true, shufflePositions: true, sameBackground: true, showRepeat: false, repeat: 1, onclick: onClickPictureHandler, iStart: 0 };
	ifs = deepmergeOverride(defIfs, ifs);
	options = deepmergeOverride(defOptions, options);
	//console.log('keys', keys); console.log('ifs', ifs); 
	//console.log('options', options);
	//#endregion

	//#region phase1: make items: hier jetzt mix and match
	let items = zItems(infos, ifs, options);
	if (options.repeat > 1) items = zRepeatEachItem(items, options.repeat, options.shufflePositions);
	if (isdef(options.colorKeys)) items = zRepeatInColorEachItem(items, options.colorKeys);
	//console.log('____________ options.rows', options.rows)
	items.map(x => x.label = x.label.toUpperCase());
	//#endregion phase1

	return [items, ifs, options];
}
function getRandomItems(n, keyOrSet, text = true, pic = true, styles = {}) {
	let keys = getRandomKeys(n, keyOrSet);
	//console.log(keys)
	if (pic == true) return getPics(() => console.log('click'), styles, { showLabels: text }, keys);
	else return getLbls(() => console.log('click'), styles, { showLabels: text }, keys);
}
function getPics(onClickPictureHandler, ifs = {}, options = {}, keys, labels) {
	let items;
	[items, ifs, options] = createStandardItems(onClickPictureHandler, ifs, options, keys, labels);
	// prepX(Pictures, ifs, options);
	prepDims(items, options);
	prepPics(items, ifs, options);
	return items;
}
function getLbls(onClickPictureHandler, ifs = {}, options = {}, keys, labels) {
	let items;
	[items, ifs, options] = createStandardItems(onClickPictureHandler, ifs, options, keys, labels);
	// prepX(Pictures, ifs, options);
	prepDims(items, options);
	prepLbls(items, ifs, options);
	return items;
}
function getPic(key, sz, bg, label) {
	let items, ifs = { bg: bg }, options = { sz: sz };
	if (isdef(label)) options.showLabels = true; else options.showLabels = false;
	[items, ifs, options] = createStandardItems(null, ifs, options, [key], isdef(label) ? [label] : undefined);
	// prepX(Pictures, ifs, options);
	prepDims(items, options);
	prepPics(items, ifs, options);
	return items[0];
}
function getLbl(key, sz, bg, label) {
	let items, ifs = { bg: bg }, options = { sz: sz };
	if (isdef(label)) options.showLabels = true; else options.showLabels = false;
	[items, ifs, options] = createStandardItems(null, ifs, options, [key], isdef(label) ? [label] : undefined);
	// prepX(Pictures, ifs, options);
	prepDims(items, options);
	prepLbls(items, ifs, options);
	return items[0];
}
function presentItems(items, dParent, rows) {
	//#region phase3: prep container for items
	//mClass(dParent, 'flexWrap'); //frage ob das brauche????
	//#endregion

	//#region phase4: add items to container!
	let dGrid = mDiv(dParent);
	items.map(x => mAppend(dGrid, x.div));
	let gridStyles = { 'place-content': 'center', gap: 4, margin: 4, padding: 4 };
	let gridSize = layoutGrid(items, dGrid, gridStyles, { rows: rows, isInline: true });
	// console.log('size of grid',gridSize,'table',getBounds(dTable))

	//#endregion


	//console.log('*** THE END ***', Pictures[0]);
	return { dGrid: dGrid, sz: gridSize };
}
function replaceLabel(item, label) { }
function replacePic(item, key) { }
function replacePicAndLabel(item, key, label) {
	//if item has both pic and label, replace them
	//if item has only pic, replace it and add label from new key
	//if item has onlt text, resize it and add both pic and label
	//if label param is missing, use default label param from key
	//console.log('item',item,'key',key,'label',label)
	let div = item.div;
	//console.log(item);
	let newItem = getPic(key, item.sz, item.bg, label);
	clearElement(div);
	mAppend(div, newItem.div.children[0]);
	mAppend(div, newItem.div.children[0]);
	item.pic = newItem.pic;
	item.text = newItem.text;
}
function addLabel(item, label) { }
function removeLabel(item) {
	//console.log('old item',item);
	let div = item.div;
	let newItem = getPic(item.key, item.sz, item.bg);
	//console.log('newItem',newItem);
	clearElement(div);
	mAppend(div, newItem.div.children[0]);
	item.pic = newItem.pic;
	delete item.text;
}
function addPic(item, key) {
	let div = item.div;
	//console.log(item);
	let newItem = getPic(key, item.sz, item.bg, item.label);
	clearElement(div);
	mAppend(div, newItem.div.children[0]);
	mAppend(div, newItem.div.children[0]);
	item.pic = newItem.pic;
	item.text = newItem.text;

}
function removePic(item) {
	//if item does not have a label, add the label for its key
	let div = item.div;
	//console.log(item);
	let newItem = getLbl(item.key, item.sz, item.bg, item.label);
	clearElement(div);
	mAppend(div, newItem.div.children[0]);
	delete item.pic;
	item.text = newItem.text;
}
function showLbls(onClickPictureHandler, ifs = {}, options = {}, keys, labels) {
	let items = getLbls(onClickPictureHandler, ifs, options, keys, labels);
	presentItems(items, dTable, 1);
	return items;
}
function showPics(onClickPictureHandler, ifs = {}, options = {}, keys, labels) {
	let items = getPics(onClickPictureHandler, ifs, options, keys, labels);
	presentItems(items, dTable, options.rows);
	return items;
}


function ty01(){

}
function yRandomPic(ifs,options){
	//make a random key,
}

function yPics(ifs,options) {
	let keys = choose(SymKeys, n);
	console.log(keys)
	showPicsS(keys);

}
function showPicsS(onClickPictureHandler, ifs = {}, options = {}, keys, labels) {
	let items = getPicsS(onClickPictureHandler, ifs, options, keys, labels);
	presentItems(items, dTable, options.rows);
	return items;
}
function getPicsS(onClickPictureHandler, ifs = {}, options = {}, keys, labels) {
	let items;
	[items, ifs, options] = createStandardItemsS(onClickPictureHandler, ifs, options, keys, labels);
	console.log(items)
	// prepX(Pictures, ifs, options);
	prepDims(items, options);
	// prepPics(items, ifs, options);
	options.showPics = true;
	_createDivs(items, ifs, options);
	return items;
}
function createStandardItemsS(onClickPictureHandler, ifs = {}, options = {}, keys, labels) {
	if (nundef(Settings)) Settings = {};
	let lang = isdef(Settings.language) ? Settings.language : 'E';
	let defShowLabels = isdef(Settings.labels) && Settings.labels == true;

	let infos = keys.map(k => Syms[k]);
	infos.map(x => x.best = x['best' + lang]);
	console.log(infos.map(x => x.best));

	let bg = isdef(options.colorKeys) ? 'white' : (i) => options.sameBackground ? computeColor('random') : 'random';
	let fg = (i, info, item) => colorIdealText(item.bg);
	let defIfs = { bg: bg, fg: fg, label: isdef(labels) ? labels : (i, info) => info.best, contrast: .32, fz: 20, padding: 10 };
	let defOptions = { showLabels: defShowLabels, shufflePositions: true, sameBackground: true, showRepeat: false, repeat: 1, onclick: onClickPictureHandler, iStart: 0 };
	ifs = deepmergeOverride(defIfs, ifs);
	options = deepmergeOverride(defOptions, options);
	let items = zItems(infos, ifs, options);
	if (options.repeat > 1) items = zRepeatEachItem(items, options.repeat, options.shufflePositions);
	if (isdef(options.colorKeys)) items = zRepeatInColorEachItem(items, options.colorKeys);
	items.map(x => x.label = x.label.toUpperCase());
	return [items, ifs, options];
}
function _createDivsS(items, ifs, options) {
	//options needs to have showPics,showLabels
	if (nundef(options.textPos)) options.textPos = 'none';

	let w = isdef(options.w) ? options.w : options.sz;
	let h = isdef(options.h) ? options.h : options.sz;

	let padding = (isdef(ifs.padding) ? ifs.padding : 1);

	let bo = ifs.border;
	bo = isdef(bo) ? isString(bo) ? firstNumber(bo) : bo : 0;

	let wNet = w - 2 * padding - 2 * bo;
	let hNet = h - 2 * padding - 2 * bo;

	let pictureSize = wNet;
	options.center = true;
	//options.showLabels=false;
	let picStyles = { w: wNet, h: isdef(options.center) ? hNet : hNet + padding }; //if no labels!

	let textStyles, hText;
	if (options.showLabels) {
		let longestLabel = findLongestLabel(items);
		let oneWord = longestLabel.label.replace(' ', '_');

		let maxTextHeight = options.showPics ? hNet / 2 : hNet;
		textStyles = idealFontsize(oneWord, hNet, maxTextHeight, 22, 8);
		hText = textStyles.h;

		pictureSize = hNet - hText;
		picStyles = { w: pictureSize, h: pictureSize };

		delete textStyles.h;
		delete textStyles.w;
	}

	let outerStyles = { rounding: 10, margin: w / 12, display: 'inline-block', w: w, h: h, padding: padding, bg: 'white', align: 'center', 'box-sizing': 'border-box' };
	if (options.showLabels == true && options.textPos == 'none' && nundef(options.h)) delete outerStyles.h;
	outerStyles = deepmergeOverride(outerStyles, ifs);
	let pic, text;
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		let k = item.key;
		let d = mDiv();
		if (isdef(item.textShadowColor)) {
			let sShade = '0 0 0 ' + item.textShadowColor;
			if (options.showPics) {
				picStyles['text-shadow'] = sShade;
				picStyles.fg = anyColorToStandardString('black', item.contrast); //'#00000080' '#00000030' 
			} else {
				textStyles['text-shadow'] = sShade;
				textStyles.fg = anyColorToStandardString('black', item.contrast); //'#00000080' '#00000030' 
			}
		}
		//add pic if needed
		if (options.showPics) {
			pic = zPicS(item, null, picStyles, true, false);
			delete pic.info;
			mAppend(d, pic.div);
		}
		//add text if needed
		if (options.showLabels) {
			textStyles.fg = item.fg;
			text = zText1Line(item.label, null, textStyles, hText);
			mAppend(d, text.div);
		}
		//style container div
		outerStyles.bg = item.bg;
		outerStyles.fg = item.fg;
		mStyleX(d, outerStyles);
		//console.log('===>iGroup',item.iGroup,i)
		d.id = getUID(); // 'pic' + (i + item.iGroup); //$$$$$
		d.onclick = options.onclick;
		//complete item info
		item.id = d.id;
		item.row = Math.floor(item.index / options.cols);
		item.col = item.index % options.cols;
		item.div = d;
		if (isdef(pic)) { item.pic = pic; item.fzPic = pic.innerDims.fz; }
		if (isdef(text)) item.text = text;
		item.isSelected = false;
		item.isLabelVisible = options.showLabels;
		item.dims = parseDims(w, w, d.style.padding);
		if (options.showRepeat) addRepeatInfo(d, item.iRepeat, w);
	}

}
function zPicS(item, dParent, styles = {}) {
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
	return _zPicS(item, dParent, stylesNew);
}
function detectItemInfoKey(itemInfoKey) {
	let item, info, key;
	if (isString(itemInfoKey)) { key = itemInfoKey; info = Syms[key]; item = { info: info, key: key }; }
	else if (isDict(itemInfoKey)) {
		if (isdef(itemInfoKey.info)) { item = itemInfoKey; info = item.info; key = item.info.key; }
		else { info = itemInfoKey; key = info.key; item = { info: info, key: key }; }
	}
	return [item, info, key];
}
function _zPicS(itemInfoKey, dParent, styles = {}) {
	let [item, info, key] = detectItemInfoKey(itemInfoKey);

	let outerStyles = isdef(styles) ? jsCopy(styles) : {};
	outerStyles.display = 'inline-block';
	let family = info.family;
	let wInfo = info.w;
	let hInfo = info.h; if (info.type == 'icon' && hInfo == 133) hInfo = 110;
	info.fz = 100;

	let innerStyles = { family: family };
	let [padw, padh] = isdef(styles.padding) ? [styles.padding, styles.padding] : [0, 0];

	let dOuter = isdef(dParent) ? mDiv(dParent) : mDiv();
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

//#endregion

//#region speech
var RecogOutput = false;
var RecogOutputError = true;
var RecogHighPriorityOutput = true;
var SpeakerOutput = false;
var MicrophoneUi;
var SessionId;
//var RecognitionAvailable = true;

class SpeechAPI {
	constructor(lang) {
		this.recorder = new Recorder(lang);
		this.speaker = new Speaker(lang);
		SessionId = Date.now();
	}
	testRecorder() {
		this.st
		this.recorder.start();
	}
	train() {

	}
	setLanguage(lang) {
		//console.log('settings the language to:',lang)
		this.speaker.setLanguage(lang);
		this.recorder.setLanguage(lang);
	}
	isSpeakerRunning() { return this.speaker.isRunning; }
	startRecording(lang, callback) {
		this.recorder.isCancelled = false;
		this.recorder.callback = callback;
		this.recorder.setLanguage(lang);
		this.recorder.start();
	}
	stopRecording() {
		this.recorder.isCancelled = true;
		this.recorder.stop();
	}

	say(text, r = .5, p = .8, v = .5, voicekey, callback, lang) {

		//what happens if change lang in the middle of speaking???
		if (isdef(lang)) this.speaker.setLanguage(lang);
		this.speaker.enq(arguments);
		this.speaker.deq();
	}

	stopSpeaking() {
		this.speaker.clearq();
	}

}

class Recorder {
	constructor(lang) {
		let rec = this.rec = new webkitSpeechRecognition();
		//console.log('speech recognition', rec)
		rec.continuous = true;
		rec.interimResults = true;
		rec.maxAlternatives = 5;
		this.setLanguage(lang);
		//flags
		this.isRunning = false;
		this.isCancelled = false;
		//result
		this.result = null;
		this.isFinal = null;
		this.confidence = null;

		this.callback = null;

		let genHandler = (ev, name) => {
			if (RecogOutput) console.log('recorder', name, 'isCancelled', this.isCancelled, 'isRunning', this.isRunning);
		}
		rec.onerror = ev => {
			genHandler(ev, 'error');
			// console.log('____________', ev.error == 'no-speech', ev.error)
			if (ev.error == 'network') {
				alert('no internet connection: Speech Recognition is not available! (error:'+ev.error+')');
				RecognitionAvailable = false;
			} //else {
			// 	alert('Great! Speech Recognition is available! '+ev.error)
			// 	RecognitionAvailable = true;
			// }
			if (RecogOutputError) console.error(ev);
			this.stop();
		};
		rec.onstart = ev => {
			genHandler(ev, 'started');
			if (!this.isCancelled) this.isRunning = true;
		};
		rec.onresult = ev => {
			genHandler(ev, 'result!');
			if (!this.isCancelled) this.processResult(ev);
		};
		rec.onend = ev => {
			genHandler(ev, 'ended');
			if (!this.isCancelled && this.callback) {
				//console.log('-------------------------')
				this.callback(this.isFinal, this.result, this.confidence, SessionId);
			}
			this.isCancelled = this.isRunning = false;
			this.callback = null;
		};

	}
	processResult(ev) {
		//console.log('**********', ev)
		let res = ev.results[0];
		this.isFinal = res.isFinal;
		this.result = res[0].transcript;
		this.confidence = res[0].confidence;

		if (this.isFinal) console.log('....result', this.result, 'FINAL?', this.isFinal)

		if (this.isFinal) {
			this.stop();
		}
	}
	setLanguage(lang) { this.rec.lang = (lang == 'E' ? 'en-US' : 'de-DE'); }
	start() {
		MicrophoneShow();
		setTimeout(() => this.rec.start(), 10);
	}
	stop() {
		//console.log('stopping!')
		MicrophoneHide();
		setTimeout(() => this.rec.stop(), 10);
	}
	getLastResult() {
		//should be of form {isFinal:,result:,confidence:}
		return { isFinal: this.isFinal, result: this.result, confidence: this.confidence };
	}
}
class Speaker {
	static get VOICES() {
		return {
			david: 'Microsoft David Desktop - English',
			zira: 'Microsoft Zira Desktop - English',
			us: 'Google US English',
			ukFemale: 'Google UK English Female',
			ukMale: 'Google UK English Male',
			deutsch: 'Google Deutsch',
		};
	}
	constructor(lang) {
		//console.log('init speaker...')
		this.lang = lang;
		this.q = [];
		this.isRunning = false;
		let awaitVoices = new Promise(resolve =>
			speechSynthesis.onvoiceschanged = resolve)
			.then(this.initVoices.bind(this));
	}
	initVoices() {
		this.voices = speechSynthesis.getVoices().sort(function (a, b) {
			const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
			if (aname < bname) return -1;
			else if (aname == bname) return 0;
			else return +1;
		});
		//console.log('voices:', this.voices.map(x => x.name))
	}
	setLanguage(lang) { this.lang = lang; }
	enq(args) { this.q.push(args); }
	deq() {
		if (nundef(this.voices)){
			setTimeout(this.deq.bind(this),500);
		}
		else if (!isEmpty(this.q)) {
			let args = this.q.pop();
			this.utter(...args);
		} else {
			this.isRunning = false;

		}
	}
	clearq() {
		this.q = [];
	}

	utter(text, r = .5, p = .8, v = .5, voicekey, callback = null) {


		speechSynthesis.cancel();
		var u = new SpeechSynthesisUtterance();
		//u.text = text;
		let [vkey, voice] = this.findSuitableVoice(text, voicekey);
		//console.log(this.voices,vkey)
		u.text = sepWords(text, vkey);// 'Hi <silence msec="2000" /> Flash!'; //text.toLowerCase();
		u.rate = r;
		u.pitch = p;
		u.volume = v;
		u.voice = voice;

		u.onend = ev => {
			if (isdef(callback)) callback();

			this.deq();
		};

		this.isRunning = true;
		speechSynthesis.speak(u);
	}
	findSuitableVoice(text, voicekey) {
		//console.log('findSuitableVoice',text,voicekey,this.lang);
		// voicekey ... random | key in voiceNames | starting phrase of voices.name
		//console.log(typeof voices, voices)
		let voicenames = Speaker.VOICES;
		let vkey = 'david';
		if (this.lang == 'D') {
			vkey = 'deutsch';
		} else if (text.includes('bad')) {
			vkey = 'zira';
		} else if (voicekey == 'random') {
			vkey = chooseRandom(['david', 'zira', 'us', 'ukFemale', 'ukMale']);
		} else if (isdef(voicenames[voicekey])) {
			vkey = voicekey;
		} else if (isdef(voicekey)) {
			let tryVoiceKey = firstCondDict(voicenames, x => startsWith(x, voicekey));
			if (tryVoiceKey) vkey = tryVoiceKey;
		}
		let voiceName = voicenames[vkey];
		let voice = firstCond(this.voices, x => startsWith(x.name, voiceName));
		return [vkey, voice];
	}

}


//#region Microphone UI

function mMicrophone(dParent, color) {
	let d = mDiv(dParent);
	d.innerHTML = '🎤';

	let c = bestContrastingColor(color, ['yellow', 'orange', 'red']);
	//let style = { bg: '#FF413680', rounding: '50%', fz: 50, padding: 5 };
	let bg = c;
	let style = { bg: bg, rounding: '50%', fz: 50, padding: 5, transition: 'opacity .35s ease-in-out' };
	mStyleX(d, style);
	mLinebreak(dParent);
	return d;
}
function MicrophoneShow() {
	//could use class blink
	if (nundef(MicrophoneUi)) return;
	if (RecogOutput) console.log('* mic start')
	MicrophoneUi.style.opacity = 1;
}
function MicrophoneHide() {
	if (nundef(MicrophoneUi)) return;
	if (RecogOutput) console.log('* mic end')
	MicrophoneUi.style.opacity = .31;
}

//#endregion

function isSimilar(reqAnswer, answer, lang) {
	if (answer == reqAnswer) return true;
	else if (replaceAll(answer, ' ', '') == replaceAll(reqAnswer, ' ', '')) return true;
	else if (differInAtMost(reqAnswer, answer, 1)) return true;
	else if (isSimilarSound(reqAnswer, answer, lang)) return true;
	else return false;
}


//#region helpers: TODO: put them in helpers and make syllabify a proper function
const germanNumbers = {
	ein: 1, eins: 1, zwei: 2, 1: 'eins', 2: 'zwei', 3: 'drei', drei: 3, vier: 4, 4: 'vier', 5: 'fuenf', fuenf: 5, sechs: 6, 6: 'sechs', sex: 6,
	sieben: 7, 7: 'sieben', 8: 'acht', acht: 8, 9: 'neun', neun: 9, zehn: 10, elf: 11, zwoelf: 12, zwanzig: 20, dreissig: 30,
	10: 'zehn', 11: 'elf', 12: 'zwoelf', 20: 'zwanzig', 30: 'dreissig', vierzig: 40, fuenfzig: 50, 40: 'vierzig', 50: 'fuenfzig'
};
function convertTimesAndNumbersToWords(w) {
	//console.log('B',typeof (w), isNumber(w), w);
	//check if w1 is a time (like 12:30)
	if (w.includes(':')) {
		//only works for hh:mm
		let h = stringBefore(w, ':');
		let m = stringAfter(w, ':');
		let hn = Number(h);
		let mn = Number(m);
		//console.log('_________',hn,mn);
		let xlist = allIntegers(w);
		if (xlist.length == 2) {
			if (xlist[1] == 0) xlist = [xlist[0]];
			xlist = xlist.map(n => n.toString());
			let res1 = xlist.join('');
			//console.log('C','turned time',w,'into number',res1);
			w = res1;
		}
	}
	if (isNumber(w)) {
		let res = toWords(w);
		//console.log('D','got number:', w, '=>', res)
		return res;
	}
	return w;
}
function detectSilben(words) {
	const syllableRegex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi;
	return words.match(syllableRegex);
}
function differInAtMost(req, given, n = 1) {

	let diffs = levDist(req, given);

	return diffs <= n;
	//der reihe nach jeden buchstaben aus dem given rausnehmen
	//given soll 
	//for(const)
}
function isSimilarSound(reqAnswer, s, lang) {
	let sParts = s.split(' ');
	let aParts = reqAnswer.split(' ');
	if (isNumber(s) || isTimeString(s, lang)) s = convertTimesAndNumbersToWords(s);
	if (isNumber(reqAnswer) || isTimeString(reqAnswer, lang)) reqAnswer = convertTimesAndNumbersToWords(reqAnswer);
	if (sParts.length != aParts.length) return false;
	for (let i = 0; i < sParts.length; i++) {
		if (!soundsSimilar(sParts[i], aParts[i], lang)) return false;
	}
	return true;
}
function isTimeString(w, lang) {
	let res1 = (w.includes(':') && w.length >= 4 && w.length <= 5);
	let res2 = (lang == 'D' && stringAfterLast(w.toLowerCase(), ' ') == 'uhr'); //endsWith(w.trim().toUpperCase(), 'UHR'));
	//console.log('CHECKING isTimeString_', w, res1 || res2);
	return res1 || res2;
}
function levDist(s, t) {
	var d = []; //2d matrix

	// Step 1
	var n = s.length;
	var m = t.length;

	if (n == 0) return m;
	if (m == 0) return n;

	//Create an array of arrays in javascript (a descending loop is quicker)
	for (var i = n; i >= 0; i--) d[i] = [];

	// Step 2
	for (var i = n; i >= 0; i--) d[i][0] = i;
	for (var j = m; j >= 0; j--) d[0][j] = j;

	// Step 3
	for (var i = 1; i <= n; i++) {
		var s_i = s.charAt(i - 1);

		// Step 4
		for (var j = 1; j <= m; j++) {

			//Check the jagged ld total so far
			if (i == j && d[i][j] > 4) return n;

			var t_j = t.charAt(j - 1);
			var cost = (s_i == t_j) ? 0 : 1; // Step 5

			//Calculate the minimum
			var mi = d[i - 1][j] + 1;
			var b = d[i][j - 1] + 1;
			var c = d[i - 1][j - 1] + cost;

			if (b < mi) mi = b;
			if (c < mi) mi = c;

			d[i][j] = mi; // Step 6

			//Damerau transposition
			if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
				d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
			}
		}
	}
	// Step 7
	return d[n][m];
}
function sepWords(text, voiceKey, s = '') { //<silence msec="200" />') {
	text = text.toLowerCase();
	//console.log(voice,'\nlang=',voice.lang.trim(),'\ntrue or false=',voice.lang.trim()=='en-US');
	//console.log('voiceKey',voiceKey)
	if (voiceKey == 'zira') {

		return text; // + ' hello <audio src="/assets/sounds/down.mp3">didnt get your MP3 audio file</audio> no way!';
	} else if (startsWith(voiceKey, 'u')) { return text; }
	let words = text.split(' ');
	//s='? ';//' - ';
	text = words.join(' '); text += s;
	//console.log('text', text)
	return text;
}
function soundsSimilar(w1, w2, lang) {
	//console.log('_______________ soundsSimilar')
	//console.log('A',typeof (w1), typeof (w2), isNumber(w1), isNumber(w2), w1, w2);
	w1 = convertTimesAndNumbersToWords(w1);
	w2 = convertTimesAndNumbersToWords(w2);
	const syllableRegex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi;
	function syllabify(words) {
		return words.match(syllableRegex);
	}
	let a1 = syllabify(w1);
	let a2 = syllabify(w2);
	//console.log('E', typeof (w1), typeof (w2), isNumber(w1), isNumber(w2), w1, w2)
	//console.log('a1', a1, 'a2', a2);
	if (!a1) a1 = [w1];
	if (!a2) a2 = [w2];
	if (lang == 'D' && isdef(germanNumbers[a1]) && germanNumbers[a1] == germanNumbers[a2]) return true;
	if (a1.length != a2.length) return false;

	//actually: EVERY syllable must match not just some!!!!!!!
	let SUPER_WEAK_SIMILARTY = false;
	if (SUPER_WEAK_SIMILARTY) {
		for (let i = 0; i < a1.length; i++) {
			let s1 = a1[i];
			let s2 = a2[i];
			if (s1 == s2) return true;
			let x1 = stringAfterLeadingConsonants(s1);
			let x2 = stringAfterLeadingConsonants(s2);
			if (lang == 'E' && 'ou'.includes(x1) && 'ou'.includes(x2) && x1.substring(1) == x2.substring(1)) return true;
			if (lang == 'E' && 'oa'.includes(x1) && 'ao'.includes(x2) && x1.substring(1) == x2.substring(1)) return true;
			if (lang == 'E' && x1.replace('ee', 'i') == x2.replace('ee', 'i')) return true;
			if (lang == 'E' && x1.replace('ea', 'ai') == x2.replace('ea', 'ai')) return true;
			if (lang == 'E' && x1.replace('au', 'o') == x2.replace('au', 'o')) return true;
		}
	} else {
		for (let i = 0; i < a1.length; i++) {
			let yesItsAMatch = false;
			let s1 = a1[i];
			let s2 = a2[i];
			if (s1 == s2) yesItsAMatch = true;
			let x1 = stringAfterLeadingConsonants(s1);
			let x2 = stringAfterLeadingConsonants(s2);
			if (x1 == x2) yesItsAMatch = true;
			if (lang == 'E' && 'ou'.includes(x1) && 'ou'.includes(x2) && x1.substring(1) == x2.substring(1)) yesItsAMatch = true;
			if (lang == 'E' && 'oa'.includes(x1) && 'ao'.includes(x2) && x1.substring(1) == x2.substring(1)) yesItsAMatch = true;
			if (lang == 'E' && x1.replace('ee', 'i') == x2.replace('ee', 'i')) yesItsAMatch = true;
			if (lang == 'E' && x1.replace('ea', 'ai') == x2.replace('ea', 'ai')) yesItsAMatch = true;
			if (lang == 'E' && x1.replace('au', 'o') == x2.replace('au', 'o')) yesItsAMatch = true;
			if (!yesItsAMatch) return false;
		}
		return true;
	}
	return false;

}
function stringAfterLeadingConsonants(s) {
	let regexpcons = /^([^aeiou])+/g;
	let x = s.match(regexpcons);
	return x ? s.substring(x[0].length) : s;
}
function toWords(s) {
	// American Numbering System
	var th = ['', 'thousand', 'million', 'billion', 'trillion'];
	// uncomment this line for English Number System
	// var th = ['','thousand','million', 'milliard','billion'];
	var dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
	var tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
	var tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
	s = s.toString();
	s = s.replace(/[\, ]/g, '');
	if (s != parseFloat(s)) return 'not a number';
	var x = s.indexOf('.');
	if (x == -1) x = s.length;
	if (x > 15) return 'too big';
	var n = s.split('');
	var str = '';
	var sk = 0;
	for (var i = 0; i < x; i++) {
		if ((x - i) % 3 == 2) {
			if (n[i] == '1') { str += tn[Number(n[i + 1])] + ' '; i++; sk = 1; }
			else if (n[i] != 0) { str += tw[n[i] - 2] + ' '; sk = 1; }
		} else if (n[i] != 0) {
			str += dg[n[i]] + ' '; if ((x - i) % 3 == 0) str += 'hundred '; sk = 1;
		} if ((x - i) % 3 == 1) {
			if (sk) str += th[(x - i - 1) / 3] + ' '; sk = 0;
		}
	}
	if (x != s.length) {
		var y = s.length;
		str += 'point ';
		//for (var i = x + 1; 
		str.replace(/\s+/g, ' ');
	}
	return str.trim();
}
//#endregion

//#region german number word similarity helpers (unused and needs info)

function matchingNumberOrTime(info, answer) {

	if (infoHasNumberOrTimeString(info) && isNumberOrTimeString(answer)) {
		//solve this thing using timestring or number
		//console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
		if (isNumber(answer) && infoHasNumber(info)) {
			//compare the numbers
			//console.log('1')
			let best1 = firstCond(info.words, x => isNumber(x));
			return best1 == answer;
		} else if (isTimeString(answer) && infoHasTimeString(info)) {
			let ts = firstCond(info.words, x => isTimeString(x));
			//console.log('222222222222200000000000000000000');
			let x1 = convertGermanUhrzeitToNumbers(answer);
			let x2 = convertTimeStringToNumbers(ts);
			//console.log(x1, x2);
			//remove all 0 from lists
			removeInPlace(x1, 0);
			removeInPlace(x2, 0);

			//console.log('after removeInPlace', x1, x2)
			return sameList(x1, x2);
		} else if (infoHasTimeString(info)) {
			//console.log('3')
			let best1 = firstCond(info.words, x => isTimeString(x));
			let x1 = convertTimesAndNumbersToWords(best1);
			let x2 = convertTimesAndNumbersToWords(answer);
			return x1 == x2;
		}
	}
}

function convertGermanUhrzeitToNumbers(w) {
	console.log('...', w)
	//geht nur fuer ein eins zwei ... und dreissig
	let parts = multiSplit(w, ' :');
	console.log('...parts', parts)
	let res = [];
	for (const p of parts) {
		let p1 = p.trim().toLowerCase();
		if (isNumber(p1)) res.push(Number(p1));
		else if (isdef(germanNumbers[p1])) res.push(germanNumbers[p1]);
		// continue;
		// switch (p1) {
		// 	case '1': res.push(1); break;
		// 	case 'ein': res.push(1); break;
		// 	case 'eins': res.push(1); break;
		// 	case '2': res.push(2); break;
		// 	case 'zwei': res.push(2); break;
		// 	case '3': res.push(3); break;
		// 	case 'drei': res.push(3); break;
		// 	case '4': res.push(4); break;
		// 	case 'vier': res.push(4); break;
		// 	case '5': res.push(5); break;
		// 	case 'fuenf': res.push(5); break;
		// 	case '6': res.push(6); break;
		// 	case 'sechs': res.push(6); break;
		// 	case '7': res.push(7); break;
		// 	case 'sieben': res.push(7); break;
		// 	case '8': res.push(8); break;
		// 	case 'acht': res.push(8); break;
		// 	case '9': res.push(9); break;
		// 	case 'neun': res.push(9); break;
		// 	case '10': res.push(10); break;
		// 	case 'zehn': res.push(10); break;
		// 	case '11': res.push(11); break;
		// 	case 'elf': res.push(11); break;
		// 	case '12': res.push(12); break;
		// 	case 'zwoelf': res.push(12); break;
		// 	case 'dreissig': res.push(30); break;
		// 	case '30': res.push(30); break;
		// 	default:
		// }
	}
	return res;

}
function convertTimeStringToNumbers(ts) {
	return allIntegers(ts);
}
//#endregion

//#endregion

//#region time
var TimestampStarted, TimeElapsed, OnTimeOver = null, TimeElem, TimeLeft;
function restartTime(elem) { TimestampStarted = msNow(); TimeElapsed = 0; startTime(elem); }
function startTime(elem) {

	if (nundef(Settings.showTime) || !Settings.showTime) return;
	if (nundef(TimestampStarted)) { TimestampStarted = msNow(); TimeElapsed = 0; }
	if (nundef(elem) && isdef(TimeElem)) { elem = TimeElem; }
	else { if (isString(elem)) elem = mBy(elem); TimeElem = elem; }

	// console.log(TimestampStarted, _getFunctionsNameThatCalledThisFunction())
	var timeLeft = TimeLeft = Settings.minutesPerUnit * 60000 - getTimeElapsed();
	if (timeLeft > 0) {
		let t = msToTime(timeLeft);
		let s = format2Digits(t.h) + ":" + format2Digits(t.m) + ":" + format2Digits(t.s);

		elem.innerHTML = s;//h + ":" + m + ":" + s;
		setTimeout(() => startTime(elem), 500);
	} else {
		elem.innerHTML = '00:00:00';
		if (OnTimeOver) OnTimeOver();
	}
}
function unitTimeUp() { return (Settings.minutesPerUnit * 60000 - getTimeElapsed()) <= 0; }
function startTimeClock(elem) {
	if (nundef(Settings.showTime) || !Settings.showTime) return;
	var today = new Date(),
		h = format2Digits(today.getHours()),
		m = format2Digits(today.getMinutes()),
		s = format2Digits(today.getSeconds());

	if (isString(elem)) elem = mBy(elem); elem.innerHTML = h + ":" + m + ":" + s;
	setTimeout(() => startTimeClock(elem), 500);

}
function format2Digits(i) { return (i < 10) ? "0" + i : i; }
function getTimeElapsed() { return TimeElapsed + msElapsedSince(TimestampStarted); }
function msNow() { return Date.now(); }
function msToTime(ms) {
	let secs = Math.floor(ms / 1000);
	let mins = Math.floor(secs / 60);
	secs = secs - mins * 60;
	let hours = Math.floor(mins / 60);
	mins = mins - hours * 60;
	return { h: hours, m: mins, s: secs };
}
function msElapsedSince(msStart) { return Date.now() - msStart; }
function timeToMs(h, m, s) { return ((((h * 60) + m) * 60) + s) * 1000; }


class TimeoutManager {
	constructor() {
		this.TO = {};
	}
	clear(key) {
		if (nundef(key)) key = Object.keys(this.TO);
		else if (isString(key)) key = [];

		for (const k of key) {
			clearTimeout(this.TO[k]);
			delete this.TO[k];
		}
	}
	set(ms, callback, key) {
		if (nundef(key)) key = getUID();
		TO[key] = setTimeout(ms, callback);
	}
}


class CountdownTimer {
	constructor(ms, elem) {
		this.timeLeft = ms;
		this.msStart = DA.now();
		this.elem = elem;
		this.tick();
	}
	msElapsed() { return Date.now() - this.msStart; }
	tick() {
		this.timeLeft -= this.msElapsed;
		this.elem.innerHTML = this.timeLeft;
		if (this.timeLeft > 1000) {
			setTimeout(this.tick.bind(this), 500);
		} else this.elem.innerHTML = 'timeover';
	}
}

//#endregion

//#region settings
function saveSettings(){

}
function initSettings(game) {
	Settings = deepmergeOverride(DB.settings, U.settings);
	delete Settings.games;
	let gsSettings = lookup(U, ['games', game, 'settings']);
	if (isdef(gsSettings)) Settings = deepmergeOverride(Settings, gsSettings);
	updateSettings();

}

function updateSettings() {

	appSpecificSettings();

	//welche settings kommen wohin?
	for (const k in SettingTypesCommon) {
		if (SettingTypesCommon[k]) {
			//console.log('should be set for all games:',k,Settings[k]);

			lookupSetOverride(U, ['settings', k], Settings[k]);

		} else {
			if (isdef(G.id)) lookupSetOverride(U, ['games', G.id, 'settings', k], Settings[k]);

		}
	}

}


function setSettingsKeys(elem) {
	let val = elem.type == 'number' ? Number(elem.value) : elem.type == 'checkbox' ? elem.checked : elem.value;
	lookupSetOverride(Settings, elem.keyList, val);
	SettingsChanged = true;
	console.log(elem.keyList, val)
	//console.log(Settings);
}
function setSettingsKeysSelect(elem) {

	let val;
	for (const opt of elem.children) {
		if (opt.selected) val = opt.value;
	}

	// console.log('lllllllllllllllll', a, a.value, a.keyList);
	//let val = elem.type == 'number' ? Number(elem.value) : elem.value;
	SettingsChanged = true;
	lookupSetOverride(Settings, elem.keyList, val);
	//console.log('result', lookup(Settings, elem.keyList));
}

function setzeEineZahl(dParent, label, init, skeys) {
	// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
	let d = mDiv(dParent);
	let val = lookup(Settings, skeys);
	if (nundef(val)) val = init;
	let inp = createElementFromHTML(
		// `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
		`<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`);
	let labelui = createElementFromHTML(`<label>${label}</label>`);
	mAppend(d, labelui);
	mAppend(labelui, inp);

	mStyleX(inp, { maleft: 12, mabottom: 4 });
	mClass(inp, 'input');

	inp.keyList = skeys;
}
function setzeEineCheckbox(dParent, label, init, skeys) {
	// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
	let d = mDiv(dParent);
	let val = lookup(Settings, skeys);
	if (nundef(val)) val = init;
	let inp = createElementFromHTML(
		`<input type="checkbox" class="checkbox" ` + (val === true ? 'checked=true' : '') + ` onfocusout="setSettingsKeys(this)" >`
		// `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
		// `<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`
	);
	let labelui = createElementFromHTML(`<label>${label}</label>`);
	mAppend(d, labelui);
	mAppend(labelui, inp);

	mStyleX(inp, { maleft: 12, mabottom: 4 });
	mClass(inp, 'input');

	inp.keyList = skeys;
}
function setzeEinOptions(dParent, label, optionList, friendlyList, init, skeys) {

	// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
	let d = mDiv(dParent);
	let val = lookup(Settings, skeys);
	if (nundef(val)) val = init;

	let inp = createElementFromHTML(`<select class="options" onfocusout="setSettingsKeysSelect(this)"></select>`);
	for (let i = 0; i < optionList.length; i++) {
		let opt = optionList[i];
		let friendly = friendlyList[i];
		let optElem = createElementFromHTML(`<option value="${opt}">${friendly}</option>`);
		mAppend(inp, optElem);
		if (opt == val) optElem.selected = true;
	}
	// // `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
	// `<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`);
	let labelui = createElementFromHTML(`<label>${label}</label>`);
	mAppend(d, labelui);
	mAppend(labelui, inp);

	mStyleX(inp, { maleft: 12, mabottom: 4 });

	inp.keyList = skeys;
}


function mInputGroup(dParent, styles) {
	let baseStyles = { display: 'inline-block', align: 'right', bg: '#00000080', rounding: 10, padding: 20, margin: 12 };
	if (isdef(styles)) styles = deepmergeOverride(baseStyles, styles); else styles = baseStyles;
	return mDiv(dParent, styles);
}

//#endregion

//#region keys
const KSKeys = ['action', 'actionPlus', 'all', 'best25', 'best50', 'best75', 'best100', 'emo', 'huge', 
								'life', 'life50', 'lifePlus', 'nemo', 'nemo100', 'obejct', 'object50', 'objectPlus'];

var KeySets;
function catFiltered(cats, name, best) {
	//console.log(cats, name)
	let keys = setCategories(cats);

	let bestName = null;
	let k1 = keys.filter(x => best.includes(x));
	if (k1.length > 80) bestName = name + '100';
	else if (k1.length > 40) bestName = name + '50';
	else if (k1.length > 20) bestName = name + '25';
	let result = {};
	result[name] = keys;
	if (bestName) result[bestName] = k1;

	return result;
}

function getKeySets() {
	let ks = localStorage.getItem('KeySets');
	if (isdef(ks)) return JSON.parse(ks);

	let huge = [];
	for (const k in symbolDict) {
		let info = symbolDict[k];
		if (isdef(info.bestD)) huge.push(k);
	}

	//push all the keys that are in Syms but not in symbolDict!
	for (const k of ['zebra']) huge.push(k);

	let allKeys = symKeysBySet.nosymbols;
	let keys = allKeys.filter(x => isdef(symbolDict[x].best100));
	let keys1 = allKeys.filter(x => isdef(symbolDict[x].best100) && isdef(symbolDict[x].bestE));
	let keys2 = allKeys.filter(x => isdef(symbolDict[x].best50));
	let keys3 = allKeys.filter(x => isdef(symbolDict[x].best25));
	let res = { huge: huge, best25: keys3, best50: keys2, best75: keys1, best100: keys, all: allKeys };
	let res1 = catFiltered(['nosymemo'], 'nemo', res.best100);
	let res2 = catFiltered(['animal', 'plant', 'fruit', 'vegetable'], 'life', res.best100);
	let res3 = catFiltered(['object'], 'object', res.best100);
	let res4 = catFiltered(['gesture', 'emotion'], 'emo', res.best100);
	let res5 = catFiltered(['activity', 'role', 'sport', 'sports', 'game'], 'action', res.best100);
	for (const o of [res1, res2, res3, res4, res5]) {
		for (const k in o) res[k] = o[k];
	}

	res['objectPlus'] = union(res.object, res.best100);
	res['lifePlus'] = union(res.life, res.best100);
	res['actionPlus'] = union(res.action, res.best100);

	localStorage.setItem('KeySets', JSON.stringify(res));
	return res;

}
function setKeys({ nMin, lang, key, keysets, filterFunc, confidence, sortByFunc } = {}) {


	let keys = jsCopy(keysets[key]);
	//console.log('setKeys (from',getFunctionsNameThatCalledThisFunction()+')',keys)

	if (isdef(nMin)) {
		let diff = nMin - keys.length;
		let additionalSet = diff > 0 ? firstCondDictKeys(keysets, k => k != key && keysets[k].length > diff) : null;

		//console.log('diff',diff,additionalSet, keys)
		if (additionalSet) KeySets[additionalSet].map(x => addIf(keys, x)); //
		//if (additionalSet) keys = keys.concat(keysets[additionalSet]);
		//console.log(keys)
	}

	let primary = [];
	let spare = [];
	for (const k of keys) {
		let info = symbolDict[k];
		let klang = 'best' + lang;
		//console.log(k,lang,klang)
		if (nundef(info[klang])) info[klang] = lastOfLanguage(k, lang);
		info.best = info[klang];
		//console.log(k,lang,lastOfLanguage(k,lang),info.best,info)
		let isMatch = true;
		if (isdef(filterFunc)) isMatch = isMatch && filterFunc(k, info.best);
		if (isdef(confidence)) isMatch = info[klang + 'Conf'] >= confidence;
		if (isMatch) { primary.push(k); } else { spare.push(k); }
	}

	//console.assert(isEmpty(intersection(spare,primary)))

	if (isdef(nMin)) {
		//if result does not have enough elements, take randomly from other
		let len = primary.length;
		let nMissing = nMin - len;
		if (nMissing > 0) { let list = choose(spare, nMissing); spare = arrMinus(arr, list); primary = primary.concat(list); }
	}

	if (isdef(sortByFunc)) { sortBy(primary, sortByFunc); }

	if (isdef(nMin)) console.assert(primary.length >= nMin);
	//console.log(primary)
	return primary;
}

function getRandomKeys(n, kSetOrList) { return choose(isList(kSetOrList) ? kSetOrList : KeySets[kSetOrList], n); }
function getRandomKeysIncluding(n, k, kSetOrList) {
	let keys = getRandomKeys(n, kSetOrList);
	if (!keys.includes(k)) {
		//randomly replace one of the keys by this one!
		let i = randomNumber(0, keys.length - 1);
		keys.splice(i, 1, k);
	}
	shuffle(keys);
	return keys;
}

function getSym(key, lang = 'E') {

	let info = jsCopy(picInfo(key));
	if (nundef(info.bestD)) { info.bestE = info.E.key; return info; }

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



//#endregion

//#region hey
var BlockServerSend = false;
var SERVER_DATA = null;

async function broadcastSIMA(usersPath = './users.yaml', settingsPath = './settings.yaml', gamesPath = './games.yaml', addonsPath = './addons.yaml') {
	let users = await loadYamlDict(usersPath);
	let settings = await loadYamlDict(settingsPath);
	let games = await loadYamlDict(gamesPath);
	let addons = await loadYamlDict(addonsPath);

	DB = {
		id: 'speechGames',
		users: users,
		settings: settings,
		games: games,
		addons: addons,
	};

	//console.log('...saving from BROADCASTING')
	saveSIMA();

	if (CLEAR_LOCAL_STORAGE) localStorage.clear();
	await loadAssetsSIMA('../assets/');

}

async function loadSIMA(callback) {
	//console.log('...loading...');
	let url = SERVERURL;
	fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	}).then(async data => {
		let sData = await data.json();
		DB = sData[0];
		//console.log(DB)
		//hier kann ich assets laden!!!
		if (CLEAR_LOCAL_STORAGE) localStorage.clear();
		await loadAssetsSIMA('../assets/');

		if (isdef(callback)) callback();
	});
}
async function localOrRoute(key, url) {
	if (USE_LOCAL_STORAGE) {
		let x = localStorage.getItem(key);
		if (isdef(x)) return JSON.parse(x);
		else {
			let data = await route_path_yaml_dict(url);
			if (key != 'svgDict') localStorage.setItem(key, JSON.stringify(data));
			return data;
		}
	} else return await route_path_yaml_dict(url);
}
async function loadAssetsSIMA(assetsPath) {
	c52 = await localOrRoute('c52', assetsPath + 'c52_blackBorder.yaml');
	//testCards = await localOrRoute('testCards', assetsPath + 'testCards.yaml');
	cinno = await localOrRoute('cinno', assetsPath + 'fe/inno.yaml');

	//return;
	symbolDict = await localOrRoute('symbolDict', assetsPath + 'symbolDict.yaml');
	symbolKeys = Object.keys(symbolDict);
	symbolList = dict2list(symbolDict);
	ensureSymBySet(); makeHigherOrderGroups();

	svgDict = await localOrRoute('svgDict', assetsPath + 'svgDict.yaml'); //TODO: depending on ext, treat other assts as well!
	svgKeys = Object.keys(svgDict);
	svgList = dict2list(svgDict);

	Syms = await localOrRoute('syms', assetsPath + 'syms.yaml');
	SymKeys = Object.keys(Syms);

	//console.log('SymKeys',SymKeys)

}

async function saveSIMA() {
	if (BlockServerSend) {
		//console.log('...wait for unblocked...');
		setTimeout(saveSIMA, 1000);
	} else {
		//console.log('posting DB: startLevel Pictures!', lookupSet(DB.users,[Username,'games','gTouchPic','startLevel'],0)); //DB.users[Username].games.gTouchPic.startLevel);
		//console.log(DB);

		let url = SERVERURL + 'speechGames';
		BlockServerSend = true;
		//console.log('blocked...');
		fetch(url, {
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(DB)
		}).then(() => { BlockServerSend = false; }); //console.log('unblocked...'); });
	}

}






//#endregion

//#region user
class UserManager{}

function addScoreToUserSession() {
	//at end of level
	//adds Score to session
	//console.log('Score', Score)
	//console.assert(isdef(Score.nTotal) && Score.nTotal > 0)
	let sc = { nTotal: Score.nTotal, nCorrect: Score.nCorrect, nCorrect1: Score.nCorrect1 };
	let game = G.id;
	let level = G.level;
	let session = U.session;
	if (nundef(session)) {
		console.log('THERE WAS NO USER SESSION IN _addScoreToUserSession!!!!!!!!!!!!!!!!!!!!!')
		U.session = {};
	}

	let sGame = session[game];
	if (nundef(sGame)) {
		sGame = session[game] = jsCopy(sc);
		sGame.byLevel = {};
		sGame.byLevel[level] = jsCopy(sc);
	} else {
		addByKey(sc, sGame);
		let byLevel = lookupSet(sGame, ['byLevel', level], {});
		addByKey(sc, byLevel);
	}
	sGame.percentage = Math.round(100 * sGame.nCorrect / sGame.nTotal);

	saveUser();

}
function addSessionToUserGames() {
	// adds session to U.games and deletes session

	if (!isEmpty(U.session)) {
		for (const g in U.session) {
			let recOld = lookup(U, ['games', g]);
			let recNew = U.session[g];

			//console.assert(isdef(recOld));

			addByKey(recNew, recOld);
			recOld.percentage = Math.round(100 * recOld.nCorrect / recOld.nTotal);
			if (nundef(recOld.byLevel)) recOld.byLevel = {};
			for (const l in recNew.byLevel) {
				if (nundef(recOld.byLevel[l])) recOld.byLevel[l] = jsCopy(recNew.byLevel[l]);
				else addByKey(recNew.byLevel[l], recOld.byLevel[l]);
			}
		}
	}
	U.session = {};
}
function changeUserTo(name) {
	if (name != Username) { saveUser(); }
	mBy('spUser').innerHTML = name;
	loadUser(name);
	startUnit();
}
function editableUsernameUi(dParent) {
	//console.log('creating input elem for user', Username)
	let inp = mEditableInput(dParent, 'user: ', Username);
	inp.id = 'spUser';
	inp.addEventListener('focusout', () => { changeUserTo(inp.innerHTML.toLowerCase()); });
	return inp;
}
function getStartLevels(user) {
	let udata = lookup(DB, ['users', user]);
	if (!udata) return 'not available';
	let res = [];
	let res2 = {};
	for (const g in udata.games) {
		res2[g] = udata.games[g].startLevel;
		res.push(g + ': ' + udata.games[g].startLevel);
	}
	return res2; // res.join(',');

}
function getUserStartLevel(game) {
	gInfo = U.games[game];
	level = isdef(gInfo) && isdef(gInfo.startLevel) ? gInfo.startLevel : 0;
	return level;
}
function cleanupOldGame(){
	updateUserScore();//this saves user data + clears the score.nTotal,nCorrect,nCorrect1!!!!!

	//clear previous game (timeouts...)
	if (isdef(G) && isdef(G.instance)) {
		G.instance.clear();
	}

}
function loadUser(newUser) {

	//if (Username == newUser) return;
	//console.log('newUser', newUser)

	cleanupOldGame();

	Username = isdef(newUser) ? newUser : localStorage.getItem('user');

	if (nundef(Username)) Username = DEFAULTUSERNAME;

	//console.log('U anfang von loadUser', U, '\nDB', DB.users[Username]);

	let uData = lookupSet(DB, ['users', Username]);
	if (newUser == 'test') { uData = DB.users[Username] = jsCopy(DB.users.test0); uData.id = Username; }
	if (!uData) { uData = DB.users[Username] = jsCopy(DB.users.guest0); uData.id = Username; }

	U = new UserManager(Username);
	U = DB.users[Username];

	let uiName = 'spUser';
	let dUser = mBy(uiName);
	if (nundef(dUser)) { dUser = editableUsernameUi(dLineTopLeft); dUser.id = uiName; }

	let game = !window.navigator.onLine && U.lastGame == 'gSayPic' ? 'gTouchPic' : U.lastGame; //do NOT start in gSayPic if no internet!!!
	if (nundef(game)) game = U.avGames[0]; //chooseRandom(U.avGames);

	let gInfo = U.games[game];
	let level = isdef(gInfo) && isdef(gInfo.startLevel) ? gInfo.startLevel : 0;

	setGame(game, level);
}
function saveUnit() { saveUser(); }
function saveUser() {
	//console.log('saveUser:', Username,G.id,G.level); //_getFunctionsNameThatCalledThisFunction()); 
	U.lastGame = G.id;
	if (Username != 'test') localStorage.setItem('user', Username);
	DB.users[Username] = U;
	//console.log('...saving from saveUser called by', getFunctionsNameThatCalledThisFunction())
	saveSIMA();
}
function setGame(game, level) {

	cleanupOldGame();
	//set new game: friendly,logo,color,key,maxLevel,level 
	//console.log('set game to', game)
	if (isdef(G) && G.id != game) Score.gameChange = true;

	
	G = jsCopy(DB.games[game]); //jsCopy(DB.games[game]);
	//console.log('color', G.color, ColorDict[G.color], window[G.color])

	//let c = firstCondDict(ColorDict,x=>x.c == )
	G.color = getColorDictColor(G.color); //isdef(ColorDict[G.color]) ? ColorDict[G.color].c : G.color;
	// G.color = isdef(ColorDict[G.color])?ColorDict[G.color]:isdef(window[G.color])?window[G.color]:G.color;
	//console.log('_________setGame: color',G.color);

	initSettings(game);

	let levels = lookup(DB.games, [game, 'levels']);
	G.maxLevel = isdef(levels) ? Object.keys(levels).length - 1 : 0;

	G.id = game;

	//if (isCal) supdateStartLevelForUser(game, 0);

	if (isdef(level)) G.level = level;
	else { G.level = getUserStartLevel(game); }

	//console.log('setGame:', game, Username, getUserStartLevel(game));

	if (G.level > G.maxLevel) G.level = G.maxLevel;

	if (nundef(U.games[game])) {
		U.games[game] = { nTotal: 0, nCorrect: 0, nCorrect1: 0, startLevel: 0, byLevel: {} };
	}

	saveUser();
	//console.log('game',game,'level',level)

}
function setNextGame() {
	let game = G.id;
	let i = U.avGames.indexOf(game);
	let iNew = (i + 1) % U.avGames.length;
	setGame(U.avGames[iNew]);
}
function updateStartLevelForUser(game, level, msg) {
	//console.log('updating startLevel for', Username, game, level, '(' + msg + ')')
	lookupSetOverride(U.games, [game, 'startLevel'], level);
	saveUser();
}
function updateUserScore() {
	if (nundef(Score.nTotal) || Score.nTotal <= 0) return;

	let sc = { nTotal: Score.nTotal, nCorrect: Score.nCorrect, nCorrect1: Score.nCorrect1 };
	let g = G.id;

	let recOld = lookupSet(U, ['games', g], { startLevel: 0, nTotal: 0, nCorrect: 0, nCorrect1: 0 });
	let recSession = lookupSet(U, ['session', g], { startLevel: 0, nTotal: 0, nCorrect: 0, nCorrect1: 0 });

	addByKey(sc, recSession);
	recSession.percentage = Math.round(100 * recSession.nCorrect / recSession.nTotal);

	addByKey(sc, recOld);
	recOld.percentage = Math.round(100 * recOld.nCorrect / recOld.nTotal);

	//console.log('updated user score for', g, sc, recOld);
	//console.log('updated user score session', recSession);
	Score.nTotal = Score.nCorrect = Score.nCorrect1 = 0;
	saveUser();
}


//#endregion

//#region serverConfig

const IS_TESTING = true; // *** only set this one! ***

var USE_LOCAL_STORAGE = !BROADCAST_SETTINGS; // true | false //localStorage is cleared when false!!!!!
var PROD_START = !IS_TESTING;


//#endregion

//#region live
//uses _globals
//manages (writes) Live

function initLive() { Live = {}; }


class UIClass {
	static States = { none: 0, gettingReady: 1, ready: 2, running: 3, on: 3, off: 4 }
	constructor(k) { //a live object gets an id at birth
		//console.log('__________________k',k)
		this.key = k;
		let id = this.id = getUID();
		Live[id] = this;
		this.TOList = [];
		this.UIS = [];
		this.uiActivated = false;
		this.uiState = UIClass.States.none;
	}
	//#region hidden API
	_clearTO() { this.TOList.map(x => clearTimeout(x)); this.TOList = []; }
	_clearUI() { }// TODO: think about this!!!!! for(const k in this.UIS){this.UIS[k].}}
	//#endregion
	activate() { this.uiActivated = true; }
	clear() { this._clearTO(); } //just hide its UI???
	deactivate() { this.uiActivated = false; }
	die() { this._clearTO(); console.assert(isdef(this.div)); this.div.remove(); Live[this.id] = null; }
	run() { console.log('object', this.id, 'is running...') }

	setGettingReady() { this.running = false; this.uiState = UIClass.States.gettingReady; console.log('...getting ready!'); }
	setRunning() { this.running = true; this.uiState = UIClass.States.running; }
	setReady() { this.running = false; this.uiState = UIClass.States.ready; console.log('ready!'); }
	getReady(ms) {
		if (isdef(ms)) { this.setGettingReady(); setTimeout(this.setReady.bind(this), ms); }
		else this.setReady();
	}


}

























//#endregion

//#region start
async function _loader() {

	if (!IS_TESTING) {
		ifPageVisible.on('blur', function () {
			// example code here..
			//animations.pause();
			enterInterruptState();
			console.log('stopping game', G.id)
		});

		ifPageVisible.on('focus', function () {
			// resume all animations
			// animations.resume();
			if (isdef(G.instance)) {
				//cleanupOldGame();//this saves user data + clears the score.nTotal,nCorrect,nCorrect1!!!!!
				setGame(G.id);
			}
			closeAux();
			startGame();
			// auxOpen = false;
			// startGame();
			console.log('restarting game', G.id)
		});
	}
	// if ('serviceWorker' in navigator) {
	// 	console.log('CLIENT: service worker registration in progress.');
	// 	navigator.serviceWorker.register('/service-worker.js').then(function() {
	// 		console.log('CLIENT: service worker registration complete.');
	// 	}, function() {
	// 		console.log('CLIENT: service worker registration failure.');
	// 	});
	// } else {
	// 	console.log('CLIENT: service worker is not supported.');
	// }

	//timit = new TimeIt('start');
	if (BROADCAST_SETTINGS) {
		console.log('...broadcasting ...')
		await broadcastSIMA();
		_start();
	} else { loadSIMA(_start); }

}
async function makeDictionaries() {
	// let ddd = await route_path_yaml_dict('../assets/ddAlles.yaml');
	// console.log(ddd)
	let ddd = await route_path_text('../assets/speech/ddAlles.txt');
	console.log(ddd)
	let lines = ddd.split('\n');
	console.log(lines);
	let newLines = [];
	let deDict = {};
	let deNouns = {};
	let edDict = {};
	let edNouns = {};
	for (let i = 0; i < lines.length; i++) {
		let l = lines[i];
		if (startsWith(l, 'German')) console.log(l);
		else if (startsWith(l, 'A ')) console.log(l);
		else {
			newLines.push(l);
			let d = stringBefore(l, ' :');
			// let info={isNoun:false};
			let gen = null;
			if (d.includes('{')) {
				let parts = d.split('{');
				d = parts[0].trim();
				gen = stringBefore(parts[1], '}').trim();
				// d=stringBefore(d,'{').trim();
				// let gen = stringBefore(stringAfter(d,'{'),'}');
				//info = {isNoun:true,gen:gen};
				lookupSet(deDict, [d, 'gen'], gen);
				lookupSet(deNouns, [d, 'gen'], gen);
			}
			let elist = stringAfter(l, ': ').split(',').map(x => x.trim());
			for (const e of elist) {
				lookupAddIfToList(deDict, [d, 'e'], e);
				lookupAddIfToList(edDict, [e, 'd'], d);
				if (isdef(gen)) {
					lookupAddIfToList(edNouns, [e, 'd'], d);
					lookupAddIfToList(deNouns, [d, 'e'], e);
				}
			}
			// deDict[d].info=info;
		}
		//if (i>100) break;
	}
	console.log(deDict);
	console.log(edDict);
	downloadTextFile(newLines.join('\n'), 'ddText', ext = 'txt')
	downloadAsYaml(deDict, 'deDict');
	downloadAsYaml(edDict, 'edDict');
	downloadAsYaml(deNouns, 'deNouns');
	downloadAsYaml(edNouns, 'edNouns');
}
async function updateSymbolDictFromDictionaries() {
	// [EdDict,DeDict]=await loadGermanNouns();
	[EdDict, DeDict] = await loadGerman();
	let ekeys = Object.keys(EdDict);
	let lowerEKeys = ekeys.map(x => x.toLowerCase());
	console.log('dict e=>d', ekeys);

	ensureSymByType();
	let keys = symKeysByType['icon']; //symbolKeys;
	console.log('keys', keys);
	let inter = intersection(keys, lowerEKeys);
	console.log('intersection:', inter);

	//von denen die in der intersection sind, gibt ihnen eine translation to german und save again in symbolDict!

	for (const k of inter) {
		let entry = lookup(EdDict, [k, 'd']);
		if (nundef(entry)) {
			console.log('gibt es nicht!', k)
		} else {
			console.log('entry', entry)
			console.log('JA!', k, entry.join('|'));
			symbolDict[k].D = entry.join('|').toLowerCase();
			symbolDict[k].E = k;
		}
	}
	downloadAsYaml(symbolDict, 'symbolDict');

}
async function loadGerman(justNouns = false) {
	let root = justNouns ? 'Nouns' : 'Dict';
	let ed = await route_path_yaml_dict('../assets/speech/ed' + root + '.yaml');
	let de = await route_path_yaml_dict('../assets/speech/de' + root + '.yaml');
	//alle keys sollen immer lower case sein!

	return [ed, de];

}
function recomputeBestED() {
	for (const k in symbolDict) {
		let info = symbolDict[k];
		if (info.type == 'emo' && isString(info.D) && isString(info.E)) {
			info.bestD = stringAfterLast(info.D, '|').trim().toLowerCase();
			info.bestE = stringAfterLast(info.E, '|').trim().toLowerCase();
		} else if (nundef(info.E) || isNumber(info.E) || isdef(info.bestE)) continue;

		// console.log('info.E', info.E, k);

		if (info.type == 'emo') continue;

		if (info.E.includes('|')) {
			console.log('he das gibt es doch nicht!!!', k, info);
		} else {
			info.bestE = info.E;
		}
		if (nundef(info.D)) {
			console.log('he das gibt es doch nicht!!! KEIN DEUTSCH!', k, info);
		} else {
			info.bestD = stringBefore(info.D, '|').trim().toLowerCase();
		}
	}

	downloadAsYaml(symbolDict, 'sym');

}
function generateWordFiles() {
	let i = 0; let n = 13000; let len = symbolKeys.length;
	while (i < len) {
		wordsFromToText(i, n);
		i += n;
	}
}
function wordsFromToText(i, n = 300) {
	let list = [];
	for (const k in symbolDict) {
		let info = symbolDict[k];
		if (nundef(info.bestE) || !isString(info.bestE) || info.bestE.length < 2) continue;
		addIf(list, info.bestE);
	}
	//divide list into chunks of under 3900 characters each!
	let sfromi = arrFromIndex(list, i);
	s300 = arrTake(sfromi, n);
	let s = s300.join('\n');
	console.log(s);
	downloadTextFile(s, 'words_' + i);
	// downloadTextFile(s1.join('\n'),'words1');
	// downloadTextFile(srest.join('\n'),'words2');

}
async function wegMitwh(){
	let syms = await route_path_yaml_dict('../assets/syms.yaml');
	let newSyms = {};
	for(const k in syms){
		let info = jsCopy(syms[k]);
		info.w=info.w[0];
		info.h=info.h[0];

		newSyms[k]=info;
	}
	downloadAsYaml(newSyms,'syms');
}
async function makeNewSyms() {
	let etext = await route_path_text('../assets/speech/di/_wE.txt');
	// console.log(etext);
	let ew = etext.split('\n');
	console.log('eng', ew);
	let dtext = await route_path_text('../assets/speech/di/_wD.txt');
	let ftext = await route_path_text('../assets/speech/di/_wF.txt');
	let stext = await route_path_text('../assets/speech/di/_wS.txt');
	let ctext = await route_path_text('../assets/speech/di/_wC.txt');
	let dw = dtext.split('\n');
	let fw = ftext.split('\n');
	let sw = stext.split('\n');
	let cw = ctext.split('\n');
	let edict = {};
	for (let i = 0; i < ew.length; i++) {
		edict[ew[i]] = { E: ew[i], D: dw[i], F: fw[i], S: sw[i], C: cw[i] };
	}
	let symNew = {};
	for (const k in symbolDict) {
		let info = symbolDict[k];
		let inew = {};
		for(const k1 of ['key','hexcode','hex','family','text','type','isDuplicate']){
			if (isdef(info[k1])) inew[k1]=info[k1];
		}
		inew.w=info.w;
		inew.h=info.h;
		let wk=inew.E=isdef(info.bestE)?info.bestE:k;
		let e=edict[wk];
		if (isdef(e)){
			inew.D=e.D;
			inew.F=e.F;
			inew.S=e.S;
			inew.C=e.C;
		}
		if (nundef(inew.D) && isdef(info.bestD)) inew.D=info.bestD;
		symNew[k]=inew;
		console.log('key',k,inew)
	}

	return symNew;
}

function startUnit() {

	restartTime();
	U.session = {};
	if (PROD_START) { PROD_START = false; onClickTemple(); } else startGame();

}

function initSymbolTableForGamesAddons() {
	//console.log('DA', DA);//yes this is an empty dict!
	DA.GameClasses = {
		gTouchPic: GTouchPic, gNamit: GNamit,
		gTouchColors: GTouchColors, gPremem: GPremem, gMem: GMem, gMissingLetter: GMissingLetter,
		gMissingNumber: GMissingNumber, gWritePic: GWritePic, gSayPic: GSayPic, gSteps: GSteps, gElim: GElim,
		gAnagram: GAnagram, gAbacus: GAbacus, gPasscode: GPasscode

	}
}


//#endregion

//#region db init (von db.js)
var BlockServerSend = false;
async function dbInit(appName, {usersPath = './users.yaml', settingsPath = './settings.yaml', gamesPath = './games.yaml', tablesPath = './tables.yaml', addonsPath = './addons.yaml'}={}) {
	let users = await loadYamlDict(usersPath);
	let settings = await loadYamlDict(settingsPath);
	let addons = await loadYamlDict(addonsPath);
	let games = await loadYamlDict(gamesPath);
	let tables = isdef(tablesPath)? await loadYamlDict(tablesPath):null;

	DB = {
		id: appName,
		users: users,
		settings: settings,
		games: games,
		tables: tables,
		addons: addons,
	};

	//console.log('...saving from BROADCASTING')
	dbSave(appName);

	if (CLEAR_LOCAL_STORAGE) localStorage.clear();
	await loadBasicAssets('../assets/');
}
async function dbLoad(appName, callback) {
	let url = SERVERURL;
	fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	}).then(async data => {
		let sData = await data.json();

		DB = firstCond(sData, x => x.id == appName);
		//console.log('DB', DB);

		if (CLEAR_LOCAL_STORAGE) localStorage.clear();
		await loadBasicAssets('../assets/');

		if (isdef(callback)) callback();
	});
}
async function dbSave(appName) {
	if (BlockServerSend) {
		//console.log('...wait for unblocked...');
		setTimeout(()=>dbSave(appName), 1000);
	} else {
		//console.log('saving DB:',DB);
		let url = SERVERURL + appName;
		BlockServerSend = true;
		//console.log('blocked...');
		fetch(url, {
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(DB)
		}).then(() => { BlockServerSend = false; }); //console.log('unblocked...'); });
	}
}
async function loadBasicAssets(assetsPath) {
	c52 = await localOrRoute('c52', assetsPath + 'c52_blackBorder.yaml');
	//testCards = await localOrRoute('testCards', assetsPath + 'testCards.yaml');
	cinno = await localOrRoute('cinno', assetsPath + 'fe/inno.yaml');
	//other game data should be loaded here!

	symbolDict = await localOrRoute('symbolDict', assetsPath + 'symbolDict.yaml');
	symbolKeys = Object.keys(symbolDict);
	symbolList = dict2list(symbolDict);
	ensureSymBySet(); makeHigherOrderGroups();

	svgDict = await localOrRoute('svgDict', assetsPath + 'svgDict.yaml'); //TODO: depending on ext, treat other assts as well!
	svgKeys = Object.keys(svgDict);
	svgList = dict2list(svgDict);
}
async function localOrRoute(key, url) {
	if (USE_LOCAL_STORAGE) {
		let x = localStorage.getItem(key);
		if (isdef(x)) return JSON.parse(x);
		else {
			let data = await route_path_yaml_dict(url);
			if (key != 'svgDict') localStorage.setItem(key, JSON.stringify(data));
			return data;
		}
	} else return await route_path_yaml_dict(url);
}








//#endregion
