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
	setInitialPosition(i=0) {
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
				[0, 0, 0, 0, 0,CHESS.wk, 0, 0],
			],
			[
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, CHESS.bk, 0, 0, CHESS.bq, 0, 0],
				[0, 0, CHESS.wq, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0,CHESS.wk, 0, 0],
			],
			[
				[0, CHESS.wk, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, CHESS.bk, CHESS.bq, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0,0, 0, 0],
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
function isKingInCheck(state,pl,opp,rows=8,cols=8){
	let plPieces = getMovesPerPiece(state, rows, cols, pl);
	let oppPieces = getMovesPerPiece(state, rows, cols, opp);
	let king = firstCondDictKeys(plPieces,x=>plPieces[x].piece.name=='king');
	console.log('king',king)
	//console.log('player king:',king);
	//wie finde heraus ob player king bedroht ist?
	// king in check
	let isCheck = false;
	for (const i in oppPieces) {
		let moves = oppPieces[i].moves;
		console.log('moves',i,moves)
		for(const m of moves) if (m==king) {isCheck = true;break;}
		if (isCheck) break;
	}
	//console.log('king in check',isCheck);

	return isCheck;

}
function clearChessPieces(){

}
function isOwnItem(item, pl) { return isPlayerPiece(item.iPiece, isdef(pl) ? pl : G.plTurn); }
function isPlayerPiece(iPiece, pl) { return isdef(iPiece) && pl.color == 'white' ? iPiece <= 6 : iPiece > 6; }
function getMovesPerPiece(arr, rows, cols, pl) {
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
			if (piece.name == 'queen') console.log('__________',moves)
			playerPieces[i]={piece:piece,loc:i,moves:moves};
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
		if (EmptyFunc(arr[c]) || isOppPieceChess(arr[i],arr[c])) iPossible.push(c);
	}
	return iPossible;
}









