const { getSupabase } = require('../config/supabase');

const adminOnly = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized. Token required.' });
    }
    
    // Fast path: if token role is already admin, verify with Supabase
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error || !user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { adminOnly };
