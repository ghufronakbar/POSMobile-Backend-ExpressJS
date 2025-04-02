import express from 'express'
import prisma from '../db/prisma.js'
import { sendEmail } from '../utils/node-mailer/send-email.js';
import verification from '../middleware/verification.js';
import randomCharacter from '../utils/randomCharacter.js';
import bcrypt from 'bcryptjs'
import validateEmail from '../utils/validateEmail.js';
const router = express.Router()

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                isDeleted: false
            },
            orderBy: {
                name: "asc"
            }
        });


        return res.status(200).json({ status: 200, message: "Success", data: users })
    } catch (error) {
        res.status(500).json({ status: 500, message: "Terjadi Kesalahan Sistem!" })
    }
}

const getUser = async (req, res) => {
    const { id } = req.params
    try {
        const user = await prisma.user.findUnique({
            where: {
                id
            },
        });
        if (!user || user.isDeleted) {
            return res.status(404).json({ status: 404, message: "Pengguna tidak ditemukan" })
        }

        return res.status(200).json({ status: 200, message: "Success", data: user })
    } catch (error) {
        res.status(500).json({ status: 500, message: "Terjadi Kesalahan Sistem!" })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params
    try {
        const check = await prisma.user.findUnique({
            where: {
                id
            }
        })

        if (!check || check.isDeleted) {
            return res.status(404).json({ status: 404, message: "Pengguna tidak ditemukan" })
        }

        const send = await sendEmail(user.email, "DELETE_ACCOUNT", user.name)

        if (send instanceof Error) {
            return res.status(500).json({ status: 500, message: "Gagal mengirim email" })
        }

        const user = await prisma.user.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        });

        return res.status(200).json({ status: 200, message: "Berhasil menghapus pengguna!", data: user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, message: "Terjadi Kesalahan Sistem!" })
    }
}

const createUser = async (req, res) => {
    const { name, email, countryCode, phone, address, role, image } = req.body
    if (!name || !email || !countryCode || !phone || !address || !role) {
        return res.status(400).json({ status: 400, message: 'Harap isi semua field' })
    }

    if (role !== "Admin" && role !== "Employee") {
        return res.status(400).json({ status: 400, message: 'Role tidak valid' })
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ status: 400, message: 'Email tidak valid' })
    }
    try {
        const checkEmail = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (checkEmail) {
            return res.status(400).json({ status: 400, message: "Email sudah terdaftar" })
        }
        const password = randomCharacter(8)
        const hashedPassword = await bcrypt.hash(password, 10)
        const send = await sendEmail(email, "CREATE_ACCOUNT", name, password)
        if (send instanceof Error) {
            return res.status(500).json({ status: 500, message: 'Gagal mengirim email' })
        }
        const user = await prisma.user.create({
            data: {
                address,
                countryCode,
                email,
                name,
                password: hashedPassword,
                phone,
                role,
                image: image || null
            }
        })

        return res.status(200).json({ message: "Berhasil membuat akun, harap cek email!", data: user })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const editUser = async (req, res) => {
    const { id } = req.params
    const { name, email, countryCode, phone, address, role, image } = req.body
    if (!name || !email || !countryCode || !phone || !address || !role) {
        return res.status(400).json({ status: 400, message: 'Harap isi semua field' })
    }

    if (role !== "Admin" && role !== "Employee") {
        return res.status(400).json({ status: 400, message: 'Role tidak valid' })
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ status: 400, message: 'Email tidak valid' })
    }
    try {
        const checkEmail = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (checkEmail && checkEmail.id !== id) {
            return res.status(400).json({ status: 400, message: "Email sudah terdaftar" })
        }

        const user = await prisma.user.update({
            data: {
                address,
                countryCode,
                email,
                name,
                phone,
                role,
                image: image || null
            },
            where: [
                id
            ]
        })

        return res.status(200).json({ message: "Berhasil mengedit akun!", data: user })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}



router.get("/", verification(["Admin", "Employee"]), getAllUsers)
router.get("/:id", verification(["Admin", "Employee"]), getUser)
router.post("/", verification(["Admin", "Employee"]), createUser)
router.put("/:id", verification(["Admin", "Employee"]), editUser)
router.delete("/:id", verification(["Admin", "Employee"]), deleteUser)

export default router