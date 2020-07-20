var mongoose = require('mongoose');
//mongoose.connect('mongodb+srv://sohrab:7631487916@pms-eawku.mongodb.net/PMS?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});
mongoose.connect('mongodb://localhost:27017/PMS');

var conn = mongoose.connection;
var password_catagory_schema = new mongoose.Schema({
   Password_Catagory:{type:String,required:true,index:{unique:true}},
   date:{type:Date,default:Date.now}
  });
  var password_catagory_model = mongoose.model('Password_Categories', password_catagory_schema);
  module.exports=password_catagory_model;  