

/*** Class: LayoutBehaviour:StickOnBothEdges
 */
(function (factory) { var nameOfClass = 'StickOnBothEdges';
	return factory(
		nameOfClass,
		generateAUniqueTokenUnder,
		window.jQuery.extend,
		window.jQuery.throttle
	);

	function generateAUniqueTokenUnder(tokenHost, prefix) {
		function __doGenerate() {
			return prefix + Date.now() + '-' + ((Math.random() * 1000000) + '').slice(0, 6);
		}

		prefix = typeof prefix === 'string' ? prefix : '';
        prefix = prefix.replace(/\-+$/, '') + '-';
		var token = __doGenerate();
		while (tokenHost[token]) {
			token = __doGenerate();
		}

		return token;
	}
})(function factory(nameOfClass, generateAUniqueTokenUnder, jQueryExtendsAnObject, jQueryThrottle) {
	'use strict';

	// private and also static properties (shared across instances)
	var logNameOfClass = '{'+nameOfClass+'} ==>',
		indentAlignsToLogNameOfClass = logNameOfClass.replace(/\S/g, ' ')
	;


	var rawConsole = window.console;
	var console = {};

	['log', 'info', 'warn', 'debug', 'trace', 'error'].forEach(function (loggingLevel) {
		var rawMethod = rawConsole[loggingLevel];
		if (typeof rawMethod === 'function') {
			console[loggingLevel] = rawMethod.bind(rawConsole, logNameOfClass);
		}
	});

	// This is an object shared by for all instances
	// whoever are constructed via the class/function defined in this closure.
	// Each and every instance has its own unique __pToken to access its own private data,
	// without knowing how to access that for other instances.
	var privatePropertiesHost = {};

	// Now, define the class/function and return it by factory function
	return function StickOnBothEdges(constructionOptions) {
		'use strict';

		// Use "thisInstance" intead of "this" is for better compression ratio of js files.
		// Should use this trig whenever the appearances of "this" is more than 5 times.
		var thisInstance = this;
		// console.log(thisInstance);

		// Public this object just for callback functions, which often defined somewhere outside this file, to utilize.
		thisInstance.console = console;

		// This is the public options object of an instance.
		thisInstance.options = {
			// The deeply nested content of the block might NOT be ready
			// at the time this controller is constructed.
			// This could be especially true when the block is an Ad.
			// So we might choose not to enable the behaviour of this controller instance.
			// Instead, we may choose to invoke:
			//	<instanceObject>.enableHangingBehaviour('My ad is ready')
			// explicitly, to enable it at proper anytime.
			shouldEnableBahviourAtBeginning: false,

			// if there are some other coupled blocks might effect the top of this block
			shouldAlwaysRenewFreeLayoutInfo: true, // everytime it enters the free layout mode

			cssClassName: {
				layoutFreeTemporary: 'js-stick-on-both-edges-layout-temporary-state',
				layoutFree: 'js-stick-on-both-edges-layout-free',
				layoutPinToWindowTop: 'js-stick-on-both-edges-layout-hang-to-window-top',
				layoutPinToParentBottom: 'js-stick-on-both-edges-layout-pin-to-lower-boundry',
			},
			intervalTimeInMSForRenewingRelativInfo: 500,
			intervalTimeInMSForUpdatingLayout: 40,
			delayTimeInMSForScrollAndResizeLinstenrThrottle: 16
		};


		// This is the public state object of an instance.
		// everything inside this object are constantly be checked and compared with that of new states,
		// Do NOT comment out any property that will be used later,
		// because we are using Object.keys() to determine what to check.
		thisInstance.state = {
			shouldEnableHanging: false, // the global swith


			// important measurements and involved switches
			blockHeight: NaN,
			contentTopToPageTopInFreeLayout: NaN,
			contentTopToRootTopInFreeLayout: 0,
			contentTopToWindowTopInHangingLayouts: 0,
			contentBottomDistanceToLowerBoundryInHangingLayouts: 15,

			shouldUseBottomOfHangingLowerBoundryRef: false,
			hangingLowerBoundryToPageTop: NaN



				// We might lose the margins caused by inner content whenver the content is pinned,
				// no matter it's pinned above or below.
				// So these values are something we need to remember and make compensation for.
				// But situation could be complicated.
				// The root block might has its own margins, as well as the block below has ITS own margins.
				// If a margin value of the inner content is greater than involved margin values from the root and the block below
				// then a compensation is needed, otherwise not.
				// I actually deprecated this value for simplify things.
			// innerContentKnownMarginTop: 0, // also used for calculating required room in y
			// innerContentKnownMarginBottom: 0 // also used for calculating required room in y
		};






		constructionOptions = constructionOptions || {};

		if (!(constructionOptions.parentPositionRefEl instanceof Node)) {
			throw new Error('Invalid parentPositionRef element.');
		}

		if (!(constructionOptions.rootEl instanceof Node)) {
			throw new Error('Invalid root element.');
		}

		if (!(constructionOptions.chiefContentEl instanceof Node)) {
			throw new Error('Invalid chiefContent element.');
		}

		thisInstance.elements = {
			root: constructionOptions.rootEl, // as the wrapper and the placeholder for the chiefContent element
			chiefContent: constructionOptions.chiefContentEl,
			parentPositionRef: constructionOptions.parentPositionRefEl,
			hangingLowerBoundryRef: null
		};





		var privateData = {
			isEnabled: false,


			// layout status marks
			isInFreeLayout: true,
			isPinnedToWindowTop: false,
			isPinnerToParentBottom: false,


			// functions
			events: {},
			boundMethods: {},


			// the queued tasks (states actually), btw, at present no more than one task is allowed
			queuedStatesForUpdatesOfLayout: [],


			// task helpers
			somethingChanged: false,
			hangingLowerBoundryToWindowTop: NaN, // save this constantly changed value simply for avoiding evalutation of it outside _evaluateHangingBoundries().
			shouldRenewFreeLayoutInfoNextTimeEnteringFreeLayout: false,


			// misc
			intervalIDForRenewingRelatedInfo: NaN,
			intervalIDForUpdatingLayout: NaN
		};

		thisInstance.__pToken = generateAUniqueTokenUnder(privatePropertiesHost, nameOfClass);
		privatePropertiesHost[thisInstance.__pToken] = privateData;




		// events
		// they are private, so must be updated via this.config method
		// privateData.events.onEnabling;
		// privateData.events.onEnabled;

		// privateData.events.onDisabling;
		// privateData.events.onDisabled;

		// privateData.events.onDestroying;
		// privateData.events.onDestroyed;

		// privateData.events.onUpdatingLayout; // not implemented yet
		// privateData.events.onUpdatedLayout; // not implemented yet

		// privateData.events.onReturningToFreeLayout;
		// privateData.events.onReturnedToFreeLayout;

		// privateData.events.onIntervalBegin;
		// privateData.events.onIntervalEnd;



		// public methods
		thisInstance.config = config;

		thisInstance.isEnabled = isEnabled;
		thisInstance.currentLayout = currentLayout;
		thisInstance.currentLayoutIs = currentLayoutIs;

		thisInstance.enableOrDisableHangingBehaviour = enableOrDisableHangingBehaviour;
		thisInstance.enableHangingBehaviour = enableHangingBehaviour;
		thisInstance.disableHangingBehaviour = disableHangingBehaviour;

		thisInstance.destroy = destroy;

		thisInstance.renewAllRelatedInfoAndThenUpdate = renewAllRelatedInfoAndThenUpdate;
		thisInstance.renewAllRelatedInfo = renewAllRelatedInfo;
		thisInstance.renewContentTopToPageTopInFreeLayout = renewContentTopToPageTopInFreeLayout;
		thisInstance.renewContentHeight = renewContentHeight;
		thisInstance.renewContentTopToRootTopInFreeLayout = renewContentTopToRootTopInFreeLayout;
		thisInstance.renewContentTopToWindowTopInHangingLayouts = renewContentTopToWindowTopInHangingLayouts;
		thisInstance.renewHangingLowerBoundryValue = renewHangingLowerBoundryValue;
		thisInstance.renewHangingLowerBoundryUsedBorder = renewHangingLowerBoundryUsedBorder;


		// a very traditional way to safely update related info
		thisInstance.startIntervalForRenewingRelatedInfo = startIntervalForRenewingRelatedInfo;
		thisInstance.clearIntervalForRenewingRelatedInfo = clearIntervalForRenewingRelatedInfo;
		thisInstance.startIntervalForUpdateLayout = startIntervalForUpdateLayout;
		thisInstance.clearIntervalForUpdateLayout = clearIntervalForUpdateLayout;

		thisInstance.requestAnUpdateOfLayout = requestAnUpdateOfLayout;
		thisInstance.updateLayout = updateLayout;




		// init
		_init(thisInstance, constructionOptions);
		// console.info('Initialized!', thisInstance);
	};





	function _init(thisInstance, initOptions) {
		thisInstance.config(initOptions);



		_createBoundFunctions(thisInstance);



		// Store initial states
		renewAllRelatedInfo.call(thisInstance, initOptions, true);

		if (typeof initOptions.shouldEnableHanging === 'boolean') {
			enableOrDisableHangingBehaviour.call(
				initOptions.shouldEnableHanging,
				initOptions.reasonForEnablingOrDisabling || initOptions.reason || 'User desired on initialization.'
			);
		} else if (thisInstance.options.shouldEnableBahviourAtBeginning) {
			enableHangingBehaviour.call(thisInstance, 'Forced to enabled on initialization.');
		}

		updateLayout.call(thisInstance);




		// Third, also update layout whenever user is scrolling or resizing window
		var boundMethods = privatePropertiesHost[thisInstance.__pToken].boundMethods;
		window.addEventListener('scroll', boundMethods.listenToWindowOnScrollEvent);
		// window.addEventListener('resize', boundMethods.listenToWindowOnResizeEvent);
	}
	
	function _createBoundFunctions(thisInstance) {
		var boundMethods = privatePropertiesHost[thisInstance.__pToken].boundMethods;

		boundMethods.doIntervalForRenewingRelatedInfo =
			_doIntervalForRenewingRelatedInfo.bind(null, thisInstance);

		boundMethods.doIntervalForUpdateLayout =
			_doIntervalForUpdateLayout.bind(null, thisInstance);



		// Even without a task in queue, we still need to update layout constantly.
		// For example when user is scrolliing the page, nothing about the important measurements changed
		// but obviously the ___doUpdateLayout should be invoked still.
		boundMethods.doUpdateLayout = (function (/*event*/) {
			___doUpdateLayout(thisInstance);
		}).bind(thisInstance);




		var throttleWrappedAction = jQueryThrottle(
			thisInstance.options.delayTimeInMSForScrollAndResizeLinstenrThrottle,
			boundMethods.doUpdateLayout
		);

		boundMethods.listenToWindowOnScrollEvent = throttleWrappedAction;
		boundMethods.listenToWindowOnResizeEvent = throttleWrappedAction;
	}

	function isEnabled() {
		return privatePropertiesHost[this.__pToken].isEnabled;
	}

	function currentLayout() {
		var privateState = privatePropertiesHost[this.__pToken];

		if (privateState.isInFreeLayout) return 'free layout';
		if (privateState.isPinnedToWindowTop) return 'pinned to top';
		if (privateState.isPinnerToParentBottom) return 'following lower boundry';

		throw RangeError(logNameOfClass, 'Fatal: None of the three states are active.');
	}

	function currentLayoutIs(layoutNameToCheck) {
		var privateState = privatePropertiesHost[this.__pToken];

		if (!layoutNameToCheck || typeof layoutNameToCheck !== 'string') {
			return false;
		}


		var normalizedString = layoutNameToCheck
			.toLowerCase()
			.replace(/\s*[\s\-]\s*/g, '-')
			.replace(/^\s+/, '')
			.replace(/\s+$/, '')
			;

		switch (normalizedString) {
		case 'free':
		case 'freelayout':
		case 'default':
			return privateState.isInFreeLayout;

		case 'top':
		case 'hanging':
		case 'pinned-to-top':
			return privateState.isPinnedToWindowTop;

		case 'following':
		case 'bottom':
		case 'following-lower-boundry':
		case 'pinned-to-bottom':
			return privateState.isPinnerToParentBottom;
		}

		return false;
	}

	function config(options) {
		var thisInstance = this,
			moduleOptions = thisInstance.options,
			elements = thisInstance.elements,
			pName1,
			pName2,
			pValue
			;


		pName1 = 'hangingLowerBoundryRefEl'; // property name in options
		pName2 = 'hangingLowerBoundryRef'; // property name in this.elements
		if (options.hasOwnProperty(pName1)) {
			pValue = options[pName1];

			if (!(elements[pName2] instanceof Node)) {
				// if element Never set yet

				if (!(pValue instanceof Node)) {
					elements[pName2] = elements.parentPositionRef;
				} else {
					elements[pName2] = pValue;
				}

			} else {
				// if element already exists

				if (pValue instanceof Node) {
					elements[pName2] = pValue;
				}

			}
		}



		pName1 = 'intervalTimeInMSForRenewingRelativInfo';
		if (options.hasOwnProperty(pName1)) {
			pValue = parseInt(options[pName1]);
			if (!isNaN(pValue) && pValue > 20) { // acceptable threshold
				moduleOptions[pName1] = pValue;
			}
		}



		pName1 = 'intervalTimeInMSForUpdatingLayout';
		if (options.hasOwnProperty(pName1)) {
			pValue = parseInt(options[pName1]);
			if (!isNaN(pValue) && pValue > 20) { // acceptable threshold
				moduleOptions[pName1] = pValue;
			}
		}



		_configAnEvent(thisInstance, 'onEnabling', options);
		_configAnEvent(thisInstance, 'onEnabled', options);

		_configAnEvent(thisInstance, 'onDisabling', options);
		_configAnEvent(thisInstance, 'onDisabled', options);

		_configAnEvent(thisInstance, 'onDestroying', options);
		_configAnEvent(thisInstance, 'onDestroyed', options);

		_configAnEvent(thisInstance, 'onReturningToFreeLayout', options);
		_configAnEvent(thisInstance, 'onReturnedToFreeLayout', options);

		// _configAnEvent(thisInstance, 'onUpdatingLayout', options);
		// _configAnEvent(thisInstance, 'onUpdatedLayout', options);

		_configAnEvent(thisInstance, 'onIntervalBegin', options);
		_configAnEvent(thisInstance, 'onIntervalEnd', options);
	}

	function _configAnEvent(thisInstance, eventName, options) {
		var eventsHost = privatePropertiesHost[thisInstance.__pToken].events,
			input = options[eventName]
		;

		if (typeof input === 'function' || input === undefined) {
			eventsHost[eventName] = input;
		}
	}

	function _dispatchAnEvent(thisInstance, eventName, shouldWarnIfNotHandled, warningMsg) {
		var eventsHost = privatePropertiesHost[thisInstance.__pToken].events;

		if (typeof eventsHost[eventName] !== 'function') {
			if (shouldWarnIfNotHandled) {
				warningMsg = warningMsg || 'The "'+eventName+'" is NOT handled.';
				console.warn(warningMsg);
			}

			return;
		} else {
			return eventsHost[eventName].call(thisInstance, thisInstance.state);
		}
	}

	function destroy(reason) {
		disableHangingBehaviour.call(this, reason, true);
	}

	function _destroyOneInstanceAfterLayoutRestoredToFree(thisInstance) {
		var elements = thisInstance.elements,
			boundMethods = privatePropertiesHost[thisInstance.__pToken].boundMethods
		;

		window.removeEventListener('scroll', boundMethods.listenToWindowOnScrollEvent);
		window.removeEventListener('resize', boundMethods.listenToWindowOnResizeEvent);

		elements.root.style.height = '';
		elements.chiefContent.style.top = '';
		______soloCssClassTo(thisInstance, null);

		_dispatchAnEvent(thisInstance, 'onDestroyed', true);
	}





	function enableOrDisableHangingBehaviour(shouldEnableHanging, reason, shouldDestroyAfterDisabled) {
		if (typeof shouldEnableHanging === 'undefined') return;
		shouldEnableHanging = !!shouldEnableHanging;


		var shouldCancel = _onEnablingOrDisablingHangingBehviour(this,
			shouldEnableHanging,
			shouldDestroyAfterDisabled
		);

		if (shouldCancel) {
			var logString1 = shouldEnableHanging ? 'Enabling' : shouldDestroyAfterDisabled ? 'DESTORYING' : 'DISABLING';
			console.warn(logString1, 'request was cancelled.');
			return;
		}



		var newState = {};
		newState.shouldEnableHanging = !!shouldEnableHanging;
		
		// must contains a reason property,
		// for overwriting that of previously queued states.
		newState.reason = (reason && typeof reason === 'string') ? reason : '<unkown>';

		if (!shouldEnableHanging && shouldDestroyAfterDisabled) {
			newState.isForcedToRenew = true;
			newState.shouldDestroyAfterDisabled = true;
		}

		requestAnUpdateOfLayout.call(this, newState);


		updateLayout.call(this);
	}

	function enableHangingBehaviour(reasonForEnabling) {
		enableOrDisableHangingBehaviour.call(this, true, reasonForEnabling);
	}

	function disableHangingBehaviour(reasonForDisabling, shouldDestroyAfterDisabled) {
		enableOrDisableHangingBehaviour.call(this, false, reasonForDisabling, shouldDestroyAfterDisabled);
	}

	function _onEnablingOrDisablingHangingBehviour(thisInstance, willEnable, shouldDestroyAfterDisabled) {
		// return value: true means shouldCancel <boolean>
		// Note that event handlers also return true means shouldCancel <boolean>


		if (willEnable) {
			return _dispatchAnEvent(thisInstance, 'onEnabling');
		}


		var shouldCancelDisabling = _dispatchAnEvent(thisInstance, 'onDisabling');

		if (shouldCancelDisabling) {
			if (!shouldDestroyAfterDisabled) {
				return shouldCancelDisabling;
			} else {
				console.warn('Destroying request will be cancelled by onDisabling handler.');
			}
		}


		return _dispatchAnEvent(thisInstance, 'onDestroying');
	}

	function _onEnabledOrDisabledHangingBehviour(thisInstance, isNowEnabled) {
		var publicState = thisInstance.state,
			privateData = privatePropertiesHost[thisInstance.__pToken]
		;

		// console.log('\n===== _onEnabledOrDisabledHangingBehviour', isNowEnabled, '\n=====');
		privateData.isEnabled = isNowEnabled;

		if (isNowEnabled) {
			delete publicState.shouldDestroyAfterDisabled;

			// The invocation below might cause an infinite loop!
			// Enhancements are needed!
			_dispatchAnEvent(thisInstance, 'onEnabled');
		} else {
			_dispatchAnEvent(thisInstance, 'onDisabled');

			thisInstance.clearIntervalForRenewingRelatedInfo();
			thisInstance.clearIntervalForUpdateLayout();

			if (publicState.shouldDestroyAfterDisabled) {
				_destroyOneInstanceAfterLayoutRestoredToFree(thisInstance);
			}
		}
	}





	function startIntervalForRenewingRelatedInfo() {
		_startOrClearIntervalForRenewingRelatedInfo(this, true);
	}

	function clearIntervalForRenewingRelatedInfo() {
		_startOrClearIntervalForRenewingRelatedInfo(this, false);
	}

	function _startOrClearIntervalForRenewingRelatedInfo(thisInstance, shouldStart) {
		var privateData = privatePropertiesHost[thisInstance.__pToken],
			logString1 = shouldStart ? 'Starting' : 'STOPPING',
			logString2 = 'interval for renewing related info.',
			// logString3 =  '\n\t module rootEl:',
			// rootEl = thisInstance.elements.root,
			pNameForIndex = 'intervalIDForRenewingRelatedInfo',
			currentIndex = privateData[pNameForIndex],
			hasActiveInterval = !isNaN(currentIndex)
			;

		if (shouldStart && !hasActiveInterval) {
			console.info(logString1, logString2
				// , logString3, rootEl
			);
			privateData[pNameForIndex] = setInterval(
				privateData.boundMethods.doIntervalForRenewingRelatedInfo,
				thisInstance.options.intervalTimeInMSForRenewingRelativInfo
			);
		} else if (!shouldStart && hasActiveInterval) {
			console.warn(logString1, logString2
				// , logString3, rootEl
			);
			clearInterval(currentIndex);
			privateData[pNameForIndex] = NaN;			
		}
	}

	function _doIntervalForRenewingRelatedInfo(thisInstance) {
		var shouldCancel = _dispatchAnEvent(thisInstance, 'onIntervalBegin');

		if (!shouldCancel) {
			renewContentHeight.call(thisInstance, true);
			renewHangingLowerBoundryValue.call(thisInstance, true);
			renewContentTopToRootTopInFreeLayout.call(thisInstance, true);
			renewContentTopToPageTopInFreeLayout.call(thisInstance, true);
		}

		// even if this interval is cancelled, still call the onIntervalEnd event
		_dispatchAnEvent(thisInstance, 'onIntervalEnd');
	}




	function startIntervalForUpdateLayout() {
		_startOrClearIntervalForUpdateLayout(this, true);
	}
	function clearIntervalForUpdateLayout() {
		_startOrClearIntervalForUpdateLayout(this, false);
	}
	function _startOrClearIntervalForUpdateLayout(thisInstance, shouldStart) {
		var privateData = privatePropertiesHost[thisInstance.__pToken],
			logString1 = shouldStart ? 'Starting' : 'STOPPING',
			logString2 = 'interval for updating layout.',
			// logString3 = indentAlignsToLogNameOfClass.slice(0, -15) + ' module rootEl:',
			// rootEl = this.elements.root,
			pNameForIndex = 'intervalIDForUpdatingLayout',
			currentIndex = privateData[pNameForIndex],
			hasActiveInterval = !isNaN(currentIndex)
			;

		if (shouldStart && !hasActiveInterval) {
			console.info(logString1, logString2
				// , '\n' + logString3, rootEl
			);
			privateData[pNameForIndex] = setInterval(
				privateData.boundMethods.doIntervalForUpdateLayout,
				thisInstance.options.intervalTimeInMSForUpdatingLayout
			);
		} else if (!shouldStart && hasActiveInterval) {
			console.warn(logString1, logString2
				// , '\n ' + logString3, rootEl
			);
			clearInterval(currentIndex);
			privateData[pNameForIndex] = NaN;			
		}
	}
	function _doIntervalForUpdateLayout(thisInstance) {
		updateLayout.call(thisInstance);
	}




	// renew all state but NOT the global swith, aka the this.state.shouldEnableHanging
	function renewAllRelatedInfoAndThenUpdate(options) {
		renewAllRelatedInfo.call(this, options, false);
		updateLayout.call(this);
	}

	// renew all state but NOT the global swith, aka the this.state.shouldEnableHanging
	function renewAllRelatedInfo(options, isForcedToRenew) {
		var didntRequestAnUpdateForHangingLowerBoundryUsedBorder = true;



		// actions that relies on arguments
		if (typeof options === 'object' && options) {
			renewContentTopToWindowTopInHangingLayouts.call(this,
				options.contentTopToWindowTopInHangingLayouts,
				isForcedToRenew
			);

			renewContentBottomDistanceToLowerBoundry.call(this,
				options.contentBottomDistanceToLowerBoundryInHangingLayouts,
				isForcedToRenew
			);


			didntRequestAnUpdateForHangingLowerBoundryUsedBorder = renewHangingLowerBoundryUsedBorder.call(this,
				options.shouldUseBottomOfHangingLowerBoundryRef,
				isForcedToRenew
			);
		}



		// actions that need no arguments

		if (didntRequestAnUpdateForHangingLowerBoundryUsedBorder) {
			renewHangingLowerBoundryValue.call(this, isForcedToRenew);
		} else {
			// renewHangingLowerBoundryUsedBorder will implicitly call renewHangingLowerBoundryValue
		}

		renewContentHeight.call(this, isForcedToRenew);
		renewContentTopToRootTopInFreeLayout.call(this, isForcedToRenew);
		renewContentTopToPageTopInFreeLayout.call(this, isForcedToRenew);
	}

	function renewContentHeight(isForcedToRenew) {
		var newState = {
			blockHeight: this.elements.chiefContent.offsetHeight
		};

		if (isForcedToRenew) newState.isForcedToUpdate = true;

		requestAnUpdateOfLayout.call(this, newState);
	}

	function renewContentTopToRootTopInFreeLayout(isForcedToRenew) {
		var newState = {},
			pName = 'contentTopToRootTopInFreeLayout'
		;

		if (isForcedToRenew) newState.isForcedToUpdate = true;

		newState[pName] = this.elements.chiefContent.offsetTop;

		requestAnUpdateOfLayout.call(this, newState);
	}

	function renewContentTopToWindowTopInHangingLayouts(newExtraSpace, isForcedToRenew) {
		var newState = {};

		if (isForcedToRenew) newState.isForcedToUpdate = true;

		newExtraSpace = parseFloat(newExtraSpace);
		if (!isNaN(newExtraSpace)) {
			newState.contentTopToWindowTopInHangingLayouts = newExtraSpace;
		}

		requestAnUpdateOfLayout.call(this, newState);
	}

	function renewContentBottomDistanceToLowerBoundry(newExtraSpace, isForcedToRenew) {
		var newState = {};

		if (isForcedToRenew) newState.isForcedToUpdate = true;

		newExtraSpace = parseFloat(newExtraSpace);
		if (!isNaN(newExtraSpace)) {
			newState.contentBottomDistanceToLowerBoundryInHangingLayouts = newExtraSpace;
		}

		requestAnUpdateOfLayout.call(this, newState);
	}


	function renewContentTopToPageTopInFreeLayout(isForcedToRenewWithoutWaitingForLayoutToSwitch) {
		var thisInstance = this,
			privateData = privatePropertiesHost[thisInstance.__pToken],
			shouldDoRenew = true,
			functionForSwitchingToCorrectLayout,
			forcedImmediateSwitchingWasSkipped = true,
			pNameNextTimeRenewFreeLayout = 'shouldRenewFreeLayoutInfoNextTimeEnteringFreeLayout'
			;

		if (!privateData.isInFreeLayout) {
			if (isForcedToRenewWithoutWaitingForLayoutToSwitch) {
				privateData[pNameNextTimeRenewFreeLayout] = false;
				functionForSwitchingToCorrectLayout = thisInstance.state.methodForSwitchingToCurrentLayout;
				forcedImmediateSwitchingWasSkipped = ____switchLayoutToFree(
					thisInstance,
					isForcedToRenewWithoutWaitingForLayoutToSwitch,
					true
				);
			} else {
				// console.debug('Action holded for a later time.');
				shouldDoRenew = false;
				privateData[pNameNextTimeRenewFreeLayout] = true;
			}
		}

		if (shouldDoRenew) {
			_doRenewContentTopToPageTopInFreeLayout(thisInstance, isForcedToRenewWithoutWaitingForLayoutToSwitch);
		}

		if (
			!forcedImmediateSwitchingWasSkipped
			&& typeof functionForSwitchingToCorrectLayout === 'function'
		) {
			// console.debug('Restore layout after switching to free layout temporarily.');
			functionForSwitchingToCorrectLayout(thisInstance);
		}
	}

	function _doRenewContentTopToPageTopInFreeLayout(thisInstance, isForcedToRenew) {
		var contentClientRect = thisInstance.elements.chiefContent.getBoundingClientRect();

		if (contentClientRect.width === 0 && contentClientRect.height === 0) {
			console.warn(
				'\n\t Cannot evaluate chiefContentEl\'s "boundingClientRect"!',
				'\n\t The chief content elment might not be visible at the moment.'
			);
			return;
		}


		var newState = {};

		if (isForcedToRenew) newState.isForcedToUpdate = true;

		newState.contentTopToPageTopInFreeLayout = contentClientRect.top + window.scrollY;
		// console.log('*** newState: content top to page:', newState.contentTopToPageTopInFreeLayout, '***');

		requestAnUpdateOfLayout.call(thisInstance, newState);
	}

	function renewHangingLowerBoundryUsedBorder(shouldUseBottomOfHangingLowerBoundryRef, isForcedToRenew) {
		var thisInstance = this,
			elements = thisInstance.elements
		;

		if (elements.parentPositionRef === elements.hangingLowerBoundryRef ||
			shouldUseBottomOfHangingLowerBoundryRef === null ||
			shouldUseBottomOfHangingLowerBoundryRef === undefined
		) {
			// Should always use 'bottom'
			return true;
		}

		// update public state directly here,
		// to ensure renewHangingLowerBoundryValue execute correctly
		// but need more thinking
		thisInstance.state.shouldUseBottomOfHangingLowerBoundryRef = !!shouldUseBottomOfHangingLowerBoundryRef;

		var newState = {};

		if (isForcedToRenew) newState.isForcedToUpdate = true;

		renewHangingLowerBoundryValue.call(this, isForcedToRenew);

		return false;
	}

	function renewHangingLowerBoundryValue(isForcedToRenew) {
		var newState = _evaluateHangingBoundries(this);

		if (isForcedToRenew) newState.isForcedToUpdate = true;

		requestAnUpdateOfLayout.call(this, newState);
	}

	function _evaluateHangingBoundries(thisInstance) {
		// this function not only updates some state values,
		// but also returns a newState object for other function to utilize

		var publicState = thisInstance.state,
			pName = 'hangingLowerBoundryToPageTop',
			refNewYToWindowTop = NaN,
			refNewYToPageTop = NaN
			;

		var refElementClientRect = thisInstance.elements.hangingLowerBoundryRef.getBoundingClientRect();
		if (refElementClientRect.width === 0 && refElementClientRect.height === 0) {
			console.warn('Reference element for deciding hanging lower boundry is invisible at this moment.');
		} else {
			refNewYToWindowTop = refElementClientRect[publicState.shouldUseBottomOfHangingLowerBoundryRef ? 'bottom' : 'top'];
			refNewYToPageTop = refNewYToWindowTop + window.scrollY;
		}


		// values below might be NaN, as long as the refElement is not available any more or is hidden
		privatePropertiesHost[thisInstance.__pToken].hangingLowerBoundryToWindowTop = refNewYToWindowTop;
		publicState[pName] = refNewYToPageTop;


		var newState = {};
		newState[pName] = refNewYToPageTop;
		return newState;
	}



	function requestAnUpdateOfLayout(newStateOrFunctionToGenerateNewStateOrABoolean) {
		var thisInstance = this,
			statesQueue = privatePropertiesHost[thisInstance.__pToken].queuedStatesForUpdatesOfLayout
		;


		// At presnet, no more than one state is allowed in queue.
		// So whenever there exists one item in the array,
		// we simply use it, instead of create a new one.
		var shouldCreateNewStateObject = !statesQueue[statesQueue.length-1];
		if (shouldCreateNewStateObject) {
			statesQueue.push({});
		}


		var stateToUpdate = statesQueue[statesQueue.length-1];

		if (typeof newStateOrFunctionToGenerateNewStateOrABoolean === 'function') {
			newStateOrFunctionToGenerateNewStateOrABoolean.call(thisInstance, stateToUpdate);
		} else if (
			typeof newStateOrFunctionToGenerateNewStateOrABoolean === 'object' &&
			!Array.isArray(newStateOrFunctionToGenerateNewStateOrABoolean)
		) {
			// console.debug('merging states in the queue...');
			jQueryExtendsAnObject(stateToUpdate, newStateOrFunctionToGenerateNewStateOrABoolean);
		} else {
			stateToUpdate.isForcedToUpdate = stateToUpdate.isForcedToUpdate ||
				(typeof newStateOrFunctionToGenerateNewStateOrABoolean === 'undefined') ||
				!!newStateOrFunctionToGenerateNewStateOrABoolean
			;
		}
	}

	// function _processAllQueuedStatesForUpdatesOfLayout(thisInstance) {
	// 	while (privatePropertiesHost[this.__pToken].queuedStatesForUpdatesOfLayout.length > 0) {
	// 		__processOneQueuedStateForAnUpdateOfLayoutInQueue(thisInstance);
	// 	}
	// 	___updateAllDerivedStatesAccordingToNewState();
	// }

	function __processOneQueuedStateForAnUpdateOfLayoutInQueue(thisInstance) {
		var privateData = privatePropertiesHost[thisInstance.__pToken];

		var newState = privateData.queuedStatesForUpdatesOfLayout.shift();

		___detectChangesBetweenStates(thisInstance, thisInstance.state, newState);


		// console.debug(
		// 	'******** newState to update ********',
		// 	'\n'+'updateLayout();', 
		// 	'\n'+JSON.stringify(newState),
		// 	'\n\n\n'
		// );

		return newState;
	}




	function ___mergeNewStateIntoModuleCurrentState(thisInstance, newState) {
		jQueryExtendsAnObject(thisInstance.state, newState);
	}

	function ___detectChangesBetweenStates(thisInstance, state1, state2) {
		____detectChangesOnAllPropertiesAndRemoveThoseWontChangeFromState2(thisInstance, state1, state2);
		____processState2AccordingToPreservedProperties(thisInstance, state2);
	}

	function ____detectChangesOnAllPropertiesAndRemoveThoseWontChangeFromState2(thisInstance, state1, state2) {
		Object.keys(thisInstance.state).forEach(function (pName) {
			var thisPropertyWillChange = _____detectChangeForAProperty(pName, state1, state2);
			if (thisPropertyWillChange) {
				privatePropertiesHost[thisInstance.__pToken].somethingChanged = true;
			} else {
				delete state2[pName];
			}
		});
	}

	function _____detectChangeForAProperty(pName, object1, object2) {
		var changed = false,
			v1 = object1[pName],
			v2 = object2[pName]
			;

		if (v2 === undefined || v2 === null) {
			return false;
		} else if (v1 === undefined || v1 === null) {
			changed = true;
		} else if (v1 !== v2) {
			changed = !(isNaN(v1) && isNaN(v2));
		}

		// if (changed) {
		// 	console.debug(
		// 		'changed "'+pName+'"\n',
		// 		indentAlignsToLogNameOfClass+'from', v1, 'into', v2
		// 	);
		// }

		return changed;
	}

	function ____processState2AccordingToPreservedProperties(thisInstance, state2) {
		// At present, only the "reason" property
		// which might be introduced by enabling/disabling hanging behaviour
		// should be processed here



		if (!privatePropertiesHost[thisInstance.__pToken].somethingChanged) return;



		var pName1, logString1, logString2, logString3
			// , rootEl = thisInstance.elements.root
		;


		if (typeof state2.shouldEnableHanging === 'boolean') {
			pName1 = 'reason';

			var willEnableHanging = state2.shouldEnableHanging;

			logString1 = willEnableHanging ? 'Enabling' : state2.shouldDestroyAfterDisabled ? 'DESTORYING' : 'DISABLING';
			logString2 = 'behaviour...\n';
			logString3 = state2[pName1]
				// + '\n module rootEl:'
			;

			logString3 = indentAlignsToLogNameOfClass.slice('Reason: '.length)
				+ 'Reason: '
				+ logString3.replace(/\n/g, '\n '+indentAlignsToLogNameOfClass);

			if (willEnableHanging) {
				console.info(logString1, logString2, logString3
					// , rootEl
				);
			} else {
				// In Google Chrome, "console.warn" now has a prefixing triangle to show calling stacks,
				// so we nee one more space.
				console.warn(logString1, logString2, ' ', logString3
					// , rootEl
				);
			}
		}
	}




	// You can also name this function as something like "flushQueuedTasks".
	function updateLayout() {
		var thisInstance = this,
			privateData = privatePropertiesHost[thisInstance.__pToken],
			publicState = thisInstance.state,
			statesQueue = privateData.queuedStatesForUpdatesOfLayout
			;


		// if there are zero tasks in queue, simply do nothing
		if (statesQueue.length < 1) {
			// console.debug('No queued states at all. Nothing to do.');
			return;
		}



		// There are two possible policies at least.
		// whenever get a chance to run queued tasks, run them all;
		// or, whenever get a chance to run a task, run the oldest one.
		// BUT,
		// since at present I allow no more than one task,
		// the two policies mentioned above turn to be the same finally.

		// var newState = _processAllQueuedStatesForUpdatesOfLayout(thisInstance); // policy 1
		var newState = __processOneQueuedStateForAnUpdateOfLayoutInQueue(thisInstance); // policy 2




		var isForcedToUpdate = newState.isForcedToUpdate;
		delete newState.isForcedToUpdate;
		// console.log('updateLayout(): changes?', privateData.somethingChanged, '\t forced to?', isForcedToUpdate);


		if (privateData.somethingChanged || isForcedToUpdate) {
			// Should always merge, because extra properties like "reason" should be carried
			___mergeNewStateIntoModuleCurrentState(thisInstance, newState);

			// Now, do the work
			___doUpdateLayout(thisInstance, isForcedToUpdate);
		}



		if (typeof newState.shouldEnableHanging === 'boolean') {
			// reason should be available for onEnabled/onDisabled events
			_onEnabledOrDisabledHangingBehviour(thisInstance, newState.shouldEnableHanging);

			// now delete the old reason
			delete publicState.reason;
		}
	}

	function ___doUpdateLayout(thisInstance, isForcedToUpdate) {
		var elements = thisInstance.elements,
			privateData = privatePropertiesHost[thisInstance.__pToken],
			publicState = thisInstance.state
			;

		_evaluateHangingBoundries(thisInstance);


		var hangingTopOffset = publicState.contentTopToWindowTopInHangingLayouts;
		var topBoundryToPageTop = window.scrollY + hangingTopOffset;
		var boundriesDistance = publicState.hangingLowerBoundryToPageTop - publicState.contentTopToPageTopInFreeLayout;
		var requiredRoomInY = publicState.blockHeight + publicState.contentBottomDistanceToLowerBoundryInHangingLayouts;
		var availableRoomInY = privateData.hangingLowerBoundryToWindowTop - hangingTopOffset;


		// Might be compensation to some margins but not implemented yet
		var blockRootHeightWhenPinned = publicState.blockHeight;


		var thereIsNoEnoughRoomForThisBlockToHang =
			window.innerHeight < requiredRoomInY ||
			(
				// NaN means lower boundry doesn't available at all,
				// so there is always enough room
				!isNaN(boundriesDistance) &&

				boundriesDistance < requiredRoomInY
			)
		;



		// console.debug(
		// 	'\n\t someting changed?', privatePropertiesHost[thisInstance.__pToken].somethingChanged,

		// 	'\n to pin to top:',
		// 	'\n\t window scroll y:', topBoundryToPageTop,
		// 	'\n\t free layout top:', publicState.contentTopToPageTopInFreeLayout,
		// 	'\n\t window scroll y <= free layout top?', topBoundryToPageTop <= publicState.contentTopToPageTopInFreeLayout,

		// 	'\n to pin to bottom:',
		// 	'\n\t lower boundry y:', privateData.hangingLowerBoundryToWindowTop,
		// 	'\n\t available y:', availableRoomInY,
		// 	'\n\t required room y:', requiredRoomInY,
		// 	'\n\t available y <= required room y?', availableRoomInY < requiredRoomInY
		// );

		if (!publicState.shouldEnableHanging ||
			thereIsNoEnoughRoomForThisBlockToHang ||
			topBoundryToPageTop <= publicState.contentTopToPageTopInFreeLayout
		) {
			____switchLayoutToFree(thisInstance, isForcedToUpdate);
		} else if (availableRoomInY <= requiredRoomInY) {
			____switchLayoutToContentPinningAboveLowerBoundry(
				thisInstance,
				isForcedToUpdate,
				blockRootHeightWhenPinned,
				boundriesDistance - requiredRoomInY + elements.root.clientTop + publicState.contentTopToRootTopInFreeLayout
			);
		} else {
			____switchLayoutToContentHangingToWindowTop(
				thisInstance,
				isForcedToUpdate,
				blockRootHeightWhenPinned,
				publicState.contentTopToWindowTopInHangingLayouts
			);
		}


		privateData.somethingChanged = false;
		delete publicState.methodForSwitchingToCurrentLayout;
	}

	function ____switchLayoutToFree(thisInstance, isForcedToUpdate, isForcedByAForcedRenew) {
		var privateData = privatePropertiesHost[thisInstance.__pToken],
			layoutBeforeSwitchingWasExactlyFreeLayout = privateData.isInFreeLayout
		;

		var switchingWasSkipped =
		_____commonActionsWhenSwitchingLayout(thisInstance, {
			methodForSwitchingToCurrentLayout: ____switchLayoutToFree, // of cause, should be itself
			isForcedToUpdate: isForcedToUpdate,
			pNameOfLayoutMark: 'isInFreeLayout',
			pNameOfCssClass: isForcedByAForcedRenew ? 'layoutFreeTemporary' : 'layoutFree',
			rootElHeight: '', // thisInstance.state.blockHeight + 'px'
			contentElTop: ''

			// , logStringWhenActuallySwitching: '*** Swithing content layout back to free layout...'
			// , shouldDebug: true
		});



		if (!switchingWasSkipped) {
			// if (isForcedByAForcedRenew) {
			// 	console.debug('Forced to switch to free layout temporarily.');				
			// }

			var shouldAlwaysRenewFreeLayoutInfo = thisInstance.options.shouldAlwaysRenewFreeLayoutInfo,
				pNameNextTimeRenewFreeLayout = 'shouldRenewFreeLayoutInfoNextTimeEnteringFreeLayout'
			;

			if (
				(shouldAlwaysRenewFreeLayoutInfo || privateData[pNameNextTimeRenewFreeLayout])
				&& !layoutBeforeSwitchingWasExactlyFreeLayout
				// && !isForcedByAForcedRenew
			) {
				// For the invocation below,
				// as we can see the value of the "forcedToDoSo" argument is not <true>,
				// so basically if there are no changes happened at all,
				// the ___doUpdateLayout() will not be called,
				// thus the infinite looping invocation will not occur.
				
				// Note that if this function is invoked for switching layout temporarily,
				// this means the invokation was taken by the renewAllRelatedInfoAndThenUpdate itself
				// thus we should avoid infinite looping.

				// console.debug('Returned to free layout. An opportunity to renew all related info.');
				renewAllRelatedInfoAndThenUpdate.call(thisInstance);
			}

			privateData[pNameNextTimeRenewFreeLayout] = false;
		}


		return switchingWasSkipped;
	}

	function ____switchLayoutToContentHangingToWindowTop(thisInstance, isForcedToUpdate, blockRootHeightWhenPinned, blockContentTopWhenPinned) {
		// var switchingWasSkipped =
		return _____commonActionsWhenSwitchingLayout(thisInstance, {
			methodForSwitchingToCurrentLayout: ____switchLayoutToContentHangingToWindowTop, // of cause, should be itself
			isForcedToUpdate: isForcedToUpdate,
			pNameOfLayoutMark: 'isPinnedToWindowTop',
			pNameOfCssClass: 'layoutPinToWindowTop',
			rootElHeight: blockRootHeightWhenPinned + 'px',
			contentElTop: blockContentTopWhenPinned + 'px'

			// , logStringWhenActuallySwitching: '*** Hanging content to window top...'
			// , shouldDebug: true
		});
	}

	function ____switchLayoutToContentPinningAboveLowerBoundry(thisInstance, isForcedToUpdate, blockRootHeightWhenPinned, contentElNewTop) {
		// var switchingWasSkipped =
		return _____commonActionsWhenSwitchingLayout(thisInstance, {
			methodForSwitchingToCurrentLayout: ____switchLayoutToContentPinningAboveLowerBoundry, // of cause, should be itself
			isForcedToUpdate: isForcedToUpdate,
			pNameOfLayoutMark: 'isPinnerToParentBottom',
			pNameOfCssClass: 'layoutPinToParentBottom',
			rootElHeight: blockRootHeightWhenPinned + 'px',
			contentElTop: contentElNewTop + 'px'

			// , logStringWhenActuallySwitching: '*** Pinning content to follow lower boundry...'
			// , shouldDebug: true
		});
	}

	function _____commonActionsWhenSwitchingLayout(thisInstance, options) {
		// Returns true:  switching skipped;
		// Returns false: switching proceeded.

		// options = options || {};
		var privateData = privatePropertiesHost[thisInstance.__pToken],
			publicState = thisInstance.state,
			elements = thisInstance.elements,
			pNameOfLayoutMark = options.pNameOfLayoutMark,
			pNameSaveMethod = 'methodForSwitchingToCurrentLayout'
			, logInfo = options.logStringWhenActuallySwitching
			;

		// if (options.shouldDebug) {
			// console.debug(
			// 	!privateData[pNameOfLayoutMark] ? '\n\t'+pNameOfLayoutMark + ' ' + privateData[pNameOfLayoutMark] : '',
			// 	options.isForcedToUpdate ? '\n\tbecause is forced to? ' + options.isForcedToUpdate : '',
			// 	privateData.somethingChanged ? '\n\t  because something changed? '+ privateData.somethingChanged : ''
			// );
		// }
		if (privateData[pNameOfLayoutMark] && !privateData.somethingChanged && !options.isForcedToUpdate) return true;
		options.shouldDebug && logInfo && console.info(logInfo);

		publicState[pNameSaveMethod] = options[pNameSaveMethod];

		______soloLayoutStateTo(thisInstance, pNameOfLayoutMark);
		______soloCssClassTo(thisInstance, options.pNameOfCssClass);

		elements.chiefContent.style.top = options.contentElTop;
		elements.root.style.height = options.rootElHeight;

		return false;
	}

	function ______soloLayoutStateTo(thisInstance, propertyKeyOfLayoutState) {
		var privateData = privatePropertiesHost[thisInstance.__pToken];
		[
			'isInFreeLayout',
			'isPinnedToWindowTop',
			'isPinnerToParentBottom'
		].forEach(function (key) {
			privateData[key] = propertyKeyOfLayoutState === key;
		});
	}

	function ______soloCssClassTo(thisInstance, propertyKeyOfCssClassToApply) {
		var chiefContentClassList = thisInstance.elements.chiefContent.classList,
			cssClassNameOptions = thisInstance.options.cssClassName
		;

		for (var key in cssClassNameOptions) {
			var cssClassName = cssClassNameOptions[key];
			if (key === propertyKeyOfCssClassToApply) {
				// console.debug('-----<<<< add css:', cssClassName);
				cssClassName && chiefContentClassList.add   (cssClassName);
			} else {
				// console.debug('-----<<<< remove css:', cssClassName);
				cssClassName && chiefContentClassList.remove(cssClassName);
			}
		}
	}
});
