//#region layout helpers
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
		'justify-content': 'center', 'align-items': 'center','vertical-align':'top',
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



