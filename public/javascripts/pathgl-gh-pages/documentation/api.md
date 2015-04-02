## API Reference

####pathgl.context()
> returns the WebGL context, or null if webgl was not available

####pathgl.uniform(name, [value])
> Set a variable that is global to all shader contexts.
> If called without a value, will return previously set value.
> Default uniforms include mouse, resolution, and clock.

####pathgl.applyCSSRules()
> Parses all css rules on the page and applies them to all webgl context.

####pathgl.texture(image, options)
> Loads an image into video memory and returns a reference which can be bound
> to the attribute of any selection.
> Image can be an image or video DOMelement, image or video url, typed array, a
> fragment shader, or a canvas element.

####texture.update()
> Resamples the source data and rewrites the contents of the texture, if needed.

####texture.repeat()
> Calls texture.update on every frame until stop is called.

####texture.stop()
> Calls texture.update on every frame until stop is called.

####texture.unwrap()
> generates an array of objects that contain coordinates
> can be used to join a texture to a selection

####texture.pipe(destinationTexture)
> Pulls the data out of a texture, and writes it to the supplied destination.
