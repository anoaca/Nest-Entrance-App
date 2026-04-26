const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false, // disable logging for cleaner terminal output
});

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'student'),
    defaultValue: 'student',
  },
  // Optional: associated exam info for student
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
});

User.beforeCreate(async (user) => {
  if (user.password_hash) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

// Question Model
const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  options: {
    type: DataTypes.JSON, // Stores array of option strings
    allowNull: false,
  },
  correct_answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
});

// Exam Settings Model (Singleton technically, id=1)
const ExamSettings = sequelize.define('ExamSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  is_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  start_time: {
    type: DataTypes.DATE,
  },
  end_time: {
    type: DataTypes.DATE,
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
  }
});

const initializeDatabase = async () => {
    await sequelize.sync();

    const [admin, adminCreated] = await User.findOrCreate({
        where: { username: 'admin' },
        defaults: { password_hash: 'adminpassword', role: 'admin' },
    });

    const [, settingsCreated] = await ExamSettings.findOrCreate({
        where: { id: 1 },
        defaults: { is_enabled: false, duration_minutes: 60 },
    });

    if (adminCreated || settingsCreated) {
        console.log('Database initialized successfully with default admin admin/adminpassword');
    } else {
        console.log('Database connected.');
    }
};

module.exports = { sequelize, User, Question, ExamSettings, initializeDatabase };
