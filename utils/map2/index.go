package map2

type Map2[K comparable, V any] map[K]V

func Arm[K comparable, V any](raw map[K]V) Map2[K, V] {
	return Map2[K, V](raw)
}

func (m Map2[K, V]) Each(cb func(V, K)) {
	for k, v := range m {
		cb(v, k)
	}
}
