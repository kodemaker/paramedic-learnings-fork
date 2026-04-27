import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateTopicForm } from "./CreateTopicForm";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: vi.fn(),
  }),
}));

const fillRequired = () => {
  fireEvent.change(screen.getByLabelText(/topic name/i), {
    target: { value: "Test topic" },
  });
  fireEvent.change(screen.getByLabelText(/summary/i), {
    target: { value: "Short summary" },
  });
  fireEvent.change(screen.getByLabelText(/area/i), {
    target: { value: "cardiac" },
  });
  fireEvent.change(screen.getByLabelText(/owner/i), {
    target: { value: "Dr. Test" },
  });
  fireEvent.change(screen.getByLabelText(/guidance/i), {
    target: { value: "Do the thing." },
  });
};

describe("CreateTopicForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockClear();
  });

  it("renders all six fields", () => {
    render(<CreateTopicForm />);
    expect(screen.getByLabelText(/topic name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/summary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/area/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/owner/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/guidance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rationale/i)).toBeInTheDocument();
  });

  it("submits to /api/topics and redirects on 201", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ id: "f0e0b0a0-0000-0000-0000-000000000000" }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<CreateTopicForm />);
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: /create topic/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/topics",
        expect.objectContaining({ method: "POST" }),
      );
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/topics/f0e0b0a0-0000-0000-0000-000000000000",
      );
    });
  });

  it("shows per-field errors from a 400 response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Validation failed",
          issues: { fieldErrors: { name: ["Name is required"] } },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<CreateTopicForm />);
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: /create topic/i }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
  });
});
