var express = require('express');
var usermodule=require('../Module/SignUp');
var Pass_Catagory_module=require('../Module/password-catagory');
var Add_Password_Module=require('../Module/Add-New-Password');
var bcrypt=require('bcrypt');
const { check, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
var get_pass_cat=Pass_Catagory_module.find({});
var get_pass_details= Add_Password_Module.find({});

var router = express.Router();

router.use(express.static("public"));

/* GET home page. */

  function checkloginuser(req,res,next)
  {
    var UserToken=localStorage.getItem('UserToken'); 
    try {
      var decoded = jwt.verify(UserToken, 'LoginToken');
    } catch(err) {
     res.redirect('/');
    }
    next();
  }

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}


  function checkemail(req,res,next)
  {
    var getemail=req.body.txtemail;
    var email=usermodule.findOne({email:getemail});
    email.exec(function(err,data){
      if(err) throw err;
      if(data)
      {
        return res.render('Signup', { title: 'Password Management System',message:'This email already registerd try another email.' });

      } 
      next();
    });
  }
  function checkusername(req,res,next)
  {
    var getusername=req.body.txtusername;
    var username=usermodule.findOne({username:getusername});
    username.exec(function(err,data){
      if(err) throw err;
      if(data)
      {
        return res.render('Signup', { title: 'Password Management System',message:'This username already registerd try another username.' });

      } 
      next();
    });
  }

  router.get('/', function(req, res, next) {
   
    res.render('index', { title: 'Password Management System',message:'' });
   
  
  });

router.get('/login', function(req, res, next) {

  res.render('login', { title: 'Password Management System',message:'' });
 
 
});

router.post('/login', function(req, res, next) {
  var username=req.body.txtusername;
  var password=req.body.txtpassword;
  var checkusername=usermodule.findOne({username:username});
  checkusername.exec(function(err,data)
  {
      if(err) throw err;
      var getuserid=data._id;
      var getpwd=data.password;
      if(bcrypt.compareSync(password,getpwd))
      {
       var token = jwt.sign({ userid: getuserid }, 'LoginToken');
       localStorage.setItem('UserToken', token);
       localStorage.setItem('LoginUser', username);
        res.redirect('/Dashboard');
      //res.render('index', { title: 'Password Management System',message:'Login Successfully' });

      }
      else
      {
      res.render('login', { title: 'Password Management System',message:'Invaild Username and Password' });

      }

  });
});

router.get('/Dashboard',checkloginuser, function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');
  res.render('Dashboard', { title: 'Password Management System',loginusername:loginuser,message:'' });
});

router.get('/signup', function(req, res, next) {
 
  res.render('Signup', { title: 'Password Management System',message:'' });
});

router.post('/signup',checkusername,checkemail, function(req, res, next) {
    var getusername=req.body.txtusername;
    var getemail=req.body.txtemail;
    var getpassword=req.body.txtpassword;
    var cnfpassword=req.body.txtcnfpassword;
    if(getpassword!=cnfpassword)
    {
      res.render('Signup', { title: 'Password Management System',message:'Password Not Matched!' });

    }
    else
    {
      getpassword=bcrypt.hashSync(req.body.txtpassword,10);
      var userdetails=new usermodule({
        username:getusername,
        email:getemail,
        password:getpassword
      });
      userdetails.save(function(err,data)
      {
          if(err) throw err;
          res.render('Signup', { title: 'Password Management System',message:'User registerd Successfully' });
  
      });
  
    }
   
});

router.get('/PasswordCatagory/',checkloginuser, function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');
  var perpage = 5;
  var page= req.params.page || 1;
  get_pass_cat.skip((perpage*page)-perpage).limit(perpage).exec(function(err,data){
    if(err) throw err;
    Pass_Catagory_module.countDocuments({}).exec(function(err,count){
    res.render('Password_Catagory', { title: 'Password Management System',
    loginusername:loginuser,
    records:data,
    current:page,
    pages:Math.ceil(count/perpage)
  });
  });
  });
});
router.get('/PasswordCatagory/:page',checkloginuser, function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');
  var perpage = 5;
  var page= req.params.page || 1;
  get_pass_cat.skip((perpage*page)-perpage).limit(perpage).exec(function(err,data){
    if(err) throw err;
    Pass_Catagory_module.countDocuments({}).exec(function(err,count){
    res.render('Password_Catagory', { title: 'Password Management System',
    loginusername:loginuser,
    records:data,
    current:page,
    pages:Math.ceil(count/perpage)
  });
  });
  });
});
router.post('/search',function(req,res,next)
{
    var searchvalue=req.body.txtsearch;
   
    if(searchvalue !='')
    {
       var fltparameter={$and:[{Password_Catagory:searchvalue}]};

    }
    else
    {
       var fltparameter={};
    }
    var fltdata= Pass_Catagory_module.find(fltparameter);
  fltdata.exec(function(err,data)
  {
    if(err) throw err;
    res.render('Password_Catagory', { title: 'Password Management System',loginusername:loginuser, errors:'',success:'',records:data});

  });
});
router.get('/PasswordCatagory/delete/:id',checkloginuser, function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');
  var pass_cat_id=req.params.id;
  var pass_del_data=Pass_Catagory_module.findByIdAndDelete(pass_cat_id);
  pass_del_data.exec(function(err,data){
    if(err) throw err;
    res.redirect('/PasswordCatagory');
   });
});

