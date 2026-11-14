import { render, screen, within, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { it, expect, vi } from "vitest";
import { Sidebar } from "../../../components/layout/SidebarAndHeader";
vi.mock("../../auth/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-merchant", name: "Test Merchant", role: "merchant" },
    logout: vi.fn(),
  }),
}));
it.each([
  ["/merchant", "Dashboard"],
  ["/merchant/orders/new", "New Order"],
  ["/merchant/orders/new/", "New Order"],
  ["/merchant/orders", "Orders"],
  ["/merchant/orders/parcel-id", "Orders"],
  ["/merchant/profile", "Business Profile"],
  ["/merchant/api-keys", "API Keys"],
  ["/merchant/onboarding", "Onboarding"],
  ["/merchant/bulk", "Bulk Booking Demo"],
])("marks exactly one sidebar link active at %s", (route, label) => {
  cleanup();
  render(
    <MemoryRouter initialEntries={[route]}>
      <Sidebar isOpen={false} onClose={vi.fn()} />
    </MemoryRouter>,
  );
  const sidebar = within(screen.getByRole("complementary"));
  const active = sidebar
    .getAllByRole("link")
    .filter((link) => link.classList.contains("active"));
  expect(active).toHaveLength(1);
  expect(active[0]).toHaveTextContent(label);
  expect(
    sidebar
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page"),
  ).toHaveLength(1);
});
