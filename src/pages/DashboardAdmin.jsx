import { renderDashboard } from "./dashboard.js";
import { listServices, createService, updateService, deleteService } from "../api/services.js";
import { listMitra, createMitra, updateMitra, deleteMitra } from "../api/mitraProfiles.js";
import { listOrders, assignMitra, updateOrderStatus } from "../api/orders.js";
import { getUserRole } from "../api/role.js";
import { auth } from "../firebase.js";

export async function renderAdminDashboard() {
  const user = auth.currentUser;
  if (!user) {
    document.getElementById("app").innerText = "Not authenticated";
    return;
  }

  const role = await getUserRole(user.uid);
  if (role !== "admin") {
    document.getElementById("app").innerText = "Akses ditolak";
    return;
  }

  const app = document.getElementById("app");
  app.innerHTML = `
    <div>
      <h2>Admin Dashboard</h2>
      <div id="services"></div>
      <div id="mitras"></div>
      <div id="orders"></div>
    </div>
  `;

  // Services
  const sv = await listServices();
  const servicesDiv = document.getElementById("services");
  servicesDiv.innerHTML = "<h3>Services</h3>";
  for (const id in sv) {
    const s = sv[id];
    const el = document.createElement("div");
    el.textContent = `${s.name} — Rp ${s.price}`;
    // update dan delete bisa ditambahkan di UI
    servicesDiv.appendChild(el);
  }
  // Similarly list Mitra
  const mt = await listMitra();
  const mitraDiv = document.getElementById("mitras");
  mitraDiv.innerHTML = "<h3>Mitra Profiles</h3>";
  for (const id in mt) {
    const m = mt[id];
    const el = document.createElement("div");
    el.textContent = `${m.name} — ${m.email} — Available: ${m.available}`;
    mitraDiv.appendChild(el);
  }
  // Orders
  const od = await listOrders();
  const orderDiv = document.getElementById("orders");
  orderDiv.innerHTML = "<h3>Orders</h3>";
  for (const id in od) {
    const o = od[id];
    const el = document.createElement("div");
    el.textContent = `Order ${id}: ${o.service}, status: ${o.status}, mitra: ${o.mitraId || "-"}`;
    orderDiv.appendChild(el);
  }

  // Tambahkan form untuk CRUD jika diperlukan…
}
