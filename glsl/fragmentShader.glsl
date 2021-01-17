#version 300 es
// fragment shader has not a percision so specify one
precision mediump float;

// in/out attribute buffers data
in vec4 fcolor;
out vec4 out_fcolor;

void main()
{   
    out_fcolor =fcolor;
}