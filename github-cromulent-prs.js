// ==UserScript==
// @name         Cromulent GitHub PRs
// @namespace    https://github.com/emereum/tampermonkey-scripts
// @updateURL    https://github.com/emereum/tampermonkey-scripts/raw/rel/github-cromulent-prs.user.js
// @downloadURL  https://github.com/emereum/tampermonkey-scripts/raw/rel/github-cromulent-prs.user.js
// @version      0.1
// @description  Reverses the discussion order in GitHub PRs.
// @author       emereum
// @match        https://github.com/*/*/pull/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Reverse the discussion
    const discussion = document.querySelector('.js-discussion');
    Array.from(document.querySelectorAll('.js-timeline-item'))
        .reverse()
        .forEach(x => {
            x.remove();
            discussion.appendChild(x);
        });

    // Shimmy up that comment box
    const cb = document.querySelector('#issue-comment-box');
    cb.remove();
    cb.style['margin-left'] = '-56px';
    discussion.insertBefore(cb, document.querySelector('.js-timeline-marker'));

    // Remove protips
    cb.querySelector('.protip').remove();
    cb.querySelector('.text-small').remove();

    // Remove 'Attach files' hint
    cb.querySelector('.hx_drag-and-drop').remove();
})();