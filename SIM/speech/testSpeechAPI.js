function testConf2(){
	console.log(CorrectByKey, CorrectKeysByLanguage);

	let eGoodKeys = intersection(CorrectKeysByLanguage.E,CorrectKeysByLanguage.EB);
	let dGoodKeys = CorrectKeysByLanguage.D;
	console.log(intersection(eGoodKeys,dGoodKeys));


	let keys=dict2list(CorrectByKey);
	let cByKeyNew={};
	let ee,ed;
	let eall=[];
	let dall=[];
	BEST100_E=[];
	BEST100_D=[];

	for(const k of eGoodKeys){
		let e = CorrectByKey[k];
		console.log(k);
		if(isdef(e.E) && isdef(e.EB)){
			let conf=Math.round((e.E.c+e.EB.c)/2);
			console.log('english:',e.E.r,conf, '(last:'+lastOfLanguage(k,'E').toLowerCase()+')');

			if (e.E.r != lastOfLanguage(k,'E').toLowerCase()) console.error(k+' is NOT last!!!!!');
			ee={k:k,r:e.E.r,c:conf};
			eall.push(ee);
		}
		
		if(isdef(e.D)){
			console.log('deutsch:',e.D.r,e.D.c, '(last:'+lastOfLanguage(k,'D')+')');
			if (e.D.r != lastOfLanguage(k,'D').toLowerCase()) console.error(k+' is NOT last!!!!!')
			ed={k:k,r:e.D.r,c:e.D.c};
			dall.push(ed);
		}
	}


	sortByFuncDescending(eall,x=>x.c);
	sortByFuncDescending(dall,x=>x.c);

	console.log('english',eall)
	console.log('deutsch',dall)

	downloadAsYaml(dall,'keysD');
	downloadAsYaml(eall,'keysE');

}
function outputKey(k,keys){
	let e=CorrectByKey[k];
	console.log(''+k+':')
}

function testConfidence() {
	//lookupSet(CorrectByKey,[k,'D'],d.conf); (see assets.js)

	let bucketsE = { 0: [], 50: [], 60: [], 70: [], 80: [], 85: [], 90: [], 95: [], 97: [], 98: [], 99: [] };//under 50%, then every 10%
	for (const k in CorrectByKey) {
		let entry = CorrectByKey[k];
		let econf = entry.E;
		if (nundef(econf)) bucketsE[0].push(k);
		else {
			//push this key to highest matching bucket
			econf *= 100;
			for (const b of [99, 98, 97, 95, 90, 85, 80, 70, 60, 50, 0]) {
				if (econf >= b) { bucketsE[b].push(k); break; }
			}
		}
	}
	console.log('buckets E:', bucketsE);

	let bucketsD = { 0: [], 50: [], 60: [], 70: [], 80: [], 85: [], 90: [], 95: [], 97: [], 98: [], 99: [] };//under 50%, then every 10%
	for (const k in CorrectByKey) {
		let entry = CorrectByKey[k];
		let dconf = entry.D;
		if (nundef(dconf)) bucketsD[0].push(k);
		else {
			//push this key to highest matching bucket
			dconf *= 100;
			// console.log(k,dconf)
			for (const b of [99, 98, 97, 95, 90, 85, 80, 70, 60, 50, 0]) {
				if (dconf >= b) { bucketsD[b].push(k); break; }
			}
		}
	}
	console.log('buckets D:', bucketsD);





	let ekeys = getKeysInPercentile(CorrectKeysByLanguage.E, 'E', 94);
	let allkeys = getKeysInPercentile(ekeys, 'D', 80);

	console.log(ekeys);

	(allkeys.map(x => console.log(x + ', '
		+ lastOfLanguage(x, 'E') + ' (' + getConfidence(x, 'E') + '), '
		+ lastOfLanguage(x, 'D') + ' (' + getConfidence(x, 'D') + ')')));
	// or sort all keys per confidence and per language
	//


}
function getConfidence(k, lang) {
	let conf = lookup(CorrectByKey, [k, lang]);
	let res = Math.round(conf*100);
	return res;
}
function getKeysInPercentile(klist, lang, percent) {
	let res = [];
	for (const k of klist) {
		let x = CorrectByKey[k];
		if (nundef(x)) continue;
		let conf = x[lang];
		if (nundef(conf)) continue;
		if (conf * 100 >= percent) res.push(k);
	}
	return res;
}

