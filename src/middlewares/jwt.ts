import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config'

export default async function(req, res, next) {
  if(req.cookies.jwt) {
    const token = req.cookies.jwt
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch(err) {
      // err
    }
  }

  next()
}
