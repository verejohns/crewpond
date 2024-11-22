const fs = require('fs');
const multer = require('multer');
const path = require('path');
const moment = require('moment');

module.exports = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = `static/uploads/${moment().format("YYYYMMDDHHmmss")}/`;
      folder.split('/').reduce((parent, child) => {
        const current = path.resolve(parent, child);

        if (!fs.existsSync(current)) {
          fs.mkdirSync(current);
        }

        return current;
      }, '');
      return cb(null, folder);
    },
    filename: (req, file, cb) => cb(null, `${new Date().getTime()}.${file.originalname.toLowerCase().replace(/ /g, '_')}`),
  });

  return multer({ storage }).single('avatar');
};
