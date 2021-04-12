//#region Markers
const MarkerText = ['✔️', '❌'];
const MarkerId = { SUCCESS: 0, FAIL: 1 };
var Markers = [];
function markerSuccessNew(ui, sz) {
	let d = createMarker(MarkerId.SUCCESS);
	if (nundef(ui)) return d;

	if (nundef(sz)) sz = getRect(ui).h;
	let top = (cy - sz * 2 / 3);
	let left = (cx - sz / 3);
	sz *= 4 / 5;
	mpOver(d, ui, sz, 'limegreen', 'segoeBlack');
	return d;
}
function markerSuccess() { return createMarker(MarkerId.SUCCESS); }
function markerFail() { return createMarker(MarkerId.FAIL); }
function createMarker(markerId) {
	//<div class='feedbackMarker'>✔️</div>
	let d = mCreate('div');
	d.innerHTML = MarkerText[markerId]; //>0? '✔️':'❌';
	mClass(d, 'feedbackMarker');
	document.body.appendChild(d);
	Markers.push(d);
	return d;
}
function mRemoveGracefully(elem) {
	mClass(elem, 'aniFastDisappear');
	setTimeout(() => mRemove(elem), 500);
}
function removeMarkers() {
	for (const m of Markers) {
		mRemoveGracefully(m);
	}
	Markers = [];
}
