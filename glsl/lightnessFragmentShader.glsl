#version 300 es
precision mediump float;


in vec4 vertexWorldPosition;
in vec3 vertexNormal;
in vec4 fcolor;

uniform vec3 lightColor;
uniform vec3 lightPosition;

out vec4 out_fcolor;

void main()
{   
    float ambientIntensity = 0.01;
    vec4 ambientColor = vec4(ambientIntensity * lightColor, 1.0);

    // vector from vertex to light
    vec3 lightDirection = lightPosition - vec3(vertexWorldPosition);
    vec3 normalizedLightDirection = normalize(lightDirection);
    vec3 normalizedNormal = normalize(vertexNormal);

    // angle between the light direction & normal of vertex
    // diffuse cannot be -ve (light is 0 = dark or > 0 = light)
    float diffuseIntensity = max( dot(normalizedNormal, normalizedLightDirection), 0.0);
    vec4 diffuseColor = vec4(diffuseIntensity * lightColor, 1.0);

    // vec3 lightDirection = normalize(lightPosition - vec3(vertexWorldPosition));
    // vec3 normalizedNormal = normalize(vertexNormal); 
    // float diffuseIntensity = max (dot(normalizedNormal,lightDirection)  ,0.0);
    // vec4 diffuseColor = vec4(diffuseIntensity*lightColor,1);


    vec4 color = vec4(1,0,1,1);
    out_fcolor = (diffuseColor + ambientColor) * color;
}