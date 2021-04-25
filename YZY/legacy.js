//#region layout helpers + present00
function _bestRowsColsFill(items, options) {
	let combis = _getSLCombis(items.length, options.isRegular);

	//console.log('combis', combis);

	let wa = options.area.w, ha = options.area.h, wp = options.szPic.w, hp = options.szPic.h;
	let rows, cols;
	cols = wa / wp;
	rows = ha / hp;
	//console.log('====>', rows, cols)
	let aRatio = cols < rows ? cols / rows : rows / cols;
	options.or = cols < rows ? 'P' : 'L';
	//console.log('options.or', options.or);
	let rmin = 20000, best;
	for (const r of combis) {
		let rnew = Math.abs(aRatio - r.s / r.l);
		//console.log('aRatio', aRatio, 'combi', r.s, r.l, r.s / r.l, 'diff', rnew);
		if (rnew < rmin) { rmin = rnew; best = r; }
	}
	//console.log('best', best);
	if (options.or == 'P') { rows = best.l; cols = best.s; } else { rows = best.s; cols = best.l; }

	//console.log('=>rows', rows, 'cols', cols, res);
	let [w, h] = [options.szPic.w, options.szPic.h] = [wa / cols, ha / rows];
	return [rows, cols, w, h, options.or];
}
function _bestRowsColsSizeWH(items, wTotal, hTotal, options) {
	let combis = _getSLCombis(items.length, options.isRegular, true);
	//combis.map(x => console.log(x));

	options.szPicTest = { w: options.szPic.w, h: options.szPic.h };
	let bestCombi = safeLoop(_findBestCombiOrShrinkWH, [items, wTotal, hTotal, options, combis]);

	//console.log('--------BEST:', bestCombi.rows, bestCombi.cols, options.szPic, options.szPicTest);
	let [rows, cols, w, h] = [bestCombi.rows, bestCombi.cols, options.szPicTest.w, options.szPicTest.h]
	delete options.szPicTest;
	return [rows, cols, w, h, rows < cols ? 'L' : 'P'];
}
function _findBestCombiOrShrinkWH(items, wTotal, hTotal, options, combis) {
	bestCombi = firstCond(combis, x => wTotal / x.cols > options.szPicTest.w && hTotal / x.rows > options.szPicTest.h);
	if (isdef(bestCombi)) return bestCombi;
	options.szPicTest = { w: .9 * options.szPicTest.w, h: .9 * options.szPicTest.h };//otherwise, have to reduce the size
	return null;
}
function _bestRowsColsSize(items, options) {
	let combis = _getSLCombis(items.length, options.isRegular, true);
	//combis.map(x => console.log(x));

	options.szPicTest = { w: options.szPic.w, h: options.szPic.h };
	let bestCombi = safeLoop(_findBestCombiOrShrink, [items, options, combis]);

	//console.log('--------BEST:', bestCombi.rows, bestCombi.cols, options.szPic, options.szPicTest);
	let [rows, cols, w, h] = [bestCombi.rows, bestCombi.cols, options.szPicTest.w, options.szPicTest.h]
	delete options.szPicTest;
	return [rows, cols, w, h, rows < cols ? 'L' : 'P'];
}
function _calcFontPicFromText(options, overrideExisting = true) {
	if (nundef(options.fzPic) || overrideExisting) options.fzPic = Math.floor(options.fzText * 4 * (options.luc == 'u' ? .7 : .6)); //taking 4 as min word length
	return options.fzPic;
}
function _calcPadGap(p, w, h) {
	if (isString(p)) { // has a %
		let pad = Math.min(w, h) * firstNumber(p) / 100;
		console.log('pad', padding);
		return pad;
	} else if (p > 0 && p < 1) return Math.min(w, h) * p;
	else return p;
}
function _centerGridVerticallyWithinArea(items, options) {
	let dGrid = mBy(options.idGrid);
	let dArea = mBy(options.idArea);
	let gRect = getRect(dGrid);
	let aRect = getRect(dArea);
	let itemRect = getRect(lDiv(items[0]));
	let [gsz, asz, itemsz] = [rectToSize(gRect), rectToSize(aRect), rectToSize(itemRect)]

	//console.log('grid:',gsz,'area',asz,'item',itemsz);
	let extra = options.area.h - gRect.h;
	let pv = valf(options.percentVertical, 50);

	let matop = extra * pv / 100;
	mStyleX(dGrid, { matop: matop });
	mReveal(dMain);
}

