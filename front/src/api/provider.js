import { http } from './_http'

export
const retrive_provider_jwt = () =>
  http.get('/provider/jwt')
