import express from 'express'
import prisma from '../db/prisma.js'
const router = express.Router()
import verification from '../middleware/verification.js'
import formatDate from '../utils/format/formatDate.js'

const overview = async (req, res) => {
    try {
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const endDay = new Date(now.getTime() + 86400000)
        const [countOrder, orders] = await Promise.all([
            prisma.order.count({
                where: {
                    AND: [
                        {
                            isDeleted: false
                        },
                        {
                            date: {
                                gte: now,
                                lte: endDay,
                            }
                        },
                        {
                            startedAt: null
                        }
                    ]
                }
            }),
            prisma.order.findMany({
                where: {
                    AND: [
                        {
                            isDeleted: false
                        },
                        {
                            finishedAt: {
                                not: null
                            }
                        }
                    ]
                },
                select: {
                    totalSellPrice: true,
                    totalBuyPrice: true,
                    orderItems: {
                        select: {
                            quantity: true
                        }
                    }
                }
            })
        ])

        const message = countOrder === 0 ? "Tidak ada pesanan untuk hari ini" : "Harus segera dikirim hari ini!"


        let totalIncome = 0
        let totalProfit = 0
        let averageTransactionValue = 0
        let totalItem = 0

        for (const order of orders) {
            totalIncome += order.totalSellPrice
            const profit = order.totalSellPrice - order.totalBuyPrice
            totalProfit += profit
            totalItem += order.orderItems.reduce((total, item) => total + item.quantity, 0)
        }

        averageTransactionValue = Number(totalProfit) / Number(totalItem) || 0

        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    isDeleted: false
                }
            },
            select: {
                quantity: true,
            }
        })

        let totalOrderItem = 0

        for (const orderItem of orderItems) {
            totalOrderItem += orderItem.quantity
        }

        const data = {
            order: {
                total: countOrder,
                message
            },
            sales: {
                totalIncome,
                totalProfit,
                averageTransactionValue
            },
            orderItem: {
                total: totalOrderItem
            }
        }

        return res.status(200).json({ status: 200, message: "OK", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Terjadi Kesalahan Sistem!" })
    }
}

const chartProduct = async (req, res) => {
    try {
        const now = new Date()
        const listMonth = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    isDeleted: false
                }
            },
            select: {
                name: true,
                quantity: true,
                createdAt: true
            }
        })

        const currentMonth = formatDate(now, true)
        const currentIndex = listMonth.indexOf(currentMonth);

        const sortedListMonth = listMonth
            .slice(currentIndex)
            .concat(listMonth.slice(0, currentIndex));

        const data = sortedListMonth.map((item) => ({ month: item }))

        for (const orderItem of orderItems) {
            const monthName = formatDate(orderItem.createdAt, true)
            const index = sortedListMonth.indexOf(monthName)
            if (index !== -1) {
                data[index][orderItem.name] = orderItem.quantity
            }
        }

        const uniqueKeys = []

        for (const item of data) {
            const keys = Object.keys(item)
            for (const key of keys) {
                if (!uniqueKeys.includes(key) && key !== "month") {
                    uniqueKeys.push(key)
                }
            }
        }

        for (const item of data) {
            const keys = Object.keys(item).filter(key => key !== "month")
            for (const key of uniqueKeys) {
                if (!keys.includes(key)) {
                    item[key] = 0
                }
            }
        }

        return res.status(200).json({ status: 200, message: "OK", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Terjadi Kesalahan Sistem!" })
    }
}

const chartIncome = async (req, res) => {
    try {
        const now = new Date()
        const listMonth = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    isDeleted: false
                }
            },
            select: {
                name: true,
                totalSellPrice: true,
                createdAt: true
            }
        })

        const currentMonth = formatDate(now, true)
        const currentIndex = listMonth.indexOf(currentMonth);

        const sortedListMonth = listMonth
            .slice(currentIndex)
            .concat(listMonth.slice(0, currentIndex));

        const data = sortedListMonth.map((item) => ({ month: item }))

        for (const orderItem of orderItems) {
            const monthName = formatDate(orderItem.createdAt, true)
            const index = sortedListMonth.indexOf(monthName)
            if (index !== -1) {
                data[index][orderItem.name] = orderItem.totalSellPrice
            }
        }

        const uniqueKeys = []

        for (const item of data) {
            const keys = Object.keys(item)
            for (const key of keys) {
                if (!uniqueKeys.includes(key) && key !== "month") {
                    uniqueKeys.push(key)
                }
            }
        }

        for (const item of data) {
            const keys = Object.keys(item).filter(key => key !== "month")
            for (const key of uniqueKeys) {
                if (!keys.includes(key)) {
                    item[key] = 0
                }
            }
        }

        for (const item of data) {
            let total = 0
            Object.keys(item).forEach(key => {
                if (key !== "month") {
                    total += item[key]
                }
            })
            item.total = total
        }

        return res.status(200).json({ status: 200, message: "OK", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Terjadi Kesalahan Sistem!" })
    }
}

const countProductSold = async (req, res) => {
    try {
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    isDeleted: false
                }
            },
            select: {
                quantity: true,
                name: true
            }
        })

        const data = []

        for (const orderItem of orderItems) {
            const index = data.findIndex(item => item.name === orderItem.name)
            if (index !== -1) {
                data[index].quantity += orderItem.quantity
            } else {
                data.push({ name: orderItem.name, quantity: orderItem.quantity })
            }
        }


        return res.status(200).json({ status: 200, message: "OK", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Terjadi Kesalahan Sistem!" })
    }
}

const mostSoldProducts = async (req, res) => {
    try {
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    isDeleted: false
                }
            },
            select: {
                quantity: true,
                name: true
            }
        })

        const data = []

        for (const orderItem of orderItems) {
            const index = data.findIndex(item => item.name === orderItem.name)
            if (index !== -1) {
                data[index].quantity += orderItem.quantity
            } else {
                data.push({ name: orderItem.name, quantity: orderItem.quantity })
            }
        }

        data.sort((a, b) => b.quantity - a.quantity).slice(0, 5)

        return res.status(200).json({ status: 200, message: "OK", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Terjadi Kesalahan Sistem!" })
    }
}

const partnerOverview = async (req, res) => {
    try {
        const partners = await prisma.partner.findMany({
            where: {
                isDeleted: false
            },
            select: {
                name: true,
                orders: {
                    select: {
                        orderItems: {
                            select: {
                                quantity: true
                            }
                        }
                    }
                }
            }
        })

        const totalPartners = partners.length
        const mappedPartners = []
        for (const partner of partners) {
            const totalQuantity = partner.orders.reduce((acc, order) => acc + order.orderItems.reduce((acc, orderItem) => acc + orderItem.quantity, 0), 0)
            mappedPartners.push({ name: partner.name, totalQuantity })
        }
        mappedPartners.sort((a, b) => b.totalQuantity - a.totalQuantity).filter((item) => item.totalQuantity !== 0).slice(0, 5)

        const data = {
            totalPartners,
            topPartners: mappedPartners
        }

        return res.status(200).json({ status: 200, message: "OK", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Terjadi Kesalahan Sistem!" })
    }
}

router.get("/overview", overview)
router.get("/chart-product", chartProduct)
router.get("/chart-income", chartIncome)
router.get("/product-sold", countProductSold)
router.get("/most-sold-products", mostSoldProducts)
router.get("/partner-overview", partnerOverview)

export default router