function _checkOverflow(items, options, dGrid) {
	console.log('exec...')
	if (isOverflown(dGrid)) { _sizeByFactor(items, options, dGrid, .99); }

}
function _checkOverflowPixel(items, options, dGrid) {
	console.log('exec...')
	if (isOverflown(dGrid)) { _sizeByPixel(items, options, dGrid, -1); }


}
function _handleEvent(ev) { ev.cancelBubble = true; return evToItem(ev); }
function _standardHandler(handler) {
	let f = isdef(handler) ?
		ev => { ev.cancelBubble = true; let res = handler(ev, evToItem(ev)); } //console.log('clicked', evToItem(ev).key, 'res', res); }
		: ev => { ev.cancelBubble = true; console.log('clicked on', evToClosestId(ev), evToLive(ev), evToItem(ev)); };
	return f;
}
function _extendOptions(options, defOptions, createArea = true) {
	defOptions = {
		wper: 96, hper: 96, dParent: dTable,
		showPic: true, szPic: { w: 120, h: 120 }, bg: 'random', fg: 'white', margin: 4, rounding: 6,
		showLabels: true, luc: 'l', labelPos: 'bottom', lang: 'E', keySet: 'all',
		fzText: 20, fzPic: 60,
		padding: .025, gap: .1, isUniform: true, isRegular: false, fillArea: true,
		shufflePositions: false, sameBackground: true, showRepeat: false, repeat: 1,
		contrast: .32,
		ifs: {},
		handler: _standardHandler,
	};

	addKeys(defOptions, options);

	if (createArea && nundef(options.dArea)) {
		if (isdef(options.wArea) && isdef(options.hArea)) {
			options.dArea = getMainArea(options.dParent, { w: options.wArea, h: options.hArea });
		} else if (isdef(options.areaPadding)) {
			options.dArea = getMainAreaPadding(options.dParent, padding = options.areaPadding);
		} else options.dArea = getMainAreaPercent(options.dParent, null, options.wper, options.hper, getUID());
		options.area = getRect(options.dArea);
		options.idArea = options.dArea.id;
		options.aRatio = options.area.w / options.area.h;
		options.containerShape = options.area.w > options.area.h ? 'L' : 'P';
	}

	if (options.repeat > 1 && nundef(options.ifs.bg)) {
		let bg = isdef(options.colorKeys) ? 'white' : (i) => options.sameBackground ? computeColor('random') : 'random';
		let fg = isdef(options.colorKeys) ? 'black' : 'white';
		options.ifs.bg = bg;
		options.ifs.fg = fg;
	}

	_calcFontPicFromText(options, false);

	if (nundef(options.labelStyles)) options.labelStyles = {};

	if (options.showLabels) {
		if (options.labelPos == 'bottom') options.labelBottom = true; else options.labelTop = true;
		options.labelStyles.fz = options.fzText;
	}

	options.picStyles = { fz: options.fzPic };

	let [w, h] = [options.szPic.w, options.szPic.h];
	options.outerStyles = {
		w: w, h: h, bg: options.bg, fg: options.fg,
		display: 'inline-flex', 'flex-direction': 'column',
		'justify-content': 'center', 'align-items': 'center', 'vertical-align': 'top',
		//'place-content': 'center',
		padding: 0, box: true, margin: options.margin, rounding: options.rounding,
	};

	return options;
}
function _extendOptions_0(dArea, options, defOptions) {
	defOptions = {
		szPic: { w: 100, h: 100 },
		showLabels: true, maxlen: 25, luc: 'c', labelPos: 'bottom', lang: 'D',
		fzText: 20, fzPic: 60,
		padding: .025, gap: .1, isUniform: true, isRegular: true, fillArea: false,
		shufflePositions: false, sameBackground: true, showRepeat: false, repeat: 1,
		contrast: .32,
		ifs: {},
		handler: _standardHandler,
	};

	addKeys(defOptions, options);

	if (options.repeat > 1 && nundef(options.ifs.bg)) {
		let bg = isdef(options.colorKeys) ? 'white' : (i) => options.sameBackground ? computeColor('random') : 'random';
		options.ifs.bg = bg;
	}

	_calcFontPicFromText(options, false);
	//_calcPadGap(options, w, h);

	options.area = getRect(dArea);
	options.idArea = dArea.id;
	options.aRatio = options.area.w / options.area.h;
	options.containerShape = options.area.w > options.area.h ? 'L' : 'P';

	if (nundef(options.labelStyles)) options.labelStyles = {};

	if (options.showLabels) {
		if (options.labelPos == 'bottom') options.labelBottom = true; else options.labelTop = true;
		options.labelStyles.fz = options.fzText;
	}

	options.picStyles = { fz: options.fzPic };

	options.outerStyles = {
		bg: 'blue', fg: 'contrast',
		display: 'inline-flex', 'flex-direction': 'column', 'place-content': 'center',
		padding: 0, box: true, rounding: 6,
	};

	return options;
}
function _extendOptionsFillArea(dArea, options) {
	defOptions = {
		szPic: { w: 100, h: 100 },
		showLabels: true, maxlen: 25, padding: .025, gap: .1,
		isUniform: true, fillArea: true,
		fzText: 8, luc: 'c', labelPos: 'bottom', lang: 'E',
	};
	if (nundef(options.fzPic)) options.fzPic = Math.floor(options.fzText * 4 * (options.luc == 'u' ? .7 : .6)); //taking 4 as min word length

	_extendOptions_0(dArea, options, defOptions);

}
function _findBestCombiOrShrink(items, options, combis) {
	bestCombi = firstCond(combis, x => options.area.w / x.cols > options.szPicTest.w && options.area.h / x.rows > options.szPicTest.h);
	if (isdef(bestCombi)) return bestCombi;
	options.szPicTest = { w: .9 * options.szPicTest.w, h: .9 * options.szPicTest.h };//otherwise, have to reduce the size
	return null;
}
function _getSLCombis(n, onlyRegular = false, addColsRows_cr = false) {
	let sq = Math.ceil(Math.sqrt(n));
	let res = [];
	for (let i = 1; i <= sq; i++) {
		let s = i;
		let l = Math.ceil(n / s);
		if (s <= l && s * l >= n) res.push({ s: s, l: l });
	}
	//console.log('res',res)
	if (onlyRegular) res = res.filter(x => x.s * x.l == n);

	if (addColsRows_cr) {
		let resX = [];
		for (const res1 of res) {
			resX.push({ rows: res1.s, cols: res1.l, s: res1.s, l: res1.l, sum: res1.s + res1.l });
			if (res1.s != res1.l) resX.push({ rows: res1.l, cols: res1.s, s: res1.s, l: res1.l, sum: res1.s + res1.l });
		}
		sortBy(resX, 'rows');
		sortBy(resX, 'sum');

		return resX;
	}

	return res;
}
function _getRandomRegularN(from = 2, to = 100) {
	const arr = [2, 3, 4, 6, 8, 9, 12, 15, 16, 20, 24, 30, 36, 40, 42, 44, 48, 56, 64, 72, 84, 96, 100];
	return chooseRandom(arr.filter(x => x >= from && x <= to));
}
function _getRegularN(from = 2, to = 100) {
	const arr = [2, 3, 4, 6, 8, 9, 12, 15, 16, 20, 24, 30, 36, 40, 42, 44, 48, 56, 64, 72, 84, 96, 100];
	return arr.filter(x => x >= from && x <= to);
}
function _genOptions(opt = {}) {
	let defOptions = {
		szPic: { w: 100, h: 100 }, wper: 80, hper: 80, n: 20,
		showLabels: true, maxlen: 25, luc: 'c', labelPos: 'bottom', lang: 'D',
		fzText: 20, fzPic: 60,
		padding: .025, gap: .1, isUniform: true, isRegular: true, fillArea: false,
	};
	addKeys(defOptions, opt);

	if (nundef(opt.dArea)) opt.dArea = getMainAreaPercent(dTable, YELLOW, opt.wper, opt.hper, 'dArea');
	if (nundef(opt.items)) opt.items = genItems(opt.n, opt);
	_calcFontPicFromText(opt, false);

	opt.area = getRect(opt.dArea);
	opt.aRatio = opt.area.w / opt.area.h;
	opt.containerShape = opt.area.w > opt.area.h ? 'L' : 'P';

	if (nundef(opt.labelStyles)) opt.labelStyles = {};
	if (opt.showLabels) {
		if (opt.labelPos == 'bottom') opt.labelBottom = true; else opt.labelTop = true;
		opt.labelStyles.fz = opt.fzText;
	}

	opt.picStyles = { fz: opt.fzPic };

	opt.outerStyles = {
		bg: 'random', display: 'inline-flex', 'flex-direction': 'column', 'place-content': 'center',
		padding: 0, box: true, rounding: 6,
	};

	return opt;
}
function _reduceFontsBy(tx, px, items, options) {

	fz = options.fzText - tx;
	fzPic = options.fzPic - px;
	options.fzPic = options.picStyles.fz = fzPic; //Math.floor(fzPic)
	options.fzText = options.labelStyles.fz = fz; // Math.floor(fz);

	for (const item of items) {
		let ui = item.live;
		if (tx != 0) mStyleX(ui.dLabel, { fz: fz });
		if (px != 0) mStyleX(ui.dPic, { fz: fzPic });
	}
	//console.log('fonts set to', fz, fzPic);
}
function _setTextFont(items, options, fz) {
	options.fzText = options.labelStyles.fz = fz; // Math.floor(fz);
	console.log('items', items)
	items.map(x => { let dl = x.live.dLabel; if (isdef(dl)) dl.style.fontSize = fz + 'px'; });
	//console.log('fonts set to', fz);
}
function _sizeByFactor(items, options, dGrid, factor = .9) {
	console.log('vorher', options.szPic, options.fzText, options.fzPic, options.padding, options.gap);
	w = options.szPic.w * factor;
	h = options.szPic.h * factor;
	fz = options.fzText;// * factor;
	fzPic = options.fzPic * factor;
	options.fzPic = options.picStyles.fz = fzPic; //Math.floor(fzPic)
	options.fzText = options.labelStyles.fz = fz; // Math.floor(fz);
	options.szPic = { w: w, h: h };
	options.padding *= factor;
	options.gap *= factor;
	mStyleX(dGrid, { gap: options.gap / 2 });
	for (const item of items) { let ui = item.live; mStyleX(ui.dLabel, { fz: fz }); mStyleX(ui.div, { padding: options.padding, w: w, h: h }); mStyleX(ui.dPic, { fz: fzPic }); }
	console.log('fonts set to', fz, fzPic);
	console.log('...nachher', options.szPic, options.fzText, options.fzPic, options.padding, options.gap);
}
function _sizeByPixel(items, options, dGrid, factor = -1) {
	console.log('vorher', options.szPic, options.fzText, options.fzPic, options.padding, options.gap);
	w = options.szPic.w + factor;
	h = options.szPic.h + factor;
	fz = options.fzText + factor;
	fzPic = options.fzPic + factor;
	options.fzPic = options.picStyles.fz = fzPic; //Math.floor(fzPic)
	options.fzText = options.labelStyles.fz = fz; // Math.floor(fz);
	options.szPic = { w: w, h: h };
	options.padding += factor;
	options.gap += factor;
	mStyleX(dGrid, { gap: options.gap / 2 });
	for (const item of items) { let ui = item.live; mStyleX(ui.dLabel, { fz: fz }); mStyleX(ui.div, { padding: options.padding, w: w, h: h }); mStyleX(ui.dPic, { fz: fzPic }); }
	console.log('fonts set to', fz, fzPic);
	console.log('...nachher', options.szPic, options.fzText, options.fzPic, options.padding, options.gap);
}
function _reduceSizeBy(tx, px, items, options) {
	w = options.szPic.w - tx;
	h = options.szPic.h - tx;
	fz = options.fzText - tx;
	fzPic = options.fzPic - px;
	options.fzPic = options.picStyles.fz = fzPic; //Math.floor(fzPic)
	options.fzText = options.labelStyles.fz = fz; // Math.floor(fz);
	options.szPic = { w: w, h: h };

	for (const item of items) {
		let ui = item.live;
		if (tx != 0) {
			mStyleX(ui.dLabel, { fz: fz }); mStyleX(ui.div, { w: w, h: h });
		}
		if (px != 0) mStyleX(ui.dPic, { fz: fzPic });
	}
	console.log('fonts set to', fz, fzPic);
}
function _handleTextTooSmall(fz, fzPic, wn, hn, options) {
	console.log('???????fzText too small!!!', fz, 'fzPic', fzPic, 'N=', options.N, !options.isUniform);

	// fzPic = Math.floor(fzPic * .9);
	// fz = Math.floor(hn - fzPic * 1.25);

	fz = Math.ceil(fz + 2);
	fzPic = Math.floor(Math.min(hn - fz * 1.5, fz * 3));


	// let f=3;
	// fz = Math.floor(fzPic / f);
	// fzPic = fz*f;

	//fzPic=
	// fz = Math.floor(hn / 4); fzPic = fz * 2;
	options.fzPic = options.picStyles.fz = fzPic; //Math.floor(fzPic)
	options.fzText = options.labelStyles.fz = fz; // Math.floor(fz);
}
function _makeGridGrid(items, options, dGrid, showBorder = false) {
	let wcol = options.isUniform ? '1fr' : 'auto';
	let display = options.fillArea ? 'grid' : 'inline-grid';
	mStyleX(dGrid, {
		display: display,
		'grid-template-columns': `repeat(${options.cols}, ${wcol})`,
		gap: options.gap,
		box: true
	});
	if (showBorder) mStyleX(dGrid, { border: '5px solid yellow' });
}
function _makeNoneGrid(items, options, dGrid) {
	options.szPic = { w: options.area.w / options.cols, h: options.area.h / options.rows };
	//console.log('fonts vor set', options.fzPic, options.fzText)
	_setRowsColsSize(options);
	//console.log('fonts nach set', options.fzPic, options.fzText)
	for (const item of items) {
		let live = item.live;
		if (options.isUniform) {
			mStyleX(live.div, { w: options.szPic.w, h: options.szPic.h, margin: options.gap / 2, padding: options.padding / 2 });
		} else {
			mStyleX(live.div, { margin: options.gap / 2, padding: options.padding });

			//es gibt noch mehr platz!
			//versuche zu grown!
		}
		mStyleX(live.dLabel, { fz: options.fzText });
		mStyleX(live.dPic, { fz: options.fzPic });
	}

	mStyleX(dGrid, { padding: 0, border: '5px solid blue', box: true })
	let ov = getVerticalOverflow(dGrid);
	//console.log('==>MakeNone: overflow:', ov, Math.floor(ov), Math.floor(ov) == 0, Math.floor(ov) <= 0);
	//return;
	if (Math.floor(ov) == 0 && !options.isUniform) {
		//console.log('in makeNoneGrid!!!')
		_tryGrow(items, options);
	}

	// let [fz,fzPic]=_sizeToFonts(options);
	// console.log('haaaaaaaaaaaaaa',options.padding,options.gap);
	// options.padding=100;options.gap=50;
	// for (const it of items) { mStyleX(lDiv(it), { margin: options.gap / 2, padding: options.padding/2 }); }
	// mStyleX(dGrid, { border: '5px solid blue', box: true })
	// let ov = getVerticalOverflow(dGrid);
	if (ov > 0) {
		//console.log('=========>>>>>>overflow!!!!!', ov); return;
		options.fzPic = options.picStyles.fz = options.fzPic * .9;//*fact;
		//console.log('options', options.fzPic, options)
		for (const it of items) { mStyleX(lGet(it).dPic, { fz: options.fzPic }); }
		ov = getVerticalOverflow(dGrid);
		let newGap = Math.ceil(options.gap / 2);
		while (ov > 0) {

			//let pad = Math.max(ov / (options.rows * 2 + 1), options.gap / 4);
			//let newGap = Math.ceil(Math.max(1, options.gap / 2 - pad));
			//console.log('gap', options.gap / 2, 'newGap', newGap)
			for (const it of items) { mStyleX(lDiv(it), { fz: 4, margin: newGap, padding: newGap / 2, rounding: 0 }); }
			ov = getVerticalOverflow(dGrid);
			if (ov && newGap == 1) {
				for (const it of items) { mStyleX(lDiv(it), { margin: 0, padding: 0 }); }
				break;
			}
			newGap = Math.ceil(newGap / 2);
		}

	}
}
function _setRowsColsSize(options) {
	let [rows, cols, wb, hb] = [options.rows, options.cols, options.szPic.w, options.szPic.h];
	options.or = rows < cols ? 'L' : 'P'
	let gap = options.gap = _calcPadGap(options.gap, wb, hb);
	let [wOffset, hOffset] = [gap / cols, gap / rows];
	let offset = Math.max(wOffset, hOffset, gap * .25);
	let w = wb - gap - offset, h = hb - gap - offset; //w = wb - gap * 1.25, h = hb - gap * 1.25;

	options.szPic.w = w;
	options.szPic.h = h;
	options.padding = _calcPadGap(options.padding, w, h);
	options.outerStyles.padding = options.padding;

	let wn = w - options.padding * 2;
	let hn = h - options.padding * 2;

	let fz = options.showLabels == true ? (wn / options.longestLabelLen) * (options.luc != 'u' ? 1.9 : 1.7) : 0; //set font size for uniform: needs to match longest label
	let fzPic = Math.min(wn / 1.3, (hn - fz * 1.2) / 1.3);
	if (fzPic < fz * 2) { fz = Math.floor(hn / 4); fzPic = fz * 2; }
	let fzTest = Math.min(hn / 3, idealFontDims(options.longestLabel, wn, hn - fzPic, fz, 4).fz);//set font size for uniform: needs to match longest label
	options.fzPic = options.picStyles.fz = Math.floor(fzPic)
	options.fzText = options.labelStyles.fz = options.isUniform ? Math.min(Math.floor(fz), Math.floor(fzTest)) : Math.floor(fz);

	if (!options.isUniform && fz < 6 && fz * 4 < fzPic) { _handleTextTooSmall(fz, fzPic, wn, hn, options); }
}
function _tryGrow(items, options) {
	//console.log('waaaaaaaaaaaaas?')
	let again = false;
	let lastItem = items[items.length - 1];
	let rect = getRect(lDiv(lastItem));
	let bottom = rect.y + rect.h;
	let hArea = options.area.h;
	if (hArea > rect.h + 2 * options.gap) {
		//make fonts larger and try again
		fz = options.fzText + 1;
		fzPic = options.fzPic + 2;
		options.fzPic = options.picStyles.fz = fzPic;
		options.fzText = options.labelStyles.fz = fz;
		for (const item of items) {
			let live = item.live;
			mStyleX(live.dLabel, { fz: options.fzText });
			mStyleX(live.dPic, { fz: options.fzPic });
		}

		let ov = getVerticalOverflow(mBy(options.idGrid));
		//console.log('==>try grow! overflow:', ov, Math.floor(ov), Math.floor(ov) == 0, Math.floor(ov) <= 0);
		if (Math.floor(ov) <= 0) again = true; else again = false;
	}
	if (again) _tryGrow(items, options);
	else {

		fz = options.fzText - 1;
		fzPic = options.fzPic - 2;
		options.fzPic = options.picStyles.fz = fzPic;
		options.fzText = options.labelStyles.fz = fz;
		for (const item of items) {
			let live = item.live;
			mStyleX(live.dLabel, { fz: options.fzText });
			mStyleX(live.dPic, { fz: options.fzPic });
		}

	}

}

