//#region _DOM constants, shape functions
const MSCATS = { rect: 'g', g: 'g', circle: 'g', text: 'g', polygon: 'g', line: 'g', body: 'd', svg: 'd', div: 'd', p: 'd', table: 'd', button: 'd', a: 'd', span: 'd', image: 'd', paragraph: 'd', anchor: 'd' };
const SHAPEFUNCS = {
	'circle': agCircle,
	'hex': agHex,
	'rect': agRect,
}
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

//#endregion

//#region _DOM 1 liners A list divs
function applyCssStyles(ui, params) {
	let domType = getTypeOf(ui);
	if (domType == 'g') {
		//must apply styles differently or not at all!!!!!
		mStyle(ui, params); //geht ja eh!!!!!!!!!!

	} else {
		//console.log('apply NOW',ui,params)
		mStyle(ui, params);
	}
}
function asElem(x) { return isString(x) ? mBy(x) : x; }
function asList(x) { return isList(x) ? x : [x]; }
function mAppend(d, child) { d.appendChild(child); }
// function mAddLabel(text,dParent,styles){
// 	//if dParent has a height set, need to set to auto!
// 	dParent.style.height='auto';
// 	mText(text,dParent,styles);
// }
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
function mBg(d, color) { d.style.backgroundColor = color; }
function mBy(id) { return document.getElementById(id); }
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
function mNull(d, attr) { d.removeAttribute(attr); }
function mHasClass(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function mClass(d) { for (let i = 1; i < arguments.length; i++) d.classList.add(arguments[i]); }
function mRemoveClass(d) { for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }
function mClassRemove(d) { for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }
function mCreate(tag) { return document.createElement(tag); }
function mDestroy(elem) { if (isString(elem)) elem = mById(elem); purge(elem); } // elem.parentNode.removeChild(elem); }
function mDiv(dParent = null, styles) { let d = mCreate('div'); if (dParent) mAppend(dParent, d); if (isdef(styles)) mStyleX(d, styles); return d; }
function mDiv100(dParent = null) { let d = mDiv(dParent); mSize(d, 100, 100, '%'); return d; }
function mDivPosAbs(x = 0, y = 0, dParent = null) { let d = mCreate('div'); if (dParent) mAppend(dParent, d); mPos(d, x, y); return d; }
function mDivPosRel(x = 0, y = 0, dParent = null) { let d = mCreate('div'); if (dParent) mAppend(dParent, d); mPosRel(d, x, y); return d; }
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
function mLinebreak(dParent, gap) {
	if (isString(dParent)) dParent = mBy(dParent);
	let d = mDiv(dParent);
	//console.log('parent style',dParent.style.display)

	//console.log(dParent.classList, Array.from(dParent.classList))

	if (dParent.style.display == 'flex' || mHasClass(dParent, 'flexWrap')) mClass(d, 'linebreak');
	else d.innerHTML = '<br>';

	if (isdef(gap)) d.style.minHeight = gap + 'px';

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
	mAppend(dParent,d);
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
function mEnsure(d) { return isString(d) ? mById(d) : d; }
function mAppendS(d, child) { d = mEnsure(d); if (d) d.appendChild(child); return child; }
function mAppendText(d, text) { let dText = mCreate('div'); dText.innerHTML = text; d.appendChild(dText); return dText; }
function mAppendTextS(d, text) { let dText = mCreate('div'); dText.innerHTML = text; mAppendS(d, dText); return dText; }
function mAppPos(d, child) { d.style.position = 'relative'; return mAppend(d, child); }
function mAppPosS(d, child) { d = ensure(d); d.style.position = 'relative'; return mAppend(d, child); }
function mBox(w, h, color, dParent = null) { let d = mDiv(dParent); return mStyle(d, { 'background-color': color, position: 'absolute', display: 'inline', width: w, height: h }); }

function mById(id) { return document.getElementById(id); }
function computeColor(c) { return (c == 'random') ? randomColor() : c; }
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
function mColor(d, bg, fg) { return mStyle(d, { 'background-color': bg, 'color': fg }); }
function mRemove(elem) { mDestroy(elem); }
//function onMouseEnter(d, handler = null) { d3.on('mouse') }
function mFont(d, fz) { d.style.setProperty('font-size', makeUnitString(fz, 'px')); }
function mGap(d, gap) { d.style.setProperty('margin', gap + 'px'); }
//function mPosAbs(d) { return mStyle(d, { position: 'absolute' }); }
function mSzPic(d, sz, unit = 'px') { return mSizePic(d, sz, sz, unit); }
function mStyleS(elem, styles, unit = 'px') { elem = mEnsure(elem); for (const k in styles) { elem.style.setProperty(k, makeUnitString(styles[k], unit)); } return elem; }
//#endregion

//#region 1 liners positioning_...
function posTL(d) { mPos(d, 0, 0) }
function posTR(d) { mStyle(d, { right: 0, top: 0, position: 'absolute' }); }
function posBL(d) { mStyle(d, { left: 0, bottom: 0, position: 'absolute' }); }
function posBLR(d) { mStyle(d, { left: 0, bottom: 0, position: 'absolute' }); mRot(d, 180); }
function posBR(d) { mStyle(d, { right: 0, bottom: 0, position: 'absolute' }); }
function posBRR(d) { mStyle(d, { right: 0, bottom: 0, position: 'absolute' }); mRot(d, 180); }
function posCIC(d) { d = mEnsure(d); d.classList.add('centerCentered'); }
function posCICT(d) { d = mEnsure(d); d.classList.add('centerCenteredTopHalf'); }
function posCICB(d) { d = mEnsure(d); d.classList.add('centerCenteredBottomHalf'); }
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
		// do I need to remove all pos info from element??? YES!!!
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
function show(elem,isInline=false) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:visible');
	} else {
		elem.style.display = isInline?'inline-block':null;
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
	return getFunctionsNameThatCalledThisFunction.caller.caller.name;
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
function calcRowsColsX(num) {
	const table = {
		2: { rows: 1, cols: 2 },
		5: { rows: 2, cols: 3 },
		7: { rows: 2, cols: 4 },
		11: { rows: 3, cols: 4 },
	};
	if (isdef(table[num])) return table[num]; else return calcRowsCols(num);
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
function mergeCombineArrays(base, drueber) {
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
function range(f, t, st = 1) {
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
			} else {
				if (max == null || v > max) {
					max = v;
					imax = i;
				}
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
		if (e === undefined) return null;
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

		if (d[k] === undefined) d[k] = {};

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
function nRandomNumbers(n, from, to, step) {
	let arr = range(from, to, step);
	return choose(arr, n);
}
function choose(arr, n) {


	//console.log(arr, n);
	var result = [];//new Array(n);
	var len = arr.length;
	var taken = new Array(len);
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
function coin() { return tossCoin(50); }
function yesNo() { return tossCoin(50); }
//#endregion

//#region string functions
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
	return s.match(/\-.\d+|\-\d+|\.\d+|\d+\.\d+|\d+\b|\d+(?=\w)/g).map(v => Number(v));
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
function hasWhiteSpace(s) { return /\s/g.test(s); }
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
};
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







