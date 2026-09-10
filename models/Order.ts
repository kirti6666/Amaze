import mongoose, { Schema, models, model } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: Map<string, string>; // e.g. { Size: "M", Color: "Red" }, empty if no variants
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

/** Contact details captured at checkout when there's no account behind the order. */
export interface IGuestContact {
  name: string;
  phone: string;
  email?: string;
}

export interface IOrder {
  _id: string;
  /** Absent on guest orders. Exactly one of `user` / `guest` is always set. */
  user?: mongoose.Types.ObjectId;
  guest?: IGuestContact;
  isGuest: boolean;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  paymentMethod: "razorpay" | "payplus" | "cod";
  payplusOrderId?: string;
  payplusPaymentUrl?: string;
  payplusReference?: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
    variant: { type: Map, of: String },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const GuestContactSchema = new Schema<IGuestContact>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    // No longer required: guest checkout creates orders with no account behind
    // them. The validator below enforces that exactly one of user/guest is set,
    // so an order can never end up belonging to nobody.
    user: { type: Schema.Types.ObjectId, ref: "User" },
    guest: { type: GuestContactSchema },
    isGuest: { type: Boolean, default: false },
    items: [OrderItemSchema],
    shippingAddress: { type: ShippingAddressSchema, required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["razorpay", "payplus", "cod"], required: true },
    payplusOrderId: { type: String },
    payplusPaymentUrl: { type: String },
    payplusReference: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    orderStatus: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1 });
OrderSchema.index({ createdAt: -1 });
// Guests have no account page, so they look orders up by phone number.
OrderSchema.index({ "guest.phone": 1, createdAt: -1 });

OrderSchema.pre("validate", function (next) {
  const hasUser = Boolean(this.user);
  const hasGuest = Boolean(this.guest?.phone);
  if (hasUser === hasGuest) {
    return next(
      new Error(
        "An order must have exactly one owner: either `user` (account) or `guest` (verified phone)."
      )
    );
  }
  this.isGuest = hasGuest;
  next();
});

export default models.Order || model<IOrder>("Order", OrderSchema);
