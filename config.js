// Dominx CMS configuration. Paste your Supabase project URL and anon/public key here after setup.
window.DOMINX_CMS_CONFIG = {
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR-SUPABASE-ANON-KEY"
};

// Shared Supabase client: initialized once per page to prevent duplicate instances.
window.DOMINX_SUPABASE_CLIENT = (() => {
  const cfg = window.DOMINX_CMS_CONFIG;
  const valid = cfg && cfg.supabaseUrl && !cfg.supabaseUrl.includes('YOUR-PROJECT') && cfg.supabaseAnonKey && !cfg.supabaseAnonKey.includes('YOUR-SUPABASE');
  return valid && window.supabase ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
})();
