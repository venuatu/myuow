"use strict";

angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition'])

  .directive('collapse', ['$transition', '$interval', function ($transition, $interval) {

    return {
      link: function (scope, element, attrs) {

        var initialAnimSkip = false;
        var currentTransition;
        var currentInterval;
        var observer;
        var animateHeight;

        collapseDone();

        if (window.MutationObserver) {
          observer = new MutationObserver(function(mutations) {
            if (_.any(mutations, function (mutation) {return mutation.target !== element[0];})) {
              watchHeight();
            }
          });
        }

        function doTransition(change) {
          var newTransition = $transition(element, change);
          animateHeight = parseInt(change.height, 10);
          if (currentTransition) {
            currentTransition.cancel();
          }
          currentTransition = newTransition;
          newTransition.then(newTransitionDone, newTransitionDone);
          return newTransition;

          function newTransitionDone() {
            // Make sure it's this transition, otherwise, leave it alone.
            if (currentTransition === newTransition) {
              currentTransition = undefined;
            }
          }
        }

        function expand() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            expandDone();
          } else {
            element.removeClass('collapse').addClass('collapsing');
            doTransition({ height: element[0].scrollHeight + 'px' }).then(expandDone);

            startExpand = Date.now();
            if (observer) {
              observer.observe(element[0], {
                childList: false, attributes: true, characterData: true, subtree: true
              });
            } else {
              currentInterval = $interval(watchHeight, 1000 / 15, 0, false);
            }
          }
        }

        function expandDone() {
          element.removeClass('collapsing');
          element.addClass('collapse in');
          element.css({height: 'auto'});
        }

        function collapse() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            collapseDone();
            element.css({height: 0});
          } else {
            // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
            element.css({ height: element[0].scrollHeight + 'px' });
            //trigger reflow so a browser realizes that height was updated from auto to a specific value
            var x = element[0].offsetWidth;

            element.removeClass('collapse in').addClass('collapsing');

            doTransition({ height: 0 }).then(collapseDone);

            if (observer) {
              observer.disconnect();
            } else {
              $interval.cancel(currentInterval);
              currentInterval = undefined;
            }
          }
        }

        function collapseDone() {
          element.removeClass('collapsing');
          element.addClass('collapse');
        }

        function watchHeight() {
          if (element[0].scrollHeight > animateHeight) {
            element.removeClass('collapse').addClass('collapsing').css({height: animateHeight + 'px'});
            var x = element[0].offsetWidth;
            doTransition({ height: element[0].scrollHeight + 'px' }).then(expandDone);
          }
        }

        scope.$watch(attrs.collapse, function (shouldCollapse) {
          if (shouldCollapse) {
            collapse();
          } else {
            expand();
          }
        });
      }
    };
  }]);