router.get('/PasswordCatagory/edit/:id',checkloginuser, function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');
  var pass_cat_id=req.params.id;
  var pass_edit_data=Pass_Catagory_module.findById(pass_cat_id);
  pass_edit_data.exec(function(err,data){
    if(err) throw err;
    res.render('Edit_Pass_Cat', { title: 'Password Management System',loginusername:loginuser, errors:'',success:'',records:data,id:pass_cat_id});

   });
});

router.post('/PasswordCatagory/edit/',checkloginuser, function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');
  var pass_cat_id=req.body.id;
  var pass_cat_name=req.body.txtpasswordcatagory;  
  var pass_update_data=Pass_Catagory_module.findByIdAndUpdate(pass_cat_id,{Password_Catagory:pass_cat_name});
  pass_update_data.exec(function(err,data){
    if(err) throw err;
      res.redirect('/PasswordCatagory');
   });
});

router.get('/Add-New-Catagory',checkloginuser, function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');
 
  res.render('AddNew_Catagory', { title: 'Password Management System',loginusername:loginuser,errors:'',success:''});

 
});

router.post('/Add-New-Catagory',checkloginuser,[check('txtpasswordcatagory','Enter Password Catagory Name').isLength({ min: 1})],function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser'); 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log();
    res.render('AddNew_Catagory', { title: 'Password Management System',loginusername:loginuser,errors:errors.mapped(),success:'' });

  }
  else
  {
    var pass_cat=req.body.txtpasswordcatagory;
    var pass_cat_details=new Pass_Catagory_module
    ({
      Password_Catagory:pass_cat,
    });
    pass_cat_details.save(function(err,data){
      if(err) throw err;
  res.render('AddNew_Catagory', { title: 'Password Management System',loginusername:loginuser,errors:'',success:'Password catagory inserted successfully'});

    });

  }
});

router.get('/Add-New-Password',checkloginuser, function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');
  get_pass_cat.exec(function(err,data){
    if(err) throw err;
  res.render('AddNew_Password', { title: 'Password Management System',loginusername:loginuser,errors:'',records:data,success:'' });

  });
});

router.post('/Add-New-Password',checkloginuser,[check('txtpassworddetails','Enter your Password Details').isLength({ min: 1})], function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');
  const errors = validationResult(req);
  get_pass_cat.exec(function(err,data){
    if(err) throw err;
  res.render('AddNew_Password', { title: 'Password Management System',loginusername:loginuser,records:data, errors:'',success:'Password inserted successfully' });

  });
  if (!errors.isEmpty()) {
    console.log();
    res.render('AddNew_Password', { title: 'Password Management System',loginusername:loginuser,records:'',errors:errors.mapped(),success:'' });

  }
  else
  {
  var password_details=new Add_Password_Module
  ({
    Password_Catagory:req.body.password_catagory,
    Password_Details:req.body.txtpassworddetails,
  });
  password_details.save(function(err,data){
    if(err) throw err;
  res.render('AddNew_Password', { title: 'Password Management System',loginusername:loginuser,errors:'',success:'Password inserted successfully'});

  });
}
});


router.get('/View-All-Password',checkloginuser, function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');
  var perpage = 3;
  var page= req.params.page || 1;
  get_pass_details.skip((perpage*page)-perpage).limit(perpage).exec(function(err,data){
    if(err) throw err;
    Add_Password_Module.countDocuments({}).exec(function(err,count){
    res.render('View_All_Password', { title: 'Password Management System',
    loginusername:loginuser,
    records:data,
    current:page,
    pages:Math.ceil(count/perpage)
  });
  });
  });
});
router.get('/View-All-Password/:page',checkloginuser, function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');
  var perpage = 3;
  var page= req.params.page || 1;
  get_pass_details.skip((perpage*page)-perpage).limit(perpage).exec(function(err,data){
    if(err) throw err;
    Add_Password_Module.countDocuments({}).exec(function(err,count){
    res.render('View_All_Password', { title: 'Password Management System',
    loginusername:loginuser,
    records:data,
    current:page,
    pages:Math.ceil(count/perpage)
  });
  });
  });
});
router.get('/View-All-Password/delete/:id',checkloginuser, function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');
  var pass_details_id=req.params.id;
  var pass_delete_data=Add_Password_Module.findByIdAndDelete(pass_details_id);
  pass_delete_data.exec(function(err,data){
    if(err) throw err;
    res.redirect('/View-All-Password');

  });
});

router.get('/View-All-Password/edit/:id',checkloginuser, function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');
  var id=req.params.id;
  var pass_edit_data=Add_Password_Module.findById({_id:id});
  pass_edit_data.exec(function(err,data){
    if(err) throw err;
    get_pass_cat.exec(function(err,data1){
    res.render('Edit_Pass_details', { title: 'Password Management System',loginusername:loginuser, errors:'',success:'',record:data,records:data1,id:id});
 });
});
});

router.post('/View-All-Password/edit/',checkloginuser, function(req, res, next) {
  var loginuser=localStorage.getItem('LoginUser');


  var pass_update_details=Add_Password_Module.findByIdAndUpdate(req.body.id,{
    Password_Catagory:req.body.password_catagory,
    Password_Details:req.body.txtpassworddetails,
  });
  pass_update_details.exec(function(err,data){
    if(err) throw err;
      res.redirect('/View-All-Password');
   });

});

router.get('/logout', function(req, res, next) {
  localStorage.removeItem('UserToken');
  localStorage.removeItem('LoginUser');
  res.redirect('/');
});


module.exports = router;
