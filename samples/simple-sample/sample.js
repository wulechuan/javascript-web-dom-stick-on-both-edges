(function () {
    var sidebarBlock1LayoutControl = new window.StickOnBothEdges({
        rootElement: document.querySelector('.hanging-block-wrapper'),
        hangingBlockElement: document.querySelector('.hanging-block'),
        lowerBoundaryRefElement: document.querySelector('#first-fold > .chief-content'),
        shouldEnableOnInit: true
    });

    console.log(sidebarBlock1LayoutControl.state);
})();