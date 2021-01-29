#version 300 es

in vec3 position;
in vec4 inputColor;
out vec4 fcolor;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 offsetArray[3];
uniform vec4 colorArray[3];
uniform float time;

void main()
{
    mat4 instanceModelMatrix = modelMatrix;
    // colomn 3 (not raw !) is the translational component
    // modify it according to each instance
    instanceModelMatrix[3] = vec4(offsetArray[gl_InstanceID], 1);
    gl_Position = projectionMatrix * viewMatrix * instanceModelMatrix * vec4(position , 1.0);
    fcolor = inputColor;
    fcolor = vec4(colorArray[gl_InstanceID].x,
                  colorArray[gl_InstanceID].y * cos(time),
                  colorArray[gl_InstanceID].z,
                  1) ;
}

