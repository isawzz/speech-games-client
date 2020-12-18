//#region create + show
function showPics(dParent, { lang = 'E', num = 1, repeat = 1, numLabels, sameBackground = true, keys, labels, clickHandler, colors, contrast, border } = {}) {
	let pics = [];

	if (nundef(keys)) keys = choose(symKeysBySet['nosymbols'], num);
	//keys[0]='man in manual wheelchair';
	//keys=['sun with face'];
	//console.log(keys,repeat)
	//console.log(labels)
	pics = maShowPictures(keys, labels, dParent, clickHandler,
		{ repeat: repeat, sameBackground: sameBackground, border: border, lang: lang, colors: colors, contrast: contrast });

	// if (nundef(keys)) keys = choose(G.keys, G.numPics);
	// Pictures = maShowPictures(keys,labels,dTable,onClickPictureHandler,{ colors, contrast });

	let totalPics = pics.length;
	//console.log(totalPics,G.numLabels)
	if (nundef(Settings.labels) || Settings.labels) {
		if (nundef(numLabels) || numLabels == totalPics) return pics;
		let remlabelPic = choose(pics, totalPics - numLabels);
		for (const p of remlabelPic) {
			//console.log('hi1');
			maHideLabel(p.id, p.info); p.isLabelVisible = false;
		}
	} else {
		for (const p of pics) {
			//console.log('hi1');
			maHideLabel(p.id, p.info); p.isLabelVisible = false;
		}

	}
	return pics;

}

//#region isFaceUp
function aniTurnFaceDown(pic, msecs = 5000, fadeBackground = false) {
	let ui = pic.div;
	for (const p1 of ui.children) {
		p1.style.transition = `opacity ${msecs}ms ease-in-out`;
		//p1.style.transition = `opacity ${msecs}s ease-in-out, background-color ${msecs}s ease-in-out`;
		p1.style.opacity = 0;
		//p1.style.backgroundColor = 'dimgray';
		//mClass(p1, 'transopaOff'); //aniSlowlyDisappear');
	}
	if (fadeBackground) {
		ui.style.transition = `background-color ${msecs}ms ease-in-out`;
		ui.style.backgroundColor = 'dimgray';
	}
	//ui.style.backgroundColor = 'dimgray';
	pic.isFaceUp = false;

}
function turnFaceDown(pic) {
	let ui = pic.div;
	for (const p1 of ui.children) p1.style.opacity = 0; //hide(p1);
	ui.style.backgroundColor = 'dimgray';
	pic.isFaceUp = false;

}
function turnFaceUp(pic) {
	let div = pic.div;
	for (const ch of div.children) {
		ch.style.transition = `opacity ${1}s ease-in-out`;
		ch.style.opacity = 1; //show(ch,true);
		if (!pic.isLabelVisible) break;
	}
	div.style.transition = null;
	div.style.backgroundColor = pic.bg;
	pic.isFaceUp = true;
}
function toggleFace(pic) { if (pic.isFaceUp) turnFaceDown(pic); else turnFaceUp(pic); }

function turnPicsDown(pics, msecs, fadeBackground) {
	//console.log(arguments)
	for (const p of pics) { aniTurnFaceDown(p, msecs, fadeBackground); }
}

//#region isSelected
function toggleSelectionOfPicture(pic,selectedPics) {
	let ui = pic.div;
	//if (pic.isSelected){pic.isSelected=false;mRemoveClass(ui,)}
	pic.isSelected = !pic.isSelected;
	if (pic.isSelected) mClass(ui, 'framedPicture'); else mRemoveClass(ui, 'framedPicture');

	//if picList is given, add or remove pic according to selection state
	if (isdef(selectedPics)){
		if (pic.isSelected) {
			console.assert(!selectedPics.includes(pic),'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
			selectedPics.push(pic);
		}else{
			console.assert(selectedPics.includes(pic),'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
			removeInPlace(selectedPics,pic);
		}
	}
}
