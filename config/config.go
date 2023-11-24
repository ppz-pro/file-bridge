package config

type _Config struct {
	jwt_secret []byte
}

var config = _Config{
	jwt_secret: []byte("omamimamiho"),
}

func Get_jwt_secret() []byte {
	return config.jwt_secret
}