function present00(items, options) {
	//[options.rows, options.cols, options.szPic.w, options.szPic.h] = _bestRowsColsSize(items, options);

	[options.rows, options.cols, options.szPic.w, options.szPic.h] = [10, 10, 50, 50];

	console.log('present00: rows', options.rows, 'cols', options.cols);

	let fzOrig = options.fzOrig = options.fzText;
	//console.log('fzText',options.fzText)
	_setRowsColsSize(options);

	makeItemDivs(items, options);

	if (options.fixTextFont == true) {
		_setTextFont(items, options, (options.fzOrig + options.fzText) / 2);
		//console.log('fzText',options.fzText)
	}

	//console.log('fzText',options.fzText)

	let dGrid = mDiv(options.dArea, { hmax: options.area.h, fz: 2, padding: options.gap }, getUID());

	options.idGrid = dGrid.id;
	for (const item of items) { mAppend(dGrid, iDiv(item)); }
	_makeGridGrid(items, options, dGrid);
	//console.assert(!isOverflown(dGrid), '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
	//console.log('fzText',options.fzText)
	// options.fzOrig = options.fzText;

	let wa = options.area.w, ha = options.area.h;
	let wi = (wa / options.cols) - 1.25 * options.gap;
	let hi = ha / options.rows - 1.25 * options.gap;
	wi = Math.min(200, wi); wi = Math.round(wi);
	hi = Math.min(200, hi); hi = Math.round(hi);
	let fzMax, fpMax;
	if (options.showLabels) {
		// fzMax = Math.floor(idealFontDims(options.longestLabel, wi - 2 * Math.ceil(options.padding), hi, 24).fz);
		fzMax = Math.floor(idealFontDims(options.wLongest, wi - 2 * options.padding, hi, 24).fz); //or longestLabel!
		fpMax = options.showPic ? Math.min(hi / 2, wi * 2 / 3, hi - fzMax) : 0;
	} else { fzMax = 1; fpMax = options.showPic ? Math.min(hi * 2 / 3, wi * 2 / 3) : 0; }
	//let fpMax = Math.min(hi / 2, wi * 2 / 3, hi - fzMax);
	//console.log('===>pad', options.padding, 'wi', wi, idealFontDims(options.longestLabel, wi, hi, 24));
	//console.log('====>item size', wi, hi, 'fz', fzMax, 'fzPic', fpMax, 'lw', options.longestLabel, options.wLongest);
	//console.log('===>pad', options.padding, 'wi', wi, 'wnet',wi-2*options.padding, 'fz',fzMax );

	options.fzPic = options.picStyles.fz = fpMax; //Math.floor(fzPic)
	options.fzText = options.labelStyles.fz = fzMax; // Math.floor(fz);
	options.szPic = { w: wi, h: hi };

	for (const item of items) {
		let ui = item.live;
		mStyleX(ui.div, { wmin: wi, hmin: hi, padding: 0 });
		// mStyleX(ui.dPic, { fz: hi/2 }); 
		if (isdef(ui.dPic)) mStyleX(ui.dPic, { fz: fpMax });
		if (isdef(ui.dLabel)) mStyleX(ui.dLabel, { fz: fzMax });
	}
	//console.log('fzText',options.fzText);

	if (options.fzText < options.fzOrig && options.fixTextFont == true) _setTextFont(items, options, (options.fzOrig + options.fzText) / 2)

	mStyleX(dGrid, { display: 'inline-grid', wmax: options.area.w, hmax: options.area.h });

	//_checkOverflow(items, options, dGrid);
	if (isOverflown(dGrid)) {
		let factor = .9;
		//console.log('OVERFLOWN!!!!!!!!!!!! vorher', options.szPic, options.fzText, options.fzPic, options.padding, options.gap);
		w = options.szPic.w * factor;
		h = options.szPic.h * factor;
		fz = options.fzText * factor; // idealFontDims(options.longestLabel, w, h, 22).fz; //options.fzText;// * factor;
		fzPic = options.fzPic * factor;
		options.fzPic = options.picStyles.fz = fzPic; //Math.floor(fzPic)
		options.fzText = options.labelStyles.fz = fz; // Math.floor(fz);
		options.szPic = { w: w, h: h };
		options.padding *= factor;
		options.gap *= factor;
		mStyleX(dGrid, { gap: options.gap / 2 });
		for (const item of items) {
			let ui = item.live;
			if (options.showLabels) mStyleX(ui.dLabel, { fz: fz });
			mStyleX(ui.div, { padding: options.padding, w: w, h: h });
			mStyleX(ui.dPic, { fz: fzPic });
		}
		//console.log('fonts set to', fz, fzPic);
		//console.log('...nachher', options.szPic, options.fzText, options.fzPic, options.padding, options.gap);
	}

	//console.log('fzText',options.fzText)

	return [items, options];

}
//#endregion

