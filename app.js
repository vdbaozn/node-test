require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const mongoose = require('mongoose');
// const ejs = require('ejs');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs'); // Sử dụng EJS làm template engine

// Cấu hình express-handlebars
// app.engine('hbs', exphbs.engine());
// app.set('view engine', 'hbs');
// app.set('views', path.join(__dirname, 'views'));
app.engine(
  'hbs', 
  exphbs.engine({ 
      extname: '.hbs' ,
      helpers: {
          sum: (a,b) => a+b
      }
  }))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'resources', 'views'))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/f8_education_dev');

const db = mongoose.connection;

// Xử lý các sự kiện kết nối
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

// Định nghĩa schema
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String
});

// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'public')));
// Tạo model
const User = mongoose.model('User', userSchema);
async function main() {
  // Thêm một tài liệu mới
  const newUser = new User({
    name: 'John Doe',
    age: 30,
    email: 'john@example.com'
  });

  try {
    const savedUser = await newUser.save();
    console.log('User saved:', savedUser);
  } catch (err) {
    console.error('Error saving user:', err);
  }
}

//main();

async function updateUserData() {
  try {
    // Tìm và cập nhật user có id là '603d3e4f5c857f12f8c17b5e'
    const updatedUser = await User.findByIdAndUpdate('669622929800d01750987353', {
      age: 31,
      email: 'duybao@example.com'
    }, { new: true }); // { new: true } để trả về đối tượng đã được cập nhật

    if (updatedUser) {
      console.log('Updated user:', updatedUser);
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error('Error updating user:', err);
  }
}

//updateUserData();
app.get('/users/add', async (req, res) => {
  try {
    const users = await User.find();
    res.render('add', { users });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.render('list', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
});


// app.get('/', async (req, res) => {
//   try {
//     // const users = await User.find();
//     // res.render('index', { users });
//     res.render('index');
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).send('Internal Server Errors');
//   }
// });
app.get('/', (req, res) => {
  res.render('index');
});

// Định nghĩa route để thêm user
app.post('/users/add', async (req, res) => {
  const { name, age, email } = req.body;

  try {
    const newUser = new User({ name, age, email });
    await newUser.save();
    res.redirect('/users');
    //res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route để hiển thị form edit user
app.get('/users/:id/edit', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render('edit', { user }); // Render view 'edit' với dữ liệu user
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route để cập nhật thông tin user
app.post('/users/:id/edit', async (req, res) => {
  try {
    const { name, age, email } = req.body;
    await User.findByIdAndUpdate(req.params.id, { name, age, email });
    res.redirect('/users');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route để xóa user
app.get('/users/:id/del', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
