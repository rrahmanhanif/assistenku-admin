import MapMonitor from "../components/MapMonitor";
import MitraList from "../components/MitraList";
import CustomerList from "../components/CustomerList";
import Transactions from "./Transactions";
import Notification from "../components/Notification";

function DashboardAdmin() {
  return (
    <div className="p-6">
      <Notification />
      {/* ...konten dashboard lainnya */}
    </div>
  );
}
const DashboardAdmin = () => {
  return (
    <div className="dashboard">
      <h2>Dashboard Admin — Assistenku Core</h2>
      <Transactions />
      <hr />
      <MapMonitor />
      <hr />
      <MitraList />
      <hr />
      <CustomerList />
    </div>
  );
};

import MapMonitor from "../components/MapMonitor";
import MitraList from "../components/MitraList";
import CustomerList from "../components/CustomerList";
import OrdersMonitor from "../components/OrdersMonitor";
import Transactions from "./Transactions";

const DashboardAdmin = () => {
  return (
    <div className="dashboard">
      <h2>Assistenku-Core Dashboard</h2>
      <OrdersMonitor />
      <hr />
      <Transactions />
      <hr />
      <MapMonitor />
      <hr />
      <MitraList />
      <hr />
      <CustomerList />
    </div>
  );
};

export default DashboardAdmin;

export default DashboardAdmin;
