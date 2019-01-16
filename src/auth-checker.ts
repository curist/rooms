import { AuthChecker } from 'type-graphql'

import { Context } from 'src/types'

// TODO make this function more context aware
// so it may dynamically pull roles data from database contextually

// create auth checker function
export const authChecker: AuthChecker<Context> = ({ context: { user } }, roles) => {
  if (roles.length === 0) {
    // if `@Authorized()`, check only is user exist
    return user !== undefined
  }
  // there are some roles defined now

  if (!user) {
    // and if no user, restrict access
    return false
  }

  // TODO include roles
  // if (user.roles.some(role => roles.includes(role))) {
  //   // grant access if the roles overlap
  //   return true
  // }

  // no roles matched, restrict access
  return false
}
