

function aniFadeInOut(elem, secs) {
	mClass(elem, 'transopaOn');
	//dLineBottomMiddle.opacity=0;
	//mClass(dLineBottomMiddle,'aniFadeInOut');
	return setTimeout(() => { mRemoveClass(elem, 'transopaOn'); mClass(elem, 'transopaOff'); }, secs * 1000);
}
function saveStats() {
	let g = lastCond(CurrentSessionData.games, x => x.name == 'gSayPicAuto');
	let xxx = arrLast(g.levels).items;
	let yyy = xxx.map(x => {
		let res = { key: x.goal.key };
		res[Settings.language] = { answer: x.goal.answer, req: x.goal.reqAnswer, conf: x.goal.confidence, isCorrect: x.isCorrect };
		return res;
	});
	downloadAsYaml({ data: yyy }, Settings.language + '_' + Settings.categories[0] + '_data');

}

function cardFace({ rank, suit, key } = {}, w, h) {
	let cardKey, svgCode;
	//console.log('cardFace',rank,suit,key,w,h)
	if (isdef(key)) {
		cardKey = key;
		svgCode = testCards[cardKey];
		if (!svgCode) svgCode = vidCache.getRandom('c52');
	} else {
		if (nundef(rank)) { rank = '2'; suit = 'B'; } //face down card!
		if (rank == '10') rank = 'T';
		if (rank == '1') rank = 'A';
		if (nundef(suit)) suit = 'H';//joker:J1,J2, back:1B,2B
		cardKey = 'card_' + rank + suit;
		svgCode = c52[cardKey]; //c52 is cached asset loaded in _start
		//console.log(cardKey,c52[cardKey])
	}
	svgCode = '<div>' + svgCode + '</div>';
	let el = createElementFromHTML(svgCode);
	if (isdef(h)) { mSize(el, w, h); }
	//console.log('__________ERGEBNIS:',w,h)
	return el;
}



//#region tests
function test01_colors() {


	let x = randomColorX('hotpink', 50, 80);
	console.log(colorLum('yellow'))

}
//#endregion

















