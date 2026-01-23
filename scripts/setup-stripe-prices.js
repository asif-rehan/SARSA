#!/usr/bin/env node

/**
 * Stripe Price Setup Script
 * 
 * This script creates the necessary Stripe products and prices for the SaaS application.
 * Run this script to set up your Stripe products and get the real price IDs.
 * 
 * Usage:
 *   node scripts/setup-stripe-prices.js
 * 
 * Make sure you have STRIPE_SECRET_KEY set in your .env.local file.
 */

const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const plans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 900, // $9.00 in cents
    features: ['Basic features', 'Email support', '1 user', '5 projects'],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 2900, // $29.00 in cents
    features: ['All basic features', 'Priority support', '5 users', '20 projects', 'Advanced analytics'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 9900, // $99.00 in cents
    features: ['All pro features', '24/7 support', 'Unlimited users', '100 projects', 'Custom integrations'],
  },
];

async function createStripeProducts() {
  console.log('🚀 Setting up Stripe products and prices...\n');

  const priceIds = {};

  for (const plan of plans) {
    try {
      console.log(`Creating product: ${plan.name}...`);

      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: `${plan.name} - ${plan.features.join(', ')}`,
        metadata: {
          planId: plan.id,
        },
      });

      console.log(`✅ Product created: ${product.id}`);

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: {
          planId: plan.id,
        },
      });

      console.log(`✅ Price created: ${price.id}`);
      priceIds[plan.id] = price.id;

    } catch (error) {
      console.error(`❌ Error creating ${plan.name}:`, error.message);
    }

    console.log(''); // Empty line for readability
  }

  return priceIds;
}

async function updateEnvFile(priceIds) {
  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update the price IDs in the env file
    if (priceIds.basic) {
      envContent = envContent.replace(
        /STRIPE_BASIC_PRICE_ID=.*/,
        `STRIPE_BASIC_PRICE_ID=${priceIds.basic}`
      );
      envContent = envContent.replace(
        /NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=.*/,
        `NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=${priceIds.basic}`
      );
    }

    if (priceIds.pro) {
      envContent = envContent.replace(
        /STRIPE_PRO_PRICE_ID=.*/,
        `STRIPE_PRO_PRICE_ID=${priceIds.pro}`
      );
      envContent = envContent.replace(
        /NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=.*/,
        `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${priceIds.pro}`
      );
    }

    if (priceIds.enterprise) {
      envContent = envContent.replace(
        /STRIPE_ENTERPRISE_PRICE_ID=.*/,
        `STRIPE_ENTERPRISE_PRICE_ID=${priceIds.enterprise}`
      );
      envContent = envContent.replace(
        /NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=.*/,
        `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=${priceIds.enterprise}`
      );
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env.local with new price IDs');

  } catch (error) {
    console.error('❌ Error updating .env.local:', error.message);
    console.log('\n📝 Please manually update your .env.local file with these price IDs:');
    Object.entries(priceIds).forEach(([planId, priceId]) => {
      const upperPlanId = planId.toUpperCase();
      console.log(`STRIPE_${upperPlanId}_PRICE_ID=${priceId}`);
      console.log(`NEXT_PUBLIC_STRIPE_${upperPlanId}_PRICE_ID=${priceId}`);
    });
  }
}

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables.');
    console.log('Please add your Stripe secret key to .env.local');
    process.exit(1);
  }

  if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    console.warn('⚠️  Warning: You are using a live Stripe key. This script will create real products.');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  try {
    const priceIds = await createStripeProducts();
    
    if (Object.keys(priceIds).length > 0) {
      await updateEnvFile(priceIds);
      
      console.log('\n🎉 Stripe setup complete!');
      console.log('\n📋 Summary:');
      Object.entries(priceIds).forEach(([planId, priceId]) => {
        console.log(`  ${planId}: ${priceId}`);
      });
      
      console.log('\n🔄 Please restart your development server to use the new price IDs.');
    } else {
      console.log('❌ No price IDs were created. Please check the errors above.');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();