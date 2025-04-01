import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const seedAdmin = async () => {
    const check = await prisma.user.findFirst({
        where: {
            AND: [
                {
                    isDeleted: false
                },
                {
                    role: "Admin"
                }
            ]
        }
    })
    if (!check) {
        const password = await bcrypt.hash("12345678", 10)
        const admin = await prisma.user.create({
            data: {
                name: "Admin",
                email: "admin@example.com",
                password,
                role: "Admin",
                address: "Ngaglik 56172, Sleman, Yogyakarta, Indonesia",
                countryCode: "+62",
                phone: "85156031385",
            }
        })
        console.log("Admin created", admin.email)
    } else {
        console.log("Admin already exist")
    }
}

const seedEmployee = async () => {
    const check = await prisma.user.findFirst({
        where: {
            AND: [
                {
                    isDeleted: false
                },
                {
                    role: "Employee"
                }
            ]
        }
    })
    if (!check) {
        const password = await bcrypt.hash("12345678", 10)
        const employee = await prisma.user.create({
            data: {
                name: "Employee",
                email: "employee@example.com",
                password,
                role: "Employee",
                address: "Ngaglik 56172, Sleman, Yogyakarta, Indonesia",
                countryCode: "+62",
                phone: "85156031385",
            }
        })
        console.log("Employee created", employee.email)
    } else {
        console.log("Employee already exist")
    }
}

const seedProducts = async () => {
    const check = await prisma.product.findFirst({
        where: {
            isDeleted: false
        }
    })

    if (!check) {
        const products = await prisma.product.createManyAndReturn({
            data: [
                {
                    name: "Beras",
                    buyPrice: 10000,
                    sellPrice: 15000,
                    unit: "Kg",
                    image: "https://kramatlaban-padarincang.desa.id/wp-content/uploads/2023/08/beras.jpg",
                },
                {
                    name: "Gula",
                    buyPrice: 5000,
                    sellPrice: 8000,
                    unit: "Kg",
                    image: "https://asset.kompas.com/crops/uiBT1A4jP_n-jGiIShXIlBJlzQQ=/0x0:1500x1000/1200x800/data/photo/2023/11/12/6550fcbea6729.jpg"
                },
                {
                    name: "Telur",
                    buyPrice: 20000,
                    sellPrice: 30000,
                    unit: "Kg",
                    image: "https://cdn.hellosehat.com/wp-content/uploads/2016/09/risiko-makan-telur.jpg?w=1080&q=100"
                },
                {
                    name: "Minyak Goreng",
                    buyPrice: 15000,
                    sellPrice: 20000,
                    unit: "Liter",
                    image: "https://allofresh.id/blog/wp-content/uploads/2023/08/merek-minyak-goreng-4.jpg"
                },
            ]
        })
        console.log("Products are created", products)
    } else {
        console.log("Product already exist")
    }
}

const seedPartners = async () => {
    const check = await prisma.partner.findFirst({
        where: {
            isDeleted: false
        }
    })
    if (!check) {
        const partners = await prisma.partner.createManyAndReturn({
            data: [
                {
                    name: "SRC Tiga Bersaudara",
                    address: "Jl. Raya Bulak, Bulak, Kec. Bulak, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281",
                    countryCode: "+62",
                    phone: "85256031385",
                    pic: "Levi Ackerman",
                    image: "https://lh5.googleusercontent.com/p/AF1QipOS2NSIu0nzJ5X9S-ooBXSYmtr1nszsqRpS2X9A=w493-h240-k-no"
                },
                {
                    name: "SRC Barokah",
                    address: "Jl. Letnan Tukiyat Nglerep, Pandeyan 1, Deyangan, Kec. Mertoyudan, Kabupaten Magelang, Jawa Tengah 56511",
                    countryCode: "+62",
                    phone: "85256031385",
                    pic: "Barokah Ackerman",
                    image: "https://assets.promediateknologi.id/crop/0x0:0x0/0x0/webp/photo/p2/100/2023/09/10/1-SRC-barokah-Kraksaan-3350506373.jpg"
                }
            ]
        })

        console.log("Partners are created", partners)
    } else {
        console.log("Partner already exist")
    }
}

const main = async () => {
    console.log("Seeding data...")
    await Promise.all([seedAdmin(), seedEmployee(), seedProducts(), seedPartners()])
    console.log("Seeding data success")
    await prisma.$disconnect()
}

main()