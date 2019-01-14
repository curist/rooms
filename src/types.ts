import { Request, Response } from 'express'
import { User } from './modules/user/User'

export interface Context {
  req: Request;
  res: Response;
  user?: User;
}
