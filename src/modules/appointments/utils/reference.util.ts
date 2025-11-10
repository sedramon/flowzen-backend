import { Types } from 'mongoose';

export const resolveEntityId = (value: unknown): string => {
    if (!value) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (value instanceof Types.ObjectId) {
        return value.toString();
    }

    if (typeof value === 'object') {
        const maybe = value as any;

        if (maybe instanceof Object && typeof maybe.toString === 'function' && !(maybe instanceof Date)) {
            if (typeof maybe._id === 'string') {
                return maybe._id;
            }

            if (maybe._id && typeof maybe._id.toString === 'function') {
                return maybe._id.toString();
            }

            if (typeof maybe.toHexString === 'function') {
                return maybe.toHexString();
            }
        }
    }

    return String(value);
};