//#region layouts
function layoutGrid(elist, dGrid, containerStyles, { rows, cols, isInline = false } = {}) {
	console.log('layoutGrid in _legacy!')
	let dims = calcRowsCols(elist.length, rows, cols);
	//console.log('dims', dims);

	let parentStyle = jsCopy(containerStyles);
	parentStyle.display = isInline ? 'inline-grid' : 'grid';
	parentStyle['grid-template-columns'] = `repeat(${dims.cols}, auto)`;
	parentStyle['box-sizing'] = 'border-box'; // TODO: koennte ev problematisch sein, leave for now!

	//console.log('parentStyle', parentStyle)

	mStyleX(dGrid, parentStyle);
	let b = getRect(dGrid);
	return { w: b.w, h: b.h };

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
	let b = getRect(dGrid);
	return { w: b.w, h: b.h };

}
//#endregion

//#region page 
function initSidebar1() {
	show(dSidebar);
	clearElement(dSidebar);
	mDiv(dSidebar, { 'min-width': 50, 'max-height': '100vh', display: 'flex', 'flex-flow': 'column wrap', 'align-content': 'center' }, 'dLeiste');
}

function get3ColLineName(dParent, name, styles = {}) {
	name = 'd' + capitalize(name);
	let dLine = get3ColLine(dParent, name + 'Left', name, name + 'Right', styles);
	return dLine;
}
function get3ColLine(dParent, idleft, idmiddle, idright, styles = {}) {
	let dOuter = mDiv(dParent);

	let middleStyles = { fz: styles.fz, family: styles.family };
	delete styles.fz; delete styles.family;
	styles = mergeOverride({ wmin: '100%', hmin: 30, vpadding: 4, hpadding: 10, box: true }, styles);
	//console.log(jsCopy(styles))
	mStyleX(dOuter, styles);

	// mStyleX(dOuter, { wmin: '100%', vpadding: 4, hpadding: 10, box: true, h: 30 });

	let dInner = mDiv(dOuter, { position: 'relative' });

	let l = mDiv(dInner, { family: 'arial', fz: 16, display: 'inline-block', position: 'absolute', wmin: 20 }, idleft)
	let m = mDiv(dInner, { fz: middleStyles.fz, family: middleStyles.family, w: '100%', align: 'center' }, idmiddle);
	let r = mDiv(dInner, { family: 'arial', fz: 16, display: 'inline-block', position: 'absolute', wmin: 20, top: 0, right: 0 }, idright);

	//mBy(idright).innerHTML=idright;console.log('????????????????????');

	return dOuter;
}
function getArea(dParent, styles, id) {
	let defStyles = { display: 'inline-block' };
	styles = mergeOverride(defStyles, styles);
	let d = mDiv(dParent, styles, id);

	return d;
}
function getMainArea(dParent, styles = {}) {
	clearElement(dParent);
	let dArea = getArea(dParent, styles);
	return dArea;

}
function getMainAreaPadding(dParent, padding = 10, bg = 'grey', styles = {}) {
	let aTable = percentOf(dParent, 100, 100);
	//console.log('in getMainAreaPadding',aTable);
	//let defAreaStyles = { w: aTable.w - padding, h: aTable.h - padding/2, bg: bg, layout: 'hcc',  };
	let defAreaStyles = { margin: padding, w: aTable.w - 2 * padding, h: aTable.h - 2 * padding, bg: bg, layout: 'hcc', };
	clearElement(dParent);
	let dArea = getArea(dParent, mergeOverride(defAreaStyles, styles));
	return dArea;

}
function getMainAreaPercent(dParent, bg = 'grey', wPercent = 94, hPercent = 96, id) {
	//console.log('clearing parent',dParent)
	clearElement(dParent);
	let aTable = percentOf(dParent, wPercent, hPercent); //getRect(dTable);
	let dArea = getArea(dParent, { w: aTable.w, h: aTable.h, layout: 'hcc', bg: bg }, id);
	return dArea;

}
function initTable() {
	clearElement(dTableBackground);
	setTableBackground(RED, 'white', true);
	//title line
	let ltitle = get3ColLineName(dTableBackground, 'title', { hmin: 30 });//, bg:BLUE});
	mStyleX(dTitle, { maleft: -50 })
	let ltable = get3ColLineName(dTableBackground, 'table', {});
	let lbottom = get3ColLineName(dTableBackground, 'bottom', { position: 'absolute', bottom: 30 });
	// dTitle.innerHTML='HALLO';
	// dBottom.innerHTML='<p>Hallo das ist ein neues message</p>'
}
function setPageBackground(bg, fg = 'white', isBase = true) {
	bg = colorHex(bg);
	//console.log('setting bg to', bg)
	if (isBase) DA.pageBaseColor = bg;
	mStyleX(dMain, { bg: bg, fg: isdef(fg) ? fg : 'contrast' });
}
function setTableBackground(bg, fg = 'white', isBase = true) {
	bg = colorHex(bg);
	//console.log('setting bg to', bg)
	if (isBase) DA.tableBaseColor = bg;
	mStyleX(dTableBackground, { bg: bg, fg: isdef(fg) ? fg : 'contrast' });
}
function addDummy() {
	let b = mButton('', null, dTitleRight, { opacity: 0, h: 0, w: 0, padding: 0, margin: 0, outline: 'none', border: 'none', bg: 'transparent' });
	b.id = 'dummy';
	// let b=createElementFromHTML(`<button id="dummy" style="height: 0px; width: 0px; padding: 0; margin: 0; border: none; outline: none; background-color: transparent; color: transparent">dummy</button>`);
	// mAppend(dFooterLeft,b);

}

