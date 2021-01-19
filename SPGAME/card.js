function compose(itop,ichild,x,y){
	mPosAbs()
}



function cardInnoz(key, wCard = 420) {
	if (nundef(key)) key = chooseRandom(Object.keys(cinno));

	let f=wCard/420;
	let [w,h,szSym,paSym,fz,pa,bth,vGapTxt,rnd,gap]=[420*f,200*f,50*f,8*f,50*f*.8,20*f,4*f,8*f,10*f,6*f].map(x=>Math.ceil(x));
	
	//key = 'Flight';
	let info = cinno[key];	info.key = key;

	let cdict = { red: 'red1', blue: 'blue1', green: 'green1', yellow: 'yellow1', purple: 'purple' }
	info.c = colorDarker(ColorDict[cdict[info.color]].c, .6);

	//make empty card with dogmas on it
	let d = mDiv();
	mSize(d, w, h);
	//let szSym = 50; let fz = szSym * .8;

	mStyleX(d, { fz:pa, margin: 8, align: 'left', bg: info.c, rounding: rnd, patop: paSym, paright: pa, pabottom: szSym, paleft: szSym + paSym, border: ''+bth+'px solid silver', position: 'relative' })
	mText(info.key.toUpperCase(), d, { fz: pa, weight: 'bold', margin: 'auto' });
	mLinebreak(d);
	for (const dog of info.dogmas) {
		//console.log(dog);
		let d1 = mText(dog, d); //,{mabot:14});
		d1.style.marginBottom = ''+vGapTxt+'px';
		//mLinebreak(d);
	}

	let syms = []; let d1;

	szSym -= gap;

	//info.syms = info.resources.map(x => x == 'clock' ? 'watch' : x); //if (key == 'clock') key='watch';
	let sdict = {
		tower: { k: 'white-tower', bg: 'dimgray' }, clock: { k: 'watch', bg: 'navy' }, crown: { k: 'crown', bg: 'black' },
		tree: { k: 'tree', bg: GREEN },
		bulb: { k: 'lightbulb', bg: 'purple' }, factory: { k: 'factory', bg: 'red' }
	};

	for (const sym of info.resources) {
	//	console.log(sym)
		if (sym == 'None') {
			//einfach nur das age als text
			//console.log('age of card:', info.age)
			//mTextFit(text, { wmax, hmax }, dParent, styles, classes)
			d1 = {div: mDiv(d, { fz: fz * .75, w:szSym, h:szSym, fg: 'black', bg: 'white', rounding: '50%', display: 'inline' })};
			let d2 = mText('' + info.age, d1.div, {});
			mClass(d2, 'centerCentered')

		} else if (sym == 'echo') {

		} else {
		//	console.log('ssssssssssssssssssssssss', sym)
			// d1 = mSymbol(sdict[sym].k, d, szSym, { fz: fz, bg: sdict[sym].bg, border:'#ffffff80', rounding: '10%', display: 'inline' });
			//d1 = mSymbol(sdict[sym].k, d, szSym, { fz: fz, bg: sdict[sym].bg, rounding: '10%', display: 'inline' });
			let key = sdict[sym].k;
			d1 = zPic(key,d,{ padding:0, w:szSym, h:szSym, bg: sdict[sym].bg, rounding: '10%' });
		//	console.log(d1)
		}

		syms.push(d1);
	}

	//console.log(syms[0])
	mStyleX(syms[0].div, { position: 'absolute', left: 0, top: 0, margin: gap });
	mStyleX(syms[1].div, { position: 'absolute', left: 0, bottom: 0, margin: gap });
	mStyleX(syms[2].div, { position: 'absolute', left: w / 2, bottom: 0, margin: gap });
	mStyleX(syms[3].div, { position: 'absolute', right: 0, bottom: 0, margin: gap });

	// let d=mText(info.dogmas.join('\n'));
	info.div = d;

	return info;
	return 'hallo';
}










