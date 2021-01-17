import {readShaderFile, createShaderAndCompile} from "../utils/shader.js";
import {createProgram} from "../utils/program.js"
import {createBufferAndWrite ,bindBufferWithAttribute} from "../utils/buffer.js"
import {vertices} from "./points_cube.js"


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


    var cube = {};

    cube.vertices = vertices;
    cube.colors = [];

    var faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [0.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 0.0, 1.0, 1.0], // Top face
        [1.0, 1.0, 0.0, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 1.0, 1.0, 1.0] // Left face
    ];

    // each face has 6 points with the same color;
    faceColors.forEach(function(color){
        for (var i = 0; i < 6; i++)
            cube.colors = cube.colors.concat(color);
    })
    console.log(cube.colors);
    
    const FLOAT_SIZE = 4;
    const SIZE_POS = 3;
    const SIZE_COLOR = 4;

    // Buffers
    var verticesBuffer = createBufferAndWrite(gl, cube.vertices, gl.STATIC_DRAW);
    var colorsBuffer =createBufferAndWrite(gl, cube.colors, gl.STATIC_DRAW);

    // Attributes (shaders in/out)
    // Looking up attributes locations in initialization, not in the render loop
    var verticesAttributeLocation = gl.getAttribLocation(program, "position")
    var colorAttributeLocation = gl.getAttribLocation(program, "color");

    bindBufferWithAttribute(gl, verticesBuffer, verticesAttributeLocation, SIZE_POS, SIZE_POS*FLOAT_SIZE, 0);
    bindBufferWithAttribute(gl, colorsBuffer, colorAttributeLocation, SIZE_COLOR, SIZE_COLOR*FLOAT_SIZE, 0);    

    // Loop
    requestAnimationFrame(renderLoop);
}

function renderLoop()
{
    gl.clearColor(0,1,1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.drawArrays(gl.TRIANGLES, 0, 36);
    // recursive
    requestAnimationFrame(renderLoop);
}