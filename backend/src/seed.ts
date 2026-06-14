import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from './models/Customer';
import Order from './models/Order';
import Segment from './models/Segment';
import Campaign from './models/Campaign';
import Analytics from './models/Analytics';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pulsecrm';

// --- COFFEE BRAND SEED DATA SETS ---
const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Sam', 'Jamie', 'Charlie', 'Drew', 'Avery', 'Cameron', 'Dylan', 'Parker', 'Peyton', 'Quinn', 'Reese', 'Rowan', 'Skyler', 'Spencer'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const CITIES = ['Seattle', 'Portland', 'Austin', 'Denver', 'Chicago', 'New York', 'San Francisco', 'Los Angeles', 'Miami', 'Atlanta'];
const PRODUCTS = [
  { name: '1lb Whole Bean - Ethiopian Yirgacheffe', minPrice: 18, maxPrice: 22 },
  { name: '1lb Whole Bean - Colombian Supremo', minPrice: 15, maxPrice: 18 },
  { name: 'Iced Vanilla Latte', minPrice: 5, maxPrice: 7 },
  { name: 'Double Espresso', minPrice: 3, maxPrice: 5 },
  { name: 'Cold Brew Pitcher Packs', minPrice: 12, maxPrice: 16 },
  { name: 'Pour Over Starter Kit', minPrice: 45, maxPrice: 65 },
  { name: 'Matcha Green Tea Latte', minPrice: 5, maxPrice: 8 },
  { name: 'Oat Milk Cortado', minPrice: 4, maxPrice: 6 },
];

// Helper Functions
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randChoice = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    console.log('Clearing existing data...');
    await Promise.all([
      Customer.deleteMany({}),
      Order.deleteMany({}),
      Segment.deleteMany({}),
      Campaign.deleteMany({}),
      Analytics.deleteMany({})
    ]);

    // 1. Generate 100 Customers
    console.log('Generating 100 Customers...');
    const customers = [];
    for (let i = 0; i < 100; i++) {
      const fName = randChoice(FIRST_NAMES);
      const lName = randChoice(LAST_NAMES);
      customers.push({
        firstName: fName,
        lastName: lName,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`,
        phone: `+1${randInt(200, 999)}${randInt(1000000, 9999999)}`,
        city: randChoice(CITIES),
        totalSpent: 0, // Will update after orders
        aiTags: []
      });
    }
    const insertedCustomers = await Customer.insertMany(customers);

    // 2. Generate 400 Orders
    console.log('Generating 400 Orders...');
    const orders = [];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    for (let i = 0; i < 400; i++) {
      const customer = randChoice(insertedCustomers);
      const product = randChoice(PRODUCTS);
      const amount = Number((Math.random() * (product.maxPrice - product.minPrice) + product.minPrice).toFixed(2));
      
      orders.push({
        customerId: customer._id,
        productName: product.name,
        amount,
        status: randChoice(['Completed', 'Completed', 'Completed', 'Completed', 'Pending', 'Cancelled']),
        orderDate: randDate(oneYearAgo, new Date())
      });
    }
    await Order.insertMany(orders);

    // 3. Update Customer LTV & Last Order Date
    console.log('Calculating Customer LTV...');
    for (const cust of insertedCustomers) {
      const custOrders = orders.filter(o => o.customerId === cust._id && o.status === 'Completed');
      if (custOrders.length > 0) {
        const total = custOrders.reduce((sum, o) => sum + o.amount, 0);
        const lastOrder = custOrders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())[0];
        
        let tags = ['Coffee Lover'];
        if (total > 150) tags.push('VIP');
        if (new Date().getTime() - lastOrder.orderDate.getTime() > 90 * 24 * 60 * 60 * 1000) tags.push('Churn Risk');

        await Customer.findByIdAndUpdate(cust._id, {
          totalSpent: Number(total.toFixed(2)),
          lastOrderDate: lastOrder.orderDate,
          aiTags: tags
        });
      }
    }

    // 4. Create Segments
    console.log('Generating Segments & Campaigns...');
    const segments = await Segment.insertMany([
      {
        name: 'VIP Roasters (Spend > $100)',
        rules: [{ field: 'totalSpent', operator: '>', value: 100 }]
      },
      {
        name: 'Seattle Cold Brew Fans',
        rules: [{ field: 'city', operator: '==', value: 'Seattle' }]
      },
      {
        name: 'Inactive (90+ Days)',
        rules: [{ field: 'lastOrderDate', operator: '<', value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }]
      }
    ]);

    // 5. Create Campaigns & Analytics
    const campaigns = await Campaign.insertMany([
      {
        name: 'Fall Beans Promo',
        segmentId: segments[0]._id,
        channel: 'Email',
        subject: '☕ Secret 20% Off for our Best Brewers',
        messageTemplate: 'Hey {firstName}, fall is here! Stock up on Ethiopian Yirgacheffe with 20% off.',
        status: 'Completed',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Seattle Store Opening',
        segmentId: segments[1]._id,
        channel: 'SMS',
        messageTemplate: 'Hey {firstName}! Show this text at our new Seattle downtown location for a free Cold Brew today.',
        status: 'Completed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'We Miss You!',
        segmentId: segments[2]._id,
        channel: 'Email',
        subject: 'Your mug looks empty...',
        messageTemplate: 'Hey {firstName}, it\'s been a while since your last order. Here is a $5 credit to get you back in the grind.',
        status: 'Running',
        createdAt: new Date()
      }
    ]);

    await Analytics.insertMany([
      {
        campaignId: campaigns[0]._id,
        totalSent: 45,
        successfulDeliveries: 44,
        failedDeliveries: 1,
        opened: 38,
        clicked: 20,
        converted: 8,
        aiInsights: 'Excellent conversion rate. The VIP segment responds highly to seasonal bean discounts.'
      },
      {
        campaignId: campaigns[1]._id,
        totalSent: 15,
        successfulDeliveries: 15,
        failedDeliveries: 0,
        opened: 15, // SMS open rates are ~100%
        clicked: 8,
        converted: 4,
        aiInsights: 'High engagement for local SMS. Foot traffic increased substantially post-dispatch.'
      },
      {
        campaignId: campaigns[2]._id,
        totalSent: 30,
        successfulDeliveries: 28,
        failedDeliveries: 2,
        opened: 12,
        clicked: 4,
        converted: 1,
        aiInsights: 'Campaign is currently running. Open rate is lower than average, typical for an inactive segment.'
      }
    ]);

    console.log('\n✅ Database successfully seeded with PulseCRM Coffee Brand Data!');
    process.exit(0);

  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedDatabase();
