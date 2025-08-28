import defineAuthenticatedEventHandler from "~~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async () => {
  return {
    success: true,
  };
});
