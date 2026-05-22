package ignore

// Option configures a Matcher. Options are applied in order, with later options
// taking precedence over earlier ones.
type Option func(*options)

type options struct {
	ignoreBinary bool
	gitIgnore    bool
}

func (o *options) apply(opts []Option) {
	for _, opt := range opts {
		opt(o)
	}
}

// withIgnoreBinary configures the matcher to ignore binary files.
// Binary detection uses content-based MIME type detection.
func withIgnoreBinary() Option {
	return func(o *options) {
		o.ignoreBinary = true
	}
}

// withGitIgnore enables reading and applying patterns from .gitignore files
// in the filesystem.
func withGitIgnore() Option {
	return func(o *options) {
		o.gitIgnore = true
	}
}
