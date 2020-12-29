const SHOW_FREEZER = false; // !IS_TESTING;
const CLEAR_LOCAL_STORAGE = false;
var QuestionCounter = 0;
var lastPosition;

//reserved names: dName for div with id dName (dName = mBy('dName'))

const levelColors = [LIGHTGREEN, LIGHTBLUE, YELLOW, 'orange', RED,
	GREEN, BLUE, PURPLE, YELLOW2, 'deepskyblue', 'deeppink', //** MAXLEVEL 10 */
	TEAL, ORANGE, 'seagreen', FIREBRICK, OLIVE, '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000', 'gold', 'orangered', 'skyblue', 'pink', 'palegreen', '#e6194B'];
var levelKeys = ['island', 'justice star', 'materials science', 'mayan pyramid', 'medieval gate',
	'great pyramid', 'meeple', 'smart', 'stone tower', 'trophy cup', 'viking helmet',
	'flower star', 'island', 'justice star', 'materials science', 'mayan pyramid',];

const DD = {
	yellow: 'gelb', green: 'grün', blue: 'blau', red: 'rot', pink: 'rosa', orange: 'orange', black: 'schwarz',
	white: 'weiss', violet: 'violett', '1st': 'erste', '2nd': 'zweite', '3rd': 'dritte', '4th': 'vierte', '5th': 'fünfte',
	add:'addiere',subtract:'subtrahiere',multiply:'mutipliziere',plus:'plus',minus:'minus',times:'mal',
	'divided by':'dividiert durch',
	'to the previous number':'zur vorhergehenden zahl',
	'from the previous number':'von der vorhergehenden zahl',
	'multiply the previous number by':'multipliziere die vorhergehende zahl mit',
	'divide the previous number by':'dividiere die vorhergehende zahl durch',
	'the previous number':'die vorhergehende zahl',is:'ist',what:'was',equals:'ist gleich',enter:"tippe",
	'to the power of':'hoch',or:'oder',less:'kleiner',greater:'grösser',than:'als',equal:'gleich',and:'und',not:'nicht',
	say:'sage',write:'schreibe',complete:'ergänze','unequal':'ungleich',except:'ausser',EXCEPT:'AUSSER',
	number:'Zahl',color:'farbe',eliminate:'eliminiere',all:'alle',with:'mit',
};
const OPS = {
	'+':{sp:'plus',f:(a,b)=>(a+b)},
	'-':{sp:'minus',f:(a,b)=>(a+b)},
	'/':{sp:'divided by',f:(a,b)=>(a/b)},
	'//':{sp:'divided by',f:(a,b)=>(Math.floor(a/b))},
	'*':{sp:'times',f:(a,b)=>(a*b)},
	'**':{sp:'to the power of',f:(a,b)=>(Math.pow(a,b))},
	'pow':{sp:'to the power of',f:(a,b)=>(Math.pow(a,b))},
	'mod':{sp:'modulo',f:(a,b)=>(a%b)},
	'<':{sp:'less than',f:(a,b)=>(a<b)},
	'>':{sp:'greater than',f:(a,b)=>(a>b)},
	'<=':{sp:'less or equal',f:(a,b)=>(a<=b)},
	'>=':{sp:'greater or equal',f:(a,b)=>(a>=b)},
	'=':{sp:'equal',f:(a,b)=>(a==b)},
	'!=':{sp:'unequal',f:(a,b)=>(a!=b)},
	'and':{sp:'and',f:(a,b)=>(a&&b)},
	'or':{sp:'or',f:(a,b)=>(a||b)},
	'nand':{sp:'nand',f:(a,b)=>(!(a&&b))},
	'nor':{sp:'nor',f:(a,b)=>(!(a||b))},
	'xor':{sp:'xor',f:(a,b)=>(a && !b || !a && b)},
}







