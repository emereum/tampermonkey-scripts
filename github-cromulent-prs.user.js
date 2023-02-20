// ==UserScript==
// @name         Cromulent GitHub PRs
// @namespace    https://github.com/emereum/tampermonkey-scripts
// @updateURL    https://raw.githubusercontent.com/emereum/tampermonkey-scripts/main/github-cromulent-prs.user.js
// @downloadURL  https://raw.githubusercontent.com/emereum/tampermonkey-scripts/main/github-cromulent-prs.user.js
// @version      0.3
// @description  Reverses the discussion order in GitHub PRs.
// @author       emereum
// @match        https://github.com/*/*/pull/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const styles = Object.assign(document.createElement('style'), {
        innerHTML: `
            @media (min-width: 768px) {
            .bootleg-comment-box {
                margin-left: -56px;
            }
            }
        `});
    document.head.appendChild(styles);

    const reverseChildren = (el) => el.append(...Array.from(el.childNodes).reverse());

    // Reverse the discussion
    const discussion = document.querySelector('.js-discussion');
    Array.from(document.querySelectorAll('.js-timeline-item'))
        .reverse()
        .forEach(x => {
            x.remove();
            discussion.appendChild(x);
        });

    // Reverse groups of items within a timeline item
    Array.from(document.querySelectorAll('.js-timeline-item'))
        .forEach(timelineItem => reverseChildren(timelineItem));

    // Reverse groups of commits
    const commitGroups = Array.from(document.querySelectorAll('[id^="commits-pushed"]'))
        .map(x => x.parentNode);
    commitGroups.forEach(commitGroup => {
        reverseChildren(commitGroup);
        reverseChildren(commitGroup.firstElementChild);
    });

    // Shimmy up that comment box
    const cb = document.querySelector('#issue-comment-box');
    cb.remove();
    cb.classList.add('bootleg-comment-box');
    discussion.insertBefore(cb, document.querySelector('.js-timeline-marker'));

    // Remove protips
    cb.querySelector('.protip').remove();
    cb.querySelector('.text-small').remove();

    // Remove 'Attach files' hint
    cb.querySelector('.hx_drag-and-drop').remove();
})();