(function(enyo, scope) {
	var ms = Math.round(1000/60);
	var prefix = ['webkit', 'moz', 'ms', 'o', ''];
	var r = 'requestAnimationFrame';
	var c = 'cancel' + enyo.cap(r);

	/*
	* Fallback on setTimeout
	*
	* @private
	*/
	var _requestFrame = function(inCallback) {
		return window.setTimeout(inCallback, ms);
	};

	/*
	* Fallback on clearTimeout
	*
	* @private
	*/
	var _cancelFrame = function(inId) {
		return window.clearTimeout(inId);
	};

	for (var i = 0, pl = prefix.length, p, wc, wr; (p = prefix[i]) || i < pl; i++) {
		// if we're on ios 6 just use setTimeout, requestAnimationFrame has some kinks currently
		if (enyo.platform.ios >= 6) {
			break;
		}

		// if prefixed, becomes Request and Cancel
		wc = p ? (p + enyo.cap(c)) : c;
		wr = p ? (p + enyo.cap(r)) : r;
		// Test for cancelRequestAnimationFrame, because some browsers (Firefix 4-10) have a request without a cancel
		if (window[wc]) {
			_cancelFrame = window[wc];
			_requestFrame = window[wr];
			if (p == 'webkit') {
				/*
					Note: In Chrome, the first return value of webkitRequestAnimationFrame is 0.
					We make 1 bogus call so the first used return value of webkitRequestAnimationFrame is > 0, as the spec requires.
					This makes it so that the requestId is always truthy.
					(we choose to do this rather than wrapping the native function to avoid the overhead)
				*/
				_cancelFrame(_requestFrame(enyo.nop));
			}
			break;
		}
	}
	/**
	* Requests an animation callback.
	*
	* On compatible browsers, if _node_ is defined, the [callback]{@link external:callback} will
	* fire only if _node_ is visible.
	*
	* @param {Function} callback A [callback]{@link external:callback} to be executed on the
	*                            animation frame.
	* @param {Node} node The DOM node to request the animation frame for.
	* @returns {Object} A request id to be used with
	*                     [enyo.cancelRequestAnimationFrame]{@link enyo.cancelRequestAnimationFrame}.
	* @public
	*/
	enyo.requestAnimationFrame = function(callback, node) {
		return _requestFrame(callback, node);
	};
	/**
	* Cancels a requested animation callback with the specified id.
	*
	* @public
	*/
	enyo.cancelRequestAnimationFrame = function(inId) {
		return _cancelFrame(inId);
	};

	/**
	* An assortment of interpolation functions for animations. Similar in function to CSS3 transitions.
	*
	* Intended for use with [enyo.easedLerp]{@link enyo.easedLerp}. Easing functions accept one (1)
	* [Number]{@link external:Number} parameter and return one (1) [Number]{@link external:Number}
	*
	* @namespace enyo.easing
	* @public
	*/
	enyo.easing = /** @lends enyo.easing */ {
		/**
		* cubicIn
		*
		* @public
		*/
		cubicIn: function(n) {
			return Math.pow(n, 3);
		},
		/**
		* cubicOut
		*
		* @public
		*/
		cubicOut: function(n) {
			return Math.pow(n - 1, 3) + 1;
		},
		/**
		* expoOut
		*
		* @public
		*/
		expoOut: function(n) {
			return (n == 1) ? 1 : (-1 * Math.pow(2, -10 * n) + 1);
		},
		/**
		* quadInOut
		*
		* @public
		*/
		quadInOut: function(n) {
			n = n * 2;
			if (n < 1) {
				return Math.pow(n, 2) / 2;
			}
			return -1 * ((--n) * (n - 2) - 1) / 2;
		},
		/**
		* linear
		*
		* @public
		*/
		linear: function(n) {
			return n;
		}
	};

	/**
	* Gives an interpolation of an animated transition's distance from 0 to 1.
	*
	* Given a start time (_t0_) and an animation duration (_duration_), applies the _easing_ function to
	* the percentage of time elapsed / duration, capped at 100%.
	*
	* @param {Number} t0 Start time.
	* @param {Number} duration Duration in miliseconds.
	* @param {Function} easing An easing [function]{@link external:Function} reference from
	*	{@link enyo.easing}.
	* @param {Boolean} reverse Shall this run in reverse?
	* @returns {Number} The resulting position, capped at a maximum of 100%.
	* @public
	*/
	enyo.easedLerp = function(t0, duration, easing, reverse) {
		var lerp = (enyo.perfNow() - t0) / duration;
		if (reverse) {
			return lerp >= 1 ? 0 : (1 - easing(1 - lerp));
		} else {
			return lerp >= 1 ? 1 : easing(lerp);
		}
	};

	/**
	* Gives an interpolation of an animated transition's distance from _startValue_ to _valueChange_.
	*
	* Applies the _easing_ function with a wider range of variables to allow for more complex
	* animations.
	*
	* @param {Number} t0 Start time.
	* @param {Number} duration Duration in miliseconds.
	* @param {Function} easing An easing [function]{@link external:Function} reference from
	*	{@link enyo.easing}.
	* @param {Boolean} reverse Shall this run in reverse?
	* @param {Number} time
	* @param {Number} startValue Starting value.
	* @param {Number} valueChange
	* @returns {Number} The resulting position, capped at a maximum of 100%.
	* @public
	*/
	enyo.easedComplexLerp = function(t0, duration, easing, reverse, time, startValue, valueChange) {
		var lerp = (enyo.perfNow() - t0) / duration;
		if (reverse) {
			return easing(1 - lerp, time, startValue, valueChange, duration);
		} else {
			return easing(lerp, time, startValue, valueChange, duration);
		}
	};
})(enyo, this);