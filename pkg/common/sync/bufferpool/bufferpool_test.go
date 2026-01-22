package bufferpool

import "testing"

// TestGetAndPut checks that a buffer can be retrieved and returned.
func TestGetAndPut(t *testing.T) {
	pool := New[int](10)
	buf := pool.Get()
	if buf == nil {
		t.Errorf("Expected a buffer, got nil")
	}
	pool.Put(buf)
}

// TestBufferSize checks that the buffer size is correct.
func TestBufferSize(t *testing.T) {
	size := 10
	pool := New[int](size)
	buf := pool.Get()
	if len(*buf) != size {
		t.Errorf("Expected buffer size %d, got %d", size, len(*buf))
	}
	pool.Put(buf)
}

// TestBufferReuse checks that the buffer is reused.
func TestBufferReuse(t *testing.T) {
	pool := New[int](10)
	buf1 := pool.Get()
	pool.Put(buf1)
	buf2 := pool.Get()
	if buf1 != buf2 {
		t.Errorf("Expected the same buffer, got different buffers")
	}
}
