import "reflect-metadata";

export function preserveMetadata(
  sourceClass: new (...args: any[]) => any,
  targetClass: new (...args: any[]) => any,
): void {
  // Copiar metadados de nível de classe (ex: @injectable, design:paramtypes)
  const classMetadataKeys = Reflect.getMetadataKeys?.(sourceClass) || [];
  classMetadataKeys.forEach((key) => {
    const metadata = Reflect.getMetadata(key, sourceClass);
    Reflect.defineMetadata(key, metadata, targetClass);
  });

  // Copiar metadados de propriedades e métodos (ex: @inject, design:type)
  Object.getOwnPropertyNames(sourceClass.prototype).forEach((propertyName) => {
    const propertyMetadataKeys =
      Reflect.getMetadataKeys?.(sourceClass.prototype, propertyName) || [];
    propertyMetadataKeys.forEach((key) => {
      const metadata = Reflect.getMetadata(
        key,
        sourceClass.prototype,
        propertyName,
      );
      Reflect.defineMetadata(
        key,
        metadata,
        targetClass.prototype,
        propertyName,
      );
    });
  });
}
