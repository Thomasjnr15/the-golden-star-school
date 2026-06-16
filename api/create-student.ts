const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }
    const accessToken = authHeader.split(' ')[1];

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

    const anonClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(accessToken);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { data: profile } = await anonClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { registrationNumber, fullName, password, class: studentClass, stream, requestId } = req.body;

    if (!registrationNumber || !fullName || !password || !studentClass) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const email = `gss_${registrationNumber.replace(/\//g, '_').toLowerCase()}@goldenstarschool.internal`;

    const { data: authData, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'student', full_name: fullName },
    });

    if (createError) {
      return res.status(500).json({ error: 'Auth error: ' + createError.message });
    }

    if (requestId) {
      const { error: rpcError } = await serviceClient.rpc('approve_registration', {
        p_request_id: requestId,
        p_registration_number: registrationNumber,
        p_class: studentClass,
        p_user_id: authData.user.id,
        p_stream: stream || null,
      });

      if (rpcError) {
        return res.status(500).json({ error: 'RPC error: ' + rpcError.message });
      }
    } else {
      const { error: insertError } = await serviceClient.from('students').insert([{
        user_id: authData.user.id,
        full_name: fullName,
        registration_number: registrationNumber,
        class: studentClass,
        stream: stream || null,
      }]);

      if (insertError) {
        return res.status(500).json({ error: 'Insert error: ' + insertError.message });
      }
    }

    return res.status(200).json({
      success: true,
      email,
      userId: authData.user.id,
    });

  } catch (error) {
    console.error('Error in create-student:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};
