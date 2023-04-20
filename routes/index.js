/*
If i wanted to make this application more secure, i would replace the get requests that handle the inputting of data with post requests, which means the addProduct, sign up, and sign in
routes would be post requests instead of get requests. Sending in your data via a get request poses a security risk as all the data somebody would need to access your sensetive information
will be sitting in the url for anyone to see.
*/

const express = require('express');
const router = express.Router();
require('dotenv').config()
const bcrypt = require('bcryptjs')
const isAuth = require('../middleware/protect').isAuth

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  ourId: { type: String, required: true },
  anArray: { type: Array, required: false },
  anObject: { type: Object, required: false }
})

const Product = mongoose.model('Product', productSchema) // 'Product' refers to the collection, so maps products collection to productSchema; see lecture notes
let defaultId = 0;

router.get('/addProduct',isAuth, async(req, res, next) => {
  const newProduct = new Product({
    name:req.query.name,
    price:req.query.price,
    ourId: '' + defaultId++
  })
  try{
      await newProduct.save()
      res.send({success:true,message:"Product addition successfull"})
  }catch(err){
    res.json({message:err.message})
    res.send({success:false,message:"Product addition unsuccessfull"})
  }
})

router.get('/getAllProducts', async(req, res, next) => {
  try{
   const getAll = await Product.find()
    res.send({success:true,products:getAll})
  }catch(err){
    res.send({message:err.message,success:false})
  }
})


//--------------------------------------------------------USER AUTHENTICATION---------------------------------------------------------//
const nextUserId = 0;
const userSchema = new Schema({
  email: { type: String, required: true },
  pass: { type: String, required: true },
  userId: {type:String, required:true}
})

const Users = mongoose.model('Users', userSchema) 


router.get('/signup', async(req, res, next) => {
  const newUser = new Users({
    email: req.query.email,
    pass: req.query.pass,
    userId: '' + nextUserId
  })
  try{
  const hash = bcrypt.hashSync(newUser.pass + process.env.EXTRA_BCRYPT_STRING, 12)
  await Users.create({
    email: newUser.email,
    pass: hash,
    userId: newUser.userId
  })
  console.log(hash)
  res.send({success:true,message:"Successfully signed up"})
  }catch(err){
    res.send({message:err.message,success:false})
  }
})

router.get('/showUserEmails', async(req,res)=>{
  try{
    const getUsers = await Users.find()
    res.send({success:true,Allusers:getUsers})
  }catch(err){
    res.send({message:err.message,success:false})
  }
})


router.get('/signin', async (req, res, next) => {
  try{
     const exists = await Users.findOne({email:req.query.email})
     if(!exists){
      res.json({message:"User does not exist"})
     }else{
      const check = bcrypt.compare(req.query.pass, exists.pass)
      if(check){
        req.session.isLoggedIn = true
        req.session.theLoggedInUser  = exists
        console.log(req.session)
      }
      console.log(req.query.pass)
      console.log(exists.pass)
      console.log(check)
      check ? res.send({success:true,message:"Welcome"}) : res.send({success:false,message:"incorrect password"})
     }
   }catch(err){
    res.json({message:err.message})
   }
})

router.get('/protected', async(req,res)=>{
   try{
        if(!req.session.isLoggedIn){
          res.status(401).json({ msg: 'You are not authorized to view this resource' });
        }else{
          res.send(`Welcome!`);
        }
   }catch(err){

   }
})

router.get('/signout', (req, res, next) => {
  let loggedIn = req.session.isLoggedIn
  req.session.isLoggedIn = false
  res.send('Signed out successfully')
})

exports.routes = router
