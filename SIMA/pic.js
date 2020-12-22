//#region card face up or down
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

//#region selection of picture
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























