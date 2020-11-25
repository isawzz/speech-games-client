class Speech2 {
	constructor(lang) {
		this.recorder = new Recorder2(lang);
		this.speaker = new Speaker2(lang);
	}
	train() {

	}
	setLanguage(lang) {
		this.speaker.setLanguage(lang);
		this.recorder.setLanguage(lang);
	}
	isSpeakerRunning() { return this.speaker.isRunning; }
	startRecording(lang, callback) {
		this.recorder.callback = callback;
		this.recorder.setLanguage(lang);
		this.recorder.start();
	}
	stopRecording() {
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

class Recorder2 {
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
		//handlers

		this.callback = null;
		// this.cStart = null;
		// this.cFinal = null;
		// this.cEmpty = null;
		// this.timeoutStart = this.timeoutFinal = this.timeoutEmpty = null;

		let genHandler = (ev, name) => {
			if (RecogOutput) console.log('recorder', name, 'isCancelled', this.isCancelled, 'isRunning', this.isRunning);
		}
		rec.onerror = ev => {
			genHandler(ev, 'error');
			if (RecogOutputError) console.error(ev);
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
				console.log('-------------------------')
				this.callback(this.isFinal, this.result, this.confidence);
			}
			this.isCancelled = this.isRunning = false;
			this.callback = null;
		};
		// rec.onerror = ev => {
		// 	if (RecogOutput) console.log('recorder onerror!!!, isCancelled', this.isCancelled, 'isRunning',this.isRunning);
		// 	if (RecogOutputError) console.error(ev);
		// };
		// rec.onstart = ev => {
		// 	//timit.show('onstart mic') 
		// 	if (RecogOutput) console.log('recorder onstart!!!, isCancelled', this.isCancelled, 'isRunning',this.isRunning);
		// };
		// rec.onresult = ev => {
		// 	if (RecogOutput) console.log('recorder onresult!!!, isCancelled', this.isCancelled, 'isRunning',this.isRunning);
		// };
		// rec.onend = ev => {
		// 	if (RecogOutput) console.log('recorder ended!!!, isCancelled', this.isCancelled, 'isRunning',this.isRunning);
		// };

	}
	processResult(ev) {
		console.log('**********', ev)
		let res = ev.results[0];
		this.isFinal = res.isFinal;
		this.result = res[0].transcript;
		this.confidence = res[0].confidence;

		console.log('....result', this.result, 'FINAL?', this.isFinal)

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
		MicrophoneHide();
		setTimeout(() => this.rec.stop(), 10);
	}
	getLastResult() {
		//should be of form {isFinal:,result:,confidence:}
		return { isFinal: this.isFinal, result: this.result, confidence: this.confidence };
	}
}
class Speaker2 {
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
		console.log('init speaker...')
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