// Dominx CMS configuration
window.DOMINX_CMS_CONFIG = {
  supabaseUrl: "https://dqnnugdbkjmxofctbpuk.supabase.co",
  supabaseAnonKey: "sb_publishable_34aaIm8FuPBU56nldGCSxw_0Uka7lc7"
};
window.DOMINX_SUPABASE_CLIENT = (() => {
  const cfg = window.DOMINX_CMS_CONFIG;
  return window.supabase ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
})();
