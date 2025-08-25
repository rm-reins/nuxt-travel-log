import type { DrizzleError } from "drizzle-orm";

import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import slugify from "slug";

import db from "~/lib/db";
import { InsertLocation, location } from "~/lib/db/schemas";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 5);

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

  let slug = slugify(result.data.name);
  let existing = !!(await db.query.location.findFirst({
    where: eq(location.slug, slug),
  }));

  while (existing) {
    const id = nanoid();
    const idSlug = `${slug}-${id}`;
    existing = !!(await db.query.location.findFirst({
      where: eq(location.slug, idSlug),
    }));

    if (!existing) {
      slug = idSlug;
    }
  }

  try {
    await db.insert(location).values({
      ...result.data,
      slug,
      userId: event.context.user.id,
    });

    return result.data;
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
