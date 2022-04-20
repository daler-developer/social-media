import pt from 'prop-types'
import { useEffect } from 'react'
import useLogin from '../hooks/useLogin'
import useCurrentUser from '../hooks/useCurrentUser'
import FullScreenLoader from './common/FullScreenLoader'
import UpdateProfileModal from './UpdateProfileModal'

const AppWrapper = ({ children }) => {
  const currentUser = useCurrentUser()

  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    
    if (token) {
      currentUser.refetch()
    }
  }, [])

  if (currentUser.isFetching) {
    return <FullScreenLoader />
  }

  return <>
    {children}
    <UpdateProfileModal />
  </>
}

AppWrapper.propTypes = {
  children: pt.any.isRequired
}

export default AppWrapper
