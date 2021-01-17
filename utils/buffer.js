
/**
 * @param {WebGL2RenderingContext} gl webgl2
 * @param {Object} data write data
 * @param {int} mode gl.STATIC_DRAW | gl.DYNAMIC_DRAW 
 */
export function createBufferAndWrite(gl, data, mode)
{
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), mode);
    return buffer;
}

/**
 * @param {WebGL2RenderingContext} gl webgl2
 * @param {Object} dataBuffer Data Buffer with data need to be bound to attribute location
 * @param {int} attributeLocation attribute location (in/out of shader) 
 * @param {int} size number of elements of each data (ex:position has size = 3)
 * @param {int} stride difference between the begin of data & the next data .. in bytes
 * @param {int} offset offset at just the begin .. in bytes
 */
export function bindBufferWithAttribute(gl, dataBuffer, attributeLocation, size, stride, offset)
{
    // enable the attribute to deal with
    gl.enableVertexAttribArray(attributeLocation);    

    // tell the program how to pull the data from our data array to its attributes(in/out) 
    // it always deals with ARRAY_BUFFER Gate .. so put your data in a GPU Buffer that is binded to that gate
    gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);
    
    // Bind the GPU Buffer (which is attatched to the ARRAY_BUFFER Gate) to the attribute buffer
    // So you are free to change the ARRAY_BUFFER Gate after that line ... the attribute & GPU Buffer is connected
    // attribute_location, size of 1 data, type of data, normalized, stride, offset
    gl.vertexAttribPointer(attributeLocation, size, gl.FLOAT, false, stride, offset);
}
