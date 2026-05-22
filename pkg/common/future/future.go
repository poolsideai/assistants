package future

import (
	"context"
	"sync"

	pkgerrors "github.com/pkg/errors"
)

// New returns a future: a value that will be available for reading at some point.
// Both reading and writing are threadsafe. Multiple concurrent readers are supported,
// and will all receive the same value when the future resolves.
// If you want to pass a result that can fail, make it a Future[lang.Result[T]]
func New[T any]() *RWFuture[T] {
	return &RWFuture[T]{
		ch: make(chan struct{}),
	}
}

// RWFuture see New and methods for docs
type RWFuture[T any] struct {
	val  T
	once sync.Once
	ch   chan struct{}
}

// Future provides threadsafe access to a value that will be
// available in future
type Future[T any] interface {
	// Await returns either T, or a cancellation error if ctx is cancelled
	// before it becomes available.
	Await(ctx context.Context) (T, error)
}

// Reader returns a read-only view on the future
func (f *RWFuture[T]) Reader() Future[T] {
	return f
}

// Resolve future to val. No effect if called more than once.
// All blocked callers of Await will be unblocked with this value
func (f *RWFuture[T]) Resolve(val T) {
	f.once.Do(func() {
		f.val = val
		close(f.ch)
	})
}

// Await returns either T, or a cancellation error if ctx is cancelled
// before it becomes available.
func (f *RWFuture[T]) Await(ctx context.Context) (T, error) {
	select {
	case <-ctx.Done():
		var t T
		return t, ctx.Err()
	case <-f.ch:
		return f.val, nil
	}
}

// Done is closed when value is available. Calls to MustGet after
// your thread has observed this are safe. Await is generally
// cleaner unless you need to compose the future with multiple channels.
func (f *RWFuture[T]) Done() <-chan struct{} {
	return f.ch
}

// TryGet immediately returns either val, true
// if the future is resolved, or zero value of T, false
// if not.
func (f *RWFuture[T]) TryGet() (T, bool) {
	select {
	case <-f.ch:
		return f.val, true
	default:
		var t T
		return t, false
	}
}

// MustGet returns the future value, used with Done. MUST only be
// used within block that has observed the Done()
// channel being closed:
//
//	select {
//	case <-fut.Done():
//		value := fut.MustGet()
//		// use value safely
//	case <-otherCh:
//		// race with another channel
//	case <-ctx.Done():
//		// handle timeout/cancellation
//	}
func (f *RWFuture[T]) MustGet() T {
	select {
	case <-f.ch:
		return f.val
	default:
		panic(pkgerrors.New("MustGet called without observing Done() channel closure first, contract violation"))
	}
}
