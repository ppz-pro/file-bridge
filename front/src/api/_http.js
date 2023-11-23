
const _http = new Proxy({}, {
  get: (_, http_method) => {
    if (http_method == 'get')
      return (uri, params, options) =>
        fetch(build_uri_with_params(uri, params), options)
    else
      return (uri, data, options) =>
        fetch(uri, {
          body: JSON.stringify(data),
          ...options,
        })
  }
})

const build_uri_with_params = (uri, params) => {
  if (!params) return uri

  return `${uri}?${
    Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('=')
  }`
}

export
class JSON_error {
  constructor(error) {
    this.code = error.error
    this.data = error.data
  }
}

// JSON result
export
const http = new Proxy({}, {
  get: (_, http_method) =>
    (uri, data, options) =>
      _http[http_method](uri, data, options)
        .then(async res => {
          const json = await res.json()
          if (!res.error)
            return json.data
          throw JSON_error(json)
        })
})
