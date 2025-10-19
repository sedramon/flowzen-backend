import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { 
    SaleItemDetails, 
    SaleSummary, 
    PaymentDetails, 
    FiscalInfo,
    SaleStatus,
    SaleItemType,
    PaymentMethod,
    FiscalStatus
} from '../types';

/**
 * Sale Item Schema
 * Embedded document for sale items
 */
@Schema({ _id: false })
export class SaleItemSchema {
  @Prop({ type: String, required: true })
      refId: string;

  @Prop({
      type: String,
      enum: ['service', 'product'],
      required: true
  })
      type: SaleItemType;

  @Prop({ type: String, required: true, maxlength: 200 })
      name: string;

  @Prop({ type: Number, required: true, min: 0.01 })
      qty: number;

  @Prop({ type: Number, required: true, min: 0 })
      unitPrice: number;

  @Prop({ type: Number, required: true, min: 0 })
      discount: number;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
      taxRate: number;

  @Prop({ type: Number, required: true, min: 0 })
      total: number;
}

/**
 * Payment Schema
 * Embedded document for payment methods
 */
@Schema({ _id: false })
export class PaymentSchema {
  @Prop({
      type: String,
      enum: ['cash', 'card', 'voucher', 'gift', 'bank', 'other'],
      required: true
  })
      method: PaymentMethod;

  @Prop({ type: Number, required: true, min: 0.01 })
      amount: number;

  @Prop({ type: Number, min: 0 })
      change?: number;

  @Prop({ type: String, maxlength: 100 })
      externalRef?: string;
}

/**
 * Fiscal Info Schema
 * Embedded document for fiscal information
 */
@Schema({ _id: false })
export class FiscalInfoSchema {
  @Prop({
      type: String,
      enum: ['pending', 'success', 'error', 'retry'],
      default: 'pending'
  })
      status: FiscalStatus;

  @Prop({ type: String, required: true })
      correlationId: string;

  @Prop({ type: String })
      fiscalNumber?: string;

  @Prop({ type: String })
      error?: string;

  @Prop({ type: Date })
      processedAt?: Date;
}

/**
 * Sale Schema
 * 
 * Represents a complete sales transaction with items, payments, and fiscal information.
 * Supports refunds, multiple payment methods, and integration with fiscal systems.
 */
@Schema({
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (_doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        },
    },
})
export class Sale extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
      tenant: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Facility', required: true })
      facility: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CashSession', required: true })
      session: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
      cashier: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Appointment' })
      appointment?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client' })
      client?: string;

  @Prop({ type: String, required: true, unique: true })
      number: string;

  @Prop({ type: Date, required: true })
      date: Date;

  /** Current status of the sale */
  @Prop({
      type: String,
      enum: ['final', 'refunded', 'partial_refund'],
      default: 'final'
  })
      status: SaleStatus;

  /** Array of items in the sale */
  @Prop({
      type: [SaleItemSchema],
      default: [],
      validate: {
          validator: function(items: SaleItemDetails[]) {
              return items && items.length > 0;
          },
          message: 'Sale must have at least one item'
      }
  })
      items: SaleItemDetails[];

  /** Calculated summary totals */
  @Prop({
      type: Object,
      default: { subtotal: 0, discountTotal: 0, taxTotal: 0, tip: 0, grandTotal: 0 },
      validate: {
          validator: function(summary: SaleSummary) {
              return summary && typeof summary.grandTotal === 'number' && summary.grandTotal >= 0;
          },
          message: 'Summary must have valid grand total'
      }
  })
      summary: SaleSummary;

  /** Payment methods and amounts */
  @Prop({
      type: [PaymentSchema],
      default: [],
      validate: {
          validator: function(payments: PaymentDetails[]) {
              return payments && payments.length > 0;
          },
          message: 'Sale must have at least one payment'
      }
  })
      payments: PaymentDetails[];

  /** Fiscal information for tax compliance */
  @Prop({
      type: FiscalInfoSchema,
      required: false
  })
      fiscal?: FiscalInfoSchema;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Sale' })
      refundFor?: string;

  /** Optional note for the sale */
  @Prop({ type: String, maxlength: 500 })
      note?: string;

  // Virtual fields
  /** Total number of items in the sale */
  get itemCount(): number {
      return this.items.reduce((count, item) => count + item.qty, 0);
  }

  /** Total payment amount */
  get paymentTotal(): number {
      return this.payments.reduce((total, payment) => total + payment.amount, 0);
  }

  /** Whether the sale is fully paid */
  get isFullyPaid(): boolean {
      return this.paymentTotal >= this.summary.grandTotal;
  }

  /** Change amount (if overpaid) */
  get changeAmount(): number {
      return Math.max(0, this.paymentTotal - this.summary.grandTotal);
  }
}

export const SaleSchema = SchemaFactory.createForClass(Sale);

// Add virtual fields
SaleSchema.virtual('itemCount').get(function() {
    return this.items.reduce((count: number, item: SaleItemDetails) => count + item.qty, 0);
});

SaleSchema.virtual('paymentTotal').get(function() {
    return this.payments.reduce((total: number, payment: PaymentDetails) => total + payment.amount, 0);
});

SaleSchema.virtual('isFullyPaid').get(function() {
    return this.paymentTotal >= this.summary.grandTotal;
});

SaleSchema.virtual('changeAmount').get(function() {
    return Math.max(0, this.paymentTotal - this.summary.grandTotal);
});

// Add plugins
SaleSchema.plugin(require('mongoose-autopopulate'));

// Add indexes for performance
SaleSchema.index({ tenant: 1, facility: 1, date: -1 });
SaleSchema.index({ tenant: 1, number: 1 }, { unique: true });
SaleSchema.index({ session: 1 });
SaleSchema.index({ appointment: 1 });
SaleSchema.index({ client: 1 });
SaleSchema.index({ cashier: 1 });
SaleSchema.index({ status: 1 });
SaleSchema.index({ 'fiscal.status': 1 });
SaleSchema.index({ 'fiscal.correlationId': 1 });
SaleSchema.index({ refundFor: 1 });

// Add compound indexes for common queries
SaleSchema.index({ tenant: 1, facility: 1, status: 1, date: -1 });
SaleSchema.index({ tenant: 1, facility: 1, session: 1, date: -1 });
