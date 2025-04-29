const {faker} = require('@faker-js/faker');
const path = require("path")
const mysql = require('mysql2')
const express = require('express');
const { error } = require('console');
const methodOverride= require('method-override')
const {v4: uuidv4} = require('uuid')

const app = express()
const port = 8080;
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public/css')))
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'/views'))
const connection = mysql.createConnection({
  host:"localhost",
  user:"root",
  password:"vivi",
  database:"college"
})


let getUser = ()=> {
    return[
      faker.string.uuid(),
      faker.internet.username(), // before version 9.1.0, use userName()
      faker.internet.email(),
      faker.internet.password()
    ];
  }
 
  app.listen(port,()=>{
    console.log(`App is listening on port ${port}`)
  })
  
  app.get('/',(req,res)=>{
    let q='select count(*) as cnt from user'
    try{
      connection.query(q,(error,result)=>{
        if(error) throw error;
        users=result[0].cnt
        res.render('home.ejs',{users})
      })
    }
    catch(e){
      console.log(error,e)
      res.send("Failed to get total users")
    }
  })

  app.get('/user',(req,res)=>{
     let q=`select id,username,email from user `;
     try{
        
      connection.query(q,(error,result)=>{
        if(error) throw error;
        res.render('showuser.ejs',{result})
      })
     }
     catch(e){
      console.log('error: ',e)
     }
  })
  app.get('/user/:id/edit',(req,res)=>{
    let{id}= req.params;
    let q= `select username from user where id = ?`
    try{
      connection.query(q,[id],(error,result)=>{
        if(error) throw error;
        let username=result[0].username;
        res.render("edit.ejs",{id,username});
      })
    }
    catch(error){
      console.log(error)
    }
  })
  app.patch('/user/:id/edit',(req,res)=>{
    let {id}=req.params
    let {username,password}=req.body
    // console.log(username,password)
    let q= `select * from user where id='${id}' `
    try{
       connection.query(q,(error,result)=>{
          if(error) throw error;
          let dbPassword= result[0].password;
          console.log(dbPassword,password)
          if(password===dbPassword){
             let q=`update user set username=? where id=?`
             connection.query(q,[username,id],(error,result)=>{
              if(error) throw error;
              console.log(result);
              res.redirect('/user')
             })
          }
          else{
            res.send("Entered Wrong Password")
          }
       })
    }
    catch(error){
      console.log(error)
    }
  })

  app.get('/user/:id/delete',(req,res)=>{
    let{id}=req.params
    // to get username from database just to show that account belong to :
    let q=`select username from user where id=?`
    try{  
      connection.query(q,[id],(error,result)=>{
        if(error) throw error;
        username= result[0].username;
        console.log(username)
        res.render('delete.ejs',{id,username})
      })
    }
    catch(err){
      console.log(err)
    }
  })

  app.delete('/user/:id/delete',(req,res)=>{
    let{id}=req.params;
    let{password}=req.body;
    let q = `select * from user where id=?`
    try{
      connection.query(q,[id],(error,result)=>{
        if(error) throw error;
        let dbPassword= result[0].password;
        if(dbPassword===password){
          let q=`delete from user where id=?`
          connection.query(q,[id],(error,result)=>{
              res.redirect('/user')
          })
        }
        else{
          res.send("You have Entered Wrong Password")
        }
      })
    }
    catch(err){
      console.log(err)
    }
  })

  // for register new user
  app.get('/user/register',(req,res)=>{
    res.render('register.ejs')
  })
  app.post('/user/register',(req,res)=>{
    let{username,email,password}= req.body;
    try{
      let q='insert into user(id,username,email,password) values(?,?,?,?)';
      connection.query(q,[uuidv4(),username,email,password],(error,result)=>{
        if(error) throw err;
        res.redirect('/user')
      })
    }catch(err){
      console.log(err)
    }

  })