class IPVTimer {
  static token;

  static stopped = false;

  constructor (ifPageVisible,seconds,callback) {
    this.start();

    this.ifPageVisible.on('statusChanged', (data) => {
      if (this.stopped === false) {
        if (data.status === STATUS_ACTIVE) {
          this.start();
        } else {
          this.pause();
        }
      }
    });
  }

  static start () {
    this.stopped = false;
    clearInterval(this.token);
    this.token = setInterval(this.callback, this.seconds * 1000);
  }

  stop () {
    this.stopped = true;
    clearInterval(this.token);
  }

  resume () {
    this.start();
  }

  pause () {
    this.stop();
  }
}

class IPVEvents {
  static store = {};
  static setListener;

  static attach (event, callback) {
    if (!IPVEvents.store[event]) {
      IPVEvents.store[event] = [];
    }
    IPVEvents.store[event].push(callback);
  }

  static fire (event, args = []) {
    if (IPVEvents.store[event]) {
      IPVEvents.store[event].forEach(callback => {
        callback(...args);
      });
    }
  }

  static remove (event, callback) {
    if (!callback) {
      delete IPVEvents.store[event];
    }
    if (IPVEvents.store[event]) {
      store[event] = store[event].filter(savedCallback => {
        return callback !== savedCallback;
      });
    }
  }

  static dom (element, event, callback) {
    if (!IPVEvents.setListener) {
      if (element.addEventListener) {
        IPVEvents.setListener = (el, ev, fn) => {
          return el.addEventListener(ev, fn, false);
        };
      } else if (typeof element.attachEvent === 'function') {
        IPVEvents.setListener = (el, ev, fn) => {
          return el.attachEvent(`on${ev}`, fn, false);
        };
      } else {
        setListener = (el, ev, fn) => {
          // eslint-disable-next-line no-return-assign, no-param-reassign
          return el[`on${ev}`] = fn;
        };
      }
    }
    return IPVEvents.setListener(element, event, callback);
  }
}
// import { IPVEvents } from './IPVEvents';
// import IPVTimer from './IPVTimer';

const STATUS_ACTIVE = 'active';
const STATUS_IDLE = 'idle';
const STATUS_HIDDEN = 'hidden';

let DOC_HIDDEN;
let VISIBILITY_CHANGE_EVENT;

var IIdleInfo = {};

const IE = (function () {
	let undef;
	let v = 3;
	const div = document.createElement('div');
	const all = div.getElementsByTagName('i');

	while (
		div.innerHTML = `<!--[if gt IE ${++v}]><i></i><![endif]-->`,
		all[0]
	);

	return v > 4 ? v : undef;
}());

class IPVisible {
	static status = STATUS_ACTIVE;

	static VERSION = '2.0.11';

	static timers = [];

	static idleTime = 30000;

	static idleStartedTime;

	static isLegacyModeOn = false;


	constructor(root, doc) {
		// Find correct browser events
		this.doc=doc;
		this.root=root;
		if (this.doc.hidden !== undefined) {
			DOC_HIDDEN = 'hidden';
			VISIBILITY_CHANGE_EVENT = 'visibilitychange';
		} else if (this.doc.mozHidden !== undefined) {
			DOC_HIDDEN = 'mozHidden';
			VISIBILITY_CHANGE_EVENT = 'mozvisibilitychange';
		} else if (this.doc.msHidden !== undefined) {
			DOC_HIDDEN = 'msHidden';
			VISIBILITY_CHANGE_EVENT = 'msvisibilitychange';
		} else if (this.doc.webkitHidden !== undefined) {
			DOC_HIDDEN = 'webkitHidden';
			VISIBILITY_CHANGE_EVENT = 'webkitvisibilitychange';
		}

		if (DOC_HIDDEN === undefined) {
			this.legacyMode();
		} else {
			const trackChange = () => {
				if (this.doc[DOC_HIDDEN]) {
					this.blur();
				} else {
					this.focus();
				}
			};
			trackChange(); // get initial status
			IPVEvents.dom(this.doc, VISIBILITY_CHANGE_EVENT, trackChange);
		}
		this.startIdleTimer();
		this.trackIdleStatus();
	}

