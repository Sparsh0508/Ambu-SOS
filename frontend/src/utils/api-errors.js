export const extractApiErrorMessage = (error, fallbackMessage) => {
  const message = error?.response?.data?.message;

  if (Array.isArray(message) && message.length > 0) {
    return message[0];
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return fallbackMessage;
};
