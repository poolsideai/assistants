package data

// linkedListItem represents a single node in the linked list.
type linkedListItem[T any] struct {
	val  T
	next *linkedListItem[T]
	prev *linkedListItem[T]
}

// LinkedList implements a generic singly-linked list.
// The zero value for LinkedList is an empty list ready to use.
type LinkedList[T any] struct {
	next *linkedListItem[T]
	last *linkedListItem[T]
	size int
}
