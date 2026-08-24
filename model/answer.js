const mongoose = require('mongoose');
const { Schema } = mongoose;

const answerSchema = new Schema({
    text: { type: String, default: 'yes i remember !' },
    question: { type: Schema.Types.ObjectId, ref: 'Question' },
    publish: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
