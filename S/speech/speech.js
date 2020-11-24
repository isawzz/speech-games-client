class SpeechFeature {
	constructor(defaultVolume = 1, lang = 'E') {
		this.recorder = new Recorder(lang);
		this.speaker = new Speaker(defaultVolume);
		this.lang = lang;
		//console.log(this.recorder)
	}

	ensureOff(){
		this.recorder.interrupt();
	}
	setLanguage(lang) {
		if (this.lang != lang) {
			this.lang = lang;
			this.recorder.setLanguage(lang);
			this.speaker.setLanguage(lang);
		}
	}
	record({ onStart, delayStart, onFinal, delayFinal, onEmpty, delayEmpty, lang, retry = false, wait = true, interrupt = false } = {}) {
		if (this.recorder.isRunning) {
			if (interrupt) {
				this.recorder.interrupt();
				setTimeout(() => {
					if (isdef(lang)) this.setLanguage(lang);
					this.recorder.start(onStart, delayStart, onFinal, delayFinal, onEmpty, delayEmpty)
				}, 500);
			} else if (wait) {
				setTimeout(() => this.record(...arguments), 500);
			}
		} else {
			if (isdef(lang)) this.setLanguage(lang);
			this.recorder.start(onStart, delayStart, onFinal, delayFinal, onEmpty, delayEmpty, retry);
		}
	}
	stopRecording() { this.recorder.stop(); }
	say(text, r = .5, p = .8, v = .5, interrupt = true, voiceDescriptor, callback, lang) {
		if (isdef(lang)) this.setLanguage(lang);
		this.speaker.say(text, r, p, v, interrupt, voiceDescriptor, callback, this.lang);
	}
	recognizePromise(word, lang, onMatch, onNoMatch) {
		this.setLanguage(lang);
		this.record({
			onFinal: (r, c) => {
				r = r.toLowerCase();
				word = word.toLowerCase();
				if (r == word) onMatch(r, c); else onNoMatch(r, c);
			},
			onEmpty: (r, c) => onNoMatch(r, c)
		});
	}
	recognize(word, lang, onMatch, onNoMatch) {
		this.setLanguage(lang);
		this.record({
			onFinal: (r, c) => {
				r = r.toLowerCase();
				word = word.toLowerCase();
				if (isSimilar(r, word, lang)) onMatch(r, c); else onNoMatch(r, c);
				//if (r == word) onMatch(r, c); else onNoMatch(r, c);
			},
			onEmpty: (r, c) => onNoMatch(r, c)
		});
	}

	train1(word, lang, voicekey, callback) {
		//console.log('voiceKey',voicekey)
		this.setLanguage(lang);
		let [r, p] = lang == 'E' ? [.5, .8] : [.6, .9];
		this.recorder.start(
			() => this.speaker.say(word, r, p, 1, false, voicekey), 1500,
			(res, conf) => callback(res, conf), 1000,
			(res, conf) => {
				console.log('record timed out without final result');
				callback(res, conf);
			}, 1000
		);
	}
}
class Recorder {
	constructor(lang = 'E') {
		let recognition = this.rec = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.maxAlternatives = 5;
		this.setLanguage(lang); //recognition.lang = 'en-US' ;
		this.isRunning = false;
		this.startHandler = null;
		this.delayAfterStarted = 0;
		this.finalResultHandler = null;
		this.delayAfterFinalResult = 0;
		this.emptyResultHandler = null;
		this.delayAfterEmptyResult = 0;
		this.languageChangeHandler = null;

		this.retryOnError = false;
		this.result = null;
		this.isFinal = null;
		this.confidence = null;

		this.timeoutStart = this.timeoutFinal = this.timeoutEmpty = null;

		recognition.onerror = ev => {
			this.isRunning = false;
			console.error(ev);
			if (this.retryOnError) setTimeout(() => this.rec.start(), 200);
		};
		recognition.onstart = ev => {
			this.isRunning = true;
			this.result = null;
			this.isFinal = null;
			this.confidence = null;

			if (this.startHandler) this.timeoutStart = setTimeout(() => this.startHandler(), this.delayAfterStarted);
			console.log('recorder started!');
		};
		recognition.onresult = ev => {
			this.isFinal = ev.results[0].isFinal;
			this.result = ev.results[0][0].transcript;
			this.confidence = ev.results[0][0].confidence;
			//console.log('recorder got ' + (this.isFinal ? 'FINAL' : '') + ' result:', this.result, '(' + this.confidence + ')');
			if (this.isFinal) this.rec.stop();
			if (this.isFinal && this.finalResultHandler) this.timeoutFinal = setTimeout(() => this.finalResultHandler(this.result, this.confidence), this.delayAfterFinalResult);
		};
		recognition.onend = ev => {
			console.log('recorder ended!!');
			if (!this.isFinal && this.emptyResultHandler) this.timeoutEmpty = setTimeout(() => this.emptyResultHandler(this.result, this.confidence), this.delayAfterEmptyResult);
			if (this.languageChangeHandler) { this.languageChangeHandler(); this.languageChangeHandler = null; }
			this.isRunning = false;
		};
	}
	start(onStart, delayStart, onFinal, delayFinal, onEmpty, delayEmpty, retry = false) {
		this.startHandler = isdef(onStart) ? onStart.bind(this) : null;
		this.delayAfterStarted = isdef(delayStart) ? delayStart : 0;
		this.finalResultHandler = isdef(onFinal) ? onFinal.bind(this) : null;
		this.delayAfterFinalResult = isdef(delayFinal) ? delayFinal : 0;
		this.emptyResultHandler = isdef(onEmpty) ? onEmpty.bind(this) : null;
		this.delayAfterEmptyResult = isdef(delayEmpty) ? delayEmpty : 0;

		//console.log('start:', onStart, delayStart, onFinal, delayFinal, onEmpty, delayEmpty, retry)

		this.retryOnError = retry;
		if (this.interrupt()) return;
		console.log('starting...');
		//???bin nicht sicher ob hier schon isRunning=true setzen muss! https://stackoverflow.com/questions/44226827/how-to-know-if-webkitspeechrecognition-is-started sagt nein!
		this.isRunning = true;
		this.rec.start();
	}
	stop() {
		this.rec.stop();
	}
	interrupt() {
		if (this.isRunning) {
			this.isRunning = false;
			this.rec.abort();
			if (this.timeoutStart) { clearTimeout(this.timeoutStart); this.timeoutStart = null; }
			if (this.timeoutFinal) { clearTimeout(this.timeoutFinal); this.timeoutFinal = null; }
			if (this.timeoutEmpty) { clearTimeout(this.timeoutEmpty); this.timeoutEmpty = null; }
			return true;
		} else return false;
	}
	setLanguage(lang) {
		if (lang == 'E' && this.rec.lang == 'en-US' || lang == 'D' && this.rec.lang == 'de-DE') {
			console.log('language already set to', lang);
			return;
		} else if (this.isRunning) {
			this.languageChangeHandler = () => this.rec.lang = (lang == 'E' ? 'en-US' : 'de-DE');
		} else this.rec.lang = (lang == 'E' ? 'en-US' : 'de-DE');
		// let wasRunning = this.interrupt();
		// if (wasRunning) console.log('recorder has been interrupted to change language!');
		// //else console.log('recorder was NOT running!')
		// this.rec.lang = (lang == 'E' ? 'en-US' : 'de-DE');
	}
}
class Speaker {
	constructor(defaultVolume = .1, lang = 'E') {
		this.timeout1, this.timeout2;
		this.defaultVolume = defaultVolume;
		this.lang = lang;
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
	say(text, r = .5, p = .8, v = .5, interrupt = true, voicekey, callback, lang) {
		if (isdef(lang)) this.lang = lang;
		if (v < 1) v = this.defaultVolume;//.15;
		if (speechSynthesis.speaking) {
			if (!interrupt) return;
			//console.error('speechSynthesis.speaking');
			speechSynthesis.cancel();
			if (isdef(this.timeout1)) clearTimeout(this.timeout1);
			this.timeout1 = setTimeout(() => this.say(text, r, p, v, interrupt, voicekey, callback), 500);
			return;
		} else {
			//console.log('utter call',voicekey)
			this.utter(text, r, p, v, voicekey, callback);
		}

	}

	utter(text, r = .5, p = .8, v = .5, voicekey, callback = null) {

		speechSynthesis.cancel();
		var u = new SpeechSynthesisUtterance();
		//u.text = text;
		let [vkey, voice] = this.findSuitableVoice(text, voicekey);
		//console.log(vkey)
		u.text = sepWords(text, vkey);// 'Hi <silence msec="2000" /> Flash!'; //text.toLowerCase();
		u.rate = r;
		u.pitch = p;
		u.volume = v;
		u.voice = voice;

		u.onend = ev => {
			this.isSpeakerRunning = false;
			if (callback) callback();
		};

		if (GlobalSTOP) return;
		this.isSpeakerRunning = true;
		speechSynthesis.speak(u);
	}
	findSuitableVoice(text, voicekey) {
		//desc ... random | key in voiceNames | starting phrase of voices.name
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
		// console.log('============================')
		// console.log(Array.isArray(voices));
		// for(const v of voices){		console.log(v.name,voiceName,v.name==voiceName);	}
		// console.log('voices:',voices.map(x=>x.name))
		// console.log('THE VOICE IS',voiceName,voice);
		// voices.map(x => console.log(x.name));
		// console.log('===>the voice is', voice);
		return [vkey, voice];
	}

}

//#region Microphone UI

function mMicrophone(dParent) {
	let d = mDiv(dParent);
	d.innerHTML = '🎤';
	//let style = { bg: '#FF413680', rounding: '50%', fz: 50, padding: 5 };
	let bg = getSignalColor();
	let style = { bg: bg, rounding: '50%', fz: 50, padding: 5, transition: 'opacity .35s ease-in-out' };
	mStyleX(d, style);
	mLinebreak(dParent);
	return d;
}
function MicrophoneShow() {
	//could use class blink
	if (RecogOutput) console.log('* mic start')
	MicrophoneUi.style.opacity = 1;
}
function MicrophoneHide() {
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
			let yesItsAMatch=false;
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
	//console.log('matchingNumberOrTime', info.words, bestWord, answer)

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

var BEST150=[
	'adhesive bandage',
	'airplane arrival',
	'airplane departure',
	'ambulance',
	'articulated lorry',
	'automobile',
	'baby',
	'badminton',
	'banjo',
	'baseball',
	'butter',
	'cactus',
	'camera',
	'cat',
	'cherries',
	'cherry blossom',
	'chocolate bar',
	'chopsticks',
	'cloud',
	'coat',
	'cocktail glass',
	'compass',
	'confetti ball',
	'construction site',
	'construction worker',
	'crocodile',
	'crystal ball',
	//'delivery truck',
	'desktop computer',
	'detective',
	'diya lamp',
	'dna',
	'dog',
	'dragon',
	'dress',
	'droplet',
	'drum',
	'duck',
	'dvd',
	'eagle',
	'eggplant',
	'elephant',
	'factory',
	'family of 4',
	'fire engine',
	'fire extinguisher',
	'fireworks',
	'flag in hole',
	'flashlight',
	'fountain',
	//'flying saucer',
	'frog',
	'garlic',
	'gem stone',
	'giraffe',
	'girl',
	'glasses',
	'globe showing Asia-Australia',
	'green apple',
	'green salad',
	'guitar',
	'hamburger',
	'handball',
	'heart suit',
	'helicopter',
	'horse',
	'ice hockey',
	'juggling',
	'kangaroo',
	'keyboard',
	'ladybug',
	'laptop',
	'ledger',
	'leopard',
	'lobster',
	'locomotive',
	'lotus position',
	'love letterlove letter',
	'love-you gesture',
	'magnet',
	'man',
	'man factory worker',
	'man golfing',
	'man singer',
	'man teacher',
	'man technologist',
	'mantelpiece clock',
	'manual wheelchair',
	'maple leaf',
	'massage',
	'mermaid',
	'metro',
	'milky way',
	'monkey',
	'motorcycle',
	'mountain cableway',
	'musical keyboard',
	'office building',
	'onion',
	'optical disk',
	'palm tree',
	'parrot',
	'penguin',
	'person golfing',
	'petri dish',
	'pig',
	'pineapple',
	'pistol',
	'police car',
	'police officer',
	'popcorn',
	'pregnant woman',
	'puzzle piece',
	'rabbit',
	'radio',
	'red apple',
	'red paper lantern',
	'rhinoceros',
	'ringed planet',
	'robot, robot',
	'roll of paper',
	'rose',
	'rosette',
	'safety pin',
	'safety vest',
	'sailboat',
	'satellite',
	'saxophone',
	'scroll',
	'shooting star',
	'shopping bags',
	'skateboard',
	'skunk',
	'small airplane',
	'snowflake',
	'soap',
	'sparkles',
	'speaker high volume',
	'standing',
	'station',
	'sunflower',
	'sunglasses',
	'swimming',
	'television',
	'test tube',
	'thermometer',
	'thumbs up',
	'tiger',
	'tornado',
	'tractor',
	'train',
	'trophy',
	'tropical drink',
	'trumpet',
	'turkey',
	'umbrella',
	'vampire',
	'volcano',
	'watermelon',
	'white flower',
	'world map',
	'wrench',
];

var BEST100=[
	'adhesive bandage',
	'airplane arrival',
	'airplane departure',
	'ambulance',
	'articulated lorry',
	'automobile',
	'baby',
	'badminton',
	'banjo',
	'baseball',
	'butter',
	'cactus',
	'camera',
	'cat',
	//'cherries',
	//'cherry blossom',
	'chocolate bar',
	'chopsticks',
	'cloud',
	'coat',
	'cocktail glass',
	'compass',
	'confetti ball',
	'construction site',
	'construction worker',
	'crocodile',
	'crystal ball',
	//'delivery truck',
	'desktop computer',
	'detective',
	'diya lamp',
	'dna',
	'dog',
	'dragon',
	'dress',
	'droplet',
	'drum',
	'duck',
	'dvd',
	'eagle',
	'eggplant',
	'elephant',
	'factory',
	'family of 4',
	'fire engine',
	'fire extinguisher',
	'fireworks',
	'flag in hole',
	'flashlight',
	'fountain',
	//'flying saucer',
	'frog',
	'garlic',
	'gem stone',
	'giraffe',
	'girl',
	'glasses',
	'globe showing Asia-Australia',
	'green apple',
	'green salad',
	'guitar',
	'hamburger',
	'handball',
	'heart suit',
	'helicopter',
	'horse',
	'ice hockey',
	'juggling',
	'kangaroo',
	'keyboard',
	'ladybug',
	'laptop',
	'ledger',
	'leopard',
	'lobster',
	'locomotive',
	'lotus position',
	'love letterlove letter',
	'love-you gesture',
	'magnet',
	'man',
	'man factory worker',
	'man golfing',
	'man singer',
	'man teacher',
	'man technologist',
	'mantelpiece clock',
	'manual wheelchair',
	'maple leaf',
	'massage',
	'mermaid',
	'metro',
	'milky way',
	'monkey',
	'motorcycle',
	'mountain cableway',
	'musical keyboard',
	'office building',
	'onion',
	'optical disk',
	'palm tree',
	'parrot',
	'penguin',
	'person golfing',
	'petri dish',
	'pig',
	'pineapple',
	'pistol',
	'police car',
	'police officer',
	'popcorn',
	'pregnant woman',
	'puzzle piece',
	'rabbit',
	'radio',
	'red apple',
	'red paper lantern',
	'rhinoceros',
	'ringed planet',
	'robot, robot',
	'roll of paper',
	'rose',
	'rosette',
	'safety pin',
	'safety vest',
	'sailboat',
	'satellite',
	'saxophone',
	'scroll',
	'shooting star',
	'shopping bags',
	'skateboard',
	'skunk',
	'small airplane',
	'snowflake',
	'soap',
	'sparkles',
	'speaker high volume',
	'standing',
	'station',
	'sunflower',
	'sunglasses',
	'swimming',
	'television',
	'test tube',
	'thermometer',
	'thumbs up',
	'tiger',
	'tornado',
	'tractor',
	'train',
	'trophy',
	'tropical drink',
	'trumpet',
	'turkey',
	'umbrella',
	'vampire',
	'volcano',
	'watermelon',
	'white flower',
	'world map',
	'wrench',
];

var BEST50=[
	'adhesive bandage',
	'airplane arrival',
	'airplane departure',
	'ambulance',
	'articulated lorry',
	'automobile',
	'baby',
	'badminton',
	'banjo',
	'baseball',
	'butter',
	'cactus',
	'camera',
	'cat',
	//'cherries',
	//'cherry blossom',
	'chocolate bar',
	'chopsticks',
	'cloud',
	'coat',
	'cocktail glass',
	'compass',
	'confetti ball',
	'construction site',
	'construction worker',
	'crocodile',
	'crystal ball',
	//'delivery truck',
	'desktop computer',
	'detective',
	'diya lamp',
	'dna',
	'dog',
	'dragon',
	'dress',
	'droplet',
	'drum',
	'duck',
	'dvd',
	'eagle',
	'eggplant',
	'elephant',
	'factory',
	'family of 4',
	'fire engine',
	'fire extinguisher',
	'fireworks',
	'flag in hole',
	'flashlight',
	'fountain',
	//'flying saucer',
	'frog',
	'garlic',
	'gem stone',
	'giraffe',
	'girl',
	'glasses',
	'globe showing Asia-Australia',
	'green apple',
	'green salad',
	'guitar',
	'hamburger',
	'handball',
	'heart suit',
	'helicopter',
	'horse',
	'ice hockey',
	'juggling',
	'kangaroo',
	'keyboard',
	'ladybug',
	'laptop',
	'ledger',
	'leopard',
	'lobster',
	'locomotive',
	'lotus position',
	'love letterlove letter',
	'love-you gesture',
	'magnet',
	'man',
	'man factory worker',
	'man golfing',
	'man singer',
	'man teacher',
	'man technologist',
	'mantelpiece clock',
	'manual wheelchair',
	'maple leaf',
	'massage',
	'mermaid',
	'metro',
	'milky way',
	'monkey',
	'motorcycle',
	'mountain cableway',
	'musical keyboard',
	'office building',
	'onion',
	'optical disk',
	'palm tree',
	'parrot',
	'penguin',
	'person golfing',
	'petri dish',
	'pig',
	'pineapple',
	'pistol',
	'police car',
	'police officer',
	'popcorn',
	'pregnant woman',
	'puzzle piece',
	'rabbit',
	'radio',
	'red apple',
	'red paper lantern',
	'rhinoceros',
	'ringed planet',
	'robot, robot',
	'roll of paper',
	'rose',
	'rosette',
	'safety pin',
	'safety vest',
	'sailboat',
	'satellite',
	'saxophone',
	'scroll',
	'shooting star',
	'shopping bags',
	'skateboard',
	'skunk',
	'small airplane',
	'snowflake',
	'soap',
	'sparkles',
	'speaker high volume',
	'standing',
	'station',
	'sunflower',
	'sunglasses',
	'swimming',
	'television',
	'test tube',
	'thermometer',
	'thumbs up',
	'tiger',
	'tornado',
	'tractor',
	'train',
	'trophy',
	'tropical drink',
	'trumpet',
	'turkey',
	'umbrella',
	'vampire',
	'volcano',
	'watermelon',
	'white flower',
	'world map',
	'wrench',
];

var BEST80=[
	'adhesive bandage',
	'ambulance',
	'articulated lorry',
	'automobile',
	'baby',
	'cactus',
	'camera',
	'cat',
	'chocolate bar',
	'chopsticks',
	'cloud',
	'compass',
	'crocodile',
	'desktop computer',
	'dna',
	'dog',
	'dragon',
	'dress',
	'duck',
	'eagle',
	'eggplant',
	'elephant',
	'flashlight',
	'frog',
	'garlic',
	'giraffe',
	'glasses',
	'guitar',
	'heart suit',
	'helicopter',
	'kangaroo',
	'keyboard',
	'ladybug',
	'lobster',
	'locomotive',
	'magnet',
	'mantelpiece clock',
	'manual wheelchair',
	'monkey',
	'motorcycle',
	'palm tree',
	'parrot',
	'penguin',
	'pig',
	'pineapple',
	'pistol',
	'police officer',
	'popcorn',
	'pregnant woman',
	'rabbit',
	'radio',
	'red apple',
	'rhinoceros',
	'robot, robot',
	'roll of paper',
	'rose',
	'saxophone',
	'skateboard',
	'skunk',
	'small airplane',
	'snowflake',
	'thermometer',
	'tiger',
	'tornado',
	'tractor',
	'trophy',
	'trumpet',
	'umbrella',
	'volcano',
	'watermelon',
];

var BEST100_E;
var BEST100_D;



