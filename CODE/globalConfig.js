var USERNAME;

var STOPAUS;

var DB, G, Settings, U, GS; //GS...Session, G...Game, U...User

var Speech;

var TaskChain, CancelChain, ChainTimeout, BlockChain; //chains are NOT reentrant!

var Pictures, Goal, Selected, Score;


//#region unused as of SIMA
//feature sets:
var DefaultSettings, UserHistory, SettingsChanged; //dep SIMA

//#region unused as of HA
const TIMIT_SHOW = true; // true | false

//#region unused as of GS
var SIGI;
var UIS = {};


