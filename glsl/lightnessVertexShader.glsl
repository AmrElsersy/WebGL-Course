#version 300 es

in vec3 position;
in vec3 normal;
in vec4 color;

out vec4 vertexWorldPosition;
out vec3 vertexNormal;
out vec4 fcolor;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main()
{
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position , 1.0);

    // world position to compute the vector from the vertex to light
    vertexWorldPosition = modelMatrix * vec4(position,1.0);

    // vertex normal will be rotated if the object is rotated
    // if scaled (non uniform transformation) -> we compute the Q matrix = (M.T)^-1 
    // which is M in case of orthogonal M (have unit vectors perpendicular to each other)
    mat3 rotationModelMatrix = mat3(modelMatrix);
    vertexNormal = inverse(transpose(rotationModelMatrix)) * normal; // me
    // vertexNormal = mat3(inverse(transpose(modelMatrix))) * normal; // fathy

    fcolor = color;
}

