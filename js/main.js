import {readShaderFile, createShaderAndCompile} from "./shader.js";

// wait till the DOM is loaded
document.addEventListener("DOMContentLoaded", start)

/** @type {WebGL2RenderingContext} */
var gl = document.getElementById("renderCanvas").getContext("webgl2");

function start()
{
    // Shaders Code text
    var textVertex = readShaderFile("glsl/vertexShader.glsl");
    var textFragment = readShaderFile("glsl/fragmentShader.glsl");
    console.log(textVertex);
    console.log(textFragment);

    // Shaders
    var vertexShader =createShaderAndCompile(gl, textVertex, "vertex");
    var fragmentShader = createShaderAndCompile(gl, textFragment, "fragment");

    console.log(vertexShader);
    console.log(fragmentShader);

    gl.clearColor(0,1,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

}

