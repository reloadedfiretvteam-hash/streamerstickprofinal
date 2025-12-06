import { getUncachableStripeClient } from '../server/stripeClient';

async function create6MonthProduct() {
  try {
    const stripe = await getUncachableStripeClient();
    
    // Create shadow product for 6-month IPTV ($50)
    const product = await stripe.products.create({
      name: 'SEO Semi-Annual',
      description: 'Semi-annual SEO service package',
    });
    
    console.log('Created product:', product.id, product.name);
    
    // Create price for $50 (5000 cents)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 5000,
      currency: 'usd',
    });
    
    console.log('Created price:', price.id, '$' + (price.unit_amount! / 100));
    console.log('\nAdd to database:');
    console.log(`Shadow Product ID: ${product.id}`);
    console.log(`Shadow Price ID: ${price.id}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

create6MonthProduct();
