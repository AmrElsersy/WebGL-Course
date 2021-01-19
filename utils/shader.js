var codeText;


export function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
            if(rawFile.status === 200 || rawFile.status == 0)
                codeText = rawFile.responseText;
    }
    rawFile.send(null);
}

export function readShaderFile(path)
{
    readTextFile(path);
    return codeText;    
}

/**
 * @param {WebGL2RenderingContext} gl webgl 
 * @param {string} code code text
 * @param {string} type vertex | fragment
 * @returns {WebGLShader} shader
 */
export function createShaderAndCompile(gl, code, type)
{
    var shader;
    // create shader to execute on GPU
    if (type == "vertex")
        shader = gl.createShader(gl.VERTEX_SHADER);
    else if (type == "fragment")
        shader = gl.createShader(gl.FRAGMENT_SHADER);

    // set the source code
    gl.shaderSource(shader, code);
    // compile
    gl.compileShader(shader);

    var isCompiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (isCompiled)
        return shader;

    console.log("shader create is not ray2")
        
    // delete if not success
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
