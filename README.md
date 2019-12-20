# \<nextprot-elements\>


## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed. 
(ex: ```npm install -g polymer-cli@1.5.4.```)

Then run `bower install` to install all dependencies defined in `bower.json`.

## Viewing Your Application

Serving your application locally.

```
$ polymer serve
```

NOTE: In order to run elements locally, you have to uncomment the following lines from the external-scripts.html file.
These dependencies are not required in the production, when integrated into nextprot UI.

```
    <script src="../nextprot/src/nextprot-core.js"></script>
    <script src="../nextprot/src/nextprot-utils.js"></script>
    <script src="../d3/d3.min.js"></script>
    <script src="../feature-viewer/dist/feature-viewer.min.js"></script>
    <script src="../sequence-viewer/dist/sequence-viewer.min.js"></script>
    <script src="../jquery/dist/jquery.js"></script>
    <script src="../bootstrap/dist/js/bootstrap.js"></script>
```

NOTE: Same for nextprot-elements-shared-styles.html:
```
    <link rel="stylesheet" href="../bootstrap/dist/css/bootstrap.css">
    <link rel="stylesheet" href="../font-awesome/css/font-awesome.min.css">
```

## Running Tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.

## Building

If you want to create a build, use the node module gulp