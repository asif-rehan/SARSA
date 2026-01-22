#!/bin/bash

echo "🗄️  Resetting database for email verification testing..."

# Stop the database
echo "Stopping database..."
npm run db:stop

# Remove the data volume
echo "Removing database volume..."
docker volume rm sarsa-lab3_postgres_data 2>/dev/null || echo "Volume already removed or doesn't exist"

# Start fresh database
echo "Starting fresh database..."
npm run db:start

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Run migrations
echo "Running migrations..."
npm run db:migrate

echo "✅ Database reset complete! You can now test email verification from scratch."
echo ""
echo "Next steps:"
echo "1. Go to http://localhost:3000/auth/signin"
echo "2. Click 'Sign Up' tab"
echo "3. Create account with email/password"
echo "4. Check your email for verification link"