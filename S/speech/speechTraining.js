var DICTIONARY, BYWORD = {};

function trainBritishGuy(ab) {
	let lang = 'E';
	let voice = 'ukMale';
	let di = DICTIONARY = {};
	let callback = di => {
		let fname = lang + '_' + voice;
		downloadAsYaml(DICTIONARY, fname + '_DICTIONARY');
		downloadAsYaml(BYWORD, fname + '_BYWORD');
	};

	let set = symKeysBySet['nosymbols'];
	if (isdef(ab)) {
		let i = 0;
		while (set[i] != ab) i++;
		set = set.slice(i);
	}
	console.log('set', set);
	testp8(set, lang, voice, di, callback);

}

function trainDeutsch(ab, lang = 'D', voice = 'deutsch') {
	let di = DICTIONARY = {};
	let callback = di => {
		let fname = lang + '_' + voice;
		downloadAsYaml(DICTIONARY, fname + '_DICTIONARY');
		downloadAsYaml(BYWORD, fname + '_BYWORD');
	};

	let set = symKeysBySet['nosymbols'];
	let i = 0;
	while (set[i] != ab) i++;
	set = set.slice(i);
	console.log('set', set);
	testp8(set, lang, voice, di, callback);

}
function trainZira(lang = 'E', voice = 'zira') {
	let di = DICTIONARY = {};
	let callback = di => {
		let fname = lang + '_' + voice;
		downloadAsYaml(di, fname);
		downloadAsYaml(BYWORD, 'BYWORD');
	};

	let set = symKeysBySet['nosymbols'];
	let i = 0;
	while (set[i] != 'dvd') i++;
	set = set.slice(i);
	console.log('set', set);
	testp8(set, lang, voice, di, callback);

}


function testp7() {
	let group = 'animals-nature';
	let sub = 'animal-reptile';
	let lang = 'E';
	let voice = 'zira';
	testGroupSub(group, sub, lang, voice);
	//downloadAsYaml(d1, group + '_' + lang + '_' + voice);
}
function testGroupSub(group, sub, lang, voice) {
	let di = {};
	let callback = di => {
		let fname = group + '_' + lang + '_' + voice;
		downloadAsYaml(di, fname);

	};
	testp8(symKeysByGroupSub[group][sub], lang, voice, di, callback);

}

function testp8(keylist, lang, voicekey, di, callback) {

	let sampleIndex = 0;
	if (lang == 'D') voicekey = 'deutsch';
	else if (nundef(voicekey)) voicekey = 'random';

	if (isEmpty(keylist)) {
		console.log('training complete!', di);
		if (isdef(callback)) callback(di);
	} else {
		let key = keylist.shift();
		let info = symbolDict[key];
		sampleIndex += 1;
		console.log('==>key', key, info);

		//keylist = [];// stop after first!
		let w = lastOfLanguage(key, lang).toLowerCase();
		//console.log(w, wlist);

		// 1. approach: only wrap short words
		if (isdef(w) && !isEmpty(w)) {
			let wrapit = isShortWord(w);
			let between = lang == 'E' ? ' sounds like ' : ' klingt wie ';
			let wphrase = wrapit ? (w + between + w) : [w, w, w].join(' : ');

			// 2. simple approach genauso gut: wrap all
			wrapit = true; wphrase = w + between + w;

			// 3. wrap simple words, leave multiple (wenn mehrfaches word muss ich mir n merken!)
			wrapit = w.split(' ').length == 1;
			wphrase = wrapit ? (w + between + w) : w;

			Speech.train1(wphrase, lang, voicekey, (res, conf) => {
				if (isEmpty(res)) {
					console.log('DID NOT RECOGNIZE', w)
					let entry = { key: key, req: w, answer: '', correct: false, conf: 0 };
					lookupSet(di, [key, lang, voicekey], entry);
					lookupSet(BYWORD, [w], { correct: false, answer: '', conf: 0 });
					//console.log('outcome', entry)
				} else {
					res = res.toLowerCase();
					let parts = res.split(' '); //.map(x => x.toLowerCase());
					console.log('training returned', res, conf);

					//1. and 2. approach:
					let correct = true;
					if (wrapit) {
						//console.log('wrapit=true', arrLast(parts), w);
						if (arrLast(parts) != w && arrFirst(parts) != w) correct = false;
						//hier schreiben welcher matched!
					} else {
						// 1. approach:
						//for (const part of parts) if (part != w) correct = false;
						// 3. approach: auch multiple words in w
						if (w != res) correct = false;
					}

					//if (conf<.97) correct=false;else for(const x1 of parts)if (x1!=w) correct=false;
					let answer = wrapit ? arrLast(parts) : res;
					let entry = { key: key, req: w, answer: answer, correct: correct, conf: conf };
					lookupSet(di, [key, lang, voicekey], entry)
					lookupSet(BYWORD, [w], { correct: correct, answer: answer, conf: conf });
					console.log('outcome', entry)
				}
				testp8(keylist, lang, voicekey, di, callback);
			});

		} else {
			console.log('ERROR AUFGETRETEN BY INDEX', sampleIndex);
			callback(di);
		}
	}
}



