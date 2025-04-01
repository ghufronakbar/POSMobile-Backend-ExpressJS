import express from 'express'
import prisma from '../db/prisma.js'
const router = express.Router()
import verification from '../middleware/verification.js'

const getAllPartners = async (req, res) => {
    try {
        const partners = await prisma.partner.findMany({
            where: {
                isDeleted: false
            },
            orderBy: {
                name: "asc"
            }
        })
        return res.status(200).json({ status: 200, message: "Success", data: partners })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const getPartner = async (req, res) => {
    const { id } = req.params
    try {
        const partner = await prisma.partner.findUnique({
            where: {
                id
            },
            include: {
                orders: {
                    where: {
                        isDeleted: false
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    include: {
                        orderItems: {
                            include: {
                                product: true
                            },
                            where: {
                                isDeleted: false
                            }
                        }
                    }
                }
            }
        })

        if (!partner || partner.isDeleted) {
            return res.status(404).json({ status: 404, message: "Mitra tidak ditemukan!" })
        }

        return res.status(200).json({ status: 200, message: "Success", data: partner })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const createPartner = async (req, res) => {
    const { name, pic, countryCode, phone, address, image } = req.body
    if (!name || !pic || !countryCode || !phone || !address) {
        return res.status(400).json({ status: 400, message: 'Harap isi semua field' })
    }
    try {
        const checkName = await prisma.partner.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive"
                }
            }
        })
        if (checkName && checkName.isDeleted === false) {
            return res.status(400).json({ status: 400, message: "Mitra sudah terdaftar" })
        }
        const partner = await prisma.partner.create({
            data: {
                name,
                pic,
                countryCode,
                phone,
                address,
                image
            }
        })
        return res.status(200).json({ status: 200, message: 'Berhasil menambahkan mitra!', data: partner })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const editPartner = async (req, res) => {
    const { id } = req.params
    const { name, pic, countryCode, phone, address, image } = req.body
    if (!name || !pic || !countryCode || !phone || !address) {
        return res.status(400).json({ status: 400, message: 'Harap isi semua field' })
    }
    try {
        const checkName = await prisma.partner.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive"
                },
            }
        })
        if (checkName && checkName.isDeleted === false && checkName.id !== id) {
            return res.status(400).json({ status: 400, message: "Mitra sudah terdaftar" })
        }
        const partner = await prisma.partner.update({
            where: {
                id
            },
            data: {
                name,
                pic,
                countryCode,
                phone,
                address,
                image
            }
        })
        return res.status(200).json({ status: 200, message: 'Berhasil mengedit mitra!', data: partner })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const deletePartner = async (req, res) => {
    const { id } = req.params
    try {
        const partner = await prisma.partner.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        })
        return res.status(200).json({ status: 200, message: 'Berhasil menghapus mitra!', data: partner })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

router.get("/", verification(["Admin", "Employee"]), getAllPartners)
router.get("/:id", verification(["Admin", "Employee"]), getPartner)
router.post("/", verification(["Admin", "Employee"]), createPartner)
router.put("/:id", verification(["Admin", "Employee"]), editPartner)
router.delete("/:id", verification(["Admin", "Employee"]), deletePartner)

export default router