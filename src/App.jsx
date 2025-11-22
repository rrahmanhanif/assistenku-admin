import DashboardFinanceEnterprise from "./pages/DashboardFinanceEnterprise";
import Reports from "./pages/Reports";
import Transactions from "./pages/Transactions";
import Wallet from "./pages/Wallet";

// ...

<Routes>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/finance" element={<DashboardFinanceEnterprise />} />
  <Route path="/reports" element={<Reports />} />
  <Route path="/transactions" element={<Transactions />} />
  <Route path="/wallet" element={<Wallet />} />
</Routes>
