import express from 'express'
import { uploadCloudinary } from '../utils/cloudinary/uploadCloudinary.js'
const router = express.Router()

const uploadImage = async (req, res) => {
    try {
        const image = req.file
        if (!image) {
            return res.status(400).json({ status: 400, message: 'Harap upload gambar' })
        }
        return res.status(200).json({ status: 200, message: 'Berhasil mengupload gambar', data: image })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi Kesalahan Sistem!' })
    }
}

router.post('/', uploadCloudinary().single('image'), uploadImage)

export default router