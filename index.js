const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors')
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Animesh:Ghoroi@cluster0.mfcptlc.mongodb.net/docs?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(cors())
app.use(express.static('uploads'))
const port = 8000;

const fileSchema = new mongoose.Schema({
    name: String,
    description: String,
    filePaths: Object,
});

const File = mongoose.model('File', fileSchema);



// Configure multer storage for multiple files
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/');
    },
    filename: (req, file, callback) => {
        const customFileName = 'custom_' + Date.now() + path.extname(file.originalname);
        callback(null, customFileName);
    }
});

const upload = multer({ storage: storage });







app.use(express.static(path.join(__dirname, 'public')));

// Set up a route for multiple file upload
app.post('/upload', upload.fields([
    { name: 'file1' },
    { name: 'file2' }
]), async (req, res) => {
    const uploadedFiles = req.files; // Uploaded files data

    const name = req.body.name;
    const description = req.body.description;

    // Create a new file entry in MongoDB
    const newFile = new File({
        name: name,
        description: description,
        filePaths: uploadedFiles,
    });

    try {
        await newFile.save();
        res.json({ message: 'Files uploaded and saved to database successfully', fileId: newFile._id });
    } catch (error) {
        console.error('Error saving file data:', error);
        res.status(500).json({ message: 'Error saving file data' });
    }
});


app.get('/',async(req,res)=>{
    try {
        const data=await File.find()
        res.send(data)
        
    } catch (error) {
        res.send(error)
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
