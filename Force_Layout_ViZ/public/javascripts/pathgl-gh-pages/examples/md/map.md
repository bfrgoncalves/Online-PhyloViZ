This is a bubble map of historical events scraped from wikipedia. When displaying a
slice of a large data set, it can be more efficient  to dump all points onto the screen and
then hide the data outside the selection using a shader. This allows the animation
to happen entirely on the gpu, freeing up the UI thread to handle user input.
Updating large selections in javascript would cause the UI to feel sluggish, and add
lag to the user's touch and mouse events. 
