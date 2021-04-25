//testing
function bTest01() {
	let arr = [1, 1, 1, 1, 2, 1, 0, 1, 0], rows = 3, cols = 3, irow = 0;// =>1
	console.log(bFullRow(arr, irow, rows, cols));
	console.log('____________')
	arr = [1, 1, 1, 1, 2, 1, 1, 1, 0], rows = 3, cols = 3, irow = 2;// =>null
	console.log(bFullRow(arr, irow, rows, cols));
	console.log('____________')
	arr = [1, 1, 1, 1, 2, 1, 1, 1, 0], rows = 3, cols = 3, icol = 0;// =>1
	console.log(bFullCol(arr, icol, rows, cols));
	console.log('____________')
	arr = [1, 1, 0, 2, 1, 1, 1, 0, 1], rows = 3, cols = 3;// =>1
	console.log(bFullDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 2, 1, 1, 1, 0, 1], rows = 3, cols = 3;// =>null
	console.log(bFullDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 0, 2, 1, 1, 0, 1], rows = 3, cols = 3;// =>null
	console.log(bFullDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 2, 1, 2, 1, 2, 1, 2, 2], rows = 3, cols = 3;// =>1
	console.log(bFullDiag2(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 0, 0, 1, 0, 0, 1], rows = 3, cols = 3;// =>0
	console.log(bFullDiag2(arr, rows, cols));
	console.log('============================')
}
function bTest02() {
	let arr = [1, null, 1, 1, 2, 1, 0, 1, 0], rows = 3, cols = 3, irow = 0;// =>1
	console.log(bPartialRow(arr, irow, rows, cols));
	console.log('____________')
	arr = [1, 1, 1, 1, 0, 1, 1, 1, 2], rows = 3, cols = 3, irow = 2;// =>null
	console.log(bPartialRow(arr, irow, rows, cols));
	console.log('____________')
	arr = [1, 1, 1, null, 2, 1, 1, 1, 0], rows = 3, cols = 3, icol = 0;// =>1
	console.log(bPartialCol(arr, icol, rows, cols));
	console.log('____________')
	arr = [1, 1, 0, 2, null, 1, 1, 0, 1], rows = 3, cols = 3;// =>1
	console.log(bPartialDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 2, 1, 1, 1, 0, 1], rows = 3, cols = 3;// =>null
	console.log(bPartialDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 0, 2, 1, 1, 0, 1], rows = 3, cols = 3;// =>null
	console.log(bPartialDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 2, 1, 2, null, 2, 1, 2, 2], rows = 3, cols = 3;// =>1
	console.log(bPartialDiag2(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 0, 0, 1, 0, 0, 1], rows = 3, cols = 3;// =>0
	console.log(bPartialDiag2(arr, rows, cols));
}
//connect4 tests: stride
function bTest03() {
	let arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	['O', 'O', 'O', 'O', 0, 0, 0]]
	let arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 5, stride = 4;// =>1
	console.log('arr', arr[5]);
	console.log('stride in row', irow + ':', bStrideRow(arrf, irow, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	[0, 0, 0, 'O', 'O', 'O', 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 5, stride = 4;// =>1
	console.log('arr', arr[5]);
	console.log('stride in row', irow + ':', bStrideRow(arrf, irow, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	[0, 'O', 'O', 'O', 'O', 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 5, stride = 4;// =>1
	console.log('arr', arr[5]);
	console.log('stride in row', irow + ':', bStrideRow(arrf, irow, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	[0, 0, 0, 'O', 'O', 'O', 'O']]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 5, stride = 4;// =>1
	console.log('arr', arr[5]);
	console.log('stride in row', irow + ':', bStrideRow(arrf, irow, rows, cols, stride));
	console.log('____________');

}
function bTest04() {
	let arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 0, 0, 0, 0, 0, 0],
	['O', 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	['O', 'O', 'O', 'O', 0, 0, 0]]
	let arrf = arrFlatten(arr), rows = 6, cols = 7, icol = 0, stride = 4;// =>1
	console.log('stride in col', icol + ':', bStrideCol(arrf, icol, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 'X', 0, 0],
	['O', 0, 0, 0, 'X', 0, 0],
	['O', 0, 0, 0, 'O', 0, 0],
	['O', 'X', 0, 0, 'X', 0, 0],
	['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, icol = 4, stride = 4;// =>1
	console.log('stride in col', icol + ':', bStrideCol(arrf, icol, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 'X', 0, 'X', 0, 0],
	[0, 0, 0, 0, 'X', 0, 0],
	['O', 0, 0, 0, 'X', 0, 0],
	['O', 0, 0, 0, 'X', 0, 0],
	['O', 'X', 0, 0, 'O', 0, 0],
	['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, icol = 4, stride = 4;// =>1
	console.log('stride in col', icol + ':', bStrideCol(arrf, icol, rows, cols, stride));
	console.log('____________');
}
function bTest05() {
	let arr = [
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		['O', 0, 0, 0, 0, 0, 0],
		[0, 'O', 0, 0, 0, 0, 0],
		['O', 'X', 'O', 0, 0, 0, 0],
		['O', 'O', 'O', 'O', 0, 0, 0]]
	let arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 2, icol = 0, stride = 4;// =>1
	console.log('stride in diag', irow, icol + ':', bStrideDiagFrom(arrf, irow, icol, rows, cols, stride));
	console.log('____________');
	arr = [
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 'X', 0],
		['O', 0, 0, 0, 0, 0, 'X'],
		[0, 'O', 0, 0, 0, 0, 0],
		['O', 'X', 'O', 0, 0, 0, 0],
		['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 1, icol = 5, stride = 4;// =>1
	console.log('stride in diag', irow, icol + ':', bStrideDiagFrom(arrf, irow, icol, rows, cols, stride));
	console.log('____________');
	arr = [
		[0, 0, 0, 0, 0, 0, 'X'],
		[0, 0, 0, 0, 0, 'X', 0],
		['O', 0, 0, 0, 'X', 0, 'X'],
		[0, 'O', 0, 'X', 0, 0, 0],
		['O', 'X', 'O', 0, 0, 0, 0],
		['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 0, icol = 6, stride = 4;// =>1
	console.log('stride in diag2', irow, icol + ':', bStrideDiag2From(arrf, irow, icol, rows, cols, stride));
	console.log('____________');
	arr = [
		[0, 0, 0, 0, 0, 0, 'X'],
		[0, 0, 0, 0, 0, 'X', 0],
		['O', 0, 0, 'O', 'X', 0, 'X'],
		[0, 'O', 'O', 'X', 0, 0, 0],
		['O', 'O', 'O', 0, 0, 0, 0],
		['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 2, icol = 3, stride = 4;// =>1
	console.log('stride in diag2', irow, icol + ':', bStrideDiag2From(arrf, irow, icol, rows, cols, stride));
	console.log('____________');
}
function bTest06() {
	let pos = [
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 'X', 0, 0, 0, 0, 0],
		[0, 'X', 0, 'O', 0, 0, 0],
		['O', 'X', 0, 'O', 0, 0, 0],
		['O', 'X', 0, 'O', 0, 0, 0]];

	let arr = arrFlatten(pos);
	let str = bStrideCol(arr, 1, 6, 7, 4);
	console.log('stride', str)
	let w = checkWinnerC4(arr, 6, 7, 4);
	printState(arr)
	console.log('w', w);

}
function bTest07() {
	let arr = [0, 0, 0, 0, 0, 0, 0, "X", 0, 0, 0, 0, 0, 0, "X", 0, 0, "X", "X", 0, "O", "X", 0, "X", "O", "O", "O", "X", "O", "X", "O", "O", "O", "X", "O", "O", "X", "O", "O", "O", "X", "O"];
	let w = checkWinnerC4(arr, 6, 7, 4);
	printState(arr)
	console.log('w', w);
}
function bTest08() {
	let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "X", 0, 0, 0, "X", 0, 0, "O", 0, 0, 0, "O", "X", 0, "O", 0, 0, 0, "O", "X", "O", "O", "O", "O", 0];
	let w = checkWinnerC4(arr, 6, 7, 4);
	printState(arr)
	console.log('w', w);
}

function bTest09() {
	let pos = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 'X', 0, 0, 0],
		[0, 'X', 0, 'O', 0],
		['O', 'X', 0, 'O', 0]];

	let arr = arrFlatten(pos);
	let nei = bNei(arr, 6, 5, 5);
	console.log(nei)	
	nei = bNei(arr, 0, 5, 5);
	console.log(nei)	
	nei = bNei(arr, 24, 5, 5);
	console.log(nei)	
}
function bTest10() {
	let pos = [
		[0, 1, 2, 3, 4, 5],
		[6, 7, 8, 9, 10, 11],
		[12, 13, 14, 15, 16, 17],
		[18, 19, 20, 21, 22, 23],
		[24, 25, 26, 27, 28, 29]];

	let arr = arrFlatten(pos);
	printState(arr);
	let nei = bNei(arr, 6, 6, 6);
	console.log(nei);	
	nei = bNei(arr, 7, 6, 6);
	console.log(nei);	
	nei = bNei(arr, 16, 6, 6);
	console.log(nei);	
}

function btest11_fractions(){
	
	let a=math.fraction(1,4);
	let b=math.fraction(1,4);
	let c = math.multiply(a,b);
	console.log(a,b,c);
	let d=math.add(a,b);
	console.log(d)
	let e = math.multiply(2,a);
	console.log(e)
}

