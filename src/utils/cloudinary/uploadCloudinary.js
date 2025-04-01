import cloudinary from '../../config/cloudinary.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { CLOUDINARY_PARENT } from '../../constant/cloudinary.js';
import randomCharacter from '../randomCharacter.js';



export const uploadCloudinary = () => {


    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            CLOUDINARY_PARENT,
            format: async (req, file) => {
                const ext = file.mimetype.split('/')[1];
                const allowedFormats = ['png', 'jpg', 'jpeg', 'gif'];
                return allowedFormats.includes(ext) ? ext : 'jpg';
            },
            public_id: (req, file) => {
                const randomStr = randomCharacter(8);
                return randomStr;
            }
        }
    });

    return multer({ storage: storage });
};

export default uploadCloudinary;
