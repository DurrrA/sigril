import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  // 1) Roles
  const [adminRole, userRole] = await Promise.all([
    prisma.role.create({ data: { role_name: 'Admin',  deskripsi: 'Administrator' } }),
    prisma.role.create({ data: { role_name: 'User',   deskripsi: 'Regular user' } }),
  ])

  // 2) Tags & Categories
  const tagNames = ['Adventure', 'Tutorial', 'Review', 'News']
  const tags = await Promise.all(tagNames.map(nama => prisma.tags.create({ data: { nama } })))

  const kategoriNames = ['Grill', 'Tent', 'Backpack']
  const kategoris = await Promise.all(
    kategoriNames.map(nama => prisma.kategori.create({ data: { nama } }))
  )

  const adminUser = await prisma.user.create({
    data: {
      username: faker.internet.userName(),
      password: faker.internet.password(),
      email:    faker.internet.email(),
      role_id:  adminRole.id,
      is_blacklisted: faker.datatype.boolean(),
      createdAt: faker.date.past(),
    },
  })
  console.log(`Admin user created: ${adminUser.username}`)
  // 3) Users
  const users = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.user.create({
        data: {
          username: faker.internet.userName(),
          password: faker.internet.password(),
          email:    faker.internet.email(),
          role_id:  userRole.id,
          is_blacklisted: faker.datatype.boolean(),
          createdAt: faker.date.past(),
        },
      })
    )
  )

  // 4) Barang
  const barangData = [
    { nama: 'Large Grill',       foto: 'grill.jpg',      harga: 200_000, harga_pinalti_per_jam: 60_000, stok: 5,  kategori_id: kategoris[0].id, deskripsi: 'A large grill for outdoor cooking' },
    { nama: 'Small Tent',        foto: 'tent.jpg',       harga:  50_000, harga_pinalti_per_jam:100_000, stok: 10, kategori_id: kategoris[1].id, deskripsi: 'A small tent for camping' },
    { nama: 'Hiking Backpack',   foto: 'backpack.jpg',   harga:  30_000, harga_pinalti_per_jam: 40_000, stok: 20, kategori_id: kategoris[2].id, deskripsi: 'A durable hiking backpack' },
  ]
  const barangs = await Promise.all(barangData.map(b => prisma.barang.create({ data: b })))

  const sewaReqs = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      const user  = faker.helpers.arrayElement(users)
      const start = faker.date.recent({ days: 10 })
      const end   = new Date(start.getTime() + faker.number.int({ min: 1, max: 72 }) * 3600_000)

      return prisma.sewa_req.create({
        data: {
          id_user:    user.id,
          start_date: start,
          end_date:   end,
          status:     faker.helpers.arrayElement(['PENDING', 'APPROVED', 'COMPLETED']),
          dikembalikan_pada: faker.datatype.boolean() ? end : null,
          sewa_items: {
            create: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => {
              const item = faker.helpers.arrayElement(barangs)
              const qty  = faker.number.int({ min: 1, max: 2 })
              return {
                id_barang:   item.id,
                jumlah:      qty,
                harga_total: item.harga * qty,
              }
            }),
          },
        },
      })
    })
  )
  const paymentImages = [
    'payment.jpeg'
  ]

  // 6) Transaksi (sum of sewa_items)
  await Promise.all(
    sewaReqs.map(async (r) => {
      const agg = await prisma.sewa_items.aggregate({
        where: { id_sewa_req: r.id },
        _sum:   { harga_total: true },
      })
      await prisma.transaksi.create({
        data: {
          id_user:          r.id_user,
          total_pembayaran: agg._sum.harga_total || 0,
          tanggal_transaksi: new Date(),
          status:           'PAID',
          bukti_pembayaran: faker.helpers.arrayElement(paymentImages)
        },
      })
    })
  )

  // 7) Keranjang
  await Promise.all(
    Array.from({ length: 5 }).map(() => {
      const user = faker.helpers.arrayElement(users)
      const item = faker.helpers.arrayElement(barangs)
      const qty  = faker.number.int({ min: 1, max: 3 })
      return prisma.keranjang.create({
        data: {
          id_user:   user.id,
          id_barang: item.id,
          jumlah:    qty,
          subtotal:  item.harga * qty,
        },
      })
    })
  )

  // 8) Penalti (random subset)
  await Promise.all(
    sewaReqs
      .filter(() => faker.datatype.boolean())
      .map(async (r) => {
        // pick one of its items
        const si  = await prisma.sewa_items.findFirst({ where: { id_sewa_req: r.id } })
        if (!si) return
        const item = await prisma.barang.findUnique({ where: { id: si.id_barang } })
        if (!item) return

        const hoursLate = faker.number.int({ min: 1, max: 5 })
        return prisma.penalti.create({
          data: {
            id_barang:   item.id,
            id_user:     r.id_user,
            total_bayar: hoursLate * item.harga_pinalti_per_jam,
          },
        })
      })
  )

  // 9) Reviews
  await Promise.all(
    Array.from({ length: 10 }).map(() => {
      const user = faker.helpers.arrayElement(users)
      const item = faker.helpers.arrayElement(barangs)
      return prisma.review.create({
        data: {
          id_user:   user.id,
          id_barang: item.id,
          rating:    faker.number.int({ min: 1, max: 5 }),
          komentar:  faker.lorem.sentence(),
          createdAt: faker.date.recent(),
        },
      })
    })
  )

  // 10) Artikel & Artikel_Comment
  const artikels = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.artikel.create({
        data: {
          judul:        faker.lorem.words(3),
          konten:       faker.lorem.paragraphs(2),
          foto:         'artikel.jpg',
          id_tags:      faker.helpers.arrayElement(tags).id,
          is_published: faker.datatype.boolean(),
          publishAt:    new Date(),
        },
      })
    )
  )

  await Promise.all(
    artikels.map((art) =>
      prisma.artikel_comment.create({
        data: {
          id_artikel: art.id,
          id_user:    faker.helpers.arrayElement(users).id,
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