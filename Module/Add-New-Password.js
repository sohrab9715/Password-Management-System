var mongoose = require('mongoose');
//mongoose.connect('mongodb+srv://sohrab:7631487916@pms-eawku.mongodb.net/PMS?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});
mongoose.connect('mongodb://localhost:27017/PMS');

var conn = mongoose.connection;
var Add_New_Password_schema = new mongoose.Schema({
   Password_Catagory:{type:String,required:true},
   Password_Details:{type:String,required:true},
   Date:{type:Date,default:Date.now}
  });
  var Add_New_Password_model = mongoose.model('Password-Details', Add_New_Password_schema);
  module.exports=Add_New_Password_model;  