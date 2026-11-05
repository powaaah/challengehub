import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { GuestDuels } from "../src/GuestDuels";
import {
  duelRequest,
  guestToken,
  readGuest,
  DuelRequestError,
} from "../src/duel-client";
import { DAILY_BOOLEAN_DEFINITION } from "../../../domain/challenges/challenge-definition";
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);
jest.mock("../src/duel-client", () => ({
  duelRequest: jest.fn(),
  guestToken: jest.fn(),
  readGuest: jest.fn(),
  duelBase: () => "http://localhost",
  DuelRequestError: class extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));
jest.mock("expo-crypto", () => ({ randomUUID: () => "request-unique-id-123" }));
const source = {
  sourceKey: "local:test",
  title: "Testduell",
  goal: "Dranbleiben",
  rules: ["Täglich"],
  definition: DAILY_BOOLEAN_DEFINITION,
  durationDays: 1,
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(readGuest).mockResolvedValue(null);
  jest.mocked(guestToken).mockResolvedValue("test-token");
});
test("creation validates server errors and allows correcting name", async () => {
  jest
    .mocked(duelRequest)
    .mockRejectedValueOnce(new DuelRequestError("Name fehlt", 400));
  const view = await render(<GuestDuels source={source} onClear={() => {}} />);
  await fireEvent.press(view.getByText("Duell anlegen"));
  await waitFor(() => expect(view.getByText("Name fehlt")).toBeTruthy());
  expect(view.getByLabelText("Dein Name im Duell").props.editable).toBe(true);
});
test("uncertain network failure retries the identical create request", async () => {
  jest
    .mocked(duelRequest)
    .mockRejectedValueOnce(new Error("Offline"))
    .mockResolvedValueOnce({
      id: "duel",
      source,
      status: "lobby",
      members: [],
      durationDays: 1,
    });
  const clear = jest.fn();
  const view = await render(<GuestDuels source={source} onClear={clear} />);
  await fireEvent.changeText(view.getByLabelText("Dein Name im Duell"), "Anna");
  await fireEvent.press(view.getByText("Duell anlegen"));
  await waitFor(() => expect(view.getByText("Offline")).toBeTruthy());
  await fireEvent.press(view.getByText("Erneut versuchen"));
  await waitFor(() => expect(clear).toHaveBeenCalled());
  expect(jest.mocked(duelRequest).mock.calls[0]).toEqual(
    jest.mocked(duelRequest).mock.calls[1],
  );
});
