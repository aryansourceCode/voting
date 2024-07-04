const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({//in diskstorage because in memory storage if filw is big will be a issue but here we can use both
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/temp'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {//fillteration is happening on file
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'));
  }
};

const upload = multer({ //here the multer is send
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;
