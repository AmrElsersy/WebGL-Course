// <reference path="/home/amrelsersy/WebGL-Course/utils/glMatrix-0.9.5.max.js" />

import {readShaderFile, createShaderAndCompile} from "../utils/shader.js";
import {createProgram} from "../utils/program.js"
import {createBufferAndWrite ,bindBufferWithAttribute} from "../utils/buffer.js"
import {normals, vertices} from "./points_cube.js"

// wait till the DOM is loaded
document.addEventListener("DOMContentLoaded", start)

/** @type {HTMLCanvasElement} */
var canvas = document.getElementById("renderCanvas");
/** @type {WebGL2RenderingContext} */
var gl = canvas.getContext("webgl2");


function create_light_cube(cube)
{
    var light_cube = {};
    
    var textVertexShader = readShaderFile("glsl/lightVertexShader.glsl");
    var textFragmentShader = readShaderFile("glsl/lightFragmentShader.glsl");

    var vertexShader =createShaderAndCompile(gl, textVertexShader, "vertex");
    var fragmentShader = createShaderAndCompile(gl, textFragmentShader, "fragment");

    light_cube.program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(light_cube.program);
    light_cube.vao = gl.createVertexArray();
    gl.bindVertexArray(light_cube.vao);
    
    light_cube.verticesAttributeLocation = gl.getAttribLocation(light_cube.program, "position");
    bindBufferWithAttribute(gl, cube.verticesBuffer, light_cube.verticesAttributeLocation, 3, 0, 0);

    light_cube.modelMatrix = mat4.create();
    light_cube.modelMatrixLocation = gl.getUniformLocation(light_cube.program, "modelMatrix");

    return light_cube;
}

function create_object_cube(cube)
{
    var object_cube = {};
    
    var textVertexShader = readShaderFile("glsl/lightnessVertexShader.glsl");
    var textFragmentShader = readShaderFile("glsl/lightnessFragmentShader.glsl");

    var vertexShader =createShaderAndCompile(gl, textVertexShader, "vertex");
    var fragmentShader = createShaderAndCompile(gl, textFragmentShader, "fragment");

    object_cube.program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(object_cube.program);
    object_cube.vao = gl.createVertexArray();
    gl.bindVertexArray(object_cube.vao);
    
    object_cube.verticesAttributeLocation = gl.getAttribLocation(object_cube.program, "position");
    bindBufferWithAttribute(gl, cube.verticesBuffer, object_cube.verticesAttributeLocation, 3, 0, 0);

    object_cube.modelMatrix = mat4.create();
    object_cube.modelMatrixLocation = gl.getUniformLocation(object_cube.program, "modelMatrix");

    return object_cube;
}

function create_abstract_cube()
{

    var cube = {};

    cube.vertices = vertices;
    cube.normals = normals;    
    cube.verticesBuffer = createBufferAndWrite(gl, cube.vertices, gl.STATIC_DRAW);
    cube.normalsBuffer = createBufferAndWrite(gl, cube.normals, gl.STATIC_DRAW);
    return cube;
}


