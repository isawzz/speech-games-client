function getOperand(type) { let x = OPS[type]; return randomNumber(Math.max(2, x.min), x.max); }
function getRandomWP(min = 0, max = 35) { return jsCopy(WordP[randomNumber(min, max)]); }// chooseRandom(WordP.slice(min,max));}
function instantiateNames(wp) {
	let text = wp.text;
	let parts = text.split('@P');
	//console.log('parts', parts);
	let diNames = wp.diNames = {};
	let tnew = '';
	let allNames = jsCopy(arrPlus(GirlNames, BoyNames));
	let gNames = jsCopy(GirlNames);
	let bNames = jsCopy(BoyNames);

	if (!startsWith(text, '@P')) { tnew += parts[0]; parts = parts.slice(1); }
	for (const part of parts) {
		let textPart = stringAfter(part, ' ');

		let hasDot = part[2]=='.';

		//console.log('==>',part)
		let key = part.substring(0, 2);

		//console.log('key', key);

		if (['G', 'B', 'P'].includes(part[0])) {
			let nlist = part[0] == 'P' ? allNames : part[0] == 'B' ? bNames : gNames;
			if (isdef(diNames[key])) {
				tnew += ' ' + diNames[key];
			} else {
				diNames[key] = chooseRandom(nlist);
				removeInPlace(nlist, diNames[key]);
				removeInPlace(allNames, diNames[key]);
				tnew += ' ' + diNames[key];
			}
		}
		tnew += (hasDot?'. ':' ') + textPart.trim();
	}
	wp.text = tnew.trim();

	if (wp.sol[0] == 'p') {
		//console.log('diNames',diNames,'\nsol',wp.sol);
		
		let k=wp.sol.trim().substring(4);
		//console.log('key',k)
		wp.result = { number: 0, text: diNames[k] }; return true;
	} else { return false; }
}

function replaceSol(sol, diop) {
	//sol = R*N2=N1
	let rhs = stringBefore(sol, '=');
	//console.log('rhs', rhs)

	let type = rhs.includes('*') ? rhs.includes('R') ? 'div' : 'mult' : rhs.includes('R') ? 'minus' : 'plus';
	//replace R and Nx in rhs by operands
	let i = 0;
	while (i < rhs.length) {
		if (rhs[i] == 'R') { diop.R = getOperand(type); i += 1; }
		else if (rhs[i] == 'r') { if (nundef(diop.r)) diop.r = getOperand(type); i += 1; } //zwischenergebnis
		else if (rhs[i] == 'N') {
			i += 1;
			let inum = Number(rhs[i]);
			let k = 'N' + inum;
			if (nundef(diop[k])) diop[k] = getOperand(type);
			i += 1;
		} else if (rhs[i] == 'D') {
			i += 1;
			let inum = Number(rhs[i]);
			let k = 'D' + inum;
			if (nundef(diop[k])) diop[k] = randomNumber(2, 9); //getOperand(type);
			i += 1;

		} else i += 1;
	}

	//console.log('diop after capital replacement', diop)
	//geh nochmal durch und diesmal replace nx by some number < Nx
	//fuer div mit rest: R*N2+n2=N1
	i = 0;
	while (i < rhs.length) {
		if (rhs[i] == 'n') {
			i += 1;
			let inum = Number(rhs[i]);
			let k = 'n' + inum;
			let kN = 'N' + inum;
			let x = diop[kN];
			// if (x<=2) diop[kN]+=1;
			//console.log('number exists',x);
			if (nundef(diop[k])) diop[k] = randomNumber(2, x - 1);
			i += 1;
		} else i += 1;
	}

	//replace in sol each rhs by its operand, the eval rhs
	let eq = rhs;
	for (const k in diop) {
		eq = eq.replace(k, diop[k]);
	}
	//console.log('diop',diop);
	//console.log('eq',eq);
	let result = eval(eq);
	//console.log('result',result);

	//now, assign result to lhs
	let lhs = stringAfter(sol, '=').trim();
	if (isEmpty(lhs)) lhs = 'R';

	//if lhs contains more than 1 all but the last one have to be replaced by 
	diop[lhs] = result;

	return [result, eq];
}

