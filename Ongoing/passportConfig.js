const LocalStrategy = require("passport-local").Strategy;
const { authenticate } = require("passport");
const {pool} = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport){
const authenticateUser = (email,password,done)=>{

    pool.query (
        `SELECT * FROM users WHERE email = $1`,
        [email],
        (err,results)=>{
            if(err){
                throw err;
            }

            console.log(results.rows);

            if(results.rows.length > 0 ){
                const user = results.rows[0];

                bcrypt.compare(password,user.password,(err,isMatch)=>{
                    if(err){
                        throw err;
                    }

                    if(isMatch){
                        return done(null,user);
                    }else{
                        return done(null,false,{message : "Password is not Correct."});
                    }
                });
            }else{
                return done(null,false,{message : "Email not registered."});
            }
        }
    );

};

    passport.use(
        new LocalStrategy(
            {
                usernameField : "email",
                passwordField : "password"
            },
            authenticateUser
        )
    );

    passport.serializeUser((user,done)=>done(null,user.user_id));

    passport.deserializeUser((user_id,done)=>{
        pool.query(`SELECT * FROM users WHERE user_id = $1`,[user_id],(err,results)=>{
            if(err){
                throw err;
            }
            return done(null,results.rows[0]);
        });
    });
}

module.exports = initialize;