function testp6() {
	//getSymbols({ minlen=null, maxlen=null, cats = null, lang = 'E', wShortest = false, wLast = false, wExact = false, sorter = null }={}) {
	let infos = getSymbols({ cats: ['nosymbols'] });
	console.log(infos);

}

function testp5() {
	let di = {};
	testp3(['maschine', 'kleid', 'haus'], 'D', 'zira', di);
	//console.log(di)
}

function testp4() {
	let di = {};
	testp3(['bear', 'bee', 'skiing'], 'E', 'zira', di);
	//console.log(di)
}
function isShortWord(w) {
	let sil = detectSilben(w);
	if (isEmpty(sil)) sil = 0; else sil = sil.length;
	return w.length < 6 && sil < 2; //detectSilben(w).length < 2;
}
function testp3(wlist, lang, voicekey, di) {

	if (lang == 'D') voicekey = 'deutsch';
	else if (nundef(voicekey)) voicekey = 'random';

	if (isEmpty(wlist)) {
		console.log('training complete!', di);
	} else {
		let w = wlist.shift().toLowerCase();
		//console.log(w, wlist);

		let wrapit = isShortWord(w);
		let between = lang == 'E' ? ' sounds like ' : ' klingt wie ';
		let wrep = wrapit ? (w + between + w) : [w, w, w].join(' : ');

		wrapit = true; wrep = w + between + w;

		Speech.train1(wrep, lang, voicekey, (res, conf) => {
			if (isEmpty(res)) {
				console.log('DID NOT RECOGNIZE', w)
				let entry = { req: w, answer: '', correct: false, conf: 0 };
				lookupSet(di, [w, lang, voicekey], entry)
				//console.log('outcome', entry)
			} else {
				let parts = res.split(' ').map(x => x.toLowerCase());
				console.log('training returned', res, conf);
				let correct = true;
				if (wrapit) {
					//console.log('wrapit=true', arrLast(parts), w);
					if (arrLast(parts) != w && arrFirst(parts) != w) correct = false;
				} else {
					for (const part of parts) if (part != w) correct = false;
				}
				//if (conf<.97) correct=false;else for(const x1 of parts)if (x1!=w) correct=false;
				let entry = { req: w, answer: arrLast(parts), correct: correct, conf: conf };
				lookupSet(di, [w, lang, voicekey], entry)
				console.log('outcome', entry)
			}
			testp3(wlist, lang, voicekey, di);
		});
	}
}

