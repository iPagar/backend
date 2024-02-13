export async function loadAdmin() {
  const { default: AdminJS, ComponentLoader } = await import("adminjs");
  const { default: AdminJSExpress } = await import("@adminjs/express");
  const { default: AdminJSPrisma, getModelByName } = await import(
    "@adminjs/prisma"
  );

  AdminJS.registerAdapter({
    Resource: AdminJSPrisma.Resource,
    Database: AdminJSPrisma.Database,
  });

  return { AdminJS, AdminJSExpress, ComponentLoader, getModelByName };
}
