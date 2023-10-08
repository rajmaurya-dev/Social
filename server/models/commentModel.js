import mongoose, { Schema } from "mongoose";

const commentSchema = Schema(
  {
    userId: { type: Schema.Types.objectId, ref: "Users" },
    postId: { type: Schema.Types.objectId, ref: "Posts" },
    comment: { type: String, required: true },
    from: { type: string, required: true },
    replies: [
      {
        rid: { type: mongoose.Schema.Types.ObjectId },
        userId: { type: Schema.Types.objectId, ref: "Users" },
        from: { type: string },
        replyAt: { type: String },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now() },
        updatedAt: { type: Date, default: Date.now() },
        likes: [{ type: String }],
      },
    ],
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
    likes: [{ type: String }],
  },
  { timestamps: true }
);

const Comments = mongoose.model("Comments", commentSchema);
export default Comments;
