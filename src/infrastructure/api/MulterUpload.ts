import multer from 'multer'
import { CustomError } from '../../utils/handdlers/CustomError'

const storage = multer.memoryStorage()

export const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/bmp', 'image/png']
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(
                new CustomError(
                    'Invalid file format. Only BMP and PNG files are allowed.'
                )
            )
        }
    },
})
