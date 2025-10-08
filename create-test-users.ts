import { authClient } from './lib/auth-client';

async function createTestUsers() {
  console.log('Creating test users with passwords...');

  const users = [
    {
      username: 'student1',
      password: 'password123',
      name: 'Student User',
      email: 'student@example.com',
      displayUsername: 'student1',
    },
    {
      username: 'teacher1',
      password: 'password123',
      name: 'Teacher User',
      email: 'teacher@example.com',
      displayUsername: 'teacher1',
    },
    {
      username: 'admin1',
      password: 'password123',
      name: 'Admin User',
      email: 'admin@example.com',
      displayUsername: 'admin1',
    },
    {
      username: 'system1',
      password: 'password123',
      name: 'System User',
      email: 'system@example.com',
      displayUsername: 'system1',
    },
  ];

  for (const userData of users) {
    try {
      const { data, error } = await authClient.signUp.email({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        username: userData.username,
        displayUsername: userData.displayUsername,
      });

      if (error) {
        console.error(`Error creating user ${userData.username}:`, error);
      } else {
        console.log(`Created user: ${userData.username}`);
      }
    } catch (error) {
      console.error(`Error creating user ${userData.username}:`, error);
    }
  }

  console.log('Test user creation completed!');
  console.log('You can now login with any of these users using password: password123');
}

createTestUsers().catch(console.error);