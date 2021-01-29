// <reference path="/home/amrelsersy/WebGL-Course/utils/glMatrix-0.9.5.max.js" />

import {readShaderFile, createShaderAndCompile} from "../utils/shader.js";
import {createProgram} from "../utils/program.js"
import {createBufferAndWrite ,bindBufferWithAttribute} from "../utils/buffer.js"
import {vertices, textureCoordinates} from "./points_cube.js"

// wait till the DOM is loaded
document.addEventListener("DOMContentLoaded", start)

/** @type {HTMLCanvasElement} */
var canvas = document.getElementById("renderCanvas");
/** @type {WebGL2RenderingContext} */
var gl = canvas.getContext("webgl2");


var image, image2;
var path1 = "images/webgl-logo-256.jpg";
var path2 = "images/wood.jpg";
var path3 = "images/z3.png";

function start()
{
    image = new Image();
    image.src = path1;
    image.onload = function() {
        console.log("image loaded");
        start2();
    }
}

function start2()
{
    image2 = new Image();
    image2.src = path3;
    image2.onload = function() {
        console.log("image2 loaded");
        main();
    }
}

function create_cube()
{
    var textVertexShader = readShaderFile("glsl/cubeTextureVertexShader.glsl");
    var textFragmentShader = readShaderFile("glsl/cubeTextureFragmentShader.glsl");

    var vertexShader =createShaderAndCompile(gl, textVertexShader, "vertex");
    var fragmentShader = createShaderAndCompile(gl, textFragmentShader, "fragment");

    var cube = {};

    cube.program = createProgram(gl, [vertexShader, fragmentShader]);

    console.log("Program: ",cube.program)
    gl.useProgram(cube.program);
    cube.vao = gl.createVertexArray();
    gl.bindVertexArray(cube.vao);

    cube.vertices = vertices;
    cube.textureCoordinates = textureCoordinates;
    cube.colors = [];

    var faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [0.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 0.0, 1.0, 1.0], // Top face
        [1.0, 1.0, 0.0, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 1.0, 1.0, 1.0] // Left face
    ];
    faceColors.forEach(function(color){
        for (var i = 0; i < 6; i++)
            cube.colors = cube.colors.concat(color);
    })
    
    // Buffers
    cube.verticesBuffer = createBufferAndWrite(gl, cube.vertices, gl.STATIC_DRAW);
    cube.colorsBuffer =createBufferAndWrite(gl, cube.colors, gl.STATIC_DRAW);
    // texture coordinate buffer
    cube.textureCoordinatesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.textureCoordinatesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.textureCoordinates), gl.STATIC_DRAW);

    // Attributes (shaders in/out)
    // Looking up attributes locations in initialization, not in the render loop
    cube.verticesAttributeLocation = gl.getAttribLocation(cube.program, "position");
    cube.colorAttributeLocation = gl.getAttribLocation(cube.program, "color");
    cube.textureCoordinatesLocation = gl.getAttribLocation(cube.program, "inputTextureCoordinates");

    // console.log(gl.getAttribLocation(cube.program, "position"), gl.getAttribLocation(cube.program, "color"));

    bindBufferWithAttribute(gl, cube.verticesBuffer, cube.verticesAttributeLocation, 3, 0, 0);
    bindBufferWithAttribute(gl, cube.colorsBuffer, cube.colorAttributeLocation, 4, 0, 0);    

    // texture coordinates vertex array attribute
    gl.enableVertexAttribArray(cube.textureCoordinatesLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.textureCoordinatesBuffer);
    gl.vertexAttribPointer(cube.textureCoordinatesLocation, 2, gl.FLOAT, false, 0, 0);

    // create Identity Matrices
    cube.modelMatrix = mat4.create();
    cube.modelMatrixLocation = gl.getUniformLocation(cube.program, "modelMatrix");

    return cube;
}


function main()
{
    var cube = create_cube();

    gl.clearColor(0,1,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0,0, canvas.width, canvas.height);
    gl.useProgram(cube.program);
    gl.bindVertexArray(cube.vao);


    // =================== Textrure =======================]
    // store texture image in the gpu texture 
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // for flipping problem
    // Gate, level(preprocess the texture)(level0 is no preprocessing), format1, format2, size of texture point,image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); // have many definistions    
    // set the texture rendering properties (both could be eigther LINEAR or NEAREST)
    // MAG_FILTER: when the texture image is mapped to a bigger image (after projection)
    // MIN_FILTER: when the texture image is mapped to a smaller image (after projection)
    // LINEAR: get a mix of colors when mapping
    // NEAREST: get the nearest color according to mapping position
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // send to uniform sampler .... note that it is in the fragment shader
    var samplerLocation = gl.getUniformLocation(cube.program, "image")
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(samplerLocation,0);


    //  repeated for texture 2
    var texture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    var sampler2Location = gl.getUniformLocation(cube.program, "image2");
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.activeTexture(gl.TEXTURE14);
    gl.uniform1i(sampler2Location, 14);

    console.log(image, image2)
    console.log(samplerLocation, sampler2Location);
    // ==================================================]

    // Matrices
    var viewMatrix = mat4.create();
    var projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, 45 *Math.PI/180, canvas.width/canvas.height, 0.1, 10);
        
    var viewMatrixLocation = gl.getUniformLocation(cube.program, "viewMatrix");
    var projectionMatrixLocation = gl.getUniformLocation(cube.program, "projectionMatrix");
    gl.uniformMatrix4fv(cube.modelMatrixLocation, false, cube.modelMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(viewMatrixLocation , false, viewMatrix);


    var angle = 0;

    requestAnimationFrame(renderLoop);

    function renderLoop()
    {
        gl.clearColor(0.9,0.9,0.9, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        gl.useProgram(cube.program);
        gl.bindVertexArray(cube.vao);

        // ================ Basic Way to create many Cube ==================
        mat4.identity(cube.modelMatrix);
        // translate in -ve Z direction to make the cube far ... executed last
        mat4.translate(cube.modelMatrix, cube.modelMatrix, [0,0,-7])
        mat4.rotateX(cube.modelMatrix, cube.modelMatrix, angle);
        mat4.rotateY(cube.modelMatrix, cube.modelMatrix, angle);

        angle = (angle + 0.03) % 360;
        gl.uniformMatrix4fv(cube.modelMatrixLocation, false, cube.modelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        // recursive
        requestAnimationFrame(renderLoop);
    }

}

