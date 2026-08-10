__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
func TestEncodeOverrideRules(t *testing.T) {
	assert.Nil(t, EncodeOverrideRules(nil))
	assert.Nil(t, EncodeOverrideRules([]string{}))
	assert.Equal(t, map[string]any{
		MetaKeyPermissionOverrideRules: []string{"gh *"},
	}, EncodeOverrideRules([]string{"gh *"}))
}
