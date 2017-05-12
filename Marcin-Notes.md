# How does nextprot-elements work currently

## Build
In the UI, nextprot-elements are loaded with this script:
https://github.com/calipho-sib/nextprot-ui/blob/develop/app/js/np.elements-import.js
(Javascript instead of HTML import because otherwise we had missing dependencies)

Currently nextprot-elements are built in the UI using this script:
https://github.com/calipho-sib/nextprot-ui/blob/develop/gulpfile.js#L11

In the long term, nextprot-elements should be built in the nextprot-elements project itself (maybe using jenkins ). Then on the UI we just specify the dependency in bower and add the new

### Vulconize ->  polymer-bundler should be improved
Should find another version where CSS should be minimized.
Be careful that some tools make static spaces disappear and may have consequences on the display!

### Polymer 2.0 ?
Too early... (may need a few months to migrate)

### CSS encapsulation
3 type of variables:
* CSS only element (encapsulated) CSS variables (deep or child selector do not work). Should see CSS variables.


```html
Put the CSS in the shadown dom of the element.
<dom-module id="paginator-element">
  <template>
    <style is="custom-style">
     put your css here
     
Or import
<link rel="import" href="../../iron-demo-helpers/demo-pages-shared-styles.html">
    <style is="custom-style" include="demo-pages-shared-styles">
```

If your style needs to be shared among components you can import a file and also export CSS files
```html
In general is enough to put on the shared
nextprot-elements-shared-styles.html (shared styles)

<dom-module id="nextprot-elements-shared-styles">
    <link rel="import" type="css" href="../bootstrap/dist/css/bootstrap.min.css">
```

User variables are useful if you want just to apply style 2 or 3 elements.
:host (to the same tree) :root (exposed to all the DOMs)
```
<style is="custom-style">
    :root {
        --publication-item-border-bottom: 1px solid #E7EAEC;
:host {
    border-bottom: var(--publication-item-border-bottom);
  }
border-bottom: var(--publication-item-border-bottom);
```

## Web Animation Standards

```html
<link rel="import" href="../neon-animation/animations/fade-out-animation.html">
...
 behaviors: [Polymer.NeonAnimationRunnerBehavior]
... 
 "hideAbstract": 
 {
    name: "fade-out-animation",
    node: this.$.collapseAbstract,
    timing: {
          duration: 200
    }
```

### 2 way binding vs 1 way 
Use 1 way binding as a preference (squared brackets).
Use 2 ways binding only in case you need to notify other elements about some changes (curly brackets) 
```
  <xrefs-section categories='["GuidetoPHARMACOLOGY", "SwissLipids", "BioCyc", "BRENDA", "SABIO-RK", "CAZy", "ESTHER", "MEROPS", "MoonProt", "PeroxiBase", "REBASE", "SFLD", "GeneWiki", "GenomeRNAi", "PRO"]'
                       nx-config="[[nxConfig]]" count="{{xrefsCount}}">
        </xrefs-section>
```

When we see in the code observer, it could mean that this element is listening to this variablt and this variable is 2 way binded.
```
xrefsCount: {
      type: Number,
      observer: "_checkXrefs"
}
REFINE ---------------
```

### State and URL change
As a convention we decided that when we need to change the state and URL (example Isoform / Gold Only tag) we change first the URL and then the element will be rendered with the correct new nxConfig. (calling the API again) 
The way URL is correctly changed is a bit ugly (but allows for not full refresh):
TODO: This method should be generalized

```html
angular.element(document.getElementById("main")).scope().$apply(angular.element(document.getElementById("main")).injector().get('$location').search('isoform', this.isoName));
```

### Naming convention of elements
- view (all page ex: medical-view, function-view). There is only ONE SINGLE view per page.
- section (involves some logic and include API calls)
- item (particular component of a view that repeats)

### Overall experience
Not very much mature yet, but nice way to organise the code. (let's see about its future)
Works on Chrome, Firefox (Polyfills), Safari (Polyfills), Edge (Polyfills)

### Resources / Troubleshooting Forums
- Community is quite active
- https://polymer.slack.com 
- https://www.webcomponents.org/
