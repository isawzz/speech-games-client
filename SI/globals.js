const EXPERIMENTAL = true;
const IS_TESTING = false;
USERNAME = IS_TESTING ? 'Squid' : 'Gunter';

//common for all games and users / control flow
const USE_USER_HISTORY_FOR_STARTLEVEL = true; // when switching to new game (or at beginning) use UseHistory to determine startLevel for each game

const UPDATE_USER_HISTORY_STARTLEVEL = true;
const CLEAR_LOCAL_STORAGE = false;
const RESTART_EACH_TIME = false; //IS_TESTING; // restarts program at startLevel instead of continuing where left off

const SETTINGS_KEY_FILE = IS_TESTING ? 'settingsTEST' : 'settings';
const immediateStart = true;  // false | true
const SHOW_FREEZER = false; // !IS_TESTING;

var MASTER_VOLUME = 1;
var loopGameSequence = true;
var StepByStepMode = false; // wartet auf click next um wieder zu starten!
var skipAnimations = IS_TESTING; // false | true
var skipAniGameOver = true; // IS_TESTING;
var skipBadgeAnimation = true;
//var MAXLEVEL = 10;
var MaxLevel; //game dependent!
var KeySets, GameInfo, LevelInfo;

// delays
var DELAY = 1000;
var ROUND_DELAY = 300;
var DELAY_BETWEEN_MIKE_AND_SPEECH = 2000;
var fleetingMessageTimeout;

var Speech;

// output showing
var RecogOutput = true;
var RecogOutputError = false;
var RecogHighPriorityOutput = true;
var SpeakerOutput = false;
var ROUND_OUTPUT = false;
USE_LOCAL_STORAGE = true; // * defined in CODE/globalConfig.js *

var ProgTimeout; //to cancel timer!
var ProgTimeIsUp; // = false; flag for program timer
var Settings;
var MaxNumTrials = 1;
var MinWordLength = 1;
var MaxWordLength = 100;
var NumPics;
var NumRepeat;
var NumLabels;
var Pictures = [];
var Goal, Selected;
var NextPictureIndex = 0;
var Steps, iStep;

var currentUser;
var currentGame;
var currentLevel;
var currentColor = 'navy';
var currentLanguage;
var currentCategories;
var currentKeys; //see setKeys_, reset at each level!!!!!

//defaults hardcoded
var startAtLevel = IS_TESTING ? { gSayPicAuto: 10, gTouchPic: 10, gTouchColors: 10, gWritePic: 10, gMissingLetter: 10, gSayPic: 10 } : { gMissingLetter: 10, gTouchPic: 10, gTouchColors: 10, gWritePic: 10, gSayPic: 10 };

var MicrophoneUi; //this is the ui

//score
var scoringMode = 'adapt'; // n | inc | percent | mixed | autograde | adapt
var minIncrement = 1, maxIncrement = 5, levelDonePoints = 5;
var numCorrectAnswers, numTotalAnswers, percentageCorrect;
var levelIncrement, levelPoints;
var CurrentSessionData, CurrentGameData, CurrentLevelData;
var UserHistory, SessionScoreSummary, UnitScoreSummary;
var LevelChange = true;
var IsAnswerCorrect;
var PosInARow, NegInARow;

var lastPosition = 0;
var trialNumber;
var boundary;
var uiActivated;
const MarkerText = ['✔️', '❌'];
const MarkerId = { SUCCESS: 0, FAIL: 1 };
var Markers = [];


//ui state flags
const uiHaltedMask = 1 << 0; //eg. when entering settings
const beforeActivationMask = 1 << 1;
const hasClickedMask = 1 << 2;
var uiPausedStack = [];
var uiPaused = 0;

const levelColors = [LIGHTGREEN, LIGHTBLUE, YELLOW, 'orange', RED,
	GREEN, BLUE, PURPLE, YELLOW2, 'deepskyblue', 'deeppink', //** MAXLEVEL 10 */
	TEAL, ORANGE, 'seagreen', FIREBRICK, OLIVE, '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000', 'gold', 'orangered', 'skyblue', 'pink', 'palegreen', '#e6194B'];
let levelKeys = ['island', 'justice star', 'materials science', 'mayan pyramid', 'medieval gate',
	'great pyramid', 'meeple', 'smart', 'stone tower', 'trophy cup', 'viking helmet',
	'flower star', 'island', 'justice star', 'materials science', 'mayan pyramid',];

// ui
var dLineTopOuter, dLineTop, dLineTopLeft, dLineTopRight, dLineTopMiddle;
var dLineTitleOuter, dLineTitle, dLineTitleLeft, dLineTitleRight, dLineTitleMiddle;
var dLineTableOuter, dLineTable, dLineTableLeft, dLineTableRight, dLineTableMiddle;
var dLineBottomOuter, dLineBottom, dLineBottomLeft, dLineBottomRight, dLineBottomMiddle;
var dHint, dFeedback, dInstruction, dScore, dLevel, dGameTitle;
var inputBox;
var defaultFocusElement;
var dTable, dTitle;
var dProgram,dMenu,dGameSettings;
var dLeiste;

//feedback
var score, hintWord, bestWord, answerCorrect, currentInfo;

//testing
var timit;

//flags
var BlockServerSend = false;