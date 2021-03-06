/* eslint-disable no-unused-expressions */
/* eslint-disable quote-props */
import nodemailer from 'nodemailer';
import pool, { redisClient, mailer } from '../migrate';
import 'dotenv';
import '@babel/polyfill';
import jwt from 'jsonwebtoken';
import authHelper from '../helpers/auth';

/**
  * Represents a controller  class for all user specific acitvities
  * @class userController
 */


class userController {
  /* ---------------- User methods ---------------------------*/

  /**
    * Create  a user
    * @async requestPromises
    * @method signup
    * @params {object} request - The form data to be inputted ;
    * @return {object} response - The status code and data ;
   */
  static async signup(req, res) {
    const {
      firstname, lastname, othername, password, email, phoneNumber, registerAs, passportUrl, isAdmin
    } = req.body;
    /** try and catch async block */
    try {
      const getEmail = 'SELECT email, phonenumber from users';
      const emailing = await pool.query(getEmail);
      if (authHelper.isUniqueEmail(email, emailing) !== null) {
        return res.status(422).json({
          'status': 422,
          'error': 'Email already exists',
        });
      }
      if (authHelper.isUniquePhone(phoneNumber, emailing) !== null) {
        return res.status(422).json({
          'status': 422,
          'error': 'phoneNumber already exists',
        });
      }

      const hashPassword = authHelper.hashPassword(password);

      const createUser = `INSERT INTO users(firstname, lastname, othername, email,phoneNumber, password, passporturl ,registerAs ,isAdmin)

      VALUES($1, $2, $3,$4, $5, $6 ,$7 ,$8 ,$9)`;
      const values = [
        firstname.trim(), lastname, othername, email, phoneNumber, hashPassword, passportUrl, registerAs.trim(), isAdmin,
      ];
      await pool.query(createUser, values);

      const loginUser = 'SELECT * FROM users WHERE email = $1';
      const { rows } = await pool.query(loginUser, [email]);
      if (rows[0].id === 1) {
        const makeAdmin = 'Update users SET isAdmin = $1 where id=$2';
        await pool.query(makeAdmin, [true, 1]);
      }

      // generate a user token for that user id
      const token = authHelper.generateToken(rows[0].id, rows[0].firstname, rows[0].registeras, rows[0].isadmin);
      return res.status(201).json({
        'status': 201,
        'data': [{
          'token': token,
          'user': rows[0],
        }],
      });
    } catch (error) {
      return res.status(500).json({
        'status': 500,
        'error': error.toString(),
      });
    }
  }

  /**
    * Login  a user
    * @async requestPromises
    * @method login
    * @params {object} request - The form data to be inputted
    * @return {object} response - The status code and data including login token.
    *
   */
  static async login(req, res) {
  // login user similar to get user

    const getUser = 'SELECT * FROM users WHERE email = $1';
    try {

      let token = req.headers.authorization.split(' ')[1];
      if (token === null) {
        token = 'null';
      }
      const invalid = (callback) => {
        redisClient.lrange('token', 0, 100, (err, result) => callback(result));
      };
      invalid((result) => {
        if (result.indexOf(token) < 0) {
          return res.status(400).json({
            'status': 400,
            'error': 'You are already logged in',
          });
        }
        if (token !== 'null' && result.includes(token) === true) {
          return res.status(401).json({
            'status': 401,
            'error': 'Expired Token',
          });
        }
      });
      const { email, password } = req.body;
      const { rows } = await pool.query(getUser, [email]);
      if (!rows[0]) {
        return res.status(404).json({
          'status': 404,
          'error': 'Email does not exist',
        });
      }
      // check if the inputted password is the same password created
      if (!authHelper.comparePassword(rows[0].password, password)) {
        return res.status(404).json({
          'status': 404,
          'error': 'Incorrect password',
        });
      }
      // generate a token for the user
      const newtoken = authHelper.generateToken(rows[0].id, rows[0].firstname, rows[0].registeras , rows[0].isadmin);
      // check if token
      return res.status(200).json({
        'status': 200,
        'data': [{
          'token': newtoken,
          'user': rows[0],
        }],
      });
    } catch (error) {
      return res.status(501).json({
        'status': 501,
        'error': error.toString(),
      });
    }
  }

