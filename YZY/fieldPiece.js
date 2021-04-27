function iEnableSelect(item, handler) {
	if (item.isSelectEnabled == true) return;
	let d = iDov(item);
	d.onclick = handler;
	item.isSelectEnabled = true;
	mClass(d, 'overlayActive');
}
function iDisableSelect(item) {
	if (nundef(item.isSelectEnabled)) return;
	let d = iDov(item);
	d.onclick = null;
	mRemoveClass(d, 'overlayActive');
	item.isSelectEnabled = null;
}
function iSelect(item) {
	if (!item.isSelectEnabled || item.isSelected) return;
	let d = iDov(item);
	item.isSelected = true;
	mClass(d, 'overlaySelected');

}
function iUnselect(item) {
	if (!item.isSelected) return;
	//console.log('yes')
	let d = iDov(item);
	mRemoveClass(d, 'overlaySelected');
	delete item.isSelected;

}
function endInteraction() {
	let items = G.board.items;
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		if (item.isSelected) {
			//console.log('frame needs to be removed!',item)
			iUnselect(items[i]);
		}
		if (item.isSelectEnabled) {
			//console.log('shading needs to be removed!',item)
			iDisableSelect(item);
		}
	}
}
function performMove(source, target) {
	//source is board item from which this move originated
	//target is board item this piece is moving to
	//source needs to be emptied!
	//wie geht das?
	let iPiece = G.board.makeFieldEmpty(source);
	//console.log('piece',ChessPieces[iPiece].name,'removed from',source.index);

	let iPieceLost = G.board.makeFieldEmpty(target);
	if (isdef(iPieceLost)) console.log('piece', ChessPieces[iPieceLost].name, 'removed from', source.index);
	//else console.log('no piece removed!')
	//add iPiece to target

	G.board.addPiece(target, iPiece);

	//deactivate all fields!
	endInteraction();
	GC.evaluate();
}
function unselectPreviousItemAndTargets(item) {
	iUnselect(item);
	for (const i of item.targets) {
		let item1 = G.board.items[i];
		iDisableSelect(item1);
	}
	return item;
}
function selectItemAndTargets(item) {
	iSelect(item);
	for (const i of item.targets) {
		let item1 = G.board.items[i];
		iEnableSelect(item1, () => performMove(item, item1));
	}
	return item;
}












