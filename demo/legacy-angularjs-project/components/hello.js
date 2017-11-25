angular.module('hello').component('hello', {
  resolve: {
    // Constant title
    $title: function() {
      return 'Hello'
    }
  },
  template:
    '<h3>{{$ctrl.greeting}} galaxy!</h3>' +
    '<button ng-click="$ctrl.toggleGreeting()">toggle greeting</button>',

  controller: [
    '$rootScope',
    function($rootScope) {
      this.greeting = 'hello'

      this.toggleGreeting = function() {
        this.greeting =
          this.greeting == 'hello' ? 'whats up' + $rootScope.$title : 'hello'
      }
    }
  ]
})
