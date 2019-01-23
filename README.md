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

## Running Tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.

## Building

If you want to create a build, use the node module gulp