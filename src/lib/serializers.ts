import { ObjectId } from 'mongodb';

type Serializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Serializable[]
  | { [key: string]: Serializable };

export function toPlainObject(value: unknown): Serializable {
  if (value instanceof ObjectId) {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => toPlainObject(item));
  }

  if (value && typeof value === 'object') {
    const result: Record<string, Serializable> = {};

    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = toPlainObject(val);
    }

    return result;
  }

  return value as Serializable;
}
