import express from 'express'
import prisma from '../db/prisma.js'
const router = express.Router()
import verification from '../middleware/verification.js'

const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                isDeleted: false
            },
            orderBy: {
                name: "asc"
            }
        })
        return res.status(200).json({ status: 200, message: "Success", data: products })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const getProduct = async (req, res) => {
    const { id } = req.params
    try {
        const product = await prisma.product.findUnique({
            where: {
                id
            }
        })

        if (!product || product.isDeleted) {
            return res.status(404).json({ status: 404, message: "Produk tidak ditemukan!" })
        }

        return res.status(200).json({ status: 200, message: "Success", data: product })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const createProduct = async (req, res) => {
    const { name, buyPrice, sellPrice, unit, image } = req.body
    if (!name || !buyPrice || !sellPrice || !unit) {
        return res.status(400).json({ status: 400, message: 'Harap isi semua field' })
    }
    if (isNaN(Number(buyPrice)) || isNaN(Number(sellPrice))) {
        return res.status(400).json({ status: 400, message: 'Harga harus berupa angka' })
    }
    try {
        const product = await prisma.product.create({
            data: {
                name,
                buyPrice: Number(buyPrice),
                sellPrice: Number(sellPrice),
                unit,
                image: image || null,
            }
        })
        return res.status(200).json({ status: 200, message: 'Berhasil menambahkan produk!', data: product })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const editProduct = async (req, res) => {
    const { id } = req.params
    const { name, buyPrice, sellPrice, unit, image } = req.body
    if (!name || !buyPrice || !sellPrice || !unit) {
        return res.status(400).json({ status: 400, message: 'Harap isi semua field' })
    }
    if (isNaN(Number(buyPrice)) || isNaN(Number(sellPrice))) {
        return res.status(400).json({ status: 400, message: 'Harga harus berupa angka' })
    }
    try {
        const product = await prisma.product.update({
            where: {
                id
            },
            data: {
                name,
                buyPrice: Number(buyPrice),
                sellPrice: Number(sellPrice),
                unit,
                image: image || null,
            }
        })
        return res.status(200).json({ status: 200, message: 'Berhasil mengubah produk!', data: product })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const deleteProduct = async (req, res) => {
    const { id } = req.params
    try {
        const product = await prisma.product.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        })
        return res.status(200).json({ status: 200, message: 'Berhasil menghapus produk!', data: product })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}


router.get("/", verification(["Admin", "Employee"]), getAllProducts)
router.get("/:id", verification(["Admin", "Employee"]), getProduct)
router.post("/", verification(["Admin", "Employee"]), createProduct)
router.put("/:id", verification(["Admin", "Employee"]), editProduct)
router.delete("/:id", verification(["Admin", "Employee"]), deleteProduct)

export default router