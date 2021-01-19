const InnoDict = {
	red: 'red1', blue: 'blue1', green: 'green1', yellow: 'yellow1', purple: 'purple',
	tower: { k: 'white-tower', fg: 'silver', bg: 'gray' }, clock: { k: 'clock', fg: 'navy', bg: 'powderblue' },
	crown: { k: 'queen-crown', fg: 'gold', bg: 'goldenrod' }, tree: { k: 'tree', fg: GREEN, bg: 'forestgreen' },
	bulb: { k: 'lightbulb', fg: 'violet', bg: 'purple' }, factory: { k: 'industry', fg: 'red', bg: 'firebrick' }
};// 'queen-crown', 'clock','industry'
function zInnoSymbol(sym, d, sz = 40, margin = 5, padding = 4, rounding = '10%', reverseColors = false) {
	let color = InnoDict[sym].fg;
	let fg, bg;
	if (reverseColors) {
		fg = colorDarker(color, .5);
		bg = colorLighter(color, .5);
	} else {
		bg = colorDarker(InnoDict[sym].bg, .2); //colorLighter(color, .5);
		fg = InnoDict[sym].fg; // colorLighter(color, .5);

	}

	return zPic(InnoDict[sym].k, d, { w: sz, h: sz, margin: margin, padding: padding, bg: bg, fg: fg, rounding: rounding });
}
function zInnoAge() { }
function zInnoRandom(n = 1) {
	//console.log(cinno);
	return choose(Object.keys(cinno), n);
}
function zInno(key, dParent) {
	let info = cinno[key]; info.key = key;
	//console.log(info)
	let col = ColorDict[InnoDict[info.color]].c;
	info.c = colorDarker(col, info.color == 'yellow' ? .3 : .6);
	let bgCard = info.c; //colorDarker(col,.25);

	//make prefabs
	let item = { key: key, info: info };
	//each symbol make pic for 
	let d = item.div = mDiv(null, { position: 'relative' });

	let color = InnoDict[info.type].fg;
	let bg = colorDarker(color, .5);
	let fg = colorLighter(color, .5);
	let dTitle = mDiv(d, { margin: 5, bg: 'transparent', fg: 'white' });
	item.title = zText(key.toUpperCase(), dTitle, { display: 'inline', paleft: 10, paright: 10, weight: 'bold' });
	//let dType = mDiv(dTitle, { bg: 'white', display:'inline' });
	item.type = zInnoSymbol(info.type, dTitle, 20, 2, 0, 0, true); //, 20, 0, 2, '50%'); //zPic(InnoDict[info.type].k,dType,{sz:30});

	//console.log(item.title);

	let dMain = item.dMain = mDiv(d, { align: 'left' });



	let dogmas = [];
	for (const dog of info.dogmas) {
		let x = convertDogmaText(dog);
		// let d1 = mDiv(dMain); d1.innerHTML = x; //GEHT!
		// let el = createElementFromHTML(x);		//mAppend(dMain,el) //NEIN!!!!!!!!!!!!!
		dogmas.push(zText(x, dMain, { mabottom: 8 }));
		// dogmas.push(zText(dog, dMain, { mabottom: 8 })); //ohne ersetzen von syms, GEHT!
	}
	item.dogmas = dogmas;

	let resources = [];
	//console.log(info.resources)
	//info.resources[2]='tree';
	for (const sym of info.resources) {
		let t =
			sym == 'None' ? zText(info.age.toString(), d, { margin: 5, w: 40, fz: 20, align: 'center', fg: 'black', bg: 'white', rounding: '50%', display: 'inline-block' }, 40, true)
				: sym == 'echo' ? zText(info.echo[0], d, { fz: 20, fg: 'white', bg: 'black' })
					: zInnoSymbol(sym, d); //zPic(InnoDict[sym].k, d, { margin: 5, padding: 4, w: 40, h: 40, bg: InnoDict[sym].bg, rounding: '10%' });
		resources.push(t);
	}
	item.resources = resources;

	//console.log(item);

	//compose items w/ abs positioning
	posTR(dTitle); //title.div);
	posTL(resources[0].div);
	posBL(resources[1].div);
	posBC(resources[2].div);
	posBR(resources[3].div);

	mStyleX(d, { margin: 4, w: 420, h: 220, padding: 50, rounding: 8, 'box-sizing': 'border-box', bg: bgCard });

	//what is the max height for dogmas? 200-100
	let dims = idealFontsizeX(dMain, 350, 120, 18, 8);
	item.dimsMain = dims;
	//console.log(dims);
	mAppend(d, dMain);
	//console.log(item, dMain, jsCopy(getBounds(dMain)));
	if (isdef(dParent)) mAppend(dParent, d);

	return item;
}


//#region
function convertDogmaText(t) {
	let parts = t.split('[');
	let html = parts[0];
	for (const p of parts.slice(1)) {
		//first word is key
		let k = stringBefore(p, ']');
		//console.log(k)
		if (isNumber(k)) {
			let lpad = k == '10' ? 0 : 6;
			let rpad = k == '10' ? 3 : 6;
			html += `<span style="padding-left:${lpad}px;padding-right:${rpad}px;background-color:white;color:black;border-radius:50%">${k}</span>`;
		} else if (isdef(InnoDict[k])) {
			let sym = InnoDict[k].k;
			let bg = InnoDict[k].bg;
			let fg = InnoDict[k].fg;
			let s1 = symbolDict[sym];
			let family = s1.family;
			let txt = s1.text;
			//console.log(sym, s1, txt);
			let pad = k == 'factory' ? '2px 6px' : '2px';
			html += `<span style="padding:${pad};font-family:${family};background-color:${bg};color:white;border-radius:50%">${txt}</span>`;
		} else html += ` ${k} `
		//console.log(p);
		html += stringAfter(p, ']');
	}
	//console.log(html)
	return html;
}





















