# Notes on ImageMapster.js

The original creator's [repo](https://github.com/jamietre/ImageMapster) has a JavaScript eval() in the [imageMapster.js](https://github.com/jamietre/ImageMapster/blob/main/dist/jquery.imagemapster.js) in a test code. To remove this, we have followed the following steps:

- Remove the lines that use eval() in the [imageMapster.js](https://github.com/jamietre/ImageMapster/blob/2e6f0eaf9093b4407dffb84ef8bebf0769802d38/dist/jquery.imagemapster.js#L1325-L1327).
- Used an [online tool](https://www.toptal.com/developers/javascript-minifier) to minify the code.
