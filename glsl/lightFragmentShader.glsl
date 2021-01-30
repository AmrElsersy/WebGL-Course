#version 300 es
// fragment shader has not a percision so specify one
precision mediump float;


uniform vec3 color;
out vec4 out_fcolor;

void main()
{   
    out_fcolor = vec4(color, 1);
}