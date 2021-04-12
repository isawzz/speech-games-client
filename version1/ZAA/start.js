async function _start() {
	initTable(); initSidebar(); initAux(); initScore();
	loadUser('gul');
	startUnit();
}
function startUnit() {
	renewTimer(G,'time'); //console.log('time',G.showTime,'should be started')
	U.session = {};
	if (PROD_START) { PROD_START = false; onClickTemple(); } else startGame();

}

