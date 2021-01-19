
function maShowCards(keys, labels, dParent, onClickPictureHandler, { showRepeat, containerForLayoutSizing, lang, border, picSize, bgs, colorKeys, contrast, repeat = 1, sameBackground, shufflePositions = true } = {}, { sCont, sPic, sText } = {}) {
	Pictures = [];

	//zInno('Steam Engine',dParent); return;

	keys = zInnoRandom(10); // ['Gunpowder']; //zInnoRandom(10); 
	keys.map(x => zInno(x, dParent)); //console.log(keys); 	

	let cards = [];
	for (const k of keys) {
		let card = zInno(k, dParent);
		cards.push(card);
		zMeasure(card);
	}

	//test09_zViewer(); return;;
	//test10_zViewerClockCrownFactory(); return;
	//test08_towerAndOtherSymbols(dParent); return;
	//test07_showDeck(dParent);
	//test06_showCards(dParent); 
	//test05_ElectricitySuburbia(dParent);
	//test04_Electricity(dParent); return;
	//test03_lighbulb(dParent); return;
	//test00_oldMaPic(dParent); 
	//test02_zPic(dParent);test01_oldMaPicAusgleichVonPadding(dParent); return;
	// let c=card52();	console.log(c);	
	// showSingle52(dParent);


	//showAllInnoCards(dParent);

	return;

	mLinebreak(dParent);

	showDeck(keys, dParent, 'left', 100)
	keys = getRandomCards(5, { type: 'inno', color: 'green' }); console.log(keys);
	showDeck(keys, dParent, 'left', 100)
	keys = getRandomCards(5, { type: 'inno', color: 'blue' }); console.log(keys);
	showDeck(keys, dParent, 'left', 100)
	keys = getRandomCards(5, { type: 'inno', color: 'yellow' }); console.log(keys);
	showDeck(keys, dParent, 'left', 100)
	keys = getRandomCards(5, { type: 'inno', color: 'purple' }); console.log(keys);
	showDeck(keys, dParent, 'left', 100)
}






