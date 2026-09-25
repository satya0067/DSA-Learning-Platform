const { getSupabase } = require('../config/supabase');

const getNotifications = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const formatted = (notifications || []).map(n => ({
      _id: n.id,
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.is_read,
      createdAt: n.created_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: error.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAllRead
};
