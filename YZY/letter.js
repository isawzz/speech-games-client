function arrCycleSwap(arr, prop, clockwise = true) {
	let n = arr.length;
	let h = arr[0].prop;
	for (let i = 1; i < n; i++) { arr[i - 1][prop] = arr[i][prop]; }
	arr[n - 1][prop] = h;
}
function gatherItems(n, options) {
	//console.log(n,options)
	let items = null;
	while (!items) { items = Pictures = pickSuitableItems(n, options); }

	//console.log('==>items',items)

	//each item has a iLetter and letter now!

	//labels need to be replaced! =>replace cycle!
	let l = items[0].letter;
	for (let i = 0; i < n; i++) {
		let item1 = items[i];
		let item2 = items[(i + 1) % n];
		let label = item1.origLabel = item1.label;
		let idx = item1.iLetter;
		item1.label = replaceAtString(label, idx, item2.letter);
		if (isWord(item1.label)) {
			//console.log(item1,item2,item1.label,item2.label)
			item2.iLetter = (item2.iLetter + 1) % item2.label.length;
			item2.letter = item2.label[item2.iLetter];
			item1.label = replaceAtString(label, idx, item2.letter); // label.substring(0, idx) + item2.letter + label.substring(idx + 1);
			if (isWord(item1.label)) return gatherItems(n, options);
		}
		//add swapInfo to item1
		item1.swaps = {};
		item1.swaps[idx] = {
			swapped: { itemId: item2.id, index: item2.iLetter, l: item2.letter },
			correct: { itemId: item1.id, index: item1.iLetter, l: item1.letter },
			temp: null,
		};

	}
	return items;
}
function pickSuitableItems(n, options) {
	let items = genItems(n, options);
	let words = items.map(x => x.label);
	//console.log('words',words);

	//console.log('words',words,'options',options)

	//if all labels are longer than 5 letters try finding vowels first
	let minlen = arrMinMax(words, x => x.length).min;
	//console.log('minlen', minlen)

	let used = [];
	for (const item of items) {
		let res = minlen > 6 ? getRandomVowel(item.label, used) : minlen > 3 ? getRandomConsonant(item.label, used) : getRandomLetter(item.label, used);
		if (isEmpty(res)) return null;
		let i = item.iLetter = res.i;
		let letter = item.letter = item.label[i];
		used.push(letter);
		//console.log('w',item.label,'i', i, 'letter', letter);
	}
	return items;
}
function getLettersExcept(w, except = []) {
	w = w.toLowerCase();
	let res = [];
	for (let i = 0; i < w.length; i++) {
		if (!except.includes(w[i])) res.push({ i: i, letter: w[i] });
	}
	return res;
}
function getVowels(w, except = []) {
	w = w.toLowerCase();
	//console.log('w', w);
	let vowels = 'aeiouy';
	let res = [];
	for (let i = 0; i < w.length; i++) {
		if (vowels.includes(w[i]) && !except.includes(w[i])) res.push({ i: i, letter: w[i] });
	}
	//console.log('res', res)
	return res;
}
function getConsonants(w, except = []) {
	w = w.toLowerCase();
	//console.log('w',w);
	let vowels = 'aeiouy' + except.join('');
	let res = [];
	for (let i = 0; i < w.length; i++) {
		if (!vowels.includes(w[i])) res.push({ i: i, letter: w[i] });
	}
	//console.log('res',res)
	return res;
}
function getRandomVowel(w, except = []) { let vowels = getVowels(w, except); return chooseRandom(vowels); }
function getRandomConsonant(w, except = []) { let cons = getConsonants(w, except); return chooseRandom(cons); }
function getRandomLetter(w, except = []) { let cons = getLettersExcept(w, except); return chooseRandom(cons); }
function getBlinkingLetter(item) {
	if (nundef(item.letters)) return null;
	return firstCond(item.letters, x => x.isBlinking);
}
function iLetters(s, dParent, style) {
	let d = mDiv(dParent);
	for (let i = 0; i < s.length; i++) {
		let d1 = mDiv(d);
		d1.innerHTML = s[i];
		mStyleX(d1, style);
	}
	return d;
}
function isWord(w) { return lookup(Dictionary,[G.language,w]); }//isdef(Dictionary[G.language][w]); }
function pickSuitableItems_dep(n, options) {
	let items = genItems(n, options);
	let words = items.map(x => x.label);

	let used = [];
	for (const item of items) {
		let res = getRandomConsonant(item.label, used);
		if (isEmpty(res)) return null;
		let i = item.iLetter = res.i;
		let letter = item.letter = item.label[i];
		used.push(letter);
		//console.log('w',item.label,'i', i, 'letter', letter);
	}
	return items;
}
function stopBlinking(item) { if (isdef(item)) { item.isBlinking = false; mRemoveClass(iDiv(item), 'blink'); } }
function startBlinking(item, items, unique = true) {
	//console.log('item', item, 'items', items, 'unique', unique)
	if (unique) {
		let prevLetter = firstCond(items, x => x.isBlinking == true);
		//console.log('prevLetter', prevLetter);
		stopBlinking(prevLetter);
	}
	mClass(iDiv(item), 'blink');
	item.isBlinking = true;
}
function startPulsating(item, items, unique = true) {
	//console.log('item', item, 'items', items, 'unique', unique)
	if (unique) {
		let prevLetter = firstCond(items, x => x.isPulsating == true);
		//console.log('prevLetter', prevLetter);
		stopPulsating(prevLetter);
	}
	mClass(iDiv(item), 'onPulse');
	item.isPulsating = true;
}
function stopPulsating(item) { if (isdef(item)) { item.isPulsating = false; mRemoveClass(iDiv(item), 'onPulse'); } }

function showCorrectLabelSwapping() {
	for (const p of Pictures) {
		for (const l of p.letters) {
			let sw = l.swapInfo;
			if (isdef(sw)) {
				//console.log('state', l.state, l.letter, '=>', sw.correct.l);
				//startPulsating(l,p.letters,false);
				iDiv(l).innerHTML = sw.correct.l;
				if (l.i == p.iLetter) animate(iDiv(l), 'komisch', 2300);
				//console.log('will correct',p.testLabel,'to',replaceAtString(p.label,l.i,sw.correct.l));
				//show correct version of that letter!
				//transformation should be slow (animation similar to abacus correction!)
			}
		}
	}
	DELAY = 3000;
	return 3000;
}
