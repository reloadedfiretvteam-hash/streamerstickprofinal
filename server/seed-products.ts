import { getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { realProducts } from '@shared/schema';

interface ShadowProduct {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  metadata: {
    realProductId: string;
    realProductName: string;
    category: string;
    deviceCount?: number;
    duration?: string;
  };
}

const SUPABASE_URL = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges';

const shadowProducts: ShadowProduct[] = [
  {
    name: 'Web Design Basic',
    description: 'Professional web design services - Basic package',
    price: 13000,
    imageUrl: `${SUPABASE_URL}/firestick%20hd.jpg`,
    metadata: {
      realProductId: 'firestick-hd',
      realProductName: 'StreamStick Starter Kit',
      category: 'firestick',
    },
  },
  {
    name: 'Web Design Pro',
    description: 'Professional web design services - Pro package',
    price: 14000,
    imageUrl: `${SUPABASE_URL}/firestick%204k.jpg`,
    metadata: {
      realProductId: 'firestick-4k',
      realProductName: 'StreamStick 4K Kit',
      category: 'firestick',
    },
  },
  {
    name: 'Web Design Enterprise',
    description: 'Professional web design services - Enterprise package',
    price: 15000,
    imageUrl: `${SUPABASE_URL}/firestick%204k%20max.jpg`,
    metadata: {
      realProductId: 'firestick-4k-max',
      realProductName: 'StreamStick Max Kit',
      category: 'firestick',
    },
  },

  // ONN Android TV Devices - Upgrades from Fire Stick
  {
    name: 'Mobile App Development Basic',
    description: 'Custom mobile application development - Basic package with essential features',
    price: 14000,
    imageUrl: `${SUPABASE_URL}/onn-4k-streaming.webp`,
    metadata: {
      realProductId: 'android-onn-4k',
      realProductName: 'ONN 4K Streaming Device Kit',
      category: 'firestick',
    },
  },
  {
    name: 'Mobile App Development Pro',
    description: 'Custom mobile application development - Professional package with advanced features and storage',
    price: 16000,
    imageUrl: `${SUPABASE_URL}/onn-4k-ultra-hd.webp`,
    metadata: {
      realProductId: 'android-onn-pro',
      realProductName: 'ONN 4K Ultra HD Pro Kit',
      category: 'firestick',
    },
  },

  // 1 MONTH Live TV - $15 base, scaling for devices
  {
    name: 'SEO Starter Monthly',
    description: 'Search engine optimization - Monthly starter package for single site',
    price: 1500,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-1mo-1d',
      realProductName: 'Live TV Plan 1 Month - 1 Device',
      category: 'iptv',
      deviceCount: 1,
      duration: '1mo',
    },
  },
  {
    name: 'SEO Duo Monthly',
    description: 'Search engine optimization - Monthly package for two sites',
    price: 2500,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-1mo-2d',
      realProductName: 'Live TV Plan 1 Month - 2 Devices',
      category: 'iptv',
      deviceCount: 2,
      duration: '1mo',
    },
  },
  {
    name: 'SEO Team Monthly',
    description: 'Search engine optimization - Monthly package for three sites',
    price: 3500,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-1mo-3d',
      realProductName: 'Live TV Plan 1 Month - 3 Devices',
      category: 'iptv',
      deviceCount: 3,
      duration: '1mo',
    },
  },
  {
    name: 'SEO Business Monthly',
    description: 'Search engine optimization - Monthly package for four sites',
    price: 4000,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-1mo-4d',
      realProductName: 'Live TV Plan 1 Month - 4 Devices',
      category: 'iptv',
      deviceCount: 4,
      duration: '1mo',
    },
  },
  {
    name: 'SEO Enterprise Monthly',
    description: 'Search engine optimization - Monthly package for five sites',
    price: 4500,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-1mo-5d',
      realProductName: 'Live TV Plan 1 Month - 5 Devices',
      category: 'iptv',
      deviceCount: 5,
      duration: '1mo',
    },
  },

  // 3 MONTH IPTV - $25 base, scaling for devices
  {
    name: 'SEO Starter Quarterly',
    description: 'Search engine optimization - Quarterly starter package for single site',
    price: 2500,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-3mo-1d',
      realProductName: 'Live TV Plan 3 Month - 1 Device',
      category: 'iptv',
      deviceCount: 1,
      duration: '3mo',
    },
  },
  {
    name: 'SEO Duo Quarterly',
    description: 'Search engine optimization - Quarterly package for two sites',
    price: 4000,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-3mo-2d',
      realProductName: 'Live TV Plan 3 Month - 2 Devices',
      category: 'iptv',
      deviceCount: 2,
      duration: '3mo',
    },
  },
  {
    name: 'SEO Team Quarterly',
    description: 'Search engine optimization - Quarterly package for three sites',
    price: 5500,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-3mo-3d',
      realProductName: 'Live TV Plan 3 Month - 3 Devices',
      category: 'iptv',
      deviceCount: 3,
      duration: '3mo',
    },
  },
  {
    name: 'SEO Business Quarterly',
    description: 'Search engine optimization - Quarterly package for four sites',
    price: 6500,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-3mo-4d',
      realProductName: 'Live TV Plan 3 Month - 4 Devices',
      category: 'iptv',
      deviceCount: 4,
      duration: '3mo',
    },
  },
  {
    name: 'SEO Enterprise Quarterly',
    description: 'Search engine optimization - Quarterly package for five sites',
    price: 7500,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-3mo-5d',
      realProductName: 'Live TV Plan 3 Month - 5 Devices',
      category: 'iptv',
      deviceCount: 5,
      duration: '3mo',
    },
  },

  // 6 MONTH IPTV - $40 base, scaling for devices
  {
    name: 'Content Marketing Semi-Annual',
    description: 'Content marketing services - 6-month package for single site',
    price: 4000,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-6mo-1d',
      realProductName: 'Live TV Plan 6 Month - 1 Device',
      category: 'iptv',
      deviceCount: 1,
      duration: '6mo',
    },
  },
  {
    name: 'Content Marketing Duo Semi-Annual',
    description: 'Content marketing services - 6-month package for two sites',
    price: 6500,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-6mo-2d',
      realProductName: 'Live TV Plan 6 Month - 2 Devices',
      category: 'iptv',
      deviceCount: 2,
      duration: '6mo',
    },
  },
  {
    name: 'Content Marketing Team Semi-Annual',
    description: 'Content marketing services - 6-month package for three sites',
    price: 8500,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-6mo-3d',
      realProductName: 'Live TV Plan 6 Month - 3 Devices',
      category: 'iptv',
      deviceCount: 3,
      duration: '6mo',
    },
  },
  {
    name: 'Content Marketing Business Semi-Annual',
    description: 'Content marketing services - 6-month package for four sites',
    price: 10000,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-6mo-4d',
      realProductName: 'Live TV Plan 6 Month - 4 Devices',
      category: 'iptv',
      deviceCount: 4,
      duration: '6mo',
    },
  },
  {
    name: 'Content Marketing Enterprise Semi-Annual',
    description: 'Content marketing services - 6-month package for five sites',
    price: 12500,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-6mo-5d',
      realProductName: 'Live TV Plan 6 Month - 5 Devices',
      category: 'iptv',
      deviceCount: 5,
      duration: '6mo',
    },
  },

  // 1 YEAR IPTV - $65 base, scaling for devices
  {
    name: 'Digital Marketing Annual',
    description: 'Comprehensive digital marketing - Annual package for single site',
    price: 6500,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-1yr-1d',
      realProductName: 'Live TV Plan 1 Year - 1 Device',
      category: 'iptv',
      deviceCount: 1,
      duration: '1yr',
    },
  },
  {
    name: 'Digital Marketing Duo Annual',
    description: 'Comprehensive digital marketing - Annual package for two sites',
    price: 10000,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-1yr-2d',
      realProductName: 'Live TV Plan 1 Year - 2 Devices',
      category: 'iptv',
      deviceCount: 2,
      duration: '1yr',
    },
  },
  {
    name: 'Digital Marketing Team Annual',
    description: 'Comprehensive digital marketing - Annual package for three sites',
    price: 14000,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-1yr-3d',
      realProductName: 'Live TV Plan 1 Year - 3 Devices',
      category: 'iptv',
      deviceCount: 3,
      duration: '1yr',
    },
  },
  {
    name: 'Digital Marketing Business Annual',
    description: 'Comprehensive digital marketing - Annual package for four sites',
    price: 19000,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-1yr-4d',
      realProductName: 'Live TV Plan 1 Year - 4 Devices',
      category: 'iptv',
      deviceCount: 4,
      duration: '1yr',
    },
  },
  {
    name: 'Digital Marketing Enterprise Annual',
    description: 'Comprehensive digital marketing - Annual package for five sites',
    price: 22000,
    imageUrl: `${SUPABASE_URL}/iptv-subscription.jpg`,
    metadata: {
      realProductId: 'iptv-1yr-5d',
      realProductName: 'Live TV Plan 1 Year - 5 Devices',
      category: 'iptv',
      deviceCount: 5,
      duration: '1yr',
    },
  },
];

async function seedProducts() {
  console.log('Starting product seeding...');
  console.log(`Total products to seed: ${shadowProducts.length}`);
  
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
          metadata: shadowProduct.metadata as any,
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
        imageUrl: shadowProduct.imageUrl,
        category: shadowProduct.metadata.category,
        shadowProductId: product.id,
        shadowPriceId: price.id,
      }).onConflictDoUpdate({
        target: realProducts.id,
        set: {
          shadowProductId: product.id,
          shadowPriceId: price.id,
          name: shadowProduct.metadata.realProductName,
          price: shadowProduct.price,
          imageUrl: shadowProduct.imageUrl,
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
