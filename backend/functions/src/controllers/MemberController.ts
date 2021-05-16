import { Router, Request, Response } from 'express';
import { Member } from '../models/entities/Member';
import { db } from '../utils/admin';
import ControllerBase from '../interfaces/ControllerBase';
//import { plainToClass } from 'class-transformer';

class MemberController implements ControllerBase {
  public path = '/members';
  public router = Router();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(this.path, this.getMembers);
  }

  private getMembers = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const snapshot = await db.collection('members').get();
      let members: Member[] = [];
      snapshot.forEach((doc): void => {
        const m: Member = {
          id: doc.id,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName
        };
        members.push(m);
      });
      return res.send(members);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  };

}

export default MemberController;
