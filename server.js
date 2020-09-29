const express = require('express');
const app =express();

app.use(express.static(__dirname+'/assets'));

app.get('/', (req, res)=>{
    res.sendFile(__dirname+'/index.html');
});

app.listen(3000, ()=>{
    console.log(`Server is listening on port 3000...`);
});