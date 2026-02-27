import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const getInitialsAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=300`;
};

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️  Clearing existing data...');
    try {
      await prisma.notification.deleteMany();
      await prisma.review.deleteMany();
      await prisma.payment.deleteMany();
      await prisma.booking.deleteMany();
      await prisma.providerService.deleteMany();
      await prisma.service.deleteMany();
      await prisma.provider.deleteMany();
      await prisma.user.deleteMany();
      await prisma.city.deleteMany();
      await prisma.setting.deleteMany();
      console.log('✅ Existing data cleared.');
    } catch (error) {
      console.log('⚠️  Warning: Error clearing some tables. Continuing anyway...');
    }
  }

  // Hash password for demo accounts
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Cities
  console.log('📍 Creating cities...');
  const cities = await Promise.all([
    prisma.city.create({
      data: {
        name: 'Karachi',
        state: 'Sindh',
        areas: ['Gulshan-e-Iqbal', 'DHA', 'Clifton', 'North Nazimabad', 'Malir'],
      },
    }),
    prisma.city.create({
      data: {
        name: 'Lahore',
        state: 'Punjab',
        areas: ['DHA Phase 5', 'Gulberg', 'Model Town', 'Johar Town', 'Cavalry Ground'],
      },
    }),
    prisma.city.create({
      data: {
        name: 'Islamabad',
        state: 'ICT',
        areas: ['F-10 Markaz', 'G-11', 'Blue Area', 'I-8', 'Bahria Town'],
      },
    }),
    prisma.city.create({
      data: {
        name: 'Rawalpindi',
        state: 'Punjab',
        areas: ['Bahria Town', 'Saddar', 'Satellite Town', 'Chaklala'],
      },
    }),
    prisma.city.create({
      data: {
        name: 'Faisalabad',
        state: 'Punjab',
        areas: ['D Ground', 'Madina Town', 'Canal Road', 'Peoples Colony'],
      },
    }),
    prisma.city.create({
      data: {
        name: 'Multan',
        state: 'Punjab',
        areas: ['Cantt', 'Gulgasht', 'Shah Rukn-e-Alam', 'Model Town'],
      },
    }),
    prisma.city.create({
      data: {
        name: 'Peshawar',
        state: 'Khyber Pakhtunkhwa',
        areas: ['University Road', 'Cantt', 'Hayatabad', 'Saddar'],
      },
    }),
    prisma.city.create({
      data: {
        name: 'Quetta',
        state: 'Balochistan',
        areas: ['Jinnah Road', 'Sariab Road', 'Samungli Road', 'Cantt'],
      },
    }),
    prisma.city.create({
      data: {
        name: 'Sialkot',
        state: 'Punjab',
        areas: ['Cantt', 'Defence Road', 'Kashmir Road', 'Airport Road'],
      },
    }),
    prisma.city.create({
      data: {
        name: 'Gujranwala',
        state: 'Punjab',
        areas: ['Satellite Town', 'Cantt', 'Wapda Town', 'Civil Lines'],
      },
    }),
    prisma.city.create({
      data: {
        name: 'Hyderabad',
        state: 'Sindh',
        areas: ['Qasimabad', 'Latifabad', 'Cantt', 'Saddar'],
      },
    }),
    prisma.city.create({
      data: {
        name: 'Bahawalpur',
        state: 'Punjab',
        areas: ['Model Town A', 'Cantt', 'Satellite Town', 'City Center'],
      },
    }),
  ]);

  // 2. Create Services
  console.log('🛠️  Creating services...');
  const servicesData = [
    { name: 'House Cleaning', category: 'Cleaning', icon: '🧹', description: 'Professional home cleaning services', basePrice: 2500, duration: '2-3 hours', isPopular: true },
    { name: 'Plumbing', category: 'Home Repair', icon: '🔧', description: 'Expert plumbing repair and installation', basePrice: 3000, duration: '1-2 hours', isPopular: true },
    { name: 'Electrical Work', category: 'Home Repair', icon: '⚡', description: 'Licensed electrical services', basePrice: 3200, duration: '1-3 hours', isPopular: true },
    { name: 'Painting', category: 'Home Improvement', icon: '🎨', description: 'Interior and exterior painting', basePrice: 4500, duration: '4-8 hours', isPopular: true },
    { name: 'Pest Control', category: 'Cleaning', icon: '🐛', description: 'Safe and effective pest elimination', basePrice: 2800, duration: '1-2 hours', isPopular: false },
    { name: 'AC Repair', category: 'Home Repair', icon: '❄️', description: 'Air conditioning maintenance and repair', basePrice: 3500, duration: '2-4 hours', isPopular: true },
    { name: 'Carpentry', category: 'Home Improvement', icon: '🪚', description: 'Custom woodwork and furniture repair', basePrice: 3800, duration: '2-5 hours', isPopular: false },
    { name: 'Lawn Care', category: 'Outdoor', icon: '🌱', description: 'Lawn mowing and garden maintenance', basePrice: 2600, duration: '1-2 hours', isPopular: true },
    { name: 'Appliance Repair', category: 'Home Repair', icon: '🔨', description: 'Fix all types of home appliances', basePrice: 2900, duration: '1-3 hours', isPopular: false },
    { name: 'Interior Design', category: 'Home Improvement', icon: '🏠', description: 'Professional interior design consultation', basePrice: 5000, duration: '2-4 hours', isPopular: false },
  ];

  const services = await Promise.all(servicesData.map(s => prisma.service.create({ data: s })));

  // 3. Create Users (Customers and Admin)
  console.log('👥 Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Umar Farooq',
        email: 'umar.farooq@example.com',
        password: hashedPassword,
        phone: '+92-300-1234567',
        role: 'CUSTOMER',
        avatar: getInitialsAvatar('Umar Farooq'),
        city: 'Karachi',
        address: 'Block 15, Gulshan-e-Iqbal',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@homeease.com',
        password: adminPassword,
        phone: '+92-302-9999999',
        role: 'ADMIN',
        avatar: getInitialsAvatar('Admin User'),
        isVerified: true,
      },
    }),
  ]);

  // 4. Create 100 Providers
  console.log('👨‍🔧 Creating 100 providers...');
  const providerListData = [
    { name: 'Bisharat', email: 'bisharat123@gmail.com' }, { name: 'Hamdan', email: 'hamdan.pk01@gmail.com' }, { name: 'Zaryab', email: 'zaryab.mail@gmail.com' }, { name: 'Faizan', email: 'faizan786@gmail.com' }, { name: 'Adeel', email: 'adeel.work@gmail.com' },
    { name: 'Arsalan', email: 'arsalan92@gmail.com' }, { name: 'Danish', email: 'danish.contact@gmail.com' }, { name: 'Taha', email: 'taha.pk@gmail.com' }, { name: 'Huzaifa', email: 'huzaifa.dev@gmail.com' }, { name: 'Rehan', email: 'rehan.mailbox@gmail.com' },
    { name: 'Salman', email: 'salman.user@gmail.com' }, { name: 'Waqas', email: 'waqas.info@gmail.com' }, { name: 'Owais', email: 'owais.khan@gmail.com' }, { name: 'Imran', email: 'imran.connect@gmail.com' }, { name: 'Saqib', email: 'saqib123@gmail.com' },
    { name: 'Kamran', email: 'kamran.work@gmail.com' }, { name: 'Noman', email: 'noman.pk@gmail.com' }, { name: 'Rizwan', email: 'rizwan.mail@gmail.com' }, { name: 'Shahroz', email: 'shahroz.dev@gmail.com' }, { name: 'Bilal', email: 'bilal786@gmail.com' },
    { name: 'Kashif', email: 'kashif.info@gmail.com' }, { name: 'Junaid', email: 'junaid.pk@gmail.com' }, { name: 'Talha', email: 'talha.user@gmail.com' }, { name: 'Mubashir', email: 'mubashir.mail@gmail.com' }, { name: 'Zeeshan', email: 'zeeshan123@gmail.com' },
    { name: 'Yasir', email: 'yasir.connect@gmail.com' }, { name: 'Asfand', email: 'asfand.pk@gmail.com' }, { name: 'Sameer', email: 'sameer.work@gmail.com' }, { name: 'Irfan', email: 'irfan.mail@gmail.com' }, { name: 'Naveed', email: 'naveed.info@gmail.com' },
    { name: 'Haris', email: 'haris.pk@gmail.com' }, { name: 'Azhar', email: 'azhar.user@gmail.com' }, { name: 'Shayan', email: 'shayan.dev@gmail.com' }, { name: 'Umair', email: 'umair.mail@gmail.com' }, { name: 'Farhan', email: 'farhan123@gmail.com' },
    { name: 'Adnan', email: 'adnan.connect@gmail.com' }, { name: 'Affan', email: 'affan.pk@gmail.com' }, { name: 'Saad', email: 'saad.work@gmail.com' }, { name: 'Hassan', email: 'hassan.mail@gmail.com' }, { name: 'Ahsan', email: 'ahsan.user@gmail.com' },
    { name: 'Moiz', email: 'moiz.pk@gmail.com' }, { name: 'Shafay', email: 'shafay.dev@gmail.com' }, { name: 'Rameez', email: 'rameez.mail@gmail.com' }, { name: 'Fawad', email: 'fawad123@gmail.com' }, { name: 'Arham', email: 'arham.pk@gmail.com' },
    { name: 'Shehryar', email: 'shehryar.work@gmail.com' }, { name: 'Hammad', email: 'hammad.mail@gmail.com' }, { name: 'Ibtisam', email: 'ibtisam.user@gmail.com' }, { name: 'Shahzaib', email: 'shahzaib.pk@gmail.com' }, { name: 'Rauf', email: 'rauf.connect@gmail.com' },
    { name: 'Nabeel', email: 'nabeel.mail@gmail.com' }, { name: 'Usman', email: 'usman123@gmail.com' }, { name: 'Zain', email: 'zain.pk@gmail.com' }, { name: 'Raheel', email: 'raheel.work@gmail.com' }, { name: 'Anas', email: 'anas.mail@gmail.com' },
    { name: 'Daniyal', email: 'daniyal.user@gmail.com' }, { name: 'Saif', email: 'saif.pk@gmail.com' }, { name: 'Muneeb', email: 'muneeb.connect@gmail.com' }, { name: 'Ayaan', email: 'ayaan.mail@gmail.com' }, { name: 'Shuja', email: 'shuja123@gmail.com' },
    { name: 'Taimoor', email: 'taimoor.pk@gmail.com' }, { name: 'Basit', email: 'basit.work@gmail.com' }, { name: 'Ibrahim', email: 'ibrahim.mail@gmail.com' }, { name: 'Zubair', email: 'zubair.user@gmail.com' }, { name: 'Haroon', email: 'haroon.pk@gmail.com' },
    { name: 'Sohail', email: 'sohail.connect@gmail.com' }, { name: 'Maaz', email: 'maaz.mail@gmail.com' }, { name: 'Rayan', email: 'rayan.pk@gmail.com' }, { name: 'Waheed', email: 'waheed.work@gmail.com' }, { name: 'Feroz', email: 'feroz.mail@gmail.com' },
    { name: 'Ismail', email: 'ismail.user@gmail.com' }, { name: 'Nauman', email: 'nauman.pk@gmail.com' }, { name: 'Shabbir', email: 'shabbir.connect@gmail.com' }, { name: 'Raees', email: 'raees.mail@gmail.com' }, { name: 'Zohair', email: 'zohair.pk@gmail.com' },
    { name: 'Tahir', email: 'tahir.work@gmail.com' }, { name: 'Awais', email: 'awais.mail@gmail.com' }, { name: 'Munir', email: 'munir.user@gmail.com' }, { name: 'Azlan', email: 'azlan.pk@gmail.com' }, { name: 'Sufyan', email: 'sufyan.connect@gmail.com' },
    { name: 'Zameer', email: 'zameer.mail@gmail.com' }, { name: 'Shakir', email: 'shakir.pk@gmail.com' }, { name: 'Abrar', email: 'abrar.work@gmail.com' }, { name: 'Khalid', email: 'khalid.mail@gmail.com' }, { name: 'Nadeem', email: 'nadeem.user@gmail.com' },
    { name: 'Hamza', email: 'hamza.pk@gmail.com' }, { name: 'Saqlain', email: 'saqlain.connect@gmail.com' }, { name: 'Zafar', email: 'zafar.mail@gmail.com' }, { name: 'Akmal', email: 'akmal.pk@gmail.com' }, { name: 'Faris', email: 'faris.work@gmail.com' },
    { name: 'Salman Unique', email: 'salman.unique@gmail.com' }, { name: 'Razi', email: 'razi.mail@gmail.com' }, { name: 'Ehsan', email: 'ehsan.pk@gmail.com' }, { name: 'Qasim', email: 'qasim.connect@gmail.com' }, { name: 'Jibran', email: 'jibran.mail@gmail.com' },
    { name: 'Shayan Unique', email: 'shayan.unique@gmail.com' }, { name: 'Aatif', email: 'aatif.pk@gmail.com' }, { name: 'Nofil', email: 'nofil.work@gmail.com' }, { name: 'Zarar', email: 'zarar.mail@gmail.com' }, { name: 'Ameen', email: 'ameen.pk@gmail.com' },
  ];

  const providers = [];
  for (let i = 0; i < providerListData.length; i++) {
    const pData = providerListData[i];
    const city = cities[i % cities.length];
    const area = city.areas[i % city.areas.length];

    const provider = await prisma.provider.create({
      data: {
        name: pData.name,
        email: pData.email,
        password: hashedPassword,
        phone: `+92-3${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 8999999 + 1000000)}`,
        bio: `Experienced professional providing high-quality services in ${city.name}.`,
        experience: Math.floor(Math.random() * 12) + 2,
        avatar: getInitialsAvatar(pData.name),
        address: `${area}, Street ${i + 1}`,
        city: city.name,
        location: area,
        status: 'APPROVED',
        isVerified: true,
        rating: Math.floor(Math.random() * 4) + 2,
        totalReviews: Math.floor(Math.random() * 150) + 20,
        totalBookings: Math.floor(Math.random() * 200) + 30,
        completionRate: Math.floor(95 + Math.random() * 5),
        responseTime: '1-3 hours',
      },
    });
    providers.push(provider);
  }

  // 5. Link Providers with Services
  console.log('🔗 Linking providers with services...');
  for (let i = 0; i < providers.length; i++) {
    // Each provider gets at least one service
    const mainServiceIndex = i % services.length;
    const mainService = services[mainServiceIndex];

    await prisma.providerService.create({
      data: {
        providerId: providers[i].id,
        serviceId: mainService.id,
        price: mainService.basePrice + (Math.floor(Math.random() * 15) * 100),
        description: `Professional ${mainService.name} services including all standard requirements.`,
      },
    });

    // Assign a second service to 50% of providers to ensure multi-service availability
    if (i % 2 === 0) {
      const extraService = services[(mainServiceIndex + 1) % services.length];
      await prisma.providerService.create({
        data: {
          providerId: providers[i].id,
          serviceId: extraService.id,
          price: extraService.basePrice + (Math.floor(Math.random() * 15) * 100),
          description: `Also providing expert ${extraService.name} solutions for residential needs.`,
        },
      });
    }
  }

  // 6. Create System Settings
  console.log('⚙️  Creating system settings...');
  await Promise.all([
    prisma.setting.create({
      data: {
        key: 'platform_fee_percentage',
        value: '10',
        description: 'Platform fee percentage (10%)',
      },
    }),
    prisma.setting.create({
      data: {
        key: 'min_booking_amount',
        value: '500',
        description: 'Minimum booking amount in PKR',
      },
    }),
    prisma.setting.create({
      data: {
        key: 'cancellation_window_hours',
        value: '24',
        description: 'Hours before booking can be cancelled without penalty',
      },
    }),
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Total Created: ${cities.length} cities, ${services.length} services, ${users.length} users, ${providers.length} providers`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
