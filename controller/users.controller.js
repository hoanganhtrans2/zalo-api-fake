var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-2",
});
var docClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-2" });

module.exports.getUser = (req, res) => {
  id = req.params.userid;
  console.log(id);
  var params = {
    TableName: "user-zalo",
    Key: {
      userid: id,
    },
  };
  docClient.get(params, function (err, data) {
    if (err) {
      res.status(400).send("Bad Request");
    } else {
      res.json(data);
    }
  });
};
module.exports.updateInfo = (req, res) => {
  const { id, password, birthday, gender, username } = req.body;
  console.log(req.body);
  const params = {
    TableName: "user-zalo",
    Key: {
      userid: id,
    },
    UpdateExpression: "set birthday = :b, gender=:g, user_name=:u",
    ExpressionAttributeValues: {
      ":b": birthday,
      ":g": gender,
      ":u": username,
      ":ps": password,
    },
    ConditionExpression: "password = :ps",
    ReturnValues: "ALL_NEW",
  };

  docClient.update(params, function (err, data) {
    if (err) {
      res.status(400).send("Bad Request!!");
    } else {
      res.json(data);
    }
  });
};
module.exports.register = (req, res) => {
  const { id, password, birthday, gender, username } = req.body;

  const promise = new Promise(function (resolve, reject) {
    var params1 = {
      TableName: "user-zalo",
      Key: {
        userid: id,
      },
    };
    docClient.get(params1, function (err, data) {
      if (err) {
        reject(res.status(400).send(err));
      } else {
        console.log(data);
        if (isEmpty(data)) {
          resolve(res.status(200));
          console.log('1empty')
        }
        else{
            reject(res.status(400).send("tài khoản đã tồn tại"));
        }
      }
    });
  });
  promise.then(function(status){
    var params2 = {
        TableName: "user-zalo",
        Item: {
          userid: id,
          password: password,
          birthday: birthday,
          gender: gender,
          user_name: username,
        },
      };
      docClient.put(params2, function (err, data) {
        if (err) {
          res.status(400).send("Bad Request!!"+ err);
        } else {
            console.log('2 da vao put' );
            console.log( JSON.stringify(data, null, 2))
          res.json(data);
        }
      })
  }).catch(err=>res.status(400).send(err));
};

const isEmpty = (v) => {
  return Object.keys(v).length === 0;
};