function testSimilar01(w) {
	let onyes = w => { return (r, c) => console.log('JA!', w, '=', r, '(' + c + ')'); }
	let onno = w => { return (r, c) => console.log('NEIN!!!!', w, '#', r, '(' + c + ')') };

	Speech.recognize(w, 'E', onyes(w), onno(w));
}
function testLanguageChange() {
	let onyes = w => { return (r, c) => console.log('JA!', w, '=', r, '(' + c + ')'); }
	let onno = w => { return (r, c) => console.log('NEIN!!!!', w, '#', r, '(' + c + ')') };

	let w = 'hello';
	Speech.recognize(w, 'E', onyes(w), onno(w));

	w = 'Hund';
	Speech.recognize(w, 'D', onyes(w), onno(w));
}
function testWait() {
	let onyes = w => { return (r, c) => console.log('JA!', w, '=', r, '(' + c + ')'); }
	let onno = w => { return (r, c) => console.log('NEIN!!!!', w, '#', r, '(' + c + ')') };

	let w = 'hello';
	Speech.recognize(w, 'E', onyes(w), onno(w));

	w = 'hand';
	Speech.recognize(w, 'E', onyes(w), onno(w));
}

function testRecognizeAdvanced() {
	// function onyes(w) { return (r, c) => console.log('YES!', w, r, c); }
	// function onno(w) { return (r, c) => console.log('NO!!!', w, r, c); }

	let onyes = w => { return (r, c) => console.log('JA!', w, '=', r, '(' + c + ')'); }
	let onno = w => { return (r, c) => console.log('NEIN!!!!', w, '#', r, '(' + c + ')') };

	let w = 'hello';
	Speech.recognize(w, 'E', onyes(w), onno(w));

	setTimeout(() => {
		w = 'Hund';
		Speech.recognize(w, 'D', onyes(w), onno(w));
	}, 5000);
}

function testPromise(w = 'hello', lang = 'E') {
	let onyes = (r, c) => console.log('JA!', w, '=', r, '(' + c + ')');
	let onno = (r, c) => console.log('NEIN!!!!', w, '!=', r, '(' + c + ')');

	let myPromise = new Promise(function (myResolve, myReject) {
		// "Producing Code" (May take some time)
		Speech.recognize(w, lang, onyes, onno);

		myResolve(); // when successful
		myReject();  // when error
	});

	// "Consuming Code" (Must wait for a fulfilled Promise)
	myPromise.then(
		function (value) {
			console.log('resolved:', value);
			Speech.recognize('hallo', 'D', onyes, onno);
		},
		function (error) { console.log('error:', error) }
	);
}

function testRecognize2() {

	let onyes = (r, c) => console.log('JA!', r, '(' + c + ')');
	let onno = (r, c) => console.log('NEIN!!!!', r, '(' + c + ')');

	let w = 'hello';
	Speech.recognize(w, 'E', onyes, onno);

	setTimeout(() => {
		w = 'Hund';
		Speech.recognize(w, 'D', onyes, onno);
	}, 5000);
}

function testRecognize(w = 'hello', lang = 'E') {

	let onyes = (r, c) => console.log('JA!', w, '=', r, '(' + c + ')');
	let onno = (r, c) => console.log('NEIN!!!!', w, '!=', r, '(' + c + ')');
	Speech.recognize(w, lang, onyes, onno);
}

function testStartAgainAfterStartingRecorder() {
	//assumes existence of global Speech
	let onRecorderStart = () => Speech.record({ onStart: () => console.log('2!'), delayStart: 2000, retry: true });
	Speech.record({ onStart: onRecorderStart, delayStart: 2000, retry: true });
}

function testChangingLangAfterStartingRecorder() {
	//assumes existence of global Speech
	let onRecorderStart = () => Speech.setLanguage('D');
	Speech.record({ onStart: onRecorderStart, delayStart: 2000, retry: true });
}

function testBasicRecord() {
	//first test
	let infos = getSymbols();
	console.log(infos);
	let w = infos[0].best;

	//let onRecorderStart = () => Speech.say(w);
	let onRecorderStart = () => Speech.setLanguage('D');

	Speech.record({ onStart: onRecorderStart, delayStart: 2000, retry: true });

}
