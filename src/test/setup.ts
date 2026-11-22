import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
// Icon rendering is outside these behavior tests; avoid loading the full icon barrel per worker.
vi.mock("lucide-react", () => {
  const Icon = () => null;
  return {
    Circle: Icon,
    Inbox: Icon,
    CheckCircle: Icon,
    Clock: Icon,
    Loader: Icon,
    TrendingUp: Icon,
    TrendingDown: Icon,
    X: Icon,
    CheckCircle2: Icon,
    AlertTriangle: Icon,
    Info: Icon,
    XCircle: Icon,
    Package: Icon,
    LayoutDashboard: Icon,
    PlusCircle: Icon,
    List: Icon,
    FileText: Icon,
    Truck: Icon,
    MapPin: Icon,
    CheckSquare: Icon,
    BarChart2: Icon,
    Users: Icon,
    Settings: Icon,
    LogOut: Icon,
    Menu: Icon,
    Bell: Icon,
    ChevronDown: Icon,
  };
});
afterEach(cleanup);
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
};
