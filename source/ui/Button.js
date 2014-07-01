(function (enyo, scope) {
	/**
	* _enyo.Button_ implements an [HTML button]{@link external:button}, with support for grouping 
	* using {@link enyo.Group}.
	*
	* For more information, see the documentation on
	* [Buttons](building-apps/controls/buttons.html) in the Enyo Developer Guide.
	*
	* @class enyo.Button
	* @public
	*/
	enyo.kind(
		/** @lends enyo.BaseLayout.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Button',
		
		/**
		* @private
		*/
		kind: 'enyo.ToolDecorator',

		/**
		* @private
		*/
		tag: 'button',

		/**
		*
		* @memberof enyo.Button
		* @public
		*/
		attributes: {
			/**
			 * Set to `button`, as the default is `submit`, which can cause unexpected problems when
			 * [controls]{@link enyo.Control} are used inside of a [form]{@link external:form}.
			 * 
			 * @type {String}
			 * @private
			 */
			type: 'button'
		},
		
		/**
		* @private
		*/
		published: {
			/**
			 * When `true`, the [button]{@link external:button} is shown as disabled and does not 
			 * generate tap [events]{@link external:event}.
			 * 
			 * @type {Boolean}
			 * @default false
			 * @memberof enyo.Button.prototype
			 * @public
			 */
			disabled: false
		},
		
		/**
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.disabledChanged();
			};
		}),

		/**
		* @private
		*/
		disabledChanged: function() {
			this.setAttribute('disabled', this.disabled);
		},

		/**
		* @private
		*/
		tap: function() {
			if (this.disabled) {
				// work around for platforms like Chrome on Android or Opera that send
				// mouseup to disabled form controls
				return true;
			} else {
				this.setActive(true);
			}
		}
	});
})(enyo, this);
