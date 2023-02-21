// ==UserScript==
// @name         Cromulent GitHub PRs
// @namespace    https://github.com/emereum/tampermonkey-scripts
// @updateURL    https://raw.githubusercontent.com/emereum/tampermonkey-scripts/main/github-cromulent-prs.user.js
// @downloadURL  https://raw.githubusercontent.com/emereum/tampermonkey-scripts/main/github-cromulent-prs.user.js
// @version      0.4
// @description  Reverses the discussion order in GitHub PRs.
// @author       emereum
// @match        https://github.com/*/*/pull/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const reverseChildren = (el) => el.append(...Array.from(el.childNodes).reverse());
    const addStyle = (styles) => {
        const el = Object.assign(document.createElement('style'), {
            innerHTML: styles
        });
        document.head.appendChild(el);
    }

    addStyle(`
      @media (min-width: 768px) {
        .bootleg-comment-box {
          margin-left: -56px;
        }
      }
      .Details-content--closed {
        display: none;
      }
    `);

    // Reverse the discussion
    const discussion = document.querySelector('.js-discussion');
    Array.from(document.querySelectorAll('.js-timeline-item'))
        .reverse()
        .forEach(x => {
            x.remove();
            x.classList.add('can-reverse-header');
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

    // Move the title bar of each comment to the bottom of the comment
    Array.from(document.querySelectorAll('.can-reverse-header .timeline-comment'))
        .forEach(comment => {
        const header = comment.firstElementChild;
        header.remove();
        comment.appendChild(header);
    });

    // Only re-style the comment header box if we haven't blown up yet
    addStyle(`
      .can-reverse-header .timeline-comment-header {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
      }
      .can-reverse-header .TimelineItem-avatar {
        bottom: 16px;
      }
      .can-reverse-header .timeline-comment--caret::after,
      .can-reverse-header .timeline-comment--caret::before,
      .can-reverse-header .timeline-comment--caret.current-user::after,
      .can-reverse-header .timeline-comment--caret.current-user::before {
        top: inherit;
        bottom: 11px;
      }
    `);

    const commentMutators = [
        {
            description: 'Summarise buildkite failures into their header',
            condition: (links, body) =>
                links.length === 2
                && links.filter(x => x.href.includes('buildkite.com')).length === 2
                && body.includes('failed'),
            mutateHeader: (headerEl, links) => {
                headerEl.innerHTML = '';
                headerEl.classList.remove('text-italic');
                headerEl.append('🔥 ', links[0], ' at step ', links[1]);
            },
            mutateTimelineItem: (el) => el.classList.add('ci-control-comment'),
            mutateBody: (el) => el.remove(),
        },
        {
            description: 'Summarise buildkite requests into their header',
            condition: (links, body) =>
                links.length === 2
                && links[0].href.includes('github.com')
                && links[1].href.includes('buildkite.com')
                && body.includes('scheduled'),
            mutateHeader: (headerEl, links) => {
                headerEl.innerHTML = '';
                headerEl.classList.remove('text-italic');
                headerEl.append('🙏 ', links[1], ' for ', links[0]);
            },
            mutateTimelineItem: (el) => el.classList.add('ci-control-comment'),
            mutateBody: (el) => el.remove(),
        }
    ]

    // Crunch comments if they look like they are from a BuildKite bot
    Array.from(document.querySelectorAll('.timeline-comment-group'))
        .map(x => ({
            timelineItem: x.parentNode.parentNode,
            links: Array.from(x.querySelector('.comment-body.markdown-body').querySelectorAll('a')),
            body: x.querySelector('.comment-body.markdown-body').textContent,
            bodyEl: x.querySelector('.comment-body.markdown-body'),
            headerEl: (x.querySelector('.timeline-comment-header') ?? x.querySelector('summary')).querySelector('h3'),
         }))
         .filter(x => x.headerEl != null)
         .forEach(x => {
             const clonedLinks = x.links.map(x => x.cloneNode(true));
             commentMutators
                 .filter(mutator => mutator.condition(clonedLinks, x.body))
                 .forEach(mutator => {
                     mutator.mutateHeader?.(x.headerEl, clonedLinks);
                     mutator.mutateTimelineItem?.(x.timelineItem);
                     mutator.mutateBody?.(x.bodyEl);
                 });
         });

    addStyle(`
      .ci-control-comment + .ci-control-comment {
          margin-top: -30px;
      }

      .ci-control-comment + .ci-control-comment .TimelineItem::before {
          background-color: inherit;
      }
    `);
})();






