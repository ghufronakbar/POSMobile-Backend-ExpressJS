import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getAllProducts = async () => {
    const products = await prisma.product.findMany({
        where: {
            isDeleted: false
        }
    })
    return products
}

const getAllPartners = async () => {
    const partners = await prisma.partner.findMany({
        where: {
            isDeleted: false
        }
    })
    return partners
}

const getRandomDate = () => {
    const start = new Date(2023, 0, 1)
    const end = new Date(2025, 4, 6)
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    return randomDate
}

const seedOrders = async () => {
    const [products, partners] = await Promise.all([getAllProducts(), getAllPartners()])    

    Array.from({ length: 50 }).forEach(async (_, index) => {
        let totalSellPrice = 0;
        let totalBuyPrice = 0;
        const date = getRandomDate()
        const order = await prisma.order.create({
            data: {
                date,
                partnerId: partners[Math.floor(Math.random() * partners.length)].id,
                note: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quas.",
                totalBuyPrice,
                totalSellPrice,
                startedAt: new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000),
                finishedAt: new Date(date.getTime() - 1 * 24 * 60 * 60 * 1000),
                createdAt: new Date(date.getTime() - 3 * 24 * 60 * 60 * 1000),
                orderItems: {
                    createMany: {
                        data: products.map(product => {
                            const randomQuantity = Math.floor(Math.random() * 10) + 1;
                            totalBuyPrice += product.buyPrice * randomQuantity;
                            totalSellPrice += product.sellPrice * randomQuantity;
                            return {
                                productId: product.id,
                                quantity: randomQuantity,
                                totalSellPrice: product.sellPrice * randomQuantity,
                                totalBuyPrice: product.buyPrice * randomQuantity,
                                name: product.name,
                                image: product.image,
                                unit: product.unit,
                                createdAt: new Date(date.getTime() - 3 * 24 * 60 * 60 * 1000),
                            }
                        })

                    }
                }
            },
            include: {
                partner: true
            }
        })
        await prisma.order.update({
            where: {
                id: order.id
            },
            data: {
                totalSellPrice,
                totalBuyPrice,
                note: `Pembelian pak ${order.partner.pic}`
            }
        })
        console.log("Order created", order.id)
    })
}


const main = async () => {
    console.log("Seeding data...")
    await Promise.all([seedOrders()])
    console.log("Seeding data success")
    await prisma.$disconnect()
}

main()