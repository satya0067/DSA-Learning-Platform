const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const { getSupabase } = require('./config/supabase');

const createOrPromoteAdmin = async () => {
  try {
    const supabase = getSupabase();
    const targetEmail = process.argv[2] || 'admin@codecorps.com';

    console.log(`🔍 Checking user with email: ${targetEmail}...`);

    const { data: existingUser } = await supabase
      .from('users')
      .select('id, username, email, role')
      .eq('email', targetEmail.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', existingUser.id);

      if (updateError) throw updateError;

      console.log(`✅ User "${existingUser.username}" (${existingUser.email}) has been successfully promoted to "admin"!`);
      process.exit(0);
    }

    // Otherwise create default admin user
    const defaultPassword = process.argv[3] || 'Admin@123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const { data: newAdmin, error: insertError } = await supabase
      .from('users')
      .insert({
        username: 'HashiraAdmin',
        email: targetEmail.toLowerCase().trim(),
        password: hashedPassword,
        role: 'admin',
        bio: 'Supreme Hashira Administrator of the Code Corps.',
        level: 10,
        xp: 2500,
        rank: 'Hashira ⚔️',
        streak: 10,
        avatar: '',
        breathing_style: 'Sun'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('🎉 Admin account created successfully in Supabase!');
    console.log(`📧 Email:    ${newAdmin.email}`);
    console.log(`🔑 Password: ${defaultPassword}`);
    console.log(`🛡️ Role:     ${newAdmin.role}`);
    console.log(`\nYou can now log in at /pages/auth/login.html using these credentials.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create/promote admin user:', error.message);
    process.exit(1);
  }
};

createOrPromoteAdmin();
