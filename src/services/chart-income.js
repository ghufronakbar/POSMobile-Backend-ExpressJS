import prisma from '../db/prisma.js'
import formatDate from '../utils/format/formatDate.js'
import { getColor } from '../utils/getColor.js'

export const chartIncomeAnnual = async (req, res) => {
    try {
        const now = new Date()
        const listMonth = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
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
                }
            },
            select: {
                name: true,
                totalSellPrice: true,
                createdAt: true,
                totalBuyPrice: true
            }
        })

        const currentMonth = formatDate(now, true)
        const currentIndex = listMonth.indexOf(currentMonth);

        const sortedListMonth = listMonth
            .slice(currentIndex)
            .concat(listMonth.slice(0, currentIndex));

        const data = sortedListMonth.map((item) => ({ date: item }))

        for (const orderItem of orderItems) {
            const monthName = formatDate(orderItem.createdAt, true)
            const index = sortedListMonth.indexOf(monthName)
            if (index !== -1) {
                if (data[index][orderItem.name] === undefined) data[index][orderItem.name] = 0
                data[index][orderItem.name] += orderItem.totalSellPrice
            }
        }

        const uniqueKeys = []

        for (const item of data) {
            const keys = Object.keys(item)
            for (const key of keys) {
                if (!uniqueKeys.includes(key) && key !== "date") {
                    uniqueKeys.push(key)
                }
            }
        }

        for (const item of data) {
            const keys = Object.keys(item).filter(key => key !== "date")
            for (const key of uniqueKeys) {
                if (!keys.includes(key)) {
                    item[key] = 0
                }
            }
        }

        for (const item of data) {
            let total = 0
            Object.keys(item).forEach(key => {
                if (key !== "date") {
                    total += item[key]
                }
            })
            item.total = total
        }

        const keys = uniqueKeys.map((key, index) => {
            const total = data.reduce((total, item) => total + item[key], 0)
            return {
                name: key,
                color: getColor(index),
                total: total
            }
        })

        const totalBuyPrice = orderItems.reduce((total, item) => total + item.totalBuyPrice, 0)
        const totalSellPrice = orderItems.reduce((total, item) => total + item.totalSellPrice, 0)
        const profit = totalSellPrice - totalBuyPrice

        const master = {
            total: keys.reduce((total, item) => total + item.total, 0),
            totalBuyPrice,
            totalSellPrice,
            profit
        }

        return res.status(200).json({ status: 200, message: "OK", data: { chart: data, keys, master } })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Terjadi Kesalahan Sistem!" })
    }
}

const formatWeek = (date) => {
    const monthName = formatDate(new Date(), true)
    const getDate = date.getDate()
    return `Minggu ${Math.ceil(getDate / 7)}, ${monthName}`
}

