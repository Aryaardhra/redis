let express = require('express');
let axios = require('axios');
let redis = require('redis');
const { response } = require('express');
let port = process.env.PORT || 8711;
const app = express();

 const client = redis.createClient({
    host: 'localhost',
    port: 6379
 })

 app.get('/data', (req,res)=>{
let userInput = req.query.country.trim();
userInput = userInput?userInput:'India'
const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${userInput}`;

return client.get(userInput,function(err,result){
    if(result){
        const output = JSON.parse(result);
        res.send(output)
    }else{
        axios.get(url)
        .then((response)=>{
            const output = response.data;
            client.setex(userInput,3600,JSON.stringify({source:'Redis Cache',output}))
            res.send({source:'API Response', output})
        })
    }
})
})

 app.listen(port,()=>{
    console.log(`listening on port ${port}`)
 })