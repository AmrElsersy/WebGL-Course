#version 300 es
// fragment shader has not a percision so specify one
precision mediump float;

// in/out attribute buffers data
in vec4 fcolor;
in vec2 textureCoordinates;

out vec4 out_fcolor;

uniform sampler2D image;
uniform sampler2D image2;

void main()
{   
    out_fcolor = texture(image, textureCoordinates);
    // out_fcolor = mix(
    //     texture(image2, textureCoordinates),
    //     texture(image, textureCoordinates),
    //     0.5
    //     );
}