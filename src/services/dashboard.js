import express from 'express'
import prisma from '../db/prisma.js'
const router = express.Router()
import { chartProductAnnual, chartProductMonth, chartProductWeek } from './chart-product.js'
import { chartIncomeAnnual, chartIncomeMonth, chartIncomeWeek } from './chart-income.js'

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
                name: true,
                totalSellPrice: true
            }
        })

        const data = []

        for (const orderItem of orderItems) {
            const index = data.findIndex(item => item.name === orderItem.name)
            if (index !== -1) {
                data[index].quantity += orderItem.quantity
                data[index].totalSellPrice += orderItem.totalSellPrice
            } else {
                data.push({ name: orderItem.name, quantity: orderItem.quantity, totalSellPrice: orderItem.totalSellPrice })
            }
        }

        data.sort((a, b) => b.quantity - a.quantity)

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

const chartProduct = async (req, res) => {
    const { type } = req.query

    if (type === 'weekly') {
        return await chartProductWeek(req, res)
    } else if (type === 'monthly') {
        return await chartProductMonth(req, res)
    } else {
        return await chartProductAnnual(req, res)
    }
}

const chartIncome = async (req, res) => {
    const { type } = req.query

    if (type === 'weekly') {
        return await chartIncomeWeek(req, res)
    } else if (type === 'monthly') {
        return await chartIncomeMonth(req, res)
    } else {
        return await chartIncomeAnnual(req, res)
    }
}

router.get("/overview", overview)
router.get("/chart-product", chartProduct)
router.get("/chart-income", chartIncome)
router.get("/product-sold", countProductSold)
router.get("/most-sold-products", mostSoldProducts)
router.get("/partner-overview", partnerOverview)

export default router