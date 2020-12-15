class Game {
	constructor() {
	}
	clear() { clearTimeout(this.TO); clearFleetingMessage(); }//console.log(getFunctionCallerName()); }
	startGame() { }//console.log(getFunctionCallerName()); }
	startLevel() { }//console.log(getFunctionCallerName()); }
	startRound() { }//console.log(getFunctionCallerName()); }
	prompt() {
		//console.log(getFunctionCallerName());
		showPictures(evaluate);
		setGoal();
		showInstruction(Goal.label, 'click', dTitle, true);
		activateUi();
	}
	trialPrompt() {
		//console.log(getFunctionCallerName());
		Speech.say(Settings.language == 'D' ? 'nochmal!' : 'try again!');
		if (Settings.showHint) shortHintPic();
		return 10;
	}
	activate() { }//console.log(getFunctionCallerName()); }
	interact() { }//console.log(getFunctionCallerName()); }
	eval(ev) {
		//console.log(getFunctionCallerName());
		let id = evToClosestId(ev);
		ev.cancelBubble = true;

		let i = firstNumber(id);
		let item = Pictures[i];
		Selected = { pic: item, feedbackUI: item.div, sz: getBounds(item.div).height };

		Selected.reqAnswer = Goal.label;
		Selected.answer = item.label;

		if (item.label == Goal.label) { return true; } else { return false; }
	}
	recycle() { }//console.log(getFunctionCallerName()); }
}

function colorBright(c, percent) {
	let hex = colorHex(c);
	// strip the leading # if it's there
	hex = hex.replace(/^\s*#|\s*$/g, '');

	// convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
	if (hex.length == 3) {
		hex = hex.replace(/(.)/g, '$1$1');
	}

	var r = parseInt(hex.substr(0, 2), 16),
		g = parseInt(hex.substr(2, 2), 16),
		b = parseInt(hex.substr(4, 2), 16);

	return '#' +
		((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
		((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
		((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}
function colorBright1(c, percent = 50) {
	let hsl = colorHSL(c, true);
	let hNew = { h: hsl.h, s: hsl.s, l: hsl.l + hsl.l * (percent / 100) }
	return hNew;
}
