import {readShaderFile, createShaderAndCompile} from "../utils/shader.js";
import {createProgram} from "../utils/program.js"
import {createBufferAndWrite ,bindBufferWithAttribute} from "../utils/buffer.js"

// wait till the DOM is loaded
document.addEventListener("DOMContentLoaded", start)

/** @type {HTMLCanvasElement} */
var canvas = document.getElementById("renderCanvas");
/** @type {WebGL2RenderingContext} */
var gl = canvas.getContext("webgl2");

function start()
{
    // initail color
    gl.clearColor(0,1,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Shaders Code text
    var textVertex = readShaderFile("glsl/vertexShader.glsl");
    var textFragment = readShaderFile("glsl/fragmentShader.glsl");
    console.log(textVertex);
    // Shaders
    var vertexShader =createShaderAndCompile(gl, textVertex, "vertex");
    var fragmentShader = createShaderAndCompile(gl, textFragment, "fragment");

    // Program = concatinated shaders
    var program = createProgram(gl, [vertexShader, fragmentShader]);
    // use the program for all coming gl operations
    gl.useProgram(program);
    // store the GL configration of the code inside the vertex array object to use it later (usful when have many objects)
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);


    // matrices
    var positions = [
        1,0,0,
        0,1,0,
        -1,0,0
    ]
    var colors = [
        1,0,0,1,
        0,1,0,1,
        0,0,1,1
    ]

    const FLOAT_SIZE = 4;
    const SIZE_POS = 3;
    const SIZE_COLOR = 4;

    // Buffers
    var positionsBuffer = createBufferAndWrite(gl, positions, gl.STATIC_DRAW);
    var colorsBuffer =createBufferAndWrite(gl, colors, gl.STATIC_DRAW);

    // Attributes (shaders in/out)
    // Looking up attributes locations in initialization, not in the render loop
    var positionAttributeLocation = gl.getAttribLocation(program, "position")
    var colorAttributeLocation = gl.getAttribLocation(program, "color");

    bindBufferWithAttribute(gl, positionsBuffer, positionAttributeLocation, SIZE_POS, SIZE_POS*FLOAT_SIZE, 0);
    bindBufferWithAttribute(gl, colorsBuffer, colorAttributeLocation, SIZE_COLOR, SIZE_COLOR*FLOAT_SIZE, 0);    

    // Loop
    requestAnimationFrame(renderLoop);
}

function renderLoop()
{
    gl.clearColor(0,1,1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // recursive
    requestAnimationFrame(renderLoop);
}