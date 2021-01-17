#version 300 es

in vec4 pos;
in vec4 color;
out vec4 fcolor;

void main()
{
    gl_Position = pos;
    fcolor = color;
}