function start()
{
    gl.clearColor(0,1,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0,0, canvas.width, canvas.height);


    var cube = create_abstract_cube();
    var object_cube = create_object_cube(cube);
    var light_cube = create_light_cube(cube);

    gl.useProgram(object_cube.program);
    gl.bindVertexArray(object_cube.vao);
    
    object_cube.projectionMatrixLocation = gl.getUniformLocation(object_cube.program, "projectionMatrix");
    object_cube.viewMatrixLocation = gl.getUniformLocation(object_cube.program, "viewMatrix");
    light_cube.projectionMatrixLocation = gl.getUniformLocation(light_cube.program, "projectionMatrix");
    light_cube.viewMatrixLocation = gl.getUniformLocation(light_cube.program, "viewMatrix");

    var projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, 45 *Math.PI/180, canvas.width/canvas.height, 0.1, 100);
    var viewMatrix = mat4.create();

    gl.uniformMatrix4fv(object_cube.modelMatrixLocation, false, object_cube.modelMatrix);
    gl.uniformMatrix4fv(object_cube.projectionMatrixLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(object_cube.viewMatrixLocation , false, viewMatrix);

    var angle = 0;
    var rotation = 0.03;

    var camera = {
        position: vec3.fromValues(0,0,0),
        target: vec3.fromValues(0,0,0),
        direction: vec3.fromValues(0,0,-1),  // inside the screen (like original camera) 
        up: vec3.fromValues(0, 1, 0),   // default up vector ... in +ve y direction (will be computed again in look_at)
        right: vec3.fromValues(0,0,0), // 3rd perpendicular vector of direction & up (used to move right & left)
        yaw: - Math.PI/2,
        pitch: 0,
        updateTarget: function() {
            vec3.add(camera.target, camera.position, camera.direction);
        }
    }
    function cross(a, b) {
        return vec3.fromValues(
                a[1] * b[2] - a[2] * b[1],
                a[2] * b[0] - a[0] * b[2],
                a[0] * b[1] - a[1] * b[0]
                );
    }
    function translateCamera()
    {
        camera.right = vec3.fromValues(-1 * Math.sin(camera.yaw), 0, Math.cos(camera.yaw));          
        camera.up = cross(camera.right, camera.direction);

        var scaledDirection = vec3.create();
        var scaledRight = vec3.create();
        var scaledUp = vec3.create();
        vec3.scale(scaledDirection, camera.direction, 0.1)
        vec3.scale(scaledRight, camera.right, 0.1)
        vec3.scale(scaledUp, camera.up, 0.1)
        if (wPress)
            vec3.add(camera.position, camera.position, scaledDirection);
        if (sPress)
            vec3.subtract(camera.position, camera.position, scaledDirection);
        if (aPress)
            vec3.subtract(camera.position, camera.position, scaledRight);
        if (dPress)
            vec3.add(camera.position, camera.position, scaledRight);
        if (xPress)
            vec3.add(camera.position, camera.position, scaledUp);
        if (zPress)
            vec3.subtract(camera.position, camera.position, scaledUp);
    }
    function rotateCamera()
    {
        if (leftPress)
            camera.yaw -= rotation;
        if (rightPress)
            camera.yaw += rotation;
        if (upPress)
            camera.pitch += rotation;
        if (downPress)
            camera.pitch -= rotation;
        camera.direction[0] = Math.cos(camera.pitch) * Math.cos(camera.yaw);
        camera.direction[1] = Math.sin(camera.pitch);
        camera.direction[2] = Math.cos(camera.pitch) * Math.sin(camera.yaw);
    }


    // =================== Light ===================
    var light = {
        ambient: vec3.fromValues(1,1,1),
        diffuse: vec3.fromValues(1,1,1),
        spectular: vec3.fromValues(1,1,1)
    }

    var objectCubeAmbientLightLocation = gl.getUniformLocation(object_cube.program, "ambientLight");
    gl.uniform3fv(objectCubeAmbientLightLocation, light.ambient);

    gl.useProgram(light_cube.program);
    gl.bindVertexArray(light_cube.vao);

    gl.uniformMatrix4fv(light_cube.modelMatrixLocation, false, light_cube.modelMatrix);
    gl.uniformMatrix4fv(light_cube.projectionMatrixLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(light_cube.viewMatrixLocation , false, viewMatrix);

    var lightColorLocation = gl.getUniformLocation(light_cube.program, "color");
    gl.uniform3fv(lightColorLocation, light.ambient);
    
    // ===============================================
    requestAnimationFrame(renderLoop);
    function renderLoop()
    {
        {
        gl.clearColor(0.1,0.1,0.1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        gl.useProgram(object_cube.program);
        gl.bindVertexArray(object_cube.vao);
        // camera
        rotateCamera();
        translateCamera();
        camera.updateTarget();
        mat4.lookAt(viewMatrix, camera.position, camera.target, camera.up);        
        gl.uniformMatrix4fv(object_cube.viewMatrixLocation , false, viewMatrix);
        // Draw
        mat4.identity(object_cube.modelMatrix);
        mat4.translate(object_cube.modelMatrix, object_cube.modelMatrix, [0,0,-7])
        mat4.rotateX(object_cube.modelMatrix, object_cube.modelMatrix, 0.3);
        mat4.rotateY(object_cube.modelMatrix, object_cube.modelMatrix, angle);
        angle = (angle + 0.01) % 360;
        gl.uniformMatrix4fv(object_cube.modelMatrixLocation, false, object_cube.modelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        mat4.identity(object_cube.modelMatrix);
        mat4.translate(object_cube.modelMatrix, object_cube.modelMatrix, [-2,0,-7])
        mat4.rotateX(object_cube.modelMatrix, object_cube.modelMatrix, 0.3);
        mat4.rotateY(object_cube.modelMatrix, object_cube.modelMatrix, angle);
        angle = (angle + 0.01) % 360;
        gl.uniformMatrix4fv(object_cube.modelMatrixLocation, false, object_cube.modelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        }

        // =================== Light ===================
        gl.useProgram(light_cube.program);
        gl.bindVertexArray(light_cube.vao);

        mat4.identity(light_cube.modelMatrix);
        mat4.translate(light_cube.modelMatrix, light_cube.modelMatrix, [4,4,-15])
        gl.uniformMatrix4fv(light_cube.modelMatrixLocation, false, light_cube.modelMatrix);
        gl.uniformMatrix4fv(light_cube.viewMatrixLocation , false, viewMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, 36);

        requestAnimationFrame(renderLoop);
    }
}


var wPress = false;
var aPress = false;
var dPress = false;
var sPress = false;
var zPress = false;
var xPress = false;
var leftPress = false;
var rightPress = false;
var upPress = false;
var downPress = false;

document.addEventListener("keydown", function(event){
    if (event.key == "w")
        wPress = true;
    if (event.key == "s")
        sPress = true;
    if (event.key == "a")
        aPress = true;
    if (event.key == "d")
        dPress = true;  
    if (event.key == "ArrowRight")
        rightPress = true;
    if (event.key == "ArrowLeft")
        leftPress = true;    
    if (event.key == "ArrowUp")
        upPress = true;
    if (event.key == "ArrowDown")
        downPress = true;    
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
    if (event.key == "ArrowRight")
        rightPress = false;
    if (event.key == "ArrowLeft")
        leftPress = false;    
    if (event.key == "ArrowUp")
        upPress = false;
    if (event.key == "ArrowDown")
        downPress = false;    
    if (event.key == "z")
        zPress = false;
    if (event.key == "x")
        xPress = false;    
})
