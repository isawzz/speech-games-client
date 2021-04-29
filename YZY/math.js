
function getOperand(type) { let x = OPS[type]; return randomNumber(Math.max(2, x.min), x.max); }
function getRandomWP(min = 0, max = 35) { let n=randomNumber(min, max); console.log('wp',n); return jsCopy(WordP[n]); }// chooseRandom(WordP.slice(min,max));}
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

		let hasDot = part[2] == '.';

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
		tnew += (hasDot ? '. ' : ' ') + textPart.trim();
	}
	wp.text = tnew.trim();

	if (wp.sol[0] == 'p') {
		//console.log('diNames',diNames,'\nsol',wp.sol);

		let k = wp.sol.trim().substring(3);
		//console.log('key',k)
		wp.result = { number: 0, text: diNames[k] };
		//console.log(wp.result,wp.diNames,k)
		return true;
	} else { return false; }
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
		text = replaceAll(text, '@' + k, valToString(diop[k]));
	}
	wp.text = text;
	fractionConvert(wp, diop);
	return [diop, eq];
}
function valToString(n) { if (isFractionType(n)) return getTextForFractionX(n.n, n.d); else return n; }
function replaceSol(sol, diop) {
	//sol = R*N2=N1
	let rhs = stringBefore(sol, '=');
	//console.log('_________\nrhs', rhs);
	//console.log('sol', sol);

	let type = rhs.includes('*') ? rhs.includes('R') ? 'div' : 'mult' : rhs.includes('R') ? 'minus' : 'plus';
	//replace R and Nx in rhs by operands
	let i = 0;
	while (i < rhs.length) {
		if (rhs[i] == 'R') { diop.R = getOperand(type); i += 1; }
		else if (rhs[i] == 'r' && !isLetter(rhs[i+1])) { if (nundef(diop.r)) diop.r = getOperand(type); i += 1; } //zwischenergebnis
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
			i += 1;
			if (rhs[i] == '{') {
				let subs = rhs.substring(i);
				let inKlammern = stringBefore(subs, '}');
				//console.log('rhs war',rhs, 'inKlammern',inKlammern)
				rhs = rhs.substring(0, i) + stringAfter(subs, '}');
				//console.log('rhs is now',rhs)
				i += inKlammern.length;
				let nums = allNumbers(inKlammern);
				diop[k] = chooseRandom(nums);
			} else if (nundef(diop[k])) {
				diop[k] = randomNumber(2, 9); //getOperand(type);
			}
			//i += 1; //vorgezogen! => repeat tests mit D
		} else if (rhs[i] == 'F') {

			if (isdef(diop[rhs.substring(i, i + 2)])) { i += 2; continue; }

			// example for fraction: F1(D2,D3)
			let s_ab_i = rhs.substring(i);
			let s_vor_klammer_zu = stringBefore(s_ab_i, ')');
			let lenRaus = s_vor_klammer_zu.length + 1;
			//console.log('_________', s_ab_i, s_vor_klammer_zu, lenRaus);
			let s_nach_fraction = stringAfter(s_ab_i, ')');

			let kFraction = s_ab_i.substring(0, 2);
			//console.log('s_ab_i', s_ab_i)
			let kNum = s_ab_i.substring(3); kNum = stringBefore(kNum, ',');
			let kDenom = stringAfter(s_ab_i, ','); kDenom = stringBefore(kDenom, ')'); //s_ab_i.substring(6, 8);

			//console.log('kFraction', kFraction, '\nkNum', kNum, '\nkDenom', kDenom);

			rhs = rhs.substring(0, i) + 'math.fraction(' + kNum + ',' + kDenom + ')' + s_nach_fraction;
			//console.log('new rhs', rhs);

			//get a random fraction
			let num = isNumber(kNum) ? Number(kNum) : isdef(diop[kNum]) ? diop[kNum] : null;
			let denom = isNumber(kDenom) ? Number(kDenom) : isdef(diop[kDenom]) ? diop[kDenom] : null;

			let fr = getRandomFraction(num, denom);
			//console.log('fraction is', fr);
			diop[kFraction] = fr;
			if (!num) diop[kNum] = fr.n;
			if (!denom) diop[kDenom] = fr.d;
			// if (nundef(diop[kNum]) && !isNumber(kNum)) diop[kNum] = fr.n;
			// if (nundef(diop[kDenom]) && !isNumber(kDenom)) diop[kDenom] = fr.d;
			//console.log('dict', diop)
			//rhs=rhs.substring(0,i)+
			i += 20; //length of new rhs middle text
			//console.log('rhs rest is', rhs.substring(i));
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
		let val = diop[k];
		if (isFractionType(val)) val = `math.fraction(${val.n},${val.d})`;
		eq = eq.replace(k, val); //diop[k]);
	}
	//console.log('diop',diop);

	//eq = 'math.add(math.fraction(2,9)'
	//console.log('eq', eq);
	let result = eval(eq);
	//console.log('result', result);

	//now, assign result to lhs
	let lhs = stringAfter(sol, '=').trim();
	if (isEmpty(lhs)) lhs = 'R';

	//if lhs contains more than 1 all but the last one have to be replaced by 
	diop[lhs] = result;

	return [result, eq];
}

function isFractionType(x) { return isDict(x) && isdef(x.n) && isdef(x.d); }
function fractionConvert(wp, diop) {
	let n = wp.result.number;
	let t = typeof n;
	//console.log('num is', n, 'type', t);
	if (isFractionType(n)) {
		//console.log('haaaaaaaaaaaaaaaaaaaaaaaa');
		wp.isFractionResult = true;
		wp.result.text = getTextForFraction(n.n, n.d);
	}
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
