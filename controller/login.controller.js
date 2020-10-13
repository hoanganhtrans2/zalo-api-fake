var AWS = require("aws-sdk");
const express = require('express');
const app = express();

AWS.config.update({
    region: "us-east-2"
  });
var docClient = new AWS.DynamoDB.DocumentClient({region: "us-east-2"});


module.exports.login = (req, res) => {

    const {id, password} = req.body;
    console.log(req.body);
    var params = {
        TableName: 'user-zalo',
        Key:{
            "userid": id,
        }
    };   
    docClient.get(params, function(err, data) {
        if (err) {
            res.status(400).send('Bad req')
        } else {
            if(data.Item.password===password)
                res.json(data);
            else
                res.status(402).send('Sai tai khoan hoac mat khau');
            
        }
    });
}



