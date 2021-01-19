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
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var textVertex = readShaderFile("glsl/cubeVertexShader.glsl");
    var textFragment = readShaderFile("glsl/fragmentShader.glsl");
    var vertexShader =createShaderAndCompile(gl, textVertex, "vertex");
    var fragmentShader = createShaderAndCompile(gl, textFragment, "fragment");

    var program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // just draw the 4 corners of rect instead of 6 for 2 triangles
    /**
     *  1_____0
     *  |     |
     *  |     |
     * 2|_____|3
     */
    var positions = [
        0.5,0.5,0,
        -0.5,0.5,0,
        -0.5,-0.5,0,
        0.5,-0.5,0
    ]
    var colors = [
        1,0,0,1,
        0,1,0,1,
        0,0,1,1,
        1,1,0,0.5
    ]
    // indices of positions & colors & textures for drawing triangles in OpenGL
    var indices = [
        0,1,2,
        2,3,0
    ]

    const FLOAT_SIZE = 4;
    const SIZE_POS = 3;
    const SIZE_COLOR = 4;

    var positionsBuffer = createBufferAndWrite(gl, positions, gl.STATIC_DRAW);
    var colorsBuffer =createBufferAndWrite(gl, colors, gl.STATIC_DRAW);

    var positionAttributeLocation = gl.getAttribLocation(program, "position")
    var colorAttributeLocation = gl.getAttribLocation(program, "color");

    bindBufferWithAttribute(gl, positionsBuffer, positionAttributeLocation, SIZE_POS, SIZE_POS*FLOAT_SIZE, 0);
    bindBufferWithAttribute(gl, colorsBuffer, colorAttributeLocation, SIZE_COLOR, SIZE_COLOR*FLOAT_SIZE, 0);    

    // Element Array Indices
    var indicesBuffer = gl.createBuffer();
    // make sure you bind the VertexArray with gl .. because the ELEMENT_ARRAY_BUFFER Gate inside the VertexArray
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);    

    
    // Matrix
    var modelMatrix = mat4.create();
    var viewMatrix = mat4.create();
    var projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, 45 *Math.PI/180, canvas.width/canvas.height, 0.1, 10);

    var modelLocation = gl.getUniformLocation(program, "modelMatrix");
    var viewLocation = gl.getUniformLocation(program, "viewMatrix");
    var projectionLocation = gl.getUniformLocation(program, "projectionMatrix");

    gl.uniformMatrix4fv(modelLocation, false, modelMatrix);
    gl.uniformMatrix4fv(viewLocation, false, viewMatrix);
    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);

    var angle = 0.0;
    requestAnimationFrame(renderLoop);    
    function renderLoop()
    {
        gl.clearColor(0.9,0.9,0.9, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        mat4.identity(modelMatrix);
        mat4.translate(modelMatrix, modelMatrix, [0,0,-7]);
        mat4.rotateZ(modelMatrix, modelMatrix, angle);
        angle += 0.01;

        gl.uniformMatrix4fv(modelLocation, false, modelMatrix);        
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
        // gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(renderLoop);
    }
    }