	legacyMode() {
		// it's already on
		if (this.isLegacyModeOn) { return; }

		let BLUR_EVENT = 'blur';
		const FOCUS_EVENT = 'focus';

		if (IE < 9) {
			BLUR_EVENT = 'focusout';
		}

		IPVEvents.dom(this.root, BLUR_EVENT, () => {
			return this.blur();
		});

		IPVEvents.dom(this.root, FOCUS_EVENT, () => {
			return this.focus();
		});

		this.isLegacyModeOn = true;
	}

	startIdleTimer(event) {
		// Prevents Phantom events.
		// @see https://github.com/serkanyersen/ifPageVisible.js/pull/37
		if (event instanceof MouseEvent && event.movementX === 0 && event.movementY === 0) {
			return;
		}

		IPVisible.timers.map(clearTimeout);
		IPVisible.timers.length = 0; // clear the array

		if (IPVisible.status === STATUS_IDLE) {
			this.wakeup();
		}

		IPVisible.idleStartedTime = +(new Date());

		IPVisible.timers.push(setTimeout(() => {
			if (this.status === STATUS_ACTIVE || this.status === STATUS_HIDDEN) {
				return this.idle();
			}
		}, IPVisible.idleTime));
	}

	trackIdleStatus() {
		IPVEvents.dom(this.doc, 'mousemove', this.startIdleTimer.bind(this));
		IPVEvents.dom(this.doc, 'mousedown', this.startIdleTimer.bind(this));
		IPVEvents.dom(this.doc, 'keyup', this.startIdleTimer.bind(this));
		IPVEvents.dom(this.doc, 'touchstart', this.startIdleTimer.bind(this));
		IPVEvents.dom(this.root, 'scroll', this.startIdleTimer.bind(this));
		// When page is focus without any event, it should not be idle.
		this.focus(this.startIdleTimer.bind(this));
	}

	on(event, callback) {
		IPVEvents.attach(event, callback);
		return this;
	}

	off(event, callback) {
		IPVEvents.remove(event, callback);
		return this;
	}

	setIdleDuration(seconds) {
		this.idleTime = seconds * 1000;
		this.startIdleTimer();
		return this;
	}

	getIdleDuration() {
		return this.idleTime;
	}

	getIdleInfo() {
		const now = +(new Date());
		let res;
		if (this.status === STATUS_IDLE) {
			res = {
				isIdle: true,
				idleFor: now - this.idleStartedTime,
				timeLeft: 0,
				timeLeftPer: 100,
			};
		} else {
			const timeLeft = (this.idleStartedTime + this.idleTime) - now;
			res = {
				isIdle: false,
				idleFor: now - this.idleStartedTime,
				timeLeft,
				timeLeftPer: parseFloat((100 - (timeLeft * 100 / this.idleTime)).toFixed(2)),
			};
		}
		return res;
	}

	idle(callback) {
		if (callback) {
			this.on('idle', callback);
		} else {
			this.status = STATUS_IDLE;
			IPVEvents.fire('idle');
			IPVEvents.fire('statusChanged', [{ status: this.status }]);
		}
		return this;
	}

	blur(callback) {
		if (callback) {
			this.on('blur', callback);
		} else {
			this.status = STATUS_HIDDEN;
			IPVEvents.fire('blur');
			IPVEvents.fire('statusChanged', [{ status: this.status }]);
		}
		return this;
	}

	focus(callback) {
		if (callback) {
			this.on('focus', callback);
		} else if (this.status !== STATUS_ACTIVE) {
			this.status = STATUS_ACTIVE;
			IPVEvents.fire('focus');
			IPVEvents.fire('wakeup');
			IPVEvents.fire('statusChanged', [{ status: this.status }]);
		}
		return this;
	}

	wakeup(callback) {
		if (callback) {
			this.on('wakeup', callback);
		} else if (this.status !== STATUS_ACTIVE) {
			this.status = STATUS_ACTIVE;
			IPVEvents.fire('wakeup');
			IPVEvents.fire('statusChanged', [{ status: this.status }]);
		}
		return this;
	}

	onEvery(seconds, callback) {
		return new IPVTimer(this, seconds, callback);
	}

	now(check) {
		if (check !== undefined) {
			return this.status === check;
		}
		return this.status === STATUS_ACTIVE;
	}
}

var global;
// decide between self vs global depending on the environment
const root = (typeof self === 'object' && self.self === self && self)
             || (typeof global === 'object' && global.global === global && global)
             || this;

const ifPageVisible = new IPVisible(root, document);
