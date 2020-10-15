var AWS = require("aws-sdk");
const express = require("express");
const app = express();
require('dotenv').config();


AWS.config.update({
  region: "us-east-2",
  endpoint:"https://dynamodb.us-east-2.amazonaws.com",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
var docClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-2" });

module.exports.login = (req, res) => {
  const { id, password } = req.body;
  console.log(req.body);
  var params = {
    TableName: "user-zalo",
    Key: {
      userid: id,
    },
  };
  docClient.get(params, function (err, data) {
    if (err) {
      res.status(400).send("Bad req"+err);
    } else {
      if (!isEmpty(data)) {
        if (data.Item.password === password) res.json(data);
        else res.status(402).send("Sai tai khoan hoac mat khau");
      } else {
        res.status(402).send("Sai tai khoan hoac mat khau");
      }
    }
  });
};
const isEmpty = (v) => {
  return Object.keys(v).length === 0;
};
