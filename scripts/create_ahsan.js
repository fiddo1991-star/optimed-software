import { createClient } from '@supabase/supabase-js';

const url = 'https://olafyhrdppkjbmwnlnbv.supabase.co';
const key = 'sb_publishable_ro73Rqp3qf0ZpvKw9w1Zig_jOD8UYaq';
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.auth.signUp({
    email: 'ahsan@optimed.clinic',
    password: 'ahsan_password_786',
    options: {
      data: {
        full_name: 'Ahsan',
        clinic_id: 'aebe40b1-0ec3-4e16-b64d-e71ada68a374'
      }
    }
  });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success! Account created for Ahsan.');
  }
}

run();
