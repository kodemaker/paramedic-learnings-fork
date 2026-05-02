import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SubmitSourceForm } from "./SubmitSourceForm";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

describe("SubmitSourceForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockClear();
    refreshMock.mockClear();
  });

  it("renders only the source type picker initially", () => {
    render(<SubmitSourceForm />);
    expect(screen.getByLabelText(/source type/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^title/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/event date/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/citation/i)).not.toBeInTheDocument();
  });

  it("reveals debrief fields when debrief is picked", () => {
    render(<SubmitSourceForm />);
    fireEvent.change(screen.getByLabelText(/source type/i), {
      target: { value: "debrief" },
    });
    expect(screen.getByLabelText(/^title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^content/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/citation/i)).not.toBeInTheDocument();
  });

  it("reveals research fields when research is picked", () => {
    render(<SubmitSourceForm />);
    fireEvent.change(screen.getByLabelText(/source type/i), {
      target: { value: "research" },
    });
    expect(screen.getByLabelText(/^title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/citation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/summary/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/event date/i)).not.toBeInTheDocument();
  });

  it("preserves title when switching from debrief to research", () => {
    render(<SubmitSourceForm />);
    fireEvent.change(screen.getByLabelText(/source type/i), {
      target: { value: "debrief" },
    });
    fireEvent.change(screen.getByLabelText(/^title/i), {
      target: { value: "My title" },
    });
    fireEvent.change(screen.getByLabelText(/source type/i), {
      target: { value: "research" },
    });
    expect(screen.getByLabelText(/^title/i)).toHaveValue("My title");
  });
});
