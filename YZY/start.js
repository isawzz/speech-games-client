async function _start() {
	initTable(); initSidebar(); initAux(); initScore(); loadUser(); //timit = new TimeIt('*timer', true);

	startUnit();
	//setBackgroundColor('green');	let b = new ChessBoard();

	//#region tests
	//let list = getRandomFractions(4);console.log('fractions',list);
	//btest11_fractions();//bTest10();//bTest09(); //bTest08();//bTest07();	//bTest06();//bTest05();//bTest04(); //bTest03();
	
	// let x=bTest03_async();
	// console.log('x',x);
	// CANCEL_AI=true;


	//bTest01();
	//bTest02();
	//test15();
	// console.log(checkBoardEmpty(new Array().fill(' ')));
	// console.log(checkBoardFull(new Array().fill('s')));
	//let x=checkWinnerTTT(["O", "O", "X", "X", "O", " ", "O", "X", "X"],3,3);	console.log('x',x);

	//console.log('G', G, 'U', U);
	// let keys = SymKeys;//.filter(x=>x.includes('bookmark') || x.includes('box'));
	// let app = new ItemViewerClass(dTable, dLineTitleRight, keys);

	//console.log('dTable', dTable);
	// mBackground(BLUEGREEN);
	// mCenterFlex(dTable);
	// let styles = { margin: 4, w: 150, h: 150, bg: 'white', fg: 'black' };
	// let items = iGrid(3, 3, dTable, styles);
	//ich will jetzt das game ttt spielen gegen computer!
	//#endregion
}
function startUnit() {
	renewTimer(G, 'time'); //console.log('time',G.showTime,'should be started')
	U.session = {};
	if (START_IN_MENU) { START_IN_MENU = false; onClickTemple(); } else GC.startGame();

}

