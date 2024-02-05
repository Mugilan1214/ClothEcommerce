const PORT = 5000;
const express = require('express');
const app = express();
const path = require('path');
const { pool } = require("./dbConfig");
const bcrypt= require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require("passport");
const nodemailer = require("nodemailer");
const multer = require('multer');

const initializePassport = require("./passportConfig");
initializePassport(passport);

app.set("view engine","ejs");
app.use(express.urlencoded({extended:false}));
app.use(express.static(__dirname + '/views'));
app.use(session({
    secret:"secret",

    resave:false,

    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Routes

app.get("/",(req,res) => {
    res.render('index');
});

app.get("/product", async (req, res) => {
    try {
      const allProductsQuery = await pool.query("SELECT * FROM products");
      const allProducts = allProductsQuery.rows;

        console.log("\n\nAll Products has been fetched");

      res.render("prod", { products: allProducts });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).send("Internal Server Error");
    }
});

app.get('/product/:productId', async (req, res) => {
    const productId = req.params.productId;

    try {
        const query = 'SELECT * FROM products WHERE product_id = $1';
        const values = [productId];
    
        const result = await pool.query(query, values);
    
        if (result.rows.length > 0) {
          const product = result.rows[0];
          res.render('product-detail', { product });
          console.log(product);
        } else {
          res.status(404).send('Product not found');
        }
        } catch (error) {
        console.error('Error handling product details:', error);
        res.status(500).send('Internal Server Error');
      }
});
  
app.get('/cart/:productId', async (req, res) => {
    const productId = req.params.productId;

    try {
        const query = 'SELECT * FROM products WHERE product_id = $1';
        const values = [productId];
    
        const result = await pool.query(query, values);
    
        if (result.rows.length > 0) {
          const product = result.rows[0];
          res.render('cart1', { product });
          console.log(product);
        } else {
          res.status(404).send('Product not found');
        }
        } catch (error) {
        console.error('Error handling product details:', error);
        res.status(500).send('Internal Server Error');
      }
  });

app.get("/checkout",(req,res) => {
    res.render('check');
});

app.get("/order",(req,res) => {
    res.render('order');
});

app.get("/contact",(req,res) => {
    res.render('contact');
});

app.get("/login",checkAuthenticated,(req,res) => {
    res.render('login');
});

app.get('/logout',(req,res) =>{
    req.logOut(req.user, err => {
        if(err) return next(err);
        res.redirect("/login");
    });
});

app.get("/dashboard",checkNotAuthenticated,(req,res) => {
    res.render('dash',{user: req.user.user_name});
});



app.get("/register-product",checkNotAuthenticated,(req,res) => {
    res.render('insert');
});

//Product Routes

app.get("/product1",(req,res) => {
    res.render('prod-det1');
});

app.get("/product2",(req,res) => {
    res.render('prod-det2');
});

app.get("/product3",(req,res) => {
    res.render('prod-det3');
});

app.get("/product4",(req,res) => {
    res.render('prod-det4');
});

app.get("/product5",(req,res) => {
    res.render('prod-det5');
});

app.get("/product6",(req,res) => {
    res.render('prod-det6');
});

app.get("/product7",(req,res) => {
    res.render('prod-det7');
});

app.get("/product8",(req,res) => {
    res.render('prod-det8');
});

app.get("/product9",(req,res) => {
    res.render('prod-det9');
});

app.get("/product10",(req,res) => {
    res.render('prod-det10');
});

app.get("/product11",(req,res) => {
    res.render('prod-det11');
});

app.get("/product12",(req,res) => {
    res.render('prod-det12');
});

app.get("/product13",(req,res) => {
    res.render('tshirt');
});

//Cart Routes

app.get("/cart1",(req,res) => {
    res.render('cart1');
});

app.get("/cart2",(req,res) => {
    res.render('cart2');
});

app.get("/cart3",(req,res) => {
    res.render('cart3');
});

app.get("/cart4",(req,res) => {
    res.render('cart4');
});

app.get("/cart5",(req,res) => {
    res.render('cart5');
});

app.get("/cart6",(req,res) => {
    res.render('cart6');
});

app.get("/cart7",(req,res) => {
    res.render('cart7');
});

app.get("/cart8",(req,res) => {
    res.render('cart8');
});

app.get("/cart9",(req,res) => {
    res.render('cart9');
});

app.get("/cart10",(req,res) => {
    res.render('cart10');
});

app.get("/cart11",(req,res) => {
    res.render('cart11');
});

app.get("/cart12",(req,res) => {
    res.render('cart12');
});

app.get("/cart13",(req,res) => {
    res.render('cart13');
});

//Login and Register Routes

app.post("/register",async (req,res) => {
    let {username,email,password} = req.body;

    console.log({
        username,
        email,
        password
    });

    let errors = [];

    if(!username || !email || !password){
        errors.push({message:'Please enter all the Fields.'});
    }

    if(password.length < 6){
        errors.push({message:'Password must be atleast 6 characters!'});
    }

    if(errors.length > 0){
        res.render('login',{errors});
    }
    else{
        let hashedPassword = await bcrypt.hash(password,10);
        console.log(hashedPassword);
        pool.query (
            `SELECT * FROM users
            WHERE email = $1`,[email],
            (err,results)=>{
                if(err){
                    throw err;
                }
                console.log(results.rows);
            
                if(results.rows.length > 0){
                    errors.push({message :'Email already registered.'});
                    res.render('login',{errors});
                }
                else{
                    pool.query(
                        `INSERT INTO users (user_name,email,password)
                        VALUES ($1,$2,$3)
                        RETURNING user_id,password`,[username,email,hashedPassword],
                        (err,results) => {
                            if(err){
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg","you have registered successfully.You can now proceed with Login.");
                            res.redirect('/login');
                        }
                    );
                }
            }
        );

        
    }

});

app.post("/login",passport.authenticate("local",{
    successRedirect : "/dashboard",
    failureRedirect : "login",
    failureFlash : true
}));

//CONTACT PAGE NODEMAILER ROUTE

app.post('/mail',(req,res) => {
    let{name,email,sub,message} = req.body;
    let msg = [];
    

    const transporter = nodemailer.createTransport({
        host : 'smtp.gmail.com',
        port : 465,
        secure : true,
        auth : {
            user :'blackstoredemo@gmail.com',
            pass : 'ddglnmxfvwphckgt'
        }
    });

    const details =  {
        from:req.body.email,
        to :'zykkogamerz@gmail.com',
        subject: req.body.sub,
        text: `From : ${req.body.email} Query : ${req.body.message}`
    }

    transporter.sendMail(details,(err,info) => {
        console.log(details);
        if(err){
            console.log(err);
        }else{
            console.log('Email sent! ' + info.response);
            msg.push({content :'Message Sent!'});
            res.render('contact',{msg});
        }
    });

});

//AUTHENTICATION FUNTION FOR VALIDATION

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/dashboard');
    }

    next();
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect('/login');
}
//MULTER UPLOAD

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'views/uploads/');
    },
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage: storage });

  app.post('/upload', checkNotAuthenticated,upload.single('image'), (req, res) => {
    try {
      const { title, description, price } = req.body;
      const user = req.user;
  
      if (!title || !description || !price) {
        return res.redirect('/?error=Title, description, and price are required');
      }
  
      const imagePath = 'uploads/' + req.file.filename;
  
      pool.query(
        'INSERT INTO products (title, description, price, image_path ,uid) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [title, description, price, imagePath, user.user_id],
        (error, results) => {
          if (error) {
            throw error;
          }
  
          const insertedProduct = results.rows[0];
          res.redirect(`/?success=Product uploaded successfully&productId=${insertedProduct.product_id}`);
          console.log(insertedProduct);
        }
      );
    } catch (error) {
      console.error(error);
      res.redirect('/?error=Internal Server Error');
    }
  });

//PORT LISTENER

app.listen(PORT,()=>{
    console.log('server listening on PORT : ' + PORT +"..");
});

//TESTING

app.get('/some-protected-route', checkNotAuthenticated, (req, res) => {
    // Access user data
    const user = req.user;

    // Log user data
    console.log('User id:', user.user_id);

});