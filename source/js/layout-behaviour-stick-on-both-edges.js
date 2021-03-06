

/*** Class: LayoutBehaviour:StickOnBothEdges
 */
(function (factory) {
    var nameOfClass = 'StickOnBothEdges';
    var StickOnBothEdges = factory(
        nameOfClass,
        generateAUniqueTokenUnder,
        mergeBIntoA,
        domAIsChildOfB,
        (window.jQuery && window.jQuery.throttle) || (window.Cowboy && window.Cowboy.throttle)
    );

    if (window.module && window.module.exports) {
        module.exports = StickOnBothEdges;
    } else {
        window[nameOfClass] = StickOnBothEdges;
    }



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

    function mergeBIntoA(a, b) {
        if (!a || typeof a !== 'object') return null;
        if (!b || typeof b !== 'object') return a;

        for (var key in b) {
            var vB = b[key];
            if (vB === undefined) continue; // null value is acceptable
            if (Array.isArray(vB)) {
                if (Array.isArray(a[key])) {
                    Array.prototype.push.apply(a[key], vB); // keep reference to original a[key]
                } else {
                    a[key] = vB;
                }
            } else {
                a[key] = vB;
            }
        }

        return a;
    }

    function domAIsChildOfB(a, b) {
        if (!(a instanceof Node && b instanceof Node)) return false;

        var isChild = false;
        while (a !== b && a !== document.documentElement) {
            a = a.parentNode;
            if (a === b) {
                isChild = true;
            }
        }

        return isChild;
    }
})(function factory(nameOfClass, generateAUniqueTokenUnder, mergeBIntoA, domAIsChildOfB, jQueryThrottle) {
    'use strict';

    // private and also static properties (shared across instances)
    var logNameOfClass = '{' + nameOfClass + '} ==>',
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
            //	<instanceObject>.enable('My ad is ready')
            // explicitly, to enable it at proper anytime.
            shouldEnableOnInit: false,

            // if there are some other coupled blocks might effect the top of this block
            shouldAlwaysRenewFreeLayoutInfo: true, // everytime it enters the free layout mode

            cssClassName: {
                layoutFreeTemporary: 'js-stick-on-both-edges-layout-temporarily-free',
                layoutFree: 'js-stick-on-both-edges-layout-free',
                layoutPinToWindowTop: 'js-stick-on-both-edges-layout-hang-to-window-top',
                layoutPinToParentBottom: 'js-stick-on-both-edges-layout-pin-to-lower-boundary',
            },

            intervalTimeForRenewingState: 500,
            intervalTimeForUpdatingLayout: 40,
            throttleTimeForScrollAndResizeListeners: 16
        };


        // This is the public state object of an instance.
        // everything inside this object are constantly be checked and compared with that of new states,
        // Do NOT comment out any property that will be used later,
        // because we are using Object.keys() to determine what to check.
        thisInstance.state = {
            shouldEnable: false, // the global switch


            // important measurements and involved switches
            blockHeight: NaN,
            contentTopToPageTopInFreeLayout: NaN,
            contentTopToRootTopInFreeLayout: 0,
            contentTopToWindowTopInHangingLayouts: 0,
            contentBottomToLowerBoundaryInHangingLayouts: 15,

            lowerBoundaryRefElement: null, // exactly the same as this.elements.lowerBoundaryRef
            shouldUseBottomEdgeOfLowerBoundaryRefElement: true,
            hangingLowerBoundaryToPageTop: NaN



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

        if (!(constructionOptions.rootElement instanceof Node)) {
            throw new Error('Invalid root element.');
        }

        if (!(constructionOptions.hangingBlockElement instanceof Node)) {
            throw new Error('Invalid hangingBlock element.');
        }

        thisInstance.elements = {
            root: constructionOptions.rootElement, // as the wrapper and the placeholder for the hangingBlock element
            hangingBlock: constructionOptions.hangingBlockElement,
            lowerBoundaryRef: null
        };





        var privateData = {
            state: {
                // layout status marks
                layouts: {
                    isFreeLayout: true,
                    isPinnedToWindowTop: false,
                    isPinnerToParentBottom: false,
                },


                // the global switch
                isEnabled: false,


                // helpers
                somethingChanged: false,
                hangingLowerBoundaryToWindowTop: NaN,
                shouldRenewFreeLayoutInfoNextTimeEnteringFreeLayout: false,


                // misc
                intervalIDForRenewingState: NaN,
                intervalIDForUpdatingLayout: NaN
            },


            // functions
            events: {},
            boundFunctions: {},


            // the queued tasks (states actually), btw, at present no more than one task is allowed
            updatingStatesQueue: [],
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

        thisInstance.enableOrDisable = enableOrDisable;
        thisInstance.enable = enable;
        thisInstance.disable = disable;

        thisInstance.destroy = destroy;

        thisInstance.renewState = renewState;
        thisInstance.renewStateAndThenUpdate = renewStateAndThenUpdate;
        // thisInstance.setContentTopToWindowTopInHangingLayouts = setContentTopToWindowTopInHangingLayouts;
        // thisInstance.setContentBottomToLowerBoundary = setContentBottomToLowerBoundary;
        // thisInstance.setLowerBoundaryRefElement = setLowerBoundaryRefElement;
        // thisInstance.setUsedEdgeOfLowerBoundaryRefElement = setUsedEdgeOfLowerBoundaryRefElement;


        // a very traditional way to safely update related info
        thisInstance.startIntervalOfRenewingState = startIntervalOfRenewingState;
        thisInstance.clearIntervalOfRenewingState = clearIntervalOfRenewingState;
        thisInstance.startIntervalOfLayoutUpdate = startIntervalOfLayoutUpdate;
        thisInstance.clearIntervalOfLayoutUpdate = clearIntervalOfLayoutUpdate;

        thisInstance.requestLayoutUpdate = requestLayoutUpdate;
        thisInstance.updateLayout = updateLayout;




        // init
        _init(thisInstance, constructionOptions);
        // console.info('Initialized!', thisInstance);
    };





    function _init(thisInstance, initOptions) {
        thisInstance.config(initOptions);



        _createBoundFunctions(thisInstance);



        // Store initial states
        renewState.call(thisInstance, initOptions, true);

        if (typeof initOptions.shouldEnableOnInit === 'boolean') {
            enableOrDisable.call(thisInstance,
                initOptions.shouldEnableOnInit,
                initOptions.reasonForEnablingOrDisabling || initOptions.reason || 'User desired on initialization.'
            );
        } else if (thisInstance.options.shouldEnableOnInit) {
            enable.call(thisInstance, 'Forced to enabled on initialization.');
        }

        updateLayout.call(thisInstance);




        // Third, also update layout whenever user is scrolling or resizing window
        var boundFunctions = _privateDataOf(thisInstance).boundFunctions;
        window.addEventListener('scroll', boundFunctions.listenToScrollEvent);
        window.addEventListener('resize', boundFunctions.listenToResizeEvent);
    }

    function _privateDataOf(thisInstance) {
        return privatePropertiesHost[thisInstance.__pToken];
    }

    function _createBoundFunctions(thisInstance) {
        var boundFunctions = _privateDataOf(thisInstance).boundFunctions;

        boundFunctions.doIntervalOfRenewingState =
            _doIntervalOfRenewingState.bind(null, thisInstance);

        boundFunctions.doIntervalOfLayoutUpdate =
            _doIntervalOfLayoutUpdate.bind(null, thisInstance);



        // Even without a task in queue, we still need to update layout constantly.
        // For example when user is scrolliing the page, nothing about the important measurements changed
        // but obviously the _doUpdateLayout should be invoked still.
        boundFunctions.doUpdateLayout = (function (/*event*/) {
            _doUpdateLayout(thisInstance);
        }).bind(thisInstance);




        var throttleWrappedAction = jQueryThrottle(
            thisInstance.options.throttleTimeForScrollAndResizeListeners,
            boundFunctions.doUpdateLayout
        );

        boundFunctions.listenToScrollEvent = throttleWrappedAction;
        boundFunctions.listenToResizeEvent = throttleWrappedAction;
    }

    function isEnabled() {
        return _privateDataOf(this).state.isEnabled;
    }

    function currentLayout() {
        var layoutStates = _privateDataOf(this).state.layouts;

        if (layoutStates.isFreeLayout) return 'free layout';
        if (layoutStates.isPinnedToWindowTop) return 'pinned to top';
        if (layoutStates.isPinnerToParentBottom) return 'following lower boundary';

        throw RangeError(logNameOfClass, 'Fatal: None of the three states are active.');
    }

    function currentLayoutIs(layoutNameToCheck) {
        var layoutStates = _privateDataOf(this).state.layouts;

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
            return layoutStates.isFreeLayout;

        case 'top':
        case 'hanging':
        case 'pinned-to-top':
            return layoutStates.isPinnedToWindowTop;

        case 'following':
        case 'bottom':
        case 'following-lower-boundary':
        case 'pinned-to-bottom':
            return layoutStates.isPinnerToParentBottom;
        }

        return false;
    }

    function config(options) {
        var thisInstance = this,
            moduleOptions = thisInstance.options,
            pName,
            pValue
            ;



        pName = 'intervalTimeForRenewingState';
        if (options.hasOwnProperty(pName)) {
            pValue = parseInt(options[pName]);
            if (!isNaN(pValue) && pValue > 20) { // acceptable threshold
                moduleOptions[pName] = pValue;
            }
        }



        pName = 'intervalTimeForUpdatingLayout';
        if (options.hasOwnProperty(pName)) {
            pValue = parseInt(options[pName]);
            if (!isNaN(pValue) && pValue > 20) { // acceptable threshold
                moduleOptions[pName] = pValue;
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
        var eventsHost = _privateDataOf(thisInstance).events,
            input = options[eventName]
        ;

        if (typeof input === 'function' || input === undefined) {
            eventsHost[eventName] = input;
        }
    }

    function _dispatchAnEvent(thisInstance, eventName, shouldWarnIfNotHandled) {
        var eventsHost = _privateDataOf(thisInstance).events;

        if (typeof eventsHost[eventName] !== 'function') {
            if (shouldWarnIfNotHandled) {
                console.warn('The "' + eventName + '" is NOT handled.');
            }

            return;
        } else {
            return eventsHost[eventName].call(thisInstance, thisInstance.state);
        }
    }






    function enable(reasonForEnabling) {
        enableOrDisable.call(this, true, reasonForEnabling);
    }

    function disable(reasonForDisabling, shouldDestroyAfterDisabled) {
        enableOrDisable.call(this, false, reasonForDisabling, shouldDestroyAfterDisabled);
    }

    function destroy(reason) {
        disable.call(this, reason, true);
    }

    function enableOrDisable(shouldEnable, reason, shouldDestroyAfterDisabled) {
        if (typeof shouldEnable === 'undefined') return;
        shouldEnable = !!shouldEnable;


        var shouldCancel = _onEnablingOrDisabling(this,
            shouldEnable,
            shouldDestroyAfterDisabled
        );

        if (shouldCancel) {
            var logString1 = shouldEnable ? 'Enabling' : shouldDestroyAfterDisabled ? 'DESTORYING' : 'DISABLING';
            console.warn(logString1, 'request was cancelled.');
            return;
        }



        var newState = {};
        newState.shouldEnable = !!shouldEnable;

        // must contains a reason property,
        // for overwriting that of previously queued states.
        newState.reason = (reason && typeof reason === 'string') ? reason : '<unkown>';

        if (!shouldEnable && shouldDestroyAfterDisabled) {
            newState.isForcedToRenew = true;
            newState.shouldDestroyAfterDisabled = true;
        }

        requestLayoutUpdate.call(this, newState);


        updateLayout.call(this);
    }

    function _onEnablingOrDisabling(thisInstance, willEnable, shouldDestroyAfterDisabled) {
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

    function _onEnabledOrDisabled(thisInstance, isNowEnabled) {
        var publicState = thisInstance.state;

        // console.log('\n===== _onEnabledOrDisabled', isNowEnabled, '\n=====');
        _privateDataOf(thisInstance).state.isEnabled = isNowEnabled;

        if (isNowEnabled) {
            delete publicState.shouldDestroyAfterDisabled;

            // The invocation below might cause an infinite loop!
            // Enhancements are needed!
            _dispatchAnEvent(thisInstance, 'onEnabled');
        } else {
            _dispatchAnEvent(thisInstance, 'onDisabled');

            thisInstance.clearIntervalOfRenewingState();
            thisInstance.clearIntervalOfLayoutUpdate();

            if (publicState.shouldDestroyAfterDisabled) {
                _destroyOneInstanceAfterLayoutRestoredToFree(thisInstance);
            }
        }
    }

    function _destroyOneInstanceAfterLayoutRestoredToFree(thisInstance) {
        var elements = thisInstance.elements,
            boundFunctions = _privateDataOf(thisInstance).boundFunctions
        ;

        window.removeEventListener('scroll', boundFunctions.listenToScrollEvent);
        window.removeEventListener('resize', boundFunctions.listenToResizeEvent);

        elements.root.style.height = '';
        elements.hangingBlock.style.top = '';
        ______soloCssClassTo(thisInstance, null);

        _dispatchAnEvent(thisInstance, 'onDestroyed', true);
    }




    function startIntervalOfRenewingState() {
        _startOrClearIntervalOfRenewingState(this, true);
    }
    function clearIntervalOfRenewingState() {
        _startOrClearIntervalOfRenewingState(this, false);
    }
    function _startOrClearIntervalOfRenewingState(thisInstance, shouldStart) {
        var privateData = _privateDataOf(thisInstance),
            privateState = privateData.state,
            logString1 = shouldStart ? 'Starting' : 'STOPPING',
            logString2 = 'interval for renewing related info.',
            // logString3 =  '\n\t module rootElement:',
            // rootElement = thisInstance.elements.root,
            pNameForIndex = 'intervalIDForRenewingState',
            currentIndex = privateState[pNameForIndex],
            hasActiveInterval = !isNaN(currentIndex)
            ;

        if (shouldStart && !hasActiveInterval) {
            console.info(logString1, logString2
                // , logString3, rootElement
            );
            privateState[pNameForIndex] = setInterval(
                privateData.boundFunctions.doIntervalOfRenewingState,
                thisInstance.options.intervalTimeForRenewingState
            );
        } else if (!shouldStart && hasActiveInterval) {
            console.warn(logString1, logString2
                // , logString3, rootElement
            );
            clearInterval(currentIndex);
            privateState[pNameForIndex] = NaN;
        }
    }
    function _doIntervalOfRenewingState(thisInstance) {
        var shouldCancel = _dispatchAnEvent(thisInstance, 'onIntervalBegin');

        if (!shouldCancel) {
            renewState.call(thisInstance, null, true);
        }

        // even if this interval is cancelled, still call the onIntervalEnd event
        // need more thinking
        _dispatchAnEvent(thisInstance, 'onIntervalEnd');
    }




    function startIntervalOfLayoutUpdate() {
        _startOrClearIntervalOfLayoutUpdate(this, true);
    }
    function clearIntervalOfLayoutUpdate() {
        _startOrClearIntervalOfLayoutUpdate(this, false);
    }
    function _startOrClearIntervalOfLayoutUpdate(thisInstance, shouldStart) {
        var privateData = _privateDataOf(thisInstance),
            privateState = privateData.state,
            logString1 = shouldStart ? 'Starting' : 'STOPPING',
            logString2 = 'interval for updating layout.',
            // logString3 = indentAlignsToLogNameOfClass.slice(0, -15) + ' module rootElement:',
            // rootElement = this.elements.root,
            pNameForIndex = 'intervalIDForUpdatingLayout',
            currentIndex = privateState[pNameForIndex],
            hasActiveInterval = !isNaN(currentIndex)
            ;

        if (shouldStart && !hasActiveInterval) {
            console.info(logString1, logString2
                // , '\n' + logString3, rootElement
            );
            privateState[pNameForIndex] = setInterval(
                privateData.boundFunctions.doIntervalOfLayoutUpdate,
                thisInstance.options.intervalTimeForUpdatingLayout
            );
        } else if (!shouldStart && hasActiveInterval) {
            console.warn(logString1, logString2
                // , '\n ' + logString3, rootElement
            );
            clearInterval(currentIndex);
            privateState[pNameForIndex] = NaN;
        }
    }
    function _doIntervalOfLayoutUpdate(thisInstance) {
        updateLayout.call(thisInstance);
    }




    // renew all state but NOT the global switch, aka the this.state.shouldEnable
    function renewStateAndThenUpdate(options) {
        renewState.call(this, options, false);
        updateLayout.call(this);
    }

    // renew all state but NOT the global switch, aka the this.state.shouldEnable
    function renewState(options, isForcedToRenew) {
        // actions that relies on arguments
        if (typeof options === 'object' && options) {
            setContentTopToWindowTopInHangingLayouts.call(this,
                options.contentTopToWindowTopInHangingLayouts,
                isForcedToRenew
            );

            setContentBottomToLowerBoundary.call(this,
                options.contentBottomToLowerBoundaryInHangingLayouts,
                isForcedToRenew
            );

            var edgeUsageHasBeenDecidedViaNewRefElement = setLowerBoundaryRefElement.call(this,
                options.lowerBoundaryRefElement,
                isForcedToRenew
            );

            if (!edgeUsageHasBeenDecidedViaNewRefElement) {
                setUsedEdgeOfLowerBoundaryRefElement.call(this,
                    options.shouldUseBottomEdgeOfLowerBoundaryRefElement,
                    isForcedToRenew
                );
            }
        }



        // actions that need no arguments
        _renewContentHeight.call(this, isForcedToRenew);
        _renewContentTopToRootTopInFreeLayout.call(this, isForcedToRenew);
        _renewContentTopToPageTopInFreeLayout.call(this, isForcedToRenew);
    }



    function setContentTopToWindowTopInHangingLayouts(newExtraSpace, isForcedToRenew) {
        var newState = {};

        if (isForcedToRenew) newState.isForcedToUpdate = true;

        newExtraSpace = parseFloat(newExtraSpace);
        if (!isNaN(newExtraSpace)) {
            newState.contentTopToWindowTopInHangingLayouts = newExtraSpace;
        }

        requestLayoutUpdate.call(this, newState);
    }

    function setContentBottomToLowerBoundary(newExtraSpace, isForcedToRenew) {
        var newState = {};

        if (isForcedToRenew) newState.isForcedToUpdate = true;

        newExtraSpace = parseFloat(newExtraSpace);
        if (!isNaN(newExtraSpace)) {
            newState.contentBottomToLowerBoundaryInHangingLayouts = newExtraSpace;
        }

        requestLayoutUpdate.call(this, newState);
    }

    function setLowerBoundaryRefElement(newElement, isForcedToRenew) {
        var newState = {};

        if (isForcedToRenew) newState.isForcedToUpdate = true;

        var elements = this.elements,
            rootElement = elements.root,
            pName = 'lowerBoundaryRef',
            newElementIsValid = true,
            logString1 = 'The lower boundary ref element',
            logString2 = 'This doesn\'t make any sense. Ref element NOT renewed.'
            ;

        if (newElement !== null) { // null value is acceptable for removing lower boundary ref element
            if (!(newElement instanceof Node)) {
                newElementIsValid = false;
            } else if (domAIsChildOfB(newElement, rootElement)) {
                newElementIsValid = false;
                console.warn(logString1, 'is a descendant of the root element.', logString2);
            } else if (newElement === rootElement) {
                newElementIsValid = false;
                console.warn(logString1, 'is the same dom as the root element.', logString2);
            }
        }


        var edgeUsageHasBeenDecidedHereInsideThisFunction = false;

        if (newElementIsValid && elements[pName] !== newElement) {
            elements[pName] = newElement;
            newState[pName + 'Element'] = newElement;

            if (domAIsChildOfB(rootElement, newElement)) {
                setUsedEdgeOfLowerBoundaryRefElement.call(this, true, isForcedToRenew);

                // Here the false value means
                // the "shouldUseBottomEdgeOfLowerBoundaryRefElement"
                // has been decided here (the above line),
                // so the setUsedEdgeOfLowerBoundaryRefElement()
                // should NOT be invoked inside the renewState() again,
                // thus the input argument for "shouldUseBottomEdgeOfLowerBoundaryRefElement"
                // will be ignored if any.
                edgeUsageHasBeenDecidedHereInsideThisFunction = true;
            }

            requestLayoutUpdate.call(this, newState);
        }

        return edgeUsageHasBeenDecidedHereInsideThisFunction;
    }

    function setUsedEdgeOfLowerBoundaryRefElement(shouldUseBottomEdgeOfLowerBoundaryRefElement, isForcedToRenew) {
        var thisInstance = this,
            elements = thisInstance.elements
        ;

        if (typeof shouldUseBottomEdgeOfLowerBoundaryRefElement !== 'boolean') {
            return;
        }

        if (domAIsChildOfB(elements.root, elements.lowerBoundaryRef)) {
            // Should always use 'bottom'
            return;
        }

        var newState = {};

        if (isForcedToRenew) newState.isForcedToUpdate = true;

        newState.shouldUseBottomEdgeOfLowerBoundaryRefElement = !!shouldUseBottomEdgeOfLowerBoundaryRefElement;

        requestLayoutUpdate.call(thisInstance, newState);
    }



    function _renewContentHeight(isForcedToRenew) {
        var newState = {
            blockHeight: this.elements.hangingBlock.offsetHeight
        };

        if (isForcedToRenew) newState.isForcedToUpdate = true;

        requestLayoutUpdate.call(this, newState);
    }

    function _renewContentTopToRootTopInFreeLayout(isForcedToRenew) {
        var newState = {},
            pName = 'contentTopToRootTopInFreeLayout'
        ;

        if (isForcedToRenew) newState.isForcedToUpdate = true;

        newState[pName] = this.elements.hangingBlock.offsetTop;

        requestLayoutUpdate.call(this, newState);
    }

    function _renewContentTopToPageTopInFreeLayout(isForcedToRenewWithoutWaitingForLayoutToSwitch) {
        var thisInstance = this,
            privateState = _privateDataOf(thisInstance).state,
            shouldDoRenew = true,
            functionForSwitchingToCorrectLayout,
            forcedImmediateSwitchingWasSkipped = true,
            pNameNextTimeRenewFreeLayout = 'shouldRenewFreeLayoutInfoNextTimeEnteringFreeLayout'
            ;

        if (!privateState.layouts.isFreeLayout) {
            if (isForcedToRenewWithoutWaitingForLayoutToSwitch) {
                privateState[pNameNextTimeRenewFreeLayout] = false;
                functionForSwitchingToCorrectLayout = thisInstance.state.methodForSwitchingToCurrentLayout;
                forcedImmediateSwitchingWasSkipped = ____switchLayoutToFree(
                    thisInstance,
                    isForcedToRenewWithoutWaitingForLayoutToSwitch,
                    true
                );
            } else {
                // console.debug('Action holded for a later time.');
                shouldDoRenew = false;
                privateState[pNameNextTimeRenewFreeLayout] = true;
            }
        }

        if (shouldDoRenew) {
            __doRenewContentTopToPageTopInFreeLayout(thisInstance, isForcedToRenewWithoutWaitingForLayoutToSwitch);
        }

        if (
            !forcedImmediateSwitchingWasSkipped
            && typeof functionForSwitchingToCorrectLayout === 'function'
        ) {
            // console.debug('Restore layout after switching to free layout temporarily.');
            functionForSwitchingToCorrectLayout(thisInstance);
        }
    }

    function __doRenewContentTopToPageTopInFreeLayout(thisInstance, isForcedToRenew) {
        var contentClientRect = thisInstance.elements.hangingBlock.getBoundingClientRect();

        if (contentClientRect.width === 0 && contentClientRect.height === 0) {
            console.warn(
                '\n\t Cannot evaluate hangingBlockElement\'s "boundingClientRect"!',
                '\n\t The chief content elment might not be visible at the moment.'
            );
            return;
        }


        var newState = {};

        if (isForcedToRenew) newState.isForcedToUpdate = true;

        newState.contentTopToPageTopInFreeLayout = contentClientRect.top + window.scrollY;
        // console.log('*** newState: content top to page:', newState.contentTopToPageTopInFreeLayout, '***');

        requestLayoutUpdate.call(thisInstance, newState);
    }





    function requestLayoutUpdate(newStateOrFunctionToGenerateNewStateOrABoolean) {
        var thisInstance = this,
            statesQueue = _privateDataOf(thisInstance).updatingStatesQueue
        ;


        // At presnet, no more than one state is allowed in queue.
        // So whenever there exists one item in the array,
        // we simply use it, instead of create a new one.
        var shouldCreateNewStateObject = !statesQueue[statesQueue.length - 1];
        if (shouldCreateNewStateObject) {
            statesQueue.push({});
        }


        var stateToUpdate = statesQueue[statesQueue.length - 1];

        if (typeof newStateOrFunctionToGenerateNewStateOrABoolean === 'function') {
            newStateOrFunctionToGenerateNewStateOrABoolean.call(thisInstance, stateToUpdate);
        } else if (
            typeof newStateOrFunctionToGenerateNewStateOrABoolean === 'object' &&
            !Array.isArray(newStateOrFunctionToGenerateNewStateOrABoolean)
        ) {
            // console.debug('merging states in the queue...');
            mergeBIntoA(stateToUpdate, newStateOrFunctionToGenerateNewStateOrABoolean);
        } else {
            stateToUpdate.isForcedToUpdate = stateToUpdate.isForcedToUpdate ||
                (typeof newStateOrFunctionToGenerateNewStateOrABoolean === 'undefined') ||
                !!newStateOrFunctionToGenerateNewStateOrABoolean
                ;
        }
    }

    // function _processAllupdatingStatesQueue(thisInstance) {
    // 	while (_privateDataOf(this).updatingStatesQueue.length > 0) {
    // 		__processOneQueuedStateForAnUpdateOfLayoutInQueue(thisInstance);
    // 	}
    // 	___updateAllDerivedStatesAccordingToNewState();
    // }

    function __processOneQueuedStateForAnUpdateOfLayoutInQueue(thisInstance) {
        var privateData = _privateDataOf(thisInstance);

        var newState = privateData.updatingStatesQueue.shift();

        ___detectChangesBetweenStates(thisInstance, thisInstance.state, newState);


        // console.debug(
        // 	'******** newState to update ********',
        // 	'\n'+'updateLayout();', 
        // 	'\n'+JSON.stringify(newState),
        // 	'\n\n\n'
        // );

        return newState;
    }




    function _mergeNewStateIntoModuleCurrentState(thisInstance, newState) {
        mergeBIntoA(thisInstance.state, newState);
    }

    function ___detectChangesBetweenStates(thisInstance, state1, state2) {
        ____detectChangesOnAllPropertiesAndRemoveThoseWontChangeFromState2(thisInstance, state1, state2);
        ____processState2AccordingToPreservedProperties(thisInstance, state2);
    }

    function ____detectChangesOnAllPropertiesAndRemoveThoseWontChangeFromState2(thisInstance, state1, state2) {
        Object.keys(thisInstance.state).forEach(function (pName) {
            var thisPropertyWillChange = _____detectChangeForAProperty(pName, state1, state2);
            if (thisPropertyWillChange) {
                _privateDataOf(thisInstance).state.somethingChanged = true;
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

        if (changed) {
            console.debug(
                '"' + pName + '" will change\n',
                indentAlignsToLogNameOfClass + 'from', v1, 'into', v2
            );
        }

        return changed;
    }

    function ____processState2AccordingToPreservedProperties(thisInstance, state2) {
        // At present, only the "reason" property
        // which might be introduced by enabling/disabling hanging behaviour
        // should be processed here



        if (!_privateDataOf(thisInstance).state.somethingChanged) return;



        var pName1, logString1, logString2, logString3
            // , rootElement = thisInstance.elements.root
            ;


        if (typeof state2.shouldEnable === 'boolean') {
            pName1 = 'reason';

            var willEnableHanging = state2.shouldEnable;

            logString1 = willEnableHanging ? 'Enabling' : state2.shouldDestroyAfterDisabled ? 'DESTORYING' : 'DISABLING';
            logString2 = 'behaviour...\n';
            logString3 = state2[pName1]
                // + '\n module rootElement:'
                ;

            logString3 = indentAlignsToLogNameOfClass.slice('Reason: '.length)
                + 'Reason: '
                + logString3.replace(/\n/g, '\n ' + indentAlignsToLogNameOfClass);

            if (willEnableHanging) {
                console.info(logString1, logString2, logString3
                    // , rootElement
                );
            } else {
                // In Google Chrome, "console.warn" now has a prefixing triangle to show calling stacks,
                // so we nee one more space.
                console.warn(logString1, logString2, ' ', logString3
                    // , rootElement
                );
            }
        }
    }




    // You can also name this function as something like "flushQueuedTasks".
    function updateLayout() {
        var thisInstance = this,
            privateData = _privateDataOf(thisInstance),
            publicState = thisInstance.state,
            statesQueue = privateData.updatingStatesQueue
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

        // var newState = _processAllupdatingStatesQueue(thisInstance); // policy 1
        var newState = __processOneQueuedStateForAnUpdateOfLayoutInQueue(thisInstance); // policy 2




        var isForcedToUpdate = newState.isForcedToUpdate;
        delete newState.isForcedToUpdate;
        // console.log('updateLayout(): changes?', privateData.state.somethingChanged, '\t forced to?', isForcedToUpdate);


        if (privateData.state.somethingChanged || isForcedToUpdate) {
            // Should always merge, because extra properties like "reason" should be carried
            _mergeNewStateIntoModuleCurrentState(thisInstance, newState);

            // Now, do the work
            _doUpdateLayout(thisInstance, isForcedToUpdate);
        }



        if (typeof newState.shouldEnable === 'boolean') {
            // reason should be available for onEnabled/onDisabled events
            _onEnabledOrDisabled(thisInstance, newState.shouldEnable);

            // now delete the old reason
            delete publicState.reason;
        }
    }

    function _doUpdateLayout(thisInstance, isForcedToUpdate) {
        var privateState = _privateDataOf(thisInstance).state,
            publicState = thisInstance.state,
            elements = thisInstance.elements
            ;

        __evaluateHangingBoundries(thisInstance);


        var hangingTopOffset = publicState.contentTopToWindowTopInHangingLayouts,
            topBoundaryToPageTop = window.scrollY + hangingTopOffset,
            boundriesDistance = publicState.hangingLowerBoundaryToPageTop - publicState.contentTopToPageTopInFreeLayout,
            requiredRoomInY = publicState.blockHeight + publicState.contentBottomToLowerBoundaryInHangingLayouts,
            availableRoomInY = privateState.hangingLowerBoundaryToWindowTop - hangingTopOffset,


            // Might need compensation to some margins but not implemented yet
            blockRootHeightWhenPinned = publicState.blockHeight;


        var thereIsNoEnoughRoomForThisBlockToHang =
            window.innerHeight < requiredRoomInY ||
            (
                // NaN means lower boundary doesn't available at all,
                // so there is always enough room
                !isNaN(boundriesDistance) &&

                boundriesDistance < requiredRoomInY
            )
            ;



        // console.debug(
        // 	'\n\t someting changed?', privateState.somethingChanged,

        // 	'\n to pin to top:',
        // 	'\n\t window scroll y:', topBoundaryToPageTop,
        // 	'\n\t free layout top:', publicState.contentTopToPageTopInFreeLayout,
        // 	'\n\t window scroll y <= free layout top?', topBoundaryToPageTop <= publicState.contentTopToPageTopInFreeLayout,

        // 	'\n to pin to bottom:',
        // 	'\n\t lower boundary y:', privateState.hangingLowerBoundaryToWindowTop,
        // 	'\n\t available y:', availableRoomInY,
        // 	'\n\t required room y:', requiredRoomInY,
        // 	'\n\t available y <= required room y?', availableRoomInY < requiredRoomInY
        // );

        if (!publicState.shouldEnable ||
            thereIsNoEnoughRoomForThisBlockToHang ||
            topBoundaryToPageTop <= publicState.contentTopToPageTopInFreeLayout
        ) {
            ____switchLayoutToFree(thisInstance, isForcedToUpdate);
        } else if (availableRoomInY <= requiredRoomInY) {
            ____switchLayoutToContentPinningAboveLowerBoundary(
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


        privateState.somethingChanged = false;
        delete publicState.methodForSwitchingToCurrentLayout;
    }

    function __evaluateHangingBoundries(thisInstance) {
        // this function not only updates some state values,
        // but also returns a newState object for other function to utilize

        var publicState = thisInstance.state,
            pName = 'hangingLowerBoundaryToPageTop',
            refElement = publicState.lowerBoundaryRefElement,
            refElementClientRect,
            refNewYToWindowTop = NaN,
            refNewYToPageTop = NaN
            ;

        if (refElement instanceof Node) {
            refElementClientRect = refElement.getBoundingClientRect();
            if (refElementClientRect.width === 0 && refElementClientRect.height === 0) {
                console.warn('Reference element for deciding hanging lower boundary is invisible at this moment.');
            } else {
                refNewYToWindowTop = refElementClientRect[publicState.shouldUseBottomEdgeOfLowerBoundaryRefElement ? 'bottom' : 'top'];
                refNewYToPageTop = refNewYToWindowTop + window.scrollY;
            }
        } else {
            console.debug('Reference element for deciding hanging lower boundary is not provided.');
            // do nothing, keeping NaN values
        }


        // values below might be NaN, as long as the refElement is not available any more or is hidden
        _privateDataOf(thisInstance).state.hangingLowerBoundaryToWindowTop = refNewYToWindowTop;
        publicState[pName] = refNewYToPageTop;
    }

    function ____switchLayoutToFree(thisInstance, isForcedToUpdate, isForcedByAForcedRenew) {
        var privateState = _privateDataOf(thisInstance).state,
            layoutBeforeSwitchingWasExactlyFreeLayout = privateState.layouts.isFreeLayout // cache old state
        ;

        var switchingWasSkipped =
            _____commonActionsWhenSwitchingLayout(thisInstance, {
                methodForSwitchingToCurrentLayout: ____switchLayoutToFree, // of cause, should be itself
                isForcedToUpdate: isForcedToUpdate,
                pNameOfLayoutMark: 'isFreeLayout',
                pNameOfCssClass: isForcedByAForcedRenew ? 'layoutFreeTemporary' : 'layoutFree',
                rootElHeight: '', // thisInstance.state.blockHeight + 'px'
                contentElTop: ''

                // , logStringWhenActuallySwitching: '*** switching content layout back to free layout...'
                // , shouldDebug: true
            });



        if (!switchingWasSkipped) {
            // if (isForcedByAForcedRenew) {
            // 	console.debug('Forced to switch to free layout temporarily.');				
            // }

            var shouldAlwaysRenewFreeLayoutInfo = thisInstance.options.shouldAlwaysRenewFreeLayoutInfo,
                pNameNextTimeRenewFreeLayout = 'shouldRenewFreeLayoutInfoNextTimeEnteringFreeLayout' // for better minification
            ;

            if (
                (shouldAlwaysRenewFreeLayoutInfo || privateState[pNameNextTimeRenewFreeLayout])
                && !layoutBeforeSwitchingWasExactlyFreeLayout
                // && !isForcedByAForcedRenew
            ) {
                // For the invocation below,
                // as we can see the value of the "forcedToDoSo" argument is not <true>,
                // so basically if there are no changes happened at all,
                // the _doUpdateLayout() will not be called,
                // thus the infinite looping invocation will not occur.

                // Note that if this function is invoked for switching layout temporarily,
                // this means the invokation was taken by the renewStateAndThenUpdate itself
                // thus we should avoid infinite looping.

                // console.debug('Returned to free layout. An opportunity to renew all related info.');
                renewStateAndThenUpdate.call(thisInstance);
            }

            privateState[pNameNextTimeRenewFreeLayout] = false;
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

    function ____switchLayoutToContentPinningAboveLowerBoundary(thisInstance, isForcedToUpdate, blockRootHeightWhenPinned, contentElNewTop) {
        // var switchingWasSkipped =
        return _____commonActionsWhenSwitchingLayout(thisInstance, {
            methodForSwitchingToCurrentLayout: ____switchLayoutToContentPinningAboveLowerBoundary, // of cause, should be itself
            isForcedToUpdate: isForcedToUpdate,
            pNameOfLayoutMark: 'isPinnerToParentBottom',
            pNameOfCssClass: 'layoutPinToParentBottom',
            rootElHeight: blockRootHeightWhenPinned + 'px',
            contentElTop: contentElNewTop + 'px'

            // , logStringWhenActuallySwitching: '*** Pinning content to follow lower boundary...'
            // , shouldDebug: true
        });
    }

    function _____commonActionsWhenSwitchingLayout(thisInstance, options) {
        // Returns true:  switching skipped;
        // Returns false: switching proceeded.

        // options = options || {};
        var privateState = _privateDataOf(thisInstance).state,
            publicState = thisInstance.state,
            elements = thisInstance.elements,
            pNameOfLayoutMark = options.pNameOfLayoutMark,
            pNameSaveMethod = 'methodForSwitchingToCurrentLayout'
            , logInfo = options.logStringWhenActuallySwitching
            ;

        // if (options.shouldDebug) {
        // console.debug(
        // 	!privateState.layouts.[pNameOfLayoutMark] ? '\n\t'+pNameOfLayoutMark + ' ' + privateState.layouts.[pNameOfLayoutMark] : '',
        // 	options.isForcedToUpdate ? '\n\tbecause is forced to? ' + options.isForcedToUpdate : '',
        // 	privateState.somethingChanged ? '\n\t  because something changed? '+ privateState.somethingChanged : ''
        // );
        // }
        if (privateState.layouts[pNameOfLayoutMark] && !privateState.somethingChanged && !options.isForcedToUpdate) return true;
        options.shouldDebug && logInfo && console.info(logInfo);

        publicState[pNameSaveMethod] = options[pNameSaveMethod];

        ______soloLayoutStateTo(thisInstance, pNameOfLayoutMark);
        ______soloCssClassTo(thisInstance, options.pNameOfCssClass);

        elements.hangingBlock.style.top = options.contentElTop;
        elements.root.style.height = options.rootElHeight;

        return false;
    }

    function ______soloLayoutStateTo(thisInstance, propertyKeyOfLayoutState) {
        var layoutStates = _privateDataOf(thisInstance).state.layouts;
        Object.keys(layoutStates).forEach(function (key) {
            layoutStates[key] = propertyKeyOfLayoutState === key;
        });
    }

    function ______soloCssClassTo(thisInstance, propertyKeyOfCssClassToApply) {
        var hangingBlockClassList = thisInstance.elements.hangingBlock.classList,
            cssClassNameOptions = thisInstance.options.cssClassName
        ;

        for (var key in cssClassNameOptions) {
            var cssClassName = cssClassNameOptions[key];
            if (key === propertyKeyOfCssClassToApply) {
                // console.debug('-----<<<< add css:', cssClassName);
                cssClassName && hangingBlockClassList.add(cssClassName);
            } else {
                // console.debug('-----<<<< remove css:', cssClassName);
                cssClassName && hangingBlockClassList.remove(cssClassName);
            }
        }
    }
});
