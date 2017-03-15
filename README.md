# javascript-web-dom-stick-on-both-edges

## Introduction

npmjs: @wulechuan/dom-stick-on-both-edges
<https://www.npmjs.com/package/@wulechuan/dom-stick-on-both-edges>

Hang a dom to window top (with customizable offset of course) or stick it down to somewhere of the page so that it moves with the page when the page is scrolling.

## Requirements

jQuery.throttle is required to run this module;

See: <http://benalman.com/projects/jquery-throttle-debounce-plugin/>

And: <https://github.com/cowboy/jquery-throttle-debounce>


## Usage

    var instance = new window.StickOnBothEdges({
        rootElement: document.querySelector('.hanging-block-wrapper'),
        hangingBlockElement: document.querySelector('.hanging-block'),
        lowerBoundaryRefElement: document.querySelector('.chief-content'),
        contentBottomToLowerBoundaryInHangingLayouts: 0,
        shouldEnableOnInit: true
    });

## API

Coming soon.