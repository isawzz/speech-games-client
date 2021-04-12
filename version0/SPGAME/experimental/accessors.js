// label
function fLabeli3(i, info) { return '' + lastWord(info.key).substring(0, 3) + i; }

// color: bg,fg
function f2ColorsAlt(c1, c2, i, info) { return i % 2 ? ()=>c1:()=>c2; }
function fBg(i, info) { return i % 2 ? 'red' : 'blue'; }
