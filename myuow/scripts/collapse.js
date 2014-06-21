"use strict";

angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition'])

  .directive('collapse', ['$transition', function ($transition) {

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
            var childMutated = false;
            angular.forEach(mutations, function (mutation)  {
              if (mutation.target !== element[0]) childMutated = true;
            });
            if (childMutated && element[0].scrollHeight > animateHeight) {
              element.css({height: animateHeight + 'px'});
              var x = element[0].offsetWidth;// trigger reflow
              expand();
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

            if (observer) {
              observer.disconnect();
              observer.observe(element[0], {
                childList: false, attributes: true, characterData: true, subtree: true
              });
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
            if (observer) {
              observer.disconnect();
            }
            // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
            element.css({ height: element[0].scrollHeight + 'px' });
            //trigger reflow so a browser realizes that height was updated from auto to a specific value
            var x = element[0].offsetWidth;

            element.removeClass('collapse in').addClass('collapsing');

            doTransition({ height: 0 }).then(collapseDone);
          }
        }

        function collapseDone() {
          element.removeClass('collapsing');
          element.addClass('collapse');
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