function instantiateNumbers(wp) {

	let text = wp.text;

	if (wp.sol[0] == 's') { wp.result = { number: 0, text: wp.sol.substring(1) }; return [{}, '']; }

	let diop = wp.diop = {}, res, result = [], eq;
	let solist = wp.sol.split('=>');
	//console.log(wp.sol);

	for (const sol of solist) {
		//console.log(sol);
		[res, eq] = replaceSol(sol, diop);
		result.push(res);
	}
	result = arrLast(result).res;
	//console.log('_______diop', diop);

	//now replace each key in text by diop[key] and sett wp.result to diop.R
	wp.result = { number: isdef(diop.R) ? diop.R : result };
	wp.result.text = '' + wp.result.number;
	for (const k in diop) {
		if (k == 'R') continue;
		text = text.replace('@' + k, diop[k]);
	}
	wp.text = text;
	return [diop, eq];
}











function all2DigitFractionsExpanded() {
	let f = all2DigitFractions();
	let res = [];
	for (const i in f) {
		for (const j of f[i]) {
			res.push({ numer: i, denom: j });
		}
	}
	return res;
}
function all2DigitFractionsUnder1Expanded() {
	let f = all2DigitFractionsUnder1();
	let res = [];
	for (const i in f) {
		for (const j of f[i]) {
			res.push({ numer: i, denom: j });
		}
	}
	return res;
}
function all2DigitFractions() {
	let fr = {
		1: [2, 3, 4, 5, 6, 7, 8, 9],
		2: [3, 5, 7, 9],
		3: [2, 4, 5, 7, 8],
		4: [3, 5, 7, 9],
		5: [2, 3, 4, 6, 7, 8, 9],
		6: [5, 7],
		7: [2, 3, 4, 5, 6, 8, 9],
		8: [3, 5, 7, 9],
		9: [2, 4, 5, 7, 8],
	};
	return fr;
}
function fractionsUnder1ByDenominator() {
	let fr = {
		2: [1],
		3: [1, 2],
		4: [1, 3],
		5: [1, 2, 3, 4],
		6: [1, 5],
		7: [1, 2, 3, 4, 5, 6],
		8: [1, 3, 5, 7],
		9: [1, 2, 4, 5, 7, 8],
	};
	return fr;
}

function all2DigitFractionsUnder1() {
	let fr = {
		1: [2, 3, 4, 5, 6, 7, 8, 9],
		2: [3, 5, 7, 9],
		3: [4, 5, 7, 8],
		4: [5, 7, 9],
		5: [6, 7, 8, 9],
		6: [7],
		7: [8, 9],
		8: [9],
	};
	return fr;
}

function simplifyFraction(numerator, denominator) {
	var gcd = function gcd(a, b) {
		return b ? gcd(b, a % b) : a;
	};
	gcd = gcd(numerator, denominator);
	return [numerator / gcd, denominator / gcd];
}

