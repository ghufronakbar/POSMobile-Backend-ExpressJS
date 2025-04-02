import express from 'express'
import prisma from '../db/prisma.js'
const router = express.Router()
import verification from '../middleware/verification.js'

const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                isDeleted: false
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                orderItems: {
                    where: {
                        isDeleted: false
                    }
                },
                partner: true
            }
        })
        for (const order of orders) {
            if (order.finishedAt) {
                order.status = "Selesai"
            } else if (order.startedAt) {
                order.status = "Dalam Proses"
            } else {
                order.status = "Mendatang"
            }
        }
        return res.status(200).json({ status: 200, message: "Success", data: orders })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const getOrder = async (req, res) => {
    const { id } = req.params
    try {
        const order = await prisma.order.findUnique({
            where: {
                id
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    },
                    where: {
                        isDeleted: false
                    }
                },
                partner: true
            }
        })

        if (!order || order.isDeleted) {
            return res.status(404).json({ status: 404, message: "Pesanan tidak ditemukan!" })
        }

        return res.status(200).json({ status: 200, message: "Success", data: order })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const createOrder = async (req, res) => {
    const { date, partnerId, note, orderItems } = req.body
    if (!date || !partnerId || !orderItems) {
        return res.status(400).json({ status: 400, message: 'Harap isi semua field' })
    }
    const parsedDate = Date.parse(date);
    if (isNaN(parsedDate)) {
        return res.status(400).json({ status: 400, message: 'Tanggal tidak valid' });
    }

    if (new Date(date) < new Date()) {
        return res.status(400).json({ status: 400, message: 'Tanggal tidak boleh kurang dari hari ini' });
    }

    if (typeof orderItems !== "object") {
        return res.status(400).json({ status: 400, message: 'Format pesanan tidak valid' })
    }
    if (!Array.isArray(orderItems)) {
        return res.status(400).json({ status: 400, message: 'Format pesanan tidak valid' })
    }
    if (orderItems.length === 0) {
        return res.status(400).json({ status: 400, message: 'Pesanan tidak boleh kosong' })
    }
    const allowedKeys = ["productId", "quantity"];
    const productIds = []
    orderItems.forEach(item => {
        const keys = Object.keys(item);
        const invalidKeys = keys.filter(key => !allowedKeys.includes(key));
        if (invalidKeys.length > 0) {
            invalidKeys.forEach(key => delete item[key]);
        }
        if (!item.productId || !item.quantity || isNaN(Number(item.quantity))) {
            return res.status(400).json({ status: 400, message: 'Format pesanan tidak valid' })
        }
        productIds.push(item.productId)
    })
    try {
        const [checkProducts, checkPartner] = await Promise.all([
            prisma.product.findMany({
                where: {
                    AND: [
                        {
                            id: {
                                in: productIds
                            }
                        },
                        {
                            isDeleted: false
                        }
                    ]
                },
            }),
            prisma.partner.findUnique({
                where: {
                    id: partnerId
                }
            })
        ])
        if (!checkPartner || checkPartner.isDeleted) {
            return res.status(400).json({ status: 400, message: 'Partner tidak ditemukan' })
        }
        if (checkProducts.length !== productIds.length) {
            return res.status(400).json({ status: 400, message: 'Produk tidak ditemukan' })
        }

        let totalBuyPriceOrder = 0
        let totalSellPriceOrder = 0

        const dataOrderItems = orderItems.map(item => {
            const buyPrice = checkProducts.find(product => product.id === item.productId).buyPrice || 0
            const sellPrice = checkProducts.find(product => product.id === item.productId).sellPrice || 0
            const totalBuyPrice = buyPrice * Number(item.quantity)
            const totalSellPrice = sellPrice * Number(item.quantity)
            const image = checkProducts.find(product => product.id === item.productId).image || null
            const unit = checkProducts.find(product => product.id === item.productId).unit || "pcs"
            const name = checkProducts.find(product => product.id === item.productId).name || "Produk Tidak Ditemukan"
            totalBuyPriceOrder += totalBuyPrice
            totalSellPriceOrder += totalSellPrice
            return {
                productId: item.productId,
                quantity: Number(item.quantity),
                totalBuyPrice,
                totalSellPrice,
                image,
                unit,
                name
            }
        })

        const order = await prisma.order.create({
            data: {
                date: new Date(date),
                partnerId,
                totalBuyPrice: totalBuyPriceOrder,
                totalSellPrice: totalSellPriceOrder,
                note,
                orderItems: {
                    createMany: {
                        data: dataOrderItems
                    }
                }
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        })

        order.status = "Mendatang"

        return res.status(200).json({ status: 200, message: 'Berhasil membuat pesanan!', data: order })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const trackOrder = async (req, res) => {
    const { id } = req.params
    try {
        const check = await prisma.order.findUnique({
            where: {
                id
            }
        })
        if (!check || check.isDeleted) {
            return res.status(404).json({ status: 404, message: 'Pesanan tidak ditemukan' })
        }

        if (check.finishedAt) {
            return res.status(400).json({ status: 400, message: 'Pesanan sudah selesai' })
        }

        if (!check.startedAt) {
            const order = await prisma.order.update({
                where: {
                    id
                },
                data: {
                    startedAt: new Date()
                }
            })
            return res.status(200).json({ status: 200, message: 'Berhasil memulai pesanan!', data: order })
        } else {
            const order = await prisma.order.update({
                where: {
                    id
                },
                data: {
                    finishedAt: new Date()
                }
            })
            return res.status(200).json({ status: 200, message: 'Berhasil menyelesaikan pesanan!', data: order })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

router.get("/", verification(["Admin", "Employee"]), getAllOrders)
router.get("/:id", verification(["Admin", "Employee"]), getOrder)
router.post("/", verification(["Admin", "Employee"]), createOrder)
router.post("/:id/track", verification(["Admin", "Employee"]), trackOrder)

export default router