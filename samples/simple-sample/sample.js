(function () {
    var sidebarBlock1LayoutControl = new window.StickOnBothEdges({
        rootElement: document.querySelector('.hanging-block-wrapper'),
        hangingBlockElement: document.querySelector('.hanging-block'),
        lowerBoundaryRefElement: document.querySelector('#first-fold > .chief-content'),
        contentBottomToLowerBoundaryInHangingLayouts: 0,
        shouldEnableOnInit: true
    });


    // simply for easier access in web browser console for tweaking
    window.slc = sidebarBlock1LayoutControl;

    console.log(window.slc.state);
})();