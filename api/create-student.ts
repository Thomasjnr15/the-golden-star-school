import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const accessToken = authHeader.split(' ')[1];

    const anonClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await anonClient.auth.getUser(accessToken);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { data: profile, error: profileError } = await anonClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const {
      registrationNumber,
      fullName,
      password,
      class: studentClass,
      stream,
      requestId,
    } = req.body;

    if (!registrationNumber || !fullName || !password || !studentClass) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const serviceClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const email = `gss_${registrationNumber.replace(/\//g, '_')}@goldenstarschool.internal`;

    const { data: authData, error: createAuthError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'student', full_name: fullName },
    });

    if (createAuthError) {
      return res.status(500).json({ error: `Auth error: ${createAuthError.message}` });
    }

    if (requestId) {
      const { data: result, error: rpcError } = await serviceClient.rpc('approve_registration', {
        p_request_id: requestId,
        p_registration_number: registrationNumber,
        p_class: studentClass,
        p_user_id: authData.user.id,
        p_stream: stream || null,
      });

      if (rpcError) {
        return res.status(500).json({ error: `RPC error: ${rpcError.message}` });
      }
      if (result?.error) {
        return res.status(500).json({ error: result.error });
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
        return res.status(500).json({ error: `Insert error: ${insertError.message}` });
      }

      const SSS_CLASSES = ['SSS 1', 'SSS 2', 'SSS 3'];
      if (SSS_CLASSES.includes(studentClass) && stream) {
        const { data: newStudent } = await serviceClient
          .from('students')
          .select('id')
          .eq('user_id', authData.user.id)
          .single();

        if (newStudent) {
          await serviceClient.rpc('auto_assign_stream_subjects', {
            p_student_id: newStudent.id,
            p_stream: stream,
            p_assigned_by: user.id,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      email,
      userId: authData.user.id,
    });

  } catch (error: any) {
    console.error('Error in create-student:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
