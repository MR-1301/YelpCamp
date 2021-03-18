const express=require('express');
const app=express();

app.get('/',(req,res) => {
    res.send("Hello from the YelpCamp!!")
});

const port=3000;
app.listen(port, () => {
    console.log(`Listening on Port : ${port}`)
})