import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
    PaymentMethod,
    CashSessionStatus,
    PaymentTotals,
    CashSessionSummary
} from '../types';

/**
 * Cash Session Schema
 * 
 * Represents a cash register session with opening/closing balances,
 * transaction totals, and variance tracking.
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
export class CashSession extends Document {
  /** Tenant reference */
  @Prop({ 
      type: MongooseSchema.Types.ObjectId, 
      ref: 'Tenant', 
      required: true, 
      autopopulate: { select: 'name' } 
  })
      tenant: string;

  /** Facility reference */
  @Prop({ 
      type: MongooseSchema.Types.ObjectId, 
      ref: 'Facility', 
      required: true, 
      autopopulate: { select: 'name' } 
  })
      facility: string;

  /** User who opened the session */
  @Prop({ 
      type: MongooseSchema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      autopopulate: { select: 'name email' } 
  })
      openedBy: string;

  /** Session opening timestamp */
  @Prop({ type: Date, required: true })
      openedAt: Date;

  /** Opening cash float amount */
  @Prop({ 
      type: Number, 
      required: true, 
      min: 0,
      validate: {
          validator: function(value: number) {
              return value >= 0;
          },
          message: 'Opening float must be non-negative'
      }
  })
      openingFloat: number;

  /** User who closed the session */
  @Prop({ 
      type: MongooseSchema.Types.ObjectId, 
      ref: 'User', 
      autopopulate: { select: 'name email' } 
  })
      closedBy?: string;

  /** Session closing timestamp */
  @Prop({ type: Date })
      closedAt?: Date;

  /** Actual cash count at closing */
  @Prop({ 
      type: Number, 
      min: 0,
      validate: {
          validator: function(value: number) {
              return !value || value >= 0;
          },
          message: 'Closing count must be non-negative'
      }
  })
      closingCount?: number;

  /** Transaction totals by payment method */
  @Prop({
      type: Object,
      default: { cash: 0, card: 0, voucher: 0, gift: 0, bank: 0, other: 0 },
      validate: {
          validator: function(value: PaymentTotals) {
              return value && typeof value === 'object' && 
               Object.values(value).every(amount => typeof amount === 'number' && amount >= 0);
          },
          message: 'Payment totals must contain non-negative numbers'
      }
  })
      totalsByMethod: PaymentTotals;

  /** Expected cash amount based on sales */
  @Prop({ 
      type: Number, 
      default: 0,
      min: 0
  })
      expectedCash: number;

  /** Variance between expected and actual cash */
  @Prop({ type: Number, default: 0 })
      variance: number;

  /** Current session status */
  @Prop({ 
      type: String, 
      enum: ['open', 'closed'], 
      default: 'open' 
  })
      status: CashSessionStatus;

  /** Optional session note */
  @Prop({ 
      type: String,
      maxlength: 500
  })
      note?: string;

  // Virtual fields
  /** Session duration in hours */
  get duration(): number {
      if (!this.closedAt) return 0;
      return (this.closedAt.getTime() - this.openedAt.getTime()) / (1000 * 60 * 60);
  }

  /** Total transaction amount */
  get totalTransactions(): number {
      return Object.values(this.totalsByMethod).reduce((sum, amount) => sum + amount, 0);
  }

  /** Variance percentage */
  get variancePercentage(): number {
      if (this.expectedCash === 0) return 0;
      return (this.variance / this.expectedCash) * 100;
  }

  /** Whether session has significant variance */
  get hasSignificantVariance(): boolean {
      return Math.abs(this.variance) > 50; // More than 50 RSD variance
  }
}

export const CashSessionSchema = SchemaFactory.createForClass(CashSession);

// Add virtual fields
CashSessionSchema.virtual('duration').get(function() {
    if (!this.closedAt) return 0;
    return (this.closedAt.getTime() - this.openedAt.getTime()) / (1000 * 60 * 60);
});

CashSessionSchema.virtual('totalTransactions').get(function() {
    return Object.values(this.totalsByMethod).reduce((sum: number, amount: number) => sum + amount, 0);
});

CashSessionSchema.virtual('variancePercentage').get(function() {
    if (this.expectedCash === 0) return 0;
    return (this.variance / this.expectedCash) * 100;
});

CashSessionSchema.virtual('hasSignificantVariance').get(function() {
    return Math.abs(this.variance) > 50; // More than 50 RSD variance
});

// Add plugins
CashSessionSchema.plugin(require('mongoose-autopopulate'));

// Add indexes for performance
CashSessionSchema.index({ tenant: 1, facility: 1, status: 1, openedAt: -1 });
CashSessionSchema.index({ tenant: 1, openedBy: 1, status: 1 });
CashSessionSchema.index({ tenant: 1, closedBy: 1, status: 1 });
CashSessionSchema.index({ status: 1, openedAt: -1 });
CashSessionSchema.index({ facility: 1, status: 1, openedAt: -1 });

// Compound indexes for common queries
CashSessionSchema.index({ tenant: 1, facility: 1, openedBy: 1, status: 1 });
CashSessionSchema.index({ tenant: 1, facility: 1, openedAt: -1 });
CashSessionSchema.index({ tenant: 1, status: 1, openedAt: -1 });
