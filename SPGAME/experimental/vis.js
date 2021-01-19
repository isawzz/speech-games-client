function visNumber(n, dParent, color, or = 'h', asNumber = [0]) {
	//small grid w/ inside n dots in color

	if (!isNumber(n) || asNumber.includes(n)) return zText(''+n, dParent, { fg: 'white', fz: 64 });
	return _visualizeNumber(n, dParent, color, or);
}
function visOperator(s, dParent, styles = { fg: 'white', fz: 64 }) {
	zText(s, dParent, styles);
}
function visOperation(op, a, b, dParent, symResult) {
	switch (op) {
		case 'plus':
		case 'minus': return _visualizeAritOp(op, a, b, dParent,symResult); break;
		case 'mult': return _visualizeMult(a, b, dParent,symResult); break;
	}
}

//#region helpers
function _visualizeMult(a, b, dParent, symResult) {
	//opKey is one of the keys in OPS (plus, minus,mult,) or the object OPS[key]
	op = OPS.mult;
	//console.log('op', op)
	let dx = mDiv(dParent); mFlex(dx); mStyleX(dx, { 'align-items': 'center', gap: 16 });
	visNumber(a, dx, 'blue', 'v');
	for (let i = 1; i < b; i++) {
		let d2 = visOperator('+', dx);
		visNumber(a, dx, 'blue', 'v');
	}
	let d4 = visOperator('=', dx);
	let result = isdef(symResult)?symResult:op.f(a, b);
	let d5 = visNumber(result, dx, 'red');
	return dx;
}
function _visualizeAritOp(op, a, b, dParent, symResult) {
	//opKey is one of the keys in OPS (plus, minus,mult,) or the object OPS[key]
	op = isString(op) ? OPS[op] : op;
	//console.log('op', op)
	let dx = mDiv(dParent); mFlex(dx); mStyleX(dx, { 'align-items': 'center', gap: 16 });
	let d1 = visNumber(a, dx, 'blue');
	let d2 = visOperator(op.wr, dx);
	let d3 = visNumber(b, dx, 'green');
	let d4 = visOperator('=', dx);
	// let result = op.f(a, b);
	let result = isdef(symResult)?symResult:op.f(a, b);
	let d5 = visNumber(result, dx, 'red');
	return dx;

}
function _visualizeNumber(n, dParent, color,or='h') {

	//moecht ein kleines grid mit inside n dots in random colors

	//#region prelim: keys,labels,ifs,options
	let keys = new Array(n).fill('plain-circle');
	let options = { repeat: n, showLabels: false, center:true };
	let infos = keys.map(x => symbolDict[x]);
	let ifs = { fg: color }

	//#endregion

	//#region phase1: make items: hier jetzt mix and match
	let items = zItems(infos, ifs, options);
	//items.map(x=>console.log(x));
	//#endregion phase1

	//#region phase2: prepare items for container
	// let [options.sz,options.rows,options.cols] = calcRowsColsSize(n,null,null,null,200,200);//(n, lines, cols, dParent, wmax, hmax)
	// console.log(options)
	let root = Math.sqrt(n);
	let rows = Math.floor(root);
	let cols = Math.ceil(root);
	if (or == 'v') { let h = rows; rows = cols; cols = h; }

	//console.log('orientation',or,rows,cols)

	//let [sz, rows, cols] = calcRowsColsSize(items.length);
	sz = 25;
	if (nundef(options.sz)) options.sz = sz;
	if (nundef(options.rows)) options.rows = rows;
	if (nundef(options.cols)) options.cols = cols;
	items.map(x => x.sz = options.sz);
	prep1(items, ifs, options);

	//#endregion

	//#region phase3: prep container for items

	//#endregion

	//#region phase4: add items to container!
	let dGrid = mDiv(dParent);
	items.map(x => mAppend(dGrid, x.div));
	let gridStyles = { 'place-content': 'center', gap: 4, margin: 4, padding: 4, bg: 'white', rounding: 10 };
	let gridSize = layoutGrid(items, dGrid, gridStyles, { rows: options.rows, isInline: true });
	//console.log('size of grid', gridSize, 'table', getBounds(dTable))
	//#endregion

	//console.log('*** THE END ***');
	return dGrid;
}
