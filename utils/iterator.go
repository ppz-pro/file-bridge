package utils

func Map_for_each[K comparable, V any](target map[K]V, cb func(K, V)) {
	for key, value := range target {
		cb(key, value)
	}
}

func For_each[Item any](target []Item, cb func(Item, int)) {
	for index, item := range target {
		cb(item, index)
	}
}

func Filter[Item any](target []Item, cb func(Item, int) bool) []Item {
	result := []Item{}
	for index, item := range target {
		if cb(item, index) {
			result = append(result, item)
		}
	}
	return result
}

func Map[Input any, Output any](target []Input, cb func(Input, int) Output) []Output {
	result := []Output{}
	for index, item := range target {
		result = append(result, cb(item, index))
	}
	return result
}
