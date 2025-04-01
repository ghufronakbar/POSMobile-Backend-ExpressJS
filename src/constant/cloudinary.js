import { configDotenv } from "dotenv"
configDotenv()

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET
export const CLOUDINARY_PARENT = process.env.APP_NAME
export const CLOUDINARY_PROFILE = `${CLOUDINARY_PARENT}/profile`
export const CLOUDINARY_PRODUCT = `${CLOUDINARY_PARENT}/product`
