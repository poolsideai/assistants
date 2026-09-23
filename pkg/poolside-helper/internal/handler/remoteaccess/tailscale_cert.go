__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"encoding/pem"
	"errors"
__POOL_SYNTHETIC_IMPORT_BASELINE__
	"log/slog"
	"os"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// limits on every enable. It must still cover the current MagicDNS name:
	// after a tailnet rename or re-login the cached cert can be unexpired yet
	// issued for a different name, and serving it would break the phone's TLS
	// with no fallback.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
			time.Now().Before(leaf.NotAfter.Add(-24*time.Hour)) &&
			leaf.VerifyHostname(dnsName) == nil {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	// `tailscale cert` provisions/renews the cert. The macOS GUI variant is
	// sandboxed and cannot write files outside its own container, so have it
	// print the PEM data to stdout ("-") and write the files ourselves.
	out, err := tailscaleCommand(ctx, bin, "cert",
		"--cert-file", "-", "--key-file", "-", dnsName).Output()
	if err != nil {
		if exitErr, ok := errors.AsType[*exec.ExitError](err); ok {
			return tls.Certificate{}, "", fmt.Errorf("tailscale cert: %w: %s", err, clipOutput(exitErr.Stderr))
		}
		return tls.Certificate{}, "", fmt.Errorf("tailscale cert: %w", err)
	}
	certPEM, keyPEM, err := splitCertPEM(out)
	if err != nil {
		return tls.Certificate{}, "", err
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	cert, err = tls.X509KeyPair(certPEM, keyPEM)
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

	// Cache to disk so future enables skip issuance; serving works either way.
	if werr := writeCertCache(certPath, keyPath, certPEM, keyPEM); werr != nil {
		slog.Warn("remoteaccess: could not cache tailscale cert", "error", werr)
	}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// writeCertCache persists the cert/key pair, removing both files if either
// write fails so a later reuse can't load a fresh cert paired with a stale
// key (which would only be caught at handshake time).
func writeCertCache(certPath, keyPath string, certPEM, keyPEM []byte) error {
	if err := os.WriteFile(certPath, certPEM, 0o600); err != nil {
		os.Remove(certPath)
		os.Remove(keyPath)
		return err
	}
	if err := os.WriteFile(keyPath, keyPEM, 0o600); err != nil {
		os.Remove(certPath)
		os.Remove(keyPath)
		return err
	}
	return nil
}

// splitCertPEM separates `tailscale cert` stdout — the certificate chain
// followed by the private key — into certificate and key PEM bytes. Blocks are
// matched by type (any "* PRIVATE KEY" is a key) rather than treating every
// non-certificate block as key material, so an unexpected block can't silently
// corrupt the key.
func splitCertPEM(out []byte) (certPEM, keyPEM []byte, err error) {
	rest := out
	for {
		var block *pem.Block
		block, rest = pem.Decode(rest)
		if block == nil {
			break
		}
		switch {
		case block.Type == "CERTIFICATE":
			certPEM = append(certPEM, pem.EncodeToMemory(block)...)
		case strings.HasSuffix(block.Type, "PRIVATE KEY"):
			keyPEM = append(keyPEM, pem.EncodeToMemory(block)...)
		}
	}
	if len(certPEM) == 0 || len(keyPEM) == 0 {
		return nil, nil, fmt.Errorf("tailscale cert output missing certificate or key")
	}
	return certPEM, keyPEM, nil
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
	out, err := tailscaleCommand(ctx, bin, "status", "--json").Output()
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
