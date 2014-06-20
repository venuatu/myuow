"use strict";

angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition'])

  .directive('collapse', ['$transition', '$interval', function ($transition, $interval) {

    return {
      link: function (scope, element, attrs) {

        var initialAnimSkip = false;
        var currentTransition;
        var currentInterval;
        var startExpand;

        collapseDone();

        function doTransition(change) {
          var newTransition = $transition(element, change);
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

            currentInterval = $interval(watchHeight, 1000 / 20, 5 * 20, false);
          }
        }

        function expandDone() {
          element.removeClass('collapsing');
          element.addClass('collapse in');
          //element.css({height: 'auto'});
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

            $interval.cancel(currentInterval);
            currentInterval = undefined;
          }
        }

        function collapseDone() {
          element.removeClass('collapsing');
          element.addClass('collapse');
        }

        function watchHeight() {
          startExpand = startExpand || Date.now();
          if (element[0].style.height === 'auto' || (Date.now() - startExpand) > 5000) {
            element[0].style.height = 'auto';
            $interval.cancel(currentInterval);
            currentInterval = startExpand = undefined;
          } else if (element[0].scrollHeight > parseInt(element[0].style.height, 10)) {
            element.removeClass('collapse').addClass('collapsing');
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