function testp2(wlist = ['apple', 'banana']) { // , 'ant', 'buffalo', 'bear'
	testp1(wlist);
}
function testp1(wlist) {

	if (isEmpty(wlist)) {
		console.log('training complete!');
	} else {
		let w = wlist.shift();
		console.log(w, wlist);
		let wrep = [w, w, w].join(', ');
		Speech.train1(wrep, 'E', 'zira', (res, conf) => {
			if (isEmpty(res)) {
				console.log('DID NOT RECOGNIZE', w)
			} else {
				let x = res.split(' ');
				console.log('training returned', x[0], conf);
			}
			testp1(wlist);
		});
	}
}
function testp0() {
	Speech.train1('apple, apple, apple', 'E', 'zira', (res, conf) => console.log('training returned', res, conf));

}










async function speechTraining() {
	if (nundef(Speech)) {
		console.log('MISSING FEATURES: speechTraining needs the Speech feature!');
		return;
	}

	let trainingSet = ['animal', 'game'];//bestimmeAlleSetsDieDurchgehenSoll();
	let setSize = 1;
	console.log('trainingSet', trainingSet);
	for (const groupName of trainingSet) {
		for (const lang of ['E', 'D']) {
			let infos = getInfolist({ cats: [groupName], lang: lang, wLast: true, sorter: x => x.best });
			for (let i = 0; i < setSize; i++) {
				for (let times = 0; times < 2; times++) {
					let speakInterval = 3000;
					let t = times * (1000 + 3 * speakInterval);
					if (lang == 'D') t *= 2;
					let info = infos[i];

					let req = info.best;
					req = req.toLowerCase();

					Speech.recognize(req, lang,
						(r, c) => {
							console.log('MATCHING: req', req, 'r', r, '(' + c + ')');
						},
						(r, c) => {
							console.log('NOT MATCHING: req', req, 'r', r, '(' + c + ')');
						},
					);

					//say the word
					setTimeout(() => Speech.say(req, .4, .9, 1, false, 'random'), t + 1000);
					setTimeout(() => Speech.say(req, .3, .9, 1, false, 'random'), t + 4000);
					//setTimeout(() => Speech.say(req, .7, .5, 1, false, 'random'), t + 7000);
					setTimeout(() => Speech.stopRecording(), t + 7000)
					//eval recognized word
					//if recognized word == wToBe Said
					//animal,E,0
					//
				}
			}
		}
		return;
	}
}


function bestimmeAlleSetsDieDurchgehenSoll() {
	return ['kitchen', 'math', 'drink', 'misc',
		'activity', 'animal', 'body', 'clock', 'emotion', 'family', 'fantasy', 'food',
		'fruit', 'game', 'gesture',
		'object', 'person', 'place', 'plant', 'punctuation', 'role', 'shapes', 'sport', 'sternzeichen', 'symbols', 'time', 'toolbar',
		'transport', 'vegetable'];

}

function testAccessor() {
	let infos1 = getInfolist({ cats: ['kitchen', 'game'], wLast: true, maxlen: 4, sorter: x => x.best });
	//console.log(infos1.length); infos1.map(x => console.log(x.key + ': ' + x.best));
	let infos2 = getInfolist({ cats: ['kitchen', 'game'], wShortest: true, maxlen: 4, sorter: x => x.best });
	//console.log(infos2.length); infos2.map(x => console.log(x.key + ': ' + x.best));
	let infos3 = getInfolist({ cats: ['kitchen', 'game'], lang: 'D', wShortest: true, maxlen: 4, sorter: x => x.best });
	//console.log(infos3.length); infos3.map(x => console.log(x.key + ': ' + x.best));
}
function getInfolist({ minlen = null, maxlen = null, cats = null, lang = 'E', wShortest = false, wLast = false, wExact = false, sorter = null } = {}) {
	opt = arguments[0];
	if (nundef(opt)) opt = {};
	if (nundef(cats)) cats = currentCategories;
	if (nundef(lang)) lang = currentLanguage;
	if (nundef(minlen)) opt.minlen = MinWordLength;
	if (nundef(maxlen)) opt.maxlen = MaxWordLength;
	//console.log(opt)
	let infos = getInfos(cats, lang, opt);
	//console.log('set infos:' + infos.length, infos.map(x=>x.key+': '+x.best));
	return infos;
}
function getSymbols(x) { return getInfolist(x); }
