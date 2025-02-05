const express = require("express");
const Route = express.Router();
const RouteController = require("../controller/notes.js");
const wrapAsync = require("../utils/wrapAsync.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const { isLoggedIn } = require("../middleware.js");

const upload = multer({ storage });

// All data API

Route.get("/", wrapAsync(RouteController.showNotes));

// Create New Notes
Route.get(
  "/newForm",
  isLoggedIn,
  wrapAsync(RouteController.newForm)
);

Route.post(
  "/",
  upload.fields([
    { name: "note[file]", maxCount: 1 },
    { name: "note[image]", maxCount: 1 },
  ]),
  wrapAsync(RouteController.FormPostRequest)
);

Route.post("/search", wrapAsync(RouteController.Seraching));

// Route.post(
//   "/",
//   upload.fields([
//     { name: "note[file]", maxCount: 1 },
//     { name: "note[image]", maxCount: 1 },
//   ]),
//   wrapAsync(async (req, res) => {
//     if (!req.files || (!req.files["note[file]"] && !req.files["note[image]"])) {
//       throw new ExpressError(400, "No files uploaded");
//     }

//     let fileUrl = req.files["note[file]"]
//       ? req.files["note[file]"][0].path
//       : null;
//     let fileFilename = req.files["note[file]"]
//       ? req.files["note[file]"][0].filename
//       : null;
//     let imageUrl = req.files["note[image]"]
//       ? req.files["note[image]"][0].path
//       : null;
//     let imageFilename = req.files["note[image]"]
//       ? req.files["note[image]"][0].filename
//       : null;

//     let note = new Notes(req.body.note);
//     note.file = { url: fileUrl, filename: fileFilename };
//     note.image = { url: imageUrl, filename: imageFilename };
//     // await note.save();

//     req.flash("success", "New Note added");

//     // Ensure 'saved_notes' directory exists
//     const savedNotesPath = path.join(__dirname, "saved_notes");
//     if (!fs.existsSync(savedNotesPath)) {
//       fs.mkdirSync(savedNotesPath);
//     }

//     // Fetch and Save PDF Locally, then Upload Back to Cloudinary
//     if (fileUrl) {
//       try {
//         const response = await axios({
//           url: fileUrl,
//           method: "GET",
//           responseType: "stream",
//         });

//         const localFilePath = path.join(savedNotesPath, `${fileFilename}.pdf`);
//         const writer = fs.createWriteStream(localFilePath);
//         response.data.pipe(writer);

//         writer.on("finish", async () => {
//           console.log(`PDF saved locally at: ${localFilePath}`);

//           // Upload the converted PDF back to Cloudinary
//           cloudinary.uploader.upload(
//             localFilePath,
//             { resource_type: "raw", folder: "converted_pdfs" },
//             async (error, result) => {
//               if (error) {
//                 console.error("Cloudinary Upload Error:", error);
//                 return;
//               }

//               console.log(
//                 "Converted PDF uploaded to Cloudinary:",
//                 result.secure_url
//               );

//               // Update the note with the new Cloudinary URL
//               note.convertedFile = {
//                 url: result.secure_url,
//                 filename: result.public_id,
//               };
//               await note.save();

//               // Optionally, delete the locally saved file after upload
//               fs.unlink(localFilePath, (err) => {
//                 if (err) console.error("Error deleting local PDF:", err);
//               });
//             }
//           );
//         });
//       } catch (error) {
//         console.error("Error fetching Cloudinary PDF:", error);
//       }
//     }
//     res.redirect("/notes");
//   })
// );

// Route.get("/:id", async (req, res) => {
//   let note = await Notes.findById(req.params.id);

//   console.log(note);

//   res.render("./Note/view.ejs", { note });
// });

// Show API
Route.get("/:id",isLoggedIn, wrapAsync(RouteController.ID));

module.exports = Route;