    /**
    * Logout  a user

    * @method logout
    * @return {object} response - The status code and response message.
    *
   */
  static async logout(req, res) {
    // check if user is logged in
    // logout user
    // save token in redis
    const token = req.headers.authorization.split(' ')[1];
    try {
      const invalid = (callback) => {
        redisClient.lrange('token', 0, 100, (err, result) => callback(result));
      };
      invalid((result) => {
        if (result.indexOf(token) > -1) {
          return res.status(400).json({
            'status': 400,
            'error': 'You are already logged out',
          });
        }
        redisClient.LPUSH('token', token);
        return res.status(200).json({
          'status': 200,
          'data': 'You are logged out',
        });

      });

    } catch (error) {
      return res.status(400).json({
        'status': 500,
        'error': error.toString(),
      });
    }

  }
   /**
    *  Decrypt a user token
     * @method decrypt
    * @params {string} token - the token to be decrypted
    * @return {object} response - The status code and response message.
    *
   */


  static async decrypt(req, res) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decrypt = await jwt.verify(token, process.env.SECRET);
      return res.status(200).json({
        'status': 200,
        'data': {
          'id': decrypt.id,
          'firstname': decrypt.firstname,
          'status': decrypt.registerAs,
          'admin': decrypt.isAdmin,
        },

      });
    } catch (err) {
      return res.status(500).json({
        'status': 500,
        'error': err.toString(),
      });
    }
  }

  /**
    *  Send password reset link
    * @method forgotpassword
    * @params {string} email - the email which link will be sent
    * @return {object} response - The status code and response message.
    *
   */
  static async forgotPassword(req, res) {
    const { email } = req.body;
    const allEmails = 'Select * from users where email=$1';
    const { rows } = await pool.query(allEmails, [email]);
    try {
      if (!rows[0]) {
        return res.status(404).json({
          'status': 404,
          'error': 'Email does not exist',
        });
      }

      const token = authHelper.generateToken(rows[0].id, rows[0].isadmin);
      const info = {
        from: process.env.EMAIL || process.env.TEST_EMAIL ,
        to: rows[0].email,
        subject: 'Password Reset Link',
        html: `<p> You have asked for a password reset on <a href='https://basilcea.github.io/politico/UI/'>Politico</a></p>
                  <p> To reset password click on the Reset Password link below <p><br>
                  <p><b><a href="/resetpassword/${token}"> Reset password</a></b>
                  <p><i> kindly ignore this mail if you did not request for a password reset </i> </p>
                  <p><img src='../UI/STATIC/logo.png'>`,
      };
      mailer.sendMail(data)
        .then(info => res.status(200).json({
        'status': 200,
        'data': info || mailer.getTestMessageUrl(info),
      }))
        .catch(error => res.status(400).json({
          'status': 400,
          error,
        }));
    }
    catch (err) {
      return res.status(500).json({
        'status': 500,
        'error': err.toString(),
      });
    }

  }

  /**
    *  reset password
    * @method resetpassword
    * @return {object} response - The status code and data.
    *
   */
  static async resetPassword(req, res){
    try {
      const { newPassword } = req.body;
      const id = Number(req.body.id);
      const hashedPassword = authHelper.hashPassword(newPassword);
      const NewPassword = 'UPDATE users SET password = $1 where id=$2 returning password';
      const insertNewPassword = await pool.query(NewPassword, [hashedPassword, id]);
      if (!insertNewPassword.rows[0]) {
        return res.status(404).json({
          'status': 404,
          'error': 'User does not exist',
        });
      }
      return res.status(200).json({
        'status': 200,
        'data': {
          'password': insertNewPassword.rows,
          'message': 'password change successful',
        },
      });
    }
    catch (error) {
      return res.status(500).json({
        'status': 500,
        'error': error.toString(),
      });
    }
  }
}

export default userController;
