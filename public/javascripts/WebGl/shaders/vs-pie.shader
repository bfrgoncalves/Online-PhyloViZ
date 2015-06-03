attribute vec2 a_vertexPos;
attribute vec2 a_customAttributes;
uniform vec2 u_screenSize;
uniform mat4 u_transform;
varying vec4 color;

void main(void) {
   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0, 1);
   gl_PointSize = a_customAttributes[1] * u_transform[0][0];
   color = vec4(0, 0, 1, 1);
}