/**
 * Redirects if the user is logged out.
 * Returns true if the user was logged in, otherwise returns false.
 */
export default async history => {
  await window.CWI.waitForInitialization()
  const isAuth = await window.CWI.isAuthenticated()
  if (!isAuth) {
    history.push('/')
  }
  return isAuth
}
