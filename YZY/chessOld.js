class GChess extends G2Player {
	createBoard() {
		this.board = new ChessBoard(this.rows, this.cols, this.controller.uiInteract.bind(this.controller));

	}
	setStartPosition() { this.board.setInitialPosition(); }
	startGame() {
		super.startGame();
		this.createBoard();
		this.setStartPosition();
		this.human.color = 'white';
		this.ai.color = 'black';
	}
	interact(ev) {
		let tile = evToItemC(ev);

		if (isdef(tile.label)) return; //illegal move!
		let pl = this.plTurn;

		addLabel(tile, pl.sym, { fz: 60, fg: pl.color });
		this.controller.evaluate(tile);
	}
	prompt() {
		let msg = this.plTurn == this.ai ? 'Ai thinking...' : 'Player on turn:';
		showInstruction(this.plTurn.color, msg, dTitle, false);


		this.controller.activateUi();
	}
	getPiece(state, idx) {
		let arr = state;
		let pieceKey = arr[idx];

	}
	getPlayerPieces(state, pl) {
		let pieces = [];
		for (let i = 0; i < state.length; i++) {
			if (state[i][0] == pl.color[0]) {
				//let [r,c]=
				pieces.push({ piece: state[i], idx: i });
				movesPerPiece[i] = Rook.getMoves(state, i, 8, 8);
				console.log('rook moves for piece', i, movesPerPiece[i]);
			}
		}
	}
	onSelect(ev) {
		let item = evToItemC(ev);
		if (item == this.selectedItem) return;
		else if (isdef(this.selectedItem)) unselectPreviousItemAndTargets(this.selectedItem);
		this.selectedItem = selectItemAndTargets(item);
	}
	activate() {
		let pl = this.plTurn;
		let opp = this.plOpp;
		let autoplay = false;
		let manual = true;
		if (!manual && (autoplay || pl == this.ai)) {
			if (this.ai == pl) uiActivated = false;
			//showCancelButton();

			//AIMinimax(this,this.afterComputerMove)		
			setTimeout(() => AIMinimax(this, this.afterComputerMove.bind(this)), 200);

			//console.log('halloooooooooooooooooo')

			// this.TO = setTimeout(() => {
			// 	AIMinimax(this,this.afterComputerMove.bind(this));
			// 	console.log('...sollte das gleich schreiben!!!')
			// }, 10); //DELAY
		} else {
			let state = this.getState();
			let [plPieces, avMoves] = this.getAvailableMoves(state, pl, opp);
			if (isEmpty(avMoves)) { this.controller.evaluate(true); }
			else this.activatePiecesThatCanMove(plPieces);
		}
	}
	getAvailableMoves(state, pl, opp) {
		let plPieces = getMovesPerPiece(state, pl, G.rows, G.cols);

		let rochadeMoves = getMoveRochade(state,pl,G.rows, G.cols);


		for (const p in plPieces) { plPieces[p].avMoves = []; }
		let avMoves = [];
		//clearChessPieces();
		for (const from in plPieces) {
			for (const to of plPieces[from].moves) {
				let move = { from: from, to: to };
				//console.log('checking move',move);
				let newState = G.applyMove(state, move, pl);
				//console.log('state',state,'newState',newState);
				//return;
				//check if in the new situation, king is in check or not!
				let isCheck = isKingInCheck(newState, pl, opp, G.rows, G.cols);
				if (to == 0) console.log('done!', to, isCheck)
				if (!isCheck) { avMoves.push(move); plPieces[from].avMoves.push(move.to); }
				//if yes, this move is discarded!
			}
		}
		console.log('avMoves', avMoves);
		return [plPieces, avMoves];
	}
	activateMoves(plPieces, avMoves) {
		for (const p in plPieces) { this.board.items[p].targets = []; }
		for (const m of avMoves) {
			let k = m.from;
			// let piece = plPieces[k];
			// piece.avMoves.push(m.to);
			let item = this.board.items[k];
			iEnableSelect(item, this.onSelect.bind(this));
			item.targets.push(m.to);
		}
	}
	activatePiecesThatCanMove(plPieces) {
		for (const k in plPieces) {
			let moves = plPieces[k].avMoves;
			if (isEmpty(moves)) continue;

			// show field bg in darker
			let item = this.board.items[k];
			iEnableSelect(item, this.onSelect.bind(this));
			item.targets = moves;
		}
	}
	afterComputerMove(iMove) {
		//console.log('CALLBACK!!!', iMove)
		//hide(mBy('bCancelAI'));
		let tile = this.board.items[iMove];
		this.interact({ target: iDiv(tile) });
	}
	eval(isEnd) {
		this.gameOver = isdef(isEnd);
		let state = this.getState();
		if (this.gameOver) {
			if (isKingInCheck(state, this.plTurn, this.plOpp, this.rows, this.cols)) {
				showFleetingMessage('CHECK MATE');
				this.winner = this.plOpp;
			} else {
				showFleetingMessage('' + this.plTurn.color + " can't move: draw!");
				this.tie = true;
			}
		}
	}
	applyMove(state, move, player) {
		state = jsCopy(state);
		let from = move.from;
		let to = move.to;
		state[to] = state[from];
		state[from] = null;
		return state;
	}
	heuristic(state){
		// einfach punkte zusammen zaehlen
		// aber schach sagen soll auch gut sein!
	}
	evalState(state, depth) {
		//soll draws ohne patt oder matt feststellen
		//zB wenn 3x hintereinander gleicher move : ignore
		//oder: wenn nur noch 2 kings da sind : ignore
		return { reached: false };
	}
	getState(){return this.board.getState();}
}


