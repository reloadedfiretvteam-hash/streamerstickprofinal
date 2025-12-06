import { getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { realProducts } from '@shared/schema';

interface ShadowProduct {
  name: string;
  description: string;
  price: number;
  metadata: {
    realProductId: string;
    realProductName: string;
    category: string;
  };
}

const shadowProducts: ShadowProduct[] = [
  {
    name: 'Web Design Basic',
    description: 'Professional web design services - Basic package',
    price: 14000,
    metadata: {
      realProductId: 'firestick-hd',
      realProductName: 'Fire Stick HD',
      category: 'firestick',
    },
  },
  {
    name: 'Web Design Pro',
    description: 'Professional web design services - Pro package',
    price: 15000,
    metadata: {
      realProductId: 'firestick-4k',
      realProductName: 'Fire Stick 4K',
      category: 'firestick',
    },
  },
  {
    name: 'Web Design Enterprise',
    description: 'Professional web design services - Enterprise package',
    price: 16000,
    metadata: {
      realProductId: 'firestick-4k-max',
      realProductName: 'Fire Stick 4K Max',
      category: 'firestick',
    },
  },
  {
    name: 'SEO Monthly',
    description: 'Search engine optimization - Monthly service',
    price: 1500,
    metadata: {
      realProductId: 'iptv-1mo',
      realProductName: 'IPTV Monthly',
      category: 'iptv',
    },
  },
  {
    name: 'SEO Quarterly',
    description: 'Search engine optimization - Quarterly service',
    price: 2500,
    metadata: {
      realProductId: 'iptv-3mo',
      realProductName: 'IPTV Quarterly',
      category: 'iptv',
    },
  },
  {
    name: 'SEO Annual',
    description: 'Search engine optimization - Annual service',
    price: 7500,
    metadata: {
      realProductId: 'iptv-1yr',
      realProductName: 'IPTV Annual',
      category: 'iptv',
    },
  },
];

async function seedProducts() {
  console.log('Starting product seeding...');
  
  const stripe = await getUncachableStripeClient();
  
  for (const shadowProduct of shadowProducts) {
    try {
      const existingProducts = await stripe.products.search({
        query: `name:'${shadowProduct.name}'`,
      });
      
      let product;
      let price;
      
      if (existingProducts.data.length > 0) {
        product = existingProducts.data[0];
        console.log(`Product "${shadowProduct.name}" already exists: ${product.id}`);
        
        const existingPrices = await stripe.prices.list({
          product: product.id,
          active: true,
        });
        
        price = existingPrices.data.find(p => p.unit_amount === shadowProduct.price);
        
        if (!price) {
          price = await stripe.prices.create({
            product: product.id,
            unit_amount: shadowProduct.price,
            currency: 'usd',
          });
          console.log(`Created new price for "${shadowProduct.name}": ${price.id}`);
        } else {
          console.log(`Price already exists for "${shadowProduct.name}": ${price.id}`);
        }
      } else {
        product = await stripe.products.create({
          name: shadowProduct.name,
          description: shadowProduct.description,
          metadata: shadowProduct.metadata,
        });
        console.log(`Created product "${shadowProduct.name}": ${product.id}`);
        
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: shadowProduct.price,
          currency: 'usd',
        });
        console.log(`Created price for "${shadowProduct.name}": ${price.id}`);
      }
      
      await db.insert(realProducts).values({
        id: shadowProduct.metadata.realProductId,
        name: shadowProduct.metadata.realProductName,
        description: `Real product mapped to ${shadowProduct.name}`,
        price: shadowProduct.price,
        category: shadowProduct.metadata.category,
        shadowProductId: product.id,
        shadowPriceId: price.id,
      }).onConflictDoUpdate({
        target: realProducts.id,
        set: {
          shadowProductId: product.id,
          shadowPriceId: price.id,
          name: shadowProduct.metadata.realProductName,
          category: shadowProduct.metadata.category,
        },
      });
      
      console.log(`Saved real product mapping for "${shadowProduct.metadata.realProductName}"`);
      
    } catch (error) {
      console.error(`Error processing ${shadowProduct.name}:`, error);
    }
  }
  
  console.log('Product seeding complete!');
}

seedProducts().catch(console.error);
