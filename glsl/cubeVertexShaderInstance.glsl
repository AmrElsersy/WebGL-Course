#version 300 es

in vec3 position;
in vec4 inputColor;
out vec4 fcolor;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 offsetArray[3];
uniform vec4 colorArray[3];

void main()
{
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position + offsetArray[gl_InstanceID] , 1.0);
    fcolor = inputColor;
    fcolor = colorArray[gl_InstanceID];
}

