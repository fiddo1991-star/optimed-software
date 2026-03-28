import { createClient } from '@supabase/supabase-js';

const url = 'https://olafyhrdppkjbmwnlnbv.supabase.co';
const key = 'sb_publishable_ro73Rqp3qf0ZpvKw9w1Zig_jOD8UYaq';
const supabase = createClient(url, key);

async function run() {
  const { data, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'ahsan@optimed.clinic',
    password: 'ahsan_password_786',
  });

  if (loginError) {
    console.error('Login Error:', loginError.message);
    return;
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: 'ahsan786'
  });

  if (updateError) {
    console.error('Update Error:', updateError.message);
  } else {
    console.log('Success! Password for ahsan changed to: ahsan786');
  }
}

run();