function getRandomCard({ rank, suit, type } = {}) {
	if (isdef(rank) || isdef(suit)) return card52(rank, suit);
	else if (type == 'c52') return card52();
	else if (type == 'inno') return cardInno();
}
function getRandomCards(n, { rank, suit, type, age, color } = {}) {
	if (type == 'inno') {
		let allKeys = Object.keys(cinno);
		let keys = isdef(age) ? allKeys.filter(x => cinno[x].age == age) : allKeys;
		keys = isdef(color) ? keys.filter(x => cinno[x].color == color) : keys;
		let nKeys = choose(keys, n);
		return nKeys;
	}
}
function mSymbol(key, dParent, sz, styles = {}) {

	console.log('key', key)
	let info = symbolDict[key];

	//ich brauche einen size der macht dass das symbol in sz passt
	fzStandard = info.fz;
	hStandard = info.h[0];
	wStandard = info.w[0];

	//fzStandard/fz = hStandard/sz= wStandard/wz;
	//fzStandard = fz*hStandard/sz= fz*wStandard/wz;
	//fzStandard = fz*hStandard/sz= fz*wStandard/wz;

	let fzMax = fzStandard * sz / Math.max(hStandard, wStandard);
	fzMax *= .9;


	let fz = isdef(styles.fz) && styles.fz < fzMax ? styles.fz : fzMax;

	let wi = wStandard * fz / 100;
	let hi = hStandard * fz / 100;
	let vpadding = 2 + Math.ceil((sz - hi) / 2); console.log('***vpadding', vpadding)
	let hpadding = Math.ceil((sz - wi) / 2);

	let margin = '' + vpadding + 'px ' + hpadding + 'px'; //''+vpadding+'px '+hpadding+' ';

	let newStyles = deepmergeOverride({ fz: fz, align: 'center', w: sz, h: sz, bg: 'white' }, styles);
	newStyles.fz = fz;
	let d = mDiv(dParent, newStyles);

	console.log(key, info)
	//let fz=sz;
	//if (isdef(styles.h)) styles.fz=info.h[0]*
	let txt = mText(info.text, d, { family: info.family });

	console.log('-----------', margin, hpadding, vpadding);
	mStyleX(txt, { margin: margin, 'box-sizing': 'border-box' });

	return d;
}
function cardInno(key, w = 420, h = 200) {
	if (nundef(key)) key = chooseRandom(Object.keys(cinno));



	//key = 'Flight';
	let info = cinno[key];

	info.key = key;


	let cdict = { red: 'red1', blue: 'blue1', green: 'green1', yellow: 'yellow1', purple: 'purple' }
	info.c = colorDarker(ColorDict[cdict[info.color]].c, .6);

	//make empty card with dogmas on it
	let d = mDiv();
	mSize(d, w, h);
	let szSym = 50; let fz = szSym * .8;
	mStyleX(d, { margin: 8, align: 'left', bg: info.c, rounding: 10, patop: 10, paright: 20, pabottom: szSym, paleft: szSym + 8, border: '4px solid silver', position: 'relative' })
	mText(info.key.toUpperCase(), d, { fz: 24, weight: 'bold', margin: 'auto' });
	mLinebreak(d);
	for (const dog of info.dogmas) {
		console.log(dog);
		let d1 = mText(dog, d); //,{mabot:14});
		d1.style.marginBottom = '8px';
		//mLinebreak(d);
	}

	let syms = []; let d1;

	szSym -= 6;

	//info.syms = info.resources.map(x => x == 'clock' ? 'watch' : x); //if (key == 'clock') key='watch';
	let sdict = {
		tower: { k: 'white-tower', bg: 'dimgray' }, clock: { k: 'watch', bg: 'navy' }, crown: { k: 'crown', bg: 'black' },
		tree: { k: 'tree', bg: GREEN },
		bulb: { k: 'lightbulb', bg: 'purple' }, factory: { k: 'factory', bg: 'red' }
	};

	for (const sym of info.resources) {
		console.log(sym)
		if (sym == 'None') {
			//einfach nur das age als text
			console.log('age of card:', info.age)
			//mTextFit(text, { wmax, hmax }, dParent, styles, classes)
			d1 = mDiv(d, { fz: fz * .75, fg: 'black', bg: 'white', rounding: '50%', display: 'inline' });
			let d2 = mText('' + info.age, d1, {});
			console.log('vvvvvvvvvvvvvvv', d1);

			mClass(d2, 'centerCentered')

		} else if (sym == 'echo') {

		} else {
			console.log('ssssssssssssssssssssssss', sym)
			// d1 = mSymbol(sdict[sym].k, d, szSym, { fz: fz, bg: sdict[sym].bg, border:'#ffffff80', rounding: '10%', display: 'inline' });
			d1 = mSymbol(sdict[sym].k, d, szSym, { fz: fz, bg: sdict[sym].bg, rounding: '10%', display: 'inline' });
		}

		syms.push(d1);
	}

	//console.log(syms[0])
	//let 
	let gap = 6;
	mStyleX(syms[0], { position: 'absolute', w: szSym, h: szSym, left: 0, top: 0, margin: gap });
	mStyleX(syms[1], { position: 'absolute', w: szSym, h: szSym, left: 0, bottom: 0, margin: gap });
	mStyleX(syms[2], { position: 'absolute', w: szSym, h: szSym, left: w / 2, bottom: 0, margin: gap });
	mStyleX(syms[3], { position: 'absolute', w: szSym, h: szSym, right: 0, bottom: 0, margin: gap });

	// let d=mText(info.dogmas.join('\n'));
	info.div = d;

	return info;
	return 'hallo';
}
function cardInnoSZ(key, wCard = 420) {
	if (nundef(key)) key = chooseRandom(Object.keys(cinno));

	let f=wCard/420;
	let [w,h,szSym,paSym,fz,pa,bth,vGapTxt,rnd,gap]=[420*f,200*f,50*f,8*f,50*f*.8,20*f,4*f,8*f,10*f,6*f].map(x=>Math.ceil(x));
	

	//key = 'Flight';
	let info = cinno[key];

	info.key = key;


	let cdict = { red: 'red1', blue: 'blue1', green: 'green1', yellow: 'yellow1', purple: 'purple' }
	info.c = colorDarker(ColorDict[cdict[info.color]].c, .6);

	//make empty card with dogmas on it
	let d = mDiv();
	mSize(d, w, h);
	//let szSym = 50; let fz = szSym * .8;

	mStyleX(d, { fz:pa, margin: 8, align: 'left', bg: info.c, rounding: rnd, patop: paSym, paright: pa, pabottom: szSym, paleft: szSym + paSym, border: ''+bth+'px solid silver', position: 'relative' })
	mText(info.key.toUpperCase(), d, { fz: pa, weight: 'bold', margin: 'auto' });
	mLinebreak(d);
	for (const dog of info.dogmas) {
		console.log(dog);
		let d1 = mText(dog, d); //,{mabot:14});
		d1.style.marginBottom = ''+vGapTxt+'px';
		//mLinebreak(d);
	}

	let syms = []; let d1;

	szSym -= gap;

	//info.syms = info.resources.map(x => x == 'clock' ? 'watch' : x); //if (key == 'clock') key='watch';
	let sdict = {
		tower: { k: 'white-tower', bg: 'dimgray' }, clock: { k: 'watch', bg: 'navy' }, crown: { k: 'crown', bg: 'black' },
		tree: { k: 'tree', bg: GREEN },
		bulb: { k: 'lightbulb', bg: 'purple' }, factory: { k: 'factory', bg: 'red' }
	};

	for (const sym of info.resources) {
		console.log(sym)
		if (sym == 'None') {
			//einfach nur das age als text
			console.log('age of card:', info.age)
			//mTextFit(text, { wmax, hmax }, dParent, styles, classes)
			d1 = mDiv(d, { fz: fz * .75, fg: 'black', bg: 'white', rounding: '50%', display: 'inline' });
			let d2 = mText('' + info.age, d1, {});
			mClass(d2, 'centerCentered')

		} else if (sym == 'echo') {

		} else {
			console.log('ssssssssssssssssssssssss', sym)
			// d1 = mSymbol(sdict[sym].k, d, szSym, { fz: fz, bg: sdict[sym].bg, border:'#ffffff80', rounding: '10%', display: 'inline' });
			//d1 = mSymbol(sdict[sym].k, d, szSym, { fz: fz, bg: sdict[sym].bg, rounding: '10%', display: 'inline' });
			let key = sdict[sym].k;
			d1 = maPic(key,d,{ w:szSym, bg: sdict[sym].bg, rounding: '10%' });
		}

		syms.push(d1);
	}

	//console.log(syms[0])
	//let 
	//let gap = 6;
	mStyleX(syms[0], { position: 'absolute', w: szSym, h: szSym, left: 0, top: 0, margin: gap });
	mStyleX(syms[1], { position: 'absolute', w: szSym, h: szSym, left: 0, bottom: 0, margin: gap });
	mStyleX(syms[2], { position: 'absolute', w: szSym, h: szSym, left: w / 2, bottom: 0, margin: gap });
	mStyleX(syms[3], { position: 'absolute', w: szSym, h: szSym, right: 0, bottom: 0, margin: gap });

	// let d=mText(info.dogmas.join('\n'));
	info.div = d;

	return info;
	return 'hallo';
}
function card52(rankey, suit, w, h) {
	//console.log('cardFace',rank,suit,w,h)

	//#region set rank and suit from inputs
	let rank = rankey;
	if (nundef(rankey) && nundef(suit)) {
		rankey = chooseRandom(Object.keys(c52));
		rank = rankey[5];
		suit = rankey[6];
	} else if (nundef(rankey)) {
		//face down card!
		rankey = '2';
		suit = 'B';
	} else if (nundef(suit)) {
		rank = rankey[5];
		suit = rankey[6];
	}
	//
	console.log('rank', rank, 'suit', suit);

	if (rank == '10') rank = 'T';
	if (rank == '1') rank = 'A';
	if (nundef(suit)) suit = 'H'; else suit = suit[0].toUpperCase(); //joker:J1,J2, back:1B,2B
	//#endregion

	//#region load svg for card_[rank][suit] (eg. card_2H)
	let cardKey = 'card_' + rank + suit;
	let svgCode = c52[cardKey]; //c52 is cached asset loaded in _start
	// console.log(cardKey, c52[cardKey])
	svgCode = '<div>' + svgCode + '</div>';
	let el = createElementFromHTML(svgCode);
	if (isdef(h) || isdef(w)) { mSize(el, w, h); }
	//console.log('__________ERGEBNIS:',w,h)
	//#endregion

	return { rank: rank, suit: suit, key: cardKey, div: el };
}

