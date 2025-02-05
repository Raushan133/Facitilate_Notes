const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");
const schema = mongoose.Schema;

const notesSchema = new schema({
  subject: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[A-Za-z\s]+$/.test(v);
      },
      message: (props) =>
        `${props.value} contains invalid characters. Only letters and spaces are allowed!`,
    },
  },
  image: {
    url: {
      type: String, // URL to the uploaded file
    },
    filename: String,
  },
  file: {
    url: {
      type: String, // URL to the uploaded file
    },
    filename: String,
  },
  degree: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[A-Za-z\s]+$/.test(v);
      },
      message: (props) =>
        `${props.value} contains invalid characters. Only letters and spaces are allowed!`,
    },
  },
  college: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        // This allows alphabetic characters and spaces
        return /^[A-Za-z\s]+$/.test(v);
      },
      message: (props) =>
        `${props.value} contains invalid characters. Only letters and spaces are allowed!`,
    },
  },

  owner: {
    type: schema.Types.ObjectId,
    ref: "User",
  },
  year: {
    type: Number,
    required: true,
  },
});

const notes = mongoose.model("notes", notesSchema);

module.exports = notes;