function toggleTheme() {
	let bg = colorHex(dMain.style.backgroundColor);
	let lum = getBrightness(bg);
	console.log('current:\nbg', bg, '\nbaseColor', DA.pageBaseColor, '\nlum', lum);
	if (bg != DA.pageBaseColor) setPageBackground(DA.pageBaseColor, 'white', false);
	else if (lum <= .5) setPageBackground(colorLighter(bg), 'black', false);
	else setPageBackground(colorDarker(bg, 1), 'white', false);
}
function setTheme_dep(isDark = true) {
	let bg = dMain.style.backgroundColor;
	let lum = getBrightness(bg);
	console.log('bg is', bg, 'lum', lum)
	if (isDark) {
		if (lum < .5) return;
		else {
			bg = colorDarker(bg);
			setPageBackground(bg);
			// mStyleX(dMain, { bg: bg });
			// let fg = 'pink';
			// let flum = getBrightness(fg);
			// console.log('background:', bg, 'lum:', lum, 'fg', fg, 'lum:', flum);
			// //let fg = 
			// //meaureLuminosity of bg
		}
	} else if (lum > .5) return; else { setPageBackground(colorLighter(bg)); }

}

//#old prefabs
function createSubtitledPage(bg = 'silver', title = 'Aristocracy', subtitle = '', footer = 'a game by F. Ludos') {

	setPageBackground(bg);
	createPageDivsFullVisibleArea({
		title: { h: 42, family: 'AlgerianRegular', fz: 36 },
		subtitle: { h: 30, fz: 16 },
		titleLine: { h: 5, bg: '#00000080' },
	}, { bg: '#00000050' }, { footer: { h: 30, fz: 16 } }, {}); //table is above footer
	dTitle.innerHTML = title;
	dSubtitle.innerHTML = subtitle;
	dFooter.innerHTML = footer;

	addDummy();
}
function createPageDivsFullVisibleArea(above, tableStyles, below, defs = { bg: 'random', fg: 'contrast' }) {
	//console.log('defs',defs)
	clearElement(dMain);
	let dRightSide = mDiv(dMain, { display: 'flex', 'flex-direction': 'column', 'flex-grow': 10 });

	let table = mDiv(dRightSide, {}, 'table'); //table.innerHTML='hallo';

	for (const k in above) {
		let name = 'd' + capitalize(k);
		let ltop = get3ColLine(table, name + 'Left', name, name + 'Right', mergeOverride(defs, above[k]));
	}

	//sum up total heights of above,below
	let vals = Object.values(above);
	vals = vals.concat(Object.values(below));
	//console.log('vals', vals)
	let sum = arrSum(vals, 'h');
	let sum1 = arrSum(vals, 'hmin');
	console.log('sum', sum, 'sum1', sum1);
	sum += sum1;
	// console.log('total height of lines is',sum)
	let hTable = percentVh(100) - sum;// + 4;//??????? //die 10 sind abstand von footer, die 30 sind footer
	let wTable = percentVw(100) - 20; //die 20 sind padding (je 10) von get3ColLine
	if (nundef(tableStyles)) tableStyles = {};
	tableStyles = mergeOverride({ bg: 'dimgray', w: wTable, h: hTable, vpadding: 0, hpadding: 0 }, tableStyles);
	let ltable = get3ColLine(table, 'dTableLeft', 'dTable', 'dTableRight', tableStyles);
	ltable.id = 'lTable';
	mSize(dTable.parentNode, '100%', '100%');
	mSize(dTable, '100%', '100%');

	console.log('below', below);
	for (const k in below) {
		let name = 'd' + capitalize(k);
		let lbottom = get3ColLine(table, name + 'Left', name, name + 'Right', mergeOverride(defs, below[k]));
	}
	// let lfooter = get3ColLine(table, 'dFooterLeft', 'dFooterMiddle', 'dFooterRight', { bg: 'orange' });
	dFooter.innerHTML = 'HALLO'; //mStyleX(lfooter, { bottom: 0 })

	let rect = getRect(dTable);
	return rect;
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

function calcRowsColsX(num, rows, cols) {
	const tableOfDims = {
		2: { rows: 1, cols: 2 },
		5: { rows: 2, cols: 3 },
		7: { rows: 2, cols: 4 },
		11: { rows: 3, cols: 4 },
		40: { rows: 5, cols: 8 },
	};
	if (isdef(rows) || isdef(cols)) return calcRowsCols(num, rows, cols);
	else if (isdef(tableOfDims[num])) return tableOfDims[num];
	else return calcRowsCols(num, rows, cols);
}
function calcRowsCols(num, rows, cols) {
	//=> code from RSG testFactory arrangeChildrenAsQuad(n, R);
	//console.log(num, rows, cols);
	const table = {
		2: { rows: 1, cols: 2 },
		5: { rows: 2, cols: 3 },
		7: { rows: 2, cols: 4 },
		11: { rows: 3, cols: 4 },
	};
	let shape = 'rect';
	if (isdef(rows) && isdef(cols)) {
		//do nothing!
	} else if (isdef(table[num])) {
		return table[num];
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
function getGameValues() {
	let user = U.id;
	let game = G.id;
	let level = G.level;

	let settings = { numColors: 1, numRepeat: 1, numPics: 1, numSteps: 1, colors: ColorList }; // general defaults
	settings = mergeOverride(settings, DB.settings);
	if (isdef(U.settings)) settings = mergeOverride(settings, U.settings);
	if (isdef(DB.games[game])) settings = mergeOverride(settings, DB.games[game]);
	let next = lookup(DB.games, [game, 'levels', level]); if (next) settings = mergeOverride(settings, next);
	next = lookup(U, ['games', game]); if (next) settings = mergeOverride(settings, next);
	next = lookup(U, ['games', game, 'levels', level]); if (next) settings = mergeOverride(settings, next);

	//console.log(settings);
	delete settings.levels;
	Speech.setLanguage(settings.language);

	return settings;
}








