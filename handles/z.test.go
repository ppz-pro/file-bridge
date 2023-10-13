package handles

import (
	"io"
	"log/slog"
	"os"
	"time"
)

type Animal struct {
	Name string `json:"name"`
	Year int    `json:"year"`
}

func test_json(ctx request) int {
	ani, code := read_json_end[Animal](ctx)
	if code != SUCCESS {
		return code
	}
	code = write_json_end(ctx, ani)
	if code != SUCCESS {
		return code
	}
	return END
}

func test_query(ctx request) int {
	q := ctx.req.URL.Query()
	year := q["year"]
	tel := q["tel"]
	write_json_end(ctx, append(year, tel...))
	return END
}

func test_upload(ctx request) int {
	file, err := os.Create("hello.txt")
	if err != nil {
		panic("文件创建失败")
	}

	defer func() {
		err := file.Close()
		if err != nil {
			slog.Error("file closed twice")
		}
	}()

	size := 20
	chunk := make([]byte, size)

	write := func(length int) {
		len_write, err := file.Write(chunk[0:length])
		time.Sleep(time.Second)
		slog.Info("uploading",
			"size", size,
			"length", length,
			"len_write", len_write,
			"chunk", string(chunk),
			"err", err,
		)
	}

	for {
		length, err := ctx.req.Body.Read(chunk)
		if err != nil {
			if err == io.EOF {
				write(length)
				slog.Info("read finished")
			} else {
				slog.Error("error on reading", "err", err)
			}
			break
		} else {
			write(length)
		}
	}
	ctx.res.Write([]byte("finished"))
	return END
}
