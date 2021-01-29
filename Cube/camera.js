// <reference path="/home/amrelsersy/WebGL-Course/utils/glMatrix-0.9.5.max.js" />

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


function create_cube()
{
    var textVertexShader = readShaderFile("glsl/cubeVertexShaderInstance.glsl");
    var textFragmentShader = readShaderFile("glsl/fragmentShader.glsl");

    var vertexShader =createShaderAndCompile(gl, textVertexShader, "vertex");
    var fragmentShader = createShaderAndCompile(gl, textFragmentShader, "fragment");

    var cube = {};

    cube.program = createProgram(gl, [vertexShader, fragmentShader]);


    gl.useProgram(cube.program);
    cube.vao = gl.createVertexArray();
    gl.bindVertexArray(cube.vao);

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
    faceColors.forEach(function(color){
        for (var i = 0; i < 6; i++)
            cube.colors = cube.colors.concat(color);
    })
    
    const FLOAT_SIZE = 4;
    const SIZE_POS = 3;
    const SIZE_COLOR = 4;

    // Buffers
    cube.verticesBuffer = createBufferAndWrite(gl, cube.vertices, gl.STATIC_DRAW);
    cube.colorsBuffer =createBufferAndWrite(gl, cube.colors, gl.STATIC_DRAW);

    // Attributes (shaders in/out)
    // Looking up attributes locations in initialization, not in the render loop
    cube.verticesAttributeLocation = gl.getAttribLocation(cube.program, "position");
    cube.colorAttributeLocation = gl.getAttribLocation(cube.program, "inputColor");

    // console.log(gl.getAttribLocation(cube.program, "position"), gl.getAttribLocation(cube.program, "inputColor"));

    bindBufferWithAttribute(gl, cube.verticesBuffer, cube.verticesAttributeLocation, SIZE_POS, SIZE_POS*FLOAT_SIZE, 0);
    bindBufferWithAttribute(gl, cube.colorsBuffer, cube.colorAttributeLocation, SIZE_COLOR, SIZE_COLOR*FLOAT_SIZE, 0);    

    // create Identity Matrices
    cube.modelMatrix = mat4.create();
    cube.modelMatrixLocation = gl.getUniformLocation(cube.program, "modelMatrix");

    return cube;
}



var wPress = false;
var aPress = false;
var dPress = false;
var sPress = false;
var zPress = false;
var xPress = false;
var rPress = false;
var qPress = false;


function start()
{
    var cube = create_cube();

    gl.clearColor(0,1,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0,0, canvas.width, canvas.height);
    gl.useProgram(cube.program);
    gl.bindVertexArray(cube.vao);
    
    var projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, 45 *Math.PI/180, canvas.width/canvas.height, 0.1, 100);
    var projectionMatrixLocation = gl.getUniformLocation(cube.program, "projectionMatrix");

    var viewMatrix = mat4.create();
    var viewMatrixLocation = gl.getUniformLocation(cube.program, "viewMatrix");

    gl.uniformMatrix4fv(cube.modelMatrixLocation, false, cube.modelMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(viewMatrixLocation , false, viewMatrix);

    var offsetArray = new Array();
    var colorArray = new Array();
    var timeLocation = gl.getUniformLocation(cube.program, "time");
    var angle = 0;
    var n_cubes = 3;
    var time = 0;
    var movement = 0.1;

    for (var i = 0; i < 5 ; i++)
    {
        var offset = vec3.fromValues(i-1+i/2,0,-7);
        var color = vec4.fromValues(i===0, i===1, i===2, 1.0);
        offsetArray.push(offset);
        colorArray.push(color);
    }
    for (var i =0; i< n_cubes; i++)
    {
        var offsetLocation = gl.getUniformLocation(cube.program, "offsetArray["+i.toString()+"]");
        var colorLocation = gl.getUniformLocation(cube.program, "colorArray["+i.toString()+"]");

        gl.uniform3fv(offsetLocation, offsetArray[i]);
        gl.uniform4fv(colorLocation, colorArray[i]);           
    }

    // Camera Object
    var camera = {
        position: vec3.fromValues(0,0,0),
        target: vec3.fromValues(0,0,0),
        direction: vec3.fromValues(0,0,-1),  // inside the screen (like original camera) 
        up: vec3.fromValues(0, 1, 0)   // default up vector ... in +ve y direction (defau lt up)
    }

    // target = position + direction
    vec3.add(camera.target, camera.position, camera.direction);

    function rotateCamera()
    {
        if (wPress)
            camera.position[2] -= movement;
        if (sPress)
            camera.position[2] += movement;
        if (aPress)
            camera.position[0] -= movement;
        if (dPress)
            camera.position[0] += movement;
        if (xPress)
            camera.position[1] += movement;
        if (zPress)
            camera.position[1] -= movement;
    }


    requestAnimationFrame(renderLoop);
    function renderLoop()
    {
        gl.clearColor(0.9,0.9,0.9, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.useProgram(cube.program);
        gl.bindVertexArray(cube.vao);

        time += 0.05;
        gl.uniform1f(timeLocation, time);

        // =============== Camera Matrix ==================
        rotateCamera();
        vec3.add(camera.target, camera.position, camera.direction);
        mat4.lookAt(viewMatrix, camera.position, camera.target, camera.up);
        gl.uniformMatrix4fv(viewMatrixLocation , false, viewMatrix);

        // ================================================

        mat4.identity(cube.modelMatrix);
        mat4.rotateX(cube.modelMatrix, cube.modelMatrix, 0.3);
        mat4.rotateY(cube.modelMatrix, cube.modelMatrix, angle);
        angle = (angle + 0.01) % 360;
        gl.uniformMatrix4fv(cube.modelMatrixLocation, false, cube.modelMatrix);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, 3);

        requestAnimationFrame(renderLoop);
    }

}

document.addEventListener("keydown", function(event){
    if (event.key == "w")
        wPress = true;
    if (event.key == "s")
        sPress = true;
    if (event.key == "a")
        aPress = true;
    if (event.key == "d")
        dPress = true;  
    if (event.key == "r")
        rPress = true;
    if (event.key == "q")
        qPress = true;    
    if (event.key == "z")
        zPress = true;    
    if (event.key == "x")
        xPress = true;    
})
document.addEventListener("keyup", function(event){
    if (event.key == "w")
        wPress = false;
    if (event.key == "s")
        sPress = false;
    if (event.key == "a")
        aPress = false;
    if (event.key == "d")
        dPress = false;  
    if (event.key == "r")
        rPress = false;
    if (event.key == "q")
        qPress = false;    
    if (event.key == "z")
        zPress = false;
    if (event.key == "x")
        xPress = false;    
})
