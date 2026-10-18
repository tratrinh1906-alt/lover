const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // Public, no-login mode by design. The service-role key stays on the server.
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'POST', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, DELETE, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ error: 'Chưa cấu hình Supabase trên Vercel.' });
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('flower_gifts_public').select('gift_date,note').order('gift_date');
      if (error) throw error;
      return res.status(200).json({ gifts: data || [] });
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.gift_date || '')) return res.status(400).json({ error: 'Ngày không hợp lệ.' });
      const note = typeof body.note === 'string' ? body.note.slice(0, 2000) : '';
      const { data, error } = await supabase.from('flower_gifts_public').upsert({ gift_date: body.gift_date, note }, { onConflict: 'gift_date' }).select('gift_date,note').single();
      if (error) throw error;
      return res.status(200).json({ gift: data });
    }
    const date = req.query && req.query.date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return res.status(400).json({ error: 'Ngày cần xóa không hợp lệ.' });
    const { error } = await supabase.from('flower_gifts_public').delete().eq('gift_date', date);
    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('flower_gifts API error:', err.message);
    return res.status(500).json({ error: 'Không thao tác được với dữ liệu. Kiểm tra cấu hình Supabase.' });
  }
};