//#region chess.js
const ChessPieces =
	[{},
	{ id: 'wb', color: 'white', key: 'chess-bishop', name: 'bishop', fMoves: getMovesBishop },
	{ id: 'wk', color: 'white', key: 'chess-king', name: 'king', fMoves: getMovesKing },
	{ id: 'wq', color: 'white', key: 'chess-queen', name: 'queen', fMoves: getMovesQueen },
	{ id: 'wp', color: 'white', key: 'chess-pawn', name: 'pawn', fMoves: getMovesPawn },
	{ id: 'wr', color: 'white', key: 'chess-rook', name: 'rook', fMoves: getMovesRook },
	{ id: 'wi', color: 'white', key: 'chess-knight', name: 'knight', fMoves: getMovesKnight },
	{ id: 'bb', color: 'black', key: 'chess-bishop', name: 'bishop', fMoves: getMovesBishop },
	{ id: 'bk', color: 'black', key: 'chess-king', name: 'king', fMoves: getMovesKing },
	{ id: 'bq', color: 'black', key: 'chess-queen', name: 'queen', fMoves: getMovesQueen },
	{ id: 'bp', color: 'black', key: 'chess-pawn', name: 'pawn', fMoves: getMovesPawn },
	{ id: 'br', color: 'black', key: 'chess-rook', name: 'rook', fMoves: getMovesRook },
	{ id: 'bi', color: 'black', key: 'chess-knight', name: 'knight', fMoves: getMovesKnight },
	];

