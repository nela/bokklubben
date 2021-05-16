import { ControllerBase } from '.';
import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../utils/admin';
import firebase from 'firebase';

import { CreateMemberDto } from '../models/dtos/CreateMemberDto';
import { Http400Error } from '../utils/errors/HttpErrors';
import validationMiddleware from '../middleware/validationMiddleware';

class AutheticationController implements ControllerBase {
  public router = Router();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/register',
      validationMiddleware(CreateMemberDto),
      this.registration
    );
  }

  private registration = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    if (req.body.password !== req.body.confirmPassword)
      return next(new Http400Error('Passwords must match'));

      console.log("inne her")

    const newMember: CreateMemberDto = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword
    };

    try {
        console.log("try her")

      const doc = await db.doc(`/members/${newMember.email}`).get();
      if (doc.exists)
        return next(new Http400Error('Email is already registered.'));

        console.log(doc)
      const data = await firebase
        .auth()
        .createUserWithEmailAndPassword(newMember.email, newMember.password);
      let memberId, token;
      console.log(data.user);

      if (data.user !== null) {
        memberId = data.user.uid;
        token = data.user.getIdToken();
      }

      const credentials = {
        createdAt: new Date().toISOString(),
        memberId
      };
      console.log(credentials)
   //   await db.doc(`/members/${newMember.email}`).set(credentials);
      return res.send({ token });
    } catch (error) {
        return next(error);
    }
  };
}

export default AutheticationController;
