var AWS = require("aws-sdk");
const express = require("express");
const app = express();
require("dotenv").config();

AWS.config.update({
  region: "us-east-2",
  endpoint: "https://dynamodb.us-east-2.amazonaws.com",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
var docClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-2" });

//lấy danh sách bạn bè
module.exports.getListFriends = async (req, res) => {
  const { id } = req.body;
  try {
    const listFriends = await getStringSetFriend(id);
    console.log(listFriends);
    const params = {
      TableName: "user-zalo",
      AttributesToGet: ["userid", "username", "imgurl"],
      ScanFilter: {
        userid: {
          ComparisonOperator: "IN",
          AttributeValueList: listFriends,
        },
      },
    };
    docClient.scan(params, function (err, data) {
      console.log(data);
      if (err) res.send({ err: err });
      // an error occurred
      else res.json(data); // successful response
    });
  } catch (error) {
    res.send(error);
  }
};

//lấy danh sách lơi mời kết bạn
module.exports.getListFriendsInvitations = async (req, res) => {
  const { id } = req.body;
  try {
    const listFriendsInvitations = await getStringSetInvitations(id);
    const params = {
      TableName: "user-zalo",
      AttributesToGet: ["userid", "username", "imgurl"],
      ScanFilter: {
        userid: {
          ComparisonOperator: "IN",
          AttributeValueList: listFriendsInvitations,
        },
      },
    };
    docClient.scan(params, function (err, data) {
      console.log(data);
      if (err) res.send({ err: err });
      // an error occurred
      else res.json(data); // successful response
    });
  } catch (error) {
    res.send(error);
  }
};

//thêm bạn bè
module.exports.acceptFriendRequest = async (req, res) => {
  const { idYeuCauKetBan, idDongYKetBan } = req.body;
  try {
    // const user1addfrienduser2 = await addUserId(id1, id2);
    // const user2addfrienduser1 = await addUserId(id2, id1);
    const result = await addItemToStringSet(
      idYeuCauKetBan,
      idDongYKetBan,
      "listfriends"
    );
    const result1 = await addItemToStringSet(
      idDongYKetBan,
      idYeuCauKetBan,
      "listfriends"
    );
    const result3 = await deleteItemInStringSet(
      idDongYKetBan,
      idYeuCauKetBan,
      "listfriendinvitations"
    );
    res.status(200).json({ message: "Them ban thanh cong" });
  } catch (error) {
    res.send(error);
  }
};

module.exports.deleteFriend = async (req, res) => {
  const { id, idIsDeleted } = req.body;
  console.log(id + idIsDeleted);
  try {
    let result = await deleteItemInStringSet(id, idIsDeleted, "listfriends");
    let result1 = await deleteItemInStringSet(idIsDeleted, id, "listfriends");
    res.status(200).json({ message: "Xoa ban thanh cong" });
  } catch (error) {
    res.json({ err: error });
  }
};

// idsender sẽ được lưu trong listfriendinvitations của idreceiver
module.exports.sendFriendInvitatios = async (req, res) => {
  const { idsender, idreceiver } = req.body;
  try {
    let result = await addItemToStringSet(
      idsender,
      idreceiver,
      "listfriendinvitations"
    );
    res.json(result);
  } catch (error) {
    res.json(error);
  }
};

//Thêm vào danh sách bạn của nhau
// let addUserId = (id1, id2) => {
//   return new Promise((resolve, reject) => {
//     var params = {
//       TableName: "user-zalo",
//       Key: {
//         userid: id1,
//       },
//       ExpressionAttributeNames: {
//         "#L": "listfriends",
//       },
//       ExpressionAttributeValues: {
//         ":id": [id2],
//         ":empty_list": [],
//       },
//       UpdateExpression:
//         "SET #L = list_append(if_not_exists(#L, :empty_list), :id)",
//     };
//     docClient.update(params, function (err, data) {
//       if (err) {
//         console.log(err, err.stack);
//         reject({ err: err });
//       } // an error occurred // successful response
//       else {
//         console.log(data);
//         resolve(data);
//       }
//     });
//   });
// };

// láya danh sách bạn bè
let getStringSetFriend = (id) => {
  return new Promise((resolve, reject) => {
    var params = {
      TableName: "user-zalo",
      Key: {
        userid: id,
      },
    };
    docClient.get(params, function (err, data) {
      if (err) {
        reject(err);
      } else if (!data.Item.listfriends) {
        reject({ err: "Chua co ban be" });
      } else {
        let arr = JSON.stringify(data.Item.listfriends);
        resolve(JSON.parse(arr));
      }
    });
  });
};
//lay danh sach loi moi ket ban
let getStringSetInvitations = (id) => {
  return new Promise((resolve, reject) => {
    var params = {
      TableName: "user-zalo",
      Key: {
        userid: id,
      },
    };
    docClient.get(params, function (err, data) {
      if (err) {
        reject(err);
      } else if (!data.Item.listfriendinvitations) {
        console.log(data);
        reject({ err: "Khong có lời mời kết bạn" });
      } else {
        let arr = JSON.stringify(data.Item.listfriendinvitations);
        resolve(JSON.parse(arr));
      }
    });
  });
};

/**********************************************************************/
let deleteItemInStringSet = (id, idIsDeleted, StringSetAtt) => {
  return new Promise((resolve, reject) => {
    let params = {
      TableName: "user-zalo",
      Key: {
        userid: id,
      },
      ExpressionAttributeValues: {
        ":idToDelete": docClient.createSet([idIsDeleted]),
      },
      ExpressionAttributeNames: {
        "#AtrToDelete": StringSetAtt,
      },
      UpdateExpression: "DELETE #AtrToDelete :idToDelete",
    };
    docClient.update(params, (err, data) => {
      if (err) {
        console.log("loi o day");
        reject(err);
      } else {
        resolve({ message: "Xoa thanh cong" });
      }
    });
  });
};
/*****************************************/
let addItemToStringSet = (sender, receiver, StringSetAtt) => {
  return new Promise((resolve, reject) => {
    let params = {
      TableName: "user-zalo",
      Key: {
        userid: receiver,
      },
      ExpressionAttributeValues: {
        ":idIsAdded": docClient.createSet([sender]),
      },
      ExpressionAttributeNames: {
        "#Atr": StringSetAtt,
      },
      UpdateExpression: "ADD #Atr :idIsAdded",
    };
    docClient.update(params, (err, data) => {
      if (err) {
        console.log("loi o day");
        reject(err);
      } else {
        resolve({ message: "gửi lời mời kết bạn thành công" });
      }
    });
  });
};
