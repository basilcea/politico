import joi from 'joi';
import * as schema from '../helpers/schema';
const validate = (value, scheme, res, next) => {
    joi.validate(value, scheme, { abortEarly: false, stripUnknown: true }, (err) => {
        if (err) {
          const errMsg = [];
          for (let i = 0; i < err.details.length; i++) {
            errMsg.push(err.details[i].message);
          }
          return res.status(400).json({
            status: 400,
            error: errMsg,
          });

        }
      else { next(); }
      });
  };
class validation {
  static signup(req, res, next) { validate(req.body, schema.signupSchema, res, next); }

  static login(req, res, next) { validate(req.body, schema.loginSchema, res, next); }

  static forgotPassword(req, res, next) { validate(req.body, schema.forgotpasswordSchema, res, next); }

  static changePassword(req, res, next) { validate(req.body, schema.changePasswordSchema, res, next); }

  static resetPassword(req, res, next) { validate(req.body, schema.resetPasswordSchema, res, next); }

  static editProfile(req, res, next) { validate(req.body, schema.editProfileSchema, res, next); }

  static createParty(req, res, next) { validate(req.body, schema.createPartySchema, res, next); }

  static editParty(req, res, next) { validate(req.body, schema.editPartySchema, res, next); }

  static checkId(req, res, next) { validate(req.params.id, schema.id, res, next); }

  static createOffice(req, res, next) { validate(req.body, schema.createOfficeSchema, res, next); }

  static editOffice(req, res, next) { validate(req.body, schema.editOfficeSchema, res, next); }

  static createInterest(req, res, next) { validate(req.body, schema.createInterestSchema, res, next); }

  static editInterest(req, res, next) { validate(req.body, schema.editInterestSchema, res, next); }

  static createPetition(req, res, next) { validate(req.body, schema.createPetitionSchema, res, next); }

  static editPetition(req, res, next) { validate(req.body, schema.editPetitionSchema, res, next); }

  static createVote(req, res, next) { validate(req.body, schema.createVoteSchema, res, next); }

  static createCandidate(req, res, next) { validate(req.body, schema.createCandidateSchema, res, next); }

}
export default validation;

