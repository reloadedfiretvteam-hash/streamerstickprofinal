import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const products = [
  {"id":"firestick-hd","name":"Fire Stick HD","description":"Real product mapped to Web Design Basic","price":13000,"image_url":"https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%20hd.jpg","category":"firestick","shadow_product_id":"prod_TYEEobMjXf5B3d","shadow_price_id":"price_1SbmlQHBw27Y92CikC7hKknE"},
  {"id":"firestick-4k","name":"Fire Stick 4K","description":"Real product mapped to Web Design Pro","price":14000,"image_url":"https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k.jpg","category":"firestick","shadow_product_id":"prod_TYEEFruD8obUE7","shadow_price_id":"price_1SbmlRHBw27Y92CiuZhoRKCY"},
  {"id":"firestick-4k-max","name":"Fire Stick 4K Max","description":"Real product mapped to Web Design Enterprise","price":15000,"image_url":"https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k%20max.jpg","category":"firestick","shadow_product_id":"prod_TYEEeLmZMqrUxh","shadow_price_id":"price_1SbmlRHBw27Y92CiZhKx5NHU"},
  {"id":"android-onn-4k","name":"ONN 4K Streaming Device Kit","description":"Premium ONN 4K streaming device with all apps pre-installed","price":14000,"image_url":"https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/onn-4k-streaming.webp","category":"firestick","shadow_product_id":"prod_TYEEFruD8obUE7","shadow_price_id":"price_1SbmlRHBw27Y92CiuZhoRKCY"},
  {"id":"android-onn-pro","name":"ONN 4K Ultra HD Pro Kit","description":"Ultimate ONN 4K Ultra HD Pro with premium features","price":16000,"image_url":"https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/onn-4k-ultra-hd.webp","category":"firestick","shadow_product_id":"prod_TYEEeLmZMqrUxh","shadow_price_id":"price_1SbmlRHBw27Y92CiZhKx5NHU"},
  {"id":"iptv-1mo","name":"IPTV Monthly","description":"Real product mapped to SEO Monthly","price":1500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaysNq0ySpUc","shadow_price_id":"price_1SbmlSHBw27Y92CiIDBuBYdX"},
  {"id":"iptv-1mo-1d","name":"IPTV 1 Month - 1 Device","description":"Real product mapped to SEO Starter Monthly","price":1500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaWpHy3Smh0I","shadow_price_id":"price_1SbmlSHBw27Y92CiB3LdWOTa"},
  {"id":"iptv-1mo-2d","name":"IPTV 1 Month - 2 Devices","description":"Real product mapped to SEO Duo Monthly","price":2500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaa21PNETx9W","shadow_price_id":"price_1SbmlTHBw27Y92CioPrTd70O"},
  {"id":"iptv-1mo-3d","name":"IPTV 1 Month - 3 Devices","description":"Real product mapped to SEO Team Monthly","price":3500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuasBt8kmq8JB","shadow_price_id":"price_1SbmlTHBw27Y92CiUaSQ4DUe"},
  {"id":"iptv-1mo-4d","name":"IPTV 1 Month - 4 Devices","description":"Real product mapped to SEO Business Monthly","price":4000,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYua25JPl7v9on","shadow_price_id":"price_1SbmlUHBw27Y92CiqLSakBYQ"},
  {"id":"iptv-1mo-5d","name":"IPTV 1 Month - 5 Devices","description":"Real product mapped to SEO Enterprise Monthly","price":4500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYua5NHSyyVifo","shadow_price_id":"price_1SbmlUHBw27Y92Ciu2ioIO8m"},
  {"id":"iptv-3mo","name":"IPTV Quarterly","description":"Real product mapped to SEO Quarterly","price":2500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYua8AOX5F8ick","shadow_price_id":"price_1SbmlVHBw27Y92CiTfnst2n6"},
  {"id":"iptv-3mo-1d","name":"IPTV 3 Month - 1 Device","description":"Real product mapped to SEO Starter Quarterly","price":2500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaZ7ySDhq3JB","shadow_price_id":"price_1SbmlWHBw27Y92CixWXndjWA"},
  {"id":"iptv-3mo-2d","name":"IPTV 3 Month - 2 Devices","description":"Real product mapped to SEO Duo Quarterly","price":4000,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaMsEbLCEMwB","shadow_price_id":"price_1SbmlWHBw27Y92Cilr8PUZa0"},
  {"id":"iptv-3mo-3d","name":"IPTV 3 Month - 3 Devices","description":"Real product mapped to SEO Team Quarterly","price":5500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaAE09STa5Rv","shadow_price_id":"price_1SbmlXHBw27Y92CiBtcUxVw6"},
  {"id":"iptv-3mo-4d","name":"IPTV 3 Month - 4 Devices","description":"Real product mapped to SEO Business Quarterly","price":6500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaeQfGsDLQ6h","shadow_price_id":"price_1SbmlXHBw27Y92CiPFAunxd0"},
  {"id":"iptv-3mo-5d","name":"IPTV 3 Month - 5 Devices","description":"Real product mapped to SEO Enterprise Quarterly","price":7500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaqQl59AgP8w","shadow_price_id":"price_1SbmlYHBw27Y92CicILuClqr"},
  {"id":"iptv-6mo","name":"6 Month IPTV Subscription","description":"Premium 6-month IPTV subscription with 18,000+ channels","price":5000,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaHv9fUWPhX4","shadow_price_id":"price_1SbmlYHBw27Y92Cig9wKfsYC"},
  {"id":"iptv-6mo-1d","name":"IPTV 6 Month - 1 Device","description":"Real product mapped to Content Marketing Semi-Annual","price":4000,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaPtKkp5vnTv","shadow_price_id":"price_1SbmlZHBw27Y92CiJqAwgziy"},
  {"id":"iptv-6mo-2d","name":"IPTV 6 Month - 2 Devices","description":"Real product mapped to Content Marketing Duo Semi-Annual","price":6500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaivCe1pQdgI","shadow_price_id":"price_1SbmlaHBw27Y92CiPYPrIGa9"},
  {"id":"iptv-6mo-3d","name":"IPTV 6 Month - 3 Devices","description":"Real product mapped to Content Marketing Team Semi-Annual","price":8500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaH29hPrerUZ","shadow_price_id":"price_1SbmlaHBw27Y92Cih3mZcDZx"},
  {"id":"iptv-6mo-4d","name":"IPTV 6 Month - 4 Devices","description":"Real product mapped to Content Marketing Business Semi-Annual","price":10000,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYua2bcCDybLpF","shadow_price_id":"price_1SbmlbHBw27Y92Ci9kGAilIz"},
  {"id":"iptv-6mo-5d","name":"IPTV 6 Month - 5 Devices","description":"Real product mapped to Content Marketing Enterprise Semi-Annual","price":12500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYua5RwHFhIzPS","shadow_price_id":"price_1SbmlbHBw27Y92Cics46lUBT"},
  {"id":"iptv-1yr","name":"IPTV Annual","description":"Real product mapped to SEO Annual","price":7500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaVCaJDNlWlC","shadow_price_id":"price_1SbmlcHBw27Y92Cies3NQNwH"},
  {"id":"iptv-1yr-1d","name":"IPTV 1 Year - 1 Device","description":"Real product mapped to Digital Marketing Annual","price":6500,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaVuwHRccbeH","shadow_price_id":"price_1SbmlcHBw27Y92Ci3iazZ0AN"},
  {"id":"iptv-1yr-2d","name":"IPTV 1 Year - 2 Devices","description":"Real product mapped to Digital Marketing Duo Annual","price":10000,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaA7Ctu6QzEA","shadow_price_id":"price_1SbmldHBw27Y92CiV83j4QzU"},
  {"id":"iptv-1yr-3d","name":"IPTV 1 Year - 3 Devices","description":"Real product mapped to Digital Marketing Team Annual","price":14000,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaXyIp7sEbF0","shadow_price_id":"price_1SbmleHBw27Y92Ci1asKdkPq"},
  {"id":"iptv-1yr-4d","name":"IPTV 1 Year - 4 Devices","description":"Real product mapped to Digital Marketing Business Annual","price":19000,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYua1nl7rkDUFc","shadow_price_id":"price_1SbmleHBw27Y92CiB8gWsIOn"},
  {"id":"iptv-1yr-5d","name":"IPTV 1 Year - 5 Devices","description":"Real product mapped to Digital Marketing Enterprise Annual","price":22000,"image_url":null,"category":"iptv","shadow_product_id":"prod_TYuaZVC0JtfIk0","shadow_price_id":"price_1SbmlfHBw27Y92CiTlrzgkoI"}
];

async function syncProducts() {
  console.log('Starting product sync to Supabase...');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  
  console.log('\n1. Deleting old products...');
  const { error: deleteError } = await supabase.from('real_products').delete().neq('id', '');
  if (deleteError) {
    console.error('Error deleting old products:', deleteError);
  } else {
    console.log('Old products deleted successfully');
  }
  
  console.log('\n2. Inserting new products...');
  for (const product of products) {
    const { error } = await supabase.from('real_products').upsert(product, { onConflict: 'id' });
    if (error) {
      console.error(`Error inserting ${product.id}:`, error.message);
    } else {
      console.log(`✓ Inserted: ${product.id} - ${product.name}`);
    }
  }
  
  console.log('\n3. Verifying products...');
  const { data, error: fetchError } = await supabase.from('real_products').select('*');
  if (fetchError) {
    console.error('Error fetching products:', fetchError);
  } else {
    console.log(`Total products in Supabase: ${data.length}`);
    console.log('Products with shadow mappings:', data.filter(p => p.shadow_product_id && p.shadow_price_id).length);
  }
  
  console.log('\nSync complete!');
}

syncProducts().catch(console.error);
