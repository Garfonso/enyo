(function (enyo, scope) {
	
	/**
	* A polyfill for platforms that don't yet support
	* [bind]{@link external:Function.prototype.bind}. As is explained in the linked article, this
	* polyfill handles the general use-case but cannot exactly mirror ECMA-262 version 5
	* implementation specification. This is an adaptation of the example promoted
	* [here]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind}.
	*/
	if (!Function.prototype.bind) {
		Function.prototype.bind = function (ctx) {
			// deliberately used here...
			var args = Array.prototype.slice.call(arguments, 1),
				scop = this,
				nop = function () {},
				ret;
			
			// as-per MDN's explanation of this polyfill we're filling in for the IsCallable
			// internal (we can't access it)
			if (typeof this != 'function') {
				throw new TypeError('Function.prototype.bind called on non-callable object.');
			}
			
			ret = function () {
				var largs = args.concat(Array.prototype.slice.call(arguments)),
					lctx = this instanceof nop && ctx ? this : ctx;
				
				return scop.apply(lctx, largs);
			};
			
			nop.prototype = this.prototype;
			
			/*jshint -W055 */
			ret.prototype = new nop();
			/*jshint +W055 */
			
			return ret;
		};
	}
	
	/**
	* @private
	*/
	enyo.global = scope;
	
	/**
	* @private
	*/
	enyo.nop = function () {};
	
	/**
	* @private
	*/
	enyo.nob = {};
	
	/**
	* @private
	*/
	enyo.nar = [];
	
	/**
	* This name is reported in inspectors as the type of objects created via delegate, otherwise we
	* would just use {@link enyo.nop}
	*
	* @private
	*/
	enyo.instance = function () {};
	
	// some platforms need alternative syntax (e.g., when compiled as a v8 builtin)
	if (!enyo.setPrototype) {
		
		/**
		* @private
		*/
		enyo.setPrototype = function (ctor, proto) {
			ctor.prototype = proto;
		};
	}
	
	/**
	* Boodman/crockford delegation w/cornford optimization
	* 
	* @private
	*/
	enyo.delegate = function (proto) {
		enyo.setPrototype(enyo.instance, proto);
		return new enyo.instance();
	};
	
	// ----------------------------------
	// General Functions
	// ----------------------------------
	
	/**
	* Determine if a variable is defined.
	* 
	* @param {*} target Anything that can be compared to `undefined`.
	* @returns {Boolean} `true` if defined, `false` otherwise.
	* @public
	*/
	enyo.exists = function (target) {
		return (target !== undefined);
	};
	
	var uidCounter = 0;
	
	/**
	* Creates a unique identifier (with an optional prefix) and returns the identifier as a string.
	*
	* @param {String} [prefix] The prefix to prepend to the generated unique id.
	* @returns {String} An optionally prefixed identifier.
	* @public
	*/
	enyo.uid = function (prefix) {
		return String((prefix? prefix: '') + uidCounter++);
	};
	
	/**
	* RFC4122 uuid generator for the browser.
	*
	* @returns {String} A [RFC4122]{@link external:UUID} compliant universally unique identifier.
	* @public
	*/
	enyo.uuid = function () {
		// @TODO: Could possibly be faster
		var t, p = (
			(Math.random().toString(16).substr(2,8)) + '-' +
			((t=Math.random().toString(16).substr(2,8)).substr(0,4)) + '-' +
			(t.substr(4,4)) +
			((t=Math.random().toString(16).substr(2,8)).substr(0,4)) + '-' +
			(t.substr(4,4)) +
			(Math.random().toString(16).substr(2,8))
		);
		return p;
	};
	
	/**
	* Generates a random number using [Math.random]{@link external:Math.random}.
	*
	* @param {Number} bound The multiplier by which to generate the product.
	* @returns {Number} A random number.
	* @public
	*/
	enyo.irand = function (bound) {
		return Math.floor(Math.random() * bound);
	};
	
	var toString = Object.prototype.toString;

	/**
	* Determine if a given variable is a [String]{@link external:String}.
	*
	* @param {*} The variable to determine is a [String]{@link external:String}.
	* @returns {Boolean} `true` if a [String]{@link external:String}, `false` otherwise.
	* @public
	*/
	enyo.isString = function (it) {
		return toString.call(it) === '[object String]';
	};

	/**
	* Determine if a given variable is a [Function]{@link external:Function}.
	* 
	* @param {*} it The variable to determine is a [Function]{@link external:Function}.
	* @returns {Boolean} `true` if a [Function]{@link external:Function}, `false` otherwise.
	* @public
	*/
	enyo.isFunction = function (it) {
		return toString.call(it) === '[object Function]';
	};

	/**
	* Determine if a given variable is an [Array]{@link external:Array}.
	*
	* @param {*} it The variable to determine is an [Array]{@link external:Array}.
	* @returns {Boolean} `true` if an [Array]{@link external:Array}, `false` otherwise.
	* @method
	* @public
	*/
	enyo.isArray = Array.isArray || function (it) {
		return toString.call(it) === '[object Array]';
	};

	/**
	* Determine if a given variable is an [Object]{@link external:Object}.
	*
	* @param {*} it The variable to determine is an [Object]{@link external:Object}.
	* @returns {Boolean} `true` if an [Object]{@link external:Object}, `false` otherwise.
	* @method
	* @public
	*/
	enyo.isObject = Object.isObject || function (it) {
		// explicit null/undefined check for IE8 compatibility
		return (it != null) && (toString.call(it) === '[object Object]');
	};

	/**
	* Determine if a given variable is an explicit boolean `true`.
	*
	* @param {*} it The variable to determine is an explicit `true`.
	* @returns {Boolean} `true` if an explicit `true`, `false` otherwise.
	* @public
	*/
	enyo.isTrue = function (it) {
		return !(it === 'false' || it === false || it === 0 || it === null || it === undefined);
	};
	
	/**
	* Bind the `this` context of any method to a scope and a variable number of provided initial
	* parameters.
	*
	* @param {Object} scope The `this` context for the method.
	* @param {(Function|String)} method A Function or the name of a method to bind.
	* @param {...*} [args] Any arguments that will be provided as the initial arguments to the
	*                      enclosed method.
	* @returns {Function} The bound method/closure.
	* @public
	*/
	enyo.bind = function (scope, method) {
		if (!method) {
			method = scope;
			scope = null;
		}
		scope = scope || enyo.global;
		if (typeof method == 'string') {
			if (scope[method]) {
				method = scope[method];
			} else {
				throw('enyo.bind: scope["' + method + '"] is null (scope="' + scope + '")');
			}
		}
		if (typeof method == 'function') {
			var args = enyo.cloneArray(arguments, 2);
			if (method.bind) {
				return method.bind.apply(method, [scope].concat(args));
			} else {
				return function() {
					var nargs = enyo.cloneArray(arguments);
					// invoke with collected args
					return method.apply(scope, args.concat(nargs));
				};
			}
		} else {
			throw('enyo.bind: scope["' + method + '"] is not a function (scope="' + scope + '")');
		}
	};
	
	/**
	* Binds a callback to a scope. If the object has a 'destroyed' property that's truthy, then the
	* callback will not be run if called. This can be used to implement both
	* {@link enyo.Object.bindSafely} and for {@link enyo.Object}-like objects like
	* {@link enyo.Model} and {@link enyo.Collection}.
	*
	* @param {Object} scope The `this` context for the method.
	* @param {(Function|String)} method A Function or the name of a method to bind.
	* @param {...*} [args] Any arguments that will be provided as the initial arguments to the
	*                      enclosed method.
	* @returns {Function} The bound method/closure.
	* @public
	*/
	enyo.bindSafely = function (scope, method) {
		if (typeof method == 'string') {
			if (scope[method]) {
				method = scope[method];
			} else {
				throw('enyo.bindSafely: scope["' + method + '"] is null (this="' + this + '")');
			}
		}
		if (typeof method == 'function') {
			var args = enyo.cloneArray(arguments, 2);
			return function() {
				if (scope.destroyed) {
					return;
				}
				var nargs = enyo.cloneArray(arguments);
				return method.apply(scope, args.concat(nargs));
			};
		} else {
			throw('enyo.bindSafely: scope["' + method + '"] is not a function (this="' + this + '")');
		}
	};
	
	/**
	* Calls the provided _method_ on _scope_, asynchronously.
	*
	* Uses [window.setTimeout]{@link external:window.setTimeout} with minimum delay, usually around
	* 10ms.
	*
	* Additional arguments are passed to _method_ when it is invoked.
	*
	* If only a single argument is supplied, will just call that function asyncronously without
	* doing any additional binding.
	*
	* @param {Object} scope The `this` context for the method.
	* @param {(Function|String)} method A Function or the name of a method to bind.
	* @param {...*} [args] Any arguments that will be provided as the initial arguments to the
	*                      enclosed method.
	* @returns {Number} The `setTimeout` id.
	* @public
	*/
	enyo.asyncMethod = function (scope, method) {
		if (!method) {
			// passed just a single argument
			return setTimeout(scope, 1);
		} else {
			return setTimeout(enyo.bind.apply(enyo, arguments), 1);
		}
	};

	/**
	* Calls the provided _method_ ([String]{@link external:String}) on _scope_ with optional
	* arguments _args_ ([Array]{@link external:Array}), if the object and method exist.
	*
	* @example
	* 	enyo.call(myWorkObject, 'doWork', [3, 'foo']);
	*
	* @param {Object} scope The `this` context for the method.
	* @param {(Function|String)} method A Function or the name of a method to bind.
	* @param {Array} [args] An array of arguments to pass to the method.
	* @returns {*} The return value of the method.
	* @public
	*/
	enyo.call = function (scope, method, args) {
		var context = scope || this;
		if (method) {
			var fn = context[method] || method;
			if (fn && fn.apply) {
				return fn.apply(context, args || []);
			}
		}
	};

	/**
	* Returns the current time in milliseconds. On platforms that support it will use
	* [Date.now]{@link external:Date.now} otherwise it will be equivalent to
	* [new Date().getTime()]{@link external:Date.getTime}.
	* 
	* @returns {Number} The milliseconds representing the current time.
	* @method
	* @public
	*/

	enyo.now = Date.now || function () {
		return new Date().getTime();
	};

	/**
	* When [window.performance]{@link external:window.performance} is available, supply a
	* high-precision, high performance monotonic timestamp, which is independent of changes to the
	* system clock and safer for use in animation, etc. Falls back to {@link enyo.now} (based on the
	* JS [Date]{@link external:Date} object), which is subject to system time changes.
	* 
	* @returns {Number} The milliseconds representing the current time or time since beginning
	*                       execution of the application as reported by the platform.
	* @method
	* @public
	*/
	enyo.perfNow = (function () {
		// we have to check whether or not the browser has supplied a valid
		// method to use
		var perf = window.performance || {};
		// test against all known vendor-specific implementations, but use
		// a fallback just in case
		perf.now = perf.now || perf.mozNow || perf.msNow || perf.oNow || perf.webkitNow || enyo.now;
		return function () {
			return perf.now();
		};
	}());

	/**
	* A fast-path enabled global getter that takes a string path, which may be a full path (from
	* context window/Enyo) or a relative path (to the execution context of the method). It knows how
	* to check for and call the backwards-compatible generated getters, as well as how to handle
	* computed properties. Returns _undefined_ if the object at the given path cannot be found. May
	* safely be called on non-existent paths.
	*	
	* @param {String} path The path from which to retrieve a value.
	* @returns {*} The value for the given path or `undefined` if the path could not be
	*                  completely resolved.
	* @method enyo.getPath
	* @public
	*/
	var getPath = enyo.getPath = function (path) {
		// we're trying to catch only null/undefined not empty string or 0 cases
		if (!path && path !== null && path !== undefined) return path;
		
		var next = (this === enyo? enyo.global: this),
			parts,
			part,
			getter,
			prev;
		
		// obviously there is a severe penalty for requesting get with a path lead
		// by unnecessary relative notation...
		if (path[0] == '.') path = path.replace(/^\.+/, '');
		
		// here's where we check to make sure we have a truthy string-ish
		if (!path) return;
		
		parts = path.split('.');
		part = parts.shift();
		
		do {
			prev = next;
			// for constructors we must check to make sure they are undeferred before
			// looking for static properties
			// if (next.prototype) next = enyo.checkConstructor(next);
			// for the auto generated or provided published property support we have separate
			// routines that must be called to preserve compatibility
			if (next._getters && ((getter = next._getters[part])) && !getter.generated) next = next[getter]();
			// for all other special cases to ensure we use any overloaded getter methods
			else if (next.get && next !== this && next.get !== getPath) next = next.get(part);
			// and for regular cases
			else next = next[part];
		} while (next && (part = parts.shift()));
				
		// if necessary we ensure we've undeferred any constructor that we're
		// retrieving here as a final property as well
		return next/* && next.prototype? enyo.checkConstructor(next): next*/;
	};
	
	/**
	* @private
	*/
	enyo.getPath.fast = function (path) {
		// the current context
		var b = this, fn, v;
		if (b._getters && (fn = b._getters[path])) {
			v = b[fn]();
		} else {
			v = b[path];
		}
		
		return (('function' == typeof v && enyo.checkConstructor(v)) || v);
	};

	/**
	* @TODO: Out of date...
	* A global setter that takes a string path (relative to the method's execution context) or a
	* full path (relative to window). Attempts to automatically retrieve any previously existing
	* value to supply to any observers. If the context is an {@link enyo.Object} or subkind, the
	* {@link enyo.ObserverSupport.notify} method is used to notify listeners for the path's being
	* set. If the previous value is equivalent to the newly set value, observers will not be
	* triggered by default. If the third parameter is present and is an explicit boolean true, the
	* observers will be triggered regardless. Returns the context from which the method was executed.
	*
	* @param {String} path The path for which to set the given value.
	* @param {*} is The value to set.
	* @param {Object} [opts] An options hash.
	* @returns {this} Whatever the given context was when executed.
	* @method enyo.setPath
	* @public
	*/
	var setPath = enyo.setPath = function (path, is, opts) {
		// we're trying to catch only null/undefined not empty string or 0 cases
		if (!path || (!path && path !== null && path !== undefined)) return this;
		
		var next = (this === enyo? enyo.global: this),
			options = {create: true, silent: false, force: false},
			base = next,
			parts,
			part,
			was,
			force,
			create,
			silent,
			comparator;
		
		if (typeof opts == 'object') opts = enyo.mixin({}, [options, opts]);
		else {
			force = opts;
			opts = options;
		}
		
		if (opts.force) force = true;
		silent = opts.silent;
		create = opts.create;
		comparator = opts.comparator;
		
		
		// obviously there is a severe penalty for requesting get with a path lead
		// by unnecessary relative notation...
		if (path[0] == '.') path = path.replace(/^\.+/, '');
		
		// here's where we check to make sure we have a truthy string-ish
		if (!path) return next;
		
		parts = path.split('.');
		part = parts.shift();
		
		do {
			
			if (!parts.length) was = next.get && next.get !== getPath? next.get(part): next[part];
			else {
				// this allows us to ensure that if we're setting a static property of a constructor we have the
				// correct constructor
				// @TODO: It seems ludicrous to have to check this on every single part of a chain; if we didn't have
				// deferred constructors this wouldn't be necessary and is expensive - unnecessarily so when speed is so important
				// if (next.prototype) next = enyo.checkConstructor(next);
				if (next !== base && next.set && next.set !== setPath) {
					parts.unshift(part);
					next.set(parts.join('.'), is, opts);
					return base;
				}
				if (next !== base && next.get) next = (next.get !== getPath? next.get(part): next[part]) || (create && (next[part] = {}));
				else next = next[part] || (create && (next[part] = {}));
			}
			
		} while (next && parts.length && (part = parts.shift()));
		
		if (!next) return base;
		
		// now update to the new value
		if (next !== base && next.set && next.set !== setPath) {
			next.set(part, is, opts);
			return base;
		} else next[part] = is;
		
		// if possible we notify the changes but this change is notified from the immediate
		// parent not the root object (could be the same)
		if (next.notify && !silent && (force || was !== is || (comparator && comparator(was, is)))) next.notify(part, was, is, opts);
		// we will always return the original root-object of the call
		return base;
	};
	
	/**
	* @private
	*/
	enyo.setPath.fast = function (path, value) {
		// the current context
		var b = this,
			// the previous value and helper variable
			rv, fn;
		// we have to check and ensure that we're not setting a computed property
		// and if we are, do nothing
		if (b._computed && b._computed[path] !== undefined) {
			return b;
		}
		if (b._getters && (fn=b._getters[path])) {
			rv = b[fn]();
		} else {
			rv = b[path];
		}
		// set the new value now that we can
		b[path] = value;
		
		// this method is only ever called from the context of enyo objects
		// as a protected method
		if (rv !== value) { b.notifyObservers(path, rv, value); }
		// return the context
		return b;
	};
	
	// ----------------------------------
	// String Functions
	// ----------------------------------
	
	/**
	* Uppercase a given string. Will coerce to a [String]{@link external:String} if
	* possible/necessary.
	*
	* @param {String} str The string to uppercase.
	* @returns {String} The uppercased string.
	* @public
	*/
	enyo.toUpperCase = function (str) {
		if (str != null) {
			return str.toString().toUpperCase();
		}
		return str;
	};
	
	/**
	* Lowercase a given string. Will coerce to a [String]{@link external:String} if
	* possible/necessary.
	*
	* @param {String} str The string to lowercase.
	* @returns {String} The lowercased string.
	* @public
	*/
	enyo.toLowerCase = function (str) {
		if (str != null) {
			return str.toString().toLowerCase();
		}
		return str;
	};
	
	/**
	* Capitalize a given string.
	*
	* @param {String} str The string to capitalize.
	* @returns {String} The capitalized string.
	* @public
	*/
	enyo.cap = function (str) {
		return str.slice(0, 1).toUpperCase() + str.slice(1);
	};

	/**
	* Un-capitalize a given string.
	* 
	* @param {String} str The string to un-capitalize.
	* @returns {String} The un-capitalized string.
	* @public
	*/
	enyo.uncap = function (str) {
		return str.slice(0, 1).toLowerCase() + str.slice(1);
	};
	
	/**
	* Will inject an arbitrary number of values, in order, into a template string at positions held
	* by `%.`.
	*
	* @param {String} template The string template to inject with values.
	* @param {...String} val The values to inject into the template.
	* @returns {String} A copy of the template populated with values.
	* @public
	*/
	enyo.format = function (template) {
		var pattern = /\%./g,
			arg = 0,
			tmp = template,
			args = arguments,
			replacer;
		
		replacer = function () {
			return args[++arg];
		};
		
		return tmp.replace(pattern, replacer);
	};
	
	/**
	* @private
	*/
	String.prototype.trim = String.prototype.trim || function () {
		return this.replace(/^\s+|\s+$/g, '');
	};
	
	/**
	* Takes a string and trims leading and trailing spaces. If the string has no length, is not a
	* string, or is a falsy value, it will be returned without modification.
	*
	* @param {String} str The string from which to remove whitespace.
	* @returns {String} The trimmed string.
	* @public
	*/
	enyo.trim = function (str) {
		return (typeof str == 'string' && str.trim()) || str;
	};
	
	// ----------------------------------
	// Object Functions
	// ----------------------------------
	
	/**
	* A [polyfill]{@link external:polyfill} for platforms that don't support
	* [Object.create]{@link external:Object.create}
	*/
	Object.create = Object.create || (function () {
		var Anon = function () {};
		return function (obj) {
			// in the polyfill we can't support the additional features so we are ignoring
			// the extra parameters
			if (!obj || obj === null || typeof obj != 'object') throw 'Object.create: Invalid parameter';
			Anon.prototype = obj;
			return new Anon();
		};
	})();
	
	/**
	* A [polyfill]{@link external:polyfill} for platforms that don't support
	* [Object.keys]{@link external:Object.keys}
	*/
	Object.keys = Object.keys || function (obj) {
		var results = [];
		var hop = Object.prototype.hasOwnProperty;
		for (var prop in obj) {
			if (hop.call(obj, prop)) {
				results.push(prop);
			}
		}
		// *sigh* IE 8
		if (!({toString: null}).propertyIsEnumerable('toString')) {
			var dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			];
			for (var i = 0, p; (p = dontEnums[i]); i++) {
				if (hop.call(obj, p)) {
					results.push(p);
				}
			}
		}
		return results;
	};
	
	/**
	* Returns an array of all own enumerable properties found on a given object.
	*
	* @alias Object.keys.
	* @method enyo.keys
	* @public
	*/
	enyo.keys = Object.keys;
	
	/**
	* Convenience method that takes an array of properties and an object as parameters. Returns a
	* new object with just those properties named in the array that are found to exist on the base
	* object. If the third parameter is true, falsy values will be ignored.
	*
	* @param {String[]} properties The properties to include on the returned object.
	* @param {Object} object The object from which to retrieve values for the requested properties.
	* @param {Boolean} [ignore=false] Whether or not to ignore copying falsy values.
	* @returns {Object} A new object populated with the requested properties and values from
	*                     the given object.
	* @public
	*/
	enyo.only = function (properties, object, ignore) {
		var ret = {},
			prop,
			len,
			i;
		
		for (i = 0, len = properties.length >>> 0; i < len; ++i) {
			prop = properties[i];
			
			if (ignore && (object[prop] === undefined || object[prop] === null)) continue;
			ret[prop] = object[prop];
		}
		
		return ret;
	};

	/**
	* Convenience method that takes two objects as parameters. For each key from the first object,
	* if the key also exists in the second object, a mapping of the key from the first object to the
	* key from the second object is added to a result object, which is eventually returned. In other
	* words, the returned object maps the named properties of the first object to the named
	* properties of the second object. The optional third parameter is a boolean designating whether
	* to pass unknown key/value pairs through to the new object. If true, those keys will exist on
	* the returned object.
	*
	* @param {Object} map The object with key/value pairs.
	* @param {Object} obj The object whose values will be used.
	* @param {Boolean} [pass=false] Whether or not to pass the unnamed properties through
	*                               from the given object.
	* @returns {Object} A new object whose properties have been mapped.
	* @public
	*/
	enyo.remap = function (map, obj, pass) {
		var ret = pass ? enyo.clone(obj) : {},
			key;
		
		for (key in map) {
			if (key in obj) ret[map[key]] = obj.get ? obj.get(key) : obj[key];
		}
		return ret;
	};

	/**
	* Helper method that accepts an _array_ of objects and returns a hash of those objects indexed
	* by the specified _property_. If a _filter_ is provided, the _filter_ should accept four
	* parameters: the key, the value (object), the current mutable map reference, and an immutable
	* copy of the original array of objects for comparison.
	*
	* @param {String} property The property to index the array by.
	* @param {Array} array An array of property objects.
	* @param {Function} [filter] The filter function to use, accepts 4 arguments.
	* @returns {Object} A hash (object) indexed by the _property_ argument
	* @public
	*/
	enyo.indexBy = function (property, array, filter) {
		// the return value - indexed map from the given array
		var map = {},
			value,
			len,
			idx = 0;
		// sanity check for the array with an efficient native array check
		if (!enyo.exists(array) || !(array instanceof Array)) {
			return map;
		}
		// sanity check the property as a string
		if (!enyo.exists(property) || 'string' !== typeof property) {
			return map;
		}
		// the immutable copy of the array
		var copy = enyo.clone(array);
		// test to see if filter actually exsits
		filter = enyo.exists(filter) && 'function' === typeof filter ? filter : undefined;
		for (len = array.length; idx < len; ++idx) {
			// grab the value from the array
			value = array[idx];
			// make sure that it exists and has the requested property at all
			if (enyo.exists(value) && enyo.exists(value[property])) {
				if (filter) {
					// if there was a filter use it - it is responsible for
					// updating the map accordingly
					filter(property, value, map, copy);
				} else {
					// use the default behavior - check to see if the key
					// already exists on the map it will be overwritten
					map[value[property]] = value;
				}
			}
		}
		// go ahead and return our modified map
		return map;
	};
	
	/**
	* Will create and return a shallow copy of an [Object]{@link external:Object} or an
	* [Array]{@link external:Array}. For _objects_, by default, properties will be scanned and
	* copied directly to the _clone_ such that they would pass the
	* [hasOwnProperty]{@link external:Object.hasOwnProperty} test. This is expensive and often not
	* required. In this case use the optional second parameter to allow a more efficient
	* [copy]{@link Object.create} to be made.
	* 
	* @param {(Object|Array)} base The [Object]{@link external:Object} or
	*                              [Array]{@link external:Array} to be cloned.
	* @param {Boolean} [quick] When cloning [objects]{@link external:Object} will use a faster
	*                          [copy]{@link Object.create} method; has no meaning when cloaning
	*                          [arrays]{@link external:Array}.
	* @returns {*} A clone of the provided _base_ if _base_ is of the correct type otherwise it
	*                will return _base_ as it was passed in.
	* @public
	*/
	enyo.clone = function (base, quick) {
		if (base) {
			
			// avoid the overhead of calling yet another internal function to do type-checking
			// just copy the array and be done with it
			if (base instanceof Array) return base.slice();
			else if (base instanceof Object) {
				return quick ? Object.create(base) : enyo.mixin({}, base);
			}
		}
		
		// we will only do this if it is not an array or native object
		return base;
	};
	
	var empty = {};
	var mixinDefaults = {
		exists: false,
		ignore: false,
		filter: null
	};

	/**
		@todo Rewrite with appropriate documentation for options parameter (typedef)
		@todo document 'quick' option
	
		Will take a variety of options to ultimately mix a set of properties
		from objects into single object. All configurations accept a boolean as
		the final parameter to indicate whether or not to ignore _truthy_/_existing_
		values on any _objects_ prior.

		If _target_ exists and is an object, it will be the base for all properties
		and the returned value. If the parameter is used but is _falsy_, a new
		object will be created and returned. If no such parameter exists, the first
		parameter must be an array of objects and a new object will be created as
		the _target_.

		The _source_ parameter may be an object or an array of objects. If no
		_target_ parameter is provided, _source_ must be an array of objects.

		The _options_ parameter allows you to set the _ignore_ and/or _exists_ flags
		such that if _ignore_ is true, it will not override any truthy values in the
		target, and if _exists_ is true, it will only use truthy values from any of
		the sources. You may optionally add a _filter_ method-option that returns a
		true or false value to indicate whether the value should be used. It receives
		parameters in this order: _property_, _source value_, _source values_,
		_target_, _options_. Note that modifying the target in the filter method can
		have unexpected results.

		Setting _options_ to true will set all options to true.
	
	* @method enyo.mixin
	* @public
	*/
	var mixin = enyo.mixin = function () {
		var ret = arguments[0],
			src = arguments[1],
			opts = arguments[2],
			val;
		
		if (!ret) ret = {};
		else if (ret instanceof Array) {
			opts = src;
			src = ret;
			ret = {};
		}
		
		if (!opts || opts === true) opts = mixinDefaults;

		if (src instanceof Array) for (var i=0, it; (it=src[i]); ++i) mixin(ret, it, opts);
		else {
			for (var key in src) {
				val = src[key];
				
				// quickly ensure the property isn't a default
				if (empty[key] !== val) {
					if (
						(!opts.exists || val) &&
						(!opts.ignore || !ret[key]) &&
						(opts.filter? opts.filter(key, val, src, ret, opts): true)
					) {
						ret[key] = val;
					}
				}
			}
		}
		
		return ret;
	};
	
	/**
	* Returns an [array]{@link external:Array} of the values of all properties in an
	* [object]{@link external:Object}.
	*
	* @param {Object} obj The [Object]{@link external:Object} to read the values from.
	* @returns {Array} An [array]{@link external:Array} with the values from the _obj_.
	* @public
	*/
	enyo.values = function (obj) {
		var ret = [];
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) ret.push(obj[key]);
		}
		return ret;
	};
	
	// ----------------------------------
	// Array Functions
	// ----------------------------------
	
	/**
	* Because our older API parameters are not consistent with other array API methods and also
	* because only [IE8 doesn't have integrated support]{@link external:polyfill} for
	* [indexOf]{@linkcode external:Array.indexOf}, we ensure it is defined (only IE8) and advise,
	* moving forward, that the built-in method be used. But to preserve our original API it will
	* simply call this method knowing it exists.
	*
	* @private
	*/
	Array.prototype.indexOf = Array.prototype.indexOf || function (el, offset) {
		var len = this.length >>> 0;
		
		offset = +offset || 0;
		
		if (Math.abs(offset) === Infinity) offset = 0;
		if (offset < 0) offset += len;
		if (offset < 0) offset = 0;
		
		for (; offset < len; ++offset) {
			if (this[offset] === el) return offset;
		}
		
		return -1;
	};
	
	/**
	* Because our older API parameters are not consistent with other array API methods and also
	* because only [IE8 doesn't have integrated support]{@link external:polyfill} for
	* [lastIndexOf]{@linkcode external:Array.lastIndexOf} we ensure it is defined (only IE8) and
	* advise, moving forward, that the built-in method be used. But to preserve our original API it
	* will simply call this method knowing it exists.
	*
	* @private
	*/
	Array.prototype.lastIndexOf = Array.prototype.lastIndexOf || function (el, offset) {
		var array = Object(this)
			, len = array.length >>> 0;
			
		if (len === 0) return -1;
		
		if (offset !== undefined) {
			offset = Number(offset);
			if (Math.abs(offset) > len) offset = len;
			if (offset === Infinity || offset === -Infinity) offset = len;
			if (offset < 0) offset += len;
		} else offset = len;
		
		for (; offset > -1; --offset) {
			if (array[offset] === el) return offset;
		}
		
		return -1;
	};
	
	/**
	* A [polyfill]{@link external:polyfill} for platforms that don't support
	* [Array.findIndex]{@link external:Array.findIndex}
	*/
	Array.prototype.findIndex = Array.prototype.findIndex || function (fn, ctx) {
		for (var i=0, len=this.length >>> 0; i<len; ++i) {
			if (fn.call(ctx, this[i], i, this)) return i;
		}
		return -1;
	};
	
	/**
	* A [polyfill]{@link external:polyfill} for platforms that don't support
	* [Array.find]{@link external:Array.find}
	*/
	Array.prototype.find = Array.prototype.find || function (fn, ctx) {
		for (var i=0, len=this.length >>> 0; i<len; ++i) {
			if (fn.call(ctx, this[i], i, this)) return this[i];
		}
	};
	
	/**
	* A [polyfill]{@link external:polyfill} for platforms that don't support
	* [Array.forEach]{@link external:Array.forEach}
	*/
	Array.prototype.forEach = Array.prototype.forEach || function (fn, ctx) {
		for (var i=0, len=this.length >>> 0; i<len; ++i) fn.call(ctx, this[i], this);
	};
	
	/**
	* A [polyfill]{@link external:polyfill} for platforms that don't support
	* [Array.map]{@link external:Array.map}
	*/
	Array.prototype.map = Array.prototype.map || function (fn, ctx) {
		var ret = [];
		for (var i=0, len=this.length >>> 0; i<len; ++i) {
			ret.push(fn.call(ctx, this[i], i, this));
		}
		return ret;
	};
	
	/**
	* A [polyfill]{@link external:polyfill} for platforms that don't support
	* [Array.filter]{@link external:Array.filter}
	*/
	Array.prototype.filter = Array.prototype.filter || function (fn, ctx) {
		var ret = [];
		for (var i=0, len=this.length >>> 0; i<len; ++i) {
			fn.call(ctx, this[i], i, this) && ret.push(this[i]);
		}
		return ret;
	};
	
	/**
	* An eyno convenience method reference to [Array.indexOf]{@link external:Array.indexOf}.
	* 
	* This also supports the legacy enyo argument order `el.indexOf(array, offset)` and can
	* differentiate between this and the standard `array.indexOf(el, offset)`.
	*
	* _When possible, you should use the native equivelant._
	* 
	* This method supports the same arguments as the native version, plus an extra argument at the
	* beginning referring to the _array_ to run this method on.
	*
	* @public
	*/
	enyo.indexOf = function (array, el, offset) {
		if (!(array instanceof Array)) return el.indexOf(array, offset);
		return array.indexOf(el, offset);
	};
	
	/**
	* An eyno convenience method reference to [Array.lastIndexOf]{@link external:Array.lastIndexOf}.
	* 
	* This also supports the legacy enyo argument order `el.lastIndexOf(array, offset)` and can
	* differentiate between this and the standard `array.lastIndexOf(el, offset)`.
	*
	* _When possible, you should use the native equivelant._
	* 
	* This method supports the same arguments as the native version, plus an extra argument at the
	* beginning referring to the _array_ to run this method on.
	*
	* @public
	*/
	enyo.lastIndexOf = function (array, el, offset) {
		if (!(array instanceof Array)) return el.lastIndexOf(array, offset);
		return array.lastIndexOf(el, offset);
	};
	
	/**
	* An eyno convenience method reference to [Array.findIndex]{@link external:Array.findIndex}.
	*
	* _When possible, you should use the native equivelant._
	* 
	* This method supports the same arguments as the native version, plus an extra argument at the
	* beginning referring to the _array_ to run this method on.
	*
	* @public
	*/
	enyo.findIndex = function (array, fn, ctx) {
		return array.findIndex(fn, ctx);
	};
	
	/**
	* An eyno convenience method reference to [Array.find]{@link external:Array.find}.
	*
	* _When possible, you should use the native equivelant._
	* 
	* This method supports the same arguments as the native version, plus an extra argument at the
	* beginning referring to the _array_ to run this method on.
	*
	* @method enyo.find
	* @public
	*/
	enyo.find = function (array, fn, ctx) {
		return array.find(fn, ctx);
	};
	
	/**
	* @alias enyo.find
	* @method enyo.where
	* @public
	*/
	enyo.where = enyo.find;
	
	/**
	* An eyno convenience method reference to [Array.forEach]{@link external:Array.forEach}.
	*
	* _When possible, you should use the native equivelant._
	* 
	* This method supports the same arguments as the native version, plus an extra argument at the
	* beginning referring to the _array_ to run this method on.
	*
	* @public
	*/
	enyo.forEach = function (array, fn, ctx) {
		return array.forEach(fn, ctx);
	};
	
	/**
	* An eyno convenience method reference to [Array.map]{@link external:Array.map}.
	*
	* _When possible, you should use the native equivelant._
	* 
	* This method supports the same arguments as the native version, plus an extra argument at the
	* beginning referring to the _array_ to run this method on.
	*
	* @public
	*/
	enyo.map = function (array, fn, ctx) {
		return array.map(fn, ctx);
	};
	
	/**
	* An eyno convenience method reference to [Array.filter]{@link external:Array.filter}.
	*
	* _When possible, you should use the native equivelant._
	* 
	* This method supports the same arguments as the native version, plus an extra argument at the
	* beginning referring to the _array_ to run this method on.
	*
	* @public
	*/
	enyo.filter = function (array, fn, ctx) {
		return array.filter(fn, ctx);
	};
	
	/**
	* When given an [array]{@link external:Array} of [objects]{@link external:Object}, `pluck` will
	* search through the _array_'s [objects]{@link external:Object}, and any
	* [object]{@link external:Object} with the a property name matching _prop_ will be compiled into
	* a new returned [array]{@link external:Array}. Each [object]{@link external:Object} in the
	* [array]{@link external:Array} which doesn't have the property will add an `undefined`
	* placeholder element to the final [array]{@link external:Array}. It will have the same length
	* as the supplied _array_.
	* 
	* @param {Array} array The [array]{@link external:Array} of [objects]{@link external:Object}
	*                      where the _prop_ will be checked for.
	* @param {String} prop A string containing the name of the property to check for.
	* @returns {Array} An [Array]{@link external:Array} of all the values of the named _property_ from
	*                     the objects in the _array_.
	* @public
	*/
	enyo.pluck = function (array, prop) {
		if (!(array instanceof Array)) {
			var tmp = array;
			array = prop;
			prop = tmp;
		}
		
		var ret = [];
		for (var i=0, len=array.length >>> 0; i<len; ++i) {
			ret.push(array[i]? array[i][prop]: undefined);
		}
		return ret;
	};
	
	/**
	* Concatenates a variable number of [arrays]{@link external:Array}, removing any duplicate
	* entries.
	* 
	* @returns {Array} The unique values from all [arrays]{@link external:Array}.
	* @public
	*/
	enyo.merge = function (/* _arrays_ */) {
		var ret = [],
			values = Array.prototype.concat.apply([], arguments);
		for (var i=0, len=values.length >>> 0; i<len; ++i) {
			if (!~ret.indexOf(values[i])) ret.push(values[i]);
		}
		return ret;
	};
	
	/**
	* Clones an existing Array, or converts an array-like object into an Array.
	* 
	* If _offset_ is non-zero, the cloning starts from that index in the source Array.
	* The clone may be appended to an existing Array by passing the existing Array as _inStartWith_.
	* 
	* Array-like objects have _length_ properties, and support square-bracket notation ([]).
	* Often, array-like objects do not support Array methods, such as _push_ or _concat_, and
	* so must be converted to Arrays before use.
	* 
	* The special _arguments_ variable is an example of an array-like object.
	*
	* @public
	*/
	enyo.cloneArray = function (array, offset, initialArray) {
		var ret = initialArray || [];
		for(var i = offset || 0, l = array.length; i<l; i++){
			ret.push(array[i]);
		}
		// Alternate smarter implementation:
		// return Array.prototype.slice.call(array, offset);
		// Array.of
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of
		return ret;
	};
	
	/**
	* @alias enyo.cloneArray
	* @method enyo.toArray
	* @public
	*/
	enyo.toArray = enyo.cloneArray;
	
	/**
	* With a given _array_, the first [strictly equal]{@link external:===} to occurance of _el_ is
	* removed. _array_ is modified directly.
	*
	* @param {Array} array The [Array]{@link external:Array} to look through.
	* @param {*} el The element to search for and remove.
	* @public
	*/
	enyo.remove = function (array, el) {
		if (!(array instanceof Array)) {
			var tmp = array;
			array = el;
			el = tmp;
		}
		
		var i = array.indexOf(el);
		if (-1 < i) array.splice(i, 1);
		return array;
	};

	/**
	* This regex pattern is used by the _enyo.isRtl_ function.
	* 
	* Arabic: \u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFE
	* Hebrew: \u0590-\u05FF\uFB1D-\uFB4F
	* 
	* @private
	*/
	var rtlPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFE\u0590-\u05FF\uFB1D-\uFB4F]/;

	/**
	* Takes content _str_ and determines whether or not it is [RTL]{@link external:RTL}.
	*
	* @param {String} str A [String]{@link external:String} to check the [RTL]{@link external:RTL}-ness of.
	* @return {Boolean} True if the _str_ should be RTL, false if not.
	* @public
	*/
	enyo.isRtl = function (str) {
		return rtlPattern.test(str);
	};
	
})(enyo, this);