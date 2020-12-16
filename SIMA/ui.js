//#region init UI
function initTable() {
	let table = mBy('table');
	clearElement(table);

	initLineTop();
	initLineTitle();
	initLineTable();
	initLineBottom();

	dTable = dLineTableMiddle;
	dTitle = dLineTitleMiddle;
	//console.log(dTable,dTitle)
}
function initSidebar() {
	let dParent = mBy('sidebar');
	clearElement(dParent);
	
	// let user = mText(USERNAME, dParent);
	//editableUsernameUi(dParent);


	//let title = mText('history:', dParent);
	dLeiste = mDiv(dParent);
	//dLeiste = mBy('sidebar')
	mStyleX(dLeiste, { 'min-width':70, 'max-height': '100vh', display: 'flex', 'flex-flow': 'column wrap' });
}
function initAux() {
	dAux = mBy('dAux');
}
function initLineTop() {
	dLineTopOuter = mDiv(table); dLineTopOuter.id = 'lineTopOuter';
	dLineTop = mDiv(dLineTopOuter); dLineTop.id = 'lineTop';
	dLineTopLeft = mDiv(dLineTop); dLineTopLeft.id = 'lineTopLeft';
	dLineTopRight = mDiv(dLineTop); dLineTopRight.id = 'lineTopRight';
	dLineTopMiddle = mDiv(dLineTop); dLineTopMiddle.id = 'lineTopMiddle';

	dScore = mDiv(dLineTopMiddle);
	dScore.id = 'dScore';

	dLevel = mDiv(dLineTopLeft);
	dLevel.id = 'dLevel';

	dGameTitle = mDiv(dLineTopRight);
	dGameTitle.id = 'dGameTitle';
	let d = mDiv(dLineTopRight);
	d.id = 'time';

	mLinebreak(table);
}
function initLineTitle() {
	dLineTitleOuter = mDiv(table); dLineTitleOuter.id = 'lineTitleOuter';
	dLineTitle = mDiv(dLineTitleOuter); dLineTitle.id = 'lineTitle';
	dLineTitleLeft = mDiv(dLineTitle); dLineTitleLeft.id = 'lineTitleLeft';
	dLineTitleRight = mDiv(dLineTitle); dLineTitleRight.id = 'lineTitleRight';
	dLineTitleMiddle = mDiv(dLineTitle); dLineTitleMiddle.id = 'lineTitleMiddle';

	mLinebreak(table);
}
function initLineTable() {
	dLineTableOuter = mDiv(table); dLineTableOuter.id = 'lineTableOuter';
	dLineTable = mDiv(dLineTableOuter); dLineTable.id = 'lineTable';
	dLineTableLeft = mDiv(dLineTable); dLineTableLeft.id = 'lineTableLeft';
	dLineTableMiddle = mDiv(dLineTable); dLineTableMiddle.id = 'lineTableMiddle';
	mClass(dLineTableMiddle, 'flexWrap');
	dLineTableRight = mDiv(dLineTable); dLineTableRight.id = 'lineTableRight';

	mLinebreak(table);
}
function initLineBottom() {
	dLineBottomOuter = mDiv(table); dLineBottomOuter.id = 'lineBottomOuter';
	dLineBottom = mDiv(dLineBottomOuter); dLineBottom.id = 'lineBottom';
	dLineBottomLeft = mDiv(dLineBottom); dLineBottomLeft.id = 'lineBottomLeft';
	dLineBottomRight = mDiv(dLineBottom); dLineBottomRight.id = 'lineBottomRight';
	dLineBottomMiddle = mDiv(dLineBottom); dLineBottomMiddle.id = 'lineBottomMiddle';

	mLinebreak(table);
}
//#endregion

//#region Markers
const MarkerText = ['✔️', '❌'];
const MarkerId = { SUCCESS: 0, FAIL: 1 };
var Markers = [];
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
//#endregion


