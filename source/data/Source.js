(function (enyo) {
	
	var kind = enyo.kind;
	
	/**
	* All of the known, instanced [sources]{@link enyo.Source}, by name.
	*
	* @name enyo.sources
	* @type {Object}
	* @readonly
	*/
	var sources = enyo.sources = {};
	
	/**
	* This is an abstract base class. A [source]{@link enyo.Source} is a communication layer used
	* by _data layer_ [kinds]{@link external:kind} to retrieve and persist data and application
	* state via its abstract API methods.
	*
	* @class enyo.Source
	* @public
	*/
	var Source = kind(
		/** @lends enyo.Source.prototype */ {
		
		/**
		* @private
		*/
		name: "enyo.Source",
		
		/**
		* @private
		*/
		kind: null,
		
		/**
		* @private
		*/
		noDefer: true,
		
		/**
		* When initialized it should be passed properties to set on itself. These properties should
		* include the name by which it will be referenced in the application.
		*
		* @param {Object} [props] The properties to set on itself.
		* @public
		*/
		constructor: function (props) {
			if (props) this.importProps(props);
			// automatic coersion of name removing prefix
			this.name || (this.name = this.kindName.replace(/^(.*)\./, ""));
			// now add to the global registry of sources
			sources[this.name] = this;
		},
		
		/**
		* Overload this method to handle retrieval of data. This method should accept an options
		* hash with additional configuration properties including a _success_ and _error_ callback
		* to handle the result.
		*
		* @virtual
		* @param {(enyo.Model|enyo.Collection)} model The [model]{@link enyo.Model} or
		*	[collection]{@link enyo.Collection} that need to be retrieved.
		* @param {Object} opts The configuration options [hash]{@link external:Object} including
		*	a _success_ and _error_ callback.
		*/
		fetch: function (model, opts) {
			//
		},
		
		/**
		* Overload this method to handle persisting data. This method should accept an options
		* hash with additional configuration properties including a _success_ and _error_ callback
		* to handle the result.
		*
		* @virtual
		* @param {(enyo.Model|enyo.Collection)} model The [model]{@link enyo.Model} or
		*	[collection]{@link enyo.Collection} that need to be persisted.
		* @param {Object} opts The configuration options [hash]{@link external:Object} including
		*	a _success_ and _error_ callback.
		*/
		commit: function (model, opts) {
			//
		},
		
		/**
		* Overload this method to handle deleting data. This method should accept an options
		* hash with additional configuration properties including a _success_ and _error_ callback
		* to handle the result. If called without parameters it will instead destroy itself and
		* be removed from [enyo.sources]{@link enyo.sources} rendering itself unavailable for
		* further operation.
		*
		* @param {(enyo.Model|enyo.Collection)} model The [model]{@link enyo.Model} or
		*	[collection]{@link enyo.Collection} that need to be deleted.
		* @param {Object} opts The configuration options [hash]{@link external:Object} including
		*	a _success_ and _error_ callback.
		*/
		destroy: function (model, opts) {
			
			// if called with no parameters we actually just breakdown the source and remove
			// it as being available
			if (!arguments.length) {
				enyo.sources[this.name] = null;
				this.name = null;
			}
		},
		
		/**
		* Overload this method to handle querying of data based on the constructor sent to it. This
		* method should accept an options hash with additional configuration properties including
		* a _success_ and _error_ callback to handle the result.
		*
		* @virtual
		* @param {Function} ctor The constructor for the [kind]{@link external:kind} of
		*	{@link enyo.Model} or {@link enyo.Collection} to be queried.
		* @param {Object} opts The configuration options [hash]{@link external:Object} including a
		*	_success_ and _error_ callback.
		*/
		find: function (ctor, opts) {
			//
		},
		
		/**
		* @private
		*/
		importProps: function (props) {
			props && enyo.mixin(this, props);
		},
		
		/**
		* @see enyo.getPath
		* @method
		* @public
		*/
		get: enyo.getPath,
		
		/**
		* @see enyo.setPath
		* @method
		* @public
		*/
		set: enyo.setPath
	});
	
	/**
	* Create an instance of a [source]{@link enyo.Source} with the given properties. These
	* properties should include a _kind_ properties with the name of the
	* [kind]{@link external:kind} of [source]{@link enyo.Source} and a _name_ for that instance.
	* This static method is also available on all [subkinds]{@link external:subkind} of
	* {@link enyo.Source}. The instance will automatically be added to the
	* [enyo.sources]{@link enyo.sources} [object]{@link external:Object} and will be referencable
	* by its _name_.
	*
	* @name enyo.Source.create
	* @static
	* @method
	* @param {Object} props The properties to pass to the constructor for the requested
	*	[kind]{@link external:kind} of [source]{@link enyo.Source}.
	* @returns {enyo.Source} An instance of the requested [kind]{@link external:kind} of
	*	{@link enyo.Source}.
	* @public
	*/
	Source.create = function (props) {
		var Ctor = (props && props.kind) || this;
		
		if (typeof Ctor == 'string') Ctor = enyo.constructorForKind(Ctor);
		
		return new Ctor(props);
	};
	
	/**
	* @static
	* @private
	*/
	Source.concat = function (ctor, props) {
		
		// force noDefer so that we can actually set this method on the constructor
		if (props) props.noDefer = true;
		
		ctor.create = Source.create;
	};
	
	/**
	* @static
	* @private
	*/
	Source.execute = function (action, model, opts) {
		var source = opts.source || model.source,
		
			// we need to be able to bind the success and error callbacks for each of the
			// sources we'll be using
			options = enyo.clone(opts, true),
			nom = source,
			msg;
		
		if (source) {
			
			// if explicitly set to true then we need to use all available sources in the
			// application
			if (source === true) {
				
				for (nom in enyo.sources) {
					source = enyo.sources[nom];
					if (source[action]) {
						
						// bind the source name to the success and error callbacks
						options.success = opts.success.bind(null, nom);
						options.error = opts.error.bind(null, nom);
						
						source[action](model, options);
					}
				}
			}
			
			// if it is an array of specific sources to use we, well, will only use those!
			else if (source instanceof Array) {
				source.forEach(function (nom) {
					var src = typeof nom == 'string' ? enyo.sources[nom] : nom;
					
					if (src && src[action]) {
						// bind the source name to the success and error callbacks
						options.success = opts.success.bind(null, src.name);
						options.error = opts.error.bind(null, src.name);
						
						src[action](model, options);
					}
				});
			}
			
			// if it is an instance of a source
			else if (source instanceof Source && source[action]) {
				
				// bind the source name to the success and error callbacks
				options.success = opts.success.bind(null, source.name);
				options.error = opts.error.bind(null, source.name);
				
				source[action](model, options);
			}
			
			// otherwise only one was specified and we attempt to use that
			else if ((source = enyo.sources[nom]) && source[action]) {
				
				// bind the source name to the success and error callbacks
				options.success = opts.success.bind(null, nom);
				options.error = opts.error.bind(null, nom);
				
				source[action](model, options);
			}
			
			// we could not resolve the requested source
			else {
				msg = 'enyo.Source.execute(): requested source(s) could not be found for ' +
					model.kindName + '.' + action + '()';
				
				enyo.warn(msg);
				
				// we need to fail the attempt and let it be handled
				opts.error(nom ? typeof nom == 'string' ? nom : nom.name : 'UNKNOWN', msg);
			}
		} else {
			msg = 'enyo.Source.execute(): no source(s) provided for ' + model.kindName + '.' +
				action + '()';
				
			enyo.warn(msg);
			
			// we need to fail the attempt and let it be handled
			opts.error(nom ? typeof nom == 'string' ? nom : nom.name : 'UNKNOWN', msg);
		}
	};
	
})(enyo);