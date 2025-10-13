import multer, {StorageEngine, MulterError,} from "multer";
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";

export const FileUploader = multer({
    storage: multer.diskStorage({
        destination(
            req,
            file,
            cb
        ) {
            cb(null, "./temp"); // Destination directory
        },
        filename(
            req,
            file,
            cb
        ) {
            const filename = uuidv4() + extname(file.originalname).toLowerCase();
            // @ts-ignore
            req.file_uploaded = filename; // Custom property
            cb(null, filename);
        },
    }) as StorageEngine,

    limits: {
        fileSize: 1000 * 1000, // Approx. 1 MB
    },

    fileFilter(
        req,
        file,
        cb
    ) {
        if (["image/png", "image/jpeg", "image/jpg"].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new MulterError("LIMIT_UNEXPECTED_FILE", "file"));
        }
    },
});