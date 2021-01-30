#version 300 es
// fragment shader has not a percision so specify one
precision mediump float;

// in/out attribute buffers data
in vec4 fcolor;
out vec4 out_fcolor;

uniform vec3 ambientLight;

void main()
{   
    float ambientIntensity = 0.1;
    out_fcolor = vec4(vec3(0,0,1) * ambientIntensity * vec3(ambientLight), 1);
}