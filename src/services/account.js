import express from 'express'
import prisma from '../db/prisma.js'
const router = express.Router()
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../constant/index.js"
import verification from '../middleware/verification.js'
import validateEmail from "../utils/validateEmail.js"
import randomCharacter from "../utils/randomCharacter.js"
import { sendEmail } from '../utils/node-mailer/send-email.js'

const login = async (req, res) => {
    const { email, password } = req.body
    try {
        if (!email || !password) {
            return res.status(400).json({ status: 400, message: 'Harap isi email dan password' })
        }
        const user = await prisma.user.findFirst({
            where: {
                email
            }
        })
        if (!user || user.isDeleted) {
            return res.status(404).json({ status: 404, message: 'Akun tidak ditemukan!' })
        }

        const check = await bcrypt.compare(password, user.password)
        if (!check) {
            return res.status(400).json({ status: 400, message: 'Password salah' })
        }
        const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET)
        return res.status(200).json({ status: 200, message: 'Login berhasil', data: { ...user, accessToken, role: user.role } })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const profile = async (req, res) => {
    const { id } = req.decoded
    try {
        const data = await prisma.user.findFirst({
            where: {
                id
            },
        })
        if (!data || data.isDeleted) {
            return res.status(404).json({ status: 404, message: 'Akun tidak ditemukan' })
        }
        return res.status(200).json({ status: 200, message: 'Account detail', data })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const register = async (req, res) => {
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

        return res.status(200).json({ message: "Berhasil membuat akun!", data: user })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const editProfile = async (req, res) => {
    const { name, email, countryCode, phone, address, image } = req.body
    const { id } = req.decoded
    if (!name || !email || !countryCode || !phone || !address) {
        return res.status(400).json({ status: 400, message: 'Harap isi semua field' })
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
            where: {
                id
            },
            data: {
                address,
                countryCode,
                email,
                name,
                phone,
                image: image || checkEmail.image
            }
        })

        return res.status(200).json({ status: 200, message: 'Berhasil mengedit profil', data: user })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const editPassword = async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body
    const { id } = req.decoded

    if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ status: 400, message: 'Harap isi semua field' })
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ status: 400, message: 'Password tidak sama' })
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })

        if (!user) {
            return res.status(404).json({ status: 404, message: 'Pengguna tidak ditemukan' })
        }

        const isValid = await bcrypt.compare(oldPassword, user.password)

        if (!isValid) {
            return res.status(400).json({ status: 400, message: 'Password lama salah' })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: {
                id
            },
            data: {
                password: hashedPassword
            }
        })

        return res.status(200).json({ status: 200, message: 'Password berhasil diubah' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

const resetPassword = async (req, res) => {
    const { email } = req.body
    if (!email) {
        return res.status(400).json({ status: 400, message: 'Harap isi semua field' })
    }
    try {
        const check = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!check || check.isDeleted) {
            return res.status(404).json({ status: 404, message: 'Pengguna tidak ditemukan' })
        }
        const random = randomCharacter(8)
        const hashedPassword = await bcrypt.hash(random, 10)
        const send = await sendEmail(email, "RESET_PASSWORD", check.name, random)
        if (send instanceof Error) {
            return res.status(500).json({ status: 500, message: 'Gagal mengirim email' })
        }
        await prisma.user.update({
            where: {
                email
            },
            data: {
                password: hashedPassword
            }
        })

        return res.status(200).json({ status: 200, message: 'Password berhasil diubah, cek email!' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

router.post("/login", login)
router.post("/register", verification(["Admin", "Employee"]), register)
router.post("/edit-password", verification(["Admin", "Employee"]), editPassword)
router.post("/reset-password", resetPassword)
router.get("/", verification(["Admin", "Employee"]), profile)
router.put("/", verification(["Admin", "Employee"]), editProfile)

export default router