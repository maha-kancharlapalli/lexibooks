/* ═══════════════════════════════════════════════════════════
   LEXIBOOKS — Supabase connection
   Fill in the two values below from your Supabase dashboard:
   Project Settings → API

   Both values are PUBLIC by design. The anon/publishable key is
   meant to ship in the page source; row level security in
   schema.sql is what protects the data, not this key.

   Never put the service_role / sb_secret_ key in this file. It
   bypasses row level security entirely and this file is served
   to every visitor.
   ═══════════════════════════════════════════════════════════ */

window.LEXI_SUPABASE = {
  url: 'https://jzgvytpbwtwqdjiyleup.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z3Z5dHBid3R3cWRqaXlsZXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mzk1NzgsImV4cCI6MjEwMTIxNTU3OH0.9figoXOyDkROFukbJn3uRuxOqomJ4fsQ0RfaP1KL8bs'
};

/* Thin wrapper over Supabase's REST API. Plain fetch on purpose —
   the site has no build step, and this avoids pulling a client
   library off a CDN just to insert a row. */
window.lexiDb = {
  get configured() {
    const { url, anonKey } = window.LEXI_SUPABASE;
    return !url.includes('YOUR-PROJECT-REF') && !anonKey.includes('YOUR-');
  },

  headers(extra = {}) {
    const { anonKey } = window.LEXI_SUPABASE;
    return {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      ...extra
    };
  },

  async insert(table, row) {
    if (!this.configured) throw new Error('Supabase is not configured yet');
    const response = await fetch(`${window.LEXI_SUPABASE.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify(row)
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${await response.text()}`);
    }
    return true;
  },

  /* Filtering, e.g.:
       lexiDb.select('books', { genre: 'cs.{Dystopian}', order: 'title' })
     `cs` is "contains" — it maps onto the GIN-indexed array columns,
     which is what makes "click any filter" fast. */
  async select(table, params = {}) {
    if (!this.configured) throw new Error('Supabase is not configured yet');
    const query = new URLSearchParams({ select: '*', ...params });
    const response = await fetch(
      `${window.LEXI_SUPABASE.url}/rest/v1/${table}?${query}`,
      { headers: this.headers() }
    );
    if (!response.ok) {
      throw new Error(`${response.status} ${await response.text()}`);
    }
    return response.json();
  }
};