function instantiateNumbersIncludingFractions(wp) {
	//sol = simplify({N2(3,8)}/{N1(12,24)})
	let sol = wp.sol;
	console.log('________________sol', sol)
	let parts = sol.split('{');
	let di = {};
	let newSol = '';
	//replacing Ni in sol
	for (const p of parts) {
		if (p[0] == 'N') {
			let key = p.substring(0, 2);
			let n;
			console.log('p', p)
			if (p[2] == '(') {
				let nums = stringBetween(p, '(', ')');
				let lst = allNumbers(nums);
				if (lst.length <= 3 && lst[0] <= lst[1]) {
					n = randomNumber(...lst);
				} else {
					n = chooseRandom(lst);
				}
			} else {
				n = randomNumber(2, 9);
			}
			//now replace {N1(3,8)} by eg. 4
			let rest = stringAfter(p, '}');
			newSol += '' + n + rest;
			di[key] = n;

		} else newSol += p;
	}

	console.log('newSol', newSol);
	//all Ni are now replaced by corresponding ranges
	let res = eval(newSol);

	console.log('res of simplify', res);
	let numResult = res[0] / res[1];
	let textResult = numResult == Math.round(numResult) ? numResult : '' + res[0] + '/' + res[1];
	wp.result = { number: numResult, text: textResult };

	//replacing Ni and {F...} in text
	let text = wp.text;
	for (const k in di) {
		if (k == 'R') continue;
		text = replaceAll(text, '{' + k + '}', di[k]);
	}

	console.log('_________ text', text);
	parts = text.split('{');
	let tnew = '';
	for (const p of parts) {
		if (p[0] == 'F') {
			//parser numbers
			let s = stringBefore(p, '}');
			console.log('s', s)
			let [n, d] = allNumbers(s);
			tnew += getTextForFraction(n, d);
			tnew += '; ' + stringAfter(p, '}');
		} else tnew += p;
	}
	text = tnew;

	wp.text = text;

	mText(wp.text, dTable)
}
function instantiateFractions(wp) {
	let text = wp.text;
	let parts = text.split('{');
	console.log('parts', parts);
	let tnew = '';
	if (!startsWith(text, '{')) { tnew += parts[0]; parts = parts.slice(1); }
	let denom;
	for (const part of parts) {
		let textPart = stringAfter(part, '}');
		let key = part.substring(0, 2);
		console.log('key', key);
		if (part[0] == 'F') { //{Fa/b}
			let numer = part[1] == 'a' ? 1 : isdef(denom) ? denom : randomNumber(2, 8);
			if (nundef(denom)) {
				denom = numer <= 2 ? randomNumber(numer + 1, 9) :
					numer < 9 ? coin() ? randomNumber(2, numer - 1) : randomNumber(numer + 1, 9) : randomNumber(2, number - 1);
			}
			tnew += ' ' + getTextForFraction(numer, denom);
			operands.push(numer / denom);
		}
		tnew += ' ' + textPart.trim();
	}
	wp.text = tnew.trim();
}
function instantiateWP(wp) {

	if (wp.title.includes('Fractions')) instantiateNumbersIncludingFractions(wp); else instantiateNumbers(wp);

	instantiateNames(wp);

	console.log('wp', wp.text, wp.result);
}
function evalWP(wp) {
	let title = wp.title;
	if (title.includes('Adding') && !titla.includes('Fractions')) {

	}
}
function getTextForFraction(num, denom) { return '&frac' + num + denom; }

function instantiateNumbers_dep(wp) {

	let text = wp.text;


	let diop = {};
	//let result=replaceSol()

	//sol = R*N2=N1
	let sol = wp.sol;
	let rhs = stringBefore(sol, '=');
	let type = rhs.includes('*') ? rhs.includes('R') ? 'div' : 'mult' : rhs.includes('R') ? 'minus' : 'plus';
	//replace R and Nx in rhs by operands
	let i = 0;
	while (i < rhs.length) {
		if (rhs[i] == 'R') { diop.R = getOperand(type); i += 1; }
		else if (rhs[i] == 'N') {
			i += 1;
			let inum = Number(rhs[i]);
			let k = 'N' + inum;
			diop[k] = getOperand(type);
			i += 1;
		} else i += 1;
	}

	//geh nochmal durch und diesmal replace nx by some number < Nx
	//fuer div mit rest: R*N2+n2=N1
	i = 0;
	while (i < rhs.length) {
		if (rhs[i] == 'n') {
			i += 1;
			let inum = Number(rhs[i]);
			let k = 'n' + inum;
			let kN = 'N' + inum;
			let x = diop[kN];
			//console.log('number exists',x);
			diop[k] = randomNumber(1, x - 1);
			i += 1;
		} else i += 1;
	}

	//replace in sol each rhs by its operand, the eval rhs
	let eq = rhs;
	for (const k in diop) {
		eq = eq.replace(k, diop[k]);
	}
	//console.log('diop',diop);
	//console.log('eq',eq);
	let result = eval(eq);
	//console.log('result',result);

	//now, assign result to lhs
	let lhs = stringAfter(sol, '=');

	//if lhs contains more than 1 all but the last one have to be replaced by 
	diop[lhs] = result;

	//console.log('_______diop', diop);

	//now replace each key in text by diop[key] and sett wp.result to diop.R
	wp.result = { number: isdef(diop.R) ? diop.R : result };
	wp.result.text = '' + wp.result.number;
	for (const k in diop) {
		if (k == 'R') continue;
		text = text.replace('@' + k, diop[k]);
	}
	wp.text = text;
	return [diop, eq];
}
