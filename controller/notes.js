require("dotenv").config();
const Notes = require("../models/notes.js");


module.exports.showNotes = async (req, res) => {
  const allNotes = await Notes.find({});
  res.render("Note/Notes.ejs", { allNotes });
};

module.exports.newForm = (req, res) => {
  res.render("Note/form.ejs");
};

module.exports.FormPostRequest = async (req, res) => {
  if (!req.files || (!req.files["note[file]"] && !req.files["note[image]"])) {
    throw new ExpressError(400, "No files uploaded");
  }

  let fileUrl = req.files["note[file]"]
    ? req.files["note[file]"][0].path
    : null;
  let fileFilename = req.files["note[file]"]
    ? req.files["note[file]"][0].filename
    : null;
  let imageUrl = req.files["note[image]"]
    ? req.files["note[image]"][0].path
    : null;
  let imageFilename = req.files["note[image]"]
    ? req.files["note[image]"][0].filename
    : null;

  let N = req.body.note;
  let owner = req.user._id;
  let note = new Notes({
    subject: N.subject ? N.subject.toLowerCase() : "",
    degree: N.degree,
    college: N.college,
    year: N.year,
    owner: owner,
  });

  console.log(note);

  note.file = { url: fileUrl, filename: fileFilename };
  note.image = { url: imageUrl, filename: imageFilename };
  await note.save();
  req.flash("success", "New Note added");
  res.redirect("/notes");
};

module.exports.Seraching = async (req, res) => {
  try {
    let data = req.body;
    let searchQuery = data.searcheverything.toLowerCase();
    if (!searchQuery) {
      return res.status(400).json({ message: "Invalid search query" });
    }

    let allnotes = await Notes.find({ subject: searchQuery });
    console.log(allnotes);
    res.render("Note/searchpage.ejs", { allnotes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.ID = async (req, res) => {
  let { id } = req.params;
  let All_notes = await Notes.findById(id);
  res.render("Note/view.ejs", { All_notes });
};
