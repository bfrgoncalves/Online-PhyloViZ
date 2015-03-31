Pathgl implements a scenegraph with svg semantics.
Documented here is a list of discrepancies between the pathGL virtualDOM
and the [SVG 1.1 Specification](http://www.w3.org/TR/SVG/).
Expect this list to get shorter and eventually disappear completely.

* Document Structure
  > defs are not yet implemented.
  > descriptions and symbols are not yet implemented
  > use, image, and switch elements are not yet implemented
* Styling
  > styling is not currently supported except via `pathgl.applyCSSRules()`
* Coordinate Systems, Transformations and Units
  > numeric attributes must have a value equal to or greater than zero.
  > transform attributes are not yet implemented
* Paths
  > curve, cubic bezier, quadratic bezier, and elliptical arc commands are not yet
  > implemented.
* Basic Shapes
  > polyline and polygon elements are not yet implemented
* Text
  > text is not yet implemented
* Painting: Filling, Stroking and Marker Symbols
  > marker symbols are not yet implemented
  > rendering hints are not yet implemented
* Color
  > color profiles are not yet implemented
* Gradients and Patterns
> gradients and patterns are not yet implemented
* Clipping, Masking and Compositing
  > clipping and masking are not yet implemented
* Filter Effects
  > filter effects are not yet implemented
* Interactivity
  > pointer-events are not stylable yet
  > cursor property is not yet implemented
* Linking
  > linking is not yet implemented
* Scripting
  > eventlisteners must be added with the AddEventListener method. eventListeners
  > cannot be defined as attributes such as "onclick"
* Animation
  > animation attributes are not yet implemented
* Extensibility
  > foreign namespaces and private data are not yet implemented
* Metadata
  > Metadata elements are not yet implemented