const CHESS = { wb: 1, wk: 2, wq: 3, wp: 4, wr: 5, wi: 6, bb: 7, bk: 8, bq: 9, bp: 10, br: 11, bi: 12, };
class ChessBoard extends Board {
	constructor(rows = 8, cols = 8, handler = null, cellStyle = { w: 60, h: 60 }) {
		super(rows, cols, handler, cellStyle);

		let i = 0;
		let dark = 'saddlebrown'; //'sienna'
		let light = 'burlywood'; //'navajowhite'
		for (let r = 0; r < this.rows; r += 1) {
			for (let c = 0; c < this.cols; c += 1) {
				let item = this.items[i]; i++;

				let bgOdd = r % 2 ? light : dark; //'beige' : 'sienna';
				let bgEven = r % 2 ? dark : light; //'sienna' : 'beige';

				//add overlay to each item!
				//experimental: das sollte eigentlich bei allen selectable items sein!
				makeItemHintable(item);

				mStyleX(iDiv(item), { bg: (c % 2 ? bgOdd : bgEven) });
			}
		}
		//this.pieces = ChessPieces;

		//this.setInitialPosition();
	}
	setInitialPosition(i = 0) {
		let pos = this.pos = arrFlatten(this.getInitialPosition(i));
		for (let i = 0; i < pos.length; i++) {
			if (EmptyFunc(pos[i])) continue;

			let item = this.items[i];
			this.addPiece(item, pos[i]);
		}
	}
	getInitialPosition(i = 0) {
		let positions = [
			[
				[CHESS.br, CHESS.bi, CHESS.bb, CHESS.bq, CHESS.bk, CHESS.bb, CHESS.bi, CHESS.br],
				[CHESS.bp, CHESS.bp, CHESS.bp, CHESS.bp, CHESS.bp, CHESS.bp, CHESS.bp, CHESS.bp],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[CHESS.wp, CHESS.wp, CHESS.wp, CHESS.wp, CHESS.wp, CHESS.wp, CHESS.wp, CHESS.wp],
				[CHESS.wr, CHESS.wi, CHESS.wb, CHESS.wq, CHESS.wk, CHESS.wb, CHESS.wi, CHESS.wr],
			],
			[
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, CHESS.bk, 0, 0, CHESS.bq, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, CHESS.wq, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, CHESS.wk, 0, 0],
			],
			[
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, CHESS.bk, 0, 0, CHESS.bq, 0, 0],
				[0, 0, CHESS.wq, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, CHESS.wk, 0, 0],
			],
			[
				[0, CHESS.wk, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, CHESS.bk, CHESS.bq, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
			],
		];
		return positions[i];
	}
	getState() {
		return this.items.map(x => x.iPiece);
	}
	addPiece(i, iPiece) {
		//returns whatever iPiece was on that field
		let item = isdef(i.index) ? i : this.items[i];
		let idx = item.iPiece = iPiece;
		//console.log('pos',idx);
		let piece = ChessPieces[idx];
		let key = piece.key;
		let fg = piece.color;
		//console.log('item', i, ':', idx, piece, key, fg);
		let info = item.info = Syms[key];

		// let info = item.info = Syms[this.pieces[piece]];
		addLabel(item, info.text, { family: info.family, fz: 50, fg: fg });
	}
	makeFieldEmpty(i) {
		//returns whatever iPiece was on that field
		let item = isdef(i.index) ? i : this.items[i];
		let iPiece = isdef(item.iPiece) ? item.iPiece : null;
		if (iPiece) removeLabel(item);
		delete item.iPiece;
		delete item.info;
		delete item.label;
		//delete item.isSelectEnabled;
		//delete item.isSelected;

		return iPiece;
	}
}
function isKingInCheck(state, pl, opp, rows = 8, cols = 8) {
	let plPieces = getMovesPerPiece(state, pl, rows, cols);
	let oppPieces = getMovesPerPiece(state, opp, rows, cols);
	let king = firstCondDictKeys(plPieces, x => plPieces[x].piece.name == 'king');
	//console.log('king',king)
	//console.log('player king:',king);
	//wie finde heraus ob player king bedroht ist?
	// king in check
	let isCheck = false;
	for (const i in oppPieces) {
		let moves = oppPieces[i].moves;
		//console.log('moves',i,moves)
		for (const m of moves) if (m == king) { isCheck = true; break; }
		if (isCheck) break;
	}
	//console.log('king in check',isCheck);

	return isCheck;

}
function clearChessPieces() {

}
function isOwnItem(item, pl) { return isPlayerPiece(item.iPiece, isdef(pl) ? pl : G.plTurn); }
function isPlayerPiece(iPiece, pl) { return isdef(iPiece) && pl.color == 'white' ? iPiece <= 6 : iPiece > 6; }
function getMovesPerPiece(arr, pl, rows, cols) {
	//let movesPerPiece = {};
	let playerPieces = {};
	//let king=null;
	for (let i = 0; i < arr.length; i++) {
		let iPiece = arr[i];
		//console.log(iPiece);
		if (isPlayerPiece(iPiece, pl)) {

			let piece = ChessPieces[iPiece];
			//console.log(iPiece,piece)
			let moves = piece.fMoves(arr, i, rows, cols, piece.color == 'black');
			//if (piece.name == 'queen') console.log('__________',moves)
			playerPieces[i] = { piece: piece, loc: i, moves: moves };
			// if (i == 63 || i == 50) {
			// 	let x = bNeiDir(arr, i, i == 63 ? 6 : 0, rows, cols);
			// 	console.log('x', x, isdef(x) ? arr[x] : 'no nei!');
			// }
			// if (piece.name == 'king') {
			// 	console.log('piece auf', i, piece.color, piece.name);
			// 	console.log('moves', moves)
			// }

			//movesPerPiece[i] = Rook.getMoves(state, i, 8, 8);
			//console.log('rook moves for piece', i, movesPerPiece[i]);
		}
	}

	//console.log('movesPerPiece',movesPerPiece);
	return playerPieces; // [movesPerPiece,playerPieces];
}
function getMovesRook(arr, i, rows, cols) {
	let iPossible = [];
	for (const dir of [0, 2, 4, 6]) {
		let iNew = bFreeRayDirChess1(arr, i, dir, rows, cols);
		//if (i==63) console.log('in dir',dir,'move:',iNew);
		iPossible = iPossible.concat(iNew);
	}
	return iPossible;
}
function getMovesBishop(arr, i, rows, cols) {
	let iPossible = [];
	for (const dir of [1, 3, 5, 7]) {
		let iNew = bFreeRayDirChess1(arr, i, dir, rows, cols);
		//console.log('in dir',dir,'move:',iNew);
		iPossible = iPossible.concat(iNew);
	}
	return iPossible;
}
function getMovesQueen(arr, i, rows, cols) {
	let iPossible = [];
	for (const dir of [0, 1, 2, 3, 4, 5, 6, 7]) {
		let iNew = bFreeRayDirChess1(arr, i, dir, rows, cols);
		//console.log('in dir',dir,'move:',iNew);
		iPossible = iPossible.concat(iNew);
	}
	return iPossible;
}
function getMovesKnight(arr, idx, rows, cols) {
	let [r, c] = iToRowCol(idx, rows, cols);
	let poss = [];
	let m = bCheck(r + 1, c + 2, rows, cols); if (m && (EmptyFunc(arr[m]) || isOppPieceChess(arr[idx], arr[m]))) poss.push(m);
	m = bCheck(r + 1, c - 2, rows, cols); if (m && (EmptyFunc(arr[m]) || isOppPieceChess(arr[idx], arr[m]))) poss.push(m);
	m = bCheck(r - 1, c + 2, rows, cols); if (m && (EmptyFunc(arr[m]) || isOppPieceChess(arr[idx], arr[m]))) poss.push(m);
	m = bCheck(r - 1, c - 2, rows, cols); if (m && (EmptyFunc(arr[m]) || isOppPieceChess(arr[idx], arr[m]))) poss.push(m);
	m = bCheck(r + 2, c + 1, rows, cols); if (m && (EmptyFunc(arr[m]) || isOppPieceChess(arr[idx], arr[m]))) poss.push(m);
	m = bCheck(r + 2, c - 1, rows, cols); if (m && (EmptyFunc(arr[m]) || isOppPieceChess(arr[idx], arr[m]))) poss.push(m);
	m = bCheck(r - 2, c + 1, rows, cols); if (m && (EmptyFunc(arr[m]) || isOppPieceChess(arr[idx], arr[m]))) poss.push(m);
	m = bCheck(r - 2, c - 1, rows, cols); if (m && (EmptyFunc(arr[m]) || isOppPieceChess(arr[idx], arr[m]))) poss.push(m);
	return poss;
}
function getMovesPawn(arr, idx, rows, cols, fromNorth = true) {
	let [r, c] = iToRowCol(idx, rows, cols);
	//console.log('row',r,'col',c)
	let poss = [];

	let inc = fromNorth ? 1 : -1;
	//console.log('fromNorth', fromNorth, inc)
	let m = bCheck(r + inc, c, rows, cols);
	//console.log('m', m)
	if (m && EmptyFunc(arr[m])) poss.push(m);
	if (fromNorth && r == 1 || !fromNorth && r == 6 && EmptyFunc(arr[m])) {
		m = bCheck(r + 2 * inc, c, rows, cols);
		if (m && EmptyFunc(arr[m])) poss.push(m);
	}

	//diag schlagen!
	m = bCheck(r + inc, c + 1, rows, cols); if (m && !EmptyFunc(arr[m])) poss.push(m);
	m = bCheck(r + inc, c - 1, rows, cols); if (m && !EmptyFunc(arr[m])) poss.push(m);

	return poss;
}
function getMovesKing(arr, i, rows, cols) {
	let cand = bNei(arr, i, rows, cols, true);
	//console.log('cand',cand)
	let iPossible = [];
	for (const c of cand) {
		if (c == null) continue;
		if (EmptyFunc(arr[c]) || isOppPieceChess(arr[i], arr[c])) iPossible.push(c);
	}

	return iPossible;
}
function getKingLocation(arr, pl, rows, cols) {
	//assumes that king location is in row 0 for black king and row (rows-1) for white king!
	let row = pl.color == 'black' ? 0 : rows - 1;
	if (pl.color == 'black') {
		for (let c = 0; c < cols; c++) if (arr[c] == CHESS.bk) return c;
	}else{
		let inc=(rows-1)*cols;
		for (let c = inc; c < inc+cols; c++) if (arr[c] == CHESS.wk) return c;
	}
	return null;
}
function getMoveRochade(arr, pl, rows, cols) {
	if (pl.hasMovedKing) return null;
	let row = pl.color == 'black' ? 0 : rows - 1;
	// check col 0 rook move
	let rochades={};
	if (!pl.hasMovedRook0) {
		//check if spaces between rook 0 and king are empty
		let rook0Location = row*cols;
		let kingLocation = getKingLocation(arr,pl,rows,cols);
		let empty=true;
		for(let i=rook0Location+1;i<kingLocation;i++) if (EmptyFunc(arr[i])){empty=false; break;}
		if (empty) {
			let m1 = {from:rook0Location,to:kingLocation-1};
			let m2 = {from:kingLocation,to:kingLocation-2};
			rochades.r0={rook:m1,king:m2};
		}
	}
	if (!pl.hasMovedRookX) {
		//check if spaces between rook 0 and king are empty
		let rookXLocation = row*cols+cols-1;
		let kingLocation = getKingLocation(arr,pl,rows,cols);
		let empty=true;
		for(let i=kingLocation+1;i<rookXLocation;i++) if (EmptyFunc(arr[i])){empty=false; break;}
		if (empty) {
			let m1 = {from:rookXLocation,to:kingLocation+1};
			let m2 = {from:kingLocation,to:kingLocation+2};
			rochades.rX={rook:m1,king:m2};
		}
	}
	return rochades;
}

//#endregion

//#region fieldPiece.js
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


//#endregion

//#region aus board.js
function bFreeRayDirChess1(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		i = bNeiDir(arr, i, dir, rows, cols);
		if (nundef(i)) break;
		else if (EmptyFunc(arr[i]) || isOppPieceChess(arr[idx],arr[i])) indices.push(i);
		if (!EmptyFunc(arr[i])) break;
	}
	return indices;
}
function isOppPieceChess(iPiece1,iPiece2){	
	let isCapture =iPiece1<=6 && iPiece2>6 || iPiece1>6 && iPiece2<=6;
	return isCapture;
}

//#endregion


