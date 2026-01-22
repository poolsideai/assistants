// Package bufferpool provides a generic buffer pool implementation for reusing slices of any type.
package bufferpool

import "sync"

// BufferPool is a generic buffer pool that reuses slices of type T.
type BufferPool[T any] struct {
	size int
	pool sync.Pool
}

// New creates a new BufferPool with the specified buffer size.
func New[T any](size int) *BufferPool[T] {
	if size <= 0 {
		panic("bufferpool: size must be positive")
	}

	return &BufferPool[T]{
		size: size,
		pool: sync.Pool{
			New: func() any {
				buf := make([]T, size)
				return &buf
			},
		},
	}
}

// Get retrieves a buffer from the pool. It has length and capacity equal to the
// pool size and is set to be filled with the zero value of T. It is important
// that the returned slice is not resized, as it will be returned to the pool.
// The slice pointer returned here should be the same value that is used when
// calling Put.
func (p *BufferPool[T]) Get() *[]T {
	b := p.pool.Get().(*[]T)
	p.Reset(b)
	return b
}

// Reset zeroes out all elements in the buffer.
func (p *BufferPool[T]) Reset(buf *[]T) {
	if buf == nil {
		return
	}

	*buf = (*buf)[:p.size]
	for i := range *buf {
		var zero T
		(*buf)[i] = zero
	}
}

// Put returns a buffer to the pool. It should be the exact same pointer that
// was returned by Get. If the slice was shortened (len, not cap), it will be
// resized back to the pool size. If a buf of the wrong capacity is provided, it
// will be discarded.
func (p *BufferPool[T]) Put(buf *[]T) {
	if buf == nil {
		return
	}

	// Ensure the buffer is the correct size
	if cap(*buf) != p.size {
		return
	}

	if len(*buf) != p.size {
		*buf = (*buf)[:p.size]
	}

	p.pool.Put(buf)
}
