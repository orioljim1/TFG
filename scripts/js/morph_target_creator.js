//Script that is used to create a new array with the morphtargets using the 
//source vertices and goal vertices where they match in the desired geometry
const fs = require('fs');

const { vertices } = JSON.parse(fs.readFileSync('./vertices_nose.json'));

console.log(vertices);

function moprph_array(source, goal, indices){
    for (let i = 0; i < source.length; i++) {
        if(indices.includes(i)) source[i] = goal[i];
        
    }
    return source
}



