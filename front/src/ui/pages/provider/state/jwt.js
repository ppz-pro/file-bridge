import { useMemo } from 'react'
import { retrive_provider_jwt } from '../../../../api/provider'
import { useMount } from '../../../../common/hooks'
import { UseState } from '../../../../common/state_helper'

const useState_jwt = UseState()

export
const useVal_jwt = () => {
  const [jwt, set_jwt] = useState_jwt()
  useMount(async () => {
    if (!jwt) {
      const new_jwt = await retrive_provider_jwt()
      localStorage.setItem('ccz_bridge_jwt', new_jwt)
      set_jwt(new_jwt)
    }
  })

  return jwt
}

export
const useVal_provider_id = () => {
  const jwt = useVal_jwt()
  return useMemo(
    () => {
      if (!jwt) return null
      const payload = jwt.split('.')[1]
      const decoded_payload = JSON.parse(atob(payload))
      console.log('provider id:', decoded_payload.sub)
      return decoded_payload.sub
    },
    [jwt],
  )
}
