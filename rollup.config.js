import resolve from 'rollup-plugin-node-resolve';

// Add here external dependencies that actually you use.
const globals = {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    'rxjs/Observable': 'Rx',
    'rxjs/BehaviorSubject': 'Rx',
    'rxjs/Subject': 'Rx',
    'rxjs/Observer': 'Rx',
    'rxjs/add/operator/map': 'Rx',
    'rxjs/operator/map': 'Rx',
    'rxjs/operator/concatAll': 'Rx',
    'rxjs/operator/filter': 'Rx',
    'rxjs/operator/first': 'Rx',
    'rxjs/operator/last': 'Rx',
    'rxjs/operator/mergeAll': 'Rx',
    'rxjs/operator/concatMap': 'Rx',
    'rxjs/operator/every': 'Rx',
    'rxjs/operator/_catch': 'Rx',
    'rxjs/operator/catch': 'Rx',
    'rxjs/operator/mergeMap': 'Rx',
    'rxjs/operator/reduce': 'Rx',
    'rxjs/observable/from': 'Rx',
    'rxjs/observable/of': 'Rx',
    'rxjs/observable/fromPromise': 'Rx',
    'rxjs/observable/interval': 'Rx',
    'rxjs/util/EmptyError': 'Rx'
};

export default {
    entry: './dist/modules/ng-single-iframe-upgrade.es5.js',
    dest: './dist/bundles/ng-single-iframe-upgrade.umd.js',
    format: 'umd',
    exports: 'named',
    moduleName: 'ng.ngSingleIframeUpgrade',
    plugins: [resolve()],
    external: Object.keys(globals),
    globals: globals,
    onwarn: () => { return }
}
