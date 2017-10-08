# ng-single-iframe-upgrade
[![Build Status](https://travis-ci.org/bkinsey808/ng-single-iframe-upgrade.svg?branch=master)](https://travis-ci.org/bkinsey808/ng-single-iframe-upgrade)
>Upgrade your AngularJS app to Angular the easy way: just put your legacy app in an iframe!

This technique was inspired by https://github.com/jawache/alt-angularjs-migration-using-iframes-demo by Asim Hussein and a lot of what he says are advantages for using his project should also apply to this project as well. But that project has a big perf problem if your AngularJS app is slow to bootstrap. Each legacy route change in that project causes the iframe to refresh. This project in contrast keeps the iframe always open, and visible or not depending on the route.

ng-single-iframe-upgrade is appropriate if you don't feel like refactoring your AngularJS code (or can't for various reasons including third party libs that don't exists in Angular), and you would rather just let it be. 
This is sort of the opposite of the ngUpgrade slow refactoring approach, where you have to port your code to typescript, make it componentized, etc, and then figure out how to get Angular components inside AngularJS components and vice versa. This approach does not do that. You are either in an AngularJS legacy route, or you are in a modern Angular route, and that determines whether the iframe is visible or not. 

While ngUpgrade might be appropriate in some cases, as for me, I found the ngUpgrade very technically challenging, and also a bit demoralizing considering I was spending so much time refactoring legacy AngularJS code rather than working right away with Angular 4. Hopefully ng-single-iframe-upgrade makes it easier to get started building your new routes with real Angular sooner, without breaking your old legacy AngularJS routes, also allow you to update an entire AngularJS route to Angular all at once rather than going through complex and potentially bug-causing refactoring stages or steps. At least that's the goal.

ng-single-iframe-upgrade works very well with AngularJS apps that are slow to bootstrap/initialize, that was my initial reason for developing it. For the most part, the AngularJS app only has to bootstrap once, so using it is as fast and responsive as if it were not in an iframe. Ideally your users will never know!

Of course there are challenges with this approach. Navigating within the iframe should update the browser url.
I solve this with AngularJS communicating to the parent Angular via postMessage. Opening a link within the AngularJS app to a new tab should work. I solve this by having AngularJS detect that is is not in an iframe and change the location so it can be routed by Angular. Clicking on links to the legacy app in Angular should have the AngularJS app in the iframe jump to those links without re-bootstrapping the AngularJS app. I solve this by having the parent Angular postMessage to the AngularJS in the iframe. Because if I just set the iframe src url, then AngularJS would have to re-bootstrap. Another challenge is keeping the iframe sized so scrolling works ok. I solve this, sadly, by polling. 

This library contains a component and a service to be able to interact with your legacy
AngularJS app from within your Angular app.

This project is alpha quality, and very experimental. I hope to put it into production eventually, but have not yet. I am open to ideas for how this technique could be improved. Let me know, thanks!

An example that demonstrates this project is under development.

Requires **Angular 4+** 

Get the [Changelog](https://github.com/bkinsey808/ng-single-iframe-upgrade/blob/master/CHANGELOG.md).

The structure of this project is very closely derived from https://github.com/robisim74/angular-library-starter by Roberto Simonetti.

## Contents
* [1 Project structure](#1)
* [2 Using the library](#7)
* [3 What it is important to know](#8)

## <a name="1"></a>1 Project structure
- Library:
    - **src** folder for the classes
    - **public_api.ts** entry point for all public APIs of the package
    - **package.json** _npm_ options
    - **rollup.config.js** _Rollup_ configuration for building the bundles
    - **tsconfig-build.json** _ngc_ compiler options for _AoT compilation_
    - **build.js** building process using _ShellJS_
- Testing:
    - **tests** folder for unit & integration tests
    - **karma.conf.js** _Karma_ configuration that uses _webpack_ to build the tests
    - **spec.bundle.js** defines the files used by _webpack_
- Extra:
    - **tslint.json** _TypeScript_ linter rules with _Codelyzer_
    - **travis.yml** _Travis CI_ configuration

## <a name="2"></a>2 Using the library
### Installing
```Shell
npm install ng-single-iframe-upgrade --save 
```
### Loading
#### Using SystemJS configuration
```JavaScript
System.config({
    map: {
        'ng-single-iframe-upgrade': 'node_modules/ng-single-iframe-upgrade/bundles/ng-single-iframe-upgrade.umd.js'
    }
});
```
#### Angular-CLI
No need to set up anything, just import it in your code.
#### Rollup or webpack
No need to set up anything, just import it in your code.
#### Plain JavaScript
Include the `umd` bundle in your `index.html`:
```Html
<script src="node_modules/ng-single-iframe-upgrade/bundles/ng-single-iframe-upgrade.umd.js"></script>
```
and use global `ng.ngSingleIframeUpgrade` namespace.

### AoT compilation
The library is compatible with _AoT compilation_.

### Angular Modifications
See examaple project

### AngularJS Modifications
See example project

## <a name="3"></a>3 What it is important to know
1. `package.json`

    * `"main": "./bundles/ng-single-iframe-upgrade.umd.js"` legacy module format 
    * `"module": "./bundles/ng-single-iframe-upgrade.es5.js"` flat _ES_ module, for using module bundlers such as _Rollup_ or _webpack_: 
    [package module](https://github.com/rollup/rollup/wiki/pkg.module)
    * `"es2015": "./bundles/ng-single-iframe-upgrade.js"` _ES2015_ flat _ESM_ format, experimental _ES2015_ build
    * `"peerDependencies"` the packages and their versions required by the library when it will be installed

2. Server-side prerendering

    This library should be compatible with server-side prerendering:
    * `window`, `document`, `navigator` and other browser types do not exist on the server
    * doesn't manipulate the _nativeElement_ directly

## License
MIT
