#version 300 es
precision mediump float;


in vec4 vertexWorldPosition;
in vec3 vertexNormal;
in vec4 fcolor;

uniform vec3 lightColor;
uniform vec3 lightPosition;
uniform vec3 cameraPosition;

out vec4 out_fcolor;

void main()
{   
    // ============== Ambient ==============
    float ambientIntensity = 0.1;
    vec4 ambientColor = vec4(ambientIntensity * lightColor, 1.0);
    
    // ============== Diffuse ==============
    // vector from vertex to light
    vec3 lightDirection = lightPosition - vec3(vertexWorldPosition);
    vec3 normalizedLightDirection = normalize(lightDirection);
    vec3 normalizedNormal = normalize(vertexNormal);

    // angle between the light direction & normal of vertex
    // diffuse cannot be -ve (light is 0 = dark or > 0 = light)
    float diffuseIntensity = max( dot(normalizedNormal, normalizedLightDirection), 0.0);
    vec4 diffuseColor = vec4(diffuseIntensity * lightColor, 1.0);

    // ============== Specular ==============
    vec3 cameraDirection = cameraPosition - vec3(vertexWorldPosition);
    vec3 normalizedCameraDirection = normalize(cameraDirection); 
    vec3 reflectedLight = reflect(-normalizedLightDirection, normalizedNormal);
    float specularIntensity = max(dot(reflectedLight, normalizedCameraDirection), 0.0);
    specularIntensity = pow(specularIntensity, 100.0);
    vec4 specularColor = vec4(specularIntensity * lightColor, 1.0);

    // ============== Total Color ==============
    out_fcolor = (diffuseColor + ambientColor + specularColor) * fcolor;
}