//#region layout functions
function showSingle52(dParent, rank, suit, w, h) {
	let c = card52(rank, suit, w, h);
	mAppend(dParent, c.div);
	//console.log(c52)
	return c;
}
function showAllInnoCards(dParent) {
	Pictures = [];
	let allKeys = Object.keys(cinno);
	console.group(allKeys);
	let dims = calcRowsColsX(allKeys.length);
	let idx = 0;
	for (let i = 0; i < dims.rows; i++) {
		for (let j = 0; j < dims.cols; j++) {
			if (allKeys.length <= idx) break;
			let c = cardInnoz(allKeys[idx]); idx += 1;
			mAppend(dParent, c.div);
			c.row = i;
			c.col = j;
			Pictures.push(c);
		}
	}

}
function showInnoCards(keys, dParent, wCard = 200) {
	Pictures = [];
	let dims = calcRowsColsX(keys.length);
	let idx = 0;
	for (let i = 0; i < dims.rows; i++) {
		for (let j = 0; j < dims.cols; j++) {
			if (keys.length <= idx) break;
			let c = cardInnoz(keys[idx], wCard); idx += 1;
			mAppend(dParent, c.div);
			c.row = i;
			c.col = j;
			Pictures.push(c);
		}
	}
}
function showDeck(keys, dParent, splay, w, h) {
	//splay in 'left','right','up','down','diag','diag2','diagup','diag2up','none'

	let d = mDiv(dParent);
	mStyleX(d, { display:'block', position: 'relative', bg: 'green', padding: 25 });

	let gap = 10;
	let ovPercent = 20;
	let overlap = w * ovPercent / 100;
	let x = y = gap;
	for (let i = 0; i < keys.length; i++) {
		let k = keys[i];
		let c = zInno(k, d);
		mAppend(d, c.div);
		mStyleX(c.div, { position: 'absolute', left: x, top: y });
		c.row = 0;
		c.col = i;
		x += overlap;
		Pictures.push(c);


	}
	d.style.width = (x-overlap+w)+'px';
	console.log(Pictures[0])
	console.log(Pictures[0].div)
	d.style.height = firstNumber(Pictures[0].div.style.height)+'px';
}














//#region NOT IMPLEMENTED
function showHand52(cards, dParent, splayed = 'left', w, h) {
	//cards is list of {...card props je nach game ...,div};
	//dParent is container of Hand div tbc
	//splayed in 'left','right','up','down','diag','diag2','diagup','diag2up','none'



}
function showGrid(cards, dParent) {
}
//#endregion