import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Address } from '../../features/user-profile/entities/address.entity';
import { User } from '../../features/auth/entities/user.entity';
import { seedUser } from './user.seed';

const CITIES = [
  'Ho Chi Minh City',
  'Ha Noi',
  'Da Nang',
  'Can Tho',
  'Hai Phong',
  'Bien Hoa',
  'Hue',
  'Nha Trang',
  'Vung Tau',
  'Quy Nhon',
];

export async function seedAddress(dataSource: DataSource) {
  await seedUser(dataSource);

  const addressRepo = dataSource.getRepository(Address);
  if ((await addressRepo.count()) > 0) {
    console.log('⏭ Addresses already seeded');
    return;
  }

  const userRepo = dataSource.getRepository(User);
  const users = await userRepo.find();

  const addresses: Partial<Address>[] = [];

  for (const user of users) {
    // 1–3 addresses per user
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      addresses.push({
        userId: user.id,
        fullName: user.fullName,
        phone: user.phone ?? `09${faker.string.numeric(8)}`,
        addressLine: `${faker.location.buildingNumber()} ${faker.location.street()}`,
        city: CITIES[Math.floor(Math.random() * CITIES.length)],
        isDefault: i === 0, // first address is default
      });
    }
  }

  await addressRepo.save(addresses);
  console.log(`✓ Seeded ${addresses.length} addresses for ${users.length} users`);
}
