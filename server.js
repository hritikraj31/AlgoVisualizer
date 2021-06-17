const express = require('express');
const app =express();

app.use(express.static(__dirname+'/assets'));

app.get('/', (req, res)=>{
    res.sendFile(__dirname+'/index.html');
});
process.env.PORT = process.env.PORT || 3000;
app.listen(process.env.PORT, process.env.IP, ()=>{
    console.log(`Server is listening on port ${process.env.PORT}...`);
});