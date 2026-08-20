export function summarizeFamilyPoll(options: string[], responses: Array<{ optionIndex: number; respondentUserId: number }>, currentUserId: number) {
  const counts = options.map((_, index) => responses.filter((response) => response.optionIndex === index).length);
  const ownResponse = responses.find((response) => response.respondentUserId === currentUserId);
  return { counts, responseCount: responses.length, ownOptionIndex: ownResponse?.optionIndex ?? null };
}
