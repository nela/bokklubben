

import { registerDecorator, ValidationOptions } from 'class-validator'
export function IsNotBlank(validationOptions?: ValidationOptions): Function {
  return function(object: any, propertyName: string): void {
    registerDecorator({
      name: 'isNotBlank',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          return typeof value === 'string' && value.trim().length > 0;
        }
      }
    });
  };
}

export function StringArrayNotBlank(
  validationOptions?: ValidationOptions
): Function {
  return function(object: any, propertyName: string): void {
    registerDecorator({
      name: 'stringArrayNotBlank',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(values: string[]): boolean {
          return !values.some((v: string): boolean => {
            return v.trim().length <= 0;
          });
        }
      }
    });
  };
}
