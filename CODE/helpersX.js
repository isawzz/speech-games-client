//#region doc
/*
	helpersX.js contains super special helper library! (version iii)
*/
//#endregion
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
			//console.log('________________________YES!')
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