export const chartIncomeMonth = async (req, res) => {
    try {
        const now = new Date()
        const curStartMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthName = formatDate(now, true)
        const listWeek = Array.from({ length: 4 }).map((_, index) => `Minggu ${index + 1}, ${monthName}`)
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    AND: [
                        {
                            isDeleted: false
                        },
                        {
                            finishedAt: {
                                not: null
                            }
                        },
                        {
                            createdAt: {
                                gte: curStartMonth
                            }
                        }
                    ]
                }
            },
            select: {
                name: true,
                totalSellPrice: true,
                createdAt: true,
                totalBuyPrice: true
            }
        })

        const data = listWeek.map((item) => ({ date: item }))

        for (const orderItem of orderItems) {
            const keyWeek = formatWeek(orderItem.createdAt, true)
            const index = listWeek.indexOf(keyWeek)
            if (index !== -1) {
                if (data[index][orderItem.name] === undefined) data[index][orderItem.name] = 0
                data[index][orderItem.name] += orderItem.totalSellPrice
            }
        }

        const uniqueKeys = []

        for (const item of data) {
            const keys = Object.keys(item)
            for (const key of keys) {
                if (!uniqueKeys.includes(key) && key !== "date") {
                    uniqueKeys.push(key)
                }
            }
        }

        for (const item of data) {
            const keys = Object.keys(item).filter(key => key !== "date")
            for (const key of uniqueKeys) {
                if (!keys.includes(key)) {
                    item[key] = 0
                }
            }
        }

        for (const item of data) {
            let total = 0
            Object.keys(item).forEach(key => {
                if (key !== "date") {
                    total += item[key]
                }
            })
            item.total = total
        }

        const keys = uniqueKeys.map((key, index) => {
            const total = data.reduce((total, item) => total + item[key], 0)
            return {
                name: key,
                color: getColor(index),
                total: total
            }
        })

        const totalBuyPrice = orderItems.reduce((total, item) => total + item.totalBuyPrice, 0)
        const totalSellPrice = orderItems.reduce((total, item) => total + item.totalSellPrice, 0)
        const profit = totalSellPrice - totalBuyPrice

        const master = {
            total: keys.reduce((total, item) => total + item.total, 0),
            totalBuyPrice,
            totalSellPrice,
            profit
        }

        return res.status(200).json({ status: 200, message: "OK", data: { chart: data, keys, master } })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Terjadi Kesalahan Sistem!" })
    }
}

const formatGetDate = (date) => {
    const monthName = formatDate(new Date(), true)
    return `${date.getDate()}, ${monthName}`
}

export const chartIncomeWeek = async (req, res) => {
    try {
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const listDate = Array.from({ length: 7 }).map((_, index) => {
            const date = new Date(now.getTime() - index * 24 * 60 * 60 * 1000)
            const month = formatDate(date, true)
            return `${date.getDate()}, ${month}`
        }).reverse()
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    AND: [
                        {
                            isDeleted: false
                        },
                        {
                            finishedAt: {
                                not: null
                            }
                        },
                        {
                            createdAt: {
                                gte: sevenDaysAgo
                            }
                        }
                    ]
                }
            },
            select: {
                name: true,
                totalSellPrice: true,
                createdAt: true,
                totalBuyPrice: true
            }
        })

        const data = listDate.map((item) => ({ date: item }))

        for (const orderItem of orderItems) {
            const keyDate = formatGetDate(orderItem.createdAt, true)
            const index = listDate.indexOf(keyDate)
            if (index !== -1) {
                if (data[index][orderItem.name] === undefined) data[index][orderItem.name] = 0
                data[index][orderItem.name] += orderItem.totalSellPrice
            }
        }

        const uniqueKeys = []

        for (const item of data) {
            const keys = Object.keys(item)
            for (const key of keys) {
                if (!uniqueKeys.includes(key) && key !== "date") {
                    uniqueKeys.push(key)
                }
            }
        }

        for (const item of data) {
            const keys = Object.keys(item).filter(key => key !== "date")
            for (const key of uniqueKeys) {
                if (!keys.includes(key)) {
                    item[key] = 0
                }
            }
        }

        for (const item of data) {
            let total = 0
            Object.keys(item).forEach(key => {
                if (key !== "date") {
                    total += item[key]
                }
            })
            item.total = total
        }

        const keys = uniqueKeys.map((key, index) => {
            const total = data.reduce((total, item) => total + item[key], 0)
            return {
                name: key,
                color: getColor(index),
                total: total
            }
        })

        const totalBuyPrice = orderItems.reduce((total, item) => total + item.totalBuyPrice, 0)
        const totalSellPrice = orderItems.reduce((total, item) => total + item.totalSellPrice, 0)
        const profit = totalSellPrice - totalBuyPrice

        const master = {
            total: keys.reduce((total, item) => total + item.total, 0),
            totalBuyPrice,
            totalSellPrice,
            profit
        }

        return res.status(200).json({ status: 200, message: "OK", data: { chart: data, keys, master } })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Terjadi Kesalahan Sistem!" })
    }
}