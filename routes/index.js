const express = require('express');
const router = express.Router();
require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const jwtString = process.env.JWT_STRING

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

let nextProductId = 0;
router.get('/addProduct', async(req, res, next) => {
  const newProduct = new Product({
    name:req.query.name,
    price:req.query.price,
    ourId:'' + nextProductId
  })
  try{
    if(!req.session.isLoggedIn){
      res.status(401).json({ msg: 'You are not authorized to view this resource' });
    }else{
      await newProduct.save()
      res.send({success:true})
    }

  }catch(err){
    res.json({message:err.message})
    res.send({success:false}, "Product addition unsuccessfull")
  }
})

router.get('/getAllProducts', async(req, res, next) => {
  try{
     const getAll = Product.find()
     res.json(getAll)
    // res.send({success:true})

  }catch(err){
    res.json({message:err.message})
    res.send({success:false}, "Cannot fetch products")
  }
})
//--------------------------------------------------------USER AUTHENTICATION---------------------------------------------------------//
let nextUserId = 0;
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
  const user = await Users.create({
    email: newUser.email,
    pass: hash,
    userId: newUser.userId
  })
  console.log(hash)
 // const create = await newUser.save()
  res.json(user)
  }catch(err){
    res.json({message:err.message})
  }
})

router.get('/showUserEmails', async(req,res)=>{
  try{
    const getUsers = await Users.find()
    res.status(201).json(getUsers)
  }catch(err){
    res.json({message:err.message})
  }
})


router.get('/signin', async (req, res, next) => {
  try{
     const exists = await Users.findOne({email:req.query.email})
     if(!exists){
      res.json({message:"User does not exist"})
     }else{
      const check = bcrypt.compare(req.query.pass,exists.pass)
      if(check){
        req.session.isLoggedIn = true
        req.session.theLoggedInUser  = exists
        console.log(req.session)
      }
      check ? res.json(exists) : res.json({message:"incorrect password"})
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
