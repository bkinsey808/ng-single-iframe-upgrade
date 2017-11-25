'use strict'

function inIframe() {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

function parseURL(url) {
  var parser = document.createElement('a'),
    searchObject = {},
    queries,
    split,
    i
  // Let the browser do the work
  parser.href = url
  // Convert query string to object
  queries = parser.search.replace(/^\?/, '').split('&')
  for (i = 0; i < queries.length; i++) {
    split = queries[i].split('=')
    searchObject[split[0]] = split[1]
  }
  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    searchObject: searchObject,
    hash: parser.hash
  }
}

function getStateAndParams($state, url) {
  //remove ng1 before performing any match
  url = url.replace('ng1/', '')
  var parseUrl = parseURL(url)
  var queryParams = parseURL.searchObject
  var matchedRoute
  angular.forEach($state.get(), function(state) {
    if (!matchedRoute) {
      var privatePortion = state.$$state()
      if (privatePortion.url) {
        var match = privatePortion.url.exec(url, queryParams)
        if (match) {
          matchedRoute = [state.name, match]
        }
      }
    }
  })

  if (matchedRoute) {
    return matchedRoute
  } else {
    return false
  }
}

var fromModern = true

var myApp = angular.module('hello', ['ui.router', 'ui.router.title'])

myApp.config(function($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true)

  // An array of state definitions
  var states = [
    {
      name: 'hello',
      url: '/hello',
      component: 'hello',
      resolve: {
        // Constant title
        $title: function() {
          return 'Hello'
        }
      }
    },
    {
      name: 'about',
      url: '/about',
      component: 'about',
      resolve: {
        // Constant title
        $title: function() {
          return 'About'
        }
      }
    },

    {
      name: 'people',
      url: '/people',
      component: 'people',
      resolve: {
        people: function(PeopleService) {
          return PeopleService.getAllPeople()
        },
        $title: function() {
          return 'People'
        }
      }
    },

    {
      name: 'people.person',
      url: '/{personId}',
      component: 'person',
      resolve: {
        person: function(people, $stateParams) {
          return people.find(function(person) {
            return person.id === $stateParams.personId
          })
        }
      }
    }
  ]

  // Loop over the state definitions and register them
  states.forEach(function(state) {
    $stateProvider.state(state)
  })
})

myApp.run([
  '$http',
  '$uiRouter',
  '$transitions',
  '$state',
  'RouterService',
  function($http, $uiRouter, $transitions, $state, RouterService) {
    var Visualizer = window['ui-router-visualizer'].Visualizer
    $uiRouter.plugin(Visualizer)
    $http.get('data/people.json', { cache: true })

    // titles from legacy
    $transitions.onStart({}, function(trans) {
      console.log('tran on start')
      if (inIframe() && !fromModern) {
        console.log('trans', trans)
        console.log('posting message', trans.to(), trans.to().$$state())
        console.log('params', trans.to().$$state().params)
        console.log('p1', trans.params('to'))
        const url = $state.href(trans.to().$$state().name, trans.params('to'))
        console.log(url)
        window.parent.postMessage(
          {
            type: 'urlBlocked',
            data: {
              url
            }
          },
          '*'
        )
        console.log('blocked')
        return false
      }
      trans.promise.then(function() {
        var title = trans.injector().get('$title')
        if (inIframe()) {
          window.parent.postMessage(
            {
              type: 'changeTitle',
              data: { title: title }
            },
            '*'
          )
          return
        }
      })
    })

    $transitions.onSuccess({}, function(trans) {
      console.log('url: ', $state.href(trans.to()))
      fromModern = false
    })

    window.addEventListener('message', function(event) {
      console.log(event)
      if (!event.data || !event.data.changeUrl) {
        return
      }

      var parseUrl = parseURL(event.data.changeUrl)
      var pathnameParts = parseUrl.pathname.split('/').filter(function(part) {
        return part !== '' && part !== 'ng1'
      })

      fromModern = true

      var stateAndParams = getStateAndParams($state, event.data.changeUrl)
      if (stateAndParams) {
        var state = stateAndParams[0]
        var params = stateAndParams[1]
        RouterService.go(state, params)
      } else {
        var a = document.createElement('a')
        a.href = event.data.changeUrl
        document.body.appendChild(a) // necessary to navigate to the url without refreshing
        a.click()
        a.remove() // IE 11 requires a polyfill
      }
    })
  }
])
