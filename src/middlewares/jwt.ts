import jwt from 'jsonwebtoken'
import { JWT_SECRET } from 'src/config'

export const verify = token => jwt.verify(token, JWT_SECRET)

export default async function(req, res, next) {
  if(req.cookies.jwt) {
    const token = req.cookies.jwt
    try {
      req.user = verify(token)
    } catch(err) {
      // err, maybe it's token expired
    }
  }

  next()
}
