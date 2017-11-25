angular.module('hello').service('RouterService', function($state) {
  this.go = function(path, params, options) {
    options = this.getOptions(options)
    return $state.go(path, params, options)
  }

  this.getOptions = function(options) {
    if (!options) {
      options = {}
    }
    if (inIframe()) {
      options.location = 'replace'
    }
    return options
  }

  this.getJsonOptions = function(options) {
    return JSON.stringify(this.getOptions(options))
  }
})
