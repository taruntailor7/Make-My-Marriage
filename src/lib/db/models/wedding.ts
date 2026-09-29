import mongoose, { Schema, type Document, type Types } from "mongoose"

interface BudgetCategory {
  key: string
  label: string
  target: number | null
}

interface Funder {
  key: string
  label: string
}

interface FaqItem {
  q: string
  a: string
}

interface WebsiteSections {
  story: { enabled: boolean; content: string }
  schedule: { enabled: boolean }
  venue: { enabled: boolean }
  registry: { enabled: boolean; content: string }
  faq: { enabled: boolean; items: FaqItem[] }
  gallery: { enabled: boolean }
  livestream: { enabled: boolean; embedUrl: string | null }
}

interface Website {
  templateId: string
  isPublished: boolean
  sections: WebsiteSections
}

export interface IWedding extends Document {
  name: string
  slug: string
  startDate: Date
  endDate: Date
  coverPhoto: string | null
  createdBy: Types.ObjectId
  budgetCategories: BudgetCategory[]
  funders: Funder[]
  website: Website
  rsvpCutoffDate: Date | null
  galleryModerationEnabled: boolean
  createdAt: Date
  updatedAt: Date
  daysUntilStart: number
}

const weddingSchema = new Schema<IWedding>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    startDate: { type: Date, required: true },
    endDate: {
      type: Date,
      required: true,
    },
    coverPhoto: { type: String, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    budgetCategories: [
      {
        _id: false,
        key: { type: String, required: true, trim: true, maxlength: 50 },
        label: { type: String, required: true, trim: true, maxlength: 100 },
        target: { type: Number, default: null, min: 0 },
      },
    ],

    funders: [
      {
        _id: false,
        key: { type: String, required: true, trim: true, maxlength: 50 },
        label: { type: String, required: true, trim: true, maxlength: 100 },
      },
    ],

    website: {
      templateId: { type: String, default: "minimal" },
      isPublished: { type: Boolean, default: false },
      sections: {
        story: {
          enabled: { type: Boolean, default: false },
          content: { type: String, default: "", maxlength: 5000 },
        },
        schedule: { enabled: { type: Boolean, default: true } },
        venue: { enabled: { type: Boolean, default: true } },
        registry: {
          enabled: { type: Boolean, default: false },
          content: { type: String, default: "", maxlength: 2000 },
        },
        faq: {
          enabled: { type: Boolean, default: false },
          items: [
            {
              _id: false,
              q: { type: String, maxlength: 500 },
              a: { type: String, maxlength: 2000 },
            },
          ],
        },
        gallery: { enabled: { type: Boolean, default: false } },
        livestream: {
          enabled: { type: Boolean, default: false },
          embedUrl: { type: String, default: null, maxlength: 500 },
        },
      },
    },

    rsvpCutoffDate: { type: Date, default: null },
    galleryModerationEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
)

weddingSchema.index({ slug: 1 }, { unique: true })
weddingSchema.index({ createdBy: 1 })

weddingSchema.virtual("daysUntilStart").get(function (this: IWedding) {
  return Math.ceil((this.startDate.getTime() - Date.now()) / 86400000)
})

weddingSchema.pre("validate", function () {
  if (this.endDate < this.startDate) {
    this.invalidate("endDate", "endDate must be >= startDate")
  }
})

weddingSchema.pre("save", async function () {
  if (this.isNew || this.isModified("slug")) {
    const base = this.slug
    let suffix = 1
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Model = this.constructor as any
    while (await Model.exists({ slug: this.slug, _id: { $ne: this._id } })) {
      suffix++
      this.slug = `${base}-${suffix}`
    }
  }
})

weddingSchema.set("toJSON", { virtuals: true })
weddingSchema.set("toObject", { virtuals: true })

export const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  { key: "venue", label: "Venue", target: null },
  { key: "catering", label: "Catering", target: null },
  { key: "decor", label: "Decor & Flowers", target: null },
  { key: "photography", label: "Photography & Video", target: null },
  { key: "attire", label: "Attire & Accessories", target: null },
  { key: "jewelry", label: "Jewelry", target: null },
  { key: "entertainment", label: "Entertainment & Music", target: null },
  { key: "makeup", label: "Makeup & Grooming", target: null },
  { key: "transport", label: "Transport & Logistics", target: null },
  { key: "misc", label: "Miscellaneous", target: null },
]

export const DEFAULT_FUNDERS: Funder[] = [
  { key: "brides-side", label: "Bride's Side" },
  { key: "grooms-side", label: "Groom's Side" },
  { key: "joint", label: "Joint" },
]

export const Wedding =
  (mongoose.models.Wedding as mongoose.Model<IWedding>) ??
  mongoose.model<IWedding>("Wedding", weddingSchema)
