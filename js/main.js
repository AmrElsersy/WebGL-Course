import {readShaderFile, createShaderAndCompile} from "./shader.js";
import {createProgram} from "./program.js"

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
    var positionsBuffer = createBufferAndWrite(positions, gl.STATIC_DRAW);
    var colorsBuffer =createBufferAndWrite(colors, gl.STATIC_DRAW);

    // Attributes (shaders in/out)
    // Looking up attributes locations in initialization, not in the render loop
    var positionAttributeLocation = gl.getAttribLocation(program, "position")
    var colorAttributeLocation = gl.getAttribLocation(program, "color");

    // enable the attribute to deal with
    gl.enableVertexAttribArray(positionAttributeLocation);    
    gl.enableVertexAttribArray(colorAttributeLocation);

    // attatch attribute with the buffer attatched to the ARRAY_BUFFER Gate
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, SIZE_POS, gl.FLOAT, false, SIZE_POS * FLOAT_SIZE, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.vertexAttribPointer(colorAttributeLocation, SIZE_COLOR, gl.FLOAT, false, SIZE_COLOR * FLOAT_SIZE,0);
    

    // Loop
    requestAnimationFrame(renderLoop);
}

/**
 * @param {Object} data write data
 * @param {int} mode gl.STATIC_DRAW | gl.DYNAMIC_DRAW 
 */
function createBufferAndWrite(data, mode)
{
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), mode);
    return buffer;
}

/**
 * @param {Object} dataBuffer Data Buffer with data need to be bound to attribute location
 * @param {int} attributeLocation attribute location (in/out of shader) 
 * @param {int} size number of elements of each data (ex:position has size = 3)
 * @param {int} stride difference between the begin of data & the next data .. in bytes
 * @param {int} offset offset at just the begin .. in bytes
 */
function bindBufferWithAttribute(dataBuffer, attributeLocation, size, stride, offset)
{
    // enable the attribute to deal with
    gl.enableVertexAttribArray(attributeLocation);    

    // tell the program how to pull the data from our data array to its attributes(in/out) 
    // it always deals with ARRAY_BUFFER Gate .. so put your data in a GPU Buffer that is binded to that gate
    gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);
    
    // Bind the GPU Buffer (which is attatched to the ARRAY_BUFFER Gate) to the attribute buffer
    // So you are free to change the ARRAY_BUFFER Gate after that line ... the attribute & GPU Buffer is connected
    // attribute_location, size of 1 data, type of data, normalized, stride, offset
    gl.vertexAttribPointer(attributeLocation, size, gl.FLOAT, false, stride*size, offset);
}

function renderLoop()
{
    gl.clearColor(0,1,1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // recursive
    requestAnimationFrame(renderLoop);
}