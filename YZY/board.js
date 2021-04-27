//board utilities
var StateDict = {};
var EmptyFunc = x => nundef(x) || x == ' ';
function bNei(arr, idx, rows, cols, includeDiagonals = true) {
	let nei = [];
	//ang tile ist 0,0
	//get r,c from index: 
	let [r, c] = iToRowCol(idx, rows, cols);

	if (r > 0) nei.push(idx - cols); else nei.push(null);
	if (r > 0 && c < cols - 1 && includeDiagonals) nei.push(idx - cols + 1); else nei.push(null);
	if (c < cols - 1) nei.push(idx + 1); else nei.push(null);
	if (r < rows - 1 && c < cols - 1 && includeDiagonals) nei.push(idx + cols + 1); else nei.push(null);
	if (r < rows - 1) nei.push(idx + cols); else nei.push(null);
	if (r < rows - 1 && c > 0 && includeDiagonals) nei.push(idx + cols - 1); else nei.push(null);
	if (c > 0) nei.push(idx - 1); else nei.push(null);
	if (r > 0 && c > 0 && includeDiagonals) nei.push(idx - cols - 1); else nei.push(null);
	//console.log('idx', idx, 'rows', rows, 'cols', cols, 'r', r, 'c', c);
	return nei;

}
function iToRowCol(idx, rows, cols) { let c = idx % cols; let r = (idx - c) / rows; return [r, c]; }
function bCheck(r, c, rows, cols) { return r >= 0 && r < rows && c >= 0 && c < cols ? r * cols + c : null; }
function bNeiDir(arr, idx, dir, rows, cols, includeDiagonals = true) {
	let [r, c] = iToRowCol(idx, rows, cols);
	switch (dir) {
		case 0: if (r > 0) return (idx - cols); else return (null);
		case 1: if (r > 0 && c < cols - 1 && includeDiagonals) return (idx - cols + 1); else return (null);
		case 2: if (c < cols - 1) return (idx + 1); else return (null);
		case 3: if (r < rows - 1 && c < cols - 1 && includeDiagonals) return (idx + cols + 1); else return (null);
		case 4: if (r < rows - 1) return (idx + cols); else return (null);
		case 5: if (r < rows - 1 && c > 0 && includeDiagonals) return (idx + cols - 1); else return (null);
		case 6: if (c > 0) return (idx - 1); else return (null);
		case 7: if (r > 0 && c > 0 && includeDiagonals) return (idx - cols - 1); else return (null);
	}
	return null;
}
function bRayDir(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		let i = bNeiDir(arr, i, dir, rows, cols);
		if (!i) break; else indices.push(i);
	}
	return indices;
}
function bFreeRayDir(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		i = bNeiDir(arr, i, dir, rows, cols);
		if (!i || !EmptyFunc(arr[i])) break; else indices.push(i);
	}
	return indices;
}
function bFreeRayDir1(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		i = bNeiDir(arr, i, dir, rows, cols);
		if (!i) break;
		else indices.push(i);
		if (!EmptyFunc(arr[i])) break;
	}
	return indices;
}
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
function isOppPiece(sym, plSym) { return sym && sym != plSym; }
function bCapturedPieces(plSym, arr, idx, rows, cols, includeDiagonals = true) {
	//console.log('player sym',plSym,'arr',arr,'idx', idx,'rows', rows,'cols', cols);
	let res = [];
	let nei = bNei(arr, idx, rows, cols, includeDiagonals);
	//console.log('nei',nei);
	for (let dir = 0; dir < 8; dir++) {
		let i = nei[dir];
		if (nundef(i)) continue;

		let el = arr[i];
		//console.log('___i',i,'el',el,'checking dir',dir);
		if (EmptyFunc(el) || el == plSym) continue;
		let inew = [];
		let MAX = 100, cmax = 0;

		while (isOppPiece(el, plSym)) {
			//console.log('index',i,'is opp',el)
			if (cmax > MAX) break; cmax += 1;
			inew.push(i);
			i = bNeiDir(arr, i, dir, rows, cols);
			//console.log(i,cmax,'dir',dir);
			if (nundef(i)) break;
			el = arr[i];
			//console.log('i',i,'el',el,'max',cmax);
		}
		if (el == plSym) {
			//add all the captured pieces to res
			res = res.concat(inew);
		}
	}
	return res;
}
function bFullRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	for (let i = iStart + 1; i < iStart + cols; i++) if (arr[i] != x) return null;
	return x;
}
function bStrideRow(arr, irow, rows, cols, stride) {
	//console.log('hallo!', cols, stride)
	for (let i = 0; i <= cols - stride; i++) {
		let ch = bStrideRowFrom(arr, irow, i, rows, cols, stride);
		//console.log('ch', ch, i)
		if (ch) return ch;
	}
	return null;
}
function bStrideRowFrom(arr, irow, icol, rows, cols, stride) {
	//console.log(cols, icol, stride)
	if (cols - icol < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	//console.log('starting el:', x)
	if (EmptyFunc(x)) return null;
	for (let i = iStart + 1; i < iStart + stride; i++) if (arr[i] != x) return null;
	return x;
}
function bStrideCol(arr, icol, rows, cols, stride) {
	//console.log('hallo!', rows, stride)
	for (let i = 0; i <= rows - stride; i++) {
		let ch = bStrideColFrom(arr, i, icol, rows, cols, stride);
		//console.log('ch', ch, i)
		if (ch) return ch;
	}
	return null;
}
function bStrideColFrom(arr, irow, icol, rows, cols, stride) {
	//console.log(irow, icol, rows, cols, stride)
	if (rows - irow < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	//console.log('starting el:', x)
	if (EmptyFunc(x)) return null;
	for (let i = iStart + cols; i < iStart + cols * stride; i += cols) if (arr[i] != x) return null;
	return x;
}
function bStrideDiagFrom(arr, irow, icol, rows, cols, stride) {
	//console.log(irow, icol, rows, cols, stride)
	if (rows - irow < stride || cols - icol < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	//console.log('starting el:', x)
	if (EmptyFunc(x)) return null;
	for (let i = iStart + cols + 1; i < iStart + (cols + 1) * stride; i += cols + 1) if (arr[i] != x) return null;
	return x;
}
function bStrideDiag2From(arr, irow, icol, rows, cols, stride) {
	//console.log(irow, icol, rows, cols, stride)
	if (rows - irow < stride || icol - stride + 1 < 0) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	//console.log('starting el:', x)
	if (EmptyFunc(x)) return null;
	for (let i = iStart + cols - 1; i < iStart + (cols - 1) * stride; i += cols - 1) if (arr[i] != x) return null;
	return x;
}
function bFullCol(arr, icol, rows, cols) {
	let iStart = icol;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	for (let i = iStart + cols; i < iStart + (cols * rows); i += cols) if (arr[i] != x) return null;
	return x;
}
function bFullDiag(arr, rows, cols) {
	let iStart = 0;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	for (let i = iStart + cols + 1; i < arr.length; i += cols + 1) { if (arr[i] != x) return null; }//console.log(i,arr[i]); }
	return x;
}
function bFullDiag2(arr, rows, cols) {
	let iStart = cols - 1;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	//console.log(iStart,arr[iStart]);
	for (let i = iStart + cols - 1; i < arr.length - 1; i += cols - 1) { if (arr[i] != x) return null; }//console.log(i,arr[i]); }
	return x;
}
function bPartialRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let x = null;
	for (let i = iStart; i < iStart + cols; i++) {
		if (EmptyFunc(arr[i])) continue;
		else if (EmptyFunc(x)) x = arr[i];
		else if (arr[i] != x) return null;
	}
	return x;
}
function bPartialCol(arr, icol, rows, cols) {
	let iStart = icol;
	let x = null;
	for (let i = iStart; i < iStart + (cols * rows); i += cols) { if (EmptyFunc(arr[i])) continue; else if (EmptyFunc(x)) x = arr[i]; else if (arr[i] != x) return null; }
	return x;
}
function bPartialDiag(arr, rows, cols) {
	let iStart = 0;
	let x = null;
	for (let i = iStart; i < arr.length; i += cols + 1) { if (EmptyFunc(arr[i])) continue; else if (EmptyFunc(x)) x = arr[i]; else if (arr[i] != x) return null; }
	return x;
}
function bPartialDiag2(arr, rows, cols) {
	let iStart = cols - 1;
	let x = null;
	//console.log(iStart,arr[iStart]);
	for (let i = iStart; i < arr.length - 1; i += cols - 1) {
		if (EmptyFunc(arr[i])) continue; else if (EmptyFunc(x)) x = arr[i]; else if (arr[i] != x) return null;
	}
	return x;
}
function checkWinnerPossible(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bPartialRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bPartialCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bPartialDiag(arr, rows, cols); if (ch) return ch;
	ch = bPartialDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkWinner(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bFullRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bFullCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bFullDiag(arr, rows, cols); if (ch) return ch;
	ch = bFullDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkBoardEmpty(arr) { for (const x of arr) { if (!EmptyFunc(x)) return false; } return true; }
function checkBoardFull(arr) { for (const x of arr) if (EmptyFunc(x)) return false; return true; }

//TTT
function checkPotentialTTT(arr) { return checkWinnerPossible(arr, G.rows, G.cols); }
function checkWinnerTTT(arr) { return checkWinner(arr, G.rows, G.cols); }
function checkWinnerC4(arr, rows = 6, cols = 7, stride = 4) {
	//console.log(arr,rows,cols,stride)

	for (i = 0; i < rows; i++) { let ch = bStrideRow(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bStrideCol(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < rows; i++) {
		for (j = 0; j < cols; j++) {
			let ch = bStrideDiagFrom(arr, i, j, rows, cols, stride); if (ch) return ch;
			ch = bStrideDiag2From(arr, i, j, rows, cols, stride); if (ch) return ch;
		}
	}
	return null;
}

function boardToNode(state) {
	let res = new Array();
	for (let i = 0; i < state.length; i++) {
		if (state[i] == null) res[i] = ' ';
		else res[i] = state[i];
		//else if (state[i]=='O')
	}
	return res;
}
function printState(state) {
	//console.log('___________',state)
	let formattedString = '';
	state.forEach((cell, index) => {
		formattedString += isdef(cell) ? ` ${cell == '0' ? ' ' : cell} |` : '   |';
		if ((index + 1) % G.cols == 0) {
			formattedString = formattedString.slice(0, -1);
			if (index < G.rows * G.cols - 1) {
				let s = '\u2015\u2015\u2015 '.repeat(G.cols);
				formattedString += '\n' + s + '\n'; //\u2015\u2015\u2015 \u2015\u2015\u2015 \u2015\u2015\u2015\n';
				// formattedString += '\n\u2015\u2015\u2015 \u2015\u2015\u2015 \u2015\u2015\u2015\n';
			}
		}
	});
	console.log('%c' + formattedString, 'color: #6d4e42;font-size:10px');
	console.log();
}
function bCreateEmpty(rows, cols) { return new Array(rows * cols).fill(null); }

class Board {
	constructor(rows, cols, handler, cellStyle) {
		let styles = isdef(cellStyle) ? cellStyle : { margin: 4, w: 150, h: 150, bg: 'white', fg: 'black' };
		this.rows = rows;
		this.cols = cols;
		let items = this.items = iGrid(this.rows, this.cols, dTable, styles);
		items.map(x => {
			let d = iDiv(x);
			mCenterFlex(d);
			d.onclick = handler;
		});
		//console.log(this.items)
	}
	get(ir, c) {
		if (isdef(c)) {
			// interpret as row,col
			let idx = ir * this.cols + c;
			return this.items[idx];
		} else {
			//interpret as index
			return this.items[ir];
		}
	}
	getState() {
		return this.items.map(x => x.label);
	}
	setState(arr, colors) {

		if (isEmpty(arr)) return;
		if (isList(arr[0])) { arr = arrFlatten(arr); }

		for (let i = 0; i < arr.length; i++) {
			let item = this.items[i];
			let val = arr[i];
			if (!EmptyFunc(val)) {
				addLabel(item, val, { fz: 60, fg: colors[val] });
			} else item.label = val;
			//item.label = arr[i];

		}
	}
	clear() {
		for (const item of this.items) {
			let dLabel = iLabel(item);
			if (isdef(dLabel)) { removeLabel(item); item.label = null; }
		}
	}
}










