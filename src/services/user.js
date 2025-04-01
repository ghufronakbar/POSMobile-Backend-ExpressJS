import express from 'express'
import prisma from '../db/prisma.js'
import { sendEmail } from '../utils/node-mailer/send-email.js';
import verification from '../middleware/verification.js';
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

        const send = await sendEmail(email, "DELETE_ACCOUNT", user.name)

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



router.get("/", verification(["Admin", "Employee"]), getAllUsers)
router.get("/:id", verification(["Admin", "Employee"]), getUser)
router.delete("/:id", verification(["Admin", "Employee"]), deleteUser)

export default router