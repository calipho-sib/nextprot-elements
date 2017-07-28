# Ancestor Graph
The **Ancestor Graph** is a polymer element which uses [viz.js](https://github.com/mdaines/viz.js/) ([GraphViz](http://www.graphviz.org) in JavaScript). It can be used to represent Directed Acyclic Graphs (DAG), such as gene ontologies. 

It was built by [Leonardo Castorina](https://github.com/universvm) specifically for [NeXtProt](https://www.nextprot.org) in July 2017. 


## 1 - How to install:

There are three main elements to import:

* **Viz.js** as a bower component using
  
	`bower install viz.js`


* **Iron-Ajax** for the API calls (bower component)
  
	`bower install iron-ajax`
	
* **SVG-pan-zoom** for the graph zoom. This must be imported either from a local file, or from: 
  
	`http://ariutta.github.io/svg-pan-zoom/dist/svg-pan-zoom.min.js`


## 2 - How it works (general):
 
 An **Accession Number** is given as a a property `accessionInput` to **`ancestor-graph-view`**. This is connected to an **observer** which calls the function `APIcaller`. 
 
For more information about properties and functions check section **7-Properties and Functions**. 
 
 The API Call is performed and once a response is received, the `ancestorBuild` function calls the subfunctions:
 
 * `nodesDotBuild` which takes the nodes from the API response as an argument and translates them in [Dot Language](http://www.graphviz.org/content/dot-language).
 
 * `edgesDotBuild` which is homologous to `nodesDotBuild`, although it translates the edges.
 

Then, the Dot-translated nodes and edges are added to the property `dotGraph` in which other properties such as font size, direction, spline, are considered. 

`dotGraph` is given to **`graph-section`** via the property `dotdata` like this:
` <graph-section dotdata="[[dotGraph]]"></graph-section>`
 

**`graph-section`** imports viz.js and uses the function `Viz(dotdata)` to translate the data in SVG. SVG-pan-zoom is used to add the zoom buttons in the bottom right corner.


## 3 - Interactive Demo:
![Interactive Demo](http://i.imgur.com/RLT5vUx.png) 

The interactive demo contains options to customize the ancestor graph. They are divided in three sections: **Data, Graph Style and Graph Layout**.

* **Data** allows you to select sample cases such as `TS-0079` or input your preferred accession number.

* **Graph Style** changes the graphical look of the graph.

* **Graph Layout** affects the way the terms and/or semantic relationship is displayed. 

These options affect properties in **`ancestor-graph-view`**, so once the preferred property is found it can be changed in the default value.

## 4 - Why viz.js:
Before choosing viz.js, we tried various libraries, however only few of them were able to produce DAG. I made a comparison table between the few candidates. 

The main feature that made us choose viz.js over other candidates is the way the algorithm produces the Graph Layout. Refer to the following table: 

 
 ![Comparison Table](http://i.imgur.com/nqcfvga.png) 

 
 For more information, consider looking at the Power Point presentation.  

## 5 - Term Overview Section:

 ![Term Overview Section](http://i.imgur.com/kVymONg.png) 

This section is very simple as it does not take all the arguments from a different API call as it was still experimental. In the future, it needs to take the style from the common NeXtProt styles and include other fields of information.

## 6 - Additional Comments:

 The subgrahs level option is very experimental. In the future it could be used to filter the semantic relationship by showing specific levels only. For example, Level 0 (root) -> Level 5, which would simplify large cases like `GO:0007256` (Activation of JNKK activity).

The **`ancestor-graph-view`** properties contain observers. These were used for the demo, thus remove them before actual use.
 
## 7 - Properties and Functions:

**Properties**:

|Property|Use|
|---|---|
|accessionInput|Contains the accession number used in the API call.|
|arrowInput|Controls the size of the arrow.|
|fontInput|Controls font size.|
|splineInput|Controls the algorithm used by viz.js|
|maxWidth|Fixes the maximum width of the graph.|
|dotGraph|Contains the graph translated in dot format. It is given to `**graph-section**` via `dotdata`|
|graphOrientation|Controls the orientation of the graph (eg. Horizontal, vertical …)|
|nodeShape|Controls the shape of the node (eg. rectangle, ellipse…)|
|regex|Controls the way the text fits inside the boxes. (uses and if else due to the complexity of using variables in regex expressions)|
|subgraphDistance|Toggles whether to group nodes by distance. The distance is contained in an array of arrays `nodeDistance`, with the accession numbers at a specific distance (level) of the graph. The index in the first array specifies the level.<br><br>    For example, `subgraphDistanceArray[1]` represents all the accession numbers at level 1. <br>Level 0 represents the root of the graph.|

**Functions**:

|Function|Use|
|---|---|
|APIcaller|Performs the API call using accessionInput as a parameter.|
|ancestorBuild|Takes the API response and produces the dot graph. It also calls `edgesDotBuild`, `nodesDotBuild`, `nodeDistancer`.|
|nodesDotBuild|Takes the API nodes as an argument. It then produces nodes in dot language. It calls `getNodeColor`.|
|edgesDotBuild|Takes the API edges as an argument. It then produces edges in dot language. |
|nodeDistancer|Takes the API response and produces the array in with distances. It then calls `getSubgraphs`.|
|getSubgraphs|Loops throught the distance arrays and produces subgraphs in dot format. |
|getNodeColor|If/else to fill the nodes either with white or green. (Level 0 is highlighted in green)  |
