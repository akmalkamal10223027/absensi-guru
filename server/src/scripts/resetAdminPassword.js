import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

async function resetAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Get all users
        const { data: users, error } = await supabase.from('users').select('*, roles(name)');
        console.log('--- CURRENT USERS IN SUPABASE ---');
        console.log(users);

        const admin = users?.find(u => 
            u.username === 'admin' || 
            u.email?.includes('admin') || 
            (u.roles?.name && u.roles.name.toLowerCase().includes('admin')) ||
            u.role === 'admin'
        );

        if (admin) {
            console.log('Found admin user:', admin.id, admin.username, admin.email);
            const { error: updateErr } = await supabase
                .from('users')
                .update({ 
                    password_hash: hashedPassword, 
                    is_active: true,
                    username: 'admin'
                })
                .eq('id', admin.id);
            
            if (updateErr) {
                console.error('Failed to update admin password:', updateErr);
            } else {
                console.log('SUCCESS: Set admin password to admin123!');
            }
        } else {
            console.log('No admin user found in DB. Creating admin user...');
            const { data: roles } = await supabase.from('roles').select('*');
            console.log('Roles:', roles);
            const adminRole = roles?.find(r => r.name?.toLowerCase().includes('admin'));

            const { data: newUser, error: createErr } = await supabase.from('users').insert({
                username: 'admin',
                email: 'admin@sman1.sch.id',
                password_hash: hashedPassword,
                full_name: 'Administrator',
                role_id: adminRole?.id || null,
                is_active: true
            }).select().single();

            if (createErr) {
                console.error('Failed to create admin user:', createErr);
            } else {
                console.log('SUCCESS: Created admin user with password admin123!');
            }
        }
    } catch (err) {
        console.error('Script error:', err);
    }
}

resetAdmin();
