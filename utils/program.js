
/**
 * @param {WebGL2RenderingContext} gl webgl2
 * @param {Array} shaders shaders list to attatch to program
 * @returns {WebGLProgram} program 
 */
export function createProgram(gl, shaders)
{
    var program = gl.createProgram();

    // attatch shaders to program
    for (var i = 0; i < shaders.length; i++)
        gl.attachShader(program, shaders[i]);

    // linking
    gl.linkProgram(program);
    var isLinked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (isLinked)
        return program;

    // print error & delete program
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);

}