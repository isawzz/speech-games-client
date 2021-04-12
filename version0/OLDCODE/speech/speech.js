var RecogOutput = false;
var RecogOutputError = false;
var RecogHighPriorityOutput = true;
var SpeakerOutput = false;
var MicrophoneUi;
var SessionId;

class SpeechAPI {
	constructor(lang) {
		this.recorder = new Recorder(lang);
		this.speaker = new Speaker(lang);
		SessionId = Date.now();
	}
	train() {

	}
	setLanguage(lang) {
		this.speaker.setLanguage(lang);
		this.recorder.setLanguage(lang);
	}
	isSpeakerRunning() { return this.speaker.isRunning; }
	startRecording(lang, callback) {
		this.recorder.isCancelled = false;
		this.recorder.callback = callback;
		this.recorder.setLanguage(lang);
		this.recorder.start();
	}
	stopRecording() {
		this.recorder.isCancelled = true;
		this.recorder.stop();
	}

	say(text, r = .5, p = .8, v = .5, voicekey, callback, lang) {
		
		//what happens if change lang in the middle of speaking???
		if (isdef(lang)) this.speaker.setLanguage(lang);
		this.speaker.enq(arguments);
		this.speaker.deq();
	}

	stopSpeaking() {
		this.speaker.clearq();
	}

}

class Recorder {
	constructor(lang) {
		let rec = this.rec = new webkitSpeechRecognition();
		rec.continuous = true;
		rec.interimResults = true;
		rec.maxAlternatives = 5;
		this.setLanguage(lang);
		//flags
		this.isRunning = false;
		this.isCancelled = false;
		//result
		this.result = null;
		this.isFinal = null;
		this.confidence = null;

		this.callback = null;

		let genHandler = (ev, name) => {
			if (RecogOutput) console.log('recorder', name, 'isCancelled', this.isCancelled, 'isRunning', this.isRunning);
		}
		rec.onerror = ev => {
			genHandler(ev, 'error');
			if (RecogOutputError) console.error(ev);
			this.stop();
		};
		rec.onstart = ev => {
			genHandler(ev, 'started');
			if (!this.isCancelled) this.isRunning = true;
		};
		rec.onresult = ev => {
			genHandler(ev, 'result!');
			if (!this.isCancelled) this.processResult(ev);
		};
		rec.onend = ev => {
			genHandler(ev, 'ended');
			if (!this.isCancelled && this.callback) {
				//console.log('-------------------------')
				this.callback(this.isFinal, this.result, this.confidence, SessionId);
			}
			this.isCancelled = this.isRunning = false;
			this.callback = null;
		};

	}
	processResult(ev) {
		//console.log('**********', ev)
		let res = ev.results[0];
		this.isFinal = res.isFinal;
		this.result = res[0].transcript;
		this.confidence = res[0].confidence;

		if (this.isFinal) console.log('....result', this.result, 'FINAL?', this.isFinal)

		if (this.isFinal) {
			this.stop();
		}
	}
	setLanguage(lang) { this.rec.lang = (lang == 'E' ? 'en-US' : 'de-DE'); }
	start() {
		MicrophoneShow();
		setTimeout(() => this.rec.start(), 10);
	}
	stop() {
		//console.log('stopping!')
		MicrophoneHide();
		setTimeout(() => this.rec.stop(), 10);
	}
	getLastResult() {
		//should be of form {isFinal:,result:,confidence:}
		return { isFinal: this.isFinal, result: this.result, confidence: this.confidence };
	}
}
class Speaker {
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
	constructor(lang) {
		//console.log('init speaker...')
		this.lang = lang;
		this.q = [];
		this.isRunning = false;
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
	enq(args) { this.q.push(args); }
	deq() {
		if (!isEmpty(this.q)) {
			let args = this.q.pop();
			this.utter(...args);
		} else {
			this.isRunning = false;

		}
	}
	clearq() {
		this.q = [];
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
			if (isdef(callback)) callback();

			this.deq();
		};

		this.isRunning = true;
		speechSynthesis.speak(u);
	}
	findSuitableVoice(text, voicekey) {
		// voicekey ... random | key in voiceNames | starting phrase of voices.name
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
		return [vkey, voice];
	}

}


//#region Microphone UI

function mMicrophone(dParent,color) {
	let d = mDiv(dParent);
	d.innerHTML = '🎤';

	let c = bestContrastingColor(color,['yellow','orange','red']);
	//let style = { bg: '#FF413680', rounding: '50%', fz: 50, padding: 5 };
	let bg = c; 
	let style = { bg: bg, rounding: '50%', fz: 50, padding: 5, transition: 'opacity .35s ease-in-out' };
	mStyleX(d, style);
	mLinebreak(dParent);
	return d;
}
function MicrophoneShow() {
	//could use class blink
	if (nundef(MicrophoneUi)) return;
	if (RecogOutput) console.log('* mic start')
	MicrophoneUi.style.opacity = 1;
}
function MicrophoneHide() {
	if (nundef(MicrophoneUi)) return;
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
			let yesItsAMatch = false;
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
