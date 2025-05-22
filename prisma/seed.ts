import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1) Roles with hardcoded IDs
  const [adminRole, userRole] = await Promise.all([
    prisma.role.upsert({
      where: { id: 1 },
      update: { role_name: 'Admin', deskripsi: 'Administrator' },
      create: { id: 1, role_name: 'Admin', deskripsi: 'Administrator' }
    }),
    prisma.role.upsert({
      where: { id: 2 },
      update: { role_name: 'User', deskripsi: 'Regular user' },
      create: { id: 2, role_name: 'User', deskripsi: 'Regular user' }
    }),
  ])

  console.log(`Admin role created with ID: ${adminRole.id}`)
  console.log(`User role created with ID: ${userRole.id}`)

  // 2) Tags & Categories
  const tagNames = ['Adventure', 'Tutorial', 'Review', 'News']
  const tags = await Promise.all(
    tagNames.map(nama => prisma.tags.create({ data: { nama } }))
  )

  const kategoriNames = ['Grill', 'Tent', 'Backpack']
  const kategoris = await Promise.all(
    kategoriNames.map(nama => prisma.kategori.create({ data: { nama } }))
  )

  // 3) Create an admin user
  const adminPassword = "admin123"
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  
  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPassword,
      email: "admin@kenamplan.com",
      role_id: adminRole.id, // This will be 1
      is_blacklisted: false,
      createdAt: new Date(),
    },
  })
  console.log(`Admin user created: ${adminUser.username}`)
  
  // 4) Generate some regular users
  const users = await Promise.all(
    Array.from({ length: 10 }).map(() => {
      // Generate random coordinates in Indonesia
      // Jakarta area coordinates with some randomness
      const lat = -6.2088 + (Math.random() - 0.5) * 0.3;
      const lng = 106.8456 + (Math.random() - 0.5) * 0.3;
      
      return prisma.user.create({
        data: {
          username: faker.internet.userName(),
          password: faker.internet.password(),
          email: faker.internet.email(),
          role_id: userRole.id, // This will be 2
          is_blacklisted: faker.datatype.boolean(),
          createdAt: faker.date.past(),
          no_telp: faker.phone.number(),
          alamat: `${faker.location.streetAddress()}, ${faker.location.city()}, Indonesia`,
          full_name: faker.person.fullName(),
          ...(Math.random() > 0.3 ? {
            location_lat: lat,
            location_long: lng,
          } : {})
        },
      });
    })
  );

  // 5) Create some barang
  const barangData = [
    { nama: 'Large Grill',     foto: 'grill.jpg',    harga: 200_000, harga_pinalti_per_jam: 60_000, stok: 5,  kategori_id: kategoris[0].id, deskripsi: 'A large grill for outdoor cooking' },
    { nama: 'Small Tent',      foto: 'tent.jpg',     harga: 50_000,  harga_pinalti_per_jam:100_000, stok: 10, kategori_id: kategoris[1].id, deskripsi: 'A small tent for camping' },
    { nama: 'Hiking Backpack', foto: 'backpack.jpg', harga: 30_000,  harga_pinalti_per_jam: 40_000, stok: 20, kategori_id: kategoris[2].id, deskripsi: 'A durable hiking backpack' },
  ]
  const barangs = await Promise.all(barangData.map(b => prisma.barang.create({ data: b })))

  // 6) Create several random transactions & sewa_req tied together
  const paymentImages = ['payment.jpeg', 'receipt.jpg', 'transfer.png']

  for (let i = 0; i < 5; i++) {
    const user = faker.helpers.arrayElement(users)
    const start = faker.date.recent({ days: 10 })
    const end = new Date(
      start.getTime() + faker.number.int({ min: 1, max: 7 }) * 86400000 // add 1-7 days
    )

    // Choose a random status and maybe create an actual return date
    const status = faker.helpers.arrayElement(['pending', 'confirmed', 'active', 'completed', 'cancelled'])
    const actualReturnDate =
      status === 'completed'
        ? new Date(end.getTime() + faker.number.int({ min: -24, max: 48 }) * 3600000) // ±2 days from end date
        : null

    // Create some items for this rental
    const selectedItems = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => {
      const item = faker.helpers.arrayElement(barangs)
      const qty = faker.number.int({ min: 1, max: 2 })
      return {
        id_barang: item.id,
        jumlah: qty,
        harga_total: item.harga * qty,
      }
    })

    // Calculate total amount
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.harga_total, 0)

    // Create transaction first
    const transaksi = await prisma.transaksi.create({
      data: {
        id_user: user.id,
        // If schema requires id_sewa_req, you can set it later after sewa_req is created
        total_pembayaran: totalAmount,
        tanggal_transaksi: new Date(),
        status: status === 'pending' ? 'UNPAID' : 'PAID',
        bukti_pembayaran: faker.helpers.arrayElement(paymentImages),
        payment_method: faker.helpers.arrayElement(['transfer', 'cash', 'e-wallet']),
      }
    })

    // Create the sewa_req referencing the transaction
    const sewaReq = await prisma.sewa_req.create({
      data: {
        id_user: user.id,
        id_transaksi: transaksi.id, // tie sewa_req to the transaction
        start_date: start,
        end_date: end,
        status: status,
        dikembalikan_pada: status === 'completed' ? actualReturnDate : null,
        penalties_applied: status === 'completed' && faker.datatype.boolean(),
        has_been_inspected: status === 'completed',
        payment_status: status === 'pending' ? 'unpaid' : 'paid',
        total_amount: totalAmount,
        sewa_items: {
          create: selectedItems,
        },
      },
    })

    // Create penalties if applicable
    if (status === 'completed' && sewaReq.penalties_applied) {
      // Pick one of the sewa items to charge a penalty
      const rentalItem = faker.helpers.arrayElement(selectedItems)
      const item = await prisma.barang.findUnique({ where: { id: rentalItem.id_barang } })
      
      if (item) {
        const hoursLate = faker.number.int({ min: 1, max: 5 })
        const penalty = hoursLate * item.harga_pinalti_per_jam
        
        await prisma.penalti.create({
          data: {
            id_barang: item.id,
            id_user: user.id,
            id_sewa: sewaReq.id,
            total_bayar: penalty,
            alasan: faker.helpers.arrayElement([
              'Late return',
              'Minor damage',
              'Missing accessory',
              'Cleaning needed'
            ]),
            status: faker.helpers.arrayElement(['unpaid', 'paid']),
          },
        })
      }
    }
  }

  // 7) Keranjang - with rental dates
  await Promise.all(
    Array.from({ length: 5 }).map(() => {
      const user = faker.helpers.arrayElement(users)
      const item = faker.helpers.arrayElement(barangs)
      const qty = faker.number.int({ min: 1, max: 3 })

      // Generate a start/end for the cart item
      const startDate = faker.date.soon({ days: 7 })
      const endDate = new Date(startDate.getTime() + faker.number.int({ min: 1, max: 7 }) * 86400000)
      const rentalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000)

      return prisma.keranjang.create({
        data: {
          id_user: user.id,
          id_barang: item.id,
          jumlah: qty,
          subtotal: item.harga * qty * rentalDays,
          start_date: startDate,
          end_date: endDate,
          rental_days: rentalDays,
        },
      })
    })
  )

  // 8) Reviews
  await Promise.all(
    Array.from({ length: 10 }).map(() => {
      const user = faker.helpers.arrayElement(users)
      const item = faker.helpers.arrayElement(barangs)
      return prisma.review.create({
        data: {
          id_user: user.id,
          id_barang: item.id,
          rating: faker.number.int({ min: 1, max: 5 }),
          komentar: faker.lorem.sentence(),
          createdAt: faker.date.recent(),
        },
      })
    })
  )

  // 9) Artikel & Artikel_Comment
  const artikels = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.artikel.create({
        data: {
          judul: faker.lorem.words(3),
          konten: faker.lorem.paragraphs(2),
          foto: 'artikel.jpg',
          id_tags: faker.helpers.arrayElement(tags).id,
          is_published: faker.datatype.boolean(),
          publishAt: new Date(),
        },
      })
    )
  )

  await Promise.all(
    artikels.map((art) =>
      prisma.artikel_comment.create({
        data: {
          id_artikel: art.id,
          id_user: faker.helpers.arrayElement(users).id,
          komen_teks: faker.lorem.sentence(),
        },
      })
    )
  )

  console.log('🌱 Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())