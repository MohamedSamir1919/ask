const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
    key: { type: Number, default: 0 },
    publish: { type: Boolean, default: false },
    thequestion: { type: String, required: true },
    title: { type: String },
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
