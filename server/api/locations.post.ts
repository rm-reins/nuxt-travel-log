import type { DrizzleError } from "drizzle-orm";

import slugify from "slug";

import { findLocationByName, findUniqueSlug, insertLocation } from "~/lib/db/queries/location";
import { InsertLocation } from "~/lib/db/schemas";

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    }));
  }

  const result = await readValidatedBody(event, InsertLocation.safeParse);

  if (!result.success) {
    const statusMessage = result
      .error
      .issues
      .map(issue => `${issue.path.join("")}: ${issue.message}`)
      .join("; ");

    const data = result
      .error
      .issues
      .reduce((errors, issue) => {
        errors[issue.path.join("")] = issue.message;
        return errors;
      }, {} as Record<string, string>);

    return sendError(event, createError({
      statusCode: 422,
      statusMessage,
      data,
    }));
  }

  const existingLocation = await findLocationByName(result.data, event.context.user.id);

  if (existingLocation) {
    return sendError(event, createError ({
      statusCode: 409,
      statusMessage: "Location with that name already exists",
    }));
  }

  const slug = await findUniqueSlug(slugify(result.data.name));

  try {
    return insertLocation(result.data, slug, event.context.user.id);
  }
  catch (error) {
    const e = error as DrizzleError;

    if (e.message?.includes("UNIQUE constraint failed: location.slug")
      || (e.cause as any)?.message?.includes("UNIQUE constraint failed: location.slug")) {
      const customError = createError({
        statusCode: 409,
        statusMessage: "Slug must be unique (location name is used to generate slug)",
        data: {
          name: "Location with this name already exists. Please use a different name.",
        },
      });

      return sendError(event, customError);
    }
    throw error;